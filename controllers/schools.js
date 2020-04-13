const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder')
const asyncHandler = require('../middleware/async');
const School = require('../models/School');

//      Get all schools
//     GET /api/schools

exports.getSchools = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// Get single school
//    GET /api/schools/:id

exports.getSchool = asyncHandler(async (req, res, next) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return next(
      new ErrorResponse(`School not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: school });
});

//     Create new school
//      POST /api/schools

exports.createSchool = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  // Check for published School
  const publishedSchool = await School.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one school
  if (publishedSchool && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a school`,
        400
      )
    );
  }

  const school = await School.create(req.body);

  res.status(201).json({
    success: true,
    data: school
  });
});

//       Update school
//     PUT /api/schools/:id

exports.updateSchool = asyncHandler(async (req, res, next) => {
  let school = await School.findById(req.params.id);

  if (!school) {
    return next(
      new ErrorResponse(`School not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is school owner
  if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this school`,
        401
      )
    );
  }

  school = await School.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: school });
});

//     Delete school
//     DELETE /api/schools/:id

exports.deleteSchool = asyncHandler(async (req, res, next) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return next(
      new ErrorResponse(`School not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is school owner
  if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this school`,
        401
      )
    );
  }

  await school.remove();

  res.status(200).json({ success: true, data: {} });
});


//   Upload photo for school
//   PUT /api/schools/:id/photo

exports.schoolPhotoUpload = asyncHandler(async (req, res, next) => {
  const school = await School.findById(req.params.id);

  if (!school) {
    return next(
      new ErrorResponse(`school not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is school owner
  if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this school`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${school._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await School.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
