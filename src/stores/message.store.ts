/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { customAlphabet } from "nanoid";
import { defineStore } from "pinia";

import SharedWorkerConstructor from "@/workers/shared.worker?sharedworker";
import { ref, onMounted } from "vue";
import { EMessageType } from "@/types";
import { formatTimeRange } from "@/utils/time";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

export const useMessageStore = defineStore("message", () => {
  const env: "local" | "prod" = "prod";
  const devEnv = "local";

  const sharedWorker = ref(new SharedWorkerConstructor());

  const callbacks: ((event: MessageEvent) => void)[] = [];

  const promises: Record<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: any) => void;
    }
  > = {};

  onMounted(() => {
    sharedWorker.value.port.onmessage = (event) => {
      handleMessage(event);
      callbacks.forEach((fnc) => {
        fnc(event);
      });
    };

    sharedWorker.value.port.start();
  });

  function handleMessage(event: MessageEvent) {
    try {
      const data =
        Object.prototype.toString.call(event.data) === "[object String]"
          ? JSON.parse(event.data)
          : event.data;
      const { type, message } = data;

      if (!type) return;
      switch (type) {
        case EMessageType.uploadFilesResponse:
          uploadFilesResponseHandler(message);
          break;
        case EMessageType.response:
          responseHandler(message);
          break;
        default:
          break;
      }
    } catch (e) {
      console.error("handleMessage error: ", e);
    }
  }

  async function uploadFilesResponseHandler(e: any) {
    console.log("uploadFilesResponseHandler", e);
  }

  async function responseHandler(e: any) {
    if (e.code === 200 && e.id) {
      promises[e.id].resolve(e.data);
    } else {
      promises[e.id].reject(new Error(e.error));
    }

    delete promises[e.id];
  }

  function onMessage(fnc: (event: MessageEvent) => void) {
    callbacks.push(fnc);
  }

  async function request(params: {
    method: "GET" | "POST";
    url: string;
    data?: any;
    headers?: Record<string, string>;
  }) {
    const id = nanoid();
    sharedWorker.value.port.postMessage(
      JSON.stringify({
        type: EMessageType.request,
        message: {
          id,
          method: params.method,
          url: params.url,
          data: params.data,
          headers: params.headers,
        },
      })
    );

    return id;
  }

  async function uploadFiles(params: { files: File[] }) {
    const id = nanoid();
    sharedWorker.value.port.postMessage({
      type: EMessageType.uploadFiles,
      message: { id, files: params.files },
    });

    return id;
  }

  function getAllClass() {
    return new Promise((resolve, reject) => {
      const id = nanoid();
      sharedWorker.value.port.postMessage({
        type: EMessageType.request,
        message: {
          id,
          method: "GET",
          url: `https://wf.liangqy.com/webhook${
            env === "local" ? "-test" : ""
          }/class/list`,
        },
      });

      promises[id] = {
        resolve,
        reject,
      };
    });
  }

  function addClass(params: {
    name: string;
    teacherId: string;
    teacherName: string;
    teacherEnName: string;
  }) {
    return new Promise((resolve, reject) => {
      const id = nanoid();
      sharedWorker.value.port.postMessage({
        type: EMessageType.request,
        message: {
          id,
          method: "POST",
          url: `https://wf.liangqy.com/webhook${
            env === "local" ? "-test" : ""
          }/add-class`,
          data: params,
        },
      });

      promises[id] = {
        resolve,
        reject,
      };
    });
  }

  function createSchedule(params: { data: any }) {
    return new Promise((resolve, reject) => {
      const schedules = [...params.data.schedule].map((item) => {
        return {
          ...item,
          dateStr: formatTimeRange(item.start, item.end),
        };
      });

      const id = nanoid();
      sharedWorker.value.port.postMessage({
        type: EMessageType.request,
        message: {
          id,
          method: "POST",
          url: `https://wf.liangqy.com/webhook${
            env === "local" ? "-test" : ""
          }/class/schedule`,
          data: {
            ...params.data,
            schedule: schedules,
          },
        },
      });

      promises[id] = {
        resolve,
        reject,
      };
    });
  }

  function getScheduleByClassId(params: { classId: string }) {
    return new Promise((resolve, reject) => {
      const id = nanoid();
      sharedWorker.value.port.postMessage({
        type: EMessageType.request,
        message: {
          id,
          method: "GET",
          url: `https://wf.liangqy.com/webhook${
            env === "local" ? "-test" : ""
          }/get-schedule-by-classId?classId=${params.classId}`,
        },
      });

      promises[id] = {
        resolve,
        reject,
      };
    });
  }

  function addTeacher(params: {
    id: string;
    mobile: string;
    name: string;
    enName: string;
    gender: string;
    type: string;
    nick?: string;
    openId?: string;
    stateCode?: string;
    visitor?: boolean;
    unionId?: string;
    userId?: string;
  }) {
    return new Promise((resolve, reject) => {
      const id = nanoid();
      sharedWorker.value.port.postMessage({
        type: EMessageType.request,
        message: {
          id,
          method: "POST",
          url: `https://wf.liangqy.com/webhook${
            env === "local" ? "-test" : ""
          }/add-teacher`,
          data: params,
        },
      });

      promises[id] = {
        resolve,
        reject,
      };
    });
  }

  function getTeachers() {
    return new Promise((resolve, reject) => {
      const id = nanoid();
      sharedWorker.value.port.postMessage({
        type: EMessageType.request,
        message: {
          id,
          method: "GET",
          url: `https://wf.liangqy.com/webhook${
            env === "local" ? "-test" : ""
          }/get-teachers`,
        },
      });

      promises[id] = {
        resolve,
        reject,
      };
    });
  }

  /**
   * 获取用户token
   * https://open.dingtalk.com/document/isvapp/obtain-user-token
   * https://open.dingtalk.com/document/isvapp/tutorial-enabling-login-to-third-party-websites
   */
  function getDingDingUserInfo(params: { code: string }) {
    return new Promise((resolve, reject) => {
      const id = nanoid();
      sharedWorker.value.port.postMessage({
        type: EMessageType.request,
        message: {
          id,
          method: "GET",
          url: `https://wf.liangqy.com/webhook${
            env === "local" ? "-test" : ""
          }/getDingDingUserInfo?code=${params.code}`,
        },
      });

      promises[id] = {
        resolve,
        reject,
      };
    });
  }

  function uploadFile(params: { file: File; type: string }) {
    return new Promise((resolve, reject) => {
      const id = nanoid();

      sharedWorker.value.port.postMessage({
        type: EMessageType.request,
        message: {
          id,
          method: "POST",
          url: `https://wf.liangqy.com/webhook${
            env === "local" ? "-test" : ""
          }/upload`,
          data: {
            type: params.type || "image",
            media: params.file,
          },
          headers: {
            "content-type": "multipart/form-data",
          },
        },
      });

      promises[id] = {
        resolve,
        reject,
      };
    });
  }

  return {
    sharedWorker,
    request,
    onMessage,
    uploadFiles,
    getAllClass,
    addClass,
    createSchedule,
    getScheduleByClassId,
    addTeacher,
    getTeachers,
    getDingDingUserInfo,
    uploadFile,
  };
});
