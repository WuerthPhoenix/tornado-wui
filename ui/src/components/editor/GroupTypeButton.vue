<template>
  <ComboButton
    :value="value"
    size="small"
    :kind="kind"
    :text-only="textOnly"
    class="add-group-btn"
  >
    <cv-overflow-menu-item @click="selectGroup('AND')"
      >AND</cv-overflow-menu-item
    >
    <cv-overflow-menu-item @click="selectGroup('OR')">OR</cv-overflow-menu-item>
    <cv-overflow-menu-item v-if="showNot" @click="selectGroup('NOT')"
      >NOT</cv-overflow-menu-item
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

// @ts-ignore
import { CvOverflowMenuItem } from "@carbon/vue/src/components/cv-overflow-menu";

@Component({
  name: "GroupTypeButton",
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

  private selectGroup(type: string) {
    this.$emit("select-group", type);
  }
}
</script>

<style lang="scss">
.add-group-btn {
  margin-top: $spacing-01;

  .combo-button {
    background-color: $button-primary;
    color: $button-text;
    &:hover {
      background-color: $button-primary;
      color: $button-text;
    }
  }
}
</style>
