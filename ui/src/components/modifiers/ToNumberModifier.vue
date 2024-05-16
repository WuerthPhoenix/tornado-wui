<template>
  <Modifier
    :title="title"
    :description="description"
    :selected="selected"
    v-on="$listeners"
    :has-next="hasNext"
    :has-prev="hasPrev"
    :class-name="className"
  >
    <template v-slot:icon>
      <StringInteger />
    </template>
  </Modifier>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Modifier from "@/components/modifiers/Modifier.vue";
// @ts-ignore
import StringInteger from "@carbon/icons-vue/es/string-integer/16";
import { ToNumberDetails } from "@/core/Extractor/Modifiers";

@Component({
  components: { Modifier, StringInteger },
})
export default class ToNumberModifier extends Vue {
  private title = "editor.modifiers.to_number";
  private description = "editor.modifiers.descriptions.to_number";
  private className = "toNumber";
  @Prop() private data!: ToNumberDetails;
  @Prop() private selected!: boolean;
  @Prop() public hasNext!: boolean;
  @Prop() public hasPrev!: boolean;
}
</script>

<style scoped lang="scss" />
