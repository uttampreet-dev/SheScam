const axios = require("axios");
axios.post("https://shescam.onrender.com/api/analyze", { message: "test", city: "test" })
  .then(res => console.log("OK", res.status))
  .catch(err => console.log("ERR", err.response?.status, err.response?.data));
