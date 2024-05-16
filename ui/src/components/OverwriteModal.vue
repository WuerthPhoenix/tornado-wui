<template>
  <cv-modal
    :close-aria-label="$tc('test_window.cancel')"
    ref="modal"
    size="xs"
    :visible="isVisible"
    @modal-hidden="closeModal"
    @primary-click="primaryBtnClick"
    @secondary-click="closeModal"
    @modal-hide-request="closeModal"
    class="overwrite-modal"
    accept="application/json"
    :auto-hide-off="true"
  >
    <template slot="title">{{ this.title }}</template>
    <template slot="content" class="content">
      <span class="warning-icon">
        <WarningAltFilled20 />
      </span>
      <p>
        {{ content }} <strong>{{ contentHighlight }}</strong>
      </p></template
    >

    <template v-if="this.secondaryButtonText" slot="secondary-button">{{
      this.secondaryButtonText
    }}</template>
    <template slot="primary-button">{{ this.primaryButtonText }}</template>
  </cv-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
// @ts-ignore
import WarningAltFilled20 from "@carbon/icons-vue/es/warning--alt--filled/20";

// @ts-ignore
import { CvModal } from "@carbon/vue/src/components/cv-modal";

@Component({
  name: "OverwriteModal",
  components: {
    WarningAltFilled20,
    CvModal,
  },
})
export default class OverrideModal extends Vue {
  @Prop() show!: boolean;
  @Prop() title!: string;
  @Prop() public content!: string;
  @Prop() public contentHighlight!: string;
  @Prop() public primaryButtonText!: string;
  @Prop() public secondaryButtonText!: string;

  private isVisible = false;

  @Watch("show", { immediate: true })
  onPropertyChange(value: boolean): void {
    this.isVisible = value;
  }

  private closeModal() {
    this.$emit("closeImportModal");
  }

  private primaryBtnClick(): void {
    this.$emit("primaryBtnClick");
    this.closeModal();
  }
}
</script>

<style lang="scss">
.overwrite-modal {
  .warning-icon {
    svg {
      margin-bottom: 3px;
      color: #e1b71f;
    }
  }

  .bx--modal-content {
    p {
      font-size: 12px;
      font-weight: 400;
      color: $text-grey;

      strong {
        color: $tag-text-01;
      }
    }
  }

  .bx--modal-header {
    margin-bottom: 30px;
  }

  .bx--modal-close {
    padding: 0;
    width: 2.35rem;
    height: 2.35rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bx--btn--primary {
    background-color: $danger-02;
    border: none;
    box-shadow: none !important;
    &:active,
    &:focus,
    &:hover {
      background-color: $danger-01;
      border: none;
      box-shadow: none !important;
    }
  }
  .bx--btn--secondary {
    border: none;
    box-shadow: none !important;
    &:active,
    &:focus,
    &:hover {
      border: none;
      box-shadow: none !important;
    }
  }
}
</style>
