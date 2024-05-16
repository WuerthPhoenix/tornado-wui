<template>
  <div class="no-rule-selected">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <g clip-path="url(#clip0_7211_6109)">
        <path d="M22 16H10V18H22V16Z" fill="currentColor" />
        <path d="M22 10H10V12H22V10Z" fill="currentColor" />
        <path
          d="M16 30L9.82421 26.7071C8.06345 25.7705 6.59101 24.372 5.56492 22.6619C4.53883 20.9517 3.99783 18.9944 4.00001 17V4C4.00059 3.46975 4.21149 2.96138 4.58644 2.58643C4.96138 2.21148 5.46975 2.00058 6.00001 2H26C26.5303 2.00058 27.0386 2.21148 27.4136 2.58643C27.7885 2.96138 27.9994 3.46975 28 4V17C28.0021 18.9943 27.4611 20.9516 26.435 22.6617C25.409 24.3719 23.9365 25.7703 22.1758 26.7069L16 30ZM6.00001 4V17C5.99828 18.6318 6.44096 20.2333 7.28055 21.6325C8.12014 23.0318 9.32493 24.176 10.7656 24.9423L16 27.7333L21.2344 24.9423C22.6751 24.176 23.8799 23.0318 24.7195 21.6325C25.559 20.2333 26.0017 18.6318 26 17V4H6.00001Z"
          fill="#6F6F6F"
        />
      </g>
      <defs>
        <clipPath id="clip0_7211_6109">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
    <span>
      {{ $tc("test_window.select_ruleset_to_see_extracted_variables") }}
    </span>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.no-rule-selected {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.875rem 0;
  color: $ui-input-border;
  height: auto;
  max-height: calc(100vh - 3.1rem);
  min-height: 10rem;
  flex-grow: 1;
  margin: 0;

  span {
    display: block;
    max-width: 24ch;
    font-size: 0.875rem;
    text-align: center;
    line-height: 1.2;
  }
}
</style>
