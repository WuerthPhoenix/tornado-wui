<template>
  <cv-modal
    :close-aria-label="$tc('test_window.cancel')"
    :primary-button-disabled="!this.storyFiles.length"
    ref="modal"
    size="xs"
    v-if="isVisible"
    :visible="isVisible"
    :auto-hide-off="true"
    :files="storyFiles"
    @primary-click="actionPrimary"
    @secondary-click="closeModal"
    @modal-hide-request="closeModal"
    class="import-node-modal"
    :class="{ 'import-node-modal--filled': this.storyFiles.length }"
  >
    <template slot="title">{{ title }}</template>
    <template slot="content">
      <span class="warning-icon" v-if="showWarning">
        <WarningAltFilled20 />
      </span>
      <p>{{ content }}</p>
      <div>
        <cv-file-uploader
          helperText="Only JSON files are supported"
          drop-target-label="Drag and drop file or click to upload"
          :clear-on-reselect="true"
          :multiple="false"
          accept=".json"
          :removable="true"
          @change="fileUploadedStatus"
          :files="storyFiles"
          ref="fileUploader"
        >
        </cv-file-uploader>
      </div>
    </template>
    <template slot="secondary-button">{{ $tc("test_window.cancel") }}</template>
    <template slot="primary-button">
      <span v-if="!this.storyFiles.length">{{
        $tc("views.processing_tree.import_modal_add_file_button")
      }}</span>
      <span v-else>{{
        $tc("views.processing_tree.import_modal_import_file_button")
      }}</span>
    </template>
  </cv-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
// @ts-ignore
import { CvModal } from "@carbon/vue/src/components/cv-modal";
// @ts-ignore
import { CvFileUploader } from "@carbon/vue/src/components/cv-file-uploader";
// @ts-ignore
import WarningAltFilled20 from "@carbon/icons-vue/es/warning--alt--filled/20";
import Notification from "@/store/notification";
import i18n from "@/utils/i18n";
@Component({
  name: "ImportNodeModal",
  components: {
    WarningAltFilled20,
    CvModal,
    CvFileUploader,
  },
})
export default class ImportNodeModal extends Vue {
  @Prop() show!: boolean;
  @Prop() title!: string;
  @Prop() showWarning!: boolean;
  @Prop() public content!: string;
  @Prop() public primaryButtonText!: string;
  @Prop() public secondaryButtonText!: string;

  private isVisible = false;
  private storyFiles = [];

  @Watch("show", { immediate: true })
  onPropertyChange(value: boolean): void {
    this.isVisible = value;
  }

  private actionPrimary() {
    try {
      //@ts-ignore
      let file = this.storyFiles[0].file;

      let formData = new FormData();
      formData.append("file", file);
      this.$emit("importFileLoaded", formData);
      file = undefined;
      this.storyFiles = [];
    } catch (error) {
      Notification.addError({
        title: i18n.tc("errors.error"),
        message: error.toString(),
      });
    }
  }

  private closeModal() {
    this.storyFiles = [];
    this.$emit("closeImportModal");
  }

  private fileUploadedStatus(changedFiles: any) {
    this.storyFiles = changedFiles;
    if (!changedFiles.length) return;
  }
}
</script>

<style lang="scss">
.import-node-modal {
  .bx--modal-close {
    padding: 0;
    width: 2.35rem;
    height: 2.35rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bx--modal-header {
    margin-bottom: 30px;
  }
  .warning-icon {
    svg {
      color: #e1b71f;
    }
  }
  .bx--modal-content p {
    font-size: 12px;
    font-weight: 400;
    color: $text-grey;
    padding-right: 4rem;
    margin-bottom: 8px;
  }
  .bx--file-browse-btn {
    max-width: unset;
    margin-bottom: 0;
  }
  .bx--file--label,
  .bx--label-description {
    font-size: 12px;
    font-weight: 400;
    color: $text-grey;
  }
  &--filled {
    .bx--file-browse-btn {
      display: none;
    }
    .bx--file-container {
      min-height: 40px;
      margin-top: 0 !important;
      .bx--file__selected-file {
        background-color: $ui-12;
        min-height: 40px;
      }
    }
    .bx--modal-content {
      p.bx--file-filename {
        font-size: 14px;
        margin-bottom: 0;
        color: $tag-text-01;
      }
      .bx--file__state-container {
        padding-right: 0.5rem;
        &:hover {
          opacity: 0.75;
          transition: all 200ms;
        }
      }
    }
  }
}
</style>
