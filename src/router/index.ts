import { createRouter, createWebHistory } from "vue-router";
import AddScheduleView from "../views/AddScheduleView.vue";
import AddTeacherView from "../views/AddTeacherView.vue";
import AddClassView from "../views/AddClassView.vue";
import AddStudentView from "../views/AddStudentView.vue";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: AddScheduleView,
    },
    {
      path: "/add-schedule",
      name: "add-schedule",
      component: AddScheduleView,
    },
    {
      path: "/add-teacher",
      name: "add-teacher",
      component: AddTeacherView,
    },
    {
      path: "/add-class",
      name: "add-class",
      component: AddClassView,
    },
    {
      path: "/add-student",
      name: "add-student",
      component: AddStudentView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
  ],
});

export default router;
