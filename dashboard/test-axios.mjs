import axios from 'axios';
axios.post('https://shescam.onrender.com/api/analyze', { message: 'test', city: 'delhi' })
  .then(r => console.log("OK", r.status, r.data))
  .catch(e => console.log("ERR", e.message, e.response?.status, e.response?.data));
