<template>
  <div class="action">
    <div>
      <div class="group-header">
        <div class="action-type">
          {{ action.id }}
        </div>
        <div class="right-actions-container">
          <span
            class="expand-icon"
            @click="changeVisibility"
            :class="{ 'children-expanded': propertiesExpanded }"
          >
            <ChevronDown20 />
          </span>
          <ActionOverflowMenu
            v-if="editMode"
            @delete="deleteAction"
            @add-action-below="addActionBelow"
          />
        </div>
      </div>
      <div
        class="action-properties-container"
        :class="{ collapsed: !propertiesExpanded }"
      >
        <div
          class="collapsable-container"
          ref="collapsable_container"
          :style="{ 'margin-top': containerMarginTop + 'px' }"
        >
          <slot></slot>
        </div>
      </div>
      <div
        v-if="sowAddActionBelowButton && editMode"
        class="add-action-btn-container"
      >
        <AddActionButton
          class="add-action-btn"
          :value="$tc('editor.choose_action')"
          @action-selected="addAction"
        />
        <cv-button
          class="cancel-btn"
          kind="ghost"
          size="small"
          @click="hideActionButtonBelow"
        >
          {{ $tc("editor.cancel") }}
        </cv-button>
      </div>
      <div class="collapsed-element" v-if="!propertiesExpanded">...</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
// @ts-ignore
import ChevronDown20 from "@carbon/icons-vue/es/chevron--down/20";
import Tornado from "@/store/tornado";
import OperatorOverflowMenu from "@/components/editor/OperatorOverflowMenu.vue";
import ActionOverflowMenu from "@/components/editor/ActionOverflowMenu.vue";
import { BaseAction } from "@/core/Action/Actions";
import AddActionButton from "@/components/editor/AddActionButton.vue";

// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";

@Component({
  name: "Action",
  components: {
    AddActionButton,
    ActionOverflowMenu,
    OperatorOverflowMenu,
    Action,
    CvButton,
    ChevronDown20,
  },
})
export default class Action extends Vue {
  @Prop() public action!: BaseAction;

  private propertiesExpanded = true;
  private containerMarginTop = 0;
  private sowAddActionBelowButton = false;

  private get editMode(): boolean {
    return Tornado.editMode;
  }

  private changeVisibility() {
    this.propertiesExpanded = !this.propertiesExpanded;
    if (this.propertiesExpanded) {
      this.containerMarginTop = 0;
    } else {
      this.containerMarginTop = -(
        this.$refs["collapsable_container"] as Element
      ).clientHeight;
    }
  }

  private deleteAction() {
    this.$emit("delete");
  }

  private addActionBelow() {
    this.sowAddActionBelowButton = true;
  }

  private hideActionButtonBelow() {
    this.sowAddActionBelowButton = false;
  }

  private addAction(selectedAction: string) {
    this.$emit("action-selected", selectedAction);
  }
}
</script>

<style lang="scss" scoped>
.action {
  padding-top: 2px;
}

.group-header {
  height: 30px;
  padding: $spacing-03;
  line-height: 12px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  position: relative;

  .action-type {
    color: $icon-green;
    text-transform: uppercase;
    line-height: 16px;
  }

  .expand-icon {
    display: flex;
    align-items: center;
    transition-property: transform;
    transition-timing-function: carbon--motion(standard, productive);
    transition-duration: $fast-01;
    cursor: pointer;
  }

  .children-expanded {
    transform: rotate(-180deg);
  }
}

.payload-property-container {
  display: flex;
  padding-top: 2px;

  .payload-property-label {
    min-width: 200px;
    word-break: break-all;
  }

  .payload-property-label {
    margin-right: 2px;
    padding: $spacing-03;
  }

  .payload-property-value {
    width: 100%;
    background-color: $ui-02;
    padding: $spacing-03;
    line-height: 18px;
  }
}

.action-properties-container {
  border-left: solid 4px;
  padding-left: $spacing-06;

  &.collapsed {
    overflow: hidden;
  }
}

.collapsable-container {
  margin-top: 0;
  transition-property: margin-top;
  transition-timing-function: carbon--motion(standard, productive);
  transition-duration: $fast-01;
}

.collapsed-element {
  height: 30px;
  border-left: solid 4px;
  padding-left: $spacing-06;
  background: $field-02;
  font-size: 16px;
  line-height: 22px;
  letter-spacing: 2.5px;
}

.dark {
  .group-header,
  .target-label,
  .payload-property-label {
    background-color: $ui-12;
  }

  .action-properties-container,
  .collapsed-element {
    border-left-color: $clickable-background-dark;
  }
}

.light {
  .group-header,
  .target-label,
  .payload-property-label {
    background-color: $ui-12;
  }

  .action-properties-container,
  .collapsed-element {
    border-left-color: rgba(224, 224, 224, 0.75);
  }
}

.right-actions-container {
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
}

.payload-property-label:before {
  content: "#";
  color: #ffd439;
  line-height: 14px;
}
</style>

<style lang="scss">
.add-action-btn-container {
  .cancel-btn {
    min-height: 30px;
    margin-left: 2px;
    margin-top: 2px;
  }
}
</style>
