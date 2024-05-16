<template>
  <div class="overflow-menu-container">
    <ComboButton
      :align-right-menu="true"
      size="small"
      :icon-only="true"
      kind="ghost-secondary"
      @close-menu="closeMenu"
    >
      <cv-overflow-menu-item v-if="!hideAddGroup" @click="addGroupBelow">{{
        $tc("editor.add_group_below")
      }}</cv-overflow-menu-item>
      <cv-overflow-menu-item v-if="!hideAddGroup" @click="addConditionBelow">{{
        $tc("editor.add_condition_below")
      }}</cv-overflow-menu-item>
      <cv-overflow-menu-item danger @click="deleteOperator">{{
        $tc("editor.delete_row")
      }}</cv-overflow-menu-item>

      <template v-slot:icon>
        <OverflowMenuHorizontal20 />
      </template>
    </ComboButton>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import ComboButton from "@/components/ComboButton.vue";
// @ts-ignore
import OverflowMenuHorizontal20 from "@carbon/icons-vue/es/overflow-menu--horizontal/20";
// @ts-ignore
import { CvOverflowMenuItem } from "@carbon/vue/src/components/cv-overflow-menu";

@Component({
  name: "OperatorOverflowMenu",
  components: {
    ComboButton,
    OverflowMenuHorizontal20,
    CvOverflowMenuItem,
  },
})
export default class OperatorOverflowMenu extends Vue {
  @Prop({ default: false }) hideAddGroup!: boolean;

  private deleteOperator() {
    this.$emit("delete");
  }

  private addGroupBelow() {
    this.$emit("add-group-below");
  }

  private addConditionBelow() {
    this.$emit("add-condition-below");
  }

  private closeMenu(): void {
    this.$emit("close-menu");
  }
}
</script>

<style lang="scss">
.overflow-menu-container {
  border-left: solid $spacing-01;
}

.overflow-menu-container .combo-button-container .combo-button {
  background-color: $ui-10;
  &:hover {
    background-color: $ui-13;
  }
}

.dark {
  .overflow-menu-container {
    border-color: $clickable-border-dark;
  }
}

.light {
  .overflow-menu-container {
    border-color: $clickable-border-light;
  }
}
</style>
