import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    originalURL: {
        type: String,
        required: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    createdAT: {
        type: Date,
        default: Date.now
    }
})

const urlModel = new mongoose.model("Url", urlSchema)

export default urlModel