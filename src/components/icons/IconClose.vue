<template>
  <svg
    t="1747101214895"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="13548"
    :width="width"
    :height="height"
  >
    <path
      d="M599.466667 505.088l390.826666 390.826667a66.901333 66.901333 0 0 1-94.464 94.464l-390.826666-390.826667-390.826667 390.826667a66.816 66.816 0 0 1-94.378667-94.549334l390.826667-390.826666-390.826667-390.826667A66.730667 66.730667 0 1 1 114.346667 19.882667l390.826666 390.826666 390.826667-390.826666a66.816 66.816 0 0 1 94.464 94.464l-390.826667 390.826666z"
      :fill="color"
      p-id="13549"
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
