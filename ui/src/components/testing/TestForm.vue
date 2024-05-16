<template>
  <div class="test-event-flex-container">
    <div class="test-window-form">
      <cv-text-input
        class="event-type"
        :label="$tc('test_window.event_type')"
        v-model="type"
      />

      <div class="datebox">
        <div class="datebox-datepicker">
          <cv-date-picker
            kind="single"
            :calOptions="calOptions"
            class="creation-time"
            :dateLabel="$tc('test_window.creation_time')"
            v-model="date"
            @change="onUpdateDate"
            :invalidMessage="createdMsError"
            required="true"
          />
        </div>
        <div class="datebox-timepicker">
          <cv-time-picker
            ampm="24"
            :pattern="timePickerRegex.toString()"
            placeholder="hh:mm:ss"
            :time="time"
            @update:time="onUpdateTime"
          >
            <template v-if="invalidTime" slot="invalid-message">{{
              $tc("test_window.timepicker.error")
            }}</template>
          </cv-time-picker>
        </div>
      </div>

      <cv-dropdown
        v-if="isOpen && isRootTenantSelected"
        class="tenant-id"
        v-model="selectedTenant"
        :label="$tc('test_window.tenant_id')"
      >
        <cv-dropdown-item
          v-for="tenant in tenantList"
          :key="tenant"
          :value="'' + tenant"
        >
          {{ tenant.length ? tenant : $tc("test_window.none") }}
        </cv-dropdown-item>
      </cv-dropdown>

      <cv-toggle
        :label="$tc('test_window.enable_execution_of_actions')"
        value="true"
        v-model="executeActions"
        :disabled="!hasExecutionActionsPermission"
      />
      <div>
        <span class="bx--label">
          {{ $tc("test_window.payload") }}
        </span>
      </div>
      <div class="payload-preview-container" @click="editPayload">
        <Maximize20 class="expand-payload-editor" @click="editPayload" />
        <WpJsoneditor
          class="preview-payload-editor"
          id="preview_event_payload"
          @input="setValidPayload"
          @error="setInvalidPayload"
          v-model="payloadOnJSONEditor"
          readonly
        ></WpJsoneditor>
        <div class="editor-gutter"></div>
      </div>
    </div>
    <div class="test-window-buttons">
      <cv-button-set class="form-buttons">
        <cv-button
          class="clear-form"
          size="field"
          kind="ghost"
          @click="clearForm"
          :disabled="eventIsRunning"
        >
          {{ $tc("test_window.clear_form") }}
        </cv-button>
        <cv-button
          class="clear-result"
          size="field"
          kind="ghost"
          @click="clearResult"
          :disabled="eventIsRunning"
          >{{ $tc("test_window.clear_result") }}</cv-button
        >
        <cv-tooltip
          v-if="!eventIsRunning"
          :tip="$tc('test_window.pending_unsaved_changes')"
          direction="top"
          alignment="end"
          :class="{ 'inactive-tooltip': !draftHasPendingChanges }"
        >
          <cv-button
            class="run-test"
            size="field"
            kind="primary"
            @click="runTest"
            :disabled="draftHasPendingChanges"
          >
            {{ $tc("test_window.run_test") }}
            <slot name="icon">
              <InformationFilled16 v-if="draftHasPendingChanges" />
              <Play16 v-else />
            </slot>
          </cv-button>
        </cv-tooltip>
        <cv-inline-loading
          v-else
          :loading-text="$tc('test_window.testing')"
          state="loading"
        ></cv-inline-loading>
      </cv-button-set>
    </div>

    <cv-modal
      size="large"
      :visible="editPayloadIsOpen"
      @modal-hidden="cancelPayload"
      class="modal-payload"
      @primary-click="savePayload"
      @secondary-click="cancelPayload"
      :primary-button-disabled="!payloadIsValid"
    >
      <template slot="title">{{ $tc("test_window.edit_payload") }}</template>
      <template slot="content" class="modal-content">
        <div>
          <WpJsoneditor
            class="payload-editor"
            id="event_payload"
            @input="setValidPayload"
            @error="setInvalidPayload"
            v-model="payloadOnJSONEditor"
          ></WpJsoneditor>
        </div>
      </template>
      <template slot="secondary-button">{{
        $tc("test_window.cancel")
      }}</template>
      <template slot="primary-button">{{ $tc("test_window.save") }}</template>
    </cv-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
