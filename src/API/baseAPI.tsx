import axios from 'axios'
import { BASE_URL } from '../config'

const instance = axios.create({
  baseURL: `${BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default instance
