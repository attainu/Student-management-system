const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses');

const Course = require('../models/Course');

const router = express.Router({ mergeParams: true });

const AllResults = require('../middleware/AllResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(AllResults(Course, {
    path: 'school',
    select: 'name description'
  }),
  getCourses
)
  .post(protect, authorize('publisher', 'admin'), addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
