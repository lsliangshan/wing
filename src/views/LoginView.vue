<template>
  <div>
    <h1>登录</h1>

    <div>
      登录信息：
      <pre><code>{{ JSON.stringify(route.query) }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>
