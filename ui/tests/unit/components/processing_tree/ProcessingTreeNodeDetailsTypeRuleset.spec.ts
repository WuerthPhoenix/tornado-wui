import { createLocalVue, createWrapper, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import ProcessingTreeNodeDetailsTypeRuleset from "@/components/processing_tree/ProcessingTreeNodeDetailsTypeRuleset.vue";
// @ts-ignore
import { CvTabs, CvTab } from "@carbon/vue/src/components/cv-tabs";

import i18n from "@/utils/i18n";
import Tornado, {
  ProcessingTreeNodeDto,
  RuleCompleteDto,
} from "@/store/tornado";
import { EditRuleAction } from "@/actions/EditRuleAction";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);
localVue.use(CvTab);
localVue.use(CvTabs);

const factory = (propsData: Record<string, unknown>) => {
  return mount(ProcessingTreeNodeDetailsTypeRuleset, {
    propsData: {
      ...propsData,
    },
    localVue,
    mocks: {
      $tc: (a: string) => a,
    },
    computed: {},
  });
};

describe("ProcessingTreeNodeDetailsTypeRuleset.vue", () => {
  const mock = jest.spyOn(i18n, "tc");
  mock.mockImplementation((a) => a);

  it("renders a ProcessingTreeNodeDetailsTypeRuleset", () => {
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

    const wrapper = mount(ProcessingTreeNodeDetailsTypeRuleset, {
      propsData: {
        details,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".properties-grid").exists()).toBe(true);

    expect(wrapper.find(".properties-grid .name").text()).toBe(details.name);

    expect(wrapper.find(".ruleset-table-container")).toBeTruthy();
  });

  it("renders a loading ProcessingTreeNodeDetailsTypeFilter", () => {
    const wrapper = mount(ProcessingTreeNodeDetailsTypeRuleset, {
      propsData: {
        details: undefined,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
    });

    expect(wrapper.find(".properties-grid .bx--skeleton").exists()).toBe(true);
  });

  it("renders the ruleset properties in edit mode - check on the name", async () => {
    const details = {
      type: "Ruleset",
      name: "root",
      rules: [],
    };

    const wrapper = factory({ details: details, parentNodePath: [] });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".properties-grid .left-side .filter-name").exists()
    ).toBeTruthy();

    const nameInput = wrapper.find(
      ".properties-grid .left-side .filter-name input"
    );

    await nameInput.setValue("root with spaces");

    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(
          ".properties-grid .left-side .filter-name .bx--text-input--invalid"
        )
        .exists()
    ).toBeTruthy();
  });

  it("updates the filter's properties with validity check", async () => {
    const details = {
      type: "Ruleset",
      name: "root",
      rules: [],
    };

    const wrapper = factory({ details: details, parentNodePath: [] });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".properties-grid .left-side .filter-name").exists()
    ).toBeTruthy();

    const nameInput = wrapper.find(
      ".properties-grid .left-side .filter-name input"
    );

    await nameInput.setValue("new root");
    await wrapper.vm.$nextTick();
    (wrapper.vm as any).updateDetails();

    let emittedEvents = wrapper.emitted("update-details");
    expect(emittedEvents).toBeUndefined();

    await nameInput.setValue("new_root");
    (wrapper.vm as any).updateDetails();

    emittedEvents = wrapper.emitted("update-details");
    expect(emittedEvents).toBeTruthy();
    if (emittedEvents) {
      expect(emittedEvents.length).toBe(1);
      expect(emittedEvents[0][0].name).toBe("new_root");
    } else {
      fail("update-details not found");
    }
  });

  it("renders the ruleset properties in edit mode - focus but no changes", async () => {
    const details = {
      type: "Ruleset",
      name: "root",
      rules: [],
    };

    const wrapper = factory({ details: details, parentNodePath: [] });

    Tornado.setCurrentEditMode(true);

    await wrapper.vm.$nextTick();

    wrapper
      .find(".properties-grid .left-side .filter-name .bx--text-input")
      .trigger("click");

    await wrapper.vm.$nextTick();

    wrapper.find(".ruleset-details-container").trigger("click");

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update-details")).toBe(undefined);
  });

  it("renders the delete rule confirmation modal", async () => {
    const rule01: RuleCompleteDto = {
      name: "rule1",
      description: "",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const ruleToDelete: RuleCompleteDto = {
      name: "rule_02",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rootNode: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 2,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [ruleToDelete, rule01],
      },
    };

    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();

    const wrapper = factory({ details: rootNode.details, parentNodePath: [] });

    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".rules-table tbody tr").length).toBe(2);

    const confirmationModal = wrapper.find(".delete-rule-confirmation-modal");
    expect(confirmationModal.exists()).toBeTruthy();

    // Check if confirmation modal is not visible
    expect(
      confirmationModal.element.classList.contains("is-visible")
    ).toBeFalsy();

    // Click delete button on the rule row
    wrapper
      .find(
        ".rules-table tbody tr:nth-child(1) .actions-cell .delete-rule-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Check if confirmation modal is visible
    expect(
      confirmationModal.element.classList.contains("is-visible")
    ).toBeTruthy();

    // Click cancel button
    confirmationModal
      .find(".cv-button-set.bx--modal-footer button.bx--btn--secondary")
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Check if confirmation modal is not visible
    expect(
      confirmationModal.element.classList.contains("is-visible")
    ).toBeFalsy();

    // Open details of a rule
    wrapper.find(".rules-table tbody tr:nth-child(1) td").trigger("click");
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(".rule-animation-container .sliding-element")
        .element.classList.contains("slided")
    ).toBeTruthy();

    wrapper
      .find(".rule-details-container .action-bar .delete-rule-button")
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Check if confirmation modal is visible
    expect(
      confirmationModal.element.classList.contains("is-visible")
    ).toBeTruthy();

    // Click the delete button
    confirmationModal
      .find(".cv-button-set.bx--modal-footer button.bx--btn--primary")
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Check if confirmation modal is not visible
    expect(
      confirmationModal.element.classList.contains("is-visible")
    ).toBeFalsy();

    // Check if the rule details is now closed and the rules table is shown
    expect(
      wrapper
        .find(".rule-animation-container .sliding-element")
        .element.classList.contains("slided")
    ).toBeFalsy();

    expect(wrapper.findAll(".rules-table tbody tr").length).toBe(1);
    expect(
      wrapper.find(".rules-table tbody tr:nth-child(1) td:nth-child(4)").text()
    ).toBe(rule01.name);
  });

  it("adds a new rule", async () => {
    Tornado.actionsQueue.empty();
    const rootRuleset: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "root",
      rules_count: 0,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "root",
        rules: [
          {
            name: "rule1",
            description: "",
            continue: true,
            active: true,
            actions: [],
            operators_extractors_actions: undefined,
          },
        ],
      },
    };

    const wrapper = factory({
      details: rootRuleset.details,
      parentNodePath: [],
    });

    // Check actions queue
    const actionsQueue = Tornado.actionsQueue.queue;
    const queueLength = actionsQueue.length;

    Tornado.setDraftTree([rootRuleset]);
    Tornado.enableDraftConfiguration();
    Tornado.setOpenedNodeDetails([rootRuleset.name]);
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Click add rule button
    wrapper.find(".add-rule-action-container button").trigger("click");
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find(".sliding-element").element.classList.contains("slided")
    ).toBeTruthy();

    expect(wrapper.find(".selected-rule-name").text()).toBe("/ New_rule");
    const nameField = wrapper.find(".rule_name input").element as any;
    expect(nameField.value).toBe("New_rule");

    expect(Tornado.actionsQueue.queue.length).toBe(queueLength + 1);
  });

  it("edits the properties of a rule", async () => {
    Tornado.actionsQueue.empty();
    const rule01: RuleCompleteDto = {
      name: "rule1",
      description: "",
      continue: true,
      active: false,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rule02: RuleCompleteDto = {
      name: "rule_02",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rootNode: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 2,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [rule01, rule02],
      },
    };

    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();

    const wrapper = factory({ details: rootNode.details, parentNodePath: [] });

    Tornado.setOpenedNodeDetails([rootNode.name]);
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".rules-table tbody tr").length).toBe(2);

    // Click on the first rule
    wrapper.find(".rules-table tbody tr:nth-child(1) td").trigger("click");
    await wrapper.vm.$nextTick();

    // Check rule name
    const rule_name = wrapper.find(".rule-details-tabs .rule_name input");
    const rule_name_element = rule_name.element as any;
    expect(rule_name_element.value).toBe(rule01.name);
    expect(wrapper.find(".selected-rule-name").text()).toBe("/ " + rule01.name);

    // Check rule description
    const rule_description = wrapper.find(
      ".rule-details-tabs .rule_description input"
    );
    const rule_description_element = rule_description.element as any;
    expect(rule_description_element.value).toBe(rule01.description);

    // Check rule active
    const rule_active = wrapper.find(".active input[type='checkbox']");
    const rule_active_element = rule_active.element as any;
    expect(rule_active_element.value).toBe("" + rule01.active);

    // Check rule continue
    const rule_continue = wrapper.find(".continue input[type='checkbox']");
    const rule_continue_element = rule_continue.element as any;
    expect(rule_continue_element.value).toBe("" + rule01.continue);

    // Edit rule name
    const edited_rule_name = "edited_rule_name";
    rule_name.setValue(edited_rule_name);
    rule_name.trigger("blur");
    await wrapper.vm.$nextTick();

    // Edit rule description
    const edited_rule_description = "edited_rule_description";
    rule_description.setValue(edited_rule_description);
    rule_description.trigger("blur");
    await wrapper.vm.$nextTick();

    // Edit rule active
    rule_active.trigger("click");
    await wrapper.vm.$nextTick();

    // Edit rule continue
    rule_continue.trigger("click");
    await wrapper.vm.$nextTick();

    // Check if values are changed
    expect(rule_name_element.value).toBe(edited_rule_name);
    expect(wrapper.find(".selected-rule-name").text()).toBe(
      "/ " + edited_rule_name
    );
    expect(rule_description_element.value).toBe(edited_rule_description);
    expect(rule_active_element.value).toBe("" + !rule01.active);
    expect(rule_continue_element.value).toBe("" + !rule01.continue);

    // Go back to the rules list
    wrapper.find(".back-button").trigger("click");

    // Check if the rule name changed also in the rules list
    expect(
      wrapper.find(".rules-table tbody tr:nth-child(1) td:nth-child(4)").text()
    ).toBe(edited_rule_name);

    // Check actions queue
    const actionsQueue = Tornado.actionsQueue.queue;
    expect(actionsQueue.length).toBe(4);
    const editNameAction = actionsQueue[0] as EditRuleAction;
    expect(editNameAction.getType()).toBe("edit");
    expect(editNameAction.getTargetObject()).toBe("rule");
  });

  it("edits the where of a rule", async () => {
    Tornado.actionsQueue.empty();
    const rule01: RuleCompleteDto = {
      name: "rule1",
      description: "",
      continue: true,
      active: false,
      actions: [],
      operators_extractors_actions: undefined,
    };

    const rule02: RuleCompleteDto = {
      name: "rule_02",
      description: "test_rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: {
        where: {
          type: "AND",
          operators: [
            {
              type: "contains",
              first: "aaa",
              second: "bbb",
            },
          ],
        },
        with: [],
        actions: [],
      },
    };

    const rootNode: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 2,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [rule01, rule02],
      },
    };

    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();

    const wrapper = factory({ details: rootNode.details, parentNodePath: [] });

    Tornado.setOpenedNodeDetails([rootNode.name]);
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".rules-table tbody tr").length).toBe(2);

    // Click on the second rule
    wrapper.find(".rules-table tbody tr:nth-child(2) td").trigger("click");
    await wrapper.vm.$nextTick();

    // Click the Where tab
    wrapper.find("[role='tablist'] li:nth-child(1) button").trigger("click");
    await wrapper.vm.$nextTick();

    // Check the where condition
    expect(
      wrapper
        .find(
          ".where-operator .group-header .change-operator-type-btn .button-value"
        )
        .text()
    ).toBe("AND");
    expect(
      wrapper
        .find(
          ".where-operator .child-operators-container .where-operator .operator-container .operator-condition-container .button-value"
        )
        .text()
    ).toBe("CONTAINS");

    // Change the operators
    wrapper
      .find(
        ".where-operator .group-header .change-operator-type-btn .cv-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();
    wrapper
      .find(
        ".where-operator .group-header .change-operator-type-btn .overflow-menu li:nth-child(2) button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .find(
          ".where-operator .group-header .change-operator-type-btn .button-value"
        )
        .text()
    ).toBe("OR");

    // Check actions queue
    const actionsQueue = Tornado.actionsQueue.queue;
    expect(actionsQueue.length).toBe(1);
    const editNameAction = actionsQueue[0] as EditRuleAction;
    expect(editNameAction.getType()).toBe("edit");
    expect(editNameAction.getTargetObject()).toBe("rule");
  });

  it("edits the extractor modifiers", async () => {
    Tornado.actionsQueue.empty();

    const extractor01 = ExtractorFactory.createNewDefaultExtractor("var1");
    const modifier01 = ExtractorFactory.buildMapModifier([], "default");
    extractor01.postModifiers = [modifier01];

    const rule01: RuleCompleteDto = {
      name: "rule1",
      description: "",
      continue: true,
      active: false,
      actions: [],
      operators_extractors_actions: {
        with: [extractor01],
        where: null,
        actions: [],
      },
    };

    const rootNode: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 2,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [rule01],
      },
    };

    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();

    const wrapper = factory({ details: rootNode.details, parentNodePath: [] });

    Tornado.setOpenedNodeDetails([rootNode.name]);
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".rules-table tbody tr").length).toBe(1);

    // Click on the first rule
    wrapper.find(".rules-table tbody tr:nth-child(1) td").trigger("click");
    await wrapper.vm.$nextTick();

    // Click the With tab
    wrapper.find("[role='tablist'] li:nth-child(2) button").trigger("click");
    await wrapper.vm.$nextTick();

    // Check the With condition
    expect(
      (
        wrapper.find(".with-editor .variable textarea")
          .element as HTMLInputElement
      ).value
    ).toBe(`${extractor01.variable}`);

    // Open modifier
    wrapper
      .find(".with-editor .modifier-list .map-modifier button")
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Change default value
    wrapper
      .find(
        ".with-editor .modifier-list .map-modifier .default-value-value input"
      )
      .setValue("new_default_value");
    wrapper
      .find(
        ".with-editor .modifier-list .map-modifier .default-value-value input"
      )
      .trigger("blur");
    await wrapper.vm.$nextTick();

    // Check actions queue
    const actionsQueue = Tornado.actionsQueue.queue;
    expect(actionsQueue.length).toBe(1);
    const editNameAction = actionsQueue[0] as EditRuleAction;
    expect(editNameAction.getType()).toBe("edit");
    expect(editNameAction.getTargetObject()).toBe("rule");
  });

  it("Catch test window events", async () => {
    Tornado.actionsQueue.empty();
    const rule01: RuleCompleteDto = {
      name: "rule1",
      description: "",
      continue: true,
      active: true,
      actions: ["logger"],
      operators_extractors_actions: undefined,
    };

    const rootNode: ProcessingTreeNodeDto = {
      type: "Ruleset",
      name: "ruleset1",
      rules_count: 1,
      child_nodes: undefined,
      details: {
        type: "Ruleset",
        name: "ruleset1",
        rules: [rule01],
      },
    };

    Tornado.setDraftTree([rootNode]);
    Tornado.enableDraftConfiguration();

    const wrapper = factory({ details: rootNode.details, parentNodePath: [] });

    // Test case variable
    const rootWrapper = createWrapper(wrapper.vm.$root);
    wrapper.vm.$root.$emit("clickedExtractedVariable", {
      ruleName: "rule1",
      highlightTargetName: "randomVarName",
    });
    expect(rootWrapper.emitted("clickedExtractedVariable")).toBeTruthy();
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(".cv-tabs-button").at(2).classes()).toContain(
      "bx--tabs__nav-item--selected"
    );

    // Test case action
    wrapper.vm.$root.$emit("clickedTriggeredAction", {
      ruleName: "rule1",
      highlightTargetName: "logger",
    });
    expect(rootWrapper.emitted("clickedTriggeredAction")).toBeTruthy();
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll(".cv-tabs-button").at(3).classes()).toContain(
      "bx--tabs__nav-item--selected"
    );
  });
});
