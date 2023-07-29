const fs = require("fs");
const express = require("express");
const router = express.Router();
const User = require("./../models/userModel");
consttour = require("../tourController/torCon");
const autc = require("./../tourController/authcontroller");

//
const tours = JSON.parse(fs.readFileSync(`./dev-data/data/tours-simple.json`));

const usersall = async (req, res) => {
  user = await User.find();
  res.status(500).json({ user });
};

//
const userspost = (req, res) => {
  res
    .status(500)
    .json({ status: "errors", message: "this not yet implemented" });
};
//
const user1 = async (req, res) => {
  tour = await User.findById(req.params.id).select(+"password");
  res.status(500).json({ status: "errors", tour });
};
router.route("/reset/:token").patch(autc.resetPassword);
router.route("/forgot").post(autc.forgotPassword);
router.route("/signup").post(autc.signup);
router.route("/update").patch(autc.protect, autc.updatePassword);
router.route("/login").post(autc.login);
router.route("/").get(usersall).post(userspost);
router.route("/:id").get(user1);
module.exports = router;
