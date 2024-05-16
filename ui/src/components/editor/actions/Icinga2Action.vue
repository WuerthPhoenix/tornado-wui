<template>
  <Action :action="action" v-on="$listeners" class="icinga2-action">
    <slot>
      <div class="payload-property-container">
        <div class="payload-property-label">icinga2_action_name</div>
        <div class="payload-property-value" v-if="!editMode">
          {{ payload.icinga2_action_name }}
        </div>
        <OperatorValue
          class="editable-operator-value"
          :light="true"
          v-model="payload.icinga2_action_name"
          @change="update"
          input-type="accessor"
        />
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">icinga2_action_payload</div>
        <div class="payload-property-value">
          <ActionJsonEditor
            :value="payload.icinga2_action_payload"
            :is-editable="editMode"
            @json-updated="updateIcinga2ActionPayloadJson"
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
import { Icinga2Action as Icinga2ActionType } from "@/core/Action/Actions";
import { Icinga2Payload } from "@/core/Action/Payload";
import { cloneDeep, isEqual } from "lodash";
import Tornado from "@/store/tornado";
import ActionJsonEditor from "@/components/editor/ActionJsonEditor.vue";
import OperatorValue from "@/components/editor/OperatorValue.vue";

@Component({
  components: { OperatorValue, ActionJsonEditor, Action },
})
export default class Icinga2Action extends Vue {
  @Prop() public action!: Icinga2ActionType;

  private editableAction: Icinga2ActionType = cloneDeep(this.action);

  get payload(): Icinga2Payload {
    if (this.editMode) return this.editableAction.payload as Icinga2Payload;
    return this.action.payload as Icinga2Payload;
  }

  @Watch("action", { immediate: true, deep: true })
  private actionUpdated(action: Icinga2ActionType): void {
    this.editableAction = cloneDeep(action);
  }

  update(): void {
    if (isEqual(this.editableAction, this.action)) {
      return;
    }
    this.$emit("update", this.editableAction);
  }
  updateIcinga2ActionPayloadJson(json: Record<string, any>): void {
    this.payload.icinga2_action_payload = json;
    this.$emit("update", this.editableAction);
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }
}
</script>

<style lang="scss">
.icinga2-action {
  label {
    display: none;
  }

  .bx--text-input__field-wrapper {
    height: 30px;
  }

  input {
    border: 0;
    height: 30px;
    padding: $spacing-03;
  }
}
</style>
