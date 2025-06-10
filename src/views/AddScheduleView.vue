<template>
  <div class="w-137 max-w-full mx-auto p-4">
    <fieldset
      class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4 box-border"
    >
      <legend class="fieldset-legend text-lg">上课安排</legend>

      <label class="label"
        ><span class="text-error">*</span>
        <span>班级</span>
      </label>
      <div class="flex items-center gap-2">
        <select
          class="select w-full"
          :disabled="!!route.query.classId"
          v-model="formData.classId"
        >
          <option disabled selected>请选择一个班级</option>
          <option
            v-for="cls in classes"
            :key="'class-' + `${cls.id}`"
            :value="cls.id"
          >
            {{ cls.name }} - {{ cls.teacherName }}
          </option>
        </select>
        <button
          class="flex cursor-pointer justify-center items-center w-10 h-10 tooltip tooltip-top"
          data-tip="重新加载班级"
          @click="() => getClasses()"
        >
          <IconReload :width="18" :height="18" v-if="!isLoadingClasses" />
          <span
            v-else
            class="loading loading-spinner loading-xs text-(--color-base-content)"
          ></span>
        </button>
      </div>

      <label class="label mt-4 mb-2" v-if="formData.schedule.length > 0"
        ><span class="text-error">*</span> <span>上课时间</span></label
      >
      <div
        class="w-full h-10 flex items-center flex-row gap-2"
        v-for="(schedule, index) in formData.schedule"
        :key="index"
      >
        <div
          class="w-10 h-10 rounded-sm rounded-r-none flex cursor-pointer justify-center items-center px-2 bg-accent-100 hover:bg-accent-200 text-accent-700 border border-gray-300 dark:bg-gray-700 dark:text-accent-300 dark:border-gray-600 dark:hover:bg-gray-600 tooltip tooltip-top"
          data-tip="是否每周都重复"
        >
          <input
            type="checkbox"
            v-model="schedule.repeat"
            class="checkbox checkbox-sm checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
          />
        </div>
        <div class="w-40">
          <el-date-picker
            v-model="schedule.date"
            type="date"
            size="large"
            :format="schedule.repeat ? 'ddd' : 'YYYY-MM-DD'"
            placeholder="选择日期"
            style="width: 100%"
          >
          </el-date-picker>
        </div>
        <div class="w-54">
          <el-time-picker
            v-model="schedule.range"
            is-range
            format="HH:mm"
            size="large"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
            @change="dataTimeChange($event, index)"
          />
        </div>
        <button
          class="cursor-pointer flex justify-center items-center w-10 h-10 tooltip tooltip-top"
          data-tip="删除上课时间"
          v-if="formData.schedule.length > 1"
          @click="deleteSchedule(index)"
        >
          <IconClose
            color="var(--color-warning-content)"
            :width="12"
            :height="12"
          />
        </button>
      </div>
      <div
        class="flex flex-row items-center"
        v-if="formData.schedule.length > 0"
      >
        <button class="btn btn-sm text-[#009933]" @click="addSchedule">
          添加上课时间
        </button>
      </div>

      <label class="label mt-4"
        ><span class="text-error">*</span>
        <span>提醒</span>
      </label>
      <div
        class="flex items-center gap-2"
        v-for="(reminder, index) in formData.reminders"
        :key="index"
      >
        <div class="w-full h-8 flex flex-row items-center gap-2 pl-3 my-2">
          <div class="w-15 h-full flex flex-row items-center">提前</div>
          <div class="w-25 h-full">
            <input
              type="number"
              class="input input-sm validator"
              required
              min="1"
              :max="remindTime(reminder.unit)"
              v-model="reminder.before"
            />
          </div>
          <div class="w-25 h-full">
            <select class="select select-sm" v-model="reminder.unit">
              <option value="minute">分钟</option>
              <option value="hour">小时</option>
              <option value="day">天</option>
              <option value="week">周</option>
            </select>
          </div>
          <div
            class="w-10 h-full flex flex-row items-center justify-center cursor-pointer tooltip tooltip-top"
            data-tip="删除提醒"
            @click="deleteReminder(index)"
          >
            <IconClose
              color="var(--color-warning-content)"
              width="12"
              height="12"
            />
          </div>
        </div>
      </div>
      <div class="flex flex-row items-center">
        <button class="btn btn-sm text-[#009933]" @click="addReminder">
          添加提醒
        </button>
      </div>

      <label class="label mt-4">
        <span>课件</span>
      </label>
      <div class="flex items-center gap-2 p-2 flex-wrap">
        <div
          class="w-20 h-20 cursor-pointer flex flex-row items-center justify-center relative group/item tooltip tooltip-top"
          v-for="f in selectedFiles"
          :key="f.path"
          :data-tip="f.name"
        >
          <div
            class="w-full h-full rounded-lg bg-[white] border border-(--color-base-300) overflow-hidden flex items-center justify-center"
          >
            <img
              class="max-w-full max-h-full"
              :src="f.path"
              v-if="f.type.startsWith('image/')"
            />
            <div
              v-else
              class="w-full flex flex-col items-center justify-center"
            >
              <IconFile :width="24" :height="24" />
              <div class="w-full text-center text-xs text-gray-500">
                {{ f.name.split(".").pop().toUpperCase() }}
              </div>
            </div>

            <Transition name="fade">
              <div
                class="absolute bottom-0 left-0 w-full h-full rounded-lg flex flex-row items-center justify-center bg-black/50"
                v-if="uploadingFile.indexOf(f.name) > -1"
              >
                <span
                  class="loading loading-spinner loading-md text-(--color-base-100)"
                ></span>
              </div>
            </Transition>

            <Transition name="fade">
              <div
                class="absolute bottom-0 left-0 w-full h-full rounded-lg flex flex-row items-center justify-center bg-(--color-base-100)/90"
                v-if="
                  uploadedFiles.find(
                    (uf) => uf.filename === f.name && uf.code !== 200
                  )
                "
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
            @click="handleRemoveFile(f)"
          >
            <IconClose
              color="var(--color-warning-content)"
              width="14"
              height="14"
            />
          </div>
        </div>
        <button
          class="btn btn-circle btn-sm tooltip tooltip-top relative"
          data-tip="选择附件"
        >
          <IconUpload color="var(--color-base-content)" />

          <input
            type="file"
            class="file-input file-input-ghost absolute w-full h-full opacity-0 p-0"
            accept="*/*"
            multiple
            ref="fileInputRef"
            @change="handleFileChange"
          />
        </button>
      </div>

      <button
        class="btn btn-neutral mt-4"
        @click="createSchedule"
        :disabled="isCreatingSchedule"
      >
        <span
          v-if="isCreatingSchedule"
          class="loading loading-spinner loading-xs text-(--color-base-content)"
        ></span>
        <span v-else>创建</span>
      </button>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref, watch, computed } from "vue";
