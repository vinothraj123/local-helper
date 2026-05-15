import Axios from "axios";

// const site = "http://192.168.1.102:8000/api/v1";
const site = "https://annattendance.online/api/v1";
// const site = "http://192.168.29.202:8000/api/v1";

const instance = Axios.create({
  baseURL: site,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default instance;
