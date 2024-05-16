<template>
  <div class="rule-details-container">
    <div class="action-bar">
      <cv-button
        class="back-button"
        kind="secondary"
        size="field"
        @click="backAction"
      >
        {{ $tc("views.processing_tree.back") }} <ChevronLeft20 />
      </cv-button>

      <cv-button
        kind="ghost"
        size="sm"
        class="delete-rule-button"
        v-if="editMode"
        @click="deleteRule"
      >
        <TrashCan20 />
      </cv-button>
    </div>
    <cv-tabs
      class="rule-details-tabs"
      :container="true"
      ref="rule-details-tabs"
      @tab-selected="onTabSelected"
    >
      <cv-tab
        :label="$tc('views.processing_tree.properties')"
        ref="properties-tab"
        :selected="selectedTabIndex === TypeTabs.properties"
      >
        <cv-grid class="properties-grid">
          <cv-row v-if="propertiesAreLoading">
            <cv-column class="left-side">
              <cv-number-input-skeleton></cv-number-input-skeleton>
              <cv-number-input-skeleton></cv-number-input-skeleton>
            </cv-column>
            <cv-column>
              <cv-toggle-skeleton></cv-toggle-skeleton>
              <cv-toggle-skeleton></cv-toggle-skeleton>
            </cv-column>
          </cv-row>
          <cv-row v-else>
            <cv-column class="left-side">
              <div class="input-view-mode">
                <label class="bx--label" v-if="!editMode">
                  {{ $tc("views.processing_tree.name") }}
                </label>
                <div class="bx--text-input__field-wrapper">
                  <div
                    class="name bx--text-input bx--text-input--light"
                    v-if="!editMode"
                  >
                    {{ rule.name }}
                  </div>
                  <cv-text-input
                    :light="true"
                    :label="$tc('views.processing_tree.name')"
                    v-model="editableRule.name"
                    @input="validateRuleName"
                    :invalid-message="invalidRuleNameMessage"
                    class="rule_name"
                    @blur="onRuleChange"
                    v-else
                  />
                </div>
              </div>
              <div class="input-view-mode">
                <label class="bx--label" v-if="!editMode">
                  {{ $tc("views.processing_tree.description") }}
                </label>
                <div class="bx--text-input__field-wrapper">
                  <div
                    class="description bx--text-input bx--text-input--light"
                    v-if="!editMode"
                  >
                    {{ rule.description }}
                  </div>
                  <cv-text-input
                    :light="true"
                    :label="$tc('views.processing_tree.description')"
                    v-model="editableRule.description"
                    class="rule_description"
                    @blur="onRuleChange"
                    v-else
                  />
                </div>
              </div>
            </cv-column>
            <cv-column>
              <cv-toggle
                class="active"
                v-model="editableRule.active"
                :value="editableRule.active.toString()"
                :label="$tc('views.processing_tree.active')"
                @change="onRuleChange"
                @click="
                  (e) => {
                    if (!editMode) {
                      e.preventDefault();
                    }
                  }
                "
              />
              <cv-toggle
                class="continue"
                v-model="editableRule.continue"
                :value="editableRule.continue.toString()"
                :label="$tc('views.processing_tree.continue')"
                @change="onRuleChange"
                @click="
                  (e) => {
                    if (!editMode) {
                      e.preventDefault();
                    }
                  }
                "
              />
            </cv-column>
          </cv-row>
        </cv-grid>
      </cv-tab>

      <cv-tab
        :label="$tc('views.processing_tree.where')"
        :selected="selectedTabIndex === TypeTabs.where"
      >
        <div v-if="operatorsExtractorsActionsAreLoading">
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
        </div>
        <WhereEditor
          @change="onRuleChange"
          v-model="editableRule.operators_extractors_actions.where"
          :is-editable="editMode"
          v-else
        />
      </cv-tab>

      <cv-tab
        :label="$tc('views.processing_tree.with')"
        :selected="selectedTabIndex === TypeTabs.with"
      >
        <div v-if="operatorsExtractorsActionsAreLoading">
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
        </div>
        <WithEditor
          v-else
          :with="editableRule.operators_extractors_actions.with"
          @addExtractor="onAddExtractor"
          @updateExtractor="onUpdateExtractor"
          @deleteExtractor="onDeleteExtractor"
          @update="onUpdateWith"
        />
      </cv-tab>

      <cv-tab
        :label="$tc('views.processing_tree.actions')"
        :selected="selectedTabIndex === TypeTabs.actions"
      >
        <div v-if="operatorsExtractorsActionsAreLoading">
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
          <cv-skeleton-text :heading="true"></cv-skeleton-text>
        </div>
        <ActionsEditor
          v-else
          :actions="editableRule.operators_extractors_actions.actions"
          @update="onUpdateActions"
        />
      </cv-tab>
    </cv-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
