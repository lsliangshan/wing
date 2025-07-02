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
          @change="changeClass"
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

      <div
        class="w-full h-10 mt-4 flex items-center flex-row justify-center"
        v-if="isLoadingClassSchedulesAndReminders"
      >
        <span
          class="loading loading-spinner loading-xs text-(--color-base-content)"
        ></span>
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
            v-model="schedule.repeats"
            class="checkbox checkbox-sm checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
          />
        </div>
        <div class="w-40">
          <el-date-picker
            v-model="schedule.date"
            type="date"
            size="large"
            :format="schedule.repeats ? 'ddd' : 'YYYY-MM-DD'"
            placeholder="选择日期"
            style="width: 100%"
            @change="dataChange($event, index)"
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

      <label class="label mt-4" v-if="formData.reminders.length > 0"
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
      <div
        class="flex flex-row items-center"
        v-if="formData.reminders.length < 5 && formData.reminders.length > 0"
      >
        <button class="btn btn-sm text-[#009933]" @click="addReminder">
          添加提醒
        </button>
      </div>

      <template v-if="formData.classId && !isLoadingClassSchedulesAndReminders">
        <label class="label mt-4"
          ><span class="text-error">*</span>
          <span>通知标题</span>
        </label>
        <div class="w-full h-10 flex items-center flex-row gap-2 mt-2">
          <input
            type="text"
            class="input input-bordered w-full validator"
            placeholder="请输入通知标题"
            required
            ref="titleRef"
            v-model="formData.title"
          />
        </div>

        <label class="label mt-4"
          ><span class="text-error">*</span>
          <span>通知内容</span>

          <div class="btn btn-sm btn-ghost" @click="insertAtCursor('[时间]')">
            插入时间
          </div>
        </label>
        <div class="w-full flex items-center flex-row gap-2 mt-2">
          <textarea
            class="textarea textarea-bordered w-full validator"
            placeholder="请输入通知内容"
            required
            ref="contentRef"
            v-model="formData.content"
          />
        </div>
      </template>

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
import IconClose from "@/components/icons/IconClose.vue";
import { useMessageStore } from "@/stores/message.store";
import IconReload from "@/components/icons/IconReload.vue";
import { useToast } from "vue-toastification";
import { EMessageType } from "@/types";
import { useRoute } from "vue-router";
import { ElDatePicker } from "element-plus";
import { formatTime, getDayOfWeek } from "@/utils/time";

interface ClassEntity {
  row_number?: number;
  id: string;
  name: string;
  teacherName?: string;
  teacherEnName?: string;
  teacherUnionId?: string;
  teacherId?: string;
  link?: string;
  assistant?: string;
}

interface ScheduleEntity {
  date: Date;
  range: Date[];
  repeats: boolean;
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
}

interface ReminderEntity {
  before: number;
  unit: "minute" | "hour" | "day" | "week";
}

interface FormData {
  classId: string;
  teacherUnionId: string;
  schedule: ScheduleEntity[];
  attachments: string[];
  reminders: ReminderEntity[];
  // 通知标题
  title: string;
  // 通知内容
  content: string;
}

const toast = useToast();

const messageStore = useMessageStore();

const route = useRoute();

const classes = ref<ClassEntity[]>([]);

const isLoadingClasses = ref(false);

const isUploadingFiles = ref(false);

const isCreatingSchedule = ref(false);

const isLoadingClassSchedulesAndReminders = ref(false);

const contentRef = ref();

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
  teacherUnionId: "",
  schedule: [
    {
      date: new Date(),
      range: [new Date(), new Date(new Date().setHours(23, 59, 59, 999))],
      repeats: true,
      dayOfWeek: getDayOfWeek(new Date().getTime()),
    },
  ],
  attachments: [],
  reminders: [
    // {
    //   before: 10,
    //   unit: "minute",
    // },
  ],
  title: "",
  content: "",
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
});

function insertAtCursor(text: string) {
  // 读出光标或选区起止位置
  const start = contentRef.value.selectionStart; // 光标起点
  const end = contentRef.value.selectionEnd;

  // 组装插入后的最终内容
  contentRef.value.value =
    contentRef.value.value.slice(0, start) +
    text +
    contentRef.value.value.slice(end);

  // 将光标移到插入文本之后，体验更友好
  const pos = start + text.length;
  contentRef.value.selectionStart = contentRef.value.selectionEnd = pos;
  contentRef.value.focus(); // 让用户继续输入

  formData.value.content = contentRef.value.value;
}

