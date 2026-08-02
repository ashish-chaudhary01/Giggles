import mongoose from "mongoose";

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("Mongo Uri is Required");
    }
    const conn = await mongoose.connect(mongoUri);
    console.log("MongoDB Connected ", conn.connection.host);
  } catch (error) {
    console.log(error.message);
    process.exit(1); // 1 means failed,0 means success
  }
}
