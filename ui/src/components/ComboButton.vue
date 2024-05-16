<template>
  <div
    class="combo-button-container"
    @keydown.esc="closeMenu"
    :class="buttonClass"
  >
    <cv-button
      ref="toggleButton"
      class="combo-button"
      :kind="carbonButtonKind"
      :size="size"
      @click="toggleMenu"
    >
      <div class="button-content">
        <div class="button-value" v-if="!iconOnly">{{ value }}</div>
        <slot name="icon" v-if="!textOnly">
          <ChevronDown20 />
        </slot>
      </div>
    </cv-button>
    <div
      class="overflow-menu bx--overflow-menu-options"
      :class="{ 'align-right': alignRightMenu }"
      v-if="showMenu"
      @click="closeMenu"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
// @ts-ignore
import ChevronDown20 from "@carbon/icons-vue/es/chevron--down/20";

// @ts-ignore
// CvButton is imported here because we're experiencing inclusion problems
// in jest unit tests otherwise. Overwriting the global CvButton component
// fixes the problem.
import { CvButton } from "@carbon/vue/src/components/cv-button";

@Component({
  components: {
    ChevronDown20,
    CvButton,
  },
})
export default class ComboButton extends Vue {
  @Prop({ default: "" }) public value!: string;
  @Prop({ default: "primary" }) public kind!:
    | "primary"
    | "secondary"
    | "tertiary"
    | "ghost"
    | "ghost-secondary";
  @Prop({ default: "field" }) public size!: string;
  @Prop({ default: false }) public iconOnly!: boolean;
  @Prop({ default: false }) public textOnly!: boolean;
  @Prop({ default: false }) public alignRightMenu!: boolean;

  private showMenu = false;

  private mounted() {
    // @ts-ignore
    document.body.addEventListener("click", this.clickOut, true);
  }

  private beforeDestroy() {
    // @ts-ignore
    document.body.removeEventListener("click", this.clickOut, true);
  }

  private clickOut(event: Event) {
    // check that click was outside the el and his children
    const toggleButton = this.$refs["toggleButton"] as Vue;
    if (
      toggleButton &&
      !(
        toggleButton.$el == event.target ||
        toggleButton.$el.contains(event.target as Node)
      )
    ) {
      this.closeMenu();
    }
  }

  private closeMenu() {
    this.showMenu = false;
    this.$emit("close-menu");
  }

  private toggleMenu() {
    this.showMenu = !this.showMenu;
    if (!this.showMenu) {
      this.$emit("close-menu");
    }
  }

  get carbonButtonKind(): string {
    if (this.kind === "ghost-secondary") {
      return "ghost";
    }

    return this.kind;
  }

  get buttonClass(): string {
    const classes = [];

    if (this.iconOnly) {
      classes.push("icon-only");
    }

    if (this.textOnly) {
      classes.push("text-only");
    }

    classes.push(this.kind);
    classes.push(this.size);

    return classes.join(" ");
  }
}
</script>
<style lang="scss">
.combo-button-container {
  .bx--overflow-menu-options {
    &__btn {
      color: $ui-05 !important;
    }
  }
}
</style>
<style lang="scss" scoped>
.bx--overflow-menu-options {
  background-color: $ui-02 !important;

  & li:hover {
    background-color: $selected-light-ui !important;
  }
}
.combo-button-container {
  position: relative;
  display: inline-block;

  &.icon-only {
    .combo-button.bx--btn--field {
      width: 40px;
      justify-content: center;
      justify-self: flex-end;
    }
  }

  &.ghost-secondary {
    .combo-button {
      color: $interactive-03 !important;
    }
  }

  &:not(.text-only) {
    .button-value {
      margin-right: 32px;
    }
  }

  &.small {
    .cv-overflow-menu-item {
      height: 30px;
    }
  }
}

.button-content {
  display: flex;
  justify-content: space-between;

  .button-value {
    display: flex;
    align-items: center;
  }
}

.overflow-menu {
  display: block;
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 99999;
  padding: 0 !important;
  min-height: auto !important;
  left: unset !important;
  width: auto;
  min-width: 100%;

  &.align-right {
    left: unset;
    right: 0;
  }
}

.combo-button {
  .add-node-btn & {
    padding-right: 12px !important;
  }

  &.bx--btn--sm {
    min-height: 30px !important;
    padding-left: $spacing-03 !important;
    padding-right: $spacing-03 !important;
    border: 0;
  }
}

.dark {
  .ghost {
    .combo-button {
      color: $icon-green !important;
    }
  }
}

.light {
  .ghost {
    .combo-button {
      color: $interactive-03 !important;
    }
  }
}
</style>
