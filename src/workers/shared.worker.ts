import { EMessageType } from "@/types";
import axios from "axios";

const connections: MessagePort[] = [];

function boardcastMessage(message: any, port: MessagePort) {
  connections.forEach((p) => {
    p.postMessage(message);
  });
}

function uploadFiles(files: File[]): Promise<
  {
    code: number;
    url: string;
    filename: string;
    size: number;
    type: string;
    [key: string]: any;
  }[]
> {
  return new Promise(async (resolve) => {
    if (files.length === 0) {
      resolve([]);
      return;
    }

    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append("files", files[i]);
    }

    fd.append("deleteAfterDays", "0");

    await axios
      .post("https://api.liangqy.com/upload/files", fd, {
        headers: {},
      })
      .then((res) => {
        if (
          res.status === 200 &&
          res.data &&
          res.data.code === 200 &&
          res.data.data
        ) {
          resolve(res.data.data.list);
        }
      })
      .catch((_) => {});

    resolve(
      files.map((item) => ({
        code: 1001,
        url: "",
        filename: item.name,
        size: item.size,
        type: item.type,
      }))
    );
  });
}

async function uploadFilesHandler(message: any, port: MessagePort) {
  const uploadResponse: {
    code: number;
    url: string;
    filename: string;
    size: number;
    type: string;
    [key: string]: any;
  }[] = await uploadFiles(message.files);

  port.postMessage({
    type: EMessageType.uploadFilesResponse,
    message: {
      id: message.id,
      data: uploadResponse,
    },
  });
}

async function requestHandler(message: any, port: MessagePort) {
  const { id, method, url, data, headers } = message;
  let response: any;
  try {
    if (method.toLowerCase() === "get") {
      response = await axios.get(url, {
        params: data,
        headers,
      });
    } else if (method.toLowerCase() === "post") {
      if (headers && headers["content-type"] === "multipart/form-data") {
        const fd = new FormData();
        for (const key in data) {
          fd.append(key, data[key]);
        }
        response = await axios.post(url, fd, {
          headers,
        });
      } else {
        response = await axios.post(url, data, {
          headers,
        });
      }
    } else if (method.toLowerCase() === "put") {
      response = await axios.put(url, data, {
        headers,
      });
    }

    if (response.status === 200) {
      if (response.data) {
        port.postMessage({
          type: EMessageType.response,
          message: {
            id,
            data: response.data,
            code: 200,
          },
        });
      } else {
        port.postMessage({
          type: EMessageType.response,
          message: {
            id,
            error: "无数据",
            code: 200,
          },
        });
      }
    } else {
      port.postMessage({
        type: EMessageType.response,
        message: {
          id,
          error: response.data.error || response.statusText || "未知错误",
          code: response.data.code || response.status || 1001,
        },
      });
    }
  } catch (error: any) {
    port.postMessage({
      type: EMessageType.response,
      message: {
        id,
        code: 1002,
        error: error.message,
      },
    });
  }
}

// @ts-ignore
onconnect = async (event: MessageEvent) => {
  const port = event.ports[0];
  connections.push(port);

  port.onmessage = (e) => {
    try {
      const data =
        Object.prototype.toString.call(e.data) === "[object String]"
          ? JSON.parse(e.data)
          : e.data;
      const { type, message } = data;
      if (!type) return;
      switch (type) {
        case EMessageType.uploadFiles:
          uploadFilesHandler(message, port);
          break;
        case EMessageType.boardcast:
          boardcastMessage(message, port);
          break;
        case EMessageType.request:
          requestHandler(message, port);
          break;
        default:
          break;
      }
    } catch (_) {}
  };

  port.start();
};
