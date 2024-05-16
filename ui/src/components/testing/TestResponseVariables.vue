<template>
  <div class="tab-variable-content">
    <ul class="extracted-variables-container" v-if="counter > 0">
      <li
        v-for="(extractedVariables, index) in extractedVariablesByRule"
        :key="`ruleset-variables-${index}`"
      >
        <span class="ruleset-separator">Rule {{ index }}</span>
        <ul>
          <li
            v-for="(extractedVariable, index) in extractedVariables"
            :key="index"
            class="rule"
            :class="extractedVariable.rule"
          >
            <span
              class="status"
              :class="{
                extracted: isVariableExtracted(extractedVariable.rule),
              }"
            >
              <span
                class="circle"
                :class="extractedVariableClass(extractedVariable.rule)"
              >
                <RadioButtonChecked16
                  v-if="
                    extractedVariableExtractedCurrentRule(
                      extractedVariable.rule
                    )
                  "
                />
              </span>
            </span>
            <span
              class="variable-name"
              :class="{
                'variable-name--active': extractedVariableExtractedCurrentRule(
                  extractedVariable.rule
                ),
              }"
              >{{ extractedVariable.variable }}</span
            >
            <span
              class="variable-value"
              v-if="extractedVariable.value.length"
              >{{ extractedVariable.value }}</span
            >
            <span class="variable-value" v-else>""</span>
            <button
              type="button"
              class="variable-hover-icon"
              @click="
                showVariableInRuleset(
                  extractedVariable.rule,
                  `${extractedVariable.variable}-${index}`
                )
              "
            >
              <cv-tooltip
                alignment="center"
                direction="bottom"
                data-wp-direction="bottom-right"
                :tip="$tc('test_window.show_variable_in_ruleset')"
              >
                <IconGoToCode />
              </cv-tooltip>
            </button>
          </li>
        </ul>
      </li>
    </ul>
    <div class="no-extracted-variables-message" v-else>
      {{ $tc("test_window.no_extracted_variables_found") }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

// @ts-ignore
import View20 from "@carbon/icons-vue/es/view/20";
// @ts-ignore
import RadioButtonChecked16 from "@carbon/icons-vue/es/radio-button--checked/16";
// @ts-ignore
import { RuleDetailsDto } from "tornado-backend-dto";

import Tornado, {
  ExtractedVariableDto,
  ProcessingTreeNodeDto,
} from "@/store/tornado";

import { getNodeByPath } from "@/utils/processingTreeUtils";

// @ts-ignore
import { CvTag } from "@carbon/vue/src/components/cv-tag";
// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";

import { TestResultsTabType } from "@/utils/types";
import IconGoToCode from "@/components/testing/icons/IconGoToCode.vue";

@Component({
  name: "TestResponseVariables",
  components: {
    IconGoToCode,
    View20,
    RadioButtonChecked16,
    CvTag,
    CvTooltip,
  },
})
export default class TestResponseVariables extends Vue {
  @Prop({ default: true }) public isOpen!: boolean;
  private tornadoStore = Tornado;
  private selectedRulesetOrderedRules: string[] = [];
  public counter = 0;

  get extractedVariablesByRule(): Record<string, ExtractedVariableDto> {
    let orderedExtractedVariables: Record<string, ExtractedVariableDto> = {};

    if (
      this.nodeByPath &&
      this.nodeByPath.details &&
      this.nodeByPath.details.type == "Ruleset"
    ) {
      this.selectedRulesetOrderedRules = this.nodeByPath.details.rules.map(
        (a: RuleDetailsDto) => {
          return a.name;
        }
      );
      this.counter = 0;
      if (this.selectedRulesetOrderedRules.length) {
        this.selectedRulesetOrderedRules.forEach((ruleName) => {
          const filter = Tornado.extractedVariables.filter((variable) => {
            return variable.rule === ruleName;
          });
          if (filter.length) {
            filter.sort((a, b) => a.variable.localeCompare(b.variable));
            this.counter += filter.length;
            this.$set(orderedExtractedVariables, ruleName, filter);
          }
        });
      }
    }

    return orderedExtractedVariables;
  }

  @Watch("extractedVariablesByRule", { deep: true, immediate: true })
  onPropertyChanged(): void {
    this.$emit("countChangedResults", {
      target: TestResultsTabType.variables,
      count: this.counter,
    });
  }

  get nodeByPath(): ProcessingTreeNodeDto | undefined {
    return getNodeByPath(Tornado.visibleTree, Tornado.openedNodeDetailsPath);
  }

  private getIndexSelectedRule(): number {
    return this.selectedRulesetOrderedRules.indexOf(Tornado.selectedRuleName);
  }

  private isVariableExtracted(extractedVariableRuleName: string): boolean {
    const indexSelectedRule = this.getIndexSelectedRule();

    return (
      indexSelectedRule >= 0 &&
      this.selectedRulesetOrderedRules.indexOf(extractedVariableRuleName) ===
        indexSelectedRule
    );
  }

  private extractedVariableExtractedCurrentRule(
    extractedVariableRuleName: string
  ): boolean {
    const indexSelectedRule = this.getIndexSelectedRule();

    return (
      indexSelectedRule >= 0 &&
      this.selectedRulesetOrderedRules.indexOf(extractedVariableRuleName) ===
        indexSelectedRule
    );
  }

  private extractedVariableClass(extractedVariableRuleName: string): string {
    let extractedVariableClass = "";
    if (
      Tornado.selectedRuleName !== "" &&
      this.isVariableExtracted(extractedVariableRuleName)
    ) {
      if (
        this.extractedVariableExtractedCurrentRule(extractedVariableRuleName)
      ) {
        extractedVariableClass = "variable-extracted-current-rule";
      } else {
        extractedVariableClass = "variable-extracted-previous-rules";
      }
    }
    return extractedVariableClass;
  }

  private showVariableInRuleset(ruleName: string, variableName: string): void {
    this.$root.$emit("clickedExtractedVariable", {
      ruleName: ruleName,
      highlightTargetName: variableName,
    });
  }
}
</script>

<style lang="scss">
.tab-variable-content {
  padding: 0.5rem 0 0 0;
  .extracted-variable-title {
    font-size: 1rem;
    margin-bottom: $spacing-05;
  }

  .extracted-variable-select-rule,
  .no-extracted-variables-message {
    color: $text-05;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    position: relative;
    top: -0.75rem;
    .icon {
      vertical-align: bottom;
      top: 2px;
      position: relative;
      fill: $text-05;
    }
  }

  .extracted-variables-count {
    margin-top: 0;
    margin-left: $spacing-02;
  }

  .extracted-variables-container {
    margin-top: 0;

    button {
      border: 0;
      margin: 0;
      padding: 0;
      background-color: transparent;
    }

    .ruleset-separator {
      font-size: 0.675rem;
      opacity: 0.15;
      font-weight: 600;
      padding: 0 1rem 0.5rem 1rem;
      text-transform: uppercase;
      position: relative;
      display: flex;
      align-items: flex-end;
    }

    .rule {
      display: flex;
      font-size: 0.875rem;
      line-height: 1rem;
      min-height: 2.25rem;
      padding: 0 1rem;
      transition-property: background;
      transition-timing-function: carbon--motion(standard, expressive);
      transition-duration: $moderate-01;
      align-items: center;

      &:last-child {
        margin-bottom: $spacing-03;
      }

      &:last-child {
        margin-bottom: 1.75rem;
      }

      &:hover {
        background: $ui-11;
      }

      .status {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .circle {
          min-width: 10px;
          min-height: 10px;
          border-radius: 100%;
          background: $active-ui;
          margin-right: $spacing-05;
          max-height: 1rem;
        }
      }

      .variable-name {
        color: $ui-input-border;
        margin-right: $spacing-03;
        align-self: center;
        font-family: "IBM Plex Mono";

        &--active {
          color: $button-text;
        }
      }

      .variable-value {
        color: $button-text;
        align-self: center;
        font-family: "IBM Plex Mono";
        flex-grow: 1;
      }

      .variable-hover-icon {
        pointer-events: none;
        opacity: 0;
        text-align: right;
        padding-right: 0.125rem;
        transition-property: opacity;
        transition-timing-function: carbon--motion(standard, expressive);
        transition-duration: $moderate-01;
        display: flex;
        justify-content: center;
        align-items: center;

        svg {
          width: 1.1rem;
          height: 1.1rem;
          object-fit: contain;
        }
      }

      &:hover {
        .variable-hover-icon {
          pointer-events: all;
          opacity: 1;
        }
      }
    }

    .extracted {
      .variable-extracted-previous-rules.circle {
        background: #ffbf1a !important;
      }

      .variable-extracted-current-rule.circle {
        background: none !important;
        margin-left: -2px;
        margin-right: calc(#{$spacing-05} - 2px);

        svg {
          fill: #ffbf1a;
        }
      }
    }
  }
}
</style>
