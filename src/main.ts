import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import Toast, { POSITION, type PluginOptions } from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";
import "element-plus/dist/index.css";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/zh-cn";

dayjs.extend(localizedFormat);
dayjs.locale("zh-cn", {
  weekdays: [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ],
  weekdaysShort: [
    "每周日",
    "每周一",
    "每周二",
    "每周三",
    "每周四",
    "每周五",
    "每周六",
  ],
});

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
