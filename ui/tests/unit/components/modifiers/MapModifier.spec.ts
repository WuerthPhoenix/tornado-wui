import { createLocalVue, mount } from "@vue/test-utils";
// @ts-ignore
import CarbonComponentsVue from "@carbon/vue/dist/carbon-vue.umd.js";
import { MapDetails } from "@/core/Extractor/Modifiers";
import MapModifier from "@/components/modifiers/MapModifier.vue";
import Tornado from "@/store/tornado";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";

const localVue = createLocalVue();
localVue.use(CarbonComponentsVue);

describe("MapModifier.vue", () => {
  it("render a MapModifier", async () => {
    const mapModifier = ExtractorFactory.buildMapModifier(
      [{ key: "my_key", value: "my_value" }],
      "default"
    );
    const mapDetails = mapModifier.details as MapDetails;
    const mapValue = mapDetails.mapping[0];

    const wrapper = mount(MapModifier, {
      localVue,
      mocks: {
        $tc: (a: string) => a,
      },
      propsData: {
        data: mapDetails,
        selected: true,
        hasNext: false,
        hasPrev: false,
      },
    });

    Tornado.setCurrentEditMode(false);

    expect(wrapper.find(".map-modifier .default-value-label span").text()).toBe(
      "editor.modifiers.map.default_value"
    );

    const defaultValueInput = wrapper.find(
      ".map-modifier .default-value-value input"
    ).element as any;
    expect(defaultValueInput.value).toBe(mapDetails.defaultValue);
    expect(
      wrapper.find(".map-modifier .map-header-container .find.label").text()
    ).toBe("editor.modifiers.map.value");
    expect(
      wrapper.find(".map-modifier .map-header-container .replace.label").text()
    ).toBe("editor.modifiers.map.replacement");

    let valueInput = wrapper.find(
      ".map-modifier .map-values-container .map-row:nth-child(1) .find input"
    ).element as any;
    let replaceInput = wrapper.find(
      ".map-modifier .map-values-container .map-row:nth-child(1) .replace input"
    ).element as any;
    expect(valueInput.value).toBe(mapValue.key);
    expect(replaceInput.value).toBe(mapValue.value);
    expect(valueInput.hasAttribute("readonly")).toBeTruthy();
    expect(replaceInput.hasAttribute("readonly")).toBeTruthy();

    await wrapper.vm.$nextTick();

    let addBtn = wrapper.find(".map-modifier .map-ui .add-map-button");
    expect(addBtn.exists()).toBeFalsy();

    let deleteBtn = wrapper.find(
      ".map-modifier .map-values-container .map-row:nth-child(2) .replace .delete-btn-container button"
    );
    expect(deleteBtn.exists()).toBeFalsy();

    // Edit mode
    Tornado.setCurrentEditMode(true);
    await wrapper.vm.$nextTick();

    addBtn = wrapper.find(".map-modifier .map-ui .add-map-button");
    expect(addBtn.exists()).toBeTruthy();

    deleteBtn = wrapper.find(
      ".map-modifier .map-values-container .map-row:nth-child(1) .replace .delete-btn-container button"
    );
    expect(deleteBtn.exists()).toBeTruthy();

    valueInput = wrapper.find(
      ".map-modifier .map-values-container .map-row:nth-child(1) .find input"
    ).element as any;
    replaceInput = wrapper.find(
      ".map-modifier .map-values-container .map-row:nth-child(1) .replace input"
    ).element as any;
    expect(valueInput.hasAttribute("readonly")).toBeFalsy();
    expect(replaceInput.hasAttribute("readonly")).toBeFalsy();

    // Add
    addBtn.trigger("click");
    await wrapper.vm.$nextTick();

    let updateEvent = wrapper.emitted("update");
    if (!updateEvent || updateEvent.length != 1) {
      fail("Error: no update event triggered");
      return;
    }

    let updatedMapDetails = updateEvent[0].pop() as MapDetails;
    expect(updatedMapDetails.mapping.length).toBe(2);
    expect(updatedMapDetails.mapping[1].key).toBe("key_1");
    expect(updatedMapDetails.mapping[1].value).toBe("value");

    // Delete
    deleteBtn.trigger("click");
    await wrapper.vm.$nextTick();

    updateEvent = wrapper.emitted("update");
    if (!updateEvent || updateEvent.length != 2) {
      fail("Error: no update event triggered");
      return;
    }

    updatedMapDetails = updateEvent[1].pop() as MapDetails;
    expect(updatedMapDetails.mapping.length).toBe(1);
    expect(updatedMapDetails.mapping[0].key).toBe("key_1");
    expect(updatedMapDetails.mapping[0].value).toBe("value");

    // Edit key
    const inputKey = wrapper.find(
      ".map-modifier .map-values-container .map-row:nth-child(1) .find .bx--text-input"
    );
    inputKey.setValue("edited");
    inputKey.trigger("blur");

    updateEvent = wrapper.emitted("update");
    if (!updateEvent || updateEvent.length != 3) {
      fail("Error: no update event triggered");
      return;
    }

    updatedMapDetails = updateEvent[2].pop() as MapDetails;
    expect(updatedMapDetails.mapping.length).toBe(1);
    expect(updatedMapDetails.mapping[0].key).toBe("edited");
    expect(updatedMapDetails.mapping[0].value).toBe("value");

    //Edit value
    const inputValue = wrapper.find(
      ".map-modifier .map-values-container .map-row:nth-child(1) .replace .bx--text-input"
    );
    inputValue.setValue("edited");
    inputValue.trigger("blur");

    updateEvent = wrapper.emitted("update");
    if (!updateEvent || updateEvent.length != 4) {
      fail("Error: no update event triggered");
      return;
    }

    updatedMapDetails = updateEvent[3].pop() as MapDetails;
    expect(updatedMapDetails.mapping.length).toBe(1);
    expect(updatedMapDetails.mapping[0].key).toBe("edited");
    expect(updatedMapDetails.mapping[0].value).toBe("edited");
  });
});
