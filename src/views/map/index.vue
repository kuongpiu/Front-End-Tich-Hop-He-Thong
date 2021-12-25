<template>
  <div class="app-container">
    <div id="map" ref="map"/>
    <div ref="search-map-form" class="search-map-form">
      <el-form :model="searchForm">
        <el-input
          v-model="searchForm.address"
          placeholder="Nhập địa điểm..."
          style="width: 300px; margin-right: 10px"
          tabindex="1"
        />
        <el-tooltip class="item" effect="light" content="Tìm kiếm" placement="bottom">
          <el-button icon="el-icon-search" tabindex="2" @click="handleSearchAddress"/>
        </el-tooltip>
        <el-tooltip
          class="item"
          effect="light"
          content="Thêm nơi đã tới"
          placement="bottom"
        >
          <el-button
            type="success"
            icon="el-icon-add-location"
            @click="showCheckInDialog"
          />
        </el-tooltip>
      </el-form>
    </div>
    <div ref="description-container-on-map" class="description-container-on-map">
      <el-card
        v-if="showPatientDescription"
        v-loading="loadingPatientDescription"
        class="box-card patient-detail-content"
      >
        <span slot="header" style="height: 30px" class="clearfix">
          <b style="line-height:30px"><i
            class="el-icon-edit-outline icon-description"
          /> Bệnh nhân {{ currentSelectedPatient.id }}</b>
          <el-button
            style="float: right"
            size="mini"
            icon="el-icon-close"
            type="danger"
            circle
            @click="closeDescription"
          />
        </span>
        <el-row class="row-descriptions" :gutter="0">
          <el-col :span="12"><i class="el-icon-user icon-description"></i>{{ currentSelectedPatient.name }}</el-col>
          <el-col :span="12"><i
            class="icon-description"
            v-bind:class="{ 'el-icon-male': currentSelectedPatient.gender.trim().toLowerCase() === 'nam', 'el-icon-female': currentSelectedPatient.gender.trim().toLowerCase() === 'nữ' }"
          ></i>{{ currentSelectedPatient.gender }}
          </el-col>
        </el-row>
        <el-row class="row-descriptions" :gutter="0">
          <el-col :span="12"><i class="el-icon-document-add icon-description"></i>{{ currentSelectedPatient.dob }}
          </el-col>
          <el-col :span="12"><i class="el-icon-view icon-description"></i>{{ currentSelectedPatient.confirmedDate }}
          </el-col>
        </el-row>
        <el-row class="row-descriptions">
          <i class="el-icon-location-outline icon-description"></i>{{ currentSelectedPatient.address }}
        </el-row>
      </el-card>
    </div>
    <el-card id="right-container" class="box-card">
      <div slot="header" class="clearfix right-container-header">
        <el-button
          v-for="tab in tabs"
          v-bind:key="tab.name"
          v-bind:class="['tab-button', { active: currentTab === tab }]"
          size="large"
          v-on:click="currentTab = tab"
        >{{ tab.name }}
        </el-button>
      </div>
      <component v-if="isReady" v-bind:is="currentTabComponent" id="right-container-body"></component>
    </el-card>
    <el-dialog
      :visible.sync="checkInDialogVisible"
      :title="checkInDialogTitle"
      :close-on-click-modal="false"
      @close="closeCheckInDialog"
    >
      <el-form ref="checkInForm" :model="checkInForm" :rules="checkInFormRules">
        <el-form-item prop="date">
          <el-date-picker
            v-model="checkInForm.date"
            type="date"
            placeholder="Chọn ngày"
            format="dd-MM-yyyy"
            value-format="yyyy-MM-dd"
            :picker-options="pickerDateOptions"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="time">
          <el-time-picker
            v-model="checkInForm.time"
            arrow-control
            is-range
            format="HH:mm"
            value-format="HH:mm"
            start-placeholder="Từ lúc"
            end-placeholder="Tới lúc"
          />
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-model="checkInForm.name" prefix-icon="el-icon-s-shop" placeholder="Tên địa điểm"/>
        </el-form-item>
        <el-form-item prop="address">
          <el-input v-model="checkInForm.address" prefix-icon="el-icon-location-outline" placeholder="Địa chỉ"/>
        </el-form-item>
        <el-form-item prop="description">
          <el-input
            v-model="checkInForm.description"
            type="textarea"
            :autosize="{minRows: 3, maxRows: 5}"
            prefix-icon="el-icon-edit"
            placeholder="Chi tiết"
          />
        </el-form-item>
        <el-form-item>
          <span style="float: right">
            <el-button type="danger" icon="el-icon-close" @click="closeCheckInDialog">Hủy</el-button>
            <el-button
              :loading="checkInFormButtonSaveLoading"
              type="success"
              icon="el-icon-s-promotion"
              @click="addCheckInHistory"
            >Thêm</el-button>
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { geocoding, init } from '@/utils/gmaps'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import BarChart from '@/views/map/components/BarChart'
import CheckInHistory from '@/views/map/components/CheckInHistory'
import { mapGetters } from 'vuex'
import { insertCheckInRecord } from '@/api/user'

