// // webhooks/handlers.js
// import { DeliveryMethod } from "@shopify/shopify-api";
// import { Store } from "../models/index.js";

// const appUninstallHandler = async (topic, shop, webhookRequestBody) => {
//   try {
//     await Store.update(
//       {
//         isInstalled: false,
//         uninstalledAt: new Date(),
//         accessToken: null
//       },
//       {
//         where: { shopDomain: shop }
//       }
//     );
//     console.log(`App uninstalled from ${shop}`);
//   } catch (error) {
//     console.error('Error handling app uninstall:', error);
//   }
// };

// export const webhookHandlers = {
//   APP_UNINSTALLED: {
//     deliveryMethod: DeliveryMethod.Http,
//     callbackUrl: "/api/webhooks",
//     callback: appUninstallHandler
//   }
// };

// webhooks/index.js
import { DeliveryMethod } from "@shopify/shopify-api";
import { Store, Session } from "../models/index.js";

const appUninstallHandler = async (
  topic,
  shop,
  webhookRequestBody,
  webhookId,
  apiVersion
) => {
  try {
    console.log(`Processing webhook: ${topic} for ${shop}`);

    // Update store record
    await Store.update(
      {
        isInstalled: false,
        uninstalledAt: new Date(),
        accessToken: null
      },
      {
        where: { shopDomain: shop }
      }
    );

    // Clean up sessions
    await Session.destroy({
      where: { shop }
    });

    console.log(`Successfully processed ${topic} webhook for ${shop}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to process ${topic} webhook for ${shop}:`, error);
    throw error;
  }
};

export const webhookHandlers = {
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: appUninstallHandler
  }
};