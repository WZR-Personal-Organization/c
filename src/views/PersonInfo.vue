<template>
  <div class="iframe-mask">
    <div class="form-container">
      <button class="close-btn" @click="goBack">×</button>
      
      <!-- 未提交时显示表单 -->
      <div v-if="!submitSuccess" class="form-content">
        <div class="form-title">人员信息录入</div>
        <div class="form-group">
          <label>姓名：</label>
          <input v-model="formData.name" placeholder="请输入姓名">
        </div>
        <div class="form-group">
          <label>电话：</label>
          <input v-model="formData.phone" placeholder="请输入电话" type="tel">
        </div>
        <div class="form-group">
          <label>身份证号：</label>
          <input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18">
        </div>
        <button class="submit-btn" @click="submitForm">提交</button>
      </div>

      <!-- 提交成功后显示提示 -->
      <div v-if="submitSuccess" class="success-tip">
        <p>🎉 人员信息提交成功！</p>
        <button class="close-btn" @click="goBack">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import service from '@/utils/request'

export default {
  name: 'PersonInfo',
  data() {
    return {
      formData: {
        name: '',
        phone: '',
        idCard: ''
      },
      submitSuccess: false
    }
  },
  computed: {
    ...mapGetters(['getUserApi']) // 假设从Vuex获取API地址（根据实际项目调整）
  },
  methods: {
    // 提交表单
    async submitForm() {
      try {
        // 调用接口提交数据（根据实际API调整）
        const res = await service.post('/api/person', this.formData)
        if (res.data.code === 200) {
          this.submitSuccess = true
        }
      } catch (error) {
        console.error('提交失败:', error)
      }
    },
    // 返回上一页（或关闭当前路由）
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
/* 样式与Map.vue的iframe-mask保持一致 */
.iframe-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 40%;
  min-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #fff;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.form-title {
  font-size: 1.2rem;
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group label {
  width: 80px;
  color: #333;
  font-size: 0.95rem;
}

.form-group input {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 0.8rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
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