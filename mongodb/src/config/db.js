const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prtracker';
            
            await mongoose.connect(mongoURI);
            
            console.log('✅ MongoDB connected successfully');
            
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
            });
            
            mongoose.connection.on('disconnected', () => {
                console.log('⚠️  MongoDB disconnected');
            });
            
            process.on('SIGINT', async () => {
                await mongoose.connection.close();
                console.log('MongoDB connection closed due to app termination');
                process.exit(0);
            });
            
            return;
            
        } catch (err) {
            retries -= 1;
            console.error(`❌ MongoDB connection failed. Retries left: ${retries}. Message:`, err.message);
            if (retries === 0) {
                console.error('❌ Exhausted all MongoDB connection retries. Exiting.');
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

module.exports = connectDB;
