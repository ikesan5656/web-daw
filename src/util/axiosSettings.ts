import axios from "axios";

export const apiBaseClient = axios.create({
  baseURL: "http://127.0.0.1:50021/",
});
