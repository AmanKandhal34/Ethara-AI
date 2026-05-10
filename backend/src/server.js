import app from './app.js';
import connectDB from './config/db.js';
import config from './config/env.js';

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start server
        const server = app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error(`Unhandled Rejection: ${err.message}`);
            server.close(() => process.exit(1));
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
