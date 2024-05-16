<template>
  <div
    class="with-extractor-container"
    :data-self="`${editableExtractor.variable}-${itemIndex}`"
    :class="{ 'editing-in-progress': editMode }"
  >
    <div class="variable" v-if="!editMode">
      <span class="variable-at">@</span>{{ editableExtractor.variable }}
    </div>
    <div class="variable" v-else>
      <cv-text-area
        class="editable-operator-value"
        :light="true"
        v-model="editableExtractor.variable"
        @blur="updateInput"
      ></cv-text-area>
      <div class="delete-rule-button" @click="deleteExtractor">
        <TrashCan16 class="extractor_delete" />
      </div>
    </div>
    <div class="from" v-if="!editMode">
      {{ $tc("editor.from") }} {{ extractor.from }}
    </div>
    <div class="from" v-else>
      <cv-text-area
        class="editable-operator-value"
        :light="true"
        v-model="editableExtractor.from"
        @blur="updateInput"
        :invalid-message="accessorValidationError"
      ></cv-text-area>
    </div>
    <div class="extractor-container">
      <div class="regex-container">
        <div class="regex-type" v-if="!editMode">{{ regexTypeName }}</div>
        <cv-dropdown
          class="condition-dropdown-button"
          light="light"
          v-else
          :value="editableExtractor.regexDetails.type"
          @change="changeMatch"
        >
          <cv-dropdown-item
            v-for="type in RegexTypes"
            :key="type"
            :value="type"
          >
            <span>{{ mapTypeToReadableString(type) }}</span>
          </cv-dropdown-item>
        </cv-dropdown>
        <div class="regex-expression" v-if="!editMode">
          {{ extractor.expression }}
        </div>
        <div class="regex-expression regex-expression--editable" v-else>
          <cv-text-input
            class="editable-operator-value"
            :light="true"
            v-model="editableExtractor.regexDetails.namedMatch"
            @blur="onUpdateNamedMatch"
            v-if="editableExtractor.isRegexDetailsNamedGroups"
            :invalid-message="regexValidationError"
          ></cv-text-input>
          <cv-text-input
            class="editable-operator-value"
            :light="true"
            v-model="editableExtractor.regexDetails.singleKeyMatch"
            @blur="onUpdateSingleKeyMatch"
            v-if="editableExtractor.isRegexDetailsKey"
            :invalid-message="regexValidationError"
          ></cv-text-input>
          <cv-text-input
            class="editable-operator-value"
            :light="true"
            v-model="editableExtractor.regexDetails.match"
            @blur="onUpdateMatch"
            v-if="editableExtractor.isRegexDetailsStandard"
            :invalid-message="regexValidationError"
          ></cv-text-input>
        </div>
      </div>
      <div class="all-matches-container" v-if="extractor.isAllMatches">
        <div class="all-matches-label">{{ $tc("editor.all_matches") }}</div>
        <div class="all-matches-value" v-if="!editMode">
          {{ extractor.allMatches }}
        </div>
        <div
          class="all-matches-value all-matches-value--pointer"
          v-else
          @click="toggleAllMatches"
        >
          {{ editableExtractor.regexDetails.allMatches }}
        </div>
      </div>
      <div
        class="group-match-idx-container"
        v-if="extractor.isRegexDetailsStandard"
      >
        <div class="group-match-idx-label">
          {{ $tc("editor.group_match_idx") }}
        </div>
        <div class="group-match-idx-value" v-if="!editMode">
          <ExtractorGroupsIdxInputField
            :value="extractor.groupMatchIdx"
            :disabled="!editMode"
          />
        </div>
        <div
          class="group-match-idx-value group-match-idx-value--editable"
          v-else
        >
          <ExtractorGroupsIdxInputField
            :value="editableExtractor.regexDetails.groupMatchIdx"
            @update="onChangeGroupMatchIdx"
            :disabled="!editMode"
          />
        </div>
      </div>
      <div class="modifier-container">
        <div class="modifier-label">
          {{ $tc("editor.modifiers.modifiers") }}
        </div>
        <Modifiers
          :modifiers="extractor.postModifiers"
          @update="onUpdateModifiers"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import i18n from "@/utils/i18n";
