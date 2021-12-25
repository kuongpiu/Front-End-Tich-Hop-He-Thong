<template>
  <div class="block">
    <el-timeline>
      <el-timeline-item
        v-for="(date,index) of Object.keys(checkInHistory)"
        :key="index"
        :timestamp="date"
        placement="top"
      >
        <el-card
          style="margin-bottom: 5px"
          shadow="hover"
          class="box-card"
          v-for="(place, index2) of checkInHistory[date]"
          :key="index2"
        >
          <span slot="header">
            <span style="color: #4AB7BD">{{ place.name }}</span>
            <b style="float: right">
              <i style="color: #ce6161" class="el-icon-timer custom-icon"></i>
              <i>{{ place.startTime }} - {{ place.endTime }} </i>
            </b>
          </span>
          <el-row class="row-content">
            <i style="color: #bb298c" class="el-icon-location-outline custom-icon"></i>
            <span>{{ place.address }}</span>
          </el-row>
          <el-row v-if="place.description" class="row-content">
            <i style="color:#8eefb9;" class="el-icon-info custom-icon"></i>
            <span>{{ place.description }}</span>
          </el-row>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CheckInHistory',
  computed: {
    ...mapGetters(['checkInHistory'])
  }
}
</script>
<style scoped>
.block {
  margin-left: -40px;
  padding-left: 0;
}

.row-content {
  padding: 5px 0px;
}

.custom-icon {
  margin-right: 7px;
}

span {
  line-height: 20px;
}
</style>
