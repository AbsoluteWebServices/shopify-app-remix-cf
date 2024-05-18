import type { AppStoreApp } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/types";
import type { ShopifyConfig } from "shopify-config";
import type { PlatformProxy } from "wrangler";
import type { D1SessionStorage } from "~/d1-session-storage";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    shopify: AppStoreApp<ShopifyConfig>;
    db: D1SessionStorage;
  }
}
