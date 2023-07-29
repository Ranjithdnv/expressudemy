const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const AppError = require("./utils/appError");
const userrouter = require("./tourRoutes/userRoutes");
const tourrouter = require("./tourRoutes/tourroutes");
const globalErrorHandler = require("./tourController/errorController");

//
const fs = require("fs");
const { error } = require("console");
const tours = JSON.parse(fs.readFileSync(`./dev-data/data/tours-simple.json`));
//console.log(tours);
const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("/img", express.static("public/img"));
app.use(express.json());
app.use(morgan("dev"));
app.use(cors("http://localhost:3000/"));
//
app.use((req, res, next) => {
  //console.log("hello");
  next();
});
//
app.use((req, res, next) => {
  req.requesttime = new Date().toISOString();

  next();
});
//
// app.get("/", (req, res) => {
//   res.send("helo");
// });
// //
// const tourss = (req, res) => {
//   console.log(req.requesttime);
//   res.status(200).json({ status: "200", data: { tours } });
// };

// //

// //
// const postTours = (req, res) => {
//   const newid = tours[tours.length - 1].id + 1;
//   const newtour = Object.assign({ id: newid }, req.body);
//   tours.push(newtour);

//   fs.writeFile(
//     `./dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({ status: "success", data: { tour: newtour } });
//     }
//   );
// };
// //

// //

// //
// const tour = (req, res) => {
//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);

//   res.status(200).json({ status: "success", data: { tour } });
// };
// //
// // app.get("/api/v1/tours/:id", tour);
// // app.post("/api/v1/tours", postTours);
// // app.get("/api/v1/tours", tourss);
// const usersall = (req, res) => {
//   res
//     .status(500)
//     .json({ status: "errors", message: "this not yet implemented" });
// };
// //
// const userspost = (req, res) => {
//   res
//     .status(500)
//     .json({ status: "errors", message: "this not yet implemented" });
// };
// //
// const user1 = (req, res) => {
//   res
//     .status(500)
//     .json({ status: "errors", message: "this not yet implemented" });
// };
// //

// //

// const tourrouter = express.Router();
//

app.use("/api/v1/tours", tourrouter);
//
// tourrouter.route("/").get(tourss).post(postTours);
// tourrouter.route("/:id").get(tour);
// //
// const userrouter = express.Router();

// userrouter.route("/").get(usersall).post(userspost);
// userrouter.route("/:id").get(user1);

app.use("/api/v1/users", userrouter);

// //
// const port = 3000;
// app.listen(port, () => console.log("server listening on port 3000"));
app.all("*", (req, res, next) => {
  const err = new AppError("hiijjjjjjjjjjjjjjjjjjj", 404);
  next(err);
});
//
app.use((error, req, res, next) => {
  // console.log(err.stack);

  error.statusCode = error.statusCode || 500;
  error.status = error.status;
  res
    .status(error.statusCode)
    .json({ status: error.status, mes: error.message });
});
module.exports = app;
