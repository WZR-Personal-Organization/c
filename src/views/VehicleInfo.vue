<template>
  <div class="form-container">
    <!-- 左侧已录入车辆列表 -->
    <div class="left-list">
      <h3 class="list-title">已录入车辆</h3>
      <div class="list-content" v-if="vehicleList.length">
        <div 
          class="list-item" 
          v-for="vehicle in vehicleList" 
          :key="vehicle.id"
          :class="{ active: currentVehicle.id === vehicle.id }"
          @click="selectVehicle(vehicle)"
        >
          <p>车牌号：{{ vehicle.vehicleLicensePlateNumber }}</p>
          <p>品牌：{{ vehicle.brand }}</p>
        </div>
      </div>
      <div v-else class="empty-tip">暂无录入车辆</div>
    </div>

    <!-- 右侧录入表单 -->
    <div class="right-form">
      <!-- 未提交时显示表单 -->
      <div v-if="!submitSuccess" class="form-content">
        <h3 class="section-title">{{ sectionTitle }}</h3>

        <!-- 车辆基本信息 -->
        <div class="form-section">
          <h3 class="section-title">车辆基本信息</h3>
          <div class="form-group">
            <label>车牌号：</label>
            <input v-model="formData.vehicleLicensePlateNumber" placeholder="请输入车牌号">
          </div>
          <div class="form-group">
            <label>品牌：</label>
            <input v-model="formData.brand" placeholder="请输入品牌">
          </div>
          <div class="form-group">
            <label>型号：</label>
            <input v-model="formData.vehicleModel" placeholder="请输入型号">
          </div>
          <div class="form-group">
            <label>车辆类型：</label>
            <input v-model="formData.vehicleType" placeholder="请输入车辆类型（如：货车/客车）">
          </div>
          <div class="form-group">
            <label>颜色：</label>
            <input v-model="formData.colour" placeholder="请输入颜色">
          </div>
          <div class="form-group">
            <label>车辆来源：</label>
            <input v-model="formData.vehicleSource" placeholder="请输入车辆来源（如：购置/租赁）">
          </div>
        </div>

        <!-- 技术参数 -->
        <div class="form-section">
          <h3 class="section-title">技术参数</h3>
          <div class="form-group">
            <label>车辆识别代号：</label>
            <input v-model="formData.vehicleIdentificationNumber" placeholder="请输入VIN码">
          </div>
          <div class="form-group">
            <label>发动机号：</label>
            <input v-model="formData.engineNumber" placeholder="请输入发动机号">
          </div>
          <div class="form-group">
            <label>燃油标号：</label>
            <input v-model="formData.fuelGrade" placeholder="请输入燃油标号（如：95#）">
          </div>
          <div class="form-group">
            <label>汽缸数：</label>
            <input v-model="formData.numberOfCylinders" placeholder="请输入汽缸数">
          </div>
          <div class="form-group">
            <label>排气量：</label>
            <input v-model="formData.exhaustVolume" placeholder="请输入排气量（如：2.0L）">
          </div>
          <div class="form-group">
            <label>外廓尺寸：</label>
            <input v-model="formData.overallDimensions" placeholder="请输入外廓尺寸（长×宽×高）">
          </div>
        </div>

        <!-- 使用信息 -->
        <div class="form-section">
          <h3 class="section-title">使用信息</h3>
          <div class="form-group">
            <label>使用单位：</label>
            <input v-model="formData.unitOfUse" placeholder="请输入使用单位">
          </div>
          <div class="form-group">
            <label>使用性质：</label>
            <input v-model="formData.natureOfUse" placeholder="请输入使用性质（如：营运/非营运）">
          </div>
          <div class="form-group">
            <label>成员数：</label>
            <input v-model="formData.numberOfPassengers" placeholder="请输入成员数">
          </div>
          <div class="form-group">
            <label>额定油耗：</label>
            <input v-model="formData.ratedFuelConsumption" placeholder="请输入额定油耗（L/100km）">
          </div>
          <div class="form-group">
            <label>购置时间：</label>
            <input v-model="formData.purchaseTime" type="date" placeholder="请选择购置时间">
          </div>
        </div>

        <!-- 资产信息 -->
        <div class="form-section">
          <h3 class="section-title">资产信息</h3>
          <div class="form-group">
            <label>车辆价格：</label>
            <input v-model="formData.vehiclePrices" placeholder="请输入车辆价格（万元）" type="number">
          </div>
          <div class="form-group">
            <label>固定资产卡号：</label>
            <input v-model="formData.fixedAssetCardNumber" placeholder="请输入固定资产卡号">
          </div>
          <div class="form-group">
            <label>产权归属：</label>
            <input v-model="formData.ownershipOfPropertyRights" placeholder="请输入产权归属（如：公司/个人）">
          </div>
        </div>

        <!-- 操作按钮组 -->
        <div class="btn-group">
          <button class="submit-btn" @click="submitForm">新增</button>
          <button class="modify-btn" v-if="currentVehicle.id !== -1" @click="updateVehicle">修改</button>
          <button class="delete-btn" v-if="currentVehicle.id !== -1" @click="deleteVehicle">删除</button>
        </div>
      </div>

      <!-- 提交成功后显示提示 -->
      <div v-if="submitSuccess" class="success-tip">
        <p>🎉 车辆信息提交成功！</p>
        <button class="back-btn" @click="resetForm">返回</button>
      </div>
    </div>
  </div>
