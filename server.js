const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });

// const Tour = require("./models/tourModel");
db = process.env.DATABASE_URL;
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useNewUrlParser: true,
  })
  .then(() => console.log("success"));
//   .then((con) => console.log("success"));
// const tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     unique: true,
//     reqiured: [true, "a tour must be string"],
//   },
//   rating: { type: Number, default: 4.5 }, //validator
//   price: { type: Number, reqiured: [true, "a tour must have a price"] },
// });
// //
// //
// const Tour = mongoose.model("Tour", tourSchema);
// const Tour = require("./models/tourModel");
// const testTour = new Tour({
//   name: "the park nightplayer",
//   rating: 4.7,
//   price: 497,
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("ERROR156h", err);
//   });
//
// //
const port = 4000;
app.listen(port, () => console.log("server listening on port 3000"));
