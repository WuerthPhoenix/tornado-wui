<template>
  <Action
    :action="action"
    v-on="$listeners"
    :class="{ 'editing-in-progress': editMode }"
    class="elasticsearch-action"
  >
    <slot>
      <div class="payload-property-container">
        <div class="payload-property-label">endpoint</div>
        <div class="payload-property-value" v-if="!editMode">
          {{ payload.endpoint }}
        </div>
        <div class="payload-property-value" v-else>
          <OperatorValue
            class="payload-property-value-editable"
            :light="true"
            v-model="payload.endpoint"
            @change="updateInput"
            input-type="accessor"
          />
        </div>
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">index</div>
        <div class="payload-property-value" v-if="!editMode">
          {{ payload.index }}
        </div>
        <div class="payload-property-value" v-else>
          <OperatorValue
            class="payload-property-value-editable"
            :light="true"
            v-model="payload.index"
            @change="updateInput"
            input-type="accessor"
          />
        </div>
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">data</div>
        <div class="payload-property-value json">
          <ActionJsonEditor
            :value="payload.data"
            :is-editable="editMode"
            @json-updated="updateDataInputJson"
          ></ActionJsonEditor>
        </div>
      </div>
      <div class="payload-property-container">
        <div class="payload-property-label">auth</div>
        <div class="payload-property-value json">
          <ActionJsonEditor
            :value="payload.auth"
            :is-editable="editMode"
            @json-updated="updateAuthInputJson"
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
import { ElasticsearchAction as ElasticsearchActionType } from "@/core/Action/Actions";
import { ElasticsearchPayload } from "@/core/Action/Payload";
import { cloneDeep, isEqual } from "lodash";
import Tornado from "@/store/tornado";
import ActionJsonEditor from "@/components/editor/ActionJsonEditor.vue";
import OperatorValue from "@/components/editor/OperatorValue.vue";

@Component({
  components: { OperatorValue, ActionJsonEditor, Action },
})
export default class ElasticsearchAction extends Vue {
  @Prop() public action!: ElasticsearchActionType;

  public editableAction: ElasticsearchActionType = cloneDeep(this.action);

  @Watch("action", { deep: true, immediate: true })
  onExtractorChanged(action: ElasticsearchActionType): void {
    this.editableAction = cloneDeep(action);
  }

  get payload(): ElasticsearchPayload {
    if (this.editMode)
      return this.editableAction.payload as ElasticsearchPayload;
    return this.action.payload as ElasticsearchPayload;
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

  public updateDataInputJson(json: Record<string, any>): void {
    this.payload.dataString = json;
    this.$emit("update", this.editableAction);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public updateAuthInputJson(json: any): void {
    this.payload.authString = json;
    this.$emit("update", this.editableAction);
  }
}
</script>

<style lang="scss">
.elasticsearch-action {
  .bx--text-input {
    height: 34px;
  }
}
</style>

<style scoped lang="scss">
.editing-in-progress .payload-property-value {
  padding: 0;
}
.payload-property-value-editable {
  flex-direction: unset;
}

.json {
  padding: $spacing-03 !important;
}
</style>
