<template>
  <svg
    id="collapsed-view-icon"
    width="40"
    height="40"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        v-if="isCollapsed"
        d="M26.25 17.75h-12.5v-3.5h12.5v3.5Zm1.25 0v-3.5A1.25 1.25 0 0 0 26.25 13h-12.5a1.25 1.25 0 0 0-1.25 1.25v3.5A1.25 1.25 0 0 0 13.75 19h12.5a1.25 1.25 0 0 0 1.25-1.25ZM26.25 25.75h-12.5v-3.5h12.5v3.5Zm1.25 0v-3.5A1.25 1.25 0 0 0 26.25 21h-12.5a1.25 1.25 0 0 0-1.25 1.25v3.5A1.25 1.25 0 0 0 13.75 27h12.5a1.25 1.25 0 0 0 1.25-1.25Z"
      />
      <path
        v-else
        d="M26.25 15.75h-12.5v-1.5h12.5v1.5Zm1.25 0v-1.5A1.25 1.25 0 0 0 26.25 13h-12.5a1.25 1.25 0 0 0-1.25 1.25v1.5A1.25 1.25 0 0 0 13.75 17h12.5a1.25 1.25 0 0 0 1.25-1.25ZM26.25 20.75h-12.5v-1.5h12.5v1.5Zm1.25 0v-1.5A1.25 1.25 0 0 0 26.25 18h-12.5a1.25 1.25 0 0 0-1.25 1.25v1.5A1.25 1.25 0 0 0 13.75 22h12.5a1.25 1.25 0 0 0 1.25-1.25ZM26.25 25.75h-12.5v-1.5h12.5v1.5Zm1.25 0v-1.5A1.25 1.25 0 0 0 26.25 23h-12.5a1.25 1.25 0 0 0-1.25 1.25v1.5A1.25 1.25 0 0 0 13.75 27h12.5a1.25 1.25 0 0 0 1.25-1.25Z"
      />
    </g>
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class CollapsedViewIcon extends Vue {
  @Prop({ default: false }) public isCollapsed!: boolean;
  @Prop({ default: "" }) public fill!: string;
}
</script>

<style lang="scss" scoped>
#collapsed-view-icon g {
  fill: $icon-02;
}
</style>
