<template>
  <combo-button
    :value="value"
    :size="size"
    :kind="kind"
    :text-only="textOnly"
    class="add-condition-btn"
  >
    <cv-overflow-menu-item
      class="overflow-item"
      v-for="condition in filterWhereConditions"
      :key="condition"
      @click="conditionSelected(condition)"
      >{{ condition }}</cv-overflow-menu-item
    >
    <template v-slot:icon>
      <Add20 />
    </template>
  </combo-button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
// @ts-ignore
import Add20 from "@carbon/icons-vue/es/add/20";
import ComboButton from "@/components/ComboButton.vue";
import { filterWhereConditions } from "@/utils/editorUtils";

// @ts-ignore
import { CvOverflowMenuItem } from "@carbon/vue/src/components/cv-overflow-menu";

@Component({
  name: "AddConditionButton",
  components: {
    ComboButton,
    Add20,
    CvOverflowMenuItem,
  },
})
export default class AddConditionButton extends Vue {
  @Prop() value!: string;
  @Prop() size!: string;
  @Prop() kind!: string;
  @Prop({ default: false }) textOnly!: boolean;

  get filterWhereConditions(): string[] {
    return filterWhereConditions;
  }

  private conditionSelected(condition: string): void {
    this.$emit("condition-selected", condition);
  }
}
</script>

<style lang="scss">
.add-condition-btn .combo-button {
  background-color: $button-primary;
}

.add-condition-btn {
  .combo-button {
    background-color: $button-primary;
    color: $button-text;
    align-items: flex-start;
    padding-top: 5px;
    &:hover {
      background-color: $button-primary;
      color: $button-text;
    }
  }

  .overflow-item .bx--overflow-menu-options__option-content {
    text-transform: uppercase;
    overflow: visible;
    padding: 6px 8px;
    height: 100%;
    width: 100%;
  }

  .bx--overflow-menu-options__btn {
    display: contents;
  }
}

.operator-condition-btn .bx--btn--ghost.bx--btn--sm {
  padding: 6px 8px;
}
</style>
