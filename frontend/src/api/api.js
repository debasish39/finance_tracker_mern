import axios from "axios";

const API =
  axios.create({
    baseURL:
      "https://finance-tracker-mern-o44s.onrender.com/api"
  });

export default API;