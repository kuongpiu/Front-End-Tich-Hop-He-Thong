import { fetchData } from '@/api/exampleroute'
import { convertToYYYYMMDDFormat, getSimpleDate } from '@/utils/dateUtils'

const state = {
  patients: [],
  days: [],
  inIsolation: [],
  inCommunity: []
}
const mutations = {
  SET_PATIENTS: (state, patients) => {
    state.patients = patients
  },
  SET_DAYS: (state, days) => {
    state.days = days
  },
  SET_IN_ISOLATION: (state, inIsolation) => {
    state.inIsolation = inIsolation
  },
  SET_IN_COMMUNITY: (state, inCommunity) => {
    state.inCommunity = inCommunity
  }
}
const actions = {
  fetchPatientsData: ({ commit }) => {
    return new Promise((resolve, reject) => {
      fetchData().then(async({ data }) => {
        const transformedPatients = transformData(data)
        const days = Object.keys(transformedPatients).sort((dateA, dateB) => {
          return new Date(new Date(convertToYYYYMMDDFormat(dateA)) - new Date(convertToYYYYMMDDFormat(dateB)))
        })
        const inIsolation = []
        const inCommunity = []
        for (const day of days) {
          inIsolation.push(transformedPatients[day]['inIsolation'])
          inCommunity.push(transformedPatients[day]['inCommunity'])
        }
        commit('SET_DAYS', days)
        commit('SET_IN_ISOLATION', inIsolation)
        commit('SET_IN_COMMUNITY', inCommunity)
        const patients = await Promise.all(data.map(async(patient, index) => {
          if (patient.position) {
            return Object.assign({}, patient)
          } else {
            // const position = await geocoding(patient.address)
            const position = fakePos[index]
            return Object.assign({}, { position: position }, patient)
          }
        }))
        commit('SET_PATIENTS', patients)
        resolve('Xử lý xong dữ liệu bệnh nhân')
      }).catch(err => {
        console.log(err)
        reject('Lỗi khi lấy dữ liệu bệnh nhân')
      })
    })
  }
}
const fakePos = [
  { lat: 22.62330127532687, lng: 105.88041577374455 },
  { lat: 21.175869072571295, lng: 104.47416577374455 },
  { lat: 22.125500828447276, lng: 103.26566967999455 },
  { lat: 20.87848168677269, lng: 105.38603100811955 },
  { lat: 21.64636026036335, lng: 106.62748608624455 },
  { lat: 21.493105851564483, lng: 105.51786694561955 },
  { lat: 21.533989531769414, lng: 107.04496655499455 },
  { lat: 20.457032476632538, lng: 105.41898999249455 },
  { lat: 20.888746284089258, lng: 105.35307202374455 },
  { lat: 21.515626584819508, lng: 106.63079896303609 },
  { lat: 21.477293630340732, lng: 106.97412171694234 },
  { lat: 21.44406357166034, lng: 105.62005677553609 },
  { lat: 22.53913851012798, lng: 106.01281800600484 },
  { lat: 22.320802429475886, lng: 105.62005677553609 },
  { lat: 22.29793348411974, lng: 106.42755189272359 }
]

/*
 * Function: transformData(data)
 *
 * Chức năng: Biến đổi dữ liệu của danh sách bệnh nhân cho hợp với dữ liệu sử dụng
 *
 * Cấu trúc dữ liệu đầu vào có dạng: Array
 * input data = [
 *   Patient{
 *     address: "Địa chỉ"
 *     confirmedDate: "Ngày công bố, định dạng DD-MM-YYYY"
 *     details: "Lịch sử dịch tễ"
 *     dob: "Ngày sinh, định dạng DD-MM-YYYY"
 *     gender: "Giới tính"
 *     id: "Mã bệnh nhân"
 *     name: "Tên bệnh nhân"
 *     type: "Loại ca mắc - gồm trong khu cách ly và cộng đồng"
 *   },
 * ...............]
 *
 * Cấu trúc dữ liệu đầu ra có dạng: Object (key-value pairs)
 *   Key = "Ngày công bố"(confirmedDate)
 *   Value = Object(key-value pairs)
 *           key = "Số bệnh nhân mắc cộng đồng"(inCommunity), value = number Số bệnh nhân mắc cộng đồng"
 *           key = "Số bệnh nhân mắc trong khu cách ly"(inIsolation), value = number Số bệnh nhân mắc trong khu cách ly"
 *           key = "Danh sách bệnh nhân"(patitients), value = Array<Patient> "danh sách các bệnh nhân"
 * */
function transformData(data) {
  return data.reduce((obj, curObj) => {
    // const date = getSimpleDate(curObj.confirmedDate)
    const date = curObj.confirmedDate
    if (obj[date] == null) {
      obj[date] = {}
      obj[date]['patients'] = []
      obj[date]['inIsolation'] = 0
      obj[date]['inCommunity'] = 0
    }
    obj[date]['patients'].push(curObj)
    const type = curObj.type
    if (type.toLowerCase().indexOf('Cộng đồng'.toLowerCase()) >= 0) {
      obj[date]['inCommunity']++
    } else {
      obj[date]['inIsolation']++
    }
    return obj
  }, {})
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