// @ts-ignore
import Flash20 from "@carbon/icons-vue/es/flash/20";
// @ts-ignore
import Maximize20 from "@carbon/icons-vue/es/maximize/20";
// @ts-ignore
import View20 from "@carbon/icons-vue/es/view/20";
// @ts-ignore
import RadioButtonChecked16 from "@carbon/icons-vue/es/radio-button--checked/16";
// @ts-ignore
import Play16 from "@carbon/icons-vue/es/play/16";
// @ts-ignore
import InformationFilled16 from "@carbon/icons-vue/es/information--filled/16";
import i18n from "@/utils/i18n";
import WpJsoneditor from "@/components/JsonEditor.vue";
import { EventDto, SendEventRequestDto, Value } from "tornado-backend-dto";
import { ProcessType } from "@/utils/TornadoDtoEnum";
import Tornado from "@/store/tornado";
import User, { PermissionsDto } from "@/store/user";
import ProcessingTree from "@/views/ProcessingTree.vue";

// @ts-ignore
import { CvButton, CvButtonSet } from "@carbon/vue/src/components/cv-button";
// @ts-ignore
import { CvGrid, CvRow, CvColumn } from "@carbon/vue/src/components/cv-grid";
// @ts-ignore
import { CvInlineLoading } from "@carbon/vue/src/components/cv-inline-loading";
// @ts-ignore
import { CvTooltip } from "@carbon/vue/src/components/cv-tooltip";
// @ts-ignore
import { CvDatePicker } from "@carbon/vue/src/components/cv-date-picker";
// @ts-ignore
import { CvTimePicker } from "@carbon/vue/src/components/cv-time-picker";
// @ts-ignore
import { CvTag } from "@carbon/vue/src/components/cv-tag";
// @ts-ignore
import { CvModal } from "@carbon/vue/src/components/cv-modal";
// @ts-ignore
import { CvToggle } from "@carbon/vue/src/components/cv-toggle";
// @ts-ignore
import { CvTextInput } from "@carbon/vue/src/components/cv-text-input";
// @ts-ignore
import { CvTabs, CvTab } from "@carbon/vue/src/components/cv-tabs";
// @ts-ignore
import {
  CvDropdown,
  CvDropdownItem,
  CvDropdownSkeleton,
  // @ts-ignore
} from "@carbon/vue/src/components/cv-dropdown";

import Notification from "@/store/notification";

@Component({
  name: "TestForm",
  components: {
    ProcessingTree,
    WpJsoneditor,
    Flash20,
    Maximize20,
    View20,
    RadioButtonChecked16,
    Play16,
    InformationFilled16,
    CvGrid,
    CvRow,
    CvColumn,
    CvButton,
    CvDatePicker,
    CvTimePicker,
    CvTooltip,
    CvButtonSet,
    CvInlineLoading,
    CvDropdown,
    CvDropdownItem,
    CvDropdownSkeleton,
    CvTag,
    CvModal,
    CvTextInput,
    CvToggle,
    CvTabs,
    CvTab,
  },
})
export default class TestForm extends Vue {
  @Prop({ default: true }) public isOpen!: boolean;
  private type = "";
  private time = "";
  private date = "";
  private invalidTime = false;
  private executeActions = false;
  private editPayloadIsOpen = false;
  private payload = {};
  private payloadOnJSONEditor = {};
  private payloadIsValid = true;
  private runTestWasClicked = false;
  private selectedTenant = "";

  mounted(): void {
    document
      .querySelector("textarea.ace_text-input")
      ?.setAttribute("tabindex", "-1");
  }

  @Watch("isOpen", { immediate: true })
  private updateTimeAndDate(): void {
    if (this.invalidTime) {
      return;
    }
    // Construct the desired string
    this.time = this.timeFormatted();
    this.date = this.dateFormatted();
  }

  @Watch("payloadOnJSONEditor", { deep: true })
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  onPropertyChanged(value: any): void {
    if (value.created_ms !== undefined) {
      this.onPasteCreated(value.created_ms);
    }
    if (value.metadata !== undefined) {
      this.onPasteMetadata(value.metadata);
    }
    if (value.type !== undefined) {
      this.onPasteType(value.type);
    }
    if (value.payload !== undefined) {
      this.onPastePayload(value);
    }
  }

  get createdMs(): string {
    return new Date(this.date + " " + this.time).getTime().toString();
  }

  private timeFormatted(time: number | null = null) {
    let currentDate = new Date(time ? time : Date.now());
    // Extract hours, minutes, and seconds
    let hours = currentDate.getHours().toString().padStart(2, "0"); // Ensure it's a two-digit number
    let minutes = currentDate.getMinutes().toString().padStart(2, "0"); // Ensure it's a two-digit number
    let seconds = currentDate.getSeconds().toString().padStart(2, "0"); // Ensure it's a two-digit number
    return `${hours}:${minutes}:${seconds}`;
  }

