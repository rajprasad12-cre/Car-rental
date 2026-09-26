import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI?.trim();
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined');
        }

        mongoose.connection.on('connected', () => console.log("Database Connected"));
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    } catch (error) {
        console.error(`Database connection failed: ${error.message}`);
        throw error;
    }

    return true;
}

export default connectDB;