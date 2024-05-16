<template>
  <div class="ruleset-details-container">
    <cv-grid class="properties-grid">
      <cv-row>
        <cv-column>
          <h5>{{ $tc("views.processing_tree.ruleset_settings") }}</h5>
        </cv-column>
      </cv-row>
      <cv-row v-if="isLoading">
        <cv-column class="left-side">
          <cv-number-input-skeleton></cv-number-input-skeleton>
        </cv-column>
        <cv-column> </cv-column>
      </cv-row>
      <cv-row v-else>
        <cv-column>
          <cv-row>
            <cv-column class="left-side">
              <div class="input-view-mode" v-if="!editMode">
                <label class="bx--label">
                  {{ $tc("views.processing_tree.name") }}
                </label>
                <div class="bx--text-input__field-wrapper">
                  <div class="name bx--text-input">
                    {{ details.name }}
                  </div>
                </div>
              </div>
              <cv-text-input
                v-else
                :label="$tc('views.processing_tree.name')"
                v-model="editableDetails.name"
                :light="true"
                @input="validateRulesetName"
                class="filter-name"
                :invalid-message="invalidRulesetNameMessage"
                :helper-text="rulesetNameLengthMessage"
                ref="nameInput"
                @blur="updateDetails"
              />
            </cv-column>
            <cv-column> </cv-column>
          </cv-row>
        </cv-column>
      </cv-row>
    </cv-grid>
    <h4 class="rule-name-container">
      {{ $tc("views.dashboard.tiles.rules") }}
      <transition name="selected-rule-animation">
        <span class="selected-rule-name" v-if="selectedRule">
          / {{ selectedRule.name }}</span
        >
      </transition>
    </h4>

    <div class="rule-animation-container">
      <div class="sliding-element" :class="{ slided: selectedRule !== null }">
        <RulesetTable
          class="rules-table-component"
          ref="rules_table_component"
          :details="details"
          :rules-count="rulesCount"
          :event-processed-rules="eventProcessedRules"
          @clickedRule="onRuleClicked"
          @addRule="onAddRule"
          @deleteRule="onDeleteRule"
          @reorderRule="onReorderRule"
        />
        <RuleDetails
          class="rule-details-component"
          @back="onBackToRuleset"
          @deleteRule="onDeleteRule"
          @updateRule="onUpdateRule"
          :rule="selectedRule"
          :nodeDetails="details"
          :selected-tab-index-prop="ruleDetailsTab"
        />
      </div>
    </div>
    <confirmation-modal
      class="delete-rule-confirmation-modal"
      ref="deleteRuleConfirmationModal"
      :title="
        $tc('views.processing_tree.delete_rule_confirmation_title', 0, {
          name: nameOfRuleToDelete,
        })
      "
      :content="$tc('views.processing_tree.delete_rule_confirmation_content')"
      :primaryButtonText="$tc('views.processing_tree.delete')"
      :secondaryButtonText="$tc('test_window.cancel')"
      @primaryBtnClick="onConfirmDeleteRule"
      @secondaryBtnClick="onCancelDeleteRule"
      @closeBtnClick="onCancelDeleteRule"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ProcessedRulesDto } from "tornado-backend-dto";
import RulesetTable from "@/components/processing_tree/RulesetTable.vue";
import RuleDetails from "@/components/processing_tree/RuleDetails.vue";
import Tornado, {
  ProcessingTreeNodeDetailsDto,
  RuleCompleteDto,
} from "@/store/tornado";
import { getNodeByPath, validateObjectName } from "@/utils/processingTreeUtils";
import i18n from "@/utils/i18n";
import ConfirmationModal from "@/components/ConfirmationModal.vue";

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

import { RuleDetailsTabsType } from "@/utils/types";

@Component({
  components: {
    RulesetTable,
    ConfirmationModal,
    RuleDetails,
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
  },
})
export default class ProcessingTreeNodeDetailsTypeRuleset extends Vue {
  @Prop() public details!: ProcessingTreeNodeDetailsDto;
  @Prop() public rulesCount!: number;
  @Prop()
  public parentNodePath!: string[];
  @Prop({ default: null })
  public eventProcessedRules!: ProcessedRulesDto | null;

  private selectedRule: RuleCompleteDto | null = null;

  private invalidRulesetNameMessage = "";
  private rulesetNameLengthLimit = 200;
  private editableDetails: ProcessingTreeNodeDetailsDto = { ...this.details };
  private ruleToDelete: RuleCompleteDto | null = null;
  private ruleDetailsTab = 0;

  private mounted(): void {
    this.$root.$on(
      "clickedExtractedVariable",
      (payload: { ruleName: string; highlightTargetName: string }) => {
        this.handleTestResultEvent(payload, RuleDetailsTabsType.with);
      }
    );
    this.$root.$on(
      "clickedTriggeredAction",
      (payload: { ruleName: string; highlightTargetName: string }) => {
        this.handleTestResultEvent(payload, RuleDetailsTabsType.actions);
      }
    );
  }