import { Modifier } from "@/core/Extractor/Modifiers";
import Tornado from "@/store/tornado";
import Modifiers from "@/components/editor/Modifiers.vue";
// @ts-ignore
import ArrowRight16 from "@carbon/icons-vue/es/arrow--right/16";
// @ts-ignore
import Cut16 from "@carbon/icons-vue/es/cut/16";
// @ts-ignore
import CharacterPatterns16 from "@carbon/icons-vue/es/character-patterns/16";
// @ts-ignore
import StringInteger16 from "@carbon/icons-vue/es/string-integer/16";
// @ts-ignore
import TextSmallCaps16 from "@carbon/icons-vue/es/text--small-caps/16";
// @ts-ignore
import Connect16 from "@carbon/icons-vue/es/connect/16";
// @ts-ignore
import CollapseAll16 from "@carbon/icons-vue/es/collapse-all/16";
// @ts-ignore
import TrashCan16 from "@carbon/icons-vue/es/trash-can/16";
import Extractor from "@/core/Extractor/Extractor";
import { cloneDeep, isEqual } from "lodash";
import { getExtractorRegexDefaultValuesByRegexType } from "@/store/helper/tornadoHelper";
import {
  RegexDetailsKey,
  RegexDetailsNamedGroups,
  RegexDetailsStandard,
} from "@/core/Extractor/Regex";
import {
  validateRegex,
  renderRegexErrorMessage,
} from "@/core/Services/InputValidation/RegexValidationUtils";
import {
  validateAccessor,
  renderAccessorErrorMessage,
} from "@/core/Services/InputValidation/AccessorValidationUtils";
import ExtractorGroupsIdxInputField from "@/components/editor/inputs/ExtractorGroupsIdxInputField.vue";

