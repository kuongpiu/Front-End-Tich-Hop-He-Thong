import axios from 'axios'
import { getToken } from '@/utils/auth'
const BASE_URL = 'http://localhost:7800/message'
export function getCities() {
  return axios.get(BASE_URL + '/city/all', {
    headers: {
      Authorization: getToken()
    }
  })
}

export function sendMessage(data) {
  return axios.post(BASE_URL, data, {
    headers: {
      Authorization: getToken(),
      'Content-Type': 'application/json'
    }
  })
}

export function getMessages() {
  return axios.get(BASE_URL + '/all', {
    headers: {
      Authorization: getToken()
    }
  })
}
export function getSubscribeCities() {
  return axios.get(BASE_URL + '/subscribe', {
    headers: {
      Authorization: getToken()
    }
  })
}
export function updateSubscribeCities(data) {
  return axios.post(BASE_URL + '/subscribe', data, {
    headers: {
      Authorization: getToken(),
      'Content-Type': 'application/json'
    }
  })
}
