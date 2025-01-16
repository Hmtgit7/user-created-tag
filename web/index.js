// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

// index.js - Add these imports at the top
import { sequelize } from './models/index.js';
import tagRoutes from './routes/tagRoutes.js';

import dotenv from "dotenv";
dotenv.config();

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "5000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());


// Initialize database and models
try {
  await sequelize.authenticate();
  console.log('Database connected successfully');
  await sequelize.sync(); // This creates/updates tables
  console.log('Models synchronized successfully');
} catch (err) {
  console.error('Unable to connect to the database:', err);
}


// Add tag routes
app.use(tagRoutes);

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

async function authenticateUser(req, res, next) {
  let shop = req.query.shop;
  let storeName = await shopify.config.sessionStorage.findSessionsByShop(shop);
  if (shop === storeName[0].shop) {
    next();
  } else {
    res.send("User Not Authorized");
  }
}

// GETTING STOREFRONT DATA
app.post("/userdata/userinfo", async (req, res) => {
  let userData = req.body;
  try {
    let createUser = await User.create({
      username: userData[0],
      useremail: userData[1],
    });
    console.log("--- User Created Successfully ---");
    res.status(200).json("--- User Created Successfully ---");
  } catch (error) {
    if (error.code === 11000) {
      return res.json("--- User Already Exists ---");
    } else {
      console.log(error.message);
    }
  }
})

app.get("/api/getusers", async (req, res) => {
  try {
    let users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    console.log(error)
  }
});

// GETTING STORE INFORMATION
app.get("/api/store/info", async (req, res) => {
  let storeInfo = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(storeInfo);
});

// GETTING STORE ORDERS
app.get("/api/orders/all", async (req, res) => {
  let storeOrders = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: "any",
  });
  res.status(200).send(storeOrders);
});

// READ ALL PRODUCTS
app.get("/api/product/count", async (req, res) => {
  let totalProducts = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(totalProducts);
});

// READ ALL COLLECTIONS
app.get("/api/collection/count", async (req, res) => {
  let totalCollections = await shopify.api.rest.CustomCollection.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(totalCollections);
})

// READ ALL PRODUCTS
app.get("/api/products/all", async (req, res) => {
  let allProducts = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(allProducts);
});

// UPDATE A PRODUCT
app.put("/api/product/update", async (req, res) => {
  let getProduct = req.body;
  let updateProduct = new shopify.api.rest.Product({
    session: res.locals.shopify.session,
  });
  updateProduct.id = getProduct.id;
  updateProduct.title = getProduct.title;
  await updateProduct.save({
    update: true,
  });
  res.status(200).send({ Message: "Product Updated Successfully" })
});

// CREATE A NEW PRODUCT
app.post("/api/product/create", async (req, res) => {
  let newProduct = new shopify.api.rest.Product({
    session: res.locals.shopify.session,
  });
  newProduct.title = "Men New Style Shoe";
  newProduct.body_html = "Men new style show latest design";
  newProduct.varndor = "al-janat-demo";
  newProduct.images = [{
    src: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }];
  await newProduct.save({
    update: true,
  });
  res.status(200).send({ Message: "Product created Successfully" });
});

// DELETE A PRODUCT
app.delete("/api/product/delete", async (req, res) => {
  await shopify.api.rest.Product.delete({
    session: res.locals.shopify.session,
    id: 7281843077180,
  });
  res.status(200).send({ Message: "Product Deleted Successfully" })
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT, () => {
  console.log(`Shopify app listening on port ${PORT}`);
});