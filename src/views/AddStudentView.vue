<template>
  <div class="w-117 max-w-full mx-auto p-4">
    <fieldset
      class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 box-border"
    >
      <legend class="fieldset-legend text-lg">添加学生</legend>

      <label class="label"
        ><span class="text-error">*</span>
        <span>班级</span>
      </label>
      <div class="flex items-center gap-2">
        <select class="select w-full" v-model="formData.classId">
          <option disabled selected>请选择一个班级</option>
          <option
            v-for="cls in classes"
            :key="'class-' + `${cls.id}`"
            :value="cls.id"
          >
            {{ cls.name }} - {{ cls.teacher }}
          </option>
        </select>
        <button
          class="flex cursor-pointer justify-center items-center w-10 h-10 tooltip tooltip-top"
          data-tip="重新加载班级"
          @click="getAllClass(false)"
        >
          <IconReload :width="18" :height="18" v-if="!isLoadingClasses" />
          <span
            v-else
            class="loading loading-spinner loading-xs text-(--color-base-content)"
          ></span>
        </button>
      </div>

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
        <span>生日</span>
      </label>
      <div class="flex items-center gap-2">
        <date-picker
          v-model:value="formData.birthday"
          type="date"
          placeholder="选择日期"
          class="w-full h-10"
        >
        </date-picker>
      </div>

      <button
        class="btn btn-neutral mt-4"
        @click="addTeacher"
        :disabled="isAdding"
      >
        <span
          v-if="isAdding"
          class="loading loading-spinner loading-xs text-(--color-base-content)"
        ></span>
        <span v-else>添加</span>
      </button>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import DatePicker from "vue-datepicker-next";
import { onMounted, ref } from "vue";
import { useMessageStore } from "@/stores/message.store";
import { useToast } from "vue-toastification";
import IconReload from "@/components/icons/IconReload.vue";

interface ClassEntity {
  row_number?: number;
  id: string;
  name: string;
  teacher?: string;
  link?: string;
  assistant?: string;
}

const messageStore = useMessageStore();
const toast = useToast();

const nameRef = ref<HTMLInputElement>();
const enNameRef = ref<HTMLInputElement>();

const isAdding = ref(false);
const isLoadingClasses = ref(false);

const classes = ref<ClassEntity[]>([]);

const formData = ref({
  name: "",
  en_name: "",
  gender: "女",
  birthday: "",
  classId: "",
  className: "",
  teacherId: "",
  teacherName: "",
  teacherEnName: "",
  discountFee: 0,
});

onMounted(() => {
  getAllClass(true);
});

function resetFormData() {
  formData.value = {
    name: "",
    en_name: "",
    gender: "女",
    birthday: "",
    classId: "",
    className: "",
    teacherId: "",
    teacherName: "",
    teacherEnName: "",
    discountFee: 0,
  };
}

async function getAllClass(isInit?: boolean) {
  if (isLoadingClasses.value) {
    return;
  }
  isLoadingClasses.value = true;
  await messageStore
    .getAllClass()
    .then((res: any) => {
      console.log("getAllClass response: ", res);

      if (!isInit) {
        if (res.data && res.data.list && res.data.list.length > 0) {
          toast.success("班级获取成功");
          classes.value = res.data.list as ClassEntity[];
        } else {
          toast.info("暂无班级");
          classes.value = [];
        }
      }
    })
    .catch((e) => {
      !isInit && toast.error("班级获取失败");
    })
    .finally(() => {
      const t = setTimeout(() => {
        clearTimeout(t);
        isLoadingClasses.value = false;
      }, 500);
    });
}

async function addTeacher() {
  if (isAdding.value) {
    toast.error("请勿重复提交");
    return;
  }

  isAdding.value = true;

  if (!formData.value.name) {
    nameRef.value?.focus();
    return;
  }

  if (!formData.value.en_name) {
    enNameRef.value?.focus();
    return;
  }

  // await messageStore
  //   .addTeacher({
  //     ...formData.value,
  //   })
  //   .then((res: any) => {
  //     if (res.code === 200) {
  //       toast.success("添加成功");
  //       resetFormData();
  //     } else {
  //       toast.error(res.message);
  //     }
  //   })
  //   .catch((err: any) => {
  //     toast.error(err.message);
  //   })
  //   .finally(() => {
  //     isAdding.value = false;
  //   });
}
</script>
