import { createLocalVue, mount } from "@vue/test-utils";
import TestResults from "@/components/testing/TestResults.vue";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import Tornado, {
  ProcessingTreeNodeDto,
  RuleCompleteDto,
} from "@/store/tornado";
import {
  ProcessedEventDto,
  ProcessedNodeDto,
  ProcessedRuleDto,
} from "tornado-backend-dto";

import {
  ProcessedRuleStatusDto,
  ProcessedFilterStatusDto,
} from "@/utils/TornadoDtoEnum";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("TestResults.vue", () => {
  it("renders an opened TestResults with extracted variables", () => {
    const processedRule: ProcessedRuleDto = {
      name: "rule1",
      status: ProcessedRuleStatusDto.Matched,
      actions: [],
      message: "",
      meta: {
        actions: [],
      },
    };

    const processedRuleset: ProcessedNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules: {
        rules: [processedRule],
        extracted_vars: {
          rule1: {
            var1: "value1",
            var2: "value2",
          },
          rule2: {
            var3: "value3",
          },
        },
      },
    };

    const processedRoot: ProcessedNodeDto = {
      type: "Filter",
      name: "root",
      filter: {
        status: ProcessedFilterStatusDto.Matched,
      },
      nodes: [processedRuleset],
    };

    const processedEvent: ProcessedEventDto = {
      event: {
        type: "email",
        created_ms: 123456789,
        payload: {},
        metadata: {},
      },
      result: processedRoot,
    };

    const rule1: RuleCompleteDto = {
      name: "rule1",
      description: "rule1",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rule2: RuleCompleteDto = {
      name: "rule2",
      description: "rule2",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const processingTree: ProcessingTreeNodeDto[] = [
      {
        type: "Filter",
        name: "root",
        children_count: 1,
        rules_count: 5,
        description: "Root description",
        child_nodes: [
          {
            type: "Ruleset",
            name: "ruleset1",
            rules_count: 2,
            child_nodes: undefined,
            details: {
              type: "Ruleset",
              name: "ruleset1",
              rules: [rule1, rule2],
            },
          },
        ],
        details: undefined,
        active: true,
      },
    ];
    Tornado.initializeCurrentTree(processingTree);
    Tornado.setProcessedEvent(processedEvent);
    Tornado.setOpenedNodeDetails(["root", "ruleset1"]);

    const wrapper = mount(TestResults, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    expect(wrapper.findAll(".test-results-tab--variables .rule").length).toBe(
      3
    );

    // var1
    expect(
      wrapper
        .find(".test-results-tab--variables .rule:nth-child(1) .status")
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(".test-results-tab--variables .rule:nth-child(1) .status .circle")
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(".test-results-tab--variables .rule:nth-child(1) .variable-name")
        .text()
    ).toBe("var1");
    expect(
      wrapper
        .find(".test-results-tab--variables .rule:nth-child(1) .variable-value")
        .text()
    ).toBe("value1");

    // var2
    expect(
      wrapper
        .find(".test-results-tab--variables .rule:nth-child(2) .status")
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(".test-results-tab--variables .rule:nth-child(2) .status .circle")
        .exists()
    ).toBeTruthy();
    expect(
      wrapper
        .find(".test-results-tab--variables .rule:nth-child(2) .variable-name")
        .text()
    ).toBe("var2");
    expect(
      wrapper
        .find(".test-results-tab--variables .rule:nth-child(2) .variable-value")
        .text()
    ).toBe("value2");
  });

  it("renders an opened TestResults with extracted variables and a rule selected", async () => {
    const processedRule: ProcessedRuleDto = {
      name: "rule1",
      status: ProcessedRuleStatusDto.Matched,
      actions: [],
      message: "",
      meta: {
        actions: [],
      },
    };

    const processedRuleset: ProcessedNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules: {
        rules: [processedRule],
        extracted_vars: {
          rule1: {
            var1: "value1",
            var2: "value2",
          },
          rule2: {
            var3: "value3",
          },
          rule3: {
            var4: "value4",
          },
        },
      },
    };

    const processedRoot: ProcessedNodeDto = {
      type: "Filter",
      name: "root",
      filter: {
        status: ProcessedFilterStatusDto.Matched,
      },
      nodes: [processedRuleset],
    };

    const processedEvent: ProcessedEventDto = {
      event: {
        type: "email",
        created_ms: 123456789,
        payload: {},
        metadata: {},
      },
      result: processedRoot,
    };

    const rule1: RuleCompleteDto = {
      name: "rule1",
      description: "rule1",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rule2: RuleCompleteDto = {
      name: "rule2",
      description: "rule2",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rule3: RuleCompleteDto = {
      name: "rule3",
      description: "rule3",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const processingTree: ProcessingTreeNodeDto[] = [
      {
        type: "Filter",
        name: "root",
        children_count: 1,
        rules_count: 5,
        description: "Root description",
        child_nodes: [
          {
            type: "Ruleset",
            name: "ruleset1",
            rules_count: 2,
            child_nodes: undefined,
            details: {
              type: "Ruleset",
              name: "ruleset1",
              rules: [rule1, rule2, rule3],
            },
          },
        ],
        details: undefined,
        active: true,
      },
    ];

    Tornado.initializeCurrentTree(processingTree);
    Tornado.setProcessedEvent(processedEvent);
    Tornado.setOpenedNodeDetails(["root", "ruleset1"]);

    Tornado.setSelectedRuleName("rule2");

    const wrapper = mount(TestResults, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".test-results-tab--variables .rule").length).toBe(
      4
    );

    // var1
    expect(
      wrapper
        .findAll(".test-results-tab--variables .rule")
        .at(0)
        .find(".status")
        .classes()
    ).not.toContain("extracted");

    // var2
    expect(
      wrapper
        .findAll(".test-results-tab--variables .rule")
        .at(1)
        .find(".status")
        .classes()
    ).not.toContain("extracted");

    // var3
    expect(
      wrapper
        .findAll(".test-results-tab--variables .rule")
        .at(2)
        .find(".status")
        .classes()
    ).toContain("extracted");
    expect(
      wrapper
        .findAll(
          ".test-results-tab--variables .rule .status .circle.variable-extracted-current-rule"
        )
        .exists()
    ).toBeTruthy();

    // var4
    expect(
      wrapper
        .findAll(".test-results-tab--variables .rule")
        .at(3)
        .find(".status")
        .classes()
    ).not.toContain("extracted");
  });

  it("renders an opened TestResults with no extracted variables found", () => {
    const processedRule: ProcessedRuleDto = {
      name: "rule1",
      status: ProcessedRuleStatusDto.Matched,
      actions: [],
      message: "",
      meta: {
        actions: [],
      },
    };

    const processedRuleset: ProcessedNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules: {
        rules: [processedRule],
        extracted_vars: {},
      },
    };

    const processedRoot: ProcessedNodeDto = {
      type: "Filter",
      name: "root",
      filter: {
        status: ProcessedFilterStatusDto.Matched,
      },
      nodes: [processedRuleset],
    };

    const processedEvent: ProcessedEventDto = {
      event: {
        type: "email",
        created_ms: 123456789,
        payload: {},
        metadata: {},
      },
      result: processedRoot,
    };

    const rule1: RuleCompleteDto = {
      name: "rule1",
      description: "rule1",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rule2: RuleCompleteDto = {
      name: "rule2",
      description: "rule2",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const processingTree: ProcessingTreeNodeDto[] = [
      {
        type: "Filter",
        name: "root",
        children_count: 1,
        rules_count: 5,
        description: "Root description",
        child_nodes: [
          {
            type: "Ruleset",
            name: "ruleset1",
            rules_count: 2,
            child_nodes: undefined,
            details: {
              type: "Ruleset",
              name: "ruleset1",
              rules: [rule1, rule2],
            },
          },
        ],
        details: undefined,
        active: true,
      },
    ];

    Tornado.initializeCurrentTree(processingTree);
    Tornado.setProcessedEvent(processedEvent);
    Tornado.setOpenedNodeDetails(["root", "ruleset1"]);

    const wrapper = mount(TestResults, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    expect(wrapper.findAll(".test-results-tab--variables .rule").length).toBe(
      0
    );
    expect(wrapper.find(".no-extracted-variables-message").text()).toBe(
      "test_window.no_extracted_variables_found"
    );
  });
});
