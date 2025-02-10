import mongoose from "mongoose";

export const connectDB = (mongoURI) => {
  mongoose.connect(mongoURI).then((message) => {
    console.log(`Database Connected to : ${message.connection.host}`);
  });
};
