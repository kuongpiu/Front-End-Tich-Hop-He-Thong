<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span><strong>THÔNG BÁO</strong></span>
        <div style="float: right">
          <el-button
            v-if="!checkPermission(['admin'])"
            size="small"
            type="success"
            icon="el-icon-message"
            @click="showSubscriberDialog"
          >Đăng ký nhận
            thông báo
          </el-button>
          <el-button
            v-if="checkPermission(['admin'])"
            size="small"
            type="success"
            icon="el-icon-edit"
            @click="showSendMessageDialog"
          >
            Gửi thông báo
          </el-button>
        </div>
      </div>
      <div class="content">
        <el-card v-loading="loadingMessage">
          <div class="left-container">
            <message v-for="(message, index) in this.messages" :key="index" :message="message"/>
          </div>
        </el-card>
        <div class="right-container">
          <message-filter @searchMessageByCities="this.filterMessage"/>
        </div>
      </div>
    </el-card>
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" :close-on-click-modal="false" @close="resetMessageForm">
      <el-form v-model="messageForm">
        <el-form-item prop="cities" label="Chọn Thành phố">
          <drag-select
            :key="forceDragSelectRender"
            :initial-value="messageForm.cities"
            style="width: 100%; margin:0"
            @change="setCities"
          />
        </el-form-item>
        <el-form-item v-if="isSendingMessage" prop="content" label="Nội dung">
          <el-input v-model="messageForm.content" type="textarea" :autosize="{minRows: 4, maxRows:10}"/>
        </el-form-item>
      </el-form>
      <slot slot="footer">
        <el-button icon="el-icon-circle-close" @click="resetMessageForm">Hủy</el-button>
        <el-button
          v-if="isSendingMessage"
          type="primary"
          icon="el-icon-s-promotion"
          :loading="sendMessageProcessing"
          @click="sendMessage"
        >
          Gửi
        </el-button>
        <el-button v-else type="warning" icon="el-icon-s-promotion" :loading="sendMessageProcessing" @click="subscribe">
          Lưu
        </el-button>
      </slot>
    </el-dialog>
  </div>
</template>

<script>
import message from '@/views/notification/components/message'
import MessageFilter from '@/views/notification/components/messagefilter'
import DragSelect from '@/views/notification/components/DragSelect'
import checkPermission from '@/utils/permission'
import {
  getMessages,
  getSubscribeCities,
  sendMessage,
  updateSubscribeCities
} from '@/api/notification'
import { sendTelegramMessage } from '@/api/exampleroute'

export default {
  name: 'Index',
  components: {
    MessageFilter,
    message,
    DragSelect
  },
  data: () => {
    return {
      messages: [],
      dialogTitle: '',
      dialogVisible: false,
      messageForm: {
        cities: [],
        content: ''
      },
      sendMessageProcessing: false,
      loadingMessage: false,
      forceDragSelectRender: 0
    }
  },
  created() {
    this.getMessages()
  },
  computed: {
    isSendingMessage() {
      return this.dialogTitle != null && this.dialogTitle.toLowerCase() === 'Thông báo mới'.toLowerCase()
    }
  },
  methods: {
    checkPermission,
    getMessages() {
      getMessages().then(response => {
        MESSAGE_DATE = response.data.map(msg => {
          return {
            cityId: msg.city.id,
            city: msg.city.name,
            content: msg.message.content
          }
        })
      })
    },
    filterMessage(citiesId) {
      console.log('filterMessage')
      console.log(citiesId)
      this.loadingMessage = true
      setTimeout(() => {
        this.messages = MESSAGE_DATE.filter(message => {
          for (const citiId of citiesId) {
            if (citiId === message.cityId) {
              return true
            }
          }
          return false
        })
        this.loadingMessage = false
      }, 200)
    },
    sendMessage() {
      this.sendMessageProcessing = true
      let cities = this.messageForm.cities.reduce((str, cityId) => {
        return str + cityId + ','
      }, '')
      cities = cities.substr(0, cities.length - 1)
      sendMessage({
        cities: cities,
        content: this.messageForm.content
      }).then(response => {
        this.resetMessageForm()
        this.$message({
          message: 'Gửi thành công !',
          type: 'success'
        })
        this.getMessages()
        this.sendToTelegram(response.data)
      }).catch(err => {
        console.log(err)
        this.$message({
          message: 'Lỗi khi gửi thông báo !',
          type: 'error'
        })
      })
        .finally(() => {
          this.sendMessageProcessing = false
        })
    },
    sendToTelegram(data) {
      console.log('sendToTelegram')
      console.log(data)
      /**
       * If no content or users have the length of 0, sending message makes no sense
       */
      if (!data.content || !data.users.length) return
      const dataToSend = {
        content: data.content,
        uid: data.users.filter(user => !!user.telegramUid).map(user => Number.parseInt(user.telegramUid, 10))
      }

      sendTelegramMessage(dataToSend)
      console.log(dataToSend)
    },
    subscribe() {
      this.sendMessageProcessing = true
      let cities = this.messageForm.cities.reduce((str, cityId) => {
        return str + cityId + ','
      }, '')
      cities = cities.substr(0, cities.length - 1)
      updateSubscribeCities({ cities: cities }).then(response => {
        const data = response.data
        this.messageForm.cities = data.map(city => {
          return city.id
        })
        console.log(data)
        this.$message.success('Cập nhật thành công !')
        this.sendMessageProcessing = false
      }).catch(err => {
        console.log(err)
        this.$message.error('Lỗi khi cập nhật !')
        this.sendMessageProcessing = false
      })
    },
    resetMessageForm() {
      this.dialogVisible = false
      this.messageForm = {
        cities: [],
        content: ''
      }
      this.sendMessageProcessing = false
    },
    setCities(cities) {
      this.messageForm.cities = cities
    },
    showSubscriberDialog() {
      getSubscribeCities().then(response => {
        const data = response.data
        this.messageForm.cities = data.map(city => {
          return city.id
        })
        console.log(this.messageForm.cities)
        this.dialogVisible = true
        this.dialogTitle = 'Đăng ký nhận thông báo'
        this.forceDragSelectRender += 1
      })
    },
    showSendMessageDialog() {
      this.dialogVisible = true
      this.dialogTitle = 'Thông báo mới'
      this.forceDragSelectRender += 1
    }
  }
}
let MESSAGE_DATE
</script>

<style scoped>
.box-card {
  margin: 10px;
}

.content {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.left-container {
  width: 45vw;
  height: 80vh;
  display: inline-block;
  padding-bottom: 0px;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.left-container::-webkit-scrollbar { /* WebKit */
  width: 0px;
}

.right-container {
  width: 40vw;
  height: 80vh;
  display: inline-block;
}
</style>
