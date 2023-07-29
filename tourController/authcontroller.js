const User = require("./../models/userModel");
const crypto = require("crypto");
const AppError = require("./../utils/appError");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const Tour = require("../models/tourModel");
const sendEmail = require("./../utils/email");
exports.signup = async (req, res) => {
  const user1 = await User.create(req.body);
  token = jwt.sign({ id: user1._id }, process.env.sec, { expiresIn: 900 });
  res.status(201).json({ status: "success", token, user1: { user1 } });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.sec, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.login = async (req, res, next) => {
  // try {
  const { email } = req.body;
  const password = req.body.password;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  // "email":"jonfff@gh.io",
  // "password":"1qwvertzy",
  // const user = await User.findOne({ email });
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //
  // 3) If everything ok, send token to client
  token = jwt.sign({ id: user._id }, process.env.sec, { expiresIn: 900000 });
  res.status(201).json({ status: "success", token, user1: { user } });

  //   createSendToken(user, 200, res);
  //   } catch {
  //     res.status(201).json({ status: "fail" });
  //   }
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
  console.log(token);
  if (!token) {
    const err = new AppError("You are noin taccess.", 401);
    return next(err);
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.sec);
  console.log(decoded);
  // 3) Check .lif user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    const err = new AppError("The user no longer exist.", 400);
    return next(err);
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently e log in again.", 401));
  }
  req.user = currentUser;
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  // console.log(0);
  const user = await User.findOne({ email: req.body.email });
  // console.log(user);
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }
  // console.log(user);
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  console.log(message);
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  console.log(11111111111111111);
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    // passwordResetExpires: { $gt: Date.now() },
  });

  console.log(user);
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  console.log(11111111111111111);
  token = signToken(user.id);
  res.status(200).json({
    status: "success",
    token,
  });

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  // createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  console.log(11111111111111111);
  const user = await User.findById(req.user.id).select("+password");
  // const user = await User.findById(req.user.id);
  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  console.log(11111111111111111);

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!
  // token = signToken(user.id);
  res.status(200).json({
    status: "success",
    // token,
    // 4) Log user in, send JWT
  });
});