// @ts-ignore
import ChevronLeft20 from "@carbon/icons-vue/es/chevron--left/20";
// @ts-ignore
import TrashCan20 from "@carbon/icons-vue/es/trash-can/20";
import Tornado, {
  RuleCompleteDto,
  ProcessingTreeNodeDetailsDto,
} from "@/store/tornado";
import WhereEditor from "@/components/editor/WhereEditor.vue";
import WithEditor from "@/components/editor/WithEditor.vue";
import ActionsEditor from "@/components/editor/ActionsEditor.vue";
import { cloneDeep, isEqual } from "lodash";
import { getRuleByName, validateObjectName } from "@/utils/processingTreeUtils";
import i18n from "@/utils/i18n";
import { generateUniqueNameForExtractor } from "@/store/helper/tornadoHelper";
import { ExtractorFactory } from "@/core/Extractor/ExtractorFactory";
import Extractor from "@/core/Extractor/Extractor";
import { BaseAction } from "@/core/Action/Actions";

// @ts-ignore
import { CvGrid, CvRow, CvColumn } from "@carbon/vue/src/components/cv-grid";
// @ts-ignore
import { CvTabs, CvTab } from "@carbon/vue/src/components/cv-tabs";
// @ts-ignore
import { CvSkeletonText } from "@carbon/vue/src/components/cv-skeleton-text";
// @ts-ignore
import { CvTextInput } from "@carbon/vue/src/components/cv-text-input";
import {
  CvToggle,
  CvToggleSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-toggle";
// @ts-ignore
import {
  CvNumberInput,
  CvNumberInputSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-number-input";
// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";
// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";
// @ts-ignore
import { CvTag } from "@carbon/vue/src/components/cv-tag";
import {
  CvDataTable,
  CvDataTableRow,
  CvDataTableSkeleton,
  CvDataTableHeading,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-data-table";
import { RuleDetailsTabsType } from "@/utils/types";

export enum TypeTabs {
  properties = 0,
  where = 1,
  with = 2,
  actions = 3,
}

@Component({
  components: {
    ActionsEditor,
    WithEditor,
    WhereEditor,
    ChevronLeft20,
    TrashCan20,
    CvNumberInput,
    CvNumberInputSkeleton,
    CvGrid,
    CvRow,
    CvColumn,
    CvTabs,
    CvTab,
    CvSkeletonText,
    CvTextInput,
    CvToggle,
    CvToggleSkeleton,
    CvDataTable,
    CvDataTableRow,
    CvDataTableSkeleton,
    CvDataTableHeading,
    CvTag,
    CvTooltip,
    CvButton,
  },
})
export default class RuleDetails extends Vue {
  @Prop({ default: null }) rule!: RuleCompleteDto;
  @Prop() nodeDetails!: ProcessingTreeNodeDetailsDto;
  @Prop() public selectedTabIndexProp!: number;

  private TypeTabs = TypeTabs;
  private editableRule: RuleCompleteDto = cloneDeep(this.rule);
  private invalidRuleNameMessage = "";
  private ruleNameLengthLimit = 200;
  private selectedTabIndex: RuleDetailsTabsType = this.selectedTabIndexProp;

  @Watch("selectedTabIndexProp", { deep: true })
  onIndexChanged(index: number): void {
    this.selectedTabIndex = index;
  }

  @Watch("rule", { deep: true })
  onPropertyChanged(rule: RuleCompleteDto): void {
    this.editableRule = cloneDeep(rule);
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  private backAction() {
    this.$emit("back");
    const id = (this.$refs["properties-tab"] as Vue).$el.id;
    (this.$refs["rule-details-tabs"] as any).onTabClick(id);
  }

  get propertiesAreLoading(): boolean {
    return this.rule === null;
  }

  get operatorsExtractorsActionsAreLoading(): boolean {
    return (
      this.rule === null || this.rule.operators_extractors_actions === undefined
    );
  }

  public onDeleteExtractor(row: Extractor, itemIndex: number): void {
    if (this.editableRule.operators_extractors_actions?.with == null) {
      return;
    }
    this.editableRule.operators_extractors_actions.with.splice(itemIndex, 1);
    this.$emit("updateRule", {
      newRule: this.editableRule,
      oldRule: this.rule,
    });
  }

  public onUpdateWith(editedWith: Extractor[]): void {
    if (this.editableRule.operators_extractors_actions) {
      this.editableRule.operators_extractors_actions.with = editedWith;
      this.$emit("updateRule", {
        newRule: this.editableRule,
        oldRule: this.rule,
      });
    }
  }

  public onUpdateActions(editedActions: BaseAction[]): void {
    if (this.editableRule.operators_extractors_actions) {
      this.editableRule.operators_extractors_actions.actions = editedActions;
      this.$emit("updateRule", {
        newRule: this.editableRule,
        oldRule: this.rule,
      });
    }
  }

  private validateRuleName(value: string): void {
    this.invalidRuleNameMessage = validateObjectName(
      value,
      this.ruleNameLengthLimit
    );
    if (this.invalidRuleNameMessage === "" && value !== this.rule.name) {
      if (this.nodeDetails.type === "Ruleset") {
        this.invalidRuleNameMessage = getRuleByName(
          this.nodeDetails.rules,
          value
        )
          ? i18n.tc("errors.already_existing_rule")
          : "";
      }
    }
  }

  public onAddExtractor(): void {
    if (this.editableRule.operators_extractors_actions == undefined) {
      return;
    }
    const name = generateUniqueNameForExtractor(
      this.editableRule.operators_extractors_actions.with,
      "variable"
    );
    // add new extractor
    this.editableRule.operators_extractors_actions?.with?.push(
      ExtractorFactory.createNewDefaultExtractor(name)
    );
    // update visible tree, then automatically rerender components.
    this.$emit("updateRule", {
      newRule: this.editableRule,
      oldRule: this.rule,
    });
  }

  public onUpdateExtractor(row: Extractor, itemIndex: number): void {
    if (this.editableRule.operators_extractors_actions?.with === undefined) {
      return;
    }
    this.editableRule.operators_extractors_actions.with[itemIndex] = row;
    this.$emit("updateRule", {
      newRule: this.editableRule,
      oldRule: this.rule,
    });
  }

  private onRuleChange() {
    if (
      this.rule &&
      !this.invalidRuleNameMessage &&
      this.editableRule &&
      !isEqual(this.rule, this.editableRule)
    ) {
      this.$emit("updateRule", {
        newRule: this.editableRule,
        oldRule: this.rule,
      });
    }
  }

  private deleteRule() {
    if (this.rule) {
      this.$emit("deleteRule", this.rule);
    }
  }

  private onTabSelected(index: number): void {
    this.selectedTabIndex = index;
  }
}
</script>

<style lang="scss" scoped>
.rule-details-container {
  margin-top: $spacing-09;

  .action-bar {
    background: $ui-13;

    .back-button {
      min-width: 110px;
      padding-left: $spacing-05;
      padding-right: $spacing-05;
    }

    .delete-rule-button {
      color: unset !important;
      padding: $spacing-03 !important;
      height: $spacing-08;
      width: $spacing-08;
      margin-left: $spacing-03;
      background-color: $button-secondary;
      &:hover {
        background-color: $button-secondary-hover;
      }
    }
  }

  .rule-details-tabs {
    margin-top: $spacing-07;
  }

  .input-view-mode {
    .bx--text-input {
      line-height: 40px;
      white-space: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      -ms-overflow-style: none;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  .properties-grid {
    padding: 0 !important;

    .cv-row {
      margin: 0 !important;

      .cv-column > div {
        margin-top: $spacing-06;
      }
    }

    .left-side {
      padding-right: $spacing-07;
      max-width: 50%;
    }
  }
}
</style>

<style lang="scss">
.rule-details-tabs {
  .bx--tabs__overflow-indicator--right,
  [aria-label="scroll right"] {
    display: none;
  }

  .bx--toggle__switch {
    cursor: default;
  }
}
</style>
