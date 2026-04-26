const axios = require("axios");
axios.post("https://shescam.onrender.com//api/analyze", { message: "test" })
  .catch(err => console.log("ERR", err.response?.status, err.response?.statusText));
