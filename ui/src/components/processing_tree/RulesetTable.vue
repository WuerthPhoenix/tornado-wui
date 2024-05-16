<template>
  <div class="ruleset-table-container">
    <cv-data-table-skeleton
      class="rules-table"
      :columns="columns"
      :rows="rulesCount"
      v-if="isLoading"
    ></cv-data-table-skeleton>
    <cv-data-table v-else class="rules-table" ref="table">
      <template slot="headings">
        <cv-data-table-heading
          class="rule-event-status-header"
          :class="{
            'rule-event-status-header--active': eventProcessedRules != null,
          }"
          ><FlashFilled16
        /></cv-data-table-heading>
        <cv-data-table-heading
          class="rule-actions-cell"
        ></cv-data-table-heading>
        <cv-data-table-heading
          class="rule-actions-cell"
        ></cv-data-table-heading>
        <cv-data-table-heading class="rule-name-cell">{{
          $tc("views.processing_tree.name")
        }}</cv-data-table-heading>
        <cv-data-table-heading class="rule-actions-header">{{
          $tc("views.processing_tree.actions")
        }}</cv-data-table-heading>
        <cv-data-table-heading class="rule-description-header">{{
          $tc("views.processing_tree.description")
        }}</cv-data-table-heading>
        <cv-data-table-heading class="continue-cell-header">{{
          $tc("views.processing_tree.continue")
        }}</cv-data-table-heading>
        <cv-data-table-heading class="actions-cell-header">
        </cv-data-table-heading>
      </template>
      <template slot="data">
        <draggable
          v-model="sortableRules"
          handle=".drag"
          class="dragable"
          @end="onEnd"
        >
          <cv-data-table-row
            v-for="(rule, index) in sortableRules"
            :key="`${index}`"
            :value="`${rule.name}`"
          >
            <td @click="clickedRule(rule)" class="rule-event-status-cell">
              <cv-tooltip direction="right" :tip="showTip(rule)">
                <div
                  class="match-cell"
                  :class="{
                    'event-run': showEventHighlighted(rule),
                    matched: ruleIsMatched(rule),
                    'partially-matched': ruleIsPartiallyMatched(rule),
                    'event-blocked':
                      willEventProcessingContinueFromThisRule(rule),
                  }"
                >
                  <div class="match-line-before"></div>
                  <div class="match-icon">
                    <img
                      alt="icon"
                      src="@/assets/images/circle.svg"
                      v-if="
                        ruleIsPartiallyMatched(rule) ||
                        (ruleIsPartiallyMatched(rule) &&
                          willEventProcessingContinueFromThisRule(rule))
                      "
                    />
                    <img
                      alt="icon"
                      src="@/assets/images/dot.svg"
                      v-if="
                        ruleIsMatched(rule) ||
                        (ruleIsMatched(rule) &&
                          willEventProcessingContinueFromThisRule(rule))
                      "
                    />
                  </div>
                  <div class="match-line-after"></div>
                </div>
              </cv-tooltip>
            </td>
            <td
              @click="clickedRule(rule)"
              class="rule-event-drag-cell"
              :class="{ drag: currentEditMode }"
            >
              <Draggable16 v-if="currentEditMode" />
            </td>
            <td @click="clickedRule(rule)" class="rule-actions-cell">
              <ChevronRight16 />
            </td>
            <td @click="clickedRule(rule)" class="rule-name">
              <div class="rule-name__container">
                <Misuse16 v-if="!rule.active" />
                <span class="rule-name__text">
                  {{ rule.name }}
                </span>
              </div>
            </td>
            <td @click="clickedRule(rule)" class="rule-actions">
              <div class="rule-actions__container">
                <cv-tag
                  kind="gray"
                  class="rule-actions__tag"
                  v-for="(action, index) in rule.actions"
                  :key="`${index}`"
                  :label="`${action}`"
                />
              </div>
            </td>
            <td @click="clickedRule(rule)" class="rule-description">
              {{ rule.description }}
            </td>
            <td @click="clickedRule(rule)">
              <cv-tag v-if="rule.continue" kind="gray" label="C" />
            </td>
            <td class="actions-cell">
              <cv-button
                kind="ghost"
                size="sm"
                class="delete-rule-button"
                v-if="currentEditMode"
                @click="deleteRule(rule)"
              >
                <TrashCan16 />
              </cv-button>
            </td>
          </cv-data-table-row>
        </draggable>
      </template>
      <template slot="actions">
        <div class="add-rule-action-container">
          <cv-button
            kind="primary"
            size="field"
            @click="addRule"
            v-if="currentEditMode"
            >{{ $tc("views.processing_tree.add_rule") }}
          </cv-button>
        </div>
      </template>
    </cv-data-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ProcessedRuleStatusDto } from "@/utils/TornadoDtoEnum";
import i18n from "@/utils/i18n";
import draggable from "vuedraggable";
// @ts-ignore
import RadioButtonChecked16 from "@carbon/icons-vue/es/radio-button--checked/16";
// @ts-ignore
import RadioButton16 from "@carbon/icons-vue/es/radio-button/16";
// @ts-ignore
import FlashFilled16 from "@carbon/icons-vue/es/flash--filled/16";
// @ts-ignore
import ChevronRight16 from "@carbon/icons-vue/es/chevron--right/16";
// @ts-ignore
import Misuse16 from "@carbon/icons-vue/es/misuse/16";
// @ts-ignore
import Draggable16 from "@carbon/icons-vue/es/draggable/16";
// @ts-ignore
import TrashCan16 from "@carbon/icons-vue/es/trash-can/16";
import Tornado, {
  ProcessingTreeNodeDetailsDto,
  RuleWithProcessedStatusDto,
} from "@/store/tornado";
import { ProcessedRuleDto, ProcessedRulesDto } from "tornado-backend-dto";

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
  CvDataTableHeading,
  CvDataTableSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-data-table";

@Component({
  components: {
    draggable,
    RadioButtonChecked16,
    FlashFilled16,
    ChevronRight16,
    TrashCan16,
    Draggable16,
    Misuse16,
    RadioButton16,
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
export default class RulesetTable extends Vue {
  @Prop() public details!: ProcessingTreeNodeDetailsDto;
  @Prop() public rulesCount!: number;
  @Prop({ default: null })
  public eventProcessedRules!: ProcessedRulesDto | null;

  public sortableRules: RuleWithProcessedStatusDto[] = [];
  public stoppedRule: RuleWithProcessedStatusDto | null = null;
  @Watch("eventProcessedRules", { immediate: true, deep: true })
  public OnProcess(): void {
    this.createSortableRules();
    this.stoppedRule = null;
  }

  @Watch("details", { immediate: true, deep: true })
  public onRulesChanged(): void {
    this.createSortableRules();
  }

  public columns = [
    "",
    "",
    i18n.tc("views.processing_tree.name"),
    i18n.tc("views.processing_tree.actions"),
    i18n.tc("views.processing_tree.description"),
    i18n.tc("views.processing_tree.continue"),
    "",
  ];

  get isLoading(): boolean {
    return !this.details;
  }

  get currentEditMode(): boolean {
    return Tornado.editMode;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public onEnd(e: any): void {
    const ruleWithProcessedStatus = this.sortableRules[e.newIndex];
    if (
      this.details &&
      this.details.type === "Ruleset" &&
      this.isRuleIndexChanged(e)
    ) {
      for (const rule of this.details.rules) {
        if (rule.name === ruleWithProcessedStatus.name) {
          this.$emit(
            "reorderRule",
            e.newIndex,
            e.oldIndex,
            ruleWithProcessedStatus
          );
          break;
        }
      }
    }
  }

  private getRuleProcessedDto(ruleName: string): ProcessedRuleDto | null {
    if (this.eventProcessedRules !== null) {
      for (const rule of this.eventProcessedRules.rules) {
        if (rule.name === ruleName) {
          return rule;
        }
      }
    }

    return null;
  }

  private isRuleIndexChanged(e: any): boolean {
    return e.oldIndex !== e.newIndex;
  }

  private showTip(rule: RuleWithProcessedStatusDto): string {
    if (this.willEventProcessingContinueFromThisRule(rule)) {
      return i18n.tc("views.processing_tree.stopped");
    } else if (this.ruleIsMatched(rule)) {
      return i18n.tc("views.processing_tree.matched");
    } else if (this.ruleIsPartiallyMatched(rule)) {
      return i18n.tc("views.processing_tree.partially-matched");
    }
    return i18n.tc("views.processing_tree.not-matched");
  }
  private willEventProcessingContinueFromThisRule(
    rule: RuleWithProcessedStatusDto
  ) {
    if (this.eventProcessedRules == null) return false;
    if (this.stoppedRule != null) {
      let ruleIndex = this.findRuleIndex(this.stoppedRule);
      return rule.name === this.sortableRules[ruleIndex].name;
    }
    for (const previousRule of this.sortableRules) {
      if (this.ruleIsMatched(rule) && !rule.continue) {
        this.stoppedRule = rule;
        return true;
      }

      if (previousRule.name === rule.name) {
        break;
      }
    }

    return false;
  }

  private showEventHighlighted(rule: RuleWithProcessedStatusDto) {
    if (this.eventProcessedRules == null) {
      return false;
    }
    if (this.stoppedRule == null) {
      if (rule.active === false) {
        return true;
      } else {
        const canBeHighlithed = this.eventRun(rule);
        const mustBeHighlighted = this.showDisabledRuleHighlight(rule);
        return canBeHighlithed || mustBeHighlighted;
      }
    }
    if (rule.active === false) {
      return this.showDisabledRuleHighlight(rule);
    } else {
      const canBeHighlithed = this.eventRun(rule);
      const mustBeHighlighted = this.showDisabledRuleHighlight(rule);
      return canBeHighlithed && mustBeHighlighted;
    }
  }
  private eventRun(rule: RuleWithProcessedStatusDto): boolean {
    return (
      rule.processedStatus?.status === ProcessedRuleStatusDto.Matched ||
      rule.processedStatus?.status ===
        ProcessedRuleStatusDto.PartiallyMatched ||
      rule.processedStatus?.status === ProcessedRuleStatusDto.NotMatched
    );
  }

  private showDisabledRuleHighlight(rule: RuleWithProcessedStatusDto): boolean {
    if (this.eventProcessedRules != null && this.stoppedRule != null) {
      return this.findRuleIndex(rule) <= this.findRuleIndex(this.stoppedRule);
    }
    return false;
  }

  private ruleIsMatched(rule: RuleWithProcessedStatusDto): boolean {
    return (
      rule.processedStatus !== null &&
      rule.processedStatus.status === ProcessedRuleStatusDto.Matched
    );
  }

  private ruleIsPartiallyMatched(rule: RuleWithProcessedStatusDto): boolean {
    return (
      rule.processedStatus !== null &&
      rule.processedStatus.status === ProcessedRuleStatusDto.PartiallyMatched
    );
  }

  private clickedRule(ruleWithProcessedStatus: RuleWithProcessedStatusDto) {
    if (this.details && this.details.type === "Ruleset") {
      for (const rule of this.details.rules) {
        if (rule.name === ruleWithProcessedStatus.name) {
          this.$emit("clickedRule", rule);
          break;
        }
      }
    }
  }

  private addRule() {
    this.$emit("addRule");
  }

  private deleteRule(ruleWithProcessedStatus: RuleWithProcessedStatusDto) {
    if (this.details && this.details.type === "Ruleset") {
      for (const rule of this.details.rules) {
        if (rule.name === ruleWithProcessedStatus.name) {
          this.$emit("deleteRule", rule);
          break;
        }
      }
    }
  }
  private createSortableRules() {
    this.sortableRules = [];
    if (this.details && this.details.type === "Ruleset") {
      for (const rule of this.details.rules) {
        const ruleWithResult: RuleWithProcessedStatusDto = {
          name: rule.name,
          description: rule.description,
          continue: rule.continue,
          active: rule.active,
          actions: rule.actions,
          operators_extractors_actions: rule.operators_extractors_actions,
          processedStatus: this.getRuleProcessedDto(rule.name),
        };
        this.sortableRules.push(ruleWithResult);
      }
    }
  }

  public findRuleIndex(rule: RuleWithProcessedStatusDto): number {
    const index = this.sortableRules.findIndex(
      (r: RuleWithProcessedStatusDto) => r.name === rule.name
    );
    return index;
  }
}
</script>
<style>
.rule-event-status-cell {
  padding: 0 !important;
}
.rule-event-status-cell .cv-tooltip {
  position: absolute !important;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.dragable tr:last-child .rule-event-status-cell {
  .cv-tooltip {
    max-height: calc(50% + 5px);
  }
  .match-line-after {
    display: none;
  }
}
</style>
<style lang="scss" scoped>
.bx--data-table tbody tr:hover .rule-name button {
  color: $text-primary;
}
.drag {
  svg:hover {
    cursor: grab;
  }
}
.dragable {
  display: contents;
}
.sortable-chosen {
  & td {
    background: $layer-hover;
  }
  background: $layer-hover;
}
.rules-table {
  overflow-wrap: anywhere;

  .continue-cell-header {
    min-width: 100px;
  }

  .rule-actions-cell {
    width: 20px;
    padding-left: $spacing-03;
    padding-right: $spacing-03;
    svg {
      display: flex;
      fill: $ui-05;
    }
  }

  .rule-name-cell {
    padding: 0;
  }

  .rule-actions-header {
    width: 118px;
    padding: 0;
  }

  .rule-actions {
    padding: 0;
    &__container {
      display: flex;
      justify-content: space-between;
      max-width: 118px;
      flex-wrap: wrap;
    }
    &__tag {
      margin-right: 0;
      margin-left: 0;
    }
  }

  .rule-description-header {
    width: 275px;
    padding-left: $spacing-06;
    padding-right: 0;
  }

  .rule-name {
    display: table-cell;
    height: inherit;
    align-items: center;
    max-width: 228px;
    padding: 0 $spacing-03 0 0;
    button {
      color: $text-secondary;
      width: 100%;
      font-size: 14px;
    }

    svg {
      fill: $disabled-icon;
      margin-right: $spacing-03;
    }

    &__container {
      display: flex;
      align-items: center;
    }
    &__text {
      @include ellipsis;
      max-width: 212px;
    }
  }

  .rule-description {
    @include ellipsis;
    max-width: 275px;
    padding-left: $spacing-06;
    padding-right: 0;
  }

  .rule-event-status-cell {
    width: 20px;
    padding-left: $spacing-03;
    padding-right: $spacing-03;
    svg {
      display: flex;
      fill: $ui-05;
    }
  }

  .rule-event-drag-cell {
    width: 20px;
    padding-left: $spacing-03;
    padding-right: $spacing-03;
    svg {
      display: flex;
      fill: $ui-05;
    }
  }

  .rule-event-status-header {
    width: 20px;
    padding-left: $spacing-03;
    padding-right: $spacing-03;
    svg {
      fill: $text-05;
    }
    &--active {
      svg {
        fill: #ffbf1a;
      }
    }
  }

  .actions-cell,
  .actions-cell-header {
    width: 96px;
    padding-right: 0;
    padding-left: 0;

    .delete-rule-button {
      top: 0;
      color: unset !important;
      padding: $spacing-03 !important;
      height: $spacing-08;
      width: $spacing-08;
    }
  }

  .actions-cell {
    opacity: 0;
    text-align: right;
  }

  td {
    height: 100%;
    position: relative;
    cursor: pointer;
  }

  .cell-content-container {
    position: absolute;
    top: 0;
    height: 100%;
  }

  .match-cell.event-run {
    display: flex;
    flex-direction: column;
    position: relative;
    top: 0;
    height: calc(100% + 1px);
    .match-icon {
      justify-content: center;
      display: flex;

      svg {
        fill: $text-05;
      }
    }

    .match-line-after,
    .match-line-before {
      flex-grow: 1;
    }

    &.matched,
    &.partially-matched,
    &:not(.event-blocked) {
      .match-line-before {
        width: 0;
        align-self: center;
        border-left: solid 2px rgba(255, 191, 26, 0.5);
      }
    }

    &.partially-matched,
    .event-blocked {
      .match-line-after {
        width: 0;
        align-self: center;
        border-left: solid 2px rgba(255, 191, 26, 0.5);
      }
    }

    &:not(.event-blocked) {
      .match-line-after {
        width: 0;
        align-self: center;
        border-left: solid 2px rgba(255, 191, 26, 0.5);
      }
    }
  }
  .matched:not(.event-run) {
    .match-icon {
      opacity: 0;
    }
  }
  .add-rule-action-container {
    display: flex;
    align-self: flex-end;
    height: $spacing-08;
  }
}
</style>

<style lang="scss">
.rules-table {
  .bx--data-table-content {
    overflow-x: hidden !important;
  }

  .bx--data-table-container {
    padding-top: 0;

    tr {
      height: 40px;

      &:hover {
        .actions-cell {
          opacity: 1 !important;
        }
      }
    }
  }

  .cv-tag {
    cursor: pointer;
    background-color: $tag-00;
    span {
      color: $tag-text-00;
    }
  }
}
</style>