import {
  CvDropdown,
  CvDropdownItem,
  CvDropdownSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-dropdown";
// @ts-ignore
import { CvTextInput } from "@carbon/vue/src/components/cv-text-input";
// @ts-ignore
import { CvTextArea } from "@carbon/vue/src/components/cv-text-area";

@Component({
  components: {
    ExtractorGroupsIdxInputField,
    Modifiers,
    ArrowRight16,
    Cut16,
    CharacterPatterns16,
    StringInteger16,
    TextSmallCaps16,
    Connect16,
    CollapseAll16,
    TrashCan16,
    CvDropdown,
    CvDropdownItem,
    CvDropdownSkeleton,
    CvTextInput,
    CvTextArea,
  },
})
export default class WithExtractor extends Vue {
  @Prop() public extractor!: Extractor;
  @Prop() public itemIndex!: number;
  private editableExtractor!: Extractor;
  public accessorValidationError = "";
  public regexValidationError = "";

  @Watch("extractor", { deep: true, immediate: true })
  onExtractorChanged(extractor: Extractor): void {
    this.editableExtractor = cloneDeep(extractor);
  }

  public deleteExtractor(): void {
    this.$emit("delete", this.editableExtractor, this.itemIndex);
  }

  public onUpdateNamedMatch(): void {
    const namedMatch = (
      this.editableExtractor.regexDetails as RegexDetailsNamedGroups
    ).namedMatch;
    let result = validateRegex(namedMatch);
    if (!result.has_named_groups) {
      this.regexValidationError = "Must have named groups";
      return;
    } else if (!result.is_valid && result.error) {
      this.regexValidationError = renderRegexErrorMessage(
        namedMatch,
        result.error
      );
      return;
    }

    this.clearError();
    this.updateInput();
  }

  public onUpdateSingleKeyMatch(): void {
    const singleKeyMatch = (
      this.editableExtractor.regexDetails as RegexDetailsKey
    ).singleKeyMatch;
    let result = validateRegex(singleKeyMatch);
    if (!result.is_valid && result.error) {
      this.regexValidationError = renderRegexErrorMessage(
        singleKeyMatch,
        result.error
      );
      return;
    }

    this.clearError();
    this.updateInput();
  }

  public onUpdateMatch(): void {
    const match = (this.editableExtractor.regexDetails as RegexDetailsStandard)
      .match;
    let result = validateRegex(match);
    if (!result.is_valid && result.error) {
      this.regexValidationError = renderRegexErrorMessage(match, result.error);
      return;
    }

    this.clearError();
    this.updateInput();
  }
  public onChangeGroupMatchIdx(value: number | null): void {
    (
      this.editableExtractor.regexDetails as RegexDetailsStandard
    ).groupMatchIdx = value;
    this.updateInput();
  }
  public updateInput(): void {
    this.accessorValidationError = "";
    const extractor = this.editableExtractor;
    let result = validateAccessor(extractor.from);
    if (!result.is_valid && result.error) {
      this.accessorValidationError = renderAccessorErrorMessage(result.error);
      return;
    }
    if (isEqual(extractor, this.extractor) || this.hasError()) {
      return;
    }
    this.$emit("update", extractor, this.itemIndex);
  }

  public update(): void {
    this.$emit("update", this.editableExtractor, this.itemIndex);
  }

  public changeMatch(match: "Regex" | "RegexNamedGroups" | "KeyRegex"): void {
    this.editableExtractor.regexDetails =
      getExtractorRegexDefaultValuesByRegexType(match, this.editableExtractor);
    this.clearError();
    this.update();
  }

  get regexTypeName(): string {
    const details = this.extractor.regexDetails as
      | RegexDetailsStandard
      | RegexDetailsKey
      | RegexDetailsNamedGroups;
    return this.mapTypeToReadableString(details.type);
  }

  private mapTypeToReadableString(type: string): string {
    switch (type) {
      case "Regex":
        return i18n.tc("editor.match");
      case "KeyRegex":
        return i18n.tc("editor.single_key_match");
      case "RegexNamedGroups":
        return i18n.tc("editor.named_match");
      default:
        return "";
    }
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get RegexTypes(): string[] {
    return ["Regex", "KeyRegex", "RegexNamedGroups"];
  }

  onUpdateModifiers(modifiers: Modifier[]): void {
    this.editableExtractor.postModifiers = modifiers;
    this.$emit("update", this.editableExtractor);
  }

  public toggleAllMatches(): void {
    this.editableExtractor.switchAllMatches();
    this.$emit("update", this.editableExtractor, this.itemIndex);
  }

  private clearError(): void {
    this.regexValidationError = "";
  }

  private hasError(): boolean {
    return (
      this.accessorValidationError !== "" || this.regexValidationError !== ""
    );
  }
}
</script>
<style lang="scss">
.regex-expression--editable {
  .editable-operator-value {
    position: relative;
    .cv-text-input {
      position: relative;
    }
    .bx--form-requirement {
      position: absolute;
      right: 0;
      top: auto;
      padding: 8px 24px 8px 16px;
      background: $ui-05;
      color: $inverse-01 !important;
      z-index: 9999;
      border-radius: 3px;
      width: max-content;
      line-break: normal;
      max-width: 100%;
      word-wrap: break-word;
      margin-top: 34px;
      font-family: "IBM Plex Sans";
      font-size: 14px;
      &:after {
        content: "";
        background: $ui-05;
        display: block;
        width: 18px;
        height: 18px;
        position: absolute;
        transform: rotate(45deg);
        right: 9px;
        top: -3px;
      }
    }
    & svg {
      top: 1rem;
      right: 10px;
    }
  }
}
.delete-rule-button {
  position: absolute;
  background: #6f6f6f33;
  width: 177px;
  height: inherit;
  z-index: 1;
  &__icon {
    position: absolute;
    bottom: 6px;
    right: 6px;
    & svg {
      cursor: pointer;
    }
  }
}
.regex-container,
.group-match-idx-container {
  .bx--dropdown {
    border: none;
    height: 30px;
  }

  .bx--list-box__label {
    text-transform: uppercase;
    color: $icon-green;
  }

  .bx--list-box__menu-icon {
    display: none;
  }

  .bx--list-box__field {
    padding: $spacing-03;
  }

  .bx--list-box__menu {
    width: 185px;
  }

  .bx--dropdown-link {
    color: $icon-green;
    text-transform: uppercase;
    border: none;
  }
  .bx--text-input {
    height: 30px;
  }
  .bx--text-input__field-wrapper {
    input {
      border-bottom: none !important;
    }
  }
  .bx--number__input-wrapper {
    input {
      border-bottom: none !important;
      height: 30px !important;
      padding-right: 1rem;
    }
    .bx--number__controls {
      display: none;
    }
  }
}
</style>

<style lang="scss" scoped>
.variable-at {
  color: $icon-green;
}

.delete-rule-button {
  position: relative;
  height: 30px;
  width: 30px;
  padding: 7px;
  float: right;
  z-index: 1;
  cursor: pointer;
  display: none;
}
.with-extractor-container {
  font-family: IBM Plex Mono;
  display: flex;
  margin-bottom: 2px;
  .group-match-idx-value {
    padding: 0 !important;
  }
  .regex-expression {
    &--editable {
      padding: 0 !important;
    }
  }

  &:hover .delete-rule-button {
    display: block;
    right: 0;
    bottom: 0;
    position: absolute;
    background-color: transparent;
  }

  .all-matches-value {
    &--pointer:hover {
      cursor: pointer;
    }
  }

  .variable,
  .from,
  .regex-expression,
  .all-matches-value,
  .group-match-idx-value,
  .modifier-list {
    background-color: $ui-02;
    min-height: 30px;
    padding: $spacing-03;
    margin-right: 2px;
  }

  .modifier-label,
  .regex-type,
  .all-matches-label,
  .group-match-idx-label {
    padding: $spacing-03;
    color: $icon-green;
    white-space: nowrap;
    text-transform: uppercase;
    font-weight: 500;
    margin-right: 2px;
    background-color: $ui-12 !important;
  }

  .variable {
    max-width: 177px;
    min-width: 177px;
    line-height: 16px;
    line-break: anywhere;
    position: relative;
  }

  .from {
    max-width: 366px;
    min-width: 366px;
    line-height: 16px;
    line-break: anywhere;
  }

  .extractor-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .regex-container {
    display: flex;
    flex-grow: 1;
    margin-bottom: 2px;

    .regex-expression {
      width: 100%;
    }
  }

  .all-matches-container {
    display: flex;
    flex-grow: 1;
    margin-bottom: 2px;

    .all-matches-value {
      width: 100%;
      color: #e963ff;

      &:first-letter {
        text-transform: uppercase;
      }
    }
  }

  .group-match-idx-container {
    display: flex;
    flex-grow: 1;
    margin-bottom: 2px;

    .group-match-idx-value {
      width: 100%;
      color: #3190ff;
      margin-right: 2px;
      width: 100%;
      min-height: 30px;
      display: flex;
      background: transparent;
    }
  }

  .modifier-container {
    display: flex;
    flex-grow: 1;

    .modifiers {
      margin-right: 2px;
      width: 100%;
      min-height: 30px;
      display: flex;

      .icon {
        margin-right: $spacing-03;

        &.entry-point {
          opacity: 0.35;
        }
      }
    }
  }
}

.dark {
  .modifier-label,
  .regex-type,
  .all-matches-label,
  .group-match-idx-label {
    background: $clickable-background-dark;
  }
}

.light {
  .modifier-label,
  .regex-type,
  .all-matches-label,
  .group-match-idx-label {
    background: $clickable-background-light;
  }
}
</style>

<style lang="scss">
.bx--number__input-wrapper {
  input {
    color: #3190ff !important;
    padding-right: 1rem !important;
  }
}

.with-extractor-container .variable .bx--text-area__wrapper {
  .bx--text-area {
    padding: 0 8px;
  }

  &:before {
    content: "@";
    color: $icon-green;
    position: absolute;
    padding-top: 2px;
    line-height: 14px;
  }
}
.with-extractor-container.editing-in-progress {
  textarea {
    background-color: transparent;
  }
}

.with-extractor-container.editing-in-progress {
  .variable,
  input,
  .from {
    &:hover {
      background: $decorative-01;
    }
  }
}

.dark {
  .condition-dropdown-button .bx--dropdown__wrapper .bx--dropdown {
    background-color: $ui-12;
    &:hover {
      background-color: $ui-input-hover;
    }
  }
}

.light {
  .condition-dropdown-button .bx--dropdown__wrapper .bx--dropdown {
    background-color: $ui-12;
    &:hover {
      background-color: $ui-input-hover;
    }
  }
}

.condition-dropdown-button {
  margin-right: 2px;
}
</style>
