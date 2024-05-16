import { mount, createLocalVue } from "@vue/test-utils";
import App from "@/App.vue";
import VueRouter from "vue-router";
import routes from "@/router/routes";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd";

const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(CarbonComponentsVue);

/**
 * This test checks the routing paths
 */

describe("Routing", () => {
  it("It should render the dashboard page", async () => {
    const router = new VueRouter({ mode: "abstract", routes });

    const wrapper = mount(App, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      data() {
        return { ready: true };
      },
    });

    await router.push("/");
    await wrapper.vm.$nextTick();

    expect(wrapper.html()).toContain("dashboard");
  });

  it("It should render the processing tree page", async () => {
    const router = new VueRouter({ mode: "abstract", routes });

    const wrapper = mount(App, {
      localVue,
      router,
      mocks: {
        $tc: (a: string) => a,
      },
      data() {
        return { ready: true };
      },
    });

    await router.push("/tree");
    await wrapper.vm.$nextTick();

    expect(wrapper.html()).toContain("processing_tree");
  });
});
