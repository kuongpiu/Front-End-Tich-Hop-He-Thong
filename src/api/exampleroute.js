import axios from 'axios'
import { getToken } from '@/utils/auth'
const BASE_URL = 'http://localhost:7800/covid-support'
export function fetchData() {
  const data = { 'RequestTo': 'PatientServer' }
  const config = {
    headers: {
      'Authorization': getToken(),
      'Content-Type': 'application/json'
    }
  }
  return axios.post(BASE_URL, data, config)
}
export function sendTelegramMessage(messageInfo) {
  const data = Object.assign({}, messageInfo, { 'RequestTo': 'NotificationRequest' })
  const config = {
    headers: {
      'Authorization': getToken(),
      'Content-Type': 'application/json'
    }
  }
  return axios.post(BASE_URL, data, config)
}
