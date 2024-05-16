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
      <CharacterPattern />
    </template>
    <template v-slot:modifier-specific-ui>
      <div class="replace-all-data">
        <div class="modifier-input-row">
          <div class="modifier-input-label">
            {{ $tc("editor.modifiers.replace_all.find") }}
          </div>
          <div class="modifier-input">
            <cv-text-input
              v-model="editableData.find"
              :readonly="!editMode"
              @blur="updateModifier"
            />
          </div>
        </div>
        <div class="modifier-input-row">
          <div class="modifier-input-label">
            {{ $tc("editor.modifiers.replace_all.replace") }}
          </div>
          <div class="modifier-input">
            <cv-text-input
              v-model="editableData.replace"
              :readonly="!editMode"
              @blur="updateModifier"
            />
          </div>
        </div>
        <div class="modifier-input-row">
          <div class="modifier-input-label">
            {{ $tc("editor.modifiers.replace_all.is_regex") }}
          </div>
          <div class="modifier-input">
            <cv-toggle
              v-model="editableData.isRegex"
              @click="handleToggleClick"
              value="true"
              @change="updateModifier"
            />
          </div>
        </div>
      </div>
    </template>
  </Modifier>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Modifier from "@/components/modifiers/Modifier.vue";
import { cloneDeep } from "lodash";
import Tornado from "@/store/tornado";
import { ReplaceAllDetails } from "@/core/Extractor/Modifiers";
// @ts-ignore
import CharacterPattern from "@carbon/icons-vue/es/character-patterns/16";

// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";
// @ts-ignore
import { CvToggle } from "@carbon/vue/src/components/cv-toggle";
// @ts-ignore
import { CvTextInput } from "@carbon/vue/src/components/cv-text-input";

@Component({
  components: { Modifier, CharacterPattern, CvButton, CvToggle, CvTextInput },
})
export default class ReplaceAllModifier extends Vue {
  private title = "editor.modifiers.replace_all.replace_all";
  private description = "editor.modifiers.descriptions.replace_all";
  private className = "replace-all-modifier";
  @Prop() private data!: ReplaceAllDetails;
  @Prop() private selected!: boolean;
  @Prop() public hasNext!: boolean;
  @Prop() public hasPrev!: boolean;

  private editableData = cloneDeep(this.data);

  @Watch("data", { immediate: true, deep: true })
  onPropertyChanges(newData: ReplaceAllDetails): void {
    this.editableData = cloneDeep(newData);
  }

  updateModifier(): void {
    if (this.editMode) {
      this.$emit("update", this.editableData);
    }
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  private handleToggleClick(e: PointerEvent): void {
    if (!this.editMode) {
      e.preventDefault();
    }
  }
}
</script>

<style lang="scss" scoped>
.modifier-input-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  .modifier-input-label {
    font-family: IBM Plex Sans;
    font-size: 0.875rem;
    font-weight: 400;
    padding: 12px 16px;
    min-width: 98px;
  }

  .modifier-input {
    padding: 4px 16px 4px 0;
  }
}
</style>

<style lang="scss">
.replace-all-modifier .replace-all-data .modifier-input-row {
  .modifier-input {
    .bx--label {
      display: none;
    }

    .bx--text-input {
      background: $ui-input;
      border-bottom: 1px solid $ui-input-border !important;
      height: 1.875rem;
      font-family: IBM Plex Sans;
      font-size: 0.875rem;
      font-weight: 400;
      padding-right: 0.5rem;
      padding-left: 0.5rem;
      max-width: 153px;
    }
  }

  .bx--toggle__switch {
    font-family: IBM Plex Sans;
    margin: 0 !important;
  }
}
</style>