import IconUpload from "@/components/icons/IconUpload.vue";
import IconClose from "@/components/icons/IconClose.vue";
import IconFile from "@/components/icons/IconFile.vue";
import { useMessageStore } from "@/stores/message.store";
import IconReload from "@/components/icons/IconReload.vue";
import { useToast } from "vue-toastification";
import { EMessageType } from "@/types";
import { useRoute } from "vue-router";
import { ElDatePicker } from "element-plus";

interface ClassEntity {
  row_number?: number;
  id: string;
  name: string;
  teacherName?: string;
  teacherEnName?: string;
  teacherId?: string;
  link?: string;
  assistant?: string;
}

interface ScheduleEntity {
  date: Date;
  range: Date[];
  repeat: boolean;
}

interface ReminderEntity {
  before: number;
  unit: "minute" | "hour" | "day" | "week";
}

interface FormData {
  classId: string;
  schedule: ScheduleEntity[];
  attachments: string[];
  reminders: ReminderEntity[];
}

const toast = useToast();

const messageStore = useMessageStore();

const route = useRoute();

const classes = ref<ClassEntity[]>([]);

const isLoadingClasses = ref(false);

const isUploadingFiles = ref(false);

const isCreatingSchedule = ref(false);

const fileInputRef = ref();

const selectedFiles: Ref<{ path: string; [key: string]: any }[]> = ref([]);

