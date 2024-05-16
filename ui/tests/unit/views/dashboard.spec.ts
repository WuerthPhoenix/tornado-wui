import { createLocalVue, mount } from "@vue/test-utils";
import Dashboard from "@/views/Dashboard.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("Dashboard", () => {
  it("It should render the dashboard grid", () => {
    const wrapper = mount(Dashboard, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });
    expect(wrapper.find(".dashboard .cv-grid").exists()).toBe(true);
  });
});
