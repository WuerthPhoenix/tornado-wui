<template>
  <div class="test-window" :class="{ closed: !isOpen }">
    <cv-tabs
      :container="true"
      class="test-window-tabs"
      @tab-selected="updateCurrentTabManually"
    >
      <cv-tab
        id="test-form"
        :label="$tc('test_window.test_event')"
        :data-selected="currentTab === TypeTabs.form"
        :selected="currentTab === TypeTabs.form"
        class="test-form-tab"
      >
        <TestForm @switchToResultsTab="switchToResultsTab" :is-open="isOpen" />
      </cv-tab>
      <cv-tab
        id="test-result"
        :label="$tc('test_window.test_result')"
        :data-selected="currentTab === TypeTabs.results"
        :selected="currentTab === TypeTabs.results"
      >
        <TestResults />
      </cv-tab>
    </cv-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import TestForm from "@/components/testing/TestForm.vue";
import TestResults from "@/components/testing/TestResults.vue";
// @ts-ignore
import { CvTabs, CvTab } from "@carbon/vue/src/components/cv-tabs";

export enum TypeTabs {
  form = 0,
  results = 1,
}

@Component({
  name: "TestWindow",
  components: {
    TestForm,
    TestResults,
    CvTabs,
    CvTab,
  },
})
export default class TestWindow extends Vue {
  @Prop({ default: true }) public isOpen!: boolean;
  private currentTab = TypeTabs.form;
  private TypeTabs = TypeTabs;

  private switchToResultsTab() {
    this.currentTab = TypeTabs.results;
  }

  private updateCurrentTabManually(index: number): void {
    this.currentTab = index;
  }
}
</script>

<style lang="scss">
.test-window {
  z-index: 1198;
  position: fixed;
  top: 0;
  min-height: 100vh;
  height: 100vh;
  min-width: 432px;
  max-width: 432px;
  border-left: solid 2px $ui-00;
  margin-right: 0;
  transition-property: margin-right;
  transition-timing-function: carbon--motion(standard, expressive);
  transition-duration: $moderate-01;
  right: 0;
  background: $ui-background;

  &.closed {
    margin-right: -432px;
    right: 0;
  }
  #test-form {
    height: 100%;
  }

  .bx--label {
    font-size: 0.875rem;
  }

  .test-window-tabs {
    .cv-tab.bx--tabs--container {
      padding: 0;
      height: 3rem;
      width: 100%;

      ul {
        width: 100%;

        li {
          width: 50%;
          border: 0 !important;
          margin: 0;

          button {
            background-color: var(--ui-11);
            width: 100%;
            display: inline-flex;
            justify-content: flex-start;
            align-items: center;
            padding: 0 1rem;
            font-size: 1rem;

            &[aria-selected="true"] {
              background-color: var(--cds-ui-background, #f4f4f4);
              cursor: default;
            }

            &:focus {
              outline: none;
              outline-offset: unset;
            }
          }
        }
      }
    }

    .cv-tabs__panels {
      height: calc(100vh - 3rem);
      padding-bottom: 1rem;
      margin: 0;
    }

    #test-form-link,
    #test-result-link {
      position: relative;
      border-bottom: 2px solid $ui-00;

      &:before {
        content: "";
        position: absolute;
        right: 0;
        background: $ui-00;
        width: 2px;
        height: 100%;
      }
    }

    #test-result-link {
      &:before {
        left: 0;
      }
      &:after {
        left: -100%;
      }
    }

    #test-form-link {
      &:after {
        left: 100%;
      }
    }

    .bx--tabs__nav-item--selected {
      #test-form-link {
        &:before {
          background: transparent;
        }
        border-color: transparent;
      }
      #test-result-link {
        &:before {
          background: transparent;
        }
        border-color: transparent;
      }
    }

    .test-form-tab {
      padding-top: 1rem;
      margin: var(--cds-spacing-04, 1rem);
    }
  }
}

.ace-jsoneditor .ace_marker-layer .ace_bracket {
  border: 0 !important;
}
</style>

<style lang="scss">
.modal-payload {
  .bx--modal-content {
    padding-top: $spacing-07;
    padding-right: $spacing-05 !important;
    margin-bottom: 0;
  }
  .bx--modal-footer {
    margin-top: $spacing-07;
  }
  .bx--modal-container {
    background-color: $ui-background;
  }
}
.test-window {
  .form-buttons {
    .inactive-tooltip::before,
    .inactive-tooltip .bx--assistive-text {
      visibility: hidden;
    }
  }
}

.bx--inline-loading {
  display: inline-flex;
  align-items: center;
  gap: 0 0.4rem;
  .bx--inline-loading__text {
    font-size: 14px;
  }
  .bx--loading + svg {
    display: none;
    & + svg {
      display: none;
    }
  }
}
</style>
