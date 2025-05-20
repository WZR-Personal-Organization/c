<template>
  <div class="form-container">
    <!-- 左侧已录入设备列表 -->
    <div class="left-list">
      <h3 class="list-title">已录入设备</h3>
      <div class="list-content" v-if="deviceList.length">
        <div 
          class="list-item" 
          v-for="device in deviceList" 
          :key="device.id"
          :class="{ active: currentDevice.id === device.id }"
          @click="selectDevice(device)"
        >
          <p>设备名称：{{ device.deviceName }}</p>
          <p>设备编号：{{ device.deviceSn }}</p>
        </div>
      </div>
      <div v-else class="empty-tip">暂无录入设备</div>
    </div>

    <!-- 右侧录入表单 -->
    <div class="right-form">
      <!-- 未提交时显示表单 -->
      <div v-if="!submitSuccess" class="form-content">
        <h3 class="section-title">{{ sectionTitle }}</h3>
        
        <!-- 设备基础信息 -->
        <div class="form-section">
          <h3 class="section-title">设备信息</h3>
          <div class="form-group">
            <label>设备编号：</label>
            <input v-model="formData.deviceSn" placeholder="请输入设备编号">
          </div>
          <div class="form-group">
            <label>设备名称：</label>
            <input v-model="formData.deviceName" placeholder="请输入设备名称">
          </div>
          <div class="form-group">
            <label>设备类型：</label>
            <input v-model="formData.deviceType" placeholder="请输入设备类型（如：传感器/控制器）">
          </div>
          <div class="form-group">
            <label>基础信息（JSON）：</label>
            <textarea 
              v-model="formData.basicInformation" 
              placeholder="请输入基础信息（JSON格式）"
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- 操作按钮组 -->
        <div class="btn-group">
          <button class="submit-btn" @click="submitForm">提交</button>
          <button class="modify-btn" v-if="currentDevice.id !== -1" @click="updateDevice">修改</button>
          <button class="delete-btn" v-if="currentDevice.id !== -1" @click="deleteDevice">删除</button>
        </div>
      </div>

      <!-- 提交成功后显示提示 -->
      <div v-if="submitSuccess" class="success-tip">
        <p>🎉 设备信息提交成功！</p>
        <button class="back-btn" @click="resetForm">返回</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'

export default {
  name: 'DeviceInfo',
  data() {
    return {
      formData: {
        id: 0, // 提交时占位（新增时后端生成）
        deviceSn: '',
        deviceName: '',
        deviceType: '',
        basicInformation: '' // 存储JSON字符串
      },
      submitSuccess: false,
      deviceList: [], // 已录入设备列表
      currentDevice: { id: -1 }, // 当前选中设备（id=-1表示未选择）
      refreshTimer: null, // 定时刷新定时器
      sectionTitle: "新增设备" // 表单标题
    }
  },
  watch: {
    // 监听当前选中设备变化，更新表单标题
    currentDevice: {
      handler(newVal) {
        this.sectionTitle = newVal.id === -1 ? "新增设备" : "修改设备信息"
      },
      deep: true
    }
  },
  mounted() {
    // 页面加载时获取设备列表
    this.getAllDeviceInfo()
    // 初始化60秒定时刷新
    this.refreshTimer = setInterval(() => {
      this.getAllDeviceInfo()
    }, 60000)
  },
  beforeDestroy() {
    // 销毁定时器防止内存泄漏
    clearInterval(this.refreshTimer)
  },
  methods: {
    // 提交表单（新增或修改）
    async submitForm() {
      try {
        const res = await service.post('/beidou/device', this.formData)
        if (res.data.status === 200) {
          this.submitSuccess = true
          this.getAllDeviceInfo() // 刷新设备列表
          this.currentDevice = { id: -1 } // 清空选中状态
        }
      } catch (error) {
        console.error('提交失败:', error)
      }
    },

    // 获取已录入设备列表
    async getAllDeviceInfo() {
      try {
        const res = await service.get('/beidou/device')
        if (res.data.status === 200) {
          this.deviceList = res.data.data
        }
      } catch (error) {
        console.error('获取设备列表失败:', error)
      }
    },

    // 选择设备填充表单
    selectDevice(device) {
      if (this.currentDevice.id !== device.id) {
        // 选择设备：填充表单
        this.currentDevice = device
        this.formData = {
          id: device.id,
          deviceSn: device.deviceSn,
          deviceName: device.deviceName,
          deviceType: device.deviceType,
          basicInformation: device.basicInformation
        }
      } else {
        // 取消选择：重置表单
        this.currentDevice = { id: -1 }
        this.formData = {
          id: 0,
          deviceSn: '',
          deviceName: '',
          deviceType: '',
          basicInformation: ''
        }
      }
    },

    // 修改设备信息（先新增后删除原设备，或直接PUT更新，根据接口设计调整）
    async updateDevice() {
      if (this.currentDevice.id === -1) return
      try {
        // 提交修改后的设备信息
        const submitRes = await service.post('/beidou/device', this.formData)
        if (submitRes.data.status === 200) {
          // 删除原设备（假设接口支持）
          const deleteRes = await service.delete(`/beidou/device/${this.currentDevice.id}`)
          if (deleteRes.data.status === 200) {
            this.submitSuccess = true
            this.getAllDeviceInfo() // 刷新列表
          }
        }
      } catch (error) {
        console.error('修改失败:', error)
      }
    },

    // 删除设备信息
    async deleteDevice() {
      if (this.currentDevice.id === -1) return
      try {
        const res = await service.delete(`/beidou/device/${this.currentDevice.id}`)
        if (res.data.status === 200) {
          this.getAllDeviceInfo() // 刷新列表
          this.resetForm() // 清空表单
        }
      } catch (error) {
        console.error('删除失败:', error)
      }
    },

    // 重置表单状态
    resetForm() {
      this.submitSuccess = false
      this.formData = {
        id: 0,
        deviceSn: '',
        deviceName: '',
        deviceType: '',
        basicInformation: ''
      }
      this.currentDevice = { id: -1 }
    }
  }
}
</script>

<style scoped>
/* 复用PersonInfo.vue的样式（左侧列表、右侧表单、按钮等布局） */
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
}

.list-title {
  font-size: 1.1rem;
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 1rem;
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
  /* height: 93.7%; */
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
  margin-bottom: 1rem;
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

.form-group input, 
.form-group textarea {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.95rem;
  max-width: 600px;
}

.form-group textarea {
  resize: vertical; /* 允许垂直调整大小 */
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