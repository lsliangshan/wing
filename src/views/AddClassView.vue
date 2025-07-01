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
            {{ teacher.name }} - {{ teacher.enName }}
          </option>
        </select>
      </div>

      <label class="label mt-4"
        ><span class="text-error">*</span>
        <span>群图标</span>
      </label>
      <div class="flex items-center gap-2">
        <div
          class="w-20 h-20 cursor-pointer flex flex-row items-center justify-center relative group/item"
          v-if="selectedFile"
        >
          <div
            class="w-full h-full rounded-lg bg-[white] border border-(--color-base-300) overflow-hidden flex items-center justify-center"
          >
            <img class="max-w-full max-h-full" :src="filePath" />

            <Transition name="fade">
              <div
                class="absolute bottom-0 left-0 w-full h-full rounded-lg flex flex-row items-center justify-center bg-black/50"
                v-if="isUploading"
              >
                <span
                  class="loading loading-spinner loading-md text-(--color-base-100)"
                ></span>
              </div>
            </Transition>

            <Transition name="fade">
              <div
                class="absolute bottom-0 left-0 w-full h-full rounded-lg flex flex-row items-center justify-center bg-(--color-base-100)/90"
                v-if="isUploadError"
              >
                <div
                  class="glass px-2 py-1 text-orange-600 text-xs text-shadow-lg select-none"
                >
                  上传失败
                </div>
              </div>
            </Transition>
          </div>

          <div
            class="absolute w-4 h-4 right-[-8px] top-[-8px] bg-(--color-warning) shadow-md rounded-full flex items-center justify-center z-9 p-1 invisible group-hover/item:visible transition-opacity duration-300"
            @click="handleRemoveFile"
            v-if="selectedFile && !isUploading"
          >
            <IconClose
              color="var(--color-warning-content)"
              width="14"
              height="14"
            />
          </div>
        </div>
        <div class="w-20 h-20">
          <button
            class="w-20 h-20 btn btn-sm tooltip tooltip-top relative"
            data-tip="选择附件"
            v-if="!selectedFile"
          >
            <IconUpload color="var(--color-base-content)" />

            <input
              type="file"
              class="file-input file-input-ghost absolute w-full h-full opacity-0 p-0"
              accept="image/*"
              ref="fileInputRef"
              @change="handleFileChange"
            />
          </button>
        </div>
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
import IconClose from "@/components/icons/IconClose.vue";
import IconUpload from "@/components/icons/IconUpload.vue";

interface TeacherEntity {
  id: string;
  name: string;
  enName: string;
  gender: string;
  type: string;
  createdAt: string;
  status: string;
}

const messageStore = useMessageStore();
const toast = useToast();

const isAdding = ref(false);

const teachers = ref<TeacherEntity[]>([]);

const formData = ref({
  name: "",
  icon: "",
  teacherId: "",
  teacherName: "",
  teacherEnName: "",
});

const selectedFile = ref<File | undefined>();
const filePath = ref<string>("");

const isUploading = ref(false);
const isUploadError = ref(false);

onMounted(() => {
  getTeachers();
});

function getTeachers() {
  messageStore
    .getTeachers()
    .then((res: any) => {
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
    icon: "",
    teacherId: "",
    teacherName: "",
    teacherEnName: "",
  };
}

function handleRemoveFile() {
  selectedFile.value = undefined;
  filePath.value = "";
  isUploadError.value = false;
  formData.value.icon = "";
}

function readFilePath(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const p = e.target!.result as string;
      resolve(p);
    };
    reader.readAsDataURL(file);
  });
}

async function handleFileChange(e: any) {
  const file = e.target.files[0];
  if (file) {
    // formData.value.icon = URL.createObjectURL(file);
    selectedFile.value = file;
    isUploading.value = true;
    filePath.value = await readFilePath(file);

    messageStore
      .uploadFile({
        file,
        type: "image",
      })
      .then((res: any) => {
        if (res.code === 200) {
          isUploadError.value = false;
          formData.value.icon = res.data.mediaId;
        } else {
          isUploadError.value = true;
          toast.error(res.message);
        }
      })
      .catch((err: any) => {
        isUploadError.value = true;
        toast.error(err.message);
      })
      .finally(() => {
        isUploading.value = false;
      });
  }
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
      teacherEnName: teachers.value[teacherIndex].enName,
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
