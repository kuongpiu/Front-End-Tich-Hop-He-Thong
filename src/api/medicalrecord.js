import axios from 'axios'
import { getToken } from '@/utils/auth'
const BASE_URL = 'http://localhost:7800/covid-patient'

export function fetchList() {
  return axios.get(BASE_URL + '/all', {
    headers: {
      'Authorization': getToken()
    }
  })
}

export function getPatientById(patientId) {
  return axios.get(BASE_URL, {
    headers: {
      Authorization: getToken()
    },
    params: {
      id: patientId
    }
  })
}

export function insert(patientData) {
  return axios.post(BASE_URL, patientData, {
    headers: {
      Authorization: getToken(),
      'Content-Type': 'application/json'
    }
  })
}

export function updatePatient(patient) {
  return axios.put(BASE_URL, patient, {
    headers: {
      Authorization: getToken(),
      'Content-Type': 'application/json'
    }
  })
}
export function deletePatient(patientId) {
  return axios.delete(BASE_URL, {
    headers: {
      Authorization: getToken()
    },
    params: {
      id: patientId
    }
  })
}