  private dateFormatted(time: number | null = null) {
    // Create a new Date object with the current timestamp
    let currentDate = new Date(time ? time : Date.now());
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 because getMonth() is 0-indexed.
    const day = currentDate.getDate().toString().padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  get hasExecutionActionsPermission(): boolean {
    if (
      User.info !== null &&
      User.info.user_tenants[User.selectedTenant].includes(
        PermissionsDto.test_event_execute_actions
      )
    ) {
      return true;
    } else {
      this.executeActions = false;
      return false;
    }
  }

  get draftHasPendingChanges(): boolean {
    return !Tornado.actionsQueue.isEmpty();
  }

  @Watch("tornadoQueueLength", { immediate: true })
  onTornadoQueueLengthChanged(
    newTornadoQueueLength: number,
    oldTornadoQueueLength: number
  ): void {
    if (oldTornadoQueueLength === 0 && newTornadoQueueLength > 0) {
      this.clearResult();
      Notification.addInfo({
        title: i18n.tc("test_window.result_cleared_data_has_changed"),
        message: "",
      });
    }
  }

  get eventIsRunning(): boolean {
    return Tornado.eventIsRunning;
  }

  get createdMsIsEmpty(): boolean {
    return this.createdMs === "";
  }

  get tornadoQueueLength(): number {
    return Tornado.actionsQueue.getLength();
  }

  public editPayload(): void {
    this.editPayloadIsOpen = true;
  }

  public clearForm(): void {
    this.type = "";
    this.date = this.dateFormatted();
    this.time = this.timeFormatted();
    this.payloadOnJSONEditor = {};
    this.payload = {};
    this.runTestWasClicked = false;
  }

  private get createdMsError() {
    if (this.runTestWasClicked && this.createdMsIsEmpty) {
      return i18n.tc("test_window.missing_created_ms");
    }

    if (Number.isNaN(Number(this.createdMs)) || parseInt(this.createdMs) < 0) {
      return i18n.tc("test_window.invalid_created_ms");
    }

    return "";
  }

  private setInvalidPayload() {
    this.payloadIsValid = false;
  }

  private setValidPayload() {
    this.payloadIsValid = true;
  }

  private savePayload() {
    this.payload = { ...this.payloadOnJSONEditor };
    this.editPayloadIsOpen = false;
  }

  private cancelPayload() {
    this.payloadOnJSONEditor = { ...this.payload };
    this.editPayloadIsOpen = false;
    this.setValidPayload();
  }

  private runTest(): void {
    this.runTestWasClicked = true;

    if (this.createdMsIsEmpty) {
      return;
    }

    this.$emit("switchToResultsTab");

    Tornado.setProcessedEvent(null);

    let processType: ProcessType = ProcessType.SkipActions;
    if (this.executeActions) {
      processType = ProcessType.Full;
    }

    const metadata: Value = {};
    if (this.isRootTenantSelected) {
      if (this.selectedTenant.length) {
        metadata.tenant_id = this.selectedTenant;
      }
    } else {
      metadata.tenant_id = User.selectedTenant;
    }

    const event: EventDto = {
      type: this.type,
      created_ms: parseInt(this.createdMs),
      payload: this.payload,
      metadata,
    };

    const testEvent: SendEventRequestDto = {
      process_type: processType,
      event,
    };

    if (Tornado.editMode) {
      Tornado.sendEventDraft(testEvent);
    } else {
      Tornado.sendEvent(testEvent);
    }
  }

  private clearResult(): void {
    Tornado.setProcessedEvent(null);
  }

  get isRootTenantSelected(): boolean {
    return User.selectedTenant === User.ROOT_TENANT;
  }

  get tenantList(): string[] {
    let tenantList: string[] = [""];
    if (User.info) {
      tenantList.push(...User.info.system_available_tenants);
    }

    return tenantList;
  }

  get calOptions(): any {
    return { dateFormat: "Y/m/d" };
  }

  private onUpdateTime(time: string): void {
    this.time = time;
    if (!this.timePickerRegex.test(time)) {
      this.invalidTime = true;
      return;
    }
    this.invalidTime = false;
  }
  private onUpdateDate(date: string): void {
    this.date = date;
  }

  get timePickerRegex(): RegExp {
    return /^(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  }

  private onPastePayload(value: any) {
    this.payloadOnJSONEditor = value.payload;
  }

  private onPasteCreated(time: number) {
    this.time = this.timeFormatted(time);
    this.date = this.dateFormatted(time);
  }

  private onPasteMetadata(metadata: any) {
    this.selectedTenant = metadata.tenant_id;
  }

  private onPasteType(type: string) {
    this.type = type;
  }
}
</script>

<style lang="scss">
#test-form {
  .test-event-flex-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .test-window-form {
      flex-grow: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding: 0 3px;
    }

    .test-window-buttons {
      padding: 0 3px;
    }
  }

