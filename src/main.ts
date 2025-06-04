import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "v-calendar/style.css";
import { setupCalendar } from "v-calendar";

import 'vue-datepicker-next/index.css';

import 'vue-datepicker-next/locale/zh-cn';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(setupCalendar, {});

app.mount("#app");
