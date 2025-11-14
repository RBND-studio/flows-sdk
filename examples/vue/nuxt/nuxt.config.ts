// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  vue: {
    compilerOptions: {
      // Tell Vue about Flows custom elements to avoid rendering it as Vue components
      isCustomElement: (tag) => ["flows-floating-blocks", "flows-slot"].includes(tag),
    },
  },
});
