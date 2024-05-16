<template>
  <div class="operator-condition-container">
    <div class="operator-condition" v-if="!editMode">
      {{ type }}
    </div>
    <div class="operator-condition-btn" v-else>
      <AddConditionButton
        :value="type.toUpperCase()"
        size="small"
        kind="ghost"
        :textOnly="true"
        @condition-selected="updateConditionType"
        ref="addConditionButton"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Tornado from "@/store/tornado";
import { Component, Model, Vue } from "vue-property-decorator";
import ComboButton from "@/components/ComboButton.vue";
import AddConditionButton from "@/components/editor/AddConditionButton.vue";

@Component({
  name: "OperatorCondition",
  components: {
    AddConditionButton,
    ComboButton,
  },
})
export default class OperatorCondition extends Vue {
  @Model("change") type!: string;

  private get editMode(): boolean {
    return Tornado.editMode;
  }

  private updateConditionType(updatedCondition: string) {
    this.$emit("change", updatedCondition);
  }
}
</script>

<style lang="scss">
.operator-condition-container {
  display: flex;
}
.operator-condition {
  padding: $spacing-03;
  min-height: 30px;
  font-size: 14px;
  min-width: 68px;
  display: flex;
  color: $clickable-active-color;
  text-transform: uppercase;
  min-width: 75px;
}

.operator-condition-btn {
  height: 100%;
  min-width: 75px;
}

.operator-condition,
.operator-condition-btn {
  border-left: solid 2px;
  border-right: solid 2px;
}

.dark {
  .operator-condition,
  .operator-condition-btn {
    background: $ui-10;
    border-color: $ui-11;
  }
}

.light {
  .operator-condition,
  .operator-condition-btn {
    background: $clickable-background-light;
    border-color: $clickable-border-light;
  }
}
</style>
<style lang="scss">
.operator-condition-btn .combo-button-container,
.operator-condition-btn .combo-button-container .combo-button {
  height: 100%;
  width: 100%;
}
</style>
