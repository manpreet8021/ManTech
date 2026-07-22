import Joi from "joi";
import fs from "fs";
import asyncHandler from "../middleware/asyncHandler.js";
import { findCourse } from "../model/courseModel.js";
import { getCourseIdsForManager } from "../model/courseManagerModel.js";
import Video, { createVideoModel, findAllVideosForCourse } from "../model/videoModel.js";
import VideoStatus from "../model/videoStatusModel.js";
import Transcribe from "../model/transcribeModel.js";
import Quiz from "../model/quizModel.js";

const validateAddVideo = Joi.object({
  name: Joi.string().required(),
  url: Joi.string().uri().required(),
  course_id: Joi.number().positive().required(),
})

// Mirrors the AI pipeline's own stage order (fetchAudio -> transcribe ->
// translate -> summary -> quiz): a video is only "ready" once the last stage
// has finished. No status row yet means the scheduler hasn't picked it up.
const deriveStatus = (videoStatus) => {
  if (!videoStatus) return "pending"
  if (videoStatus.status === "failed") return "failed"
  if (videoStatus.status === "processing") return "processing"
  return videoStatus.step === "quiz" ? "ready" : "processing"
}

const shapeVideo = (video, videoStatus = null) => {
  const data = video.toJSON()
  return {
    id: data.id,
    name: data.name,
    url: data.url,
    course_id: data.course_id,
    hasPdf: Boolean(data.pdf_path),
    status: deriveStatus(videoStatus),
  }
}

const createVideo = asyncHandler(async (req, res) => {
  const { name, url, course_id } = req.body
  const { error, value } = validateAddVideo.validate({ name, url, course_id }, { abortEarly: false })

  if (error) {
    if (req.file) fs.unlink(req.file.path, () => {})
    res.status(400)
    throw new Error(error.message)
  }

  // Only the owning teacher can add videos to their own course — mirrors the
  // ownership scoping already enforced on course update/delete.
  const course = await findCourse({ id: value.course_id, org_id: req.user.org_id, user_id: req.user.id })

  if (!course) {
    if (req.file) fs.unlink(req.file.path, () => {})
    res.status(404)
    throw new Error("Course not found")
  }

  const video = await createVideoModel({
    name: value.name,
    url: value.url,
    course_id: value.course_id,
    pdf_path: req.file?.path ?? null,
  })

  res.status(201).json(shapeVideo(video))
})

const getAllVideos = asyncHandler(async (req, res) => {
  const { courseId } = req.params
  const course = await findCourse({ id: courseId, org_id: req.user.org_id })

  if (!course) {
    res.status(404)
    throw new Error("Course not found")
  }

  // Same visibility rule as courses themselves: the owner, or a manager this
  // specific course has been explicitly assigned to.
  const assignedCourseIds = await getCourseIdsForManager(req.user.id)
  const canView = course.user_id === req.user.id || assignedCourseIds.includes(course.id)

  if (!canView) {
    res.status(403)
    throw new Error("You do not have permission to view this course's videos")
  }

  const videos = await findAllVideosForCourse(courseId)

  const statuses = await VideoStatus.findAll({ where: { video_id: videos.map((v) => v.id) } })
  const statusMap = {}
  for (const s of statuses) statusMap[s.video_id] = s

  res.status(200).json(videos.map((video) => shapeVideo(video, statusMap[video.id] ?? null)))
})

const getVideoDetail = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const video = await Video.findOne({ where: { id: videoId } })

  if (!video) {
    res.status(404)
    throw new Error("Video not found")
  }

  const course = await findCourse({ id: video.course_id, org_id: req.user.org_id })

  if (!course) {
    res.status(404)
    throw new Error("Video not found")
  }

  // Same visibility rule as the course/video list: owner, or a manager this
  // specific course has been explicitly assigned to.
  const assignedCourseIds = await getCourseIdsForManager(req.user.id)
  const canView = course.user_id === req.user.id || assignedCourseIds.includes(course.id)

  if (!canView) {
    res.status(403)
    throw new Error("You do not have permission to view this video")
  }

  const transcript = await Transcribe.findOne({ where: { video_id: videoId } })
  const quizRows = await Quiz.findAll({ where: { video_id: videoId }, order: [["id", "ASC"]] })

  res.status(200).json({
    id: video.id,
    name: video.name,
    url: video.url,
    translation: transcript?.translation ?? null,
    summary: transcript?.summary ?? null,
    quiz: quizRows.map((q) => ({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options),
      answer: q.answer,
    })),
  })
})

export { createVideo, getAllVideos, getVideoDetail }
