<template>
  <div class="with-editor">
    <div v-if="isEmpty">
      {{ $tc("editor.no_extractor_found") }}
    </div>
    <div
      v-if="editMode && isEmpty"
      class="with-editor__actions with-editor__actions--empty"
      @click="addExtractor"
    >
      {{ $tc("editor.add_extractor") }}
      <Add20 class="with-editor__add" />
    </div>
    <div class="with-editor__extractors" v-else>
      <div class="with-editor__table">
        <WithExtractor
          v-for="(item, index) in this.with"
          :key="item.variable"
          :extractor="item"
          :itemIndex="index"
          @delete="onDeleteExtractor"
          @update="onUpdateExtractor(index, $event)"
        />
      </div>
      <div v-if="editMode" class="with-editor__actions" @click="addExtractor">
        {{ $tc("editor.add_extractor") }}
        <Add20 class="with-editor__add" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import WithExtractor from "@/components/editor/WithExtractor.vue";
import Tornado from "@/store/tornado";
// @ts-ignore
import Add20 from "@carbon/icons-vue/es/add/20";
import Extractor from "@/core/Extractor/Extractor";
import { cloneDeep } from "lodash";
@Component({
  components: { WithExtractor, Add20 },
})
export default class WithEditor extends Vue {
  @Prop({ default: null }) public with!: Extractor[];

  get isEmpty(): boolean {
    return this.with.length === 0;
  }

  get editMode(): boolean {
    return Tornado.editMode;
  }

  public addExtractor(): void {
    this.$emit("addExtractor");
  }

  public onDeleteExtractor(row: Extractor, itemIndex: number): void {
    this.$emit("deleteExtractor", row, itemIndex);
  }

  public onUpdateExtractor(index: number, extractor: Extractor): void {
    const editableWith = cloneDeep(this.with);
    editableWith[index] = extractor;
    this.$emit("update", editableWith);
  }
}
</script>

<style lang="scss">
.from {
  .editable-operator-value {
    .bx--text-area {
      padding: 0 8px;
    }
  }
}
</style>

<style lang="scss" scoped>
.with-editor {
  &__extractors {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }
  &__actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    max-width: 177px;
    min-width: 177px;
    padding: $spacing-03;
    background: $ui-02;
    align-self: flex-start;
    &:hover {
      cursor: pointer;
    }
    &--empty {
      margin-top: $spacing-04;
    }
  }
  &__table {
    width: inherit;
  }
  &__add {
    cursor: pointer;
    &:hover {
      fill: $interactive-01;
    }
  }
}
</style>
