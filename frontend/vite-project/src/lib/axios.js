import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // send JWT cookie automatically
})

export default axiosInstance
