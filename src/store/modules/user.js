import { login, logout, getInfo, getCheckInHistory, updateUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { getSimpleDate } from '@/utils/dateUtils'

const state = {
  token: getToken(),
  avatar: '',
  roles: [],
  name: '',
  gender: '',
  dob: '',
  phoneNumber: '',
  telegramUsername: '',
  telegramUid: '',
  address: '',
  checkInHistory: {}
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_GENDER: (state, gender) => {
    state.gender = gender
  },
  SET_DOB: (state, dob) => {
    state.dob = dob
  },
  SET_PHONE_NUMBER: (state, phoneNumber) => {
    state.phoneNumber = phoneNumber
  },
  SET_ADDRESS: (state, address) => {
    state.address = address
  },
  SET_TELEGRAM_USERNAME: (state, telegramUsername) => {
    state.telegramUsername = telegramUsername
  },
  SET_TELEGRAM_UID: (state, telegramUid) => {
    state.telegramUid = telegramUid
  },
  SET_CHECKIN_HISTORY: (state, checkInHistory) => {
    state.checkInHistory = checkInHistory
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        console.log(data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  updateUserInfo({ commit, state }, infoCanUpdate) {
    return new Promise((resolve, reject) => {
      updateUserInfo(state.token, infoCanUpdate).then(response => {
        const data = response.data
        let { name, gender, dob, phoneNumber, telegramUsername, telegramUid, address } = data
        name = name != null ? name : ''
        gender = gender != null ? gender : ''
        dob = dob != null ? dob : ''
        phoneNumber = phoneNumber != null ? phoneNumber : ''
        telegramUsername = telegramUsername != null ? telegramUsername : ''
        telegramUid = telegramUid != null ? telegramUid : ''
        address = address != null ? address : ''
        commit('SET_NAME', name)
        commit('SET_GENDER', gender)
        commit('SET_DOB', dob)
        commit('SET_PHONE_NUMBER', phoneNumber)
        commit('SET_TELEGRAM_USERNAME', telegramUsername)
        commit('SET_TELEGRAM_UID', telegramUid)
        commit('SET_ADDRESS', address)

        resolve(data)
      }).catch(err => {
        reject(err)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        // eslint-disable-next-line prefer-const
        let { avatar, role, name, gender, dob, phoneNumber, telegramUsername, telegramUid, address } = data

        const roles = [role]
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        avatar = avatar != null ? avatar : 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
        name = name != null ? name : ''
        gender = gender != null ? gender : ''
        dob = dob != null ? dob : ''
        phoneNumber = phoneNumber != null ? phoneNumber : ''
        telegramUsername = telegramUsername != null ? telegramUsername : ''
        telegramUid = telegramUid != null ? telegramUid : ''
        address = address != null ? address : ''
        commit('SET_AVATAR', avatar)
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_GENDER', gender)
        commit('SET_DOB', dob)
        commit('SET_PHONE_NUMBER', phoneNumber)
        commit('SET_ADDRESS', address)
        commit('SET_TELEGRAM_USERNAME', telegramUsername)
        commit('SET_TELEGRAM_UID', telegramUid)
        // commit('SET_CHECKIN_HISTORY', checkInHistory)

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  getCheckInHistory({ commit }) {
    return new Promise((resolve, reject) => {
      getCheckInHistory().then(response => {
        const checkInHistory = transformCheckInListToObject(response.data)
        // const { checkInHistory } = response.data
        console.log(checkInHistory)
        commit('SET_CHECKIN_HISTORY', checkInHistory)
        resolve()
      }).catch(err => {
        console.log(err)
        this.$message.error('Lỗi khi lấy thông tinv về lịch sử đi lại !')
        reject(err)
      })
    })
  },
  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

/*
* Function transformCheckInListToObject(data)
* chức năng: chuyển đổi dữ liệu danh sách địa điểm sang hashmap key=ngày, value=thông tin checkin
* đầu vào là danh sách các check-in record
* [
*  {
        "id": mã record,
        "name": "Tên địa điểm",
        "address": "Địa chỉ",
        "date": "Ngày tới",
        "startTime": "Giờ tới",
        "endTime": "Giờ về",
        "description": "Thông tin thêm, có thể là người tiếp xúc...."
    }
* ]
* */

function transformCheckInListToObject(data) {
  const checkInHistory = data.reduce((checkInHistory, currentRecord) => {
    let date = currentRecord.date
    if (date != null) {
      date = getSimpleDate(date)
      if (checkInHistory[date] == null) {
        checkInHistory[date] = []
      }
      checkInHistory[date].push(currentRecord)
    }
    return checkInHistory
  }, {})

  return checkInHistory
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
