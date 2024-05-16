<template>
  <div class="where-operator">
    <div v-if="hasNestedOperators">
      <div class="group-header">
        <GroupTypeButton
          class="change-operator-type-btn"
          kind="ghost"
          :text-only="true"
          :show-not="false"
          :value="this.operator.type"
          @select-group="changeGroup"
          v-if="editMode && !isNotOperator"
        />
        <div class="group-type" v-else>
          <span>{{ this.operator.type }}</span>
        </div>
        <div class="right-actions-container">
          <span
            class="expand-icon"
            @click="changeVisibility"
            :class="{ 'children-expanded': childrenExpanded }"
          >
            <ChevronDown20 />
          </span>
          <OperatorOverflowMenu
            @delete="deleteOperator"
            @add-group-below="onShowAddGroupBelow"
            @add-condition-below="onShowAddConditionBelow"
            :hide-add-group="isRootElement"
            v-if="editMode"
          />
        </div>
      </div>
      <div
        class="child-operators-container"
        :class="{ expanded: childrenExpanded }"
      >
        <div
          class="scrollable-container"
          ref="scrollable_container"
          :style="{ 'margin-top': this.containerMarginTop + 'px' }"
        >
          <WhereOperator
            v-for="(operator, index) in nestedOperators"
            :operator="operator"
            :key="index"
            :showOverflowMenu="!isNotOperator"
            @change="onChildOperatorChanged"
            @delete="onChildOperatorDeleted(index)"
            @add-group-below="onAddGroupBelow(index, $event)"
            @add-condition-below="onAddConditionBelow(index, $event)"
          />
        </div>
      </div>
      <div
        class="add-operator-btn-container"
        v-if="editMode && !isNotOperator && childrenExpanded"
      >
        <GroupTypeButton
          :value="$tc('editor.add_group')"
          @select-group="addGroup"
        />
        <AddConditionButton
          class="add-condition-btn"
          :value="$tc('editor.add_condition')"
          size="small"
          kind="secondary"
          @condition-selected="addConditionAtEnd"
        />
      </div>
      <div class="collapsed-element" v-if="!childrenExpanded">...</div>
    </div>
    <div
      v-else
      class="operator-container"
      @mouseover="setOperatorRowHover(true)"
      @mouseleave="setOperatorRowHover(false)"
    >
      <OperatorValue
        class="first"
        v-model="operator.first"
        @change="onChildOperatorChanged"
        @operator-mode-change="firstOperatorModeChange"
        input-type="accessor"
      />
      <OperatorCondition
        v-model="operator.type"
        @change="onChildOperatorChanged"
      />
      <OperatorValue
        class="second"
        v-model="operator.second"
        @change="onChildOperatorChanged"
        @operator-mode-change="secondOperatorModeChange"
        :input-type="operator.type === 'regex' ? 'regex' : 'accessor'"
      />
      <div class="inline-add-below-container">
        <OperatorOverflowMenu
          v-if="
            editMode &&
            !isOperatorEditing &&
            showOverflowMenu &&
            (operatorRowHover || inlineMenuClicked)
          "
          @delete="deleteOperator"
          @add-group-below="onShowAddGroupBelow"
          @add-condition-below="onShowAddConditionBelow"
          @click.native="setInlineMenuClicked(true)"
          @close-menu="setInlineMenuClicked(false)"
        />
      </div>
    </div>
    <div class="add-group-below-row" v-if="editMode && showAddOptionsBelow">
      <GroupTypeButton
        v-if="showAddGroupBelow"
        :value="$tc('editor.choose_group_type')"
        @select-group="addGroupBelow"
      />
      <AddConditionButton
        v-else
        class="add-condition-below-btn"
        :value="$tc('editor.choose_condition_type')"
        kind="secondary"
        size="small"
        @condition-selected="addConditionBelow"
      />
      <cv-button
        class="cancel-btn"
        kind="ghost"
        size="small"
        @click="onHideAddGroupBelow"
        >{{ $tc("editor.cancel") }}</cv-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Model, Prop } from "vue-property-decorator";
import OperatorValue from "./OperatorValue.vue";
import OperatorCondition from "./OperatorCondition.vue";
// @ts-ignore
import ChevronDown20 from "@carbon/icons-vue/es/chevron--down/20";
import Tornado, { OperatorType } from "@/store/tornado";
import OperatorOverflowMenu from "@/components/editor/OperatorOverflowMenu.vue";
import AddConditionButton from "@/components/editor/AddConditionButton.vue";
import GroupTypeButton from "@/components/editor/GroupTypeButton.vue";
import ComboButton from "@/components/ComboButton.vue";

// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";

type Group = "AND" | "OR" | "NOT";

type Condition =
  | "contains"
  | "containsIgnoreCase"
  | "equals"
  | "equalsIgnoreCase"
  | "ge"
  | "gt"
  | "le"
  | "lt"
  | "ne"
  | "regex";

type Operator = Group | Condition;

@Component({
  name: "WhereOperator",
  components: {
    ComboButton,
    AddConditionButton,
    GroupTypeButton,
    OperatorOverflowMenu,
    OperatorValue,
    WhereOperator,
    ChevronDown20,
    OperatorCondition,
    CvButton,
  },
})
export default class WhereOperator extends Vue {
  @Model("change") operator!: OperatorType;
  @Prop({ default: false }) isRootElement!: boolean;
  @Prop({ default: true }) showOverflowMenu!: boolean;

  private childrenExpanded = true;
  private containerMarginTop = 0;
  private operatorRowHover = false;
  private inlineMenuClicked = false;
  private showAddGroupBelow = false;
  private showAddOptionsBelow = false;
  private firstOperatorEditing = false;
  private secondOperatorEditing = false;
  private errorMessage = "";

  private get hasNestedOperators() {
    return (
      this.operator.type === "AND" ||
      this.operator.type === "OR" ||
      this.operator.type === "NOT"
    );
  }

  private get nestedOperators() {
    let nestedOp: OperatorType[];

    if (this.operator.type === "NOT") {
      nestedOp = [this.operator.operator];
    } else if (this.operator.type === "AND" || this.operator.type === "OR") {
      nestedOp = this.operator.operators;
    } else {
      nestedOp = [];
    }

    return nestedOp;
  }

  private get isRegex() {
    return this.operator.type === "regex";
  }

  private get editMode(): boolean {
    return Tornado.editMode;
  }

  private changeVisibility() {
    this.childrenExpanded = !this.childrenExpanded;
    if (this.childrenExpanded) {
      this.containerMarginTop = 0;
    } else {
      this.containerMarginTop = -(this.$refs["scrollable_container"] as Element)
        .clientHeight;
    }
  }

  get isNotOperator(): boolean {
    return this.operator.type === "NOT";
  }

  private addOperator(newOperator: OperatorType, index: number) {
    const editedOperator: OperatorType = { ...this.operator };
    if (editedOperator.type === "AND" || editedOperator.type === "OR") {
      if (index < 0) {
        editedOperator.operators.push(newOperator);
      } else {
        editedOperator.operators.splice(index, 0, newOperator);
      }
      this.$emit("change", editedOperator);
    }
  }

  private addGroup(type: string) {
    if (type === "AND") {
      this.addAnd(-1);
    } else if (type === "OR") {
      this.addOr(-1);
    } else if (type === "NOT") {
      this.addNot(-1);
    }
  }

  private changeGroup(type: Operator) {
    this.operator.type = type;
    this.$emit("change", this.operator);
  }

  private addAnd(index: number) {
    const operator: OperatorType = {
      type: "AND",
      operators: [],
    };
    this.addOperator(operator, index);
  }

  private addOr(index: number) {
    const operator: OperatorType = {
      type: "OR",
      operators: [],
    };
    this.addOperator(operator, index);
  }

  private addNot(index: number) {
    const operator: OperatorType = {
      type: "NOT",
      operator: {
        type: "equals",
        first: "",
        second: "",
      },
    };
    this.addOperator(operator, index);
  }

  private addCondition(index: number, type: Condition): void {
    let operator: OperatorType;

    if (type === "regex") {
      operator = {
        type: type,
        first: "",
        second: ".*",
      };
    } else {
      operator = {
        type: type,
        first: "",
        second: "",
      };
    }
    this.addOperator(operator, index);
  }

  private onChildOperatorChanged() {
    this.$emit("change", this.operator);
    this.setOperatorRowHover(false);
  }

  private firstOperatorModeChange(mode: boolean) {
    this.errorMessage = "";
    this.firstOperatorEditing = mode;
  }

  private secondOperatorModeChange(mode: boolean) {
    this.secondOperatorEditing = mode;
  }

  private get isOperatorEditing(): boolean {
    return this.firstOperatorEditing || this.secondOperatorEditing;
  }

