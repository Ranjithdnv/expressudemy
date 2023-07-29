const fs = require("fs");
const User = require("./../models/userModel");
const Tour = require("./../models/tourModel");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const APIFeatures = require("./../utils/apifeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
exports.check = (req, res, next, val) => {
  if (req.params.val * 1 > tours.length) {
    return res.status(404).json({ status: "fail" });
  }
  next();
};

exports.protect = async (req, res, next) => {
  //  Getting token and check of it's there
  let token;

  // console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // if (!token) {
  //   return next(
  //     new AppError("You are not logged in! Please log in to get access.", 401)
  //   );
  // }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.sec);
  console.log(decoded);
  // 3) Check .lif user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user no longer exist.", 400));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently e log in again.", 401));
  }
  next();
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "1";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};
// //
// const tours = JSON.parse(fs.readFileSync(`./dev-data/data/tours-simple.json`));

exports.tourss = async (req, res) => {
  // console.log(req.requesttime);
  // res.status(200).json({ status: "200", data: { tours } });
  try {
    const tour = await Tour.find();
    res.status(201).json({ status: "success", data: { tour: tour } });
  } catch (err) {
    res.status(201).json({ status: "success", message: "invalid" });
  }
};

//

//
exports.postTours = catchAsync(async (req, res, next) => {
  // const newid = tours[tours.length - 1].id + 1;
  // const newtour = Object.assign({ id: newid }, req.body);
  // tours.push(newtour);

  // fs.writeFile(
  //   `./../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  // res.status(201).json({ status: "success", data: { tour: newtour } });
  //   // }
  // try {
  const tour = await Tour.create(req.body);
  console.log(tour);
  if (!tour) {
    // err = new Error("erorrrrrrrrrrr");
    // err.status = "shittt";
    // err.statusCode = 404;
    // console.log(err);
    // return next(err);
    return next(new AppError("sNo tour found with that ID", 404));
  }
  res.status(201).json({ status: "success", data: { tour: tour } });
  // }
  //  catch (err) {
  //   res.status(201).json({ status: "fails", message: err });
  // }
});
//
exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "err",
    });
  }
};

exports.updateTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  console.log(tour);
  if (!tour) {
    const err = new AppError("hgggggmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmjj", 404);
    return next(err);
  }
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});
// } catch (err) {
//   res.status(404).json({
//     status: "fail",
//     message: err,
//   });
// }

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
//

//exports.gettour = catchAsync(async (req, res) => {
exports.gettour = async (req, res) => {
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // res.status(200).json({ status: "success", data: { tour } });
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(201).json({ status: "success", data: { tour: tour } });
  } catch {
    res.status(401).json({ status: "fail", data: "no tour" });
  }
};
// if (!tour) {
//   // return next("No tour found with that ID", 404);
//   // if (!tour) {
//   err = new Error("erorrrrrrrrrrr");
//   err.status = "shittt";
//   err.statusCode = 404;
//   console.log(err);
//   return next(err);
// }

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
