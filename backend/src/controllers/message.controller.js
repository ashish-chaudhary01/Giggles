import uploadChatMedia from "../lib/imagekit.js";
import { getReceiverSocketId } from "../lib/socket.js";
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";

// getting all users
export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await userModel
      .find({ _id: { $ne: loggedInUser } })
      .select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUserForSidebar", error.message);
    res.status(500).json({ message: "Unable to fetch users." });
  }
}

// getting the user we chated with
export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUser = req.user._id;
    const conversations = await messageModel.aggregate([
      //1. keep only the messages i sent or received
      {
        $match: { $or: [{ senderId: loggedInUser, receiverId: loggedInUser }] },
      },
      // 2. Collapse them into one row per chat partner, noting our latest message time.
      {
        $group: {
          // The partner is the other person on the message (not me).
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      // 3. Put the most recent conversation at the top.
      { $sort: { lastMessageAt: -1 } },
      // 4. Look up each partner's user profile (comes back as an array).
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      // 5. Pull that profile out of the array and make it the document.
      { $replaceRoot: { newRoot: { $first: "$user" } } },
      // 6. Hide the private clerkId field from the result.
      { $project: { clerkId: 0 } },
    ]);
    res.status(200).json(conversations);
  } catch (error) {
    console.log("Error in getConversationsForSidebar", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// get all messages
export async function getMessages(req, res) {
  try {
    const myId = req.user._id;
    const { id } = req.params;
    const messages = await messageModel
      .find({
        $or: [
          { senderId: myId, receiverId: id },
          { senderId: id, receiverId: myId },
        ],
      })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// send messages
export async function sendMessage(req, res) {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { text } = req.body;

    let imageUrl;
    let videoUrl;
    const url = await uploadChatMedia(req.file);

    if (req.file.mimetype.startsWith("image/")) imageUrl = url;
    else videoUrl = url;

    const newMessage = await messageModel.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    // realtime with socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    // checking if the user is online or not if online send the event with message
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
