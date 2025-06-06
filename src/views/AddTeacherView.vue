<template>
  <div class="w-117 max-w-full mx-auto p-4">
    <fieldset
      class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 box-border"
    >
      <legend class="fieldset-legend text-lg">添加老师</legend>

      <label class="label mt-2"
        ><span class="text-error">*</span>
        <span>姓名</span>
      </label>
      <div class="flex items-center gap-2">
        <input
          type="text"
          class="input input-bordered w-full validator"
          placeholder="请输入姓名"
          required
          ref="nameRef"
          v-model="formData.name"
        />
      </div>

      <label class="label mt-4"
        ><span class="text-error">*</span>
        <span>英文名</span>
      </label>
      <div class="flex items-center gap-2">
        <input
          type="text"
          class="input input-bordered w-full validator"
          placeholder="请输入英文名"
          required
          ref="enNameRef"
          v-model="formData.en_name"
        />
      </div>

      <label class="label mt-4">
        <span>性别</span>
      </label>
      <div class="flex items-center gap-2">
        <select class="select select-bordered w-full" v-model="formData.gender">
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
      </div>

      <label class="label mt-4">
        <span>类型</span>
      </label>
      <div class="flex items-center gap-2">
        <select class="select select-bordered w-full" v-model="formData.type">
          <option value="全职老师">全职老师</option>
          <option value="兼职老师">兼职老师</option>
        </select>
      </div>

      <button class="btn btn-neutral mt-4" @click="addTeacher">
        <span>添加</span>
      </button>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const nameRef = ref<HTMLInputElement>();
const enNameRef = ref<HTMLInputElement>();

const formData = ref({
  name: "",
  en_name: "",
  gender: "男",
  type: "全职老师",
});

function addTeacher() {
  if (!formData.value.name) {
    nameRef.value?.focus();
    return;
  }

  if (!formData.value.en_name) {
    enNameRef.value?.focus();
    return;
  }

  messageStore.addTeacher(formData.value);
}
</script>
