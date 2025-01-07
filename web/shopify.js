// import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
// import { shopifyApp } from "@shopify/shopify-app-express";
// import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
// import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";

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
//   apiKey: "48a0f5e2ec6e42fae077af3ea19bb608",
//   apiSecret: "02a542c49c609458ef0bfd85e64f86c8",
//   scopes: ['read_products', 'write_products'],
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

// import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
// import { shopifyApp } from "@shopify/shopify-app-express";
// import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
// import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";

// const DB_PATH = `${process.cwd()}/database.sqlite`;

// const shopify = shopifyApp({
//   // apiKey: "48a0f5e2ec6e42fae077af3ea19bb608",
//   // apiSecret: "02a542c49c609458ef0bfd85e64f86c8",
//   // scopes: ['read_products', 'write_products'],
//   // hostName: 'https://atmospheric-burns-pichunter-protein.trycloudflare.com',
//   apiKey: "48a0f5e2ec6e42fae077af3ea19bb608",
//   apiSecretKey: "02a542c49c609458ef0bfd85e64f86c8",
//   scopes: ['write_products', 'write_customers', 'read_orders', 'read_products', 'read_product_listings', 'write_product_listings'],
//   hostName: 'https://atmospheric-burns-pichunter-protein.trycloudflare.com',
//   api: {
//     apiVersion: "2024-01", // Explicitly set the API version
//     restResources,
//     billing: undefined,
//     future: {
//       customerAddressDefaultFix: true,
//       lineItemBilling: true,
//       unstable_managedPricingSupport: true,
//     },
//   },
//   auth: {
//     path: "/api/auth",
//     callbackPath: "/api/auth/callback",
//   },
//   webhooks: {
//     path: "/api/webhooks",
//   },
//   sessionStorage: new SQLiteSessionStorage(DB_PATH),
// });

// export default shopify;


import { shopifyApp } from '@shopify/shopify-app-express';
import { SQLiteSessionStorage } from '@shopify/shopify-app-session-storage-sqlite';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-01';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['write_products', 'read_products'],
  hostName: process.env.SHOPIFY_HOSTNAME,
  api: {
    apiVersion: "2024-01",
    restResources,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new SQLiteSessionStorage(`${process.cwd()}/database.sqlite`),
});

export default shopify;
