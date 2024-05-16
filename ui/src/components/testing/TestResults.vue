<template>
  <div class="test-results-column">
    <ul>
      <!-- No errors tab at the moment -->
      <li
        v-if="false"
        class="test-results-tab test-results-tab--errors"
        :class="
          accordionStatus[TestResultsTabType.errors].is_open &&
          'test-results-tab--expanded'
        "
        :data-disabled="!checkIfTypeIsPresent(TestResultsTabType.errors)"
      >
        <button
          @click="toggleTab(TestResultsTabType.errors)"
          type="button"
          class="test-results-tab-btn"
          :class="checkIfTypeIsPresent(TestResultsTabType.errors) && 'active'"
        >
          <span class="label">
            <span>Errors</span>
            <span> {{ accordionStatus[TestResultsTabType.errors].count }}</span>
          </span>
          <span class="chevron">
            <ChevronDown20 />
          </span>
        </button>
        <span class="bg"></span>
        <ul class="tab-content">
          <li>
            <TestResponseErrors @countChangedResults="updateCount" />
          </li>
        </ul>
      </li>
      <li
        v-if="openedNodeIsRuleset"
        class="test-results-tab test-results-tab--actions"
        :class="[
          accordionStatus[TestResultsTabType.actions].is_open &&
            'test-results-tab--expanded',
          checkIfTypeIsPresent(TestResultsTabType.errors) && 'errors-detected',
        ]"
        :data-disabled="!checkIfTypeIsPresent(TestResultsTabType.actions)"
      >
        <button
          @click="toggleTab(TestResultsTabType.actions)"
          type="button"
          class="test-results-tab-btn"
          :class="[
            checkIfTypeIsPresent(TestResultsTabType.actions) && 'active',
          ]"
        >
          <span class="label">
            <span>Actions</span>
            <span>
              {{ accordionStatus[TestResultsTabType.actions].count }}</span
            >
          </span>
          <span class="chevron">
            <ChevronDown20 />
          </span>
        </button>
        <span class="bg"></span>
        <ul class="tab-content">
          <li>
            <TestResponseActions @countChangedResults="updateCount" />
          </li>
        </ul>
      </li>
      <li
        v-if="openedNodeIsRuleset"
        class="test-results-tab test-results-tab--variables"
        :class="[
          accordionStatus[TestResultsTabType.variables].is_open &&
            'test-results-tab--expanded',
          checkIfTypeIsPresent(TestResultsTabType.errors) && 'errors-detected',
        ]"
        :data-disabled="!checkIfTypeIsPresent(TestResultsTabType.variables)"
      >
        <button
          @click="toggleTab(TestResultsTabType.variables)"
          type="button"
          class="test-results-tab-btn"
          :class="[
            checkIfTypeIsPresent(TestResultsTabType.variables) && 'active',
          ]"
        >
          <span class="label">
            <span>Variables</span>
            <span>
              {{ accordionStatus[TestResultsTabType.variables].count }}</span
            >
          </span>
          <span class="chevron">
            <ChevronDown20 />
          </span>
        </button>
        <span class="bg"></span>
        <ul class="tab-content">
          <li>
            <TestResponseVariables @countChangedResults="updateCount" />
          </li>
        </ul>
      </li>
    </ul>
    <WarningNoRuleSelected v-if="!openedNodeIsRuleset" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TestResponseErrors from "@/components/testing/TestResponseErrors.vue";
import TestResponseActions from "@/components/testing/TestResponseActions.vue";
import TestResponseVariables from "@/components/testing/TestResponseVariables.vue";

