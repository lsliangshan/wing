<template>
  <div
    class="file-viewer"
    contenteditable
    v-text="txt"
    @input="handleInput"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const url = route.query.url;

const originalTxt = ref("");
const txt = ref("");

const getFile = async () => {
  const resp = await fetch(url as string);
  const reader = resp.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder("utf-8");
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    txt.value += decoder.decode(value, { stream: true });
    originalTxt.value = txt.value;
  }
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLDivElement;
  const value = target.innerText;

  window.flutter_inappwebview.callHandler("changeContent", {
    url: url as string,
    content: value,
  });
};

onMounted(() => {
  getFile();
});
</script>

<style>
.file-viewer {
  white-space: pre-wrap;
  padding: 10px;
  box-sizing: border-box;
}
.file-viewer:focus-visible {
  outline: none !important;
}
</style>