  private setInlineMenuClicked(clicked: boolean) {
    this.inlineMenuClicked = clicked;
  }

  private setOperatorRowHover(hover: boolean) {
    this.operatorRowHover = hover;
  }

  private deleteOperator() {
    this.$emit("delete");
  }

  private onChildOperatorDeleted(index: number) {
    if (this.operator.type === "AND" || this.operator.type === "OR") {
      this.operator.operators.splice(index, 1);
      this.$emit("change", this.operator);
    }
  }

  private onShowAddGroupBelow() {
    this.showAddGroupBelow = true;
    this.showAddOptionsBelow = true;
    this.setInlineMenuClicked(false);
    this.setOperatorRowHover(false);
  }

  private onHideAddGroupBelow() {
    this.showAddGroupBelow = false;
    this.showAddOptionsBelow = false;
  }

  private addGroupBelow(type: string) {
    this.$emit("add-group-below", type);
    this.showAddGroupBelow = false;
    this.showAddOptionsBelow = false;
  }

  private onShowAddConditionBelow() {
    this.showAddOptionsBelow = true;
    this.showAddGroupBelow = false;
    this.setInlineMenuClicked(false);
    this.setOperatorRowHover(false);
  }

  private addConditionBelow(condition: string) {
    this.$emit("add-condition-below", condition);
    this.showAddOptionsBelow = false;
  }

  private addConditionAtEnd(condition: Condition) {
    this.addCondition(-1, condition);
  }

  private onAddGroupBelow(index: number, type: string) {
    const increasedIndex = ++index;
    if (type === "AND") {
      this.addAnd(increasedIndex);
    } else if (type === "OR") {
      this.addOr(increasedIndex);
    } else if (type === "NOT") {
      this.addNot(increasedIndex);
    }
  }

  private onAddConditionBelow(index: number, condition: Condition) {
    const increasedIndex = ++index;
    this.addCondition(increasedIndex, condition);
  }
}
</script>

<style lang="scss">
.where-operator {
  padding-top: 2px;
  position: relative;
  .add-operator-btn-container {
    .add-condition-btn {
      margin-left: $spacing-01;
    }
  }
  .add-condition-below-btn {
    margin-top: $spacing-01;
  }

  .inline-add-below-container {
    position: absolute;
    right: 0;
    top: 0px;
    height: 100%;
  }
}

.group-header {
  height: 30px;
  padding: $spacing-03;
  line-height: 12px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  position: relative;

  .group-type {
    color: $icon-green;
  }

  .expand-icon {
    display: flex;
    align-items: center;
    transition-property: transform;
    transition-timing-function: carbon--motion(standard, productive);
    transition-duration: $fast-01;
    cursor: pointer;
    margin-right: $spacing-03;
  }

  .children-expanded {
    transform: rotate(-180deg);
  }
}

.child-operators-container {
  border-left: solid 4px;
  padding-left: $spacing-06;

  &:not(.expanded) {
    overflow: hidden;
  }
}

.scrollable-container {
  margin-top: 0;
  transition-property: margin-top;
  transition-timing-function: carbon--motion(standard, productive);
  transition-duration: $fast-01;
}

.operator-container {
  display: flex;
  position: relative;

  .first {
    max-width: 375px;
  }

  .second-operator-container {
    display: flex;
    flex-grow: 1;

    .combo-button-container {
      display: flex;
      background: $clickable-background-dark;
    }
  }
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

.add-operator-btn-container {
  padding-left: $spacing-06;
  border-left: solid 4px;
}

.right-actions-container {
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
}

.change-operator-type-btn {
  margin-top: -8px;
  margin-left: -8px;
  height: 30px;
  .combo-button {
    background-color: $ui-10;
  }
}
.change-operator-type-btn,
.overflow-menu-container {
  border: none !important;
}

.cancel-btn {
  margin-top: $spacing-02;
  min-height: 30px;
}

.group-header {
  background: $ui-10;
}

.where-operator {
  .combo-button {
    background-color: $ui-10;
    &:hover {
      color: $button-text;
    }
  }
}

.child-operators-container,
.collapsed-element,
.add-operator-btn-container {
  border-left-color: $ui-10;
}
</style>
<style lang="scss">
.where-operator {
  .inline-add-below-container {
    .overflow-menu-container,
    .combo-button-container,
    .combo-button {
      height: 100% !important;
    }
  }
}
</style>
