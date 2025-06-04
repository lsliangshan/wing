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

      <div
        class="w-full h-10 flex items-center"
        v-for="(schedule, index) in formData.schedule"
        :key="index"
      >
        <button
          class="w-10 h-10 rounded-sm rounded-r-none flex cursor-pointer justify-center items-center px-2 bg-accent-100 hover:bg-accent-200 text-accent-700 border border-gray-300 dark:bg-gray-700 dark:text-accent-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <IconSchedule :width="20" :height="20" />
        </button>
        <date-picker
          v-model:value="ranges[index]"
          type="datetime"
          range
          placeholder="选择日期"
          class="w-full h-10"
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
                        showWeekday: true,
                        showDayPeriod: true,
                      })
                    : ""
                }}
                <span class="mx-2 font-bold">至</span>
                {{
                  ranges[index]
                    ? formatDateForSchedule({
                        date: ranges[index][1].toLocaleString(),
                        showDayPeriod: true,
                        showWeekday: false,
                      })
                    : ""
                }}
              </div>
            </div>
          </template>
        </date-picker>
        <button
          class="flex cursor-pointer justify-center items-center px-2 dark:bg-gray-700 dark:text-accent-300 dark:border-gray-600 dark:hover:bg-gray-600"
          v-if="formData.schedule.length > 1"
          @click="deleteSchedule(index)"
        >
          <IconMinus color="#ff3333" :width="24" :height="24" />
        </button>

        <button
          class="flex cursor-pointer justify-center items-center px-2 dark:bg-gray-700 dark:text-accent-300 dark:border-gray-600 dark:hover:bg-gray-600"
          v-if="index === formData.schedule.length - 1"
          @click="addSchedule"
        >
          <IconAdd color="#009933" :width="24" :height="24" />
        </button>
        <!-- <DatePicker
          :key="`schedule-${index}`"
          v-model.range="ranges[index]"
          :mode="mode"
          :rules="rules"
        >
          <template #default="{ togglePopover, inputValue }">
            <div
              class="flex w-full rounded-sm border border-gray-300 dark:border-gray-600 overflow-hidden h-10"
            >
              <button
                class="flex cursor-pointer justify-center items-center px-2 bg-accent-100 hover:bg-accent-200 text-accent-700 border-r border-gray-300 dark:bg-gray-700 dark:text-accent-300 dark:border-gray-600 dark:hover:bg-gray-600"
                @click="() => togglePopover()"
              >
                <IconSchedule :width="24" :height="24" />
              </button>
              <div
                class="w-full h-full px-2 py-1 flex items-center dark:bg-gray-700"
                @click="() => togglePopover()"
              >
                {{
                  ranges[index]
                    ? formatDateForSchedule({
                        date: inputValue.start,
                        showWeekday: true,
                        showDayPeriod: true,
                      })
                    : ""
                }}
                <span class="mx-2 font-bold">至</span>
                {{
                  ranges[index]
                    ? formatDateForSchedule({
                        date: inputValue.end,
                        showDayPeriod: true,
                        showWeekday: false,
                      })
                    : ""
                }}
              </div>
              <button
                class="flex cursor-pointer justify-center items-center px-2 border-l border-gray-300 dark:bg-gray-700 dark:text-accent-300 dark:border-gray-600 dark:hover:bg-gray-600"
                v-if="formData.schedule.length > 1"
                @click="deleteSchedule(index)"
              >
                <IconMinus color="#ff3333" :width="24" :height="24" />
              </button>

              <button
                class="flex cursor-pointer justify-center items-center px-2 border-l border-gray-300 dark:bg-gray-700 dark:text-accent-300 dark:border-gray-600 dark:hover:bg-gray-600"
                v-if="index === formData.schedule.length - 1"
                @click="addSchedule"
              >
                <IconAdd color="#009933" :width="24" :height="24" />
              </button>
            </div>
          </template>
        </DatePicker> -->
      </div>

      <button class="btn btn-neutral mt-4">Login</button>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
// import { DatePicker } from "v-calendar";
import IconSchedule from "@/components/icons/IconSchedule.vue";
import IconAdd from "@/components/icons/IconAdd.vue";
import IconMinus from "@/components/icons/IconMinus.vue";
import { formatDateForSchedule } from "@/utils/time";
import DatePicker from "vue-datepicker-next";

interface DateRange {
  start: Date;
  end: Date;
}

interface ClassEntity {
  row_number: number;
  名称: string;
  老师: string;
}

interface FormData {
  class: string;
  schedule: Date[][];
  repeat: boolean;
}

const classes = ref<ClassEntity[]>([]);

const showTimeRangePanels = ref<number[]>([]);

const mode = ref("dateTime");
const rules = ref({
  hours: {
    min: 0,
    max: 23,
  },
  minutes: {
    min: 0,
    max: 59,
  },
});

const ranges = ref<Date[][]>([]);

const formData = ref<FormData>({
  class: "",
  schedule: [[new Date(), new Date()]],
  repeat: true,
});

onMounted(() => {
  // getClasses();
  ranges.value = [...formData.value.schedule];
});

function getClasses() {
  axios
    .get("https://wf.qyflows.com/webhook-test/class/list")
    .then((response) => {
      classes.value = response.data;
      console.log(classes.value);
    });
}

function addSchedule() {
  formData.value.schedule.push({
    start: new Date(),
    end: new Date(),
  });
}

function deleteSchedule(index: number) {
  formData.value.schedule.splice(index, 1);
}

function updateSchedule(index: number, range: DateRange) {
  formData.value.schedule[index] = range;
  console.log(formData.value.schedule);
}

function toggleTimeRangePanel(index: number) {
  const idx = showTimeRangePanels.value.indexOf(index);
  if (idx === -1) {
    showTimeRangePanels.value.push(index);
  } else {
    showTimeRangePanels.value.splice(idx, 1);
  }
}
</script>
