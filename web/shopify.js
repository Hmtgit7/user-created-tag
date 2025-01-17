// import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
// import { shopifyApp } from "@shopify/shopify-app-express";
// import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
// import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
// import dotenv from "dotenv";

// dotenv.config();

// const DB_PATH = `${process.cwd()}/database.sqlite`;

// // The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// // See the ensureBilling helper to learn more about billing in this template.
// const billingConfig = {
//   "My Shopify One-Time Charge": {
//     // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
//     amount: 5.0,
//     currencyCode: "USD",
//     interval: BillingInterval.OneTime,
//   },
// };

// const shopify = shopifyApp({
//   api: {
//     apiVersion: LATEST_API_VERSION,
//     restResources,

//     future: {
//       customerAddressDefaultFix: true,
//       lineItemBilling: true,
//       unstable_managedPricingSupport: true,
//     },
//     billing: undefined, // or replace with billingConfig above to enable example billing
//   },
//   auth: {
//     path: "/api/auth",
//     callbackPath: "/api/auth/callback",
//   },
//   webhooks: {
//     path: "/api/webhooks",
//   },
//   // This should be replaced with your preferred storage strategy
//   sessionStorage: new SQLiteSessionStorage(DB_PATH),
// });

// export default shopify;

// shopify.js
import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import PostgresSessionStorage from "./sessionStorage.js";
import { Store, Session } from "./models/index.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize session storage with models
const sessionStorage = new PostgresSessionStorage(Session, Store);

// Required for the app store - Billing configuration
const billingConfig = {
  "My Shopify App Subscription": {
    amount: 10.0,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 14,
    usageTerms: "Free 14-day trial followed by $10/month subscription"
  },
};

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: billingConfig, // Enable billing for app store
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
    // Required scopes for your app
    scopes: [
      'read_products',
      'write_products',
      // Add other required scopes
    ],
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: sessionStorage,
});

// Middleware to ensure valid shop session
const validateShopSession = async (req, res, next) => {
  try {
    const session = await sessionStorage.loadSession(req.query.shop);
    if (!session || !session.accessToken) {
      return res.redirect(`/api/auth?shop=${req.query.shop}`);
    }
    req.shopifySession = session;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).send('Error validating session');
  }
};


export { shopify, validateShopSession };