const mongoose = require('mongoose')

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI environment variable is not set');
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('MongoDB Atlas connected');
    }
    catch (err) {
        console.error('MongoDB connection error:', err.message);
    }
}

module.exports = connectDB;
