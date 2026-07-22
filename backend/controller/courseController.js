import Joi from "joi";
import asyncHandler from "../middleware/asyncHandler.js";
import { createCourse, updateCourse, findCourse, findVisibleCourses } from "../model/courseModel.js";
import { createCourseManagerMapping, deleteCourseManagerMappingByCourse, getCourseIdsForManager, getManagersForCourse, getManagersMapForCourses } from "../model/courseManagerModel.js";

const validateAddCourse = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  manager_ids: Joi.array().items(Joi.number().positive()).default([]),
})

const validateUpdateCourse = Joi.object({
  id: Joi.number().positive().required(),
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  manager_ids: Joi.array().items(Joi.number().positive()).default([]),
})

const shapeCourse = (course, managers = []) => {
  const data = course.toJSON()
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    active: data.active,
    managers,
  }
}

const getAllCourse = asyncHandler(async (req, res) => {
  const assignedCourseIds = await getCourseIdsForManager(req.user.id)
  const courses = await findVisibleCourses(req.user.id, req.user.org_id, assignedCourseIds)
  const managersMap = await getManagersMapForCourses(courses.map((c) => c.id))
  res.status(200).json(courses.map((course) => shapeCourse(course, managersMap[course.id] ?? [])))
})

const createCourseHandler = asyncHandler(async (req, res) => {
  const { name, description, manager_ids } = req.body
  const { error, value } = validateAddCourse.validate({ name, description, manager_ids }, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const course = await createCourse({
    name: value.name,
    description: value.description,
    user_id: req.user.id,
    org_id: req.user.org_id,
  })

  for (const manager_id of value.manager_ids) {
    await createCourseManagerMapping({ course_id: course.id, manager_id })
  }

  const managers = await getManagersForCourse(course.id)
  res.status(201).json(shapeCourse(course, managers))
})

const updateCourseHandler = asyncHandler(async (req, res) => {
  const { id, name, description, manager_ids } = req.body
  const { error, value } = validateUpdateCourse.validate({ id, name, description, manager_ids }, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const [affectedCount] = await updateCourse(
    { name: value.name, description: value.description, user_id: req.user.id, org_id: req.user.org_id },
    value.id,
  )

  if (affectedCount === 0) {
    // Either no such course, or the caller doesn't own it — only the owning
    // teacher can edit a course, managers only get read visibility.
    res.status(404)
    throw new Error("Course not found")
  }

  await deleteCourseManagerMappingByCourse(value.id)
  for (const manager_id of value.manager_ids) {
    await createCourseManagerMapping({ course_id: value.id, manager_id })
  }

  const updatedCourse = await findCourse({ id: value.id })
  const managers = await getManagersForCourse(value.id)
  res.status(200).json(shapeCourse(updatedCourse, managers))
})

const deleteCourseHandler = asyncHandler(async (req, res) => {
  const { id } = req.params
  const [affectedCount] = await updateCourse({ active: false, user_id: req.user.id, org_id: req.user.org_id }, id)

  if (affectedCount === 0) {
    res.status(404)
    throw new Error("Course not found")
  }

  res.status(200).json({ id: Number(id) })
})

export {
  getAllCourse,
  createCourseHandler as createCourse,
  updateCourseHandler as updateCourse,
  deleteCourseHandler as deleteCourse,
}
