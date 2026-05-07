const mongoose = require('mongoose')

const connectDB = async (retries = 5, delay = 5000) => {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI environment variable is not set');
        return;
    }
    while (retries > 0) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
            });
            console.log('MongoDB Atlas connected');
            return;
        }
        catch (err) {
            retries -= 1;
            console.error(`MongoDB connection error. Retries left: ${retries}. Message:`, err.message);
            if (retries === 0) {
                console.error('Exhausted all MongoDB connection retries in auth service.');
                throw err;
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

module.exports = connectDB;
