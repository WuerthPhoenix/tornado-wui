import { RouteConfig } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import ProcessingTree from "@/views/ProcessingTree.vue";

const routes: RouteConfig[] = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/tree",
    name: "Processing Tree",
    component: ProcessingTree,
  },
];

export default routes;
