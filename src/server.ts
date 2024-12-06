import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

import sql from './database/db';

const app: Application = express();


// Database test connection
(async () => {
    try {
      // Test query
      const result = await sql`SELECT 'Database connection successful!' AS message`;
      console.log(result[0].message); // Output: Database connection successful!
    } catch (error) {
      console.error("Error connecting to the database:", error);
    }
})();


const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Listings Microservice API',
            version: '0.0.1',
            description: 'API documentation',
        },
    },
    apis: ['./src/routes/*.ts', './src/routes/**/*.ts'],
};

// Create Swagger UI documentation
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(express.json());

app.use('/api/listings/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
            
            app.use(`/api/listings${relativePath}`, route);
        }
    });
};
loadRoutes(path.join(__dirname, 'routes'));

// Setup graceful shutdown for PostgreSQL
const shutdownGracefully = () => {
    console.log("Shutting down gracefully...");
  
    // Close DB connection
    sql.end().then(() => {
      console.log("Database connection closed.");
      process.exit(0);
    }).catch((err) => {
      console.error("Error closing DB connection", err);
      process.exit(1);
    });
};

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