  private handleTestResultEvent(
    payload: {
      ruleName: string;
      highlightTargetName: string;
    },
    tabIndex: RuleDetailsTabsType
  ): void {
    const ruleName: string = payload.ruleName;
    const highlightTargetName: string = payload.highlightTargetName;

    if (this.details.type === "Ruleset") {
      const linkedRuleList: RuleCompleteDto[] = this.details.rules.filter(
        (rule: RuleCompleteDto) => {
          return rule.name === ruleName;
        }
      );

      if (linkedRuleList.length) {
        this.onRuleClicked(linkedRuleList[0]);
        setTimeout(() => {
          const scroller = document?.querySelector(
            ".feedback-banner-processing-tree-container"
          );
          const targetElement = document?.querySelector(
            `[data-self="${highlightTargetName}"]`
          );

          if (scroller && targetElement) {
            const offset =
              targetElement.getBoundingClientRect().top +
              (scroller.scrollTop ?? 0) -
              160;
            scroller?.scrollTo({
              top: offset,
              left: 0,
              behavior: "smooth",
            });
            // visual feedback after scroll
            const flasher = document.createElement("div");
            flasher.setAttribute("class", "flasher");
            targetElement?.appendChild(flasher);
            setTimeout(() => {
              targetElement?.removeChild(flasher);
            }, 800);
          }
        }, 300);

        this.ruleDetailsTab = 0;
        this.$nextTick(() => {
          this.ruleDetailsTab = tabIndex;
        });
      }
    }
  }

  get isLoading(): boolean {
    return !this.details;
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get selectedRuleReload(): boolean {
    return Tornado.selectedRuleReload;
  }

  get rulesetNameLengthMessage(): string {
    return this.rulesetNameLength + "/" + this.rulesetNameLengthLimit;
  }

  get rulesetNameLength(): number {
    return this.editableDetails.name.length;
  }

  get nameOfRuleToDelete(): string {
    if (this.ruleToDelete) {
      return this.ruleToDelete.name;
    }
    return "";
  }

  private validateRulesetName(value: string): void {
    this.invalidRulesetNameMessage = validateObjectName(
      value,
      this.rulesetNameLengthLimit
    );
    if (this.invalidRulesetNameMessage === "" && value !== this.details.name) {
      let currentUpdatedPath = [...this.parentNodePath];
      currentUpdatedPath.push(value);
      this.invalidRulesetNameMessage = getNodeByPath(
        Tornado.visibleTree,
        currentUpdatedPath
      )
        ? i18n.tc("errors.already_existing_node")
        : "";
    }
  }

  private updateDetails(): void {
    if (
      !this.invalidRulesetNameMessage &&
      this.details.name !== this.editableDetails.name
    ) {
      this.$emit("update-details", this.editableDetails);
    }
  }

  @Watch("details")
  onPropertyChanged(newDetails: ProcessingTreeNodeDetailsDto): void {
    this.editableDetails = { ...newDetails };
  }

  private onRuleClicked(rule: RuleCompleteDto) {
    if (!rule.operators_extractors_actions) {
      if (Tornado.editMode) {
        Tornado.loadDraftTreeRuleDetails({
          nodePath: Tornado.openedNodeDetailsPath,
          ruleName: rule.name,
          targetTree: Tornado.visibleTree,
        });
      } else {
        Tornado.loadActiveTreeRuleDetails({
          nodePath: Tornado.openedNodeDetailsPath,
          ruleName: rule.name,
        });
      }
    }
    this.selectedRule = rule;
    Tornado.setSelectedRuleName(rule.name);
  }

  private onReorderRule(
    newRuleIndex: number,
    oldRuleIndex: number,
    rule: RuleCompleteDto
  ) {
    let rulesetPath = [...this.parentNodePath];
    rulesetPath.push(this.details.name);
    Tornado.reorderRuleInRuleset({
      rule: rule,
      nodePath: rulesetPath,
      newIndex: newRuleIndex,
      oldIndex: oldRuleIndex,
    });
    this.updateDetails();
  }

  private onDeleteRule(rule: RuleCompleteDto) {
    this.ruleToDelete = rule;
    if (this.$refs.deleteRuleConfirmationModal) {
      (this.$refs.deleteRuleConfirmationModal as ConfirmationModal).showModal();
    }
  }

  private onConfirmDeleteRule() {
    if (!this.ruleToDelete) {
      return;
    }

    let rulesetPath = [...this.parentNodePath];
    rulesetPath.push(this.details.name);
    Tornado.deleteRuleFromRuleset({
      rule: this.ruleToDelete,
      nodePath: rulesetPath,
    });

    this.ruleToDelete = null;
    this.onBackToRuleset();
  }

  private onCancelDeleteRule() {
    this.ruleToDelete = null;
  }

  private onBackToRuleset() {
    this.selectedRule = null;
    Tornado.setSelectedRuleName("");
  }

  @Watch("editMode")
  // eslint-disable-next-line
  async onEditModeChanged(value: boolean) {
    if (
      this.details &&
      Tornado.selectedRuleName !== "" &&
      this.details.type == "Ruleset"
    ) {
      for (const rule of this.details.rules) {
        if (rule.name === Tornado.selectedRuleName) {
          this.selectedRule = rule;
          break;
        }
      }
      // The selected rule is not found so close the rule details
      this.onBackToRuleset();
    }
  }

  private existsRuleWithName(ruleName: string) {
    if (this.details && this.details.type === "Ruleset") {
      for (const rule of this.details.rules) {
        if (rule.name === ruleName) {
          return true;
        }
      }
    }
    return false;
  }

  private getNewRuleName(counter = 0): string {
    let newRuleName = "New_rule";
    if (counter > 0) {
      newRuleName += "_" + counter;
    }
    if (this.existsRuleWithName(newRuleName)) {
      newRuleName = this.getNewRuleName(++counter);
    }
    return newRuleName;
  }

  private async onAddRule() {
    const newRuleName = this.getNewRuleName();
    let rule: RuleCompleteDto = {
      operators_extractors_actions: {
        where: null,
        with: [],
        actions: [],
      },
      name: newRuleName,
      description: "",
      continue: true,
      active: true,
      actions: [],
    };

    let rulesetPath = [...this.parentNodePath];
    rulesetPath.push(this.details.name);
    Tornado.addRuleToRuleset({ rule, nodePath: rulesetPath });

    this.onRuleClicked(rule);
  }

  private async onUpdateRule(params: {
    newRule: RuleCompleteDto;
    oldRule: RuleCompleteDto;
  }) {
    let rulesetPath = [...this.parentNodePath];
    rulesetPath.push(this.details.name);
    Tornado.updateRuleInRuleset({
      newRule: params.newRule,
      oldRule: params.oldRule,
      nodePath: rulesetPath,
    });
    this.onRuleClicked(params.newRule);
  }
}
</script>

<style lang="scss">
.ruleset-details-container .delete-rule-confirmation-modal {
  .cv-button.bx--btn.bx--btn--primary {
    background-color: #fa4d56;
  }
}

.with-extractor-container,
.action {
  position: relative;

  .flasher {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;

    &:before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 0;
      height: 0;
      background: $tag-text-01;
      opacity: 0;
      border-radius: 3000px;
      z-index: 100;
      animation-name: flashing;
      animation-duration: 1.75s;
      animation-iteration-count: 1;
    }
  }
}

