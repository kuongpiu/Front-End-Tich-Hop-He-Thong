import axios from 'axios'
import { getToken } from '@/utils/auth'

const BASE_URL = 'http://localhost:7800/user'
export function login(data) {
  const url = BASE_URL + '/login'
  const config = { headers: { 'Content-Type': 'application/json' } }
  return axios.post(url, data, config)
}

export function signup(data) {
  const url = BASE_URL + '/signup'
  const config = {}
  return axios.post(url, data, config)
}

export function logout() {
  return Promise.resolve()
}

export function getInfo(token) {
  const config = { headers: { 'Authorization': token } }
  return axios.get(BASE_URL, config)
}

export function updateUserInfo(token, infoCanUpdate) {
  console.log('sending update user info: ')
  const config = { headers: { 'Authorization': token } }
  return axios.put(BASE_URL, infoCanUpdate, config)
}

export function insertCheckInRecord(checkInRecord) {
  const url = BASE_URL + '/check-in-history'
  const config = { headers: { 'Authorization': getToken(), 'Content-Type': 'application/json' } }
  return axios.post(url, checkInRecord, config)
}

export function getCheckInHistory() {
  const url = BASE_URL + '/check-in-history/all'
  const config = { headers: { 'Authorization': getToken() } }
  return axios.get(url, config)
}
