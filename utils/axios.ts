import { backendUrl } from "@/sever";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Replace with your actual backend base URL
axios.defaults.baseURL = backendUrl; // No import.meta
// axios.defaults.baseURL = "https://voxa-backend-diu5.onrender.com/"; // No import.meta
axios.defaults.withCredentials = true;

// Dynamically attach Authorization header
axios.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("voxaToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
const responseBody = (response: any) => response.data;
const responseBlob = (response: any) => response.data;
const responseVideo = (response: any) => response.data;

// Base requests
const requests = {
  get: (url: string, params?: any) =>
    axios.get(url, { params }).then(responseBody),

  post: (url: string, body: any) => axios.post(url, body).then(responseBody),

  put: (url: string, body: any) => axios.put(url, body).then(responseBody),

  patch: (url: string, body: any) => axios.patch(url, body).then(responseBody),

  delete: (url: string) => axios.delete(url).then(responseBody),

  postForm: (url: string, data: FormData) =>
    axios
      .post(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(responseBody),

  patchForm: (url: string, data: FormData) =>
    axios
      .patch(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(responseBody),

  processAudio: (url: string, data: any) =>
    axios
      .post(url, data, {
        responseType: "arraybuffer",
      })
      .then(responseBlob),

  processVideo: (url: string, data: any) =>
    axios
      .post(url, data, {
        responseType: "arraybuffer",
      })
      .then(responseVideo),
};

interface AuthInterface {
  username: string;
  password: string;
}
export const AccountApiRequest = {
  register: (body: AuthInterface) => requests.post("account/register", body),
  login: (body: AuthInterface) => requests.post("account/login", body),
  requestVerificationToken: (body: any) =>
    requests.post("account/request-verification-token", body),
  currentUser: () => requests.get("account/current-user"),
  createPushToken: (token: string) =>
    requests.post("account/create-push-token", { pushToken: token }),
  togglePushStatus: () => requests.post("account/toggle-push-status", {}),
};

export const MessagesRequest = {
  sendAudoiMessage: (body: any) =>
    requests.postForm("message/send/audio-message", body),
  processAudioMessage: (body: any) =>
    requests.processAudio("message/process/audio-message", body),
  convertVideo: (body: any) =>
    requests.processVideo("message/process/create-video-stream", body),
  sendTextMessage: (body: any) =>
    requests.post("message/send/text-message", body),
  getMessages: () => requests.get(`message/get-messages`),
  deleteMessage: (id: any) => requests.delete(`message/delete-message/${id}`),
  deleteAllMessages: () => requests.delete(`message/delete-all-message`),
  seenMessage: (id: any) =>
    requests.patch(`message/mark-message-as-read/${id}`, {}),
  toggleFav: (id: any) => requests.patch(`message/star-message/${id}`, {}),
};
