import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import auctionJob from './cronjobs/flashAuctionCronJob';

const app: Application = express();


// Startup function
(async () => {
    try {
        // Health check
        console.log("Up and running!");

        // Start the cron job
        auctionJob.start();
        console.log('Auction cleanup cron job scheduled.');
        
    } catch (error) {
        console.error("Error setting up the microservice.", error);
    }
})();


const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Flash Auctions Microservice API',
            version: '0.1.0',
            description: 'API documentation',
        },
    },
    apis: ['./src/routes/*.ts', './src/routes/**/*.ts'],
};

// Create Swagger UI documentation
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(express.json());

// Load routes
const loadRoutes = (dir: string) => {
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            loadRoutes(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            const route = require(filePath).default;

            const relativePath = path
                .dirname(filePath)
                .replace(path.join(__dirname, 'routes'), '')
                .replace(/\\/g, '/');
            
            app.use(`/api/flash-auctions${relativePath}`, route);
        }
    });
};
loadRoutes(path.join(__dirname, 'routes'));

app.use('/api/flash-auctions/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Listen for termination signals
// process.on("SIGINT", shutdownGracefully); 
// process.on("SIGTERM", shutdownGracefully);
// process.on("uncaughtException", (err) => {
//   console.error("Uncaught exception", err);
//   shutdownGracefully();
// });
// process.on("unhandledRejection", (reason, promise) => {
//   console.error("Unhandled Rejection", reason);
//   shutdownGracefully();
// });

// A function that uses authentication middleware
//app.get('/admin-resource', verifyJWT, requireRole('admin'), (req, res: Response) => {
//    res.send('Access granted to admin');
//});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
