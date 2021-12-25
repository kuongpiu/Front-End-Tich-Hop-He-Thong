<template>
  <el-form>
    <el-form-item label="Tên">
      <el-input v-model="userCopied.name"/>
    </el-form-item>
    <el-form-item label="Giới tính">
      <el-input v-model="userCopied.gender"/>
    </el-form-item>
    <el-form-item label="Ngày sinh">
      <el-input v-model="userCopied.dob"/>
    </el-form-item>
    <el-form-item label="Số điện thoại">
      <el-input v-model="userCopied.phoneNumber"/>
    </el-form-item>
    <el-form-item label="Tài khoản Telegram">
      <el-input v-model="userCopied.telegramUsername"/>
    </el-form-item>
    <el-form-item label="Mã Telegram UID">
      <el-input v-model="userCopied.telegramUid"/>
    </el-form-item>
    <el-form-item label="Địa chỉ hiện tại">
      <el-input v-model="userCopied.address"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="el-icon-s-claim" @click="submit">Lưu</el-button>
      <el-button v-if="changedUserInfo" type="warning" icon="el-icon-refresh-left" @click="resetUpdate">Khôi phục
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { deepClone } from '@/utils'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          gender: '',
          dob: '',
          phoneNumber: '',
          telegramUsername: '',
          telegramUid: '',
          address: ''
        }
      }
    }
  },
  data: function() {
    return {
      userCopied: {}
    }
  },
  created() {
    this.resetUpdate()
  },
  computed: {
    changedUserInfo() {
      let changed = false
      const props = Object.keys(this.user)
      for (const prop of props) {
        if (this.user[prop] !== this.userCopied[prop]) {
          changed = true
          break
        }
      }
      return changed
    }
  },
  methods: {
    submit() {
      this.$emit('updateUserInfo', Object.assign({}, this.userCopied))
    },
    resetUpdate() {
      this.userCopied = deepClone(this.user)
    }
  }
}
</script>
