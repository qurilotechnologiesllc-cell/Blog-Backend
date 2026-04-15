const mongoose = require("mongoose")

const dbConnect = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error(
            'MongoDB connection string (MONGO_URI) is not defined in environment variables.',
        );
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('Successfully connected to MongoDB.');
    } catch (error) {
        console.error('Error connecting to MongoDB:');
        process.exit(1);
    }
};

module.exports = dbConnect