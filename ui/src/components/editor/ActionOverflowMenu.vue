<template>
  <div class="overflow-menu-container">
    <ComboButton
      :align-right-menu="true"
      size="small"
      :icon-only="true"
      kind="ghost-secondary"
      @close-menu="closeMenu"
    >
      <cv-overflow-menu-item @click="addActionBelow">{{
        $tc("editor.add_action_below")
      }}</cv-overflow-menu-item>
      <cv-overflow-menu-item danger @click="deleteAction">{{
        $tc("editor.delete_action")
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

  private deleteAction() {
    this.$emit("delete");
  }

  private closeMenu(): void {
    this.$emit("close-menu");
  }

  private addActionBelow() {
    this.$emit("add-action-below");
  }
}
</script>

<style lang="scss">
.overflow-menu-container {
  border-left: solid $spacing-01;
}

.dark {
  .overflow-menu-container {
    border-color: $carbon--gray-80;

    .combo-button-container .combo-button {
      &:hover {
        background-color: $hover-ui;
      }
    }
  }
}

.light {
  .overflow-menu-container {
    border-color: $carbon--white-0;
  }
}
</style>