const uploadingFile = ref<string[]>([]);

const uploadIds = ref<string[]>([]);

const uploadedFiles: Ref<
  {
    code: number;
    url: string;
    filename: string;
    size: number;
    type: string;
    [key: string]: any;
  }[]
> = ref([]);

const formData = ref<FormData>({
  classId: "",
  schedule: [
    {
      date: new Date(),
      range: [new Date(), new Date()],
      repeat: true,
    },
  ],
  attachments: [],
  reminders: [
    {
      before: 10,
      unit: "minute",
    },
  ],
});

messageStore.onMessage((event) => {
  // console.log("[from SharedWorker]:", event.data);
  try {
    const { type, message: d } = event.data;
    if (!type) return;
    switch (type) {
      case EMessageType.uploadFilesResponse:
        uploadFilesResponseHandler(d);
        break;
      default:
        break;
    }
  } catch (_) {}
});

watch(
  () => formData.value.classId,
  (newVal) => {
    getScheduleByClassId(newVal);
  },
  {
    immediate: true,
  }
);

const remindTime = computed(() => {
  return function (unit: "minute" | "hour" | "day" | "week") {
    if (unit === "minute") {
      return 40320;
    }
    if (unit === "hour") {
      return 672;
    }
    if (unit === "day") {
      return 28;
    }
    if (unit === "week") {
      return 4;
    }
    return 1;
  };
});

onMounted(() => {
  getClasses(true);

  if (route.query.classId) {
    formData.value.classId = route.query.classId as string;
  }

  formatRanges();
});

function dataTimeChange(value: Date[], index: number) {
  console.log(">>>>>>>>>", value, index);
  // ranges.value[index] = value;
  // formData.value.schedule[index].start = value[0];
  // formData.value.schedule[index].end = value[1];
  // if (!showTimeRangePanels.value.includes(index)) {
  //   showTimeRangePanels.value.push(index);
  // }
}
function formatRanges() {
  // ranges.value = [...formData.value.schedule].map((item) => ({
  //   date: item.start,
  //   range: [item.start, item.end],
  // }));
}

