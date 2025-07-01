<template>
  <div class="relative w-75 h-75">
    <div :id="`login-box-${elId}`" class="self-defined-classname"></div>
    <div
      class="absolute top-0 left-0 w-full h-full bg-black/60 flex flex-col items-center justify-center"
      v-if="isLogin || userInfo.unionId"
    >
      <template v-if="userInfo.unionId">
        <IconSuccess :width="40" :height="40" />
        <div class="text-white text-[16px] mt-2 flex flex-row">
          <div class="font-500 text-[#30DCAC]">{{ userInfo.nick }}</div>
          <div class="font-500 ml-2">已登录</div>
        </div>
      </template>
      <template v-else>
        <div class="text-white text-[16px] mt-2 flex flex-row">
          <span class="loading loading-spinner loading-lg text-white"></span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { customAlphabet } from "nanoid";
import IconSuccess from "./icons/IconSuccess.vue";
import { useMessageStore } from "@/stores/message.store";
import { useToast } from "vue-toastification";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

const url = "https://g.alicdn.com/dingding/h5-dingtalk-login/0.21.0/ddlogin.js";

const $emit = defineEmits<{
  (e: "success", userInfo: any): void;
  (e: "fail"): void;
}>();

const elId = ref(nanoid());

const isLogin = ref(false);

const userInfo = ref<{
  userId: string;
  mobile: string;
  nick: string;
  openId: string;
  stateCode: string;
  unionId: string;
  visitor: boolean;
}>({
  userId: "",
  mobile: "",
  nick: "",
  openId: "",
  stateCode: "",
  unionId: "",
  visitor: false,
});

const messageStore = useMessageStore();
const toast = useToast();
onMounted(() => {
  const s = document.createElement("script");
  s.src = url;
  s.async = true;
  document.head.appendChild(s);

  setTimeout(() => {
    initLoginQrcode();
  }, 1000);
});

function initLoginQrcode() {
  window.DTFrameLogin(
    {
      id: `login-box-${elId.value}`,
      width: 300,
      height: 300,
    },
    {
      redirect_uri: encodeURIComponent("http://10.2.6.210:5173/login"),
      client_id: "dingkbjfwewqmbaiz9uj",
      scope: "openid",
      response_type: "code",
      prompt: "consent",
    },
    async (loginResult: any) => {
      const { authCode } = loginResult;

      isLogin.value = true;
      messageStore.getDingDingUserInfo({ code: authCode }).then((res: any) => {
        console.log(">>>>>> res", res);
        if (res.code == 200) {
          // 获取用户信息成功
          userInfo.value = res.data;
          $emit("success", userInfo.value);
        } else {
          // 获取用户信息失败
          toast.error("登录失败，请稍后重试");
          $emit("fail");
        }
        isLogin.value = false;
      });
    },
    (errorMsg: any) => {
      // 这里一般需要展示登录失败的具体原因,可以使用toast等轻提示
      console.log(">>>>>> errorMsg", errorMsg);
      toast.error(errorMsg || "登录失败，请稍后重试");
      $emit("fail");
      isLogin.value = false;
    }
  );
}
</script>

<style>
.self-defined-classname {
  width: 300px;
  height: 300px;
}
</style>
