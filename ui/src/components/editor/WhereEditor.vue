<template>
  <div class="where-editor">
    <div v-if="isEmpty">
      <div>
        {{ $tc("editor.no_condition_found") }}
      </div>
      <GroupTypeButton
        class="add-group-btn"
        :value="$tc('editor.add_group')"
        @select-group="addGroup"
        v-if="editMode && isEditable"
      />
    </div>
    <div v-else>
      <WhereOperator
        :operator="where"
        @change="onWhereChanged"
        @delete="onWhereDeleted"
        :is-root-element="true"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Model, Prop } from "vue-property-decorator";
import { OperatorDto } from "tornado-backend-dto";
import WhereOperator from "./WhereOperator.vue";
import Tornado, { OperatorType } from "@/store/tornado";
import GroupTypeButton from "@/components/editor/GroupTypeButton.vue";
@Component({
  components: { GroupTypeButton, WhereOperator },
})
export default class WhereEditor extends Vue {
  @Model("change") where!: OperatorType | null;
  @Prop() public isEditable!: boolean;

  get editMode(): boolean {
    return Tornado.editMode;
  }

  get isEmpty(): boolean {
    return this.where === null;
  }

  private addGroup(type: string) {
    let operator;
    if (type === "AND") {
      operator = {
        type: "AND",
        operators: [],
      };
    } else if (type === "OR") {
      operator = {
        type: "OR",
        operators: [],
      };
    } else if (type === "NOT") {
      operator = {
        type: "NOT",
        operator: {
          type: "equals",
          first: "",
          second: "",
        },
      };
    }

    this.$emit("change", operator);
  }

  private onWhereChanged(where: OperatorDto | null) {
    this.$emit("change", where);
  }

  private onWhereDeleted() {
    this.onWhereChanged(null);
  }
}
</script>
