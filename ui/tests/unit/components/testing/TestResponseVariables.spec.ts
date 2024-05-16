import {createLocalVue, createWrapper, mount} from "@vue/test-utils";
import TestResponseVariables from "@/components/testing/TestResponseVariables.vue";
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

describe("TestResponseVariables.vue", () => {

  it("renders an opened TestResponseVariables with extracted variables and click on 'Show variable in Ruleset' button", async () => {
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
            rules_count: 1,
            child_nodes: undefined,
            details: {
              type: "Ruleset",
              name: "ruleset1",
              rules: [rule1],
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

    const wrapper = mount(TestResponseVariables, {
      mocks: {
        $tc: (a: string) => a,
      },
      localVue,
    });

    // var1
    expect(
        wrapper
            .find(
                ".extracted-variables-container .rule .status"
            )
            .exists()
    ).toBeTruthy();
    expect(
        wrapper
            .find(
                ".extracted-variables-container .rule .status .circle"
            )
            .exists()
    ).toBeTruthy();

    expect(
        wrapper
            .find(
                ".extracted-variables-container .rule .variable-hover-icon"
            )
            .exists()
    ).toBeTruthy();

    wrapper.find('.extracted-variables-container .rule .variable-hover-icon').trigger("click");
    await wrapper.vm.$nextTick();

    const rootWrapper = createWrapper(wrapper.vm.$root);
    expect(rootWrapper.emitted('clickedExtractedVariable')).toBeTruthy();

  });
});
