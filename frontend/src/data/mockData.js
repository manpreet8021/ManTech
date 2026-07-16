// Placeholder data shaped like what the Node API / RTK Query endpoints will
// eventually return. Swap these out once the real endpoints exist.

export const mockCourses = [
  {
    course_id: 1,
    title: 'Class 10 Mathematics',
    description: 'NCERT-aligned lectures covering algebra, geometry, and trigonometry.',
  },
  {
    course_id: 2,
    title: 'Class 10 Social Science',
    description: 'History and civics lectures for the Class 10 board syllabus.',
  },
]

export const mockVideos = [
  {
    video_id: 1,
    course_id: 1,
    name: 'Class 10 Maths — Polynomials',
    url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    pdf_name: 'polynomials-notes.pdf',
    status: 'ready',
    translation: `Hello everyone, today we're going to study Chapter 2, Polynomials.
Let's start by understanding what a polynomial actually is, and how the
degree of a polynomial is defined. A polynomial in one variable x is an
expression made up of terms of the form a times x to the power n, where
n is a non-negative integer...

(Full translated transcript would continue here, chunked and translated
section by section from the original lecture audio.)`,
    summary: `## Overview
This lecture introduces polynomials, their degree, and standard forms, building
up to the relationship between zeros of a polynomial and its coefficients.

## Key Concepts
- A polynomial's degree is the highest power of the variable with a non-zero coefficient.
- Linear, quadratic, and cubic polynomials have 1, 2, and 3 zeros respectively (at most).
- The zeros of a quadratic ax² + bx + c relate to -b/a and c/a.

## Important Takeaways
- Graphically, the zeros of a polynomial are where its curve crosses the x-axis.
- Division algorithm for polynomials mirrors integer long division.`,
    quiz: [
      {
        question: 'What is the maximum number of zeros a quadratic polynomial can have?',
        options: ['1', '2', '3', '4'],
        answer: '2',
      },
      {
        question: 'For ax² + bx + c, the sum of the zeros equals which expression?',
        options: ['-b/a', 'c/a', 'b/a', '-c/a'],
        answer: '-b/a',
      },
      {
        question: 'What does the degree of a polynomial refer to?',
        options: [
          'The number of terms',
          'The highest power of the variable',
          'The number of zeros',
          'The value of the constant term',
        ],
        answer: 'The highest power of the variable',
      },
    ],
  },
  {
    video_id: 2,
    course_id: 1,
    name: 'Class 10 Science — Light: Reflection and Refraction',
    url: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
    pdf_name: null,
    status: 'processing',
    currentStep: 'summary',
  },
  {
    video_id: 3,
    course_id: 2,
    name: 'Class 10 History — Nationalism in India',
    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    pdf_name: 'nationalism-in-india-slides.pdf',
    status: 'ready',
    summary: `## Overview
Covers the rise of nationalist movements in India during the interwar period,
centered on the Non-Cooperation and Civil Disobedience movements.

## Key Concepts
- Gandhi's return from South Africa and the idea of Satyagraha.
- The Non-Cooperation Movement (1920–22) and its withdrawal after Chauri Chaura.
- The Salt March and Civil Disobedience Movement (1930).

## Important Takeaways
- Different social groups joined the movement with different aspirations.
- Nationalism was not one uniform force but a coalition of local movements.`,
    quiz: [
      {
        question: 'What event led Gandhi to withdraw the Non-Cooperation Movement?',
        options: ['Jallianwala Bagh', 'Chauri Chaura incident', 'The Salt March', 'Partition of Bengal'],
        answer: 'Chauri Chaura incident',
      },
      {
        question: 'The Salt March was part of which movement?',
        options: ['Quit India Movement', 'Non-Cooperation Movement', 'Civil Disobedience Movement', 'Khilafat Movement'],
        answer: 'Civil Disobedience Movement',
      },
    ],
  },
  {
    video_id: 4,
    course_id: 2,
    name: 'Class 10 Civics — Power Sharing',
    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    pdf_name: null,
    status: 'pending',
  },
]

// Invite-only student signup: a teacher sends an invite (email + course),
// the student follows their unique invite link to set a password and land
// in the course. `invite_id` stands in for a real unguessable token here —
// a real backend should issue a random opaque token, not a sequential id.
export const mockInvites = [
  { invite_id: 1, email: 'student@example.com', course_id: 1, status: 'accepted' },
  { invite_id: 2, email: 'student@example.com', course_id: 2, status: 'accepted' },
  { invite_id: 3, email: 'new.student@example.com', course_id: 1, status: 'pending' },
]

export function getVideoById(id) {
  return mockVideos.find((v) => String(v.video_id) === String(id))
}

export function getCourseById(id) {
  return mockCourses.find((c) => String(c.course_id) === String(id))
}

export function getVideosForCourse(courseId) {
  return mockVideos.filter((v) => String(v.course_id) === String(courseId))
}

export function getInvitesForCourse(courseId) {
  return mockInvites.filter((i) => String(i.course_id) === String(courseId))
}

export function getInviteById(inviteId) {
  return mockInvites.find((i) => String(i.invite_id) === String(inviteId))
}

export function getEnrolledCourseIdsForEmail(email) {
  return mockInvites
    .filter((i) => i.email === email && i.status === 'accepted')
    .map((i) => i.course_id)
}

// Home-tab analytics. TODO: replace with a real RTK Query hook, e.g.
// useGetTeacherAnalyticsQuery(), backed by an aggregate query over
// video_status timestamps and a future watch-session table.
export const mockAnalytics = {
  dailySignups: [
    { date: 'Jul 4', count: 1 },
    { date: 'Jul 5', count: 0 },
    { date: 'Jul 6', count: 2 },
    { date: 'Jul 7', count: 1 },
    { date: 'Jul 8', count: 3 },
    { date: 'Jul 9', count: 2 },
    { date: 'Jul 10', count: 1 },
    { date: 'Jul 11', count: 4 },
    { date: 'Jul 12', count: 2 },
    { date: 'Jul 13', count: 3 },
    { date: 'Jul 14', count: 5 },
    { date: 'Jul 15', count: 3 },
    { date: 'Jul 16', count: 4 },
    { date: 'Jul 17', count: 6 },
  ],
  dailyWatchMinutes: [
    { date: 'Jul 4', minutes: 45 },
    { date: 'Jul 5', minutes: 60 },
    { date: 'Jul 6', minutes: 80 },
    { date: 'Jul 7', minutes: 65 },
    { date: 'Jul 8', minutes: 110 },
    { date: 'Jul 9', minutes: 95 },
    { date: 'Jul 10', minutes: 70 },
    { date: 'Jul 11', minutes: 140 },
    { date: 'Jul 12', minutes: 120 },
    { date: 'Jul 13', minutes: 150 },
    { date: 'Jul 14', minutes: 185 },
    { date: 'Jul 15', minutes: 160 },
    { date: 'Jul 16', minutes: 175 },
    { date: 'Jul 17', minutes: 210 },
  ],
}

export function getTeacherStats() {
  const totalStudents = new Set(mockInvites.filter((i) => i.status === 'accepted').map((i) => i.email))
    .size
  const pendingInvites = mockInvites.filter((i) => i.status === 'pending').length
  const readyVideos = mockVideos.filter((v) => v.status === 'ready').length

  return {
    totalStudents,
    pendingInvites,
    totalCourses: mockCourses.length,
    totalVideos: mockVideos.length,
    readyVideos,
  }
}