</template>

<script>
import service from '@/utils/request'

export default {
  name: 'VehicleInfo',
  data() {
    return {
      formData: {
        id: 0, // 提交时占位
        vehicleLicensePlateNumber: '',
        vehicleModel: '',
        vehicleType: '',
        vehicleIdentificationNumber: '',
        fuelGrade: '',
        numberOfCylinders: '',
        overallDimensions: '',
        vehiclePrices: '',
        powerType: '',
        vehicleSource: '',
        unitOfUse: '',
        brand: '',
        engineNumber: '',
        colour: '',
        numberOfPassengers: '',
        exhaustVolume: '',
        ratedFuelConsumption: '',
        purchaseTime: '',
        fixedAssetCardNumber: '',
        natureOfUse: '',
        ownershipOfPropertyRights: '',
        vehiclePhotos: '' // 可根据实际需求替换为文件上传组件
      },
      submitSuccess: false,
      vehicleList: [], // 已录入车辆列表
      currentVehicle: { id: -1 }, // 当前选中车辆
      sectionTitle: "新增车辆" // 表单标题
    }
  },
  watch: {
    // 监听当前选中车辆变化，更新标题
    currentVehicle: {
      handler(newVal) {
        this.sectionTitle = newVal.id === -1 ? "新增车辆" : "修改车辆信息"
      },
      deep: true
    }
  },
  mounted() {
    // 页面加载时获取车辆列表
    this.getAllVehicleInfo()
  },
  methods: {
    // 提交表单
    async submitForm() {
      try {
        const res = await service.post('/beidou/vehicle', this.formData)
        if (res.status === 200 && res.data.status === 200) {
          this.submitSuccess = true
          this.getAllVehicleInfo() // 刷新列表
          this.currentVehicle = { id: -1 } // 清空选中状态
        }
      } catch (error) {
        console.error('提交失败:', error)
      }
    },

    // 获取已录入车辆列表
    async getAllVehicleInfo() {
      try {
        const res = await service.get('/beidou/vehicle')
        if (res.data.status === 200) {
          this.vehicleList = res.data.data
        }
      } catch (error) {
        console.error('获取车辆列表失败:', error)
      }
    },

    // 选择车辆填充表单
    selectVehicle(vehicle) {
      if (this.currentVehicle.id !== vehicle.id) {
        // 选中车辆，填充表单
        this.currentVehicle = vehicle
        this.formData = { ...vehicle } // 深拷贝避免引用问题
      } else {
        // 取消选择，重置表单
        this.currentVehicle = { id: -1 }
        this.resetForm()
      }
    },

    // 修改车辆信息（先提交新数据，再删除旧数据）
    async updateVehicle() {
      if (this.currentVehicle.id === -1) return
      try {
        const submitRes = await service.post('/beidou/vehicle', this.formData)
        if (submitRes.status === 200 && submitRes.data.status === 200) {
          const deleteRes = await service.delete(`/beidou/vehicle/${this.currentVehicle.id}`)
          if (deleteRes.status === 200 && deleteRes.data.status === 200) {
            this.submitSuccess = true
            this.getAllVehicleInfo()
          }
        }
      } catch (error) {
        console.error('修改失败:', error)
      }
    },

    // 删除车辆信息
    async deleteVehicle() {
      if (this.currentVehicle.id === -1) return
      try {
        const res = await service.delete(`/beidou/vehicle/${this.currentVehicle.id}`)
        if (res.status === 200 && res.data.status === 200) {
          this.getAllVehicleInfo()
          this.resetForm()
        }
      } catch (error) {
        console.error('删除失败:', error)
      }
    },

    // 重置表单
    resetForm() {
      this.submitSuccess = false
      this.formData = {
        id: 0,
        vehicleLicensePlateNumber: '',
        vehicleModel: '',
        vehicleType: '',
        vehicleIdentificationNumber: '',
        fuelGrade: '',
        numberOfCylinders: '',
        overallDimensions: '',
        vehiclePrices: '',
        powerType: '',
        vehicleSource: '',
        unitOfUse: '',
        brand: '',
        engineNumber: '',
        colour: '',
        numberOfPassengers: '',
        exhaustVolume: '',
        ratedFuelConsumption: '',
        purchaseTime: '',
        fixedAssetCardNumber: '',
        natureOfUse: '',
        ownershipOfPropertyRights: '',
        vehiclePhotos: ''
      }
      
      this.currentVehicle = {id:-1}
    }
  }
}
</script>

