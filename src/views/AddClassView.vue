<template>
  <div class="w-117 max-w-full mx-auto p-4">
    <fieldset
      class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 box-border"
    >
      <legend class="fieldset-legend text-lg">创建班级</legend>

      <label class="label mt-2"
        ><span class="text-error">*</span>
        <span>班级名称</span>
      </label>
      <div class="flex items-center gap-2">
        <input
          type="text"
          class="input input-bordered w-full validator"
          placeholder="请输入班级名称"
          required
          ref="nameRef"
          v-model="formData.name"
        />
      </div>

      <label class="label mt-4"
        ><span class="text-error">*</span>
        <span>任课老师</span>
      </label>
      <div class="flex items-center gap-2">
        <select
          class="select select-bordered w-full"
          v-model="formData.teacherId"
          placeholder="请选择任课老师"
        >
          <option disabled selected>请选择任课老师</option>
          <option
            v-for="teacher in teachers"
            :key="teacher.id"
            :value="teacher.id"
          >
            {{ teacher.name }} - {{ teacher.en_name }}
          </option>
        </select>
      </div>

      <button
        class="btn btn-neutral mt-4"
        @click="addClass"
        :disabled="isAdding"
      >
        <span
          v-if="isAdding"
          class="loading loading-spinner loading-xs text-(--color-base-content)"
        ></span>
        <span v-else>创建</span>
      </button>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMessageStore } from "@/stores/message.store";
import { useToast } from "vue-toastification";

interface TeacherEntity {
  id: string;
  name: string;
  en_name: string;
  gender: string;
  type: string;
  created_at: string;
  status: string;
}

const messageStore = useMessageStore();
const toast = useToast();

const isAdding = ref(false);

const teachers = ref<TeacherEntity[]>([]);

const formData = ref({
  name: "",
  teacherId: "",
  teacherName: "",
  teacherEnName: "",
});

onMounted(() => {
  getTeachers();
});

function getTeachers() {
  messageStore
    .getTeachers()
    .then((res: any) => {
      console.log("getTeachers response: ", res);
      if (res.code === 200 && res.data && res.data.list) {
        teachers.value = res.data.list || [];
      } else {
        // toast.error(res.message);
      }
    })
    .catch((err: any) => {
      toast.error(err.message);
    });
}

function resetFormData() {
  formData.value = {
    name: "",
    teacherId: "",
    teacherName: "",
    teacherEnName: "",
  };
}

async function addClass() {
  if (isAdding.value) {
    toast.error("请勿重复提交");
    return;
  }

  isAdding.value = true;

  if (!formData.value.name) {
    toast.error("请输入班级名称");
    return;
  }

  if (!formData.value.teacherId) {
    toast.error("请选择任课老师");
    return;
  }

  const teacherIndex = teachers.value.findIndex(
    (teacher) => teacher.id === formData.value.teacherId
  );

  if (teacherIndex === -1) {
    toast.error("任课老师不存在");
    return;
  }

  await messageStore
    .addClass({
      ...formData.value,
      teacherName: teachers.value[teacherIndex].name,
      teacherEnName: teachers.value[teacherIndex].en_name,
    })
    .then((res: any) => {
      if (res.code === 200) {
        toast.success("添加成功");
        resetFormData();
      } else {
        toast.error(res.message);
      }
    })
    .catch((err: any) => {
      toast.error(err.message);
    })
    .finally(() => {
      isAdding.value = false;
    });
}
</script>
