import axios from 'axios'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const baseURL = 'https://react-blog-5nn6.onrender.com/api'

export const API = axios.create({
  baseURL,
})

API.interceptors.request.use(
  (config: any) => {
    const API_TOKEN = localStorage.getItem('blog_auth_token_vue') || ''
    config.headers = config.headers || {}
    config.headers['access_token'] = API_TOKEN
    return config
  },
  (error: any) => Promise.reject(error),
)
