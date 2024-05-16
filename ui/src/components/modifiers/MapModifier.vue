<template>
  <Modifier
    :title="title"
    :description="description"
    :selected="selected"
    v-on="$listeners"
    :has-next="hasNext"
    :has-prev="hasPrev"
    :class-name="className"
  >
    <template v-slot:icon>
      <Connect />
    </template>
    <template v-slot:modifier-specific-ui>
      <div class="map-ui">
        <div class="default-value-container">
          <div class="default-value-label">
            <span>{{ $tc("editor.modifiers.map.default_value") }}</span>
          </div>
          <div class="default-value-value">
            <cv-text-input
              v-model="default_value"
              @blur="updateModifier"
              :light="true"
              :readonly="!editMode"
            />
          </div>
        </div>

        <div class="map-header-container">
          <div class="map-row">
            <div class="find label">
              {{ $tc("editor.modifiers.map.value") }}
            </div>
            <div class="replace label">
              {{ $tc("editor.modifiers.map.replacement") }}
            </div>
          </div>
        </div>
        <div
          class="map-values-container"
          :class="{ fade: mapping.length >= 10 }"
        >
          <div
            class="map-row"
            v-for="(map, index) of mapping"
            :key="`${index}-${map.key}-${map.value}`"
          >
            <div class="find">
              <cv-text-input
                :value="map.key"
                :light="true"
                @blur="onKeyChange(index, $event)"
                :readonly="!editMode"
                :invalid-message="map.keyErrorMessage"
              />
            </div>
            <div class="replace">
              <cv-text-input
                :value="map.value"
                @blur="onValueChange(index, $event)"
                :light="true"
                :readonly="!editMode"
              />
              <div class="delete-btn-container" v-if="editMode">
                <cv-button
                  class="delete-btn"
                  kind="ghost"
                  size="small"
                  @click="deleteMap(index)"
                >
                  <TrashCan />
                </cv-button>
              </div>
            </div>
          </div>
        </div>

        <cv-button
          v-if="editMode"
          kind="ghost"
          class="add-map-button"
          size="small"
          @click="addMap"
        >
          <Add />
        </cv-button>
      </div>
    </template>
  </Modifier>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Modifier from "@/components/modifiers/Modifier.vue";
// @ts-ignore
import Connect from "@carbon/icons-vue/es/connect/16";
// @ts-ignore
import Add from "@carbon/icons-vue/es/add/16";
import { cloneDeep } from "lodash";
// @ts-ignore
import TrashCan from "@carbon/icons-vue/es/trash-can/16";
import Tornado from "@/store/tornado";
import { MapDetails, MapValue } from "@/core/Extractor/Modifiers";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";
import i18n from "@/utils/i18n";

// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";
// @ts-ignore
import { CvTextInput } from "@carbon/vue/src/components/cv-text-input";

@Component({
  components: { Modifier, Connect, Add, TrashCan, CvButton, CvTextInput },
})
export default class MapModifier extends Vue {
  private title = "editor.modifiers.map.map";
  private description = "editor.modifiers.descriptions.map";
  private className = "map-modifier";
  @Prop() private data!: MapDetails;
  @Prop() private selected!: boolean;
  @Prop() public hasNext!: boolean;
  @Prop() public hasPrev!: boolean;

  private editableData: MapDetails = cloneDeep(this.data);

  @Watch("data", { immediate: true, deep: true })
  onPropertyChanges(newData: MapDetails): void {
    this.editableData = cloneDeep(newData);
  }

  get default_value(): string {
    if (this.editableData.defaultValue !== null) {
      return this.editableData.defaultValue;
    }

    return "";
  }

  set default_value(default_value: string) {
    this.editableData.defaultValue = default_value;
  }

  get mapping(): MapValue[] {
    return this.editableData.mapping;
  }

