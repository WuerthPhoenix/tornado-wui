<template>
  <cv-modal
    :close-aria-label="$tc('test_window.cancel')"
    ref="modal"
    size="xs"
    :visible="visible"
    @modal-hidden="hideModal"
    @primary-click="primaryBtnClick"
    @secondary-click="secondaryBtnClick"
    :auto-hide-off="true"
  >
    <template slot="title">{{ this.title }}</template>
    <template slot="content"
      ><p>{{ this.content }}</p></template
    >
    <template v-if="this.secondaryButtonText" slot="secondary-button">{{
      this.secondaryButtonText
    }}</template>
    <template slot="primary-button">{{ this.primaryButtonText }}</template>
  </cv-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
// @ts-ignore
import { CvModal } from "@carbon/vue/src/components/cv-modal";

@Component({
  name: "ConfirmationModal",
  components: {
    CvModal,
  },
})
export default class ConfirmationModal extends Vue {
  @Prop() public title!: string;
  @Prop() public content!: string;
  @Prop() public primaryButtonText!: string;
  @Prop() public secondaryButtonText!: string;

  private visible = false;

  private mounted() {
    if (this.$refs.modal) {
      (this.$refs.modal as any).$refs.close.addEventListener(
        "click",
        this.closeBtnClick
      );
    }
  }

  public showModal(): void {
    this.visible = true;
  }

  hideModal(): void {
    this.visible = false;
  }

  private primaryBtnClick(): void {
    this.$emit("primaryBtnClick");
    this.hideModal();
  }

  private secondaryBtnClick(): void {
    this.$emit("secondaryBtnClick");
    this.hideModal();
  }

  private closeBtnClick(): void {
    this.$emit("closeBtnClick");
    this.hideModal();
  }
}
</script>

<style lang="scss">
.delete-draft-confirmation-modal {
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