@keyframes flashing {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
  }
  15% {
    opacity: 0.1;
  }
  30% {
    width: 1300px;
    height: 1300px;
    opacity: 0.1;
  }
  90% {
    width: 1300px;
    height: 1300px;
    opacity: 0;
  }
}
</style>

<style lang="scss" scoped>
.filter-name {
  position: relative;
}

.input-view-mode {
  .bx--text-input {
    line-height: 40px;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    -ms-overflow-style: none;
    scrollbar-width: none;
    background-color: $ui-input;
    border-bottom: 1px solid $ui-input-border !important;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

h5 {
  margin-bottom: $spacing-03;
}

h4 {
  border-top: solid 1px $ui-background;
  padding: $spacing-05;
  padding-bottom: $spacing-03;
  line-height: 100%;
}

.properties-grid {
  padding: 0 !important;
  margin: $spacing-05;
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
.rule-name-container {
  display: flex;
}
.selected-rule-name {
  opacity: 1;
  @include ellipsis;
  display: block;
  margin-left: 6px;
}

.selected-rule-animation-enter-active,
.selected-rule-animation-leave-active {
  transition-timing-function: carbon--motion(standard, expressive);
  transition: opacity $slow-01;
}

.selected-rule-animation-enter,
.selected-rule-animation-leave-to {
  opacity: 0;
}

.rule-animation-container {
  overflow-x: clip;
}

.sliding-element {
  display: flex;
  left: 0;
  position: relative;
  width: calc(945px * 2);
  transition-timing-function: carbon--motion(standard, productive);
  transition: all $slow-01;

  &.slided {
    left: -100%;

    .rule-details-component {
      margin-bottom: 0;
    }
  }

  .sliding-element {
    transition-delay: $fast-01;
  }

  .rules-table-component {
    transition-delay: calc(#{$slow-01} + #{$fast-01});
  }

  .rules-table-component,
  .rule-details-component {
    min-width: 945px;
  }

  .rules-table-component {
    transition-timing-function: carbon--motion(standard, productive);
    transition: all $fast-01;
  }

  .rule-details-component {
    transition-timing-function: carbon--motion(standard, productive);
    transition: all $fast-01;
    margin-bottom: -358px;
  }
}
</style>
