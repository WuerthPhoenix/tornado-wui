<template>
  <span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <path
        fill="currentColor"
        d="M30,15H27.9492A12.0071,12.0071,0,0,0,17,4.0508V2H15V4.0508A12.0071,12.0071,0,0,0,4.0508,15H2v2H4.0508A12.0071,12.0071,0,0,0,15,27.9492V30h2V27.9492A12.0071,12.0071,0,0,0,27.9492,17H30ZM17,25.9492V22H15v3.9492A10.0166,10.0166,0,0,1,6.0508,17H10V15H6.0508A10.0166,10.0166,0,0,1,15,6.0508V10h2V6.0508A10.0166,10.0166,0,0,1,25.9492,15H22v2h3.9492A10.0166,10.0166,0,0,1,17,25.9492Z"
      />
      <rect width="32" fill="none" height="32" />
    </svg>
  </span>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class IconGoToCode extends Vue {}
</script>

<style lang="scss" scoped>
span {
  display: flex;
  align-items: center;
  justify-content: center;
}

button {
  border: 0;
  margin: 0;
  padding: 0;
  background-color: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

svg {
  transition-property: opacity;
  transition-timing-function: carbon--motion(standard, expressive);
  transition-duration: $moderate-01;
  color: $tag-text-01;
  cursor: pointer;
  height: 1rem;
  width: 1rem;
  &:hover {
    opacity: 0.7;
  }
}
</style>
