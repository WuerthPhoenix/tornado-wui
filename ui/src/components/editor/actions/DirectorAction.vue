<template>
  <Action
    :action="action"
    v-on="$listeners"
    :class="{ 'editing-in-progress': editMode }"
    class="director-action-container"
  >
    <slot>
      <div class="payload-property-container">
        <div class="payload-property-label">action_name</div>
        <div class="payload-property-value" v-if="!editMode">
          {{ payload.action_name }}
        </div>
        <div class="payload-property-value" v-else>
          <OperatorValue
            class="payload-property-value-editable"
            :light="true"
            v-model="payload.action_name"
            @change="updateInput"
            input-type="accessor"
          />
        </div>
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">action_payload</div>
        <div class="payload-property-value json">
          <ActionJsonEditor
            :value="payload.action_payload"
            :is-editable="editMode"
            @json-updated="updateAuthInputJson"
          ></ActionJsonEditor>
        </div>
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">icinga2_live_creation</div>
        <div class="payload-property-value" v-if="!editMode">
          {{ payload.icinga2_live_creation }}
        </div>
        <div
          class="toggle payload-property-value"
          v-else
          @click="toggleLiveCreation"
        >
          {{ payload.icinga2_live_creation }}
        </div>
      </div>
    </slot>
  </Action>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
// @ts-ignore
import Action from "@/components/editor/actions/Action.vue";
import { DirectorAction as DirectorActionType } from "@/core/Action/Actions";
import { DirectorPayload } from "@/core/Action/Payload";
import { cloneDeep, isEqual } from "lodash";
import Tornado from "@/store/tornado";
import ActionJsonEditor from "@/components/editor/ActionJsonEditor.vue";
import OperatorValue from "@/components/editor/OperatorValue.vue";

@Component({
  components: { OperatorValue, ActionJsonEditor, Action },
})
export default class DirectorAction extends Vue {
  @Prop() public action!: DirectorActionType;

  public editableAction: DirectorActionType = cloneDeep(this.action);

  @Watch("action", { deep: true, immediate: true })
  onExtractorChanged(action: DirectorActionType): void {
    this.editableAction = cloneDeep(action);
  }

  get payload(): DirectorPayload {
    if (this.editMode) return this.editableAction.payload as DirectorPayload;
    return this.action.payload as DirectorPayload;
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  public updateInput(): void {
    if (isEqual(this.editableAction, this.action)) {
      return;
    }
    this.$emit("update", this.editableAction);
  }

  public toggleLiveCreation(): void {
    (this.editableAction.payload as DirectorPayload).toggleLiveCreation();
    this.$emit("update", this.editableAction);
  }

  public updateAuthInputJson(json: Record<string, any>): void {
    this.payload.action_payload = json;
    this.$emit("update", this.editableAction);
  }
}
</script>

<style lang="scss">
.director-action-container {
  .bx--text-input,
  .bx--text-area {
    height: 34px;
  }
}
</style>
<style scoped lang="scss">
.editing-in-progress .payload-property-value {
  padding: 0px;
}
.payload-property-value-editable {
  flex-direction: unset;
}
.toggle {
  cursor: pointer;
  padding: $spacing-03 !important;
  text-transform: capitalize;
}
.json {
  padding: $spacing-03 !important;
}
</style>
