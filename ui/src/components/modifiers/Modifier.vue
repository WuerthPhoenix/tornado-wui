<template>
  <div class="modifier" @keydown.esc="onClose" :class="className">
    <cv-button
      class="modifier-selector"
      :class="{ 'modifier-selected': selected }"
      @click="onSelect"
    >
      <slot name="icon"></slot>
    </cv-button>
    <div class="modifier-modal" v-if="selected" ref="modifier-modal">
      <div class="modifier-header">
        <div class="modifier-title">
          {{ $tc(title) }}
        </div>
        <div class="modifier-navigation">
          <cv-button
            kind="ghost"
            class="move-modifier-button move-modifier-button-left"
            v-if="editMode"
            :class="{ disabled: !hasPrev }"
            @click="onMoveLeft"
            size="small"
          >
            <ChevronLeft16 />
          </cv-button>
          <cv-button
            kind="ghost"
            class="move-modifier-button move-modifier-button-right"
            v-if="editMode"
            :class="{ disabled: !hasNext }"
            @click="onMoveRight"
            size="small"
          >
            <ChevronRight16 />
          </cv-button>
          <cv-button
            kind="ghost"
            class="delete-modifier-button"
            @click="onDelete"
            v-if="editMode"
            size="small"
          >
            <TrashCan16 />
          </cv-button>
          <cv-button
            kind="ghost"
            class="close-modifier-button"
            @click="onClose"
            size="small"
          >
            <Close16 />
          </cv-button>
        </div>
      </div>
      <div class="modifier-specific-ui">
        <slot name="modifier-specific-ui"></slot>
      </div>
      <div class="modifier-footer">
        <div class="modifier-description">
          {{ $tc(description) }}
        </div>
        <!-- info button -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Tornado from "@/store/tornado";

// @ts-ignore
import Close16 from "@carbon/icons-vue/es/close/16";
// @ts-ignore
import TrashCan16 from "@carbon/icons-vue/es/trash-can/16";
// @ts-ignore
import ChevronRight16 from "@carbon/icons-vue/es/chevron--right/16";
// @ts-ignore
import ChevronLeft16 from "@carbon/icons-vue/es/chevron--left/16";

// @ts-ignore
import { CvButton } from "@carbon/vue/src/components/cv-button";

@Component({
  components: {
    Close16,
    TrashCan16,
    ChevronLeft16,
    ChevronRight16,
    CvButton,
  },
})
export default class Modifier extends Vue {
  @Prop() private title!: string;
  @Prop() private className!: string;
  @Prop() private description!: string;
  @Prop() private selected!: boolean;
  @Prop() private hasNext!: boolean;
  @Prop() private hasPrev!: boolean;

  private mounted() {
    // @ts-ignore
    document.body.addEventListener("click", this.clickOut, true);
  }

  private beforeDestroy() {
    // @ts-ignore
    document.body.removeEventListener("click", this.clickOut, true);
  }

  clickOut(e: Event): void {
    // check that click is not inside the component
    if (
      this.$el &&
      !(this.$el == e.target || this.$el.contains(e.target as Node))
    ) {
      this.onClose();
    }
  }

  onClose(): void {
    this.$emit("close");
  }

  onDelete(): void {
    this.$emit("delete");
  }

  onMoveLeft(): void {
    this.$emit("moveLeft");
  }

  onMoveRight(): void {
    this.$emit("moveRight");
  }

  onSelect(): void {
    this.$emit("select");
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }
}
</script>

<style scoped lang="scss">
.modifier .modifier-modal {
  background-color: $ui-01;
  position: absolute;
  top: 30px;
  left: 0;
  z-index: 9;
  box-shadow: 0 4px 30px 0 #0000004d;
  width: 100%;

  .modifier-header {
    display: flex;
    padding: 0;
    justify-content: space-between;

    .modifier-title {
      font-family: IBM Plex Sans;
      display: inline-block;
      font-weight: 600;
      padding: $spacing-05;
    }

    .modifier-navigation {
      display: flex;
      flex-wrap: nowrap;

      .bx--btn {
        color: $icon-primary;
        width: 30px;
        height: 30px;
        padding: 0;
        min-height: 30px;
        min-width: 30px;
        justify-content: center;

        &.disabled {
          color: $icon-disabled;
          &:hover {
            background: transparent;
            cursor: unset;
          }

          &:focus {
            border-color: unset;
            box-shadow: none;
          }
        }
      }
    }
  }

  .modifier-description {
    padding: 1rem 65px 1rem 1rem;
    color: $ui-04;
    font-size: 0.875rem;
    font-family: IBM Plex Sans;
    font-style: normal;
    font-weight: 400;
    line-height: 120%;
  }
}

.modifier-selector {
  color: $icon-primary;
  background-color: unset;
  width: 1.875rem;
  height: 1.875rem;
  min-height: 1.875rem;
  flex-shrink: 0;
  padding: 0;
  justify-content: center;

  &:hover {
    background: $ui-01;
  }

  &.modifier-selected {
    background: $ui-01;
    border-top-width: 0.125rem;
    border-top-color: $icon-green;
  }
}
</style>

<style lang="scss">
.modifier .modifier-selector.modifier-selected {
  svg {
    color: $icon-green;
  }
}
</style>