<style scoped>
/* 复用PersonInfo.vue的样式，保持整体风格一致 */
.form-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  background: #ffffff;
}

.left-list {
  width: 30%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-y: auto;
  height: 1801.2px; /* 关键：高度设置为右侧form高度 */
}

.list-content {
  max-height: calc(100% - 24px - 24px); /* 填满 left-list 高度 */
  overflow-y: auto; /* 关键：滚动条在 list-content 内部 */
}

.list-title {
  font-size: 1.1rem;
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 1rem;
  margin-top: 0rem;
}

.list-item {
  padding: 1rem;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:hover {
  background: #e5e7eb;
}

.list-item.active {
  background: #bfdbfe;
  border-left: 4px solid #2563eb;
}

.empty-tip {
  color: #64748b;
  text-align: center;
  padding: 2rem;
}

.right-form {
  flex: 1;
}

.form-content {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex: 1;
}

.form-section {
  padding: 1.5rem;
  background: #ebeff3;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  color: #2563eb;
  font-weight: 600;
  margin: 0rem;
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.form-group label {
  width: 140px;
  color: #333;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.form-group input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.95rem;
  max-width: 600px;
}

.btn-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn, .modify-btn, .delete-btn {
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  max-width: 200px;
}

.submit-btn {
  background: #1d4ed8;
  color: white;
}

.submit-btn:hover {
  background: #0841df;
}

.modify-btn {
  background: #475569; 
  color: white;
}

.modify-btn:hover {
  background: #334155;
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.delete-btn:hover {
  background: #b91c1c;
}

.success-tip {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.back-btn {
  padding: 1rem 2rem;
  background: #475569;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  margin-top: 2rem;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #334155;
}
</style>