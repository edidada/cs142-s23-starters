const mongoose = require("mongoose");
const activitySchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  user_name: String,
  type: String,
  date_time: { type: Date, default: Date.now },
  photo: { _id: mongoose.Schema.Types.ObjectId, file_name: String, user_id: mongoose.Schema.Types.ObjectId }
});
module.exports = mongoose.model("Activity", activitySchema);