import {
  CvAccordion,
  CvAccordionItem,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-accordion";
// @ts-ignore
import ChevronDown20 from "@carbon/icons-vue/es/chevron--down/20";

import { TestResultsTabStatus } from "@/utils/types";
import { TestResultsTabType } from "@/utils/types";
import WarningNoRuleSelected from "@/components/testing/WarningNoRuleSelected.vue";
import { getNodeByPath } from "@/utils/processingTreeUtils";
import Tornado from "@/store/tornado";

@Component({
  name: "TestResults",
  components: {
    WarningNoRuleSelected,
    TestResponseErrors,
    TestResponseActions,
    TestResponseVariables,
    CvAccordion,
    CvAccordionItem,
    ChevronDown20,
  },
})
export default class TestResults extends Vue {
  public TestResultsTabType = TestResultsTabType;
  public accordionStatus: TestResultsTabStatus[] = [
    {
      is_open: false,
      is_disabled: false,
      count: 0,
    },
    {
      is_open: false,
      is_disabled: false,
      count: 0,
    },
    {
      is_open: false,
      is_disabled: false,
      count: 0,
    },
  ];

  get openedNodeIsRuleset(): boolean {
    const currentOpenedNode = getNodeByPath(
      Tornado.visibleTree,
      Tornado.openedNodeDetailsPath
    );
    return (
      Tornado.openedNodeDetailsPath.length > 0 &&
      currentOpenedNode !== undefined &&
      currentOpenedNode.type == "Ruleset"
    );
  }

  private updateCount(payload: {
    target: TestResultsTabType;
    count: number;
  }): void {
    this.accordionStatus[payload.target].count = payload.count;
    if (payload.count) {
      this.accordionStatus[payload.target].is_open = true;
    }
  }

  private toggleTab(tabIndex: number): void {
    this.accordionStatus[tabIndex].is_open =
      !this.accordionStatus[tabIndex].is_open;
  }

  private checkIfTypeIsPresent(type: TestResultsTabType): boolean {
    return this.accordionStatus[type].count > 0;
  }
}
</script>

<style lang="scss">
.test-results-column {
  width: 100%;
  height: calc(100vh - 3rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.test-results-tab {
  position: sticky;
  border-top: 2px solid var(--ui-00);

  &:first-child {
    border-top: 0;
  }

  .no-extracted-variables-message {
    margin-bottom: 0.25rem;
  }

  &:last-child {
    border-bottom: 0;
  }

  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    transition-property: background-color;
    transition-timing-function: carbon--motion(standard, expressive);
    transition-duration: $moderate-01;
  }

  &--errors {
    top: 0;

    .bg {
      background-color: rgba(250, 77, 86, 0.1);
    }

    .test-results-tab-btn:hover ~ .bg {
      background: rgba(250, 77, 86, 0.2);
    }
  }

  &--actions {
    top: 0;

    &.errors-detected {
      top: calc(3rem + 2px);
    }

    .bg {
      background-color: var(--cds-ui-background, #f4f4f4);
    }

    .test-results-tab-btn:hover ~ .bg {
      background-color: var(--ui-11);
    }
  }

  &--variables {
    top: calc(3rem);

    &.errors-detected {
      top: calc(6rem + 4px);
    }

    .bg {
      background-color: var(--cds-ui-background, #f4f4f4);
    }

    .test-results-tab-btn:hover ~ .bg {
      background-color: var(--ui-11);
    }
  }

  .tab-content {
    position: relative;
    z-index: 1;
    max-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition-property: max-height;
    transition-timing-function: carbon--motion(standard, expressive);
    transition-duration: $moderate-01;
  }

  &--expanded {
    .chevron {
      transform: rotate(180deg);
    }
    .tab-content {
      overflow: visible;
      max-height: 100vh !important;
    }
  }

  &-btn {
    position: relative;
    border: 0;
    width: 100%;
    height: 3rem;
    color: $ui-05;
    display: flex;
    font-size: 0.875rem;
    align-items: center;
    justify-content: space-between;
    background-color: transparent;
    padding: 0 1rem;
    transition-property: background-color;
    transition-timing-function: carbon--motion(standard, expressive);
    transition-duration: $moderate-01;
    cursor: pointer;
    z-index: 1;

    .chevron {
      display: block;
      height: 20px;
    }

    .label {
      font-weight: bold;
      display: inline-flex;
      gap: 0 0.4rem;

      span:nth-child(1) {
        color: $text-05;
      }

      span:nth-child(2) {
        color: $text-05;
      }
    }

    &.active {
      .label {
        span:nth-child(1) {
          color: $ui-05;
        }
      }
    }
  }
}
</style>
