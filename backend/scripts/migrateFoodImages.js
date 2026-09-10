import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import foodModel from '../models/foodModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(__dirname, '../uploads');

const uploadImage = (buffer) => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'food-del' },
        (error, result) => error ? reject(error) : resolve(result)
    );

    uploadStream.end(buffer);
});

try {
    await connectDB();

    const foods = await foodModel.find({ image: { $not: /^https?:\/\// } });
    let migrated = 0;

    for (const food of foods) {
        const file = await fs.readFile(path.join(uploadsDirectory, food.image));
        const uploadResult = await uploadImage(file);

        food.image = uploadResult.secure_url;
        await food.save();
        migrated += 1;
    }

    console.log(`Migrated ${migrated} food image(s) to Cloudinary.`);
} finally {
    await mongoose.disconnect();
}
