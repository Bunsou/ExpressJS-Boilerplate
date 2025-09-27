// Path: src/shared/utils/swagger.ts
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { config } from "../config/config";

const router = express.Router();

// This is the main configuration object for swagger-jsdoc
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Boilerplate API",
      version: "1.0.0",
      description:
        "API documentation for the Express boilerplate application, built with Node.js, Express, and PostgreSQL.",
    },
    // Define servers for different environments
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Development Server",
      },
    ],
    // Define tags to organize your endpoints in the UI
    tags: [
      {
        name: "Auth",
        description: "Authentication and user session management",
      },
      { name: "Users", description: "User profile management" },
      { name: "Posts", description: "Post creation and management" },
    ],
    // Define the security schemes your API uses
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme.",
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API Key for server-to-server communication.",
        },
      },
    },
  },
  // Point to the files that contain your endpoint definitions
  apis: ["./src/features/**/*.routes.ts"],
};

// Generate the final OpenAPI specification
const swaggerSpec = swaggerJSDoc(options);

// Setup the Express router to serve the Swagger UI
router.use("/", swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }", // Hides the top bar
    customSiteTitle: "Boilerplate API Docs",
  })
);

// Provide a route to get the raw JSON specification
router.get("/json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

export const swaggerRoutes = router;
