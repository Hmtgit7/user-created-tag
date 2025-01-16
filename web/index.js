// web/index.js
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import compression from 'compression';
import cors from 'cors';

// Import Shopify-specific components
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

// Import database and models
import { sequelize, Store, Tag, ProductTag } from './models/index.js';

// Import routes and middleware
import { verifyAndStoreSession, ensureStoreExists } from './middleware/multistore-auth.js';
import tagRoutes from './routes/tagRoutes.js';
import storeManagementRoutes from './routes/store-management.js';

// Import environment variables
import dotenv from "dotenv";
dotenv.config();

// Constants
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "5000", 10);
const STATIC_PATH = process.env.NODE_ENV === "production"
  ? `${process.cwd()}/frontend/dist`
  : `${process.cwd()}/frontend/`;
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Express app
const app = express();

app.use(shopify.cspHeaders());
// Basic middleware setup
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS for development
app.set('trust proxy', 1); // Trust first proxy

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  const status = err.status || 500;
  const message = isDevelopment ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });
};

// Request logging middleware for development
const requestLogger = (req, res, next) => {
  if (isDevelopment) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
};

app.use(requestLogger);

// Shopify Authentication Routes
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async (req, res, next) => {
    try {
      const session = res.locals.shopify.session;
      await verifyAndStoreSession(req, res, () => {
        shopify.redirectToShopifyOrAppRoot()(req, res, next);
      });
    } catch (error) {
      next(error);
    }
  }
);

// Webhook handling
app.post(
  shopify.config.webhooks.path,
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      await shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })(req, res);
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).send(error.message);
    }
  }
);

// API routes that require session validation
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.json());
app.use(verifyAndStoreSession);

// Mount route modules
app.use(storeManagementRoutes);
app.use(tagRoutes);

// Product-related routes
app.get("/api/products/count", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Graphql({ session });

    const countData = await client.query({
      data: `{
        productsCount {
          count
        }
      }`,
    });

    res.status(200).json({ count: countData.body.data.productsCount.count });
  } catch (error) {
    console.error('Error fetching product count:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/all", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const products = await shopify.api.rest.Product.all({
      session: session,
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Store information route
app.get("/api/store/info", ensureStoreExists, async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const client = new shopify.api.clients.Rest({ session });
    const response = await client.get({ path: 'shop' });
    res.status(200).json(response.body);
  } catch (error) {
    console.error('Error fetching store info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files and handle SPA routing
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (req, res) => {
  try {
    const htmlFile = join(STATIC_PATH, "index.html");
    let indexContent = readFileSync(htmlFile, "utf8");

    // Replace environment variables
    indexContent = indexContent
      .replace(/%SHOPIFY_API_KEY%/g, process.env.SHOPIFY_API_KEY || "")
      .replace(/%HOST%/g, process.env.HOST || "");

    res
      .status(200)
      .set("Content-Type", "text/html")
      .send(indexContent);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send("Error loading application");
  }
});

// Apply error handling middleware last
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');

    // Sync models with database
    const syncOptions = {
      force: false, // Don't drop tables
      alter: isDevelopment // Allow model changes in development
    };
    await sequelize.sync(syncOptions);
    console.log('✓ Database models synchronized');

    // Start the server
    app.listen(PORT, () => {
      console.log(`⭐ Shopify app running on port ${PORT}`);
      if (isDevelopment) {
        console.log(`Debug URL: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('Database connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();