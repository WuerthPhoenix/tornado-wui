import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import i18n from "@/utils/i18n";
import RulesetTable from "@/components/processing_tree/RulesetTable.vue";
import Tornado from "@/store/tornado";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("RulesetTable.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a RulesetTable", () => {
    const details = {
      type: "Ruleset",
      name: "ruleset1",
      rules: [
        {
          name: "rule1",
          description: "rule1 description",
          actions: ["archive", "foreach"],
          active: true,
          continue: true,
        },
        {
          name: "rule2",
          description: "rule2 description",
          actions: ["icinga2"],
          active: true,
          continue: false,
        },
      ],
    };

    const wrapper = mount(RulesetTable, {
      propsData: {
        details,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.find(".rules-table tbody tr:nth-child(1) td:nth-child(4)").text()
    ).toBe(details.rules[0].name);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) td:nth-child(5) .cv-tag:nth-child(1) span"
        )
        .text()
    ).toBe(details.rules[0].actions[0]);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) td:nth-child(5) .cv-tag:nth-child(2) span"
        )
        .text()
    ).toBe(details.rules[0].actions[1]);
    expect(
      wrapper.find(".rules-table tbody tr:nth-child(1) td:nth-child(6)").text()
    ).toBe(details.rules[0].description);
    expect(
      wrapper
        .find(".rules-table tbody tr:nth-child(1) td:nth-child(7) .cv-tag")
        .exists()
    ).toBe(true);

    expect(
      wrapper.find(".rules-table tbody tr:nth-child(2) td:nth-child(4)").text()
    ).toBe(details.rules[1].name);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(2) td:nth-child(5) .cv-tag:nth-child(1) span"
        )
        .text()
    ).toBe(details.rules[1].actions[0]);
    expect(
      wrapper.find(".rules-table tbody tr:nth-child(2) td:nth-child(6)").text()
    ).toBe(details.rules[1].description);
    expect(
      wrapper
        .find(".rules-table tbody tr:nth-child(2) td:nth-child(7) .cv-tag")
        .exists()
    ).toBe(false);
  });

  it("renders a loading RulesetTable", () => {
    const wrapper = mount(RulesetTable, {
      propsData: {
        details: undefined,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(
      wrapper.find(".ruleset-table-container .bx--skeleton").exists()
    ).toBe(true);
  });

  it("renders a RulesetTable after an event was tested with stop rule present", () => {
    const details = {
      type: "Ruleset",
      name: "ruleset1",
      rules: [
        {
          name: "rule1",
          description: "rule1 description",
          actions: ["script"],
          active: true,
          continue: true,
        },
        {
          name: "rule2",
          description: "rule2 description",
          actions: ["script"],
          active: true,
          continue: true,
        },
        {
          name: "rule3",
          description: "rule3 description",
          actions: ["script"],
          active: true,
          continue: true,
        },
        {
          name: "rule4",
          description: "rule4 description",
          actions: ["script"],
          active: false,
          continue: true,
        },
        {
          name: "rule5",
          description: "rule5 description",
          actions: ["icinga2"],
          active: false,
          continue: false,
        },
        {
          name: "rule6",
          description: "rule6 description",
          actions: ["icinga2"],
          active: true,
          continue: false,
        },
        {
          name: "rule7",
          description: "rule7 description",
          actions: ["icinga2"],
          active: false,
          continue: false,
        },
        {
          name: "rule8",
          description: "rule7 description",
          actions: ["icinga2"],
          active: true,
          continue: true,
        },
        {
          name: "rule9",
          description: "rule7 description",
          actions: ["icinga2"],
          active: true,
          continue: true,
        },
        {
          name: "rule10",
          description: "rule7 description",
          actions: ["icinga2"],
          active: true,
          continue: true,
        },
      ],
    };

    const eventRules = {
      rules: [
        {
          name: "rule1",
          status: "NotMatched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule2",
          status: "Matched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule3",
          status: "PartiallyMatched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule6",
          status: "Matched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule8",
          status: "NotMatched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule9",
          status: "Matched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule10",
          status: "PartiallyMatched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
      ],
    };

    const wrapper = mount(RulesetTable, {
      propsData: {
        details: details,
        rulesCount: 6,
        eventProcessedRules: eventRules,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    /*
      Rule #1, active rule with continue enabled and notmatched result, just show highlight (before, after lines)
    */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) td:nth-child(1) .match-cell.event-run .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) td:nth-child(1) .match-cell.event-run .match-icon img"
        )
        .exists()
    ).toBe(false);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) td:nth-child(1) .match-cell.event-run .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
      Rule #2, active rule with continue enabled and matched result, show highlight (before, after lines) and icon
    */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(2) td:nth-child(1) .match-cell.event-run.matched .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(2) td:nth-child(1) .match-cell.event-run.matched .match-icon img"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(2) td:nth-child(1) .match-cell.event-run.matched .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
      Rule #3, active rule with continue enabled and partiallymatched result, show highlight (before, after lines) and icon
    */

    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(3) td:nth-child(1) .match-cell.event-run.partially-matched .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(3) td:nth-child(1) .match-cell.event-run.partially-matched .match-icon img"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(3) td:nth-child(1) .match-cell.event-run.partially-matched .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
     Rule #4, disabled rule with continue enabled, show highlight (before, after lines)
   */

    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(4) td:nth-child(1) .match-cell.event-run .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(4) td:nth-child(1) .match-cell.event-run .match-icon img"
        )
        .exists()
    ).toBe(false);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(4) td:nth-child(1) .match-cell.event-run .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
     Rule #5, disabled rule with continue disabled, show highlight (before, after lines)
   */

    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(5) td:nth-child(1) .match-cell.event-run .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(5) td:nth-child(1) .match-cell.event-run .match-icon img"
        )
        .exists()
    ).toBe(false);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(5) td:nth-child(1) .match-cell.event-run .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
     Rule #6, active rule with continue disabled (stop rule, show highlight (before) and icon
   */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(6) td:nth-child(1) .match-cell.event-run.matched.event-blocked .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(6) td:nth-child(1) .match-cell.event-run.matched.event-blocked .match-icon img"
        )
        .exists()
    ).toBe(true);
    /*
     Rule #7, disabled rule with continue disabled show nothing (after stop rule)
   */
    expect(
      wrapper
        .find(".rules-table tbody tr:nth-child(7) td:nth-child(1) .match-cell")
        .exists()
    ).toBe(true);
    /*
     Rule #8, enabled rule with continue enabled, notmatched, show nothing (after stop rule)
   */
    expect(
      wrapper
        .find(".rules-table tbody tr:nth-child(8) td:nth-child(1) .match-cell")
        .exists()
    ).toBe(true);
    /*
     Rule #9, enabled rule with continue enabled, matched, show nothing (after stop rule)
   */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(9) td:nth-child(1) .match-cell.matched"
        )
        .exists()
    ).toBe(true);
    /*
     Rule #10, enabled rule with continue enabled, partially matched, show nothing (after stop rule)
   */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(10) td:nth-child(1) .match-cell.partially-matched"
        )
        .exists()
    ).toBe(true);
  });
  it("renders a RulesetTable after an event was tested without stop rule present", () => {
    const details = {
      type: "Ruleset",
      name: "ruleset1",
      rules: [
        {
          name: "rule1",
          description: "rule1 description",
          actions: ["script"],
          active: true,
          continue: true,
        },
        {
          name: "rule2",
          description: "rule2 description",
          actions: ["script"],
          active: true,
          continue: true,
        },
        {
          name: "rule3",
          description: "rule3 description",
          actions: ["script"],
          active: true,
          continue: true,
        },
        {
          name: "rule4",
          description: "rule4 description",
          actions: ["script"],
          active: false,
          continue: true,
        },
        {
          name: "rule5",
          description: "rule5 description",
          actions: ["icinga2"],
          active: false,
          continue: false,
        },
        {
          name: "rule7",
          description: "rule7 description",
          actions: ["icinga2"],
          active: false,
          continue: false,
        },
        {
          name: "rule8",
          description: "rule7 description",
          actions: ["icinga2"],
          active: true,
          continue: true,
        },
        {
          name: "rule9",
          description: "rule7 description",
          actions: ["icinga2"],
          active: true,
          continue: true,
        },
        {
          name: "rule10",
          description: "rule7 description",
          actions: ["icinga2"],
          active: true,
          continue: true,
        },
      ],
    };

    const eventRules = {
      rules: [
        {
          name: "rule1",
          status: "NotMatched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule2",
          status: "Matched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule3",
          status: "PartiallyMatched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule8",
          status: "NotMatched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule9",
          status: "Matched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
        {
          name: "rule10",
          status: "PartiallyMatched",
          actions: [],
          message: null,
          meta: { actions: [] },
        },
      ],
    };

    const wrapper = mount(RulesetTable, {
      propsData: {
        details: details,
        rulesCount: 6,
        eventProcessedRules: eventRules,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    /*
      Rule #1, active rule with continue enabled and notmatched result, just show highlight (before, after lines)
    */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) td:nth-child(1) .match-cell.event-run .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) td:nth-child(1) .match-cell.event-run .match-icon img"
        )
        .exists()
    ).toBe(false);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) td:nth-child(1) .match-cell.event-run .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
      Rule #2, active rule with continue enabled and matched result, show highlight (before, after lines) and icon
    */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(2) td:nth-child(1) .match-cell.event-run.matched .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(2) td:nth-child(1) .match-cell.event-run.matched .match-icon img"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(2) td:nth-child(1) .match-cell.event-run.matched .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
      Rule #3, active rule with continue enabled and partiallymatched result, show highlight (before, after lines) and icon
    */

    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(3) td:nth-child(1) .match-cell.event-run.partially-matched .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(3) td:nth-child(1) .match-cell.event-run.partially-matched .match-icon img"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(3) td:nth-child(1) .match-cell.event-run.partially-matched .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
     Rule #4, disabled rule with continue enabled, show highlight (before, after lines)
   */

    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(4) td:nth-child(1) .match-cell.event-run .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(4) td:nth-child(1) .match-cell.event-run .match-icon img"
        )
        .exists()
    ).toBe(false);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(4) td:nth-child(1) .match-cell.event-run .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
     Rule #5, disabled rule with continue disabled, show highlight (before, after lines)
   */

    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(5) td:nth-child(1) .match-cell.event-run .match-line-before"
        )
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(5) td:nth-child(1) .match-cell.event-run .match-icon img"
        )
        .exists()
    ).toBe(false);
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(5) td:nth-child(1) .match-cell.event-run .match-line-after"
        )
        .exists()
    ).toBe(true);

    /*
     Rule #6, disabled rule with continue disabled show highlight
   */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(6) td:nth-child(1) .match-cell.event-run"
        )
        .exists()
    ).toBe(true);
    /*
     Rule #7, enabled rule with continue enabled, notmatched, show highlight
   */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(7) td:nth-child(1) .match-cell.event-run"
        )
        .exists()
    ).toBe(true);
    /*
     Rule #8, enabled rule with continue enabled, matched, show highlight and icon
   */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(8) td:nth-child(1) .match-cell.matched.event-run"
        )
        .exists()
    ).toBe(true);
    /*
     Rule #9, enabled rule with continue enabled, partially matched, show highlight and icon
   */
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(9) td:nth-child(1) .match-cell.partially-matched.event-run"
        )
        .exists()
    ).toBe(true);
  });

  it("renders the add rule button", async () => {
    const details = {
      type: "Ruleset",
      name: "ruleset1",
      rules: [
        {
          name: "rule1",
          description: "rule1 description",
          actions: ["archive", "foreach"],
          active: true,
          continue: true,
        },
        {
          name: "rule2",
          description: "rule2 description",
          actions: ["icinga2"],
          active: true,
          continue: false,
        },
      ],
    };

    const wrapper = mount(RulesetTable, {
      propsData: {
        details,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the add rule button is present when edit mode is enabled
    expect(
      wrapper
        .find(
          ".rules-table .bx--toolbar-content .add-rule-action-container .cv-button"
        )
        .text()
    ).toBe("views.processing_tree.add_rule");

    // Disable edit mode
    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();

    // Check if the add rule button is NOT present when edit mode is disabled
    expect(
      wrapper
        .find(
          ".rules-table .bx--toolbar-content .add-rule-action-container .cv-button"
        )
        .exists()
    ).toBeFalsy();
  });

  it("renders the delete rule button", async () => {
    const details = {
      type: "Ruleset",
      name: "ruleset1",
      rules: [
        {
          name: "rule1",
          description: "rule1 description",
          actions: ["archive", "foreach"],
          active: true,
          continue: true,
        },
        {
          name: "rule2",
          description: "rule2 description",
          actions: ["icinga2"],
          active: true,
          continue: false,
        },
      ],
    };

    const wrapper = mount(RulesetTable, {
      propsData: {
        details,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the delete rule button is present when edit mode is enabled
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) .actions-cell .delete-rule-button"
        )
        .exists()
    ).toBeTruthy();

    // Disable edit mode
    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();

    // Check if the add rule button is NOT present when edit mode is disabled
    expect(
      wrapper
        .find(
          ".rules-table tbody tr:nth-child(1) .actions-cell .delete-rule-button"
        )
        .exists()
    ).toBeFalsy();
  });
});
