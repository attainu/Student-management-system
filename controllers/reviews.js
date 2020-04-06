const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const School = require('../models/School');

//      Get reviews
//     GET /api/v1/reviews
//   GET /api/v1/schools/:schoolId/reviews

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.schoolId) {
    const reviews = await Review.find({ school: req.params.schoolId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//     Get single review
//     GET /api/v1/reviews/:id

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'school',
    select: 'name description'
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

//    Add review
//    POST /api/v1/schools/:schoolId/reviews

exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.school = req.params.schoolId;
  req.body.user = req.user.id;

  const school = await School.findById(req.params.schoolId);

  if (!school) {
    return next(
      new ErrorResponse(
        `No school with the id of ${req.params.schoolId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

//    Update review
//      PUT /api/v1/reviews/:id

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

//      Delete review
//    DELETE /api/v1/reviews/:id

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