function dataTimeChange(value: Date[], index: number) {
  const date = formData.value.schedule[index].date;

  formData.value.schedule[index].dayOfWeek = getDayOfWeek(date.getTime());

  formData.value.schedule[index].range = value.map((item) => {
    const h = item.getHours();
    const m = item.getMinutes();

    return new Date(date.setHours(h, m, 0, 0));
  });
}
function dataChange(value: Date, index: number) {
  formData.value.schedule[index].date = value;

  formData.value.schedule[index].dayOfWeek = getDayOfWeek(value.getTime());

  formData.value.schedule[index].range = formData.value.schedule[
    index
  ].range.map((item) => {
    const h = item.getHours();
    const m = item.getMinutes();
    return new Date(value.setHours(h, m, 0, 0));
  });
}

function changeClass(e: Event) {
  const classId = (e.target as HTMLSelectElement).value;
  formData.value.teacherUnionId =
    classes.value.find((c) => c.id === classId)?.teacherUnionId || "";
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
  isLoadingClassSchedulesAndReminders.value = true;
  await messageStore
    .getScheduleByClassId({
      classId,
    })
    .then((res: any) => {
      if (res.code == 200 && res.data) {
        if (res.data.list && res.data.list.length > 0) {
          formData.value.title = res.data.list[0].title;
          formData.value.content = res.data.list[0].content;
          formData.value.schedule = res.data.list.map((item: any) => ({
            date: new Date(item.start),
            range: [new Date(item.start), new Date(item.end)],
            repeats: item.repeats == "1",
            dayOfWeek: getDayOfWeek(new Date(item.start).getTime()),
          }));

          const reminders = res.data.list[0].reminders
            .split(";")
            .map((item: string) => ({
              before: Number(item.split("-")[0]),
              unit: item.split("-")[1],
            }));

          formData.value.reminders = reminders;
        } else {
          formData.value.schedule = [
            {
              date: new Date(),
              range: [new Date(), new Date()],
              repeats: true,
              dayOfWeek: getDayOfWeek(new Date().getTime()),
            },
          ];
          formData.value.reminders = [
            {
              before: 30,
              unit: "minute",
            },
          ];
        }
      } else {
        formData.value.schedule = [
          {
            date: new Date(),
            range: [new Date(), new Date()],
            repeats: true,
            dayOfWeek: getDayOfWeek(new Date().getTime()),
          },
        ];
        formData.value.reminders = [
          {
            before: 30,
            unit: "minute",
          },
        ];
      }
    })
    .catch((err) => {
      formData.value.schedule = [
        {
          date: new Date(),
          range: [new Date(), new Date()],
          repeats: true,
          dayOfWeek: getDayOfWeek(new Date().getTime()),
        },
      ];
      formData.value.reminders = [
        {
          before: 30,
          unit: "minute",
        },
      ];
    })
    .finally(() => {
      isLoadingClassSchedulesAndReminders.value = false;
    });
}

function addSchedule() {
  formData.value.schedule.push({
    date: new Date(),
    range: [new Date(), new Date()],
    repeats: true,
    dayOfWeek: getDayOfWeek(new Date().getTime()),
  });
}

function deleteSchedule(index: number) {
  formData.value.schedule.splice(index, 1);
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

function addReminder() {
  formData.value.reminders.push({
    before: 1,
    unit: "day",
  });
}

function deleteReminder(index: number) {
  formData.value.reminders.splice(index, 1);
}

// function resetData() {
//   formData.value = {
//     classId: "",
//     schedule: [
//       {
//         date: new Date(),
//         range: [new Date(), new Date()],
//         repeat: false,
//       },
//     ],
//     attachments: [],
//     reminders: [
//       {
//         before: 10,
//         unit: "minute",
//       },
//     ],
//   };
// }

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
    teacherUnionId: formData.value.teacherUnionId,
    title: formData.value.title,
    content: formData.value.content,
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
    start: formatTime(item.range[0].getTime()),
    end: formatTime(item.range[1].getTime()),
    repeats: item.repeats,
    dayOfWeek: item.dayOfWeek,
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
