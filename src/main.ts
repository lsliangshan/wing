import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "vue-datepicker-next/index.css";

import "vue-datepicker-next/locale/zh-cn";
import Toast, { POSITION, type PluginOptions } from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

const options: PluginOptions = {
  position: POSITION.TOP_CENTER,
  transition: "Vue-Toastification__fade",
  timeout: 3000,
  hideProgressBar: true,
  icon: false,
  closeButton: false,
};
app.use(Toast, options);

app.mount("#app");
