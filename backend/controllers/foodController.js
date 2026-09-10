import foodModel from "../models/foodModel.js";
import cloudinary from "../config/cloudinary.js";

const uploadImage = (buffer) => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "food-del" },
        (error, result) => error ? reject(error) : resolve(result)
    );

    uploadStream.end(buffer);
});

const getCloudinaryPublicId = (imageUrl) => {
    if (!imageUrl.startsWith("https://res.cloudinary.com/")) return null;

    const uploadedPath = new URL(imageUrl).pathname.split("/upload/")[1];
    if (!uploadedPath) return null;

    const pathWithoutVersion = uploadedPath.replace(/^v\d+\//, "");
    return pathWithoutVersion.replace(/\.[^.]+$/, "");
};

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// add food
const addFood = async (req, res) => {

    try {
        const uploadResult = await uploadImage(req.file.buffer);

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category:req.body.category,
            image: uploadResult.secure_url,
        })

        await food.save();
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// delete food
const removeFood = async (req, res) => {
    try {

        const food = await foodModel.findById(req.body.id);
        const publicId = getCloudinaryPublicId(food.image);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId, { invalidate: true });
            } catch (error) {
                console.log(error);
            }
        }

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Food Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

export { listFood, addFood, removeFood }
