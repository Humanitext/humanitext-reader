import { defineNuxtConfig } from "nuxt/config";
import vuetify from "vite-plugin-vuetify";

export default defineNuxtConfig({
  modules: ["nuxt3-leaflet", "nuxt-swiper"],
  ssr: false,
  build: {
    transpile: ["vuetify"]
  },
  hooks: {
    "vite:extendConfig": (config) => {
      config.plugins!.push(vuetify());
    },
  },
  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
    define: {
      "process.env.DEBUG": false,
    },
  },
  css: [
    "@/assets/main.scss",
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.css",
    "@/assets/styles/CETEIcean.css",
    "vue3-treeselect/dist/vue3-treeselect.css",
  ],
});
