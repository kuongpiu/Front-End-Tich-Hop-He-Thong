// src/utils/gmaps.js

// Your personal API key.
// Get it here: https://console.cloud.google.com/google/maps-apis
import axios from 'axios'

const API_KEY = 'AIzaSyA5aXX3NgTTfuJJ6vdWi4FD0wq7PMwOeds'
const CALLBACK_NAME = 'gmapsCallback'

let initialized = !!window.google
let resolveInitPromise
let rejectInitPromise
// This promise handles the initialization
// status of the google maps script.
const initPromise = new Promise((resolve, reject) => {
  resolveInitPromise = resolve
  rejectInitPromise = reject
})

export function init() {
  // If Google Maps already is initialized
  // the `initPromise` should get resolved
  // eventually.
  if (initialized) return initPromise

  initialized = true
  // The callback function is called by
  // the Google Maps script if it is
  // successfully loaded.
  window[CALLBACK_NAME] = () => resolveInitPromise(window.google)

  // We inject a new script tag into
  // the `<head>` of our HTML to load
  // the Google Maps script.
  const script = document.createElement('script')
  script.async = true
  script.defer = true
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=${CALLBACK_NAME}`
  script.onerror = rejectInitPromise
  document.querySelector('head').appendChild(script)
  return initPromise
}

export function reset() {
  initialized = false
  window.google = undefined
}

export function geocoding(address) {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json'
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: {
        address: address,
        key: API_KEY
      }
    }).then(response => {
      console.log(response)
      const location = response.data.results[0].geometry.location
      if (location != null) {
        resolve(location)
      } else {
        reject('location is null')
      }
    }).catch(err => reject(err))
  })
}
