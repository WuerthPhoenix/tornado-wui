<template>
  <div class="tab-action-content">
    <ul class="triggered-actions-container" v-if="counter > 0">
      <li
        v-for="(triggeredActions, index) in triggeredActionsByRule"
        :key="`ruleset-actions-${index}`"
      >
        <span class="ruleset-separator">Rule {{ index }}</span>
        <ul>
          <li
            v-for="(triggeredAction, index) in triggeredActions"
            :key="index"
            class="rule"
            :class="triggeredAction.rule"
          >
            <span
              class="trigger-action-controls"
              :class="{
                'trigger-action-controls--expanded':
                  triggeredAction.is_expanded,
              }"
              @click.self="showActionPayload(triggeredAction)"
            >
              <span
                class="status"
                :class="{
                  triggered: isActionTriggered(triggeredAction.rule),
                }"
              >
                <FlashFilled20 />
              </span>
              <span
                class="action-name"
                :class="{
                  'action-name--active': isActionTriggered(
                    triggeredAction.rule
                  ),
                }"
                >{{ triggeredAction.action }}</span
              >

              <!-- Open dropdown for payload -->

              <span class="triggered-action-inline-user-actions">
                <button
                  type="button"
                  class="action-hover-icon"
                  @click.stop="copyPayload(triggeredAction.value)"
                >
                  <cv-tooltip
                    alignment="center"
                    direction="bottom"
                    data-wp-direction="bottom-right"
                    :tip="$tc('test_window.copy_payload')"
                  >
                    <Copy />
                  </cv-tooltip>
                </button>

                <button
                  type="button"
                  class="action-hover-icon"
                  @click.stop="
                    showActionInRuleset(
                      triggeredAction.rule,
                      `${triggeredAction.action}-${index}`
                    )
                  "
                >
                  <cv-tooltip
                    alignment="center"
                    direction="bottom"
                    data-wp-direction="bottom-right"
                    :tip="$tc('test_window.show_actions_in_ruleset')"
                  >
                    <IconGoToCode />
                  </cv-tooltip>
                </button>

                <button
                  type="button"
                  class="action-hover-icon action-hover-icon--expand"
                  :class="{
                    'action-hover-icon--rotate-180':
                      triggeredAction.is_expanded,
                  }"
                  @click="showActionPayload(triggeredAction)"
                >
                  <cv-tooltip
                    alignment="center"
                    direction="bottom"
                    data-wp-direction="bottom-right"
                    :tip="$tc('test_window.show_action_payload')"
                  >
                    <ChevronDown20 />
                  </cv-tooltip>
                </button>
              </span>
            </span>
            <ul
              class="triggered-action-dropdown"
              :class="{
                'triggered-action-dropdown--expanded':
                  triggeredAction.is_expanded,
              }"
            >
              <li>
                <span>
                  <WpJsoneditor
                    class="action-payload-editor"
                    id="action_event_payload"
                    v-model="triggeredAction.value"
                    readonly
                  ></WpJsoneditor>
                  <span class="editor-gutter"></span>
                </span>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <div class="no-triggered-actions-message" v-else>
      {{ $tc("test_window.no_triggered_actions_found") }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

// @ts-ignore
import View20 from "@carbon/icons-vue/es/view/20";
// @ts-ignore
import FlashFilled20 from "@carbon/icons-vue/es/flash--filled/20";
// @ts-ignore
import Copy from "@carbon/icons-vue/es/copy/20";
// @ts-ignore
import ChevronDown20 from "@carbon/icons-vue/es/chevron--down/20";
// @ts-ignore
import { RuleDetailsDto } from "tornado-backend-dto";

import Tornado, {
  TriggeredActionDto,
  ProcessingTreeNodeDto,
} from "@/store/tornado";

import { getNodeByPath } from "@/utils/processingTreeUtils";

// @ts-ignore
import { CvTag } from "@carbon/vue/src/components/cv-tag";

// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";

import { TestResultsTabType } from "@/utils/types";
import IconGoToCode from "@/components/testing/icons/IconGoToCode.vue";
import IconShowEmbedCode from "@/components/testing/icons/IconShowEmbedCode.vue";
import WpJsoneditor from "@/components/JsonEditor.vue";
import Notification from "@/store/notification";
import i18n from "@/utils/i18n";

@Component({
  name: "TestResponseActions",
  components: {
    WpJsoneditor,
    IconGoToCode,
    IconShowEmbedCode,
    View20,
    FlashFilled20,
    CvTag,
    CvTooltip,
    Copy,
    ChevronDown20,
  },
})
export default class TestResponseActions extends Vue {
  @Prop({ default: true }) public isOpen!: boolean;
  private tornadoStore = Tornado;
  private selectedRulesetOrderedRules: string[] = [];
  public counter = 0;

  get triggeredActionsByRule(): Record<string, TriggeredActionDto> {
    let orderedTriggeredActions: Record<string, TriggeredActionDto> = {};

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
          const filter = Tornado.triggeredActions.filter((action) => {
            return action.rule === ruleName;
          });
          if (filter.length) {
            filter.sort((a, b) => a.action.localeCompare(b.action));
            this.counter += filter.length;
            this.$set(orderedTriggeredActions, ruleName, filter);
          }
        });
      }
    }

    return orderedTriggeredActions;
  }

  @Watch("triggeredActionsByRule", { deep: true, immediate: true })
  onPropertyChanged(): void {
    this.$emit("countChangedResults", {
      target: TestResultsTabType.actions,
      count: this.counter,
    });
  }

  get nodeByPath(): ProcessingTreeNodeDto | undefined {
    return getNodeByPath(Tornado.visibleTree, Tornado.openedNodeDetailsPath);
  }

  private getIndexSelectedRule(): number {
    return this.selectedRulesetOrderedRules.indexOf(Tornado.selectedRuleName);
  }

  private isActionTriggered(triggeredActionRuleName: string): boolean {
    const indexSelectedRule = this.getIndexSelectedRule();

    return (
      indexSelectedRule >= 0 &&
      this.selectedRulesetOrderedRules.indexOf(triggeredActionRuleName) ===
        indexSelectedRule
    );
  }

  private showActionPayload(triggeredAction: TriggeredActionDto): void {
    triggeredAction.is_expanded = !triggeredAction.is_expanded;
  }

  private showActionInRuleset(ruleName: string, actionName: string): void {
    this.$root.$emit("clickedTriggeredAction", {
      ruleName: ruleName,
      highlightTargetName: actionName,
    });
  }

  private copyPayload(text: string): void {
    navigator.clipboard.writeText(JSON.stringify(text));
    Notification.addInfo({
      title: i18n.tc("test_window.text_copied"),
      message: "",
    });
  }

  private mounted(): void {
    document
      .querySelector(".action-payload-editor textarea")
      ?.setAttribute("tabindex", "-1");
  }
}
</script>

