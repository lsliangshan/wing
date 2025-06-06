<template>
  <div class="w-117 max-w-full mx-auto p-4">
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
          v-model="formData.class"
        >
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
          @click="getClasses"
        >
          <IconReload :width="18" :height="18" v-if="!isLoadingClasses" />
          <span
            v-else
            class="loading loading-spinner loading-xs text-(--color-base-content)"
          ></span>
        </button>
      </div>

      <label class="label mt-4" v-if="formData.schedule.length > 0"
        ><span class="text-error">*</span> <span>上课时间</span></label
      >
      <div
        class="w-full h-10 flex items-center"
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
        <date-picker
          v-model:value="ranges[index]"
          type="datetime"
          range
          placeholder="选择日期"
          class="w-full h-10 mr-2"
          :show-time-panel="showTimeRangePanels.includes(index)"
        >
          <template #icon-calendar></template>
          <template #icon-clear></template>
          <template #footer>
            <button
              class="mx-btn mx-btn-text"
              @click="toggleTimeRangePanel(index)"
            >
              {{
                showTimeRangePanels.includes(index) ? "选择日期" : "选择时间"
              }}
            </button>
          </template>
          <template #input>
            <div
              class="flex w-full rounded-sm border-l-0 rounded-l-none border border-gray-300 dark:border-gray-600 overflow-hidden h-10"
            >
              <div class="h-full px-2 py-1 flex items-center dark:bg-gray-700">
                {{
                  ranges[index]
                    ? formatDateForSchedule({
                        date: ranges[index][0].toLocaleString(),
                        format: schedule.repeat
                          ? "weekday dayPeriod hour:minute"
                          : "YYYY-MM-DD hh:mm",
                      })
                    : ""
                }}
                <span class="mx-2 font-bold">至</span>
                {{
                  ranges[index]
                    ? formatDateForSchedule({
                        date: ranges[index][1].toLocaleString(),
                        format: schedule.repeat
                          ? "weekday dayPeriod hour:minute"
                          : "YYYY-MM-DD hh:mm",
                      })
                    : ""
                }}
              </div>
            </div>
          </template>
        </date-picker>
        <button
          class="cursor-pointer flex justify-center items-center w-10 h-10 tooltip tooltip-top"
          data-tip="删除上课时间"
          v-if="formData.schedule.length > 1"
          @click="deleteSchedule(index)"
        >
          <IconMinus color="#ff3333" :width="24" :height="24" />
        </button>

        <button
          class="flex cursor-pointer justify-center items-center w-10 h-10 tooltip tooltip-top"
          data-tip="添加上课时间"
          v-if="index === formData.schedule.length - 1"
          @click="addSchedule"
        >
          <IconAdd color="#009933" :width="24" :height="24" />
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
            class="w-10 h-full flex flex-row items-center justify-center cursor-pointer"
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
        <button class="btn btn-sm btn-ghost" @click="addReminder">
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
import IconAdd from "@/components/icons/IconAdd.vue";
import IconMinus from "@/components/icons/IconMinus.vue";
import IconUpload from "@/components/icons/IconUpload.vue";
import IconClose from "@/components/icons/IconClose.vue";
import IconFile from "@/components/icons/IconFile.vue";
import { formatDateForSchedule } from "@/utils/time";
import DatePicker from "vue-datepicker-next";
import { useMessageStore } from "@/stores/message.store";
import IconReload from "@/components/icons/IconReload.vue";
import { useToast } from "vue-toastification";
import { EMessageType } from "@/types";
import { useRoute } from "vue-router";

interface ClassEntity {
  row_number?: number;
  id: string;
  name: string;
  teacher?: string;
  link?: string;
  assistant?: string;
}

interface ScheduleEntity {
  start: Date;
  end: Date;
  repeat: boolean;
}

interface ReminderEntity {
  before: number;
  unit: "minute" | "hour" | "day" | "week";
}

