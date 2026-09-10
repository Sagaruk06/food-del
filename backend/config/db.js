import mongoose from "mongoose";

export const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not set in the environment");
    }

    await mongoose.connect(mongoUri, {
        family: 4
    }).then(() => console.log("DB Connected"));
}