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
          v-model="formData.enName"
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

      <label class="label mt-4">
        <span>钉钉账号</span>
        <span class="text-[#30ACAC] font-bold"
          >（{{ formData.name }} - {{ formData.enName }}）</span
        >
      </label>
      <div class="mt-4 w-75 h-75 mx-auto">
        <LoginBox @success="handleLoginSuccess" @fail="handleLoginFail" />
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
import { ref } from "vue";
import { useMessageStore } from "@/stores/message.store";
import { useToast } from "vue-toastification";
import LoginBox from "@/components/LoginBox.vue";

const messageStore = useMessageStore();
const toast = useToast();

const nameRef = ref<HTMLInputElement>();
const enNameRef = ref<HTMLInputElement>();

const isAdding = ref(false);

const userInfo = ref<{
  mobile: string;
  nick: string;
  userId: string;
  openId: string;
  stateCode: string;
  unionId: string;
  visitor: boolean;
}>({
  mobile: "",
  nick: "",
  userId: "",
  openId: "",
  stateCode: "",
  unionId: "",
  visitor: false,
});

const formData = ref({
  id: "",
  name: "",
  enName: "",
  gender: "女",
  type: "全职老师",
});

function resetFormData() {
  formData.value = {
    id: "",
    name: "",
    enName: "",
    gender: "女",
    type: "全职老师",
  };

  userInfo.value = {
    mobile: "",
    nick: "",
    userId: "",
    openId: "",
    stateCode: "",
    unionId: "",
    visitor: false,
  };
}

function handleLoginSuccess(info: any) {
  userInfo.value = { ...info };
  formData.value.id = userInfo.value.userId;
}

function handleLoginFail() {
  userInfo.value = {
    mobile: "",
    nick: "",
    userId: "",
    openId: "",
    stateCode: "",
    unionId: "",
    visitor: false,
  };
  formData.value.id = "";
}

async function addTeacher() {
  if (isAdding.value) {
    toast.error("请勿重复提交");
    return;
  }

  isAdding.value = true;

  if (!formData.value.name) {
    nameRef.value?.focus();
    isAdding.value = false;
    return;
  }

  if (!formData.value.enName) {
    enNameRef.value?.focus();
    isAdding.value = false;
    return;
  }

  if (!formData.value.id) {
    toast.error("请先扫码登录钉钉账号");
    isAdding.value = false;
    return;
  }

  await messageStore
    .addTeacher({
      ...formData.value,
      ...userInfo.value,
    })
    .then((res: any) => {
      if (res.code === 200) {
        toast.success("添加成功");
        resetFormData();
      } else {
        toast.error(res.message);
        isAdding.value = false;
      }
    })
    .catch((err: any) => {
      toast.error(err.message);
      isAdding.value = false;
    })
    .finally(() => {
      isAdding.value = false;
    });
}
</script>
