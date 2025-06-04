<template>
  <div class="w-100 max-w-full mx-auto">
    <fieldset
      class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4"
    >
      <legend class="fieldset-legend text-lg">上课安排</legend>

      <label class="label"
        ><span class="text-error">*</span>
        <span>班级</span>
      </label>
      <select class="select w-full mb-4">
        <option disabled selected>请选择一个班级</option>
        <option v-for="cls in classes" :key="'class-' + `${cls.row_number}`">
          {{ cls.名称 }} - {{ cls.老师 }}
        </option>
      </select>

      <label class="label">上课时间</label>
      <div class="w-full"></div>

      <button class="btn btn-neutral mt-4">Login</button>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";

interface FormData {
  class: string;
  time: Date[];
  repeat: boolean;
}

const classes = ref([]);

const formData = ref<FormData>({
  class: "",
  time: [],
  repeat: true,
});

onMounted(() => {
  getClasses();
});

function getClasses() {
  axios
    .get("https://wf.qyflows.com/webhook-test/class/list")
    .then((response) => {
      classes.value = response.data;
      console.log(classes.value);
    });
}
</script>