  .datebox {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
  }

  .bx--form-item {
    flex-grow: 0 !important;
    margin-bottom: $spacing-06;
  }

  .form-buttons {
    margin-top: $spacing-05;
    margin-bottom: 0.75rem;

    .cv-button,
    .cv-tooltip {
      max-width: calc(100% / 3);
      padding-right: 0;
      font-size: 14px;

      &:not(.bx--btn--primary) {
        color: $text-01;
      }
    }

    .cv-tooltip {
      width: 100%;
    }

    .run-test {
      max-width: 100%;
      width: 100%;

      svg {
        margin-right: 14px;
        fill: $icon-white;
      }
    }
  }

  .ace_hidden-cursors {
    display: none !important;
  }

  .payload-preview-container {
    flex-grow: 1;
    position: relative;

    .expand-payload-editor {
      position: absolute;
      right: 1.5rem;
      top: 1rem;
      width: 1.2rem;
      height: 1.2rem;
      object-fit: contain;
      z-index: 99;
      pointer-events: none;
    }

    .editor-gutter {
      height: 0.4rem;
      background-color: var(--cds-field-01, #ffffff);
      margin-top: -1px;
      transition-property: background;
      transition-timing-function: carbon--motion(standard, expressive);
      transition-duration: $moderate-01;
      pointer-events: none;
    }

    &:hover {
      .editor-gutter {
        background: $ui-13 !important;
      }
      .jsoneditor-container {
        background: $ui-13 !important;
      }
      .ace_scrollbar {
        background: $ui-13 !important;
      }
    }

    .jsoneditor-container {
      background-color: var(--cds-field-01, #ffffff);

      .ace_bracket {
        border: 0;
      }

      .ace_editor.ace_hidpi.ace-jsoneditor {
        font-size: 11px !important;
      }

      .ace-jsoneditor .ace_marker-layer {
        .ace_active-line {
          background: transparent;
        }
      }

      .ace_editor,
      .jsoneditor {
        background-color: transparent !important;
      }

      .space-container {
        height: 0.5rem;
        .space-right {
          background: transparent !important;
        }
      }

      .ace_scroller {
        background: transparent !important;
      }
    }

    .preview-payload-editor {
      height: calc(100% - 1rem);
      z-index: 1;
      transition-property: background;
      transition-timing-function: carbon--motion(standard, expressive);
      transition-duration: $moderate-01;

      .ace_cursor-layer {
        display: none !important;
      }

      .jsoneditor-outer {
        padding-bottom: 0 !important;
      }

      // Json editor with minimal lines panel

      .ace_scrollbar {
        background: $ui-11;
        transition-property: background;
        transition-timing-function: carbon--motion(standard, expressive);
        transition-duration: $moderate-01;
      }

      .ace_fold-widget {
        left: 3px;
      }

      .ace_scroller {
        width: 100%;
        left: 37px !important;
        padding-top: 5px;
        padding-left: 38px;
      }

      .ace_gutter {
        width: 37px !important;
        padding-top: 0;
        background: transparent;

        .ace_gutter-active-line {
          background: transparent;
        }

        .ace_gutter-layer {
          width: auto !important;

          .ace_gutter-cell {
            padding-right: 16px !important;
            padding-left: 8px !important;
          }
        }
      }

      .ace_gutter-cell {
        padding: 0 !important;
        font-size: 12px;
        font-family: "IBM Plex Mono";
      }

      .ace_gutter-cell.ace_error {
        background-size: 10px !important;
        background-position-x: 93%;
      }

      // end of json editor lines panel

      .space-container {
        .space-left {
          display: none;
        }

        .space-right {
          width: 100%;
          transition-property: background;
          transition-timing-function: carbon--motion(standard, expressive);
          transition-duration: $moderate-01;
        }
      }

      .ace_scroller {
        width: 100%;
        left: 0 !important;
        padding: 0 0.5rem;
        cursor: pointer;
        padding-left: 38px;

        .ace_content {
          height: auto;
          background: transparent !important;

          .ace_layer {
            width: calc(100% - 1rem);
          }
        }
      }
    }
  }

  .datebox {
    &-datepicker,
    &-timepicker {
      width: 50%;

      & .bx--date-picker__input,
      .bx--time-picker__input-field {
        width: 100% !important;
        height: 40px;
        border-bottom: 1px solid $text-05 !important;
      }

      .bx--time-picker__input-field {
        height: 40px;
        border-left: 2px solid $ui-00 !important;
      }
    }

    &-timepicker {
      & .bx--label {
        opacity: 0;
      }
    }
  }
}

.modal-payload {
  .payload-editor {
    height: 500px;

    .ace_scrollbar {
      background: $ui-11;
    }
  }
}
</style>
