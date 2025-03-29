import axios from "axios";

const axiosZoomInstancie = axios.create({
  headers: {
    Authorization: `Bearer ${process.env.ZOOM_ACCESS_TOKEN}`,
  },
  baseURL: "https://api.zoom.us/v2",
});

export default axiosZoomInstancie;
