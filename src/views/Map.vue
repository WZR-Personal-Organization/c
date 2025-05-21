<template>
<div id="GDMap" >
  <div class="map-container">
    <!-- 蓝色透明遮罩层 -->
    <div class="blue-mask"></div>

    <!-- 左侧列表 -->
    <div class="left-panel">
      <div class="panel-content">
        <div class="panel-header">
          <h3>安全帽</h3>
        </div>
        <div class="panel-background-inside">
          <div class="list-item" 
            v-for="(value, key) in safeBoxMap" 
            :key="key" 
            @click="handleBoxClick(value[1],key)"  
            :class="{ active: value[1].sn === selectedLeftSn }"
            style="cursor: pointer;">  
            <!-- <div class="item-icon">🔒</div> -->
            <div class="item-info">
              <p class="item-name"><a>{{ value[1].name }}</a></p>
              <p class="item-status">状态：{{ value[1].status }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 中间占位 -->
    <div class="map-view">
      <div class="left-icons-panel">
        <!-- 信息录入图标区域 -->
        <div class="input-icons">
          <div 
            class="input-icon"
            :style="{ backgroundImage: `url(${require('@/assets/images/person.png')})` }"
            @click="openPersonInfo()"
          ></div>
          <div 
            class="input-icon"
            :style="{ backgroundImage: `url(${require('@/assets/images/vehicle.png')})` }"
            @click="openVehicleInfo()"
          ></div>
          <div 
            class="input-icon"
            :style="{ backgroundImage: `url(${require('@/assets/images/device.png')})` }"
            @click="openDeviceInfo()"
          ></div>
          <!-- <div 
            class="input-icon"
            :style="{ backgroundImage: `url(${require('@/assets/images/binding.png')})` }"
            @click="openBindingInfo()"
          ></div> -->
        </div>
      </div>
      <div class="map-placeholder">
        <p class="map-tip">地图区域（示例占位）</p>
      </div>
    </div>

    <!-- 右侧列表 -->
    <div class="right-panel">
      <div class="panel-content">
        <div class="panel-header">
          <h3>实时定位</h3>
        </div>
        <div class="panel-background-inside">
          <div class="marker-item"  
            :class="{ active: '' === selectedRightSn }" 
            @click="handleAllMarkerShow()">
            <div class="marker-info">
              <p class="marker-name">所有标记点</p>
            </div>
          </div>
          <div class="marker-item" 
            v-for="(value,key) in mapPointsMap" 
            @click="handleMarkerClick(value[1],value[1].sn)" 
            :class="{ active: value[1].sn === selectedRightSn }"  
            :key="key">
            <div class="marker-info">
              <!-- map在vue2中被v-for识别时，每一行都会被当成[key,value]的数组，相当于[[key1,value1],[key2,value2]]，所以直接拿到的value实际是[key2,value2]，访问value的第二个元素才是map的value的真正值 -->
              <p class="marker-name">{{ value[1].name }}</p> 
              <p class="marker-coord">SN：{{ value[1].sn }}</p>
              <p class="marker-coord">经度：{{ value[1].longitude }}</p>
              <p class="marker-coord">纬度：{{ value[1].latitude }}</p>
              <p class="marker-coord">记录时间：{{ value[1].recordTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮框 -->
    <div v-if="isShowIframe" class="iframe-mask">
      <div class="iframe-container">
        <button class="close-btn" @click="closeIframe">×</button>
        <iframe :src="currentIframeUrl" frameborder="0" class="iframe-content" allowfullscreen></iframe>
      </div>
    </div>

  </div>
</div>
</template>

<script>
import AMapLoader from "@amap/amap-jsapi-loader";
import { mapGetters } from 'vuex'
import service from '@/utils/request';

export default {
  name: 'MapPage',
  data() {
    return {
      safeBoxList: [
        { name: '安全帽-01', status: '在线', url: 'http://www.baidu.com' },
        { name: '安全帽-02', status: '离线', url: 'http://www.163.com' },
        { name: '安全帽-03', status: '低电量', url: 'http://www.baidu.com' },
        { name: '安全帽-04', status: '正常', url: 'http://www.hao123.com' },
        { name: '安全帽-05', status: '告警', url: 'http://www.baidu.com' }
      ],
      mapPointsMap: new Map([ // 定位标记点列表
        ["sn1",{sn: "sn1",longitude: 116.4074,latitude: 39.9042,name: "标记点一",recordTime: ""}],
        ["sn1",{sn: "sn1",longitude: 116.4074,latitude: 39.9042,name: "标记点一",recordTime: ""}],
      ]),
      mapPointsMarksMap: new Map([ // 高德标记点对象列表
        ["sn1",{sn: "sn1",AmapMarks: null}],
        ["sn2",{sn: "sn2",AmapMarks: null}],
      ]),
      _oldMapPointsMap: null, // 用于监听mapPointsMap变化时，对比用
      safeBoxMap: new Map([ // 安全帽列表
        ["sn1",{sn: "sn1", name: '安全帽-01', status: '在线', url: 'http://www.baidu.com' }],
      ]),
      isShowIframe: false,       // 控制悬浮框是否显示
      currentIframeUrl: '',       // 当前要显示的url
      map: null,      // 高德地图组件
      Amap: null,      // 高德地图组件
      TestLongitude: 116.397428, // 测试经度
      TestLatitude: 39.90923, // 测试纬度
      normalPointIcon: null , // 正常状态下的标记点图标对象
      currentPointIcon: null , // 正在关注的点图标对象
      currentMarkerSn: "" , // 正在关注的点的sn
      selectedLeftSn: "",  // 左侧安全帽列表选中索引
      selectedRightSn: "", // 右侧标记点列表选中SN
      isShowForm: false, // 控制表单显示
      currentFormType: '', // 当前表单类型（person/car/device）
      formData: {}, // 表单数据
      submitSuccess: false, // 提交成功状态
      formTitles: { // 表单标题
        person: '人员信息录入',
        car: '车辆信息录入',
        device: '设备信息录入'
      }
    }
  },
  computed: {
    // 使用 mapGetters 映射 getters 到计算属性
    ...mapGetters([
      'getSecurityJsCode', // 映射后可直接通过 this.getSecurityJsCode 访问
      'getKeyGD',           // 映射后可直接通过 this.getKeyGD 访问
      'getMapCenterLongitude',           // 映射后可直接通过 this.getMapCenterLongitude 访问
      'getMapCenterLatitude',           // 映射后可直接通过 this.getMapCenterLatitude 访问
      'getAmapMaxZoom',           // 映射后可直接通过 this.getAmapMaxZoom 访问
    ]),
    // 计算表单title
    formTitle() {
      return this.formConfig[this.activeForm]?.title || '';
    },
    // 计算表单内容
    formFields() {
      return this.formConfig[this.activeForm]?.fields || {};
    },
    
  },
  mounted() {
    this.init();
    // 延时1s调用initAMap函数,防止安全码和key加载不到
    setTimeout(() => {
      // 初始化高德地图组件
      this.initAMap();
      // 立即执行一次（避免首次加载延迟）
      this.ApiTimerFaction(); 
    }, 500);

    // 启动定时器（每5秒更新一次）
    this.ApiTimer = setInterval(() => {
      this.ApiTimerFaction();
    }, 10000); // 10000ms = 10秒

  },
  unmounted() {
    this.map?.destroy();
  },
  beforeDestroy() {
    // 在组件销毁前释放ApiTimer定时器
    if (this.ApiTimer) {
      clearInterval(this.ApiTimer);
      this.ApiTimer = null; // 释放引用
    }

  },
  watch: {
    // 监听 mapPointsMap 变化
    mapPointsMap: {
      handler(newMap) {  // newMap 是 Map 实例
        const oldMap = this._oldMapPointsMap;  // 上一次保存的 Map 实例
        this.analyzeMapPointsMapChanges(oldMap, newMap);
        this._oldMapPointsMap = new Map(newMap);  // 深拷贝 Map（需确保值是不可变的，或手动复制）
      },
      deep: true
    },
  },
  methods: {
    // 初始化高德地图组件
    initAMap() {
      // 初始化高德地图组件
      window._AMapSecurityConfig = {
        securityJsCode: this.getSecurityJsCode, // 安全密钥
      };
      AMapLoader.load({
        key: this.getKeyGD, //申请好的 Web 端开发者 Key，首次调用 load 时必填
        version: "2.0", //指定要加载的 JS API 的版本，缺省时默认为 1.4.15
        plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['AMap.Scale','...','...']
      })
        .then((AMap) => {
          this.AMap = AMap;
          // 卫星图
          var satellite = new AMap.TileLayer.Satellite();
          // 向id为container创建地图
          this.map = new AMap.Map("GDMap", {
            // 设置地图容器id
            zoom: this.getAmapMaxZoom, //地图级别
            center: [this.getMapCenterLongitude, this.getMapCenterLatitude], //地图中心点
            // mapStyle: "amap://styles/whitesmoke", //设置地图的显示样式
            layers:[ //地图图层
              satellite, // 卫星图
            ]
          });
          // 初始化正常状态的标记点图标
          this.createNormalPointIcon()
          // 初始化正在关注的标记点图标
          this.createCurrentPointIcon()
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // 初始化
    init(){
      // 初始化时保存旧值副本（用于首次对比）
      this._oldMapPointsMap = new Map(this.mapPointsMap);
      // 初始化标记点列表
      this.mapPointsMap = new Map([]);
      // 初始化高德地图创建的标记点对象列表
      this.mapPointsMarksMap = new Map([]);
      // 初始化安全帽列表
      this.safeBoxList = [];
    },
    // 点击安全帽时触发
    handleBoxClick(value,key) {
      this.currentIframeUrl = item.url;
      this.isShowIframe = true;
      this.selectedLeftSn = value.sn;  // 更新左侧选中索引
    },
    // 点击标记点时触发
    handleMarkerClick(value,key){
      // 刷新关注的标记点
      this.currentMarkerSn = key
      // 重置所有标记点的图标，如果有关注点设置关注标记点的坐标
      this.resetCurrentPoint(key);
      // 更新地图视角属性
      this.updateAmapView();
      // 更新右侧选中索引
      this.selectedRightSn = key;  
    },
    // 点击所有标记点字样时触发
    handleAllMarkerShow(){
      // 更新右侧选中索引
      
      this.selectedRightSn = "";  
      // 在地图上显示所有标记点
      this.setAllPointShow()
    },
    // 重置所有标记点的图标，如果有关注点设置关注标记点的坐标 
    resetCurrentPoint(sn){
      var Icon = null;
      for (const [key, value] of this.mapPointsMarksMap) {
        if(null != value.AmapMarks){
          // 更新标记点图标
          if(key == sn)
          {
            Icon = this.currentPointIcon
          }else{
            Icon = this.normalPointIcon
          }
          value.AmapMarks.setIcon(Icon); // 更新标记点图标
          value.AmapMarks.setzIndex(100); // 重置标记点覆盖排序
        }
      }
    },
    // 更新地图视角属性
    updateAmapView(){
      for (const [key, value] of this.mapPointsMarksMap) {
        if(key == this.currentMarkerSn){ 
          if(value.AmapMarks){
            // 更新视角焦点位置
            const position = value.AmapMarks.getPosition(); // 获取标记点的位置
            if(this.map){
              this.map.setCenter(position); // 设置地图中心点为标记点位置
              // 更新地图缩放级别
              this.map.setZoom(this.getAmapMaxZoom); // 设置合适的缩放级别，可根据实际情况调整
            }
            value.AmapMarks.setzIndex(150); // 关注点标记点覆盖排序增大，需要显示在别的标记点之上
          }
        }
      }
    },
    // 让所有标记点都可以显示在地图上
    setAllPointShow(){
      // 清空关注点
      this.currentMarkerSn = ""
      // 重置所有标记点的图标，如果有关注点设置关注标记点的坐标
      this.resetCurrentPoint();
      if(this.map){
        this.map.setFitView(); // 地图上将能看到所有标记物，自适应调整地图缩放级别
        while(this.map.getZoom() == null){ //setFitView后会调整地图中心并自适应缩放等级，保证动画过后能正确获得自适应后的缩放等级
          console.log(this.map.getZoom())
          setTimeout(() => {}, 100); 
        }
        if(this.map.getZoom() > this.getAmapMaxZoom){ // 调整后检验缩放级别，高于配置的统一按配置算，（高于16.5无卫星图数据，2D模式只支持整数）
          this.map.setZoom(this.getAmapMaxZoom);
        }
      }
    },
    // 关闭悬浮框
    closeIframe() {
      this.isShowIframe = false;
    },
    // 创建正常状态的标记点图标
    createNormalPointIcon(){
      // 定义自制图标 ，确保路径正确指向你的图标文件
      this.normalPointIcon = new this.AMap.Icon({
        size: new this.AMap.Size(20, 20), // 图标尺寸，根据实际图标大小调整
        image: require('@/assets/images/PointIconBlue3.png'), // 替换为你的自制图标路径
        imageOffset: new this.AMap.Pixel(0, 0) // 图标偏移量，根据需要调整
      });
    },
    // 创建正在关注的标记点图标
    createCurrentPointIcon(){
      // 定义自制图标 ，确保路径正确指向你的图标文件
      this.currentPointIcon = new this.AMap.Icon({
        size: new this.AMap.Size(20, 20), // 图标尺寸，根据实际图标大小调整
        image: require('@/assets/images/PointIconBlue2.png'), // 替换为你的自制图标路径
        imageOffset: new this.AMap.Pixel(0, 0) // 图标偏移量，根据需要调整
      });
    },
    // 向地图中添加标记点
    addPointToAMap(value,key){
      const pointInfo = value;
      if(pointInfo){
        // 地图已创建
        if(this.map){
            // 创建标记点对象
              const marker = new this.AMap.Marker({
                position: new this.AMap.LngLat(pointInfo.longitude, pointInfo.latitude),
                offset: new this.AMap.Pixel(0, 0),
                icon: this.normalPointIcon, //使用自制图标
                });
            // 存储标记点对象
            var mapPointsMarks = {
              sn: pointInfo.sn,
              AmapMarks: marker,
            };
            this.mapPointsMarksMap.set(pointInfo.sn,mapPointsMarks)
            // 向地图添加标记点对象
            this.map.add(marker);
        }
      }
    },
    // 更新地图中的标记点坐标
    modifyPointPosition(value,key){
      const point = this.mapPointsMarksMap.get(key);
      const pointInfo = value;
      if(point && pointInfo){
        // 更新地图中的标记点坐标
        if(null != point.AmapMarks){
          point.AmapMarks.setPosition([pointInfo.longitude,pointInfo.latitude]); // 变更标记点位置
          // 更新地图视角属性
          this.updateAmapView();
        }
      }
    },
    // 从地图中移除标记点
    removePointFromAMap(value,key){
      const point = this.mapPointsMarksMap.get(key);
      if(point){
        // 从地图中移除标记点
        if(null != point.AmapMarks && this.map){
          this.map.remove(point.AmapMarks);
        }
      }
    },

    // 从后台接口获取数据
    async axiosGet(url) {
      try {
        // 接口路径会自动拼接 Store 中的 httpApiBaseUrl
        const response = await service.get(url); 
        // 返回报文主体
        return response.data;
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    },
    // 从后台接口发送数据（POST 请求）
    async axiosPost(url, data) {
      try {
        // 接口路径会自动拼接 Store 中的 httpApiBaseUrl
        const response = await service.post(url, data); 
        // 返回报文主体
        return response.data;
      } catch (error) {
        console.error('发送数据失败:', error);
      }
    },
    // API轮询
    ApiTimerFaction(){
      // 查询所有人员、车辆最新位置
      this.getAllLocation();
      // 查询安全帽列表
      this.getSafeBox();
    },
    // 查询所有人员、车辆最新位置 
    async getAllLocation(){
      try {
        var url = '/beidou/location';
        const result = await service.get(url);
        if (result.status === 200 && result.data.status === 200) {
          var resultMap = new Map(); // 使用Map快速查找sn
          // 1. 将新数据存入Map（键为sn）
          result.data.data.forEach(marker => {
            var resultPoint = {
              sn: marker.sn,
              longitude: Number(marker.lng),
              latitude: Number(marker.lat),
              name: marker.fullName,
              recordTime: marker.tm
            };
            resultMap.set(marker.sn, resultPoint);
          });

          // 2. 直接替换mapPointsMap实例，触发vue响应
          this.mapPointsMap = new Map(resultMap);
          
        }else{
          console.log('查询所有人员、车辆最新位置失败',result.status)
        }
      } catch (error) {
        console.error('发送数据失败:', error);
      }
    },
    // 查询安全帽列表
    async getSafeBox(){
      var url = '/beidou/device';
      const result = await service.get(url);
      if (result.status === 200 && result.data.status === 200) {
        
      }

    },
    // 点击图标触发
    handleIconClick(type) {
      this.currentFormType = type;
      this.isShowForm = true;
      this.formData = {}; // 重置表单
      this.submitSuccess = false;
    },
    // 关闭表单
    closeForm() {
      this.isShowForm = false;
    },

    // 打开人员信息录入页面
    openPersonInfo() {
      this.currentIframeUrl = '/person-info';
      this.isShowIframe = true;
    },
    // 打开车辆信息录入页面
    openVehicleInfo() {
      this.currentIframeUrl = '/vehicle-info';
      this.isShowIframe = true;
    },
    // 打开设备信息录入页面
    openDeviceInfo() {
      this.currentIframeUrl = '/device-info';
      this.isShowIframe = true;
    },
    // 打开绑定信息录入页面
    openBindingInfo() {
      this.currentIframeUrl = '/binding-info';
      this.isShowIframe = true;
    },

    // 核心：分析mapPointsMap的变化，触发高德地图标记点变化
    analyzeMapPointsMapChanges(oldMap, newMap) {
      // 1. 检测新增或修改的键
      for (const key of newMap.keys()) {
        if (!oldMap.has(key)) {
          // Map新增了数据
          // 在高德地图中新增标记点
          this.addPointToAMap(newMap.get(key),key);
          if(this.currentMarkerSn == ''){      
            // 新增点位后，如果没有关注点，显示全部标记点
            this.handleAllMarkerShow();
          }
        } else if (newMap.get(key) !== oldMap.get(key)) {
          // Map修改了数据
          // 更新高德地图中的标记点
          this.modifyPointPosition(newMap.get(key),key);
        }
      }
      
      // 2. 检测删除的键
      for (const key of oldMap.keys()) {
        if (!newMap.has(key)) {
          // Map删除了数据
          // 从高德地图中移除标记点
          this.removePointFromAMap(newMap.get(key),key);
        }
      }
    },

    // 帮助v-for里的元素获得子级内容
    vforSubValueGet(value,string){
      return value[1][string]; // map在vue2中被v-for识别时，每一行都会被当成[key,value]的数组，相当于[[key1,value1],[key2,value2]]，所以直接拿到的value实际是[key2,value2]，访问value的第二个元素才是map的value的真正值
    },
    
  }
}
</script>

<style scoped>
#GDMap{
  position: absolute !important;  /* 绝对定位填满父容器 */
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 0 !important;          /* 确保地图在最底层 */
  border: none !important;        /* 取消外边框 */
}
.map-container {
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative; /* 为子元素定位提供参考 */
  pointer-events: none; /* 关键：容器内所有元素默认不响应鼠标事件 */
}
/* 左右面板背景改为透明 */
/* 左右面板 */
.left-panel, .right-panel {
  max-height: 60%; /* 最大高度为视口高度的60% */
  min-height: 60%; /* 最小高度为视口高度的60% */
  width: 20%;
  background: transparent;
  padding: 1.5rem;
  box-sizing: border-box;
  position: relative;  /* 开启定位 */
  z-index: 2;          /* 高于地图的z-index（0） */
}
.right-panel { 
  border-right: none;  }
.panel-header { 
  position: relative; /* 为子元素定位提供参考 */
  width: 100%;
  height: 2%;
  }
.panel-header h3 { 
  position: absolute; /* 绝对定位 */
  height: 100%;
  left: 29.5%; /* 左侧基准点 */
  top: 50%; /* 上侧基准点 */
  transform: translate(-50% , -50%); /* 水平和垂直居中 */
  white-space: nowrap; /* 防止换行 */
  color: #bac0ca; 
  margin: 0; 
  font-size: 1vw; 
  overflow: visible; /* 溢出不隐藏 */
  text-overflow: ellipsis; /* 溢出显示省略号 */
  letter-spacing: 0.12vw; /* 字间距 */
  }
.panel-content { 
  width: 100%;
  height: 100%;
  background-image: url('../assets/images/oilbg.png');
  background-size: 100% 100%; 
  background-repeat: no-repeat; 
  background-position: center; 
  pointer-events: auto; /* 关键：仅允许面板内容区域响应事件 */
}

.panel-background-inside{
  position: relative;  /* 开启定位 */
  left: 7%; 
  top: 5%; 
  width: 85%;
  min-height: 86%;
  max-height: 86%;
  background: rgba(22, 123, 163, 0.185); 
  transition: transform 0.2s, background 0.2s; /* 背景过渡 */
  border-radius: 3px; /* 圆角 */
  overflow-y: auto; /* 内容超出时显示垂直滚动条 */
  overflow-x: hidden; /* 隐藏x方向溢出内容（不显示滚动条） */
  scrollbar-width: thin; /* 滚动条宽度（可选：auto/thin） */
  scrollbar-color: #5d748350 #0d507c50; /* 滑块颜色 | 轨道颜色 */
}

/* 安全帽列表项背景改为透明 */
.list-item { 
  position: relative;  /* 开启定位 */
  display: flex; 
  background: transparent; 
  border-radius: 4px; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  margin-bottom: 0.1rem; 
  margin-top: 0.1rem; 
  margin-right: 0.1rem; 
  transition: transform 0.2s; 
  background: rgba(37, 99, 235, 0.1); 
  transition: transform 0.2s, background 0.2s; /* 新增背景过渡 */
}
.list-item:hover { 
  transform: translateX(5px); 
  background: rgba(37, 99, 235, 0.15); /* hover时加深透明度 */
  }
/* 左侧列表选中状态 */
.list-item.active {
  animation: rowActive 2s ease-in-out infinite; /* 2秒循环 */
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2); /* 可选：添加阴影 */
}
.item-info{
  position: relative;  /* 开启定位 */
  width: 100%;
  height: 100%;
}
.item-icon { font-size: 1.8rem; margin-right: 1rem; color: #2563eb; }
.item-name { 
  position: relative;  /* 开启定位 */
  margin: 0 0 0.3rem 0; 
  width: 100%;
  height: 100%;
  }
.item-name a{ 
  position: relative;  /* 开启定位 */
  left: 40%; /* 左侧基准点 */
  top: 0%; /* 垂直基准点 */
  width: 100%;
  transform: translate(-50%, -50%); /* 水平和垂直居中 */
  font-weight: 600; 
  font-size: 0.7vw;
  color: #bac0ca; 
  white-space: nowrap; /* 文本不换行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 溢出显示省略号 */
  }
.item-status { 
  color: #babec7; 
  font-size: 0.9rem; 
  margin: 0; 
  white-space: nowrap; /* 文本不换行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 溢出显示省略号 */
  }

.map-view { width: 60%; background: #edf2f7; position: relative; }
.map-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 1.2rem; }
.param-item { padding: 0.8rem 1rem; background: #e2e8f0; border-radius: 6px; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center; }
.param-name { color: #4a5568; font-weight: 500; }
.param-value { color: #1a202c; font-weight: 600; }

/* 地图标记项背景改为透明 */
.marker-item {
  padding: 1rem;
  background: transparent; /* 原 #ffffff → 透明 */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
  transition: transform 0.2s;
  background: rgba(37, 99, 235, 0.1); 
  transition: transform 0.2s, background 0.2s; /* 新增背景过渡 */
}
.marker-item:hover { 
  transform: translateX(5px); 
  background: rgba(37, 99, 235, 0.15); /* hover时加深透明度 */
  }
/* 右侧列表选中状态 */
.marker-item.active {
  animation: rowActive 2s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}
.marker-info{
  width: 100%;
  height: 100%;
}
.marker-name {
  font-weight: 600;
  color: #bac0ca;
  margin: 0 0 0.5rem 0;
  font-size: 0.7vw;
  white-space: nowrap; /* 文本不换行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 溢出显示省略号 */
}
.marker-coord {
  color: #babec7;
  font-size: 0.9rem;
  margin: 0.3rem 0;
  white-space: nowrap; /* 文本不换行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 溢出显示省略号 */
}

/* 悬浮框遮罩（保留半透明背景） */
.iframe-mask {
  position: fixed; /* 固定定位覆盖整个屏幕 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  z-index: 3; /* 高于两侧面板 */
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* 关键：仅允许容器内元素响应事件 */
}

/* 悬浮框容器背景改为透明 */
.iframe-container {
  position: relative;
  width: 80%;
  height: 80%;
  background: transparent; /* 原 #fff → 透明 */
  border-radius: 8px;
  overflow: hidden; 
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: #fff; /* 关闭按钮保留白色背景（可选修改） */
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 2px 10px;
  border-radius: 50%;
  z-index: 4; 
}

.iframe-content {
  width: 100%;
  height: 100%;
}

/* 蓝色透明遮罩层 */
.blue-mask {
  position: absolute;  /* 绝对定位覆盖父容器 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;  /* 位于面板和地图视图下方（面板z-index:1） */
  pointer-events: none; /* 关键：不拦截鼠标事件（点击会穿透到下方控件） */
  
  /* 线性渐变：左右两侧蓝色透明 → 中间完全透明 */
  background: linear-gradient(
    to right,
    rgba(37, 99, 235, 0.2) 0%,    /* 左侧：蓝色透明（透明度0.2） */
    rgba(37, 99, 235, 0) 50%,     /* 中间：完全透明（透明度0） */
    rgba(37, 99, 235, 0.2) 100%   /* 右侧：蓝色透明（透明度0.2） */
  );
}

/* 禁止所有元素的文本被选中（含浏览器前缀兼容） */
::v-deep * {  /* Vue 2 深度选择器，Vue 3 用 :deep(*) */
  -webkit-user-select: none;  /* Safari/Chrome */
  -moz-user-select: none;     /* Firefox */
  -ms-user-select: none;      /* IE/Edge */
  user-select: none;          /* 标准属性 */
}

/* 可选：如果页面中有输入框/文本域需要保留选中文本功能，单独恢复 */
::v-deep input, 
::v-deep textarea {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* 定义动画：背景颜色渐变 */
@keyframes rowActive {
  0% {
    background-color: rgba(37, 99, 235, 0.15); /* 初始颜色 */
    /* transform: translateX(5px); */
  }
  50% {
    background-color: rgba(37, 99, 235, 0.3);  /* 中间加深 */
    /* transform: translateX(8px); */
  }
  100% {
    background-color: rgba(37, 99, 235, 0.15); /* 回到初始 */
    /* transform: translateX(5px); */
  }
}

/* 新增：信息录入图标样式 */
.left-icons-panel{
  position: relative;
  left: -1.5%;
  top: 1%;
  z-index: 3;
  pointer-events: auto; /* 关键：仅允许容器内元素响应事件 */
}
.input-icons {
  position: relative;
  width: 3.5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; /* 图标间距 */
  padding: 1rem 0;
}
.input-icon {
  width: 90%; /* 自适应父容器宽度 */
  aspect-ratio: 1/1; /* 正方形 */
  background-size: cover; /* 图片铺满 */
  background-position: center;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}
.input-icon:hover {
  transform: scale(1.05); /* 悬停放大 */
}

/* 表单样式 */
.form-container {
  width: 40%; /* 表单宽度 */
  height: auto; /* 高度自适应 */
  background: rgba(255, 255, 255, 0.95); /* 半透明背景 */
  padding: 2rem;
}
.form-title{width: 40%; /* 表单宽度 */
  height: auto; /* 高度自适应 */
}
.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.form-group label {
  width: 60px;
  color: #333;
}
.form-group input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.submit-btn {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.submit-btn:hover {
  background: #1d4ed8;
}
.success-tip {
  text-align: center;
  padding: 2rem;
  color: #2563eb;
  font-size: 1.2rem;
}
</style>