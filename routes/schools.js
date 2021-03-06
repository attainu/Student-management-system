const express = require('express');
const {
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  getSchoolsInRadius,
  schoolPhotoUpload
} = require('../controllers/schools');

const School = require('../models/School');

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

const AllResults = require('../middleware/AllResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:schoolId/courses', courseRouter);
router.use('/:schoolId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getSchoolsInRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), schoolPhotoUpload);

router
  .route('/')
  .get(AllResults(School, 'courses'), getSchools)
  .post(protect, authorize('publisher', 'admin'), createSchool);

router
  .route('/:id')
  .get(getSchool)
  .put(protect, authorize('publisher', 'admin'), updateSchool)
  .delete(protect, authorize('publisher', 'admin'), deleteSchool);

module.exports = router;
