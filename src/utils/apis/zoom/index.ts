import axios from "axios";

const axiosZoomInstancie = axios.create({
  baseURL: "https://api.zoom.us/v2",
});

export default axiosZoomInstancie;
