<template>
  <svg
    t="1749043981697"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="6108"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="width"
    :height="height"
  >
    <path d="M0 0h1024v1024H0z" fill="#D8D8D8" opacity=".01" p-id="6109"></path>
    <path
      d="M512 170.666667a28.444444 28.444444 0 0 1 28.444444 28.444444v284.444445h284.444445a28.444444 28.444444 0 1 1 0 56.888888H540.387556l0.056888 284.444445a28.444444 28.444444 0 1 1-56.888888 0l-0.056889-284.444445H199.111111a28.444444 28.444444 0 0 1 0-56.888888h284.444445v-284.444445A28.444444 28.444444 0 0 1 512 170.666667z"
      :fill="color"
      p-id="6110"
    ></path>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
    width?: number | string;
    height?: number | string;
  }>(),
  {
    color: "#5A6677",
    width: 16,
    height: 16,
  }
);
</script>
