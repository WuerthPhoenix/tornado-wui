<template>
  <div class="modifiers" @keydown.esc="onEsc">
    <div
      class="modifier-list"
      ref="modifier-list"
      v-if="hasModifiers"
      :class="{ scroll: this.isListScrollable }"
    >
      <component
        v-for="(modifier, index) in this.editedModifiers"
        :is="getComponentByModifierType(modifier)"
        :key="getModifierKey(index)"
        :selected="isModifierSelected(index)"
        :data="modifier.details"
        :hasNext="!isLastModifier(index)"
        :hasPrev="!isFirstModifier(index)"
        @select="onSelect(index)"
        @delete="onDelete"
        @moveLeft="onMoveLeft"
        @moveRight="onMoveRight"
        @close="onClose(index)"
        @update="onUpdate(index, $event)"
      />
      <div class="fade" v-if="this.isListScrollable">
        <div class="right-icon">
          <ChevronRight />
        </div>
      </div>
    </div>
    <div class="modifier-list empty-modifier" v-else>
      {{ $tc("editor.no_modifiers_applied") }}
    </div>
    <div class="add-modifiers">
      <cv-button
        ref="toggleButton"
        @click="toggleAddModifierDropdown()"
        :class="{ 'add-modifier-open': addModifierOpen }"
        :disabled="!editMode"
      >
        <Close v-if="addModifierOpen" />
        <Add v-else />
      </cv-button>
    </div>
    <div class="modifiers-available" v-if="addModifierOpen">
      <div
        v-for="(modifierData, index) in availableModifiers"
        @click="onAddModifier(modifierData.data)"
        :key="index"
        class="available-modifier-add"
      >
        <div class="modifier-icon">
          <component :is="modifierData.icon" />
        </div>
        <div class="modifier-title">
          {{ $tc(modifierData.title) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Constructor } from "@/utils/types";
import LowercaseModifier from "@/components/modifiers/LowercaseModifier.vue";
import Tornado from "@/store/tornado";
import { AvailableModifiers } from "@/utils/editorUtils";
import { cloneDeep } from "lodash";
// @ts-ignore
import Add from "@carbon/icons-vue/es/add/20";
// @ts-ignore
import Close from "@carbon/icons-vue/es/close/20";
// @ts-ignore
import ChevronRight from "@carbon/icons-vue/es/chevron--right/16";
import ToNumberModifier from "@/components/modifiers/ToNumberModifier.vue";
import TrimModifier from "@/components/modifiers/TrimModifier.vue";
import MapModifier from "@/components/modifiers/MapModifier.vue";
import { Modifier, ModifierDetails } from "@/core/Extractor/Modifiers";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";
import ReplaceAllModifier from "@/components/modifiers/ReplaceAllModifier.vue";
import DateAndTimeModifier from "@/components/modifiers/DateAndTimeModifier.vue";
// @ts-ignore
// CvButton is imported here because we're experiencing inclusion problems
// in jest unit tests otherwise. Overwriting the global CvButton component
// fixes the problem.
import { CvButton } from "@carbon/vue/src/components/cv-button";

@Component({
  components: {
    Add,
    Close,
    ChevronRight,
    CvButton,
  },
})
export default class Modifiers extends Vue {
  @Prop() modifiers!: Modifier[];
  private editedModifiers = cloneDeep(this.modifiers);
  private addModifierOpen = false;
  private selectedModifier = -1;
  private generation = 0;

  private mounted() {
    // @ts-ignore
    document.body.addEventListener("click", this.clickOut, true);
  }

  private beforeDestroy() {
    // @ts-ignore
    document.body.removeEventListener("click", this.clickOut, true);
  }

  getComponentByModifierType(modifier: Modifier): Constructor<Vue> {
    switch (modifier.type) {
      case "Lowercase":
        return LowercaseModifier;
      case "ToNumber":
        return ToNumberModifier;
      case "Trim":
        return TrimModifier;
      case "Map":
        return MapModifier;
      case "ReplaceAll":
        return ReplaceAllModifier;
      case "DateAndTime":
        return DateAndTimeModifier;
      default:
        return LowercaseModifier;
    }
  }

  isModifierSelected(index: number): boolean {
    return this.selectedModifier === index;
  }

  isLastModifier(index: number): boolean {
    return index === this.editedModifiers.length - 1;
  }

  isFirstModifier(index: number): boolean {
    return index === 0;
  }

  getModifierKey(index: number): string {
    // The generation is used to reliably recalculate the components when they are re-ordere.
    // Otherwise, vue does not update the modifiers correctly in some edge-cases.
    // Since we are not expecting many modifiers, an incremental generation for each modifier
    // would be overkill.
    return `${this.generation}-${this.editedModifiers.length}-${index}`;
  }

  onSelect(index: number): void {
    this.selectedModifier = index;
  }

  onDelete(): void {
    if (this.selectedInRange()) {
      this.editedModifiers.splice(this.selectedModifier, 1);

      // edge-case if we delete the last element
      if (this.selectedModifier >= this.editedModifiers.length) {
        this.selectedModifier = this.editedModifiers.length - 1;
      }

      this.$emit("update", this.editedModifiers);
    }
  }

  onUpdate(index: number, modifierDetails: ModifierDetails): void {
    const modifier = this.editedModifiers[index];
    modifier.details = modifierDetails;
    Vue.set(this.editedModifiers, index, modifier);
    this.$emit("update", this.editedModifiers);
  }

  onMoveLeft(): void {
    this.moveSelected(-1);
  }

  onMoveRight(): void {
    this.moveSelected(1);
  }

  onClose(index: number): void {
    if (this.selectedModifier === index) {
      this.selectedModifier = -1;
    }
  }

  onAddModifier(modifier: Modifier): void {
    this.editedModifiers.push(cloneDeep(modifier));
    this.addModifierOpen = false;
    this.selectedModifier = this.editedModifiers.length - 1;
    this.$emit("update", this.editedModifiers);

    // Scroll to the end of the list
    const list = this.$refs["modifier-list"] as HTMLElement;
    window.setTimeout(() => {
      if (list == undefined) return;
      // The scroll length is equal to 30px (the width of a single modifier) multiplied by the number of modifiers + 1
      list.scrollLeft = (this.editedModifiers.length + 1) * 30;
    }, 0);
  }

  moveSelected(offset: number): void {
    if (!this.selectedInRange() || !this.selectedWithOffsetInRange(offset)) {
      return;
    }

    let index = this.selectedModifier;
    let temp = this.editedModifiers[index];
    this.editedModifiers[index] = this.editedModifiers[index + offset];
    this.editedModifiers[index + offset] = temp;

    this.selectedModifier += offset;
    this.generation += 1;

    this.$emit("update", this.editedModifiers);
  }

  selectedInRange(): boolean {
    return (
      this.selectedModifier >= 0 &&
      this.selectedModifier < this.editedModifiers.length
    );
  }

  selectedWithOffsetInRange(offset: number): boolean {
    return (
      this.selectedModifier + offset >= 0 &&
      this.selectedModifier + offset < this.editedModifiers.length
    );
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get availableModifiers(): AvailableModifiers[] {
    return ExtractorFactory.createDefaultModifiersList().map((modifier) => {
      return {
        title: modifier.type,
        icon: this.getComponentByModifierType(modifier),
        data: modifier,
      };
    });
  }

  get hasModifiers(): boolean {
    return this.editedModifiers.length > 0;
  }

  toggleAddModifierDropdown(): void {
    this.addModifierOpen = !this.addModifierOpen;
  }

  clickOut(e: Event): void {
    // check that click is not on the open/close icon
    const toggleButton = this.$refs["toggleButton"] as Vue;
    if (
      toggleButton &&
      !(
        toggleButton.$el == e.target ||
        toggleButton.$el.contains(e.target as Node)
      )
    ) {
      this.addModifierOpen = false;
    }
  }

  onEsc(): void {
    this.addModifierOpen = false;
    this.selectedModifier = -1;
  }

  get isListScrollable(): boolean {
    return this.editedModifiers.length >= 7;
  }
}
</script>

<style scoped lang="scss">
.dark {
  .add-modifiers {
    button {
      color: white;
    }
  }
}
.light {
  .add-modifiers {
    button {
      color: black;
    }
  }

  .fade {
    background: linear-gradient(
      270deg,
      $ui-02 25%,
      rgba(224, 224, 224, 0) 100%
    );
  }
}
.add-modifiers {
  margin: 0 0 0 auto;
  background-color: $ui-02;
  margin-left: 2px;

  button {
    min-height: 1.875rem;
    width: 1.875rem;
    height: 1.875rem;
    padding: 0;
    justify-content: center;
    border: $ui-01 0.125rem;
    background-color: transparent;

    &:hover {
      background: $decorative-01;
    }

    &.add-modifier-open {
      background: $ui-01 !important;
    }
  }
}

.modifiers-available {
  position: absolute;
  margin-top: 1.875rem;
  width: 100%;
  background: $ui-01;
  box-shadow: 0px 4px 30px 0px #0000004d;
  z-index: 9;

  .available-modifier-add {
    display: flex;
    width: 100%;
    cursor: pointer;
    &:hover {
      background: $ui-02;
    }

    .modifier-icon {
      width: 1.875rem;
      height: 1.875rem;
    }

    .modifier-title {
      padding: 8px;
      font-size: 0.875rem;
      font-family: IBM Plex Sans;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
    }
  }
}

.modifier-list {
  display: flex;
  background: $ui-02;
  width: 100%;
  max-width: 237px;
  overflow-x: auto;

  &.empty-modifier {
    padding: 0.5rem;
    width: 100%;
    background-color: $ui-02;
    font-family: IBM Plex Sans;
  }

  &.scroll {
    padding-right: 34px;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .fade {
      background: linear-gradient(270deg, $ui-02 25%, rgba(82, 82, 82, 0) 100%);
      position: absolute;
      right: 30px;
      top: 0;
      width: 40px;
      height: 100%;
      border-right: solid $spacing-01 $ui-01;
      padding-right: $spacing-04;

      .right-icon {
        height: 100%;
        justify-content: center;
        display: flex;
        flex-direction: column;
        right: 0;
        position: absolute;
      }
    }
  }
}

.modifiers {
  position: relative;
  display: flex;
}
</style>
