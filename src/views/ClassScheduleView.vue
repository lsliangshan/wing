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

      <div class="w-full h-10">
        <DatePicker
          v-model.range="range"
          :mode="mode"
          :rules="rules"
          :popover="false"
        >
          <template #default="{ togglePopover, inputValue, inputEvents }">
            <div
              class="flex w-full rounded-sm border border-gray-300 dark:border-gray-600 overflow-hidden h-10"
            >
              <button
                class="flex cursor-pointer justify-center items-center px-2 bg-accent-100 hover:bg-accent-200 text-accent-700 border-r border-gray-300 dark:bg-gray-700 dark:text-accent-300 dark:border-gray-600 dark:hover:bg-gray-600"
                @click="() => togglePopover()"
              >
                <IconSchedule :width="24" :height="24" />
              </button>
              <!-- <input
                v-on="inputEvents"
                class="w-full px-2 py-1 bg-white dark:bg-gray-700"
                :value="`${formatDateForSchedule({
                  date: inputValue.start,
                  showWeekday: true,
                  showDayPeriod: true,
                })} 至 ${formatDateForSchedule({
                  date: inputValue.end,
                  showDayPeriod: true,
                })}`"
              /> -->
              <div
                class="w-full h-full px-2 py-1 flex align-center dark:bg-gray-700"
                v-text="
                  `${formatDateForSchedule({
                    date: inputValue.start,
                    showWeekday: true,
                    showDayPeriod: true,
                  })} 至 ${formatDateForSchedule({
                    date: inputValue.end,
                    showDayPeriod: true,
                  })}`
                "
              ></div>
            </div>
          </template>
        </DatePicker>
      </div>

      <button class="btn btn-neutral mt-4">Login</button>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import { Calendar, DatePicker } from "v-calendar";
import IconSchedule from "@/components/icons/IconSchedule.vue";
import { formatDateForSchedule } from "@/utils/time";

interface DateRange {
  start: Date;
  end: Date;
}

interface FormData {
  class: string;
  schedule: DateRange[];
  repeat: boolean;
}

const classes = ref([]);

const range = ref<DateRange>({
  start: new Date(),
  end: new Date(),
});
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

const formData = ref<FormData>({
  class: "",
  schedule: [],
  repeat: true,
});

onMounted(() => {
  // getClasses();
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
