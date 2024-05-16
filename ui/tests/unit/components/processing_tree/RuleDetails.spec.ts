import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import RuleDetails from "@/components/processing_tree/RuleDetails.vue";
import Tornado, { RuleCompleteDto } from "@/store/tornado";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";
import { cloneDeep } from "lodash";
import { ActionFactory } from "@/core/Action/ActionFactory";
import { Icinga2Payload, ScriptPayload } from "@/core/Action/Payload";
import { ScriptAction, Icinga2Action } from "@/core/Action/Actions";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);
const regex = ExtractorFactory.createDefaultRegexDetails("Regex");
const extractor = ExtractorFactory.buildDefault(
  regex,
  [],
  "subject",
  "${event.payload.subject}"
);
const rule: RuleCompleteDto = {
  name: "rule1",
  description: "This is a rule",
  continue: true,
  active: true,
  actions: [],
  operators_extractors_actions: {
    where: {
      type: "AND",
      operators: [
        {
          type: "equals",
          first: "foo",
          second: "bar",
        },
      ],
    },
    with: [extractor],
    actions: [],
  },
};

describe("RuleDetails.vue", () => {
  it("renders a RuleDetails", () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    expect(wrapper.find(".action-bar").exists()).toBeTruthy();
    expect(wrapper.find(".action-bar .back-button").exists()).toBeTruthy();
  });

  it("renders a loading RuleDetails", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule: null,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    // Properties tab
    expect(
      wrapper.findAll(
        ".cv-tab:nth-child(1) .properties-grid .bx--number.bx--skeleton"
      ).length
    ).toBe(2);
    expect(
      wrapper.findAll(
        ".cv-tab:nth-child(1) .properties-grid .bx--toggle__label.bx--skeleton"
      ).length
    ).toBe(2);

    // Where tab
    expect(
      wrapper.findAll(
        ".cv-tab:nth-child(2) .bx--skeleton__text.bx--skeleton__heading"
      ).length
    ).toBe(3);

    // With tab
    expect(
      wrapper.findAll(
        ".cv-tab:nth-child(3) .bx--skeleton__text.bx--skeleton__heading"
      ).length
    ).toBe(3);

    // Actions tab
    expect(
      wrapper.findAll(
        ".cv-tab:nth-child(4) .bx--skeleton__text.bx--skeleton__heading"
      ).length
    ).toBe(3);
  });

  it("renders properties tab", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    await wrapper.vm.$nextTick(() => {
      expect(
        wrapper.find(".cv-tabs .cv-tabs-button:nth-child(1) button").text()
      ).toBe("views.processing_tree.properties");
    });

    expect(
      wrapper.find(".cv-tab:nth-child(1) .properties-grid").exists()
    ).toBeTruthy();

    expect(
      wrapper.find(".cv-tab:nth-child(1) .properties-grid .name").text()
    ).toBe(rule.name);

    expect(
      wrapper.find(".cv-tab:nth-child(1) .properties-grid .description").text()
    ).toBe(rule.description);

    expect(
      wrapper.find(".cv-tab:nth-child(1) .properties-grid .active").exists()
    ).toBeTruthy();

    expect(
      wrapper.find(".cv-tab:nth-child(1) .properties-grid .continue").exists()
    ).toBeTruthy();
  });

  it("renders where tab", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    await wrapper.vm.$nextTick(() => {
      expect(
        wrapper.find(".cv-tabs .cv-tabs-button:nth-child(2) button").text()
      ).toBe("views.processing_tree.where");

      expect(
        wrapper.find(".cv-tab:nth-child(2) .where-editor").exists()
      ).toBeTruthy();
    });
  });

  it("renders with tab", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    await wrapper.vm.$nextTick(() => {
      expect(
        wrapper.find(".cv-tabs .cv-tabs-button:nth-child(3) button").text()
      ).toBe("views.processing_tree.with");

      expect(
        wrapper.find(".cv-tab:nth-child(3) .with-editor").exists()
      ).toBeTruthy();
    });
  });

  it("renders actions tab", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    await wrapper.vm.$nextTick(() => {
      expect(
        wrapper.find(".cv-tabs .cv-tabs-button:nth-child(4) button").text()
      ).toBe("views.processing_tree.actions");

      expect(
        wrapper.find(".cv-tab:nth-child(4) .actions-editor").exists()
      ).toBeTruthy();
    });
  });

  it("renders the delete rule button", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the delete rule button is present when edit mode is enabled
    expect(
      wrapper.find(".action-bar .delete-rule-button").exists()
    ).toBeTruthy();

    // Disable edit mode
    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();

    // Check if the add rule button is NOT present when edit mode is disabled
    expect(
      wrapper.find(".action-bar .delete-rule-button").exists()
    ).toBeFalsy();
  });

  it("renders inputs in edit mode", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the delete rule button is present when edit mode is enabled
    expect(
      wrapper
        .find("div.bx--text-input__field-wrapper input.bx--text-input")
        .exists()
    ).toBeTruthy();
  });

  it("Test delete button of an extractor", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the extractor entry is present
    expect(
      wrapper.find(".with-editor .with-extractor-container").exists()
    ).toBeTruthy();

    // Delete extractor
    wrapper
      .find(
        ".with-editor .with-extractor-container .variable .delete-rule-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Ensure that the extractor has been deleted
    expect(
      wrapper.find(".with-editor .with-extractor-container").exists()
    ).toBeFalsy();
  });

  it("Test edit of an extractor variable in not edit mode", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });
    Tornado.setCurrentEditMode(false);
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .find(".with-editor .with-extractor-container .variable textarea")
        .exists()
    ).toBeFalsy();
  });

  it("Test edit of an extractor variable", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });
    const regex = ExtractorFactory.createDefaultRegexDetails("Regex");
    const newValue = "new variable name";
    const expectedExtractor = ExtractorFactory.buildDefault(
      regex,
      [],
      newValue,
      "${event.payload.subject}"
    );
    const oldExtractor = ExtractorFactory.buildDefault(
      regex,
      [],
      "subject",
      "${event.payload.subject}"
    );

    const expectedEvent = [
      [
        {
          newRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [expectedExtractor],
            },
          },
          oldRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [oldExtractor],
            },
          },
        },
      ],
    ];

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the extractor entry is present
    expect(
      wrapper.find(".with-editor .with-extractor-container").exists()
    ).toBeTruthy();

    // Enter the extractor variable edit mode
    wrapper
      .find(".with-editor .with-extractor-container .variable")
      .trigger("click");
    await wrapper.vm.$nextTick();

    const textarea = wrapper.find(
      ".with-editor .with-extractor-container .variable textarea"
    );
    textarea.setValue(newValue);
    textarea.trigger("blur");
    await wrapper.vm.$nextTick();

    // Ensure that the extractor has been deleted
    expect(
      (
        wrapper.find(
          ".with-editor .with-extractor-container .variable textarea"
        ).element as any
      ).value
    ).toBe(newValue);

    const updateRuleEvent = wrapper.emitted("updateRule") as any;
    expect(updateRuleEvent).toStrictEqual(expectedEvent);
  });

  it("Test edit of an extractor match", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });
    const newMatch = "123";

    const regex = ExtractorFactory.createDefaultRegexDetails("Regex");
    const expectedRegex = ExtractorFactory.buildRegexDetails(
      "Regex",
      newMatch,
      false
    );

    const expectedExtractor = ExtractorFactory.buildDefault(
      expectedRegex,
      [],
      "subject",
      "${event.payload.subject}"
    );
    const oldExtractor = ExtractorFactory.buildDefault(
      regex,
      [],
      "subject",
      "${event.payload.subject}"
    );

    const expectedEvent = [
      [
        {
          newRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [expectedExtractor],
            },
          },
          oldRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [oldExtractor],
            },
          },
        },
      ],
    ];

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the extractor entry is present
    expect(
      wrapper.find(".regex-expression--editable input").exists()
    ).toBeTruthy();

    // Enter the extractor match edit mode
    wrapper.find(".regex-expression--editable input").trigger("click");
    await wrapper.vm.$nextTick();

    const textarea = wrapper.find(".regex-expression--editable input");
    textarea.setValue(newMatch);
    textarea.trigger("blur");
    await wrapper.vm.$nextTick();

    // Ensure that the extractor has been deleted
    expect(
      (wrapper.find(".regex-expression--editable input").element as any).value
    ).toBe(newMatch);

    const updateRuleEvent = wrapper.emitted("updateRule") as any;
    expect(updateRuleEvent).toStrictEqual(expectedEvent);
  });

  it("Test edit of an extractor allMatches", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });
    const newAllMatches = true;

    const regex = ExtractorFactory.createDefaultRegexDetails("Regex");
    const expectedRegex = ExtractorFactory.buildRegexDetails(
      "Regex",
      ".*",
      newAllMatches
    );

    const expectedExtractor = ExtractorFactory.buildDefault(
      expectedRegex,
      [],
      "subject",
      "${event.payload.subject}"
    );
    const oldExtractor = ExtractorFactory.buildDefault(
      regex,
      [],
      "subject",
      "${event.payload.subject}"
    );

    const expectedEvent = [
      [
        {
          newRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [expectedExtractor],
            },
          },
          oldRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [oldExtractor],
            },
          },
        },
      ],
    ];

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the extractor entry is present
    expect(wrapper.find(".all-matches-value").exists()).toBeTruthy();

    // Enter the extractor match edit mode
    wrapper.find(".all-matches-value").trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".all-matches-value").text()).toBe("" + newAllMatches);

    const updateRuleEvent = wrapper.emitted("updateRule") as any;
    expect(updateRuleEvent).toStrictEqual(expectedEvent);
  });

  it("Test edit of an extractor matchIDx", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });
    const newMatchIDx = 2;

    const regex = ExtractorFactory.createDefaultRegexDetails("Regex");
    const expectedRegex = ExtractorFactory.buildRegexDetails(
      "Regex",
      ".*",
      false,
      newMatchIDx
    );

    const expectedExtractor = ExtractorFactory.buildDefault(
      expectedRegex,
      [],
      "subject",
      "${event.payload.subject}"
    );
    const oldExtractor = ExtractorFactory.buildDefault(
      regex,
      [],
      "subject",
      "${event.payload.subject}"
    );

    const expectedEvent = [
      [
        {
          newRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [expectedExtractor],
            },
          },
          oldRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [oldExtractor],
            },
          },
        },
      ],
    ];

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the extractor entry is present
    expect(
      wrapper.find(".group-match-idx-value--editable input").exists()
    ).toBeTruthy();

    // Enter the extractor match edit mode
    wrapper.find(".group-match-idx-value--editable input").trigger("click");
    await wrapper.vm.$nextTick();

    const idx = wrapper.find(".group-match-idx-value--editable input");
    idx.setValue(newMatchIDx);
    idx.trigger("blur");
    await wrapper.vm.$nextTick();

    // Ensure that the extractor has been deleted
    expect(
      (wrapper.find(".group-match-idx-value--editable input").element as any)
        .value
    ).toBe("" + newMatchIDx);

    const updateRuleEvent = wrapper.emitted("updateRule") as any;
    expect(updateRuleEvent).toStrictEqual(expectedEvent);
  });

  it("Test extractor type dropdown", async () => {
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the extractor type button exist
    expect(
      wrapper
        .find(
          ".with-editor .with-extractor-container .regex-container .condition-dropdown-button"
        )
        .exists()
    ).toBeTruthy();

    // Click on select type
    wrapper
      .find(
        ".with-editor .with-extractor-container .regex-container .condition-dropdown-button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    // click on second element (KeyRegex)
    wrapper
      .find(
        ".with-editor .with-extractor-container .regex-container .condition-dropdown-button .cv-dropdown-item:nth-child(2) a"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Ensure that the extractor type has changed in "KeyRegex"
    expect(
      wrapper
        .find(
          ".with-editor .with-extractor-container .regex-container .condition-dropdown-button .bx--dropdown__wrapper .bx--dropdown > button span"
        )
        .text()
    ).toBe("editor.single_key_match");
  });

  it("delete an action", async () => {
    const action = ActionFactory.buildDefaultLoggerAction();

    const rule: RuleCompleteDto = {
      name: "rule1",
      description: "This is a rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: {
        where: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
          ],
        },
        with: [extractor],
        actions: [action, action],
      },
    };

    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".actions-editor .action").length).toBe(2);

    wrapper
      .find(
        ".actions-editor .action:nth-child(1) .overflow-menu-container button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    // Delete action
    wrapper
      .find(
        ".actions-editor .action:nth-child(1) .overflow-menu-container .bx--overflow-menu-options__option--danger button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".actions-editor .action").length).toBe(1);

    // Check emitted event
    const newRule = cloneDeep(rule);
    newRule.operators_extractors_actions?.actions.pop();
    const expectedEvent = [
      [
        {
          newRule,
          oldRule: rule,
        },
      ],
    ];
    const updateRuleEvent = wrapper.emitted("updateRule") as any;
    expect(updateRuleEvent).toStrictEqual(expectedEvent);
  });

  it("Test edit of a script action", async () => {
    const scriptOldValue = "/usr/bin/cp";
    const argsOldValue = [
      "--recursive",
      "/folder/to/copy",
      "/destination/folder/",
    ];
    const scriptNewValue = "/usr/bin/mv";
    const argsNewValue = ["-R", "/folder/to/copy", "/destination/folder/"];
    const rule: RuleCompleteDto = {
      name: "rule1",
      description: "This is a rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: {
        where: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
          ],
        },
        with: [],
        actions: [
          new ScriptAction(new ScriptPayload(scriptOldValue, argsOldValue)),
        ],
      },
    };
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    const expectedEvent = [
      {
        newRule: {
          actions: [],
          active: true,
          continue: true,
          description: "This is a rule",
          name: "rule1",
          operators_extractors_actions: {
            actions: [
              new ScriptAction(new ScriptPayload(scriptNewValue, argsNewValue)),
            ],
            where: {
              operators: [{ first: "foo", second: "bar", type: "equals" }],
              type: "AND",
            },
            with: [],
          },
        },
        oldRule: {
          actions: [],
          active: true,
          continue: true,
          description: "This is a rule",
          name: "rule1",
          operators_extractors_actions: {
            actions: [
              new ScriptAction(new ScriptPayload(scriptOldValue, argsOldValue)),
            ],
            where: {
              operators: [{ first: "foo", second: "bar", type: "equals" }],
              type: "AND",
            },
            with: [],
          },
        },
      },
    ];

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the extractor entry is present
    expect(
      wrapper.find(".action .action-properties-container").exists()
    ).toBeTruthy();

    const firtParamEditableContainer = wrapper.find(
      ".action .action-properties-container .payload-property-container:nth-child(1) .operator-value.editable"
    );
    expect(firtParamEditableContainer.exists()).toBeTruthy();
    firtParamEditableContainer.trigger("click");
    await wrapper.vm.$nextTick();

    const scriptTextarea = wrapper.find(
      ".action .action-properties-container .payload-property-container:nth-child(1) .editable-operator-value textarea"
    );
    scriptTextarea.setValue(scriptNewValue);
    scriptTextarea.trigger("blur");
    await wrapper.vm.$nextTick();

    const params = wrapper.find(
      ".action .action-properties-container .payload-property-container:nth-child(2) .params"
    );
    const firstParam = params.find(
      ".params__param:nth-child(1) .resizable__input"
    );
    const secondParam = params.find(
      ".params__param:nth-child(2) .resizable__input"
    );
    const thirdParam = params.find(
      ".params__param:nth-child(3) .resizable__input"
    );

    firstParam.setValue(argsNewValue[0]);
    secondParam.setValue(argsNewValue[1]);
    thirdParam.setValue(argsNewValue[2]);
    firstParam.trigger("blur");
    await wrapper.vm.$nextTick();

    const updateRuleEvent = wrapper.emitted("updateRule") as any;
    expect(updateRuleEvent[1]).toStrictEqual(expectedEvent);
  });

  it("Add an action", async () => {
    const action = ActionFactory.buildDefaultLoggerAction();

    const rule: RuleCompleteDto = {
      name: "rule1",
      description: "This is a rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: {
        where: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
          ],
        },
        with: [extractor],
        actions: [action],
      },
    };

    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".actions-editor .add-action-btn").length).toBe(1);

    wrapper.findAll(".actions-editor .add-action-btn button").trigger("click");
    await wrapper.vm.$nextTick();

    // Add action
    wrapper
      .findAll(
        ".actions-editor .add-action-btn .overflow-menu li:nth-child(2) button"
      )
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".actions-editor .action").length).toBe(2);

    // Check emitted event
    const newRule = cloneDeep(rule);
    const archiveAction = ActionFactory.buildDefaultArchiveAction();
    newRule.operators_extractors_actions?.actions.push(archiveAction);
    const expectedEvent = [
      [
        {
          newRule,
          oldRule: rule,
        },
      ],
    ];
    const updateRuleEvent = wrapper.emitted("updateRule") as any;
    expect(updateRuleEvent).toStrictEqual(expectedEvent);
  });

  it.skip("Test edit of an Icinga2 action", async () => {
    const icinga2ActionNameOldValue = "test-old-action";
    const icinga2ActionPayloadOldValue = {
      exit_status: "0|1",
    };
    const icinga2ActionNameNewValue = "test-new-action";
    const icinga2ActionPayloadNewValue = {
      exit_status: "2|3",
    };
    const rule: RuleCompleteDto = {
      name: "rule1",
      description: "This is a rule",
      continue: true,
      active: true,
      actions: [],
      operators_extractors_actions: {
        where: {
          type: "AND",
          operators: [
            {
              type: "equals",
              first: "foo",
              second: "bar",
            },
          ],
        },
        with: [],
        actions: [
          new Icinga2Action(
            new Icinga2Payload(
              icinga2ActionNameOldValue,
              icinga2ActionPayloadOldValue
            )
          ),
        ],
      },
    };
    const wrapper = mount(RuleDetails, {
      propsData: {
        rule,
      },
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      computed: {},
    });

    const expectedEvent = [
      [
        {
          newRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [
                new Icinga2Action(
                  new Icinga2Payload(
                    icinga2ActionNameNewValue,
                    icinga2ActionPayloadNewValue
                  )
                ),
              ],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [],
            },
          },
          oldRule: {
            actions: [],
            active: true,
            continue: true,
            description: "This is a rule",
            name: "rule1",
            operators_extractors_actions: {
              actions: [
                new Icinga2Action(
                  new Icinga2Payload(
                    icinga2ActionNameOldValue,
                    icinga2ActionPayloadOldValue
                  )
                ),
              ],
              where: {
                operators: [{ first: "foo", second: "bar", type: "equals" }],
                type: "AND",
              },
              with: [],
            },
          },
        },
      ],
    ];

    // Enable edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    // Check if the extractor entry is present
    expect(
      wrapper.find(".action .action-properties-container").exists()
    ).toBeTruthy();

    const scriptTextarea = wrapper.find(
      ".action .action-properties-container .payload-property-container:nth-child(1) .editable-operator-value input"
    );
    scriptTextarea.setValue(icinga2ActionNameNewValue);
    const argsTextarea = wrapper.find(
      ".action .action-properties-container .payload-property-container:nth-child(2) .editable-operator-value input"
    );
    argsTextarea.setValue(icinga2ActionPayloadNewValue);
    scriptTextarea.trigger("blur");
    await wrapper.vm.$nextTick();

    const updateRuleEvent = wrapper.emitted("updateRule") as any;
    expect(updateRuleEvent).toStrictEqual(expectedEvent);
  });
});
