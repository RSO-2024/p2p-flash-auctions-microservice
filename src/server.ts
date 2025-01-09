// Sentry import
import "./sentry/instrument";

import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import * as Sentry from "@sentry/node";
import { configManager } from './config/configmanager';
import auctionJob from './cronjobs/flashAuctionCronJob';

const app: Application = express();


// Startup function
(async () => {

    var config = configManager.getConfig();

    try {
        // Initial health check
        console.log(`Up and running in the environment: ${process.env.NODE_ENV}.`);
        
        if (config.NODE_ENV === "prod") {
            console.log("Testing Sentry on prod...")
            Sentry.captureMessage("Microservice running on production!")
        }
        auctionJob.start();
        console.log('Auction cleanup cron job scheduled.');
        
    } catch (error) {
        console.error("Error starting the microservice:", error);
        if (config.NODE_ENV === "prod") {
            Sentry.captureException(error);
        }
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

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app