<template>
  <ComboButton
    :value="value"
    size="small"
    :kind="kind"
    :text-only="textOnly"
    class="add-action-btn"
  >
    <cv-overflow-menu-item
      class="overflow-item"
      v-for="action in actionList"
      :key="action"
      @click="actionSelected(action)"
      >{{ action }}</cv-overflow-menu-item
    >

    <template v-slot:icon>
      <Add20 />
    </template>
  </ComboButton>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
// @ts-ignore
import Add20 from "@carbon/icons-vue/es/add/20";
import ComboButton from "@/components/ComboButton.vue";
import { actionList } from "@/utils/editorUtils";

// @ts-ignore
import { CvOverflowMenuItem } from "@carbon/vue/src/components/cv-overflow-menu";

@Component({
  name: "AddActionButton",
  components: {
    ComboButton,
    Add20,
    CvOverflowMenuItem,
  },
})
export default class GroupTypeButton extends Vue {
  @Prop() value!: string;
  @Prop({ default: "secondary" }) kind!:
    | "primary"
    | "secondary"
    | "tertiary"
    | "ghost"
    | "ghost-secondary";
  @Prop({ default: false }) textOnly!: boolean;
  @Prop({ default: true }) showNot!: boolean;

  get actionList(): string[] {
    return actionList;
  }

  private actionSelected(action: string): void {
    this.$emit("action-selected", action);
  }
}
</script>

<style lang="scss">
.add-action-btn {
  margin-top: 2px;

  .combo-button {
    background-color: $carbon--gray-70;
    color: $carbon--gray-10;

    &:hover {
      background-color: $clickable-hover-dark;
    }
  }
}

.light {
  .add-action-btn {
    .combo-button {
      background-color: #f4f4f4;
      color: #161616;

      &:hover {
        background-color: #e0e0e0;
      }
    }
  }
}
</style>