  addMap(): void {
    const key = this.generateUniqueMapKey(this.editableData.mapping);
    const value = "value";

    this.editableData.mapping.push(
      ExtractorFactory.createMapValue({ key, value })
    );
    Vue.set(this.editableData, "mapping", this.editableData.mapping);
    this.updateModifier();
  }

  generateUniqueMapKey(mapping: { key: string; value: string }[]): string {
    let suffix = 1;
    const name = "key";
    const names = new Set(mapping.map((map) => map.key));

    while (names.has(`${name}_${suffix}`)) {
      suffix++;
    }

    return `${name}_${suffix}`;
  }

  deleteMap(index: number): void {
    this.editableData.mapping.splice(index, 1);
    Vue.set(this.editableData, "mapping", this.editableData.mapping);
    this.updateModifier();
  }

  onValueChange(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.editableData.mapping[index].value = inputElement.value;
    Vue.set(this.editableData, "mapping", this.editableData.mapping);
    this.updateModifier();
  }

  onKeyChange(index: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.editableData.mapping[index].keyErrorMessage = this.validateKey(
      index,
      inputElement.value
    );
    this.editableData.mapping[index].key = inputElement.value;
    Vue.set(this.editableData, "mapping", this.editableData.mapping);
    this.updateModifier();
  }

  private validateKey(index: number, key: string): string {
    if (key === "") {
      return i18n.tc("editor.modifiers.map.key_error.empty");
    } else {
      for (const value of this.mapping) {
        if (key != this.mapping[index].key && key === value.key) {
          return i18n.tc("editor.modifiers.map.key_error.duplicated");
        }
      }
    }
    return "";
  }

  updateModifier(): void {
    if (this.editMode && !this.checkErrorMessages()) {
      this.$emit("update", this.editableData);
    }
  }

  private checkErrorMessages(): boolean {
    for (const value of this.mapping) {
      if (value.keyErrorMessage) {
        return true;
      }
    }
    return false;
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }
}
</script>

<style scoped lang="scss">
.map-ui {
  margin-left: $spacing-05;
  margin-right: $spacing-05;
  font-family: IBM Plex Sans;
  position: relative;
}

.map-header-container {
  margin-top: $spacing-05;
}

.map-values-container {
  margin-bottom: $spacing-05;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 14px;
  }

  &::-webkit-scrollbar-thumb {
    border-width: 4px 4px 4px 4px;
    border-color: rgba(255, 0, 0, 0);
    background-color: $ui-background;
  }

  &.fade {
    -webkit-mask-image: linear-gradient(
      to bottom,
      black calc(100% - 20px),
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      black calc(100% - 20px),
      transparent 100%
    );

    .map-row:last-child {
      margin-bottom: 20px;
    }
  }
}
.default-value-container,
.map-row {
  display: flex;
  gap: $spacing-01;
  margin-bottom: $spacing-01;

  .delete-btn-container {
    display: none;

    .delete-btn {
      height: 30px;
      min-height: 30px;
      width: 30px;
      padding: 0 !important;
      justify-content: center;
      color: $interactive-03 !important;
      background: $field-02;
      margin-left: $spacing-01;

      &:hover {
        background: $decorative-01;
      }
    }
  }

  &:hover {
    .delete-btn-container {
      display: unset;
    }
  }
}

.default-value-label,
.default-value-value,
.find,
.replace {
  width: 50%;
  display: flex;
  align-items: flex-start;
}

.find,
.replace {
  &.label {
    color: $text-05;
    margin-bottom: $spacing-02;
  }
}

.add-map-button {
  padding: 0 !important;
  height: 20px;
  width: 20px;
  min-height: 20px;
  justify-content: center;
  color: $interactive-03 !important;
}
</style>

<style lang="scss">
.map-modifier .map-ui {
  input {
    height: 30px;
    border: 0;
    padding: $spacing-03;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: $ui-input;
    border-bottom: 1px solid $ui-input-border !important;
  }
  label {
    display: none;
  }
}
</style>
