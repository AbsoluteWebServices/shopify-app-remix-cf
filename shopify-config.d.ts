import { type RestResources } from "@shopify/shopify-api/rest/admin/2024-04";
import type { WebhookConfig } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/config-types";
import type { FutureFlags } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/future/flags";

export interface ShopifyConfig {
  apiKey: string;
  apiSecretKey: string;
  apiVersion: ApiVersion;
  scopes?: string[];
  appUrl: string;
  authPathPrefix: string;
  sessionStorage: D1SessionStorage;
  distribution: AppDistribution;
  restResources: RestResources;
  webhooks: WebhookConfig;
  hooks: {
    afterAuth: ({ session }: { session: any }) => Promise<void>;
  }
  future: FutureFlags;
  customShopDomains?: string[];
}
