import type { AppStoreApp } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/types";
import type { ShopifyConfig } from "shopify-config";
import type { SessionStorage } from '@shopify/shopify-app-session-storage';
// import "@shopify/shopify-app-remix/adapters/cloudflare";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-04";

let shopify: AppStoreApp<ShopifyConfig>|null = null;

export const getShopifyInstance = (env: Env, sessionStorage: SessionStorage): AppStoreApp<ShopifyConfig> => {
  if (shopify === null) {
    shopify = shopifyApp({
      apiKey: env.SHOPIFY_API_KEY,
      apiSecretKey: env.SHOPIFY_API_SECRET || "",
      apiVersion: ApiVersion.April24,
      scopes: env.SCOPES?.split(","),
      appUrl: env.SHOPIFY_APP_URL || "",
      authPathPrefix: "/auth",
      sessionStorage,
      distribution: AppDistribution.AppStore,
      restResources,
      webhooks: {
        APP_UNINSTALLED: {
          deliveryMethod: DeliveryMethod.Http,
          callbackUrl: "/webhooks",
        },
      },
      hooks: {
        afterAuth: async ({ session }) => {
          shopify?.registerWebhooks({ session });
        },
      },
      future: {
        v3_webhookAdminContext: true,
        v3_authenticatePublic: true,
        v3_lineItemBilling: true,
        unstable_newEmbeddedAuthStrategy: true,
      },
      ...(env.SHOP_CUSTOM_DOMAIN
        ? { customShopDomains: [env.SHOP_CUSTOM_DOMAIN] }
        : {}),
    } as ShopifyConfig) as AppStoreApp<ShopifyConfig>;
  }

  return shopify;
}

export default getShopifyInstance;
export const apiVersion = ApiVersion.April24;
