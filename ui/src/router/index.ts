import Vue from "vue";
import routes from "@/router/routes";
import VueRouter from "vue-router";

if (!process || process.env.NODE_ENV !== "test") {
  Vue.use(VueRouter);
}

const router = new VueRouter({
  routes,
});

export default router;