const ICON = {
  COVID_POSITIVE: 'http://maps.google.com/mapfiles/kml/pal3/icon38.png',
  COVID_NEGATIVE: null,
  MY_LOCATION: null
}

export default {
  name: 'App',
  components: { BarChart, CheckInHistory },
  data() {
    return {
      map: null,
      infoWindow: null,
      mapCenter: null,
      myLocation: null,
      zoom: 7,
      patientsMarker: [],
      searchMarker: null,
      checkInHistoryMarker: [],
      searchForm: {
        address: ''
      },
      tabs: null,
      currentTab: null,
      isReady: false,
      showPatientDescription: false,
      loadingPatientDescription: true,
      currentSelectedPatient: {},
      checkInDialogVisible: false,
      checkInDialogTitle: 'Đã tới',
      checkInForm: {
        name: '',
        description: '',
        address: '',
        position: '',
        date: null,
        time: null
      },
      pickerDateOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: 'Today',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: 'Yesterday',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: 'A week ago',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      checkInFormRules: {
        name: [
          { required: true, message: 'tên địa điểm không thể bỏ trống !', trigger: 'blur' }
        ],
        address: [
          { required: true, message: 'Địa điểm không thể bỏ trống !', trigger: 'blur' }
        ],
        date: [
          { required: true, message: 'Ngày không thể bỏ trống !', trigger: 'blur' }
        ],
        time: [
          { required: true, message: 'Thời gian không thể bỏ trống !', trigger: 'blur' }
        ]
      },
      checkInFormButtonSaveLoading: false
    }
  },
  computed: {
    ...mapGetters([
      'patients'
    ]),
    currentTabComponent() {
      return this.currentTab.component
    },
    isCheckInPositionAvailable() {
      return this.searchMarker != null && this.searchMarker.getMap() != null && this.searchMarker.getPosition() != null
    }
  },
  created() {
    this.tabs = [
      {
        name: 'Biểu đồ ca bệnh',
        component: 'bar-chart',
        icon: 'el-icon-s-marketing'
      },
      {
        name: 'Nơi đã đến',
        component: 'check-in-history',
        icon: 'el-icon-s-order'
      }
    ]
    this.currentTab = this.tabs[0]
    // this.$getLocation()
    //   .then(coordinates => {
    //     this.myLocation = coordinates
    //     this.mapCenter = coordinates
    //     // this.mapCenter = {
    //     //   lat: 21.019666377307708, lng: 105.8449702201873
    //     // }
    //   })
    if (localStorage.center) {
      this.mapCenter = JSON.parse(localStorage.center)
    } else {
      this.mapCenter = {
        lat: 21.019666377307708, lng: 105.8449702201873
      }
    }
    if (localStorage.zoom) {
      this.zoom = JSON.parse(localStorage.zoom)
    } else {
      this.zoom = 7
    }
  },
  mounted() {
    this.initMap().catch(err => {
      console.log(err)
      this.$message.error('Lỗi khởi tạo Bản đồ !')
    })
  },
  methods: {
    async initMap() {
      try {
        const google = await init()
        this.map = new google.maps.Map(this.$refs['map'], {
          center: this.mapCenter,
          zoom: this.zoom,
          mapTypeControl: false,
          zoomControl: false,
          scaleControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        })
        this.geocoder = new google.maps.Geocoder()
        this.createControlOnMap()
        await this.fetchData()
        this.addEventHandler()
        this.addMarkersOnMap()
        console.log('init map done')
      } catch (error) {
        console.error(error)
        this.$message.error('Lỗi khởi tạo Bản đồ !')
      }
    },
    createControlOnMap() {
      // eslint-disable-next-line no-undef
      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.$refs['search-map-form'])
      // eslint-disable-next-line no-undef
      this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(this.$refs['description-container-on-map'])
    },
    geocode(query) {
      this.geocoder.geocode(query).then(response => {
        console.log(response)
        const result = response.result[0]
        console.log(JSON.stringify(result))
        const { formatted_address, location } = result
        if (formatted_address && location) {
          console.log('Địa chỉ cụ thể: ' + formatted_address)
          console.log('Vị trí: ' + JSON.stringify(location))
          this.showSearchAddressResult({ formatted_address: formatted_address, location: location })
        } else {
          this.$message.warning('Không thể xác định được vị trí')
        }
      }).catch(err => {
        console.log(err)
        this.$message.error(err.message)
        const formatted_address = '1 Phạm Văn Đồng, Mai Dịch, Cầu Giấy, Hà Nội, Việt Nam'
        const location = {
          lat: 21.019666377307708, lng: 105.8449702201873
        }
        this.showSearchAddressResult({ formatted_address: formatted_address, location: location })
      })
    },
    showSearchAddressResult(result) {
      this.clearSearchMarker()
      const { formatted_address, location } = result
      if (formatted_address && location) {
        this.searchMarker.setTitle(formatted_address)
        this.searchMarker.setMap(this.map)
        if (this.map.getZoom() < 15) {
          this.map.setZoom(15)
          this.zoom = 15
        }
        this.map.panTo(location)
        this.searchMarker.setPosition(location)
      } else {
        console.log('result is not contains enough info, ' + JSON.stringify(result))
      }
    },
    showCheckInDialog() {
      this.checkInForm.address = this.searchMarker.getTitle()
      this.checkInForm.position = this.searchMarker.getPosition()
      this.checkInDialogVisible = true
      this.clearSearchMarker()
    },
    closeCheckInDialog() {
      this.checkInFormButtonSaveLoading = false
      this.checkInDialogVisible = false
      this.$refs['checkInForm'].resetFields()
      this.checkInForm = {
        name: '',
        description: '',
        address: '',
        position: '',
        date: null,
        time: null
      }
    },
    addCheckInHistory() {
      this.$refs['checkInForm'].validate(valid => {
        if (valid) {
          const checkInRecord = Object.keys(this.checkInForm).reduce((obj, currentKey) => {
            if (currentKey === 'time') {
              obj['startTime'] = this.checkInForm.time[0]
              obj['endTime'] = this.checkInForm.time[1]
            }
            obj[currentKey] = this.checkInForm[currentKey]
            return obj
          }, {})
          this.checkInFormButtonSaveLoading = true
          insertCheckInRecord(checkInRecord).then(response => {
            this.$message.success('Thêm thành công !')
            // console.log(response.data)
            this.$store.dispatch('user/getCheckInHistory')
            this.closeCheckInDialog()
          }).catch(err => {
            this.checkInFormButtonSaveLoading = false
            this.$message.error('Thêm thất bại !')
            console.log(err)
          })
        } else {
          this.$message.warning('Thông tin chưa đầy đủ !')
        }
      })
      console.log(JSON.stringify(this.checkInForm))
    },
    handleSearchAddress() {
      console.log('search address: ' + this.searchForm.address)
      this.geocode({ address: this.searchForm.address })
    },
    async fetchData() {
      await Promise.all([this.$store.dispatch('user/getCheckInHistory'), this.$store.dispatch('patients/fetchPatientsData')])
      this.isReady = true
    },
    addEventHandler() {
      this.addClickListenerOnMap()
      this.addIdleListenerOnMap()
    },
    addClickListenerOnMap() {
      // this.map.addListener('click', function(event) {
      //   console.log(event.latLng)
      // })
    },
    addIdleListenerOnMap() {
      /*
      * Mỗi khi di chuyển map hay zoom đều xuất hiện cùng event idle,
      * Dùng sự kiện này để lưu lại mapCenter và mapZoom tại localStorage
      * Dùng để khôi phục lại map khi rời đi*/
      this.map.addListener('idle', function(event) {
        const center = this.map.getCenter()
        const zoom = this.map.getZoom()
        localStorage.center = JSON.stringify(center)
        localStorage.zoom = zoom
      }.bind(this))
    },
    addMarkersOnMap() {
      this.createSearchMarker()
      this.addMyLocationMarker()
      this.addPatientsMarker()
      this.createInfoWindow()
    },
    /*
    * Function: addPatientsMarker()
    * Chức năng:
    *   + Vẽ các nhãn bệnh nhân lên Map
    *   + Tạo MarkerClusterer có chức năng gộp các nhãn vào và hiển thị số lượng nhãn
    * Các nhãn này được thêm vào danh sách this.patientsMaker
    * */
    addPatientsMarker() {
      for (const patient of this.patients) {
        this.patientsMarker.push(this.createMarker({ ...patient, icon: ICON.COVID_POSITIVE, content: patient }))
      }
      const map = this.map
      const markers = this.patientsMarker
      new MarkerClusterer({ map, markers })
    },
    /*
    * Function createInfoWindow()
    * Chức năng: Tạo một InfoWindow trong map, để có thể nạp các nội dung và hiển thị khi tương tác với các nhãn
    *
    * Gán cho this.infoWindow
    * */
    createInfoWindow() {
      // eslint-disable-next-line no-undef
      this.infoWindow = new google.maps.InfoWindow({
        content: '',
        disableAutoPan: true
      })
      this.infoWindow.addListener('closeclick', () => {
      })
    },
    createSearchMarker() {
      this.searchMarker = this.createMarker({})
      this.clearSearchMarker()
    },
    clearSearchMarker() {
      if (this.searchMarker) {
        this.searchMarker.setMap(null)
      }
    },
    addMyLocationMarker() {
      const marker = this.createMarker({})
      marker.setDraggable(true)
      marker.addListener('drag', function(event) {
        // console.log(this.position.lat())
        // console.log(this.position.lng())
      })
      this.checkInHistoryMarker.push(marker)
    },
    /*
    * Function createMarker(props)
    *   Props{
    *     position: tọa độ kinh độ, vĩ độ (lat, lng),
    *     icon: custom icon nhãn
    *     content: nội dung hiển thị lên InfoWindow khi click vào nhãn
    *   }
    * Chức năng:
    *   + Tạo 1 nhẵn trên this.map
    *   + nếu truyền icon, set icon cho nhãn
    *   + nếu truyền content, set content cho this.infoWindow, open khi click event xuất hiện
    *   + */
    createMarker(props) {
      // eslint-disable-next-line no-undef
      const marker = new google.maps.Marker({
        map: this.map
      })
      if (props.position) {
        marker.setPosition(props.position)
      }
      if (props.icon) {
        marker.setIcon(props.icon)
      }
      if (props.content) {
        marker.addListener('click', () => {
          // this.patientDetailsRaw = props.content.details
          // this.infoWindow.setContent(getHtmlForm(props.content))
          // this.infoWindow.open(this.map, marker)
          // this.centeringMapTo(props.position)
          this.openDescription(props.content)
        })
      }
      return marker
    },
    openDescription(content) {
      this.showPatientDescription = true
      this.currentSelectedPatient = content
      setTimeout(() => {
        this.loadingPatientDescription = false
      }, 500)
    },
    closeDescription() {
      this.showPatientDescription = false
      this.loadingPatientDescription = false
      this.currentSelectedPatient = null
    },
    centeringMapTo(coordinate) {
      this.map.panTo(coordinate)
      this.mapCenter = coordinate
    }
  }
}
// eslint-disable-next-line no-unused-vars
const getHtmlForm = function(content) {
  const template = `
      <div style="font-size: small">
        <h3>Bệnh nhân ${content.id}</h3>
        <ul>
          <li style="margin-bottom: 5px">Họ tên: ${content.name}</li>
          <li style="margin-bottom: 5px">Giới tính: ${content.gender}</li>
          <li style="margin-bottom: 5px">Ngày sinh: ${content.dob}</li>
          <li style="margin-bottom: 5px">Địa chỉ: ${content.address}</li>
          <li style="margin-bottom: 5px">Ngày xác nhận: ${content.confirmedDate}</li>
        </ul>
      </div>
    `
  return template
}
</script>

