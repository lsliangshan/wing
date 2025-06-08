<template>
  <svg
    t="1749315759932"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="7373"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="width"
    :height="height"
  >
    <path
      d="M512 1024C229.236364 1024 0 794.763636 0 512S229.236364 0 512 0s512 229.236364 512 512-229.236364 512-512 512z"
      :fill="color"
      p-id="7374"
    ></path>
    <path
      d="M804.212364 331.636364a34.117818 34.117818 0 0 1 2.234181 47.709091L470.109091 740.072727a34.117818 34.117818 0 0 1-46.871273 2.885818L216.994909 569.716364a34.117818 34.117818 0 1 1 43.892364-52.270546l181.434182 152.343273 314.181818-337.082182a34.164364 34.164364 0 0 1 47.709091-1.117091z"
      fill="#FFFFFF"
      p-id="7375"
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
    color: "#30DCAC",
    width: 16,
    height: 16,
  }
);
</script>
