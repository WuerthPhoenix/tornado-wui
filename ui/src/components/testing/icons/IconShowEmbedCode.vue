<template>
  <span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <g clip-path="url(#clip0_7477_2171)">
        <path
          d="M15.4999 8L11.9999 11.5L11.2949 10.795L14.0849 8L11.2949 5.205L11.9999 4.5L15.4999 8Z"
          fill="currentColor"
        />
        <path
          d="M0.5 8L4 4.5L4.705 5.205L1.915 8L4.705 10.795L4 11.5L0.5 8Z"
          fill="currentColor"
        />
        <path
          d="M8.81966 3.00083L6.20947 12.7422L7.1754 13.001L9.78559 3.25964L8.81966 3.00083Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_7477_2171">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
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

  .action-hover-icon--expanded & {
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
