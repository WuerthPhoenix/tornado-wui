<template>
  <Action
    :action="action"
    v-on="$listeners"
    :class="{ 'editing-in-progress': editMode }"
  >
    <slot>
      <div class="payload-property-container">
        <div class="payload-property-label">event</div>
        <div class="payload-property-value" v-if="!editMode">
          {{ payload.event }}
        </div>
        <div class="payload-property-value" v-else>
          <OperatorValue
            class="payload-property-value-editable"
            :light="true"
            v-model="payload.event"
            @change="updateInput"
            input-type="accessor"
          />
        </div>
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">archive_type</div>
        <div class="payload-property-value" v-if="!editMode">
          {{ payload.archive_type }}
        </div>
        <div class="payload-property-value" v-else>
          <OperatorValue
            class="payload-property-value-editable"
            :light="true"
            v-model="payload.archive_type"
            @change="updateInput"
            input-type="accessor"
          />
        </div>
      </div>
    </slot>
  </Action>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
// @ts-ignore
import Action from "@/components/editor/actions/Action.vue";
import { ArchiveAction as ArchiveActionType } from "@/core/Action/Actions";
import { ArchivePayload } from "@/core/Action/Payload";
import Tornado from "@/store/tornado";
import { cloneDeep, isEqual } from "lodash";
import OperatorValue from "@/components/editor/OperatorValue.vue";

@Component({
  components: { OperatorValue, Action },
})
export default class ArchiveAction extends Vue {
  @Prop() public action!: ArchiveActionType;

  public editableAction: ArchiveActionType = cloneDeep(this.action);

  @Watch("action", { deep: true, immediate: true })
  onExtractorChanged(action: ArchiveActionType): void {
    this.editableAction = cloneDeep(action);
  }

  get payload(): ArchivePayload {
    if (this.editMode) return this.editableAction.payload as ArchivePayload;
    return this.action.payload as ArchivePayload;
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
}
</script>
<style lang="css">
.bx--text-input {
  height: 34px;
}
</style>

<style scoped lang="css">
.editing-in-progress .payload-property-value {
  padding: 0px;
}
.payload-property-value-editable {
  flex-direction: unset;
}
</style>
