<template>
  <Action
    :action="action"
    v-on="$listeners"
    :class="{ 'editing-in-progress': editMode }"
  >
    <slot>
      <div class="payload-property-container">
        <div class="payload-property-label">check_result</div>

        <div class="payload-property-value">
          <ActionJsonEditor
            :value="payload.check_result"
            :is-editable="editMode"
            @json-updated="updateCheckInputJson"
          ></ActionJsonEditor>
        </div>
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">host</div>
        <div class="payload-property-value">
          <ActionJsonEditor
            :value="payload.host"
            :is-editable="editMode"
            @json-updated="updateHostInputJson"
          ></ActionJsonEditor>
        </div>
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">service</div>
        <div class="payload-property-value">
          <ActionJsonEditor
            :value="payload.service"
            :is-editable="editMode"
            @json-updated="updateServiceInputJson"
          ></ActionJsonEditor>
        </div>
      </div>
    </slot>
  </Action>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
// @ts-ignore
import Action from "@/components/editor/actions/Action.vue";
import { SmartMonitoringCheckResultAction as SmartMonitoringCheckResultActionType } from "@/core/Action/Actions";
import { SmartMonitoringCheckResultPayload } from "@/core/Action/Payload";
import { cloneDeep } from "lodash";
import Tornado from "@/store/tornado";
import ActionJsonEditor from "@/components/editor/ActionJsonEditor.vue";

@Component({
  components: { ActionJsonEditor, Action },
})
export default class SmartMonitoringCheckResultAction extends Vue {
  @Prop() public action!: SmartMonitoringCheckResultActionType;

  public editableAction: SmartMonitoringCheckResultActionType = cloneDeep(
    this.action
  );

  @Watch("action", { deep: true, immediate: true })
  onExtractorChanged(action: SmartMonitoringCheckResultActionType): void {
    this.editableAction = cloneDeep(action);
  }

  get payload(): SmartMonitoringCheckResultPayload {
    if (this.editMode)
      return this.editableAction.payload as SmartMonitoringCheckResultPayload;
    return this.action.payload as SmartMonitoringCheckResultPayload;
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  public updateCheckInputJson(json: Record<string, any>): void {
    this.payload.check_result = json;
    this.$emit("update", this.editableAction);
  }

  public updateHostInputJson(json: Record<string, any>): void {
    this.payload.host = json;
    this.$emit("update", this.editableAction);
  }

  public updateServiceInputJson(json: Record<string, any>): void {
    this.payload.service = json;
    this.$emit("update", this.editableAction);
  }
}
</script>