<style lang="scss">
.tab-action-content {
  padding: 0.5rem 0 0 0;

  .triggered-action-title {
    font-size: 1rem;
    margin-bottom: $spacing-05;
  }

  .jsoneditor-container {
    background-color: transparent !important;

    .jsoneditor:hover {
      background-color: transparent !important;
    }

    .ace_bracket {
      border: 0;
    }

    .ace_editor {
      cursor: default;

      &.ace_hidpi.ace-jsoneditor {
        font-size: 11px !important;
      }
    }

    .ace-jsoneditor .ace_marker-layer {
      .ace_active-line {
        background: transparent;
      }
    }

    .ace_editor,
    .jsoneditor {
      background-color: transparent !important;
    }

    .space-container {
      .space-right {
        background: transparent !important;
      }
    }

    .ace_scroller {
      background: transparent !important;
      pointer-events: none;
    }
  }

  .action-payload-editor {
    height: 15rem;
    z-index: 1;
    transition-property: background;
    transition-timing-function: carbon--motion(standard, expressive);
    transition-duration: $moderate-01;
    cursor: default;

    .ace_cursor-layer {
      display: none !important;
    }

    .jsoneditor-outer {
      padding-bottom: 0 !important;
    }

    // Json editor with minimal lines panel

    .ace_scrollbar {
      background: $ui-11;
    }

    .ace_fold-widget {
      left: 3px;
    }

    .ace_scroller {
      width: 100%;
      left: 37px !important;
      padding-top: 5px;
      padding-left: 38px;
    }

    .ace_gutter {
      width: 37px !important;
      padding-top: 0;
      background: transparent;

      .ace_gutter-active-line {
        background: transparent;
      }

      .ace_gutter-layer {
        width: auto !important;

        .ace_gutter-cell {
          padding-right: 16px !important;
          padding-left: 8px !important;
        }
      }
    }

    .ace_gutter-cell {
      padding: 0 !important;
      font-size: 12px;
      font-family: "IBM Plex Mono";
    }

    .ace_gutter-cell.ace_error {
      background-size: 10px !important;
      background-position-x: 93%;
    }

    // end of json editor lines panel

    .space-container {
      height: 0.5rem;
      .space-left {
        display: none;
      }

      .space-right {
        width: 100%;
        transition-property: background;
        transition-timing-function: carbon--motion(standard, expressive);
        transition-duration: $moderate-01;
      }
    }

    .ace_scroller {
      width: 100%;
      left: 0 !important;
      padding: 0 0.5rem;

      .ace_content {
        height: auto;
        background: transparent !important;
        padding-left: 23px;

        .ace_layer {
          width: calc(100% - 1rem);
        }
      }
    }
  }

  .trigger-action-controls {
    display: flex;
    height: 2.25rem;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    padding: 0 1rem;
    cursor: pointer;

    &--expanded {
      background: $ui-11;
      .action-hover-icon {
        pointer-events: all !important;
        opacity: 1 !important;
        position: relative;

        &--rotate-180 {
          transform: rotate(180deg);
          left: -2px;
        }
      }
    }

    &:hover {
      background: $ui-11;
    }
  }

  .triggered-action-dropdown {
    position: relative;
    z-index: 1;
    width: 100%;

    li {
      max-height: 0;
      overflow: hidden;
      transition-property: all;
      transition-timing-function: carbon--motion(standard, expressive);
      transition-duration: $moderate-01;

      &:hover {
        background: $ui-input-hover;
      }

      & > span {
        display: block;
        width: 100%;
        background-color: var(--cds-field-01, #ffffff);

        .editor-gutter {
          display: block;
          height: 0.5rem;
          background-color: transparent !important;
          margin-top: -1px;
          pointer-events: none;
        }
      }
    }

    &--expanded {
      li {
        max-height: 100vh !important;
      }
    }
  }

  .triggered-action-select-rule,
  .no-triggered-actions-message {
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

  .triggered-actions-count {
    margin-top: 0;
    margin-left: $spacing-02;
  }

  .triggered-actions-container {
    margin-top: 0;

    button {
      border: 0;
      margin: 0;
      padding: 0;
      background-color: transparent;
    }

    .triggered-action-inline-user-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0 0.5rem;
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
      flex-direction: column;
      font-size: 0.875rem;
      line-height: 1rem;
      min-height: 2rem;
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

      .status {
        display: flex;
        align-items: center;
        color: $tag-text-01;
        opacity: 0.2;
        margin-left: -0.2rem;
        margin-right: $spacing-03;
        pointer-events: none;

        svg {
          max-height: 1.125rem;
          object-fit: contain;
        }

        &.triggered {
          opacity: 1;
          color: #ffbf1a !important;
        }
      }

      .action-name {
        color: $ui-input-border;
        margin-right: $spacing-03;
        align-self: center;
        font-family: "IBM Plex Mono";
        text-transform: capitalize;
        flex-grow: 1;
        pointer-events: none;

        &--active {
          color: $button-text;
        }
      }

      .action-value {
        color: $button-text;
        align-self: center;
        font-family: "IBM Plex Mono";
      }

      .action-hover-icon {
        pointer-events: none;
        opacity: 0;
        text-align: right;
        padding-right: 0.125rem;
        flex-grow: 1;
        transition-property: opacity;
        transition-timing-function: carbon--motion(standard, expressive);
        transition-duration: $moderate-01;
        display: flex;
        justify-content: center;
        align-items: center;
        outline: none !important;

        &--expand {
          color: $button-text;
          pointer-events: all !important;
          cursor: pointer;
        }

        svg {
          width: 1.1rem;
          height: 1.1rem;
          object-fit: contain;
        }
      }

      &:hover {
        .action-hover-icon {
          pointer-events: all;
          opacity: 1;
        }
      }
    }

    .triggered {
      .action-triggered-previous-rules.circle {
        background: #ffbf1a !important;
      }

      .action-triggered-current-rule.circle {
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