<style>
.app-container {
  padding: 20px
}

* {
  font-family: "Times New Roman", sans-serif;
}

#map {
  width: 50vw;
  height: 78vh;
  display: inline-block;
  border-radius: 4px;
}

.right-container-header {
  border-radius: 16px;
  /*background: linear-gradient(90deg, white 0%, #daffff 100%);*/
}

#right-container {
  width: 39vw;
  height: 78vh;
  /*background-color: #2ac06d;*/
  display: inline-block;
  float: right;
  font-size: small;
}

#right-container-body {
  width: 36vw;
  height: 62vh;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

#right-container-body::-webkit-scrollbar { /* WebKit */
  width: 0px;
}

.search-map-form {
  margin: 10px;
}

.tab-button {
  padding: 10px 10px;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  cursor: pointer;
  background: white;
  margin-bottom: -1px;
  margin-right: -1px;
  color: #2d2f33;
}

.tab-button:hover {
  background: #e0e0e0;
}

.tab-button.active {
  color: white;
  background: #10b9ff;
}

.description-container-on-map {
  margin-bottom: 10px;
  width: 400px;
  height: 180px;
}

.patient-detail-content {
  width: 400px;
  height: 180px;
  overflow-y: scroll;
  line-height: 15px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.patient-detail-content::-webkit-scrollbar { /* WebKit */
  width: 0px;
}

.row-descriptions {
  padding-bottom: 10px;
}

.icon-description {
  margin-right: 10px;
}
</style>
