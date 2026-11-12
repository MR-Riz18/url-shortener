import mongoose from 'mongoose'
import 'dotenv/config'

mongoose.set('bufferCommands', false)

async function connectDB() {
    if (!process.env.MONGO_URI) {
        console.log('MONGO_URI is missing in your .env file')
        return
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        })
        console.log('Connected to DB')
    } catch (error) {
        console.log('Failed to connect to DB:', error.message)
    }
}

export default connectDB