async function getClasses(isInit: boolean = false) {
  if (isLoadingClasses.value) {
    return;
  }
  isLoadingClasses.value = true;
  await messageStore
    .getAllClass()
    .then((res: any) => {
      if (res.code == 200 && res.data) {
        if (res.data.list && res.data.list.length > 0) {
          classes.value = res.data.list as ClassEntity[];
          !isInit && toast.success("班级获取成功");
        } else {
          !isInit && toast.error("暂无班级");
        }
      } else {
        !isInit && toast.error("班级获取失败");
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

async function getScheduleByClassId(classId: string) {
  if (!classId) {
    formData.value.schedule = [];
    return;
  }
  await messageStore
    .getScheduleByClassId({
      classId,
    })
    .then((res: any) => {
      if (res.code == 200 && res.data) {
        if (res.data.list && res.data.list.length > 0) {
          formData.value.schedule = res.data.list.map((item: any) => ({
            date: new Date(item.start),
            range: [new Date(item.start), new Date(item.end)],
            repeat: item.repeat,
          }));
        } else {
          formData.value.schedule = [
            {
              date: new Date(),
              range: [new Date(), new Date()],
              repeat: true,
            },
          ];
        }
      } else {
        formData.value.schedule = [
          {
            date: new Date(),
            range: [new Date(), new Date()],
            repeat: true,
          },
        ];
      }
    })
    .catch((err) => {
      formData.value.schedule = [
        {
          date: new Date(),
          range: [new Date(), new Date()],
          repeat: true,
        },
      ];
    })
    .finally(() => {});
}

function addSchedule() {
  formData.value.schedule.push({
    date: new Date(),
    range: [new Date(), new Date()],
    repeat: true,
  });
}

function deleteSchedule(index: number) {
  formData.value.schedule.splice(index, 1);
}

function readFilePath(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const p = e.target!.result as string;
      const idx = selectedFiles.value.findIndex((f) => f.path === p);
      if (idx === -1) {
        resolve(e.target!.result as string);
      } else {
        resolve("");
      }
    };
    reader.readAsDataURL(file);
  });
}

function handleRemoveFile(file: any) {
  const idx = selectedFiles.value.findIndex((f) => f.path === file.path);
  if (idx !== -1) {
    selectedFiles.value.splice(idx, 1);
  }

  const idx2 = uploadedFiles.value.findIndex((f) => f.filename === file.name);
  if (idx2 !== -1) {
    uploadedFiles.value.splice(idx2, 1);
  }

  fileInputRef.value!.value = "";
}

function uploadFilesResponseHandler(message: any) {
  const { id: responseId, data } = message;
  const idx = uploadIds.value.findIndex((id) => id === responseId);
  if (idx !== -1) {
    uploadIds.value.splice(idx, 1);

    uploadedFiles.value = [...uploadedFiles.value, ...data];

    (
      data as {
        code: number;
        url: string;
        filename: string;
        size: number;
        type: string;
        [key: string]: any;
      }[]
    ).forEach((f) => {
      const idx = uploadingFile.value.findIndex((uf) => uf === f.filename);
      if (idx !== -1) {
        uploadingFile.value.splice(idx, 1);
      }
    });
  }
  isUploadingFiles.value = false;
}

async function handleFileChange(e: Event) {
  if (isUploadingFiles.value) {
    return;
  }

  const files = (e.target as HTMLInputElement).files;

  const newFiles: { path: string; [key: string]: any }[] = [];
  if (!files) return;

  isUploadingFiles.value = true;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const p = await readFilePath(file);
    if (p) {
      newFiles.push({
        file,
        path: p,
        name: file.name,
        type: file.type,
        size: file.size,
      });
      uploadingFile.value.push(file.name);
    }
  }

  selectedFiles.value = [...selectedFiles.value, ...newFiles];

  const uploadId = await messageStore.uploadFiles({
    files: newFiles.map((f) => f.file),
  });

  if (uploadId && uploadIds.value.indexOf(uploadId) === -1) {
    uploadIds.value.push(uploadId);
  }
}

function addReminder() {
  formData.value.reminders.push({
    before: 1,
    unit: "day",
  });
}

function deleteReminder(index: number) {
  formData.value.reminders.splice(index, 1);
}

function resetData() {
  formData.value = {
    classId: "",
    schedule: [
      {
        date: new Date(),
        range: [new Date(), new Date()],
        repeat: false,
      },
    ],
    attachments: [],
    reminders: [
      {
        before: 10,
        unit: "minute",
      },
    ],
  };
}

function createSchedule() {
  if (isCreatingSchedule.value) {
    return;
  }

  if (!formData.value.classId) {
    toast.warning("请选择一个班级");
    return;
  }

  if (formData.value.schedule.length === 0) {
    toast.error("请添加上课时间");
    return;
  }

  // if (formData.value.attachments.length === 0) {
  //   toast.error("请添加课件");
  //   return;
  // }

  isCreatingSchedule.value = true;

  let requestData: any = {
    classId: formData.value.classId,
    schedule: [],
    attachments: [],
    reminders: [...formData.value.reminders].map((item) => ({
      before: item.before,
      unit: item.unit,
    })),
  };

  requestData.attachments = uploadedFiles.value.map((f) => ({
    url: f.url,
    name: f.filename,
    type: f.type,
    size: f.size,
  }));

  requestData.schedule = formData.value.schedule.map((item) => ({
    start: item.range[0],
    end: item.range[1],
    repeat: item.repeat,
  }));

  messageStore
    .createSchedule({
      data: { ...requestData },
    })
    .then((res: any) => {
      if (res.code == 200) {
        // resetData();
        toast.success("创建成功");
      } else {
        toast.error("创建失败");
      }
    })
    .catch((err) => {
      toast.error(err.message || "创建失败");
    })
    .finally(() => {
      const t = setTimeout(() => {
        clearTimeout(t);
        isCreatingSchedule.value = false;
      }, 500);
    });
}
</script>
