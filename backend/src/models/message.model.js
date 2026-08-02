import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: String,
    image: String,
    video: String,
  },
  { timestamps: true },
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