interface FormData {
  class: string;
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

const showTimeRangePanels = ref<number[]>([]);

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

const ranges = ref<Date[][]>([]);

const formData = ref<FormData>({
  class: "",
  schedule: [
    {
      start: new Date(),
      end: new Date(),
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
  () => formData.value.class,
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
  getClasses();

  if (route.query.classId) {
    formData.value.class = route.query.classId as string;
  }

  ranges.value = [...formData.value.schedule].map((item) => [
    item.start,
    item.end,
  ]);
});

async function getClasses() {
  if (isLoadingClasses.value) {
    return;
  }
  isLoadingClasses.value = true;
  await messageStore
    .getAllClass()
    .then((res) => {
      classes.value = res as ClassEntity[];
      toast.success("班级获取成功");
    })
    .catch((e) => {
      toast.error("班级获取失败");
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
  // const r = [
  //   {
  //     row_number: 2,
  //     id: "3d8b8bab-5fec-4b6c-941d-1d0257770562",
  //     class: "93a76f40-05a9-45b9-9527-73f77fc0835c",
  //     start: "1749213600000",
  //     end: "1749216600000",
  //     repeat: true,
  //     attachments: [
  //       "https://img.liangqy.com/tmp/bzkzhcitgui1vzyhqbdtzpgoo.json?FlwsrNJnChvb1CAVY6rvS3pIaKOl",
  //       "https://img.liangqy.com/tmp/qvj6r2u7jyta3mptyc1kllgcp.json?Fl4U1KHyWhcyj5COGYVMoeFoxrW_",
  //     ],
  //   },
  //   {
  //     row_number: 3,
  //     id: "ab7c93c3-c397-404e-96d8-5d763ec742cf",
  //     class: "93a76f40-05a9-45b9-9527-73f77fc0835c",
  //     start: "1749115295901",
  //     end: "1749115295901",
  //     repeat: true,
  //     attachments: [
  //       "https://img.liangqy.com/tmp/bzkzhcitgui1vzyhqbdtzpgoo.json?FlwsrNJnChvb1CAVY6rvS3pIaKOl",
  //       "https://img.liangqy.com/tmp/qvj6r2u7jyta3mptyc1kllgcp.json?Fl4U1KHyWhcyj5COGYVMoeFoxrW_",
  //     ],
  //   },
  //   {
  //     row_number: 4,
  //     id: "a27382f8-e38d-4927-939c-c6c2e65836cf",
  //     class: "93a76f40-05a9-45b9-9527-73f77fc0835c",
  //     start: "1749115393733",
  //     end: "1749115393733",
  //     repeat: false,
  //     attachments: [
  //       "https://img.liangqy.com/tmp/bzkzhcitgui1vzyhqbdtzpgoo.json?FlwsrNJnChvb1CAVY6rvS3pIaKOl",
  //       "https://img.liangqy.com/tmp/qvj6r2u7jyta3mptyc1kllgcp.json?Fl4U1KHyWhcyj5COGYVMoeFoxrW_",
  //     ],
  //   },
  // ];
  // formData.value.schedule = r.map((item: any) => ({
  //   start: new Date(Number(item.start)),
  //   end: new Date(Number(item.end)),
  //   repeat: item.repeat,
  // }));
  // ranges.value = [...formData.value.schedule].map((item) => [
  //   item.start,
  //   item.end,
  // ]);
  // return;
  await messageStore
    .getScheduleByClassId({
      classId,
    })
    .then((res: any) => {
      if (res.length > 0) {
        formData.value.schedule = res.map((item: any) => ({
          start: new Date(Number(item.start)),
          end: new Date(Number(item.end)),
          repeat: item.repeat,
        }));
        ranges.value = [...formData.value.schedule].map((item) => [
          item.start,
          item.end,
        ]);
      }
      console.log(">>>>> getScheduleByClassId Response: ", JSON.stringify(res));
    })
    .catch((err) => {
      console.log(".....getScheduleByClassId error; ", err);
    })
    .finally(() => {});
}

function addSchedule() {
  formData.value.schedule.push({
    start: new Date(),
    end: new Date(),
    repeat: true,
  });
  ranges.value = [...formData.value.schedule].map((item) => [
    item.start,
    item.end,
  ]);
}

function deleteSchedule(index: number) {
  formData.value.schedule.splice(index, 1);
}

function toggleTimeRangePanel(index: number) {
  const idx = showTimeRangePanels.value.indexOf(index);
  if (idx === -1) {
    showTimeRangePanels.value.push(index);
  } else {
    showTimeRangePanels.value.splice(idx, 1);
  }
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

function createSchedule() {
  if (isCreatingSchedule.value) {
    return;
  }

  isCreatingSchedule.value = true;

  let requestData: any = {
    class: formData.value.class,
    schedule: [],
    attachments: [],
    reminders: [...formData.value.reminders].map((item) => ({
      before: item.before,
      unit: item.unit,
    })),
  };

  const schedules = [...formData.value.schedule].map((item) => ({
    start: new Date(item.start).getTime(),
    end: new Date(item.end).getTime(),
    repeat: item.repeat,
  }));

  requestData.schedule = schedules;

  requestData.attachments = uploadedFiles.value.map((f) => ({
    url: f.url,
    name: f.filename,
    type: f.type,
    size: f.size,
  }));
  messageStore
    .createSchedule({
      data: { ...requestData },
    })
    .then((res) => {
      console.log(">>>>> createSchedule Response: ", res);
    })
    .catch((err) => {
      console.log(".....create errror; ", err);
    })
    .finally(() => {
      const t = setTimeout(() => {
        clearTimeout(t);
        isCreatingSchedule.value = false;
      }, 500);
    });

  // if (!formData.value.class) {
  //   toast.warning("请选择一个班级");
  //   return;
  // }

  // if (formData.value.schedule.length === 0) {
  //   toast.error("请添加上课时间");
  //   return;
  // }

  // if (formData.value.attachments.length === 0) {
  //   toast.error("请添加课件");
  //   return;
  // }
}
</script>
