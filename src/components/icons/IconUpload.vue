<template>
  <svg
    t="1747043925351"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="9238"
    :width="width"
    :height="height"
  >
    <path
      d="M96 560a48 48 0 0 1 0-96h832a48 48 0 1 1 0 96H96zM464 96a48 48 0 0 1 96 0v832a48 48 0 1 1-96 0V96z"
      :fill="color"
      p-id="9239"
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
    color: "#606266",
    width: 16,
    height: 16,
  }
);
</script>
