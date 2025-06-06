import { createRouter, createWebHistory } from "vue-router";
import ClassScheduleView from "../views/ClassScheduleView.vue";
import AddTeacherView from "../views/AddTeacherView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: ClassScheduleView,
    },
    {
      path: "/class/schedule",
      name: "class-schedule",
      component: ClassScheduleView,
    },
    {
      path: "/add-teacher",
      name: "add-teacher",
      component: AddTeacherView,
    },
  ],
});

export default router;
