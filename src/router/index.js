import Vue from 'vue'
import VueRouter from 'vue-router'
import Map from '../views/Map.vue'
import PersonInfo from '../views/PersonInfo.vue'
import VehicleInfo from '../views/VehicleInfo.vue'
import DeviceInfo from '../views/DeviceInfo.vue'
import BindingInfo from '../views/BindingInfo.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/map'
  },
  { // 地图功能
    path: '/map',
    name: 'Map',
    component: Map
  },
  { // 人员信息录入
    path: '/person-info',
    name: 'PersonInfo',
    component: PersonInfo
  },
  { // 车辆信息录入
    path: '/vehicle-info',
    name: 'VehicleInfo',
    component: VehicleInfo
  },
  { // 设备信息录入
    path: '/device-info',
    name: 'DeviceInfo',
    component: DeviceInfo
  },
  { // 绑定信息录入
    path: '/binding-info',
    name: 'BindingInfo',
    component: BindingInfo
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
  