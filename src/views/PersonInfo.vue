<template>
  <!-- 移除背景遮罩层，直接使用form-container作为根元素 -->
  <div class="form-container">
    <!-- 移除原右上角关闭按钮 -->
    
    <!-- 未提交时显示表单 -->
    <div v-if="!submitSuccess" class="form-content">
      <div class="form-title">人员信息录入</div>
      
      <!-- 公司与场站信息 -->
      <div class="form-section">
        <h3 class="section-title">公司与场站信息</h3>
        <div class="form-group">
          <label>二级公司：</label>
          <input v-model="formData.secondaryCompany" placeholder="请输入二级公司名称">
        </div>
        <div class="form-group">
          <label>三级公司：</label>
          <input v-model="formData.thirdLevelCompany" placeholder="请输入三级公司名称">
        </div>
        <div class="form-group">
          <label>场站名称：</label>
          <input v-model="formData.stationName" placeholder="请输入场站名称">
        </div>
        <div class="form-group">
          <label>场站类型：</label>
          <input v-model="formData.stationType" placeholder="请输入场站类型（如：变电站/光伏站）">
        </div>
      </div>

      <!-- 用户基础信息 -->
      <div class="form-section">
        <h3 class="section-title">用户基础信息</h3>
        <div class="form-group">
          <label>名称：</label>
          <input v-model="formData.fullName" placeholder="请输入全称">
        </div>
        <div class="form-group">
          <label>用户类型：</label>
          <input v-model="formData.customerType" placeholder="请输入用户类型（如：运维/检修）">
        </div>
        <div class="form-group">
          <label>工号：</label>
          <input v-model="formData.jobId" placeholder="请输入工号">
        </div>
        <div class="form-group">
          <label>手机号：</label>
          <input v-model="formData.cellPhoneNumber" placeholder="请输入手机号" type="tel">
        </div>
      </div>

      <!-- 组织与角色信息 -->
      <div class="form-section">
        <h3 class="section-title">组织与角色信息</h3>
        <div class="form-group">
          <label>组织：</label>
          <input v-model="formData.organization" placeholder="请输入所属组织">
        </div>
        <div class="form-group">
          <label>班组：</label>
          <input v-model="formData.team" placeholder="请输入所属班组">
        </div>
        <div class="form-group">
          <label>是否运检分离：</label>
          <input v-model="formData.isOperationInspectionSeparated" placeholder="请输入（是/否）">
        </div>
        <div class="form-group">
          <label>角色：</label>
          <input v-model="formData.role" placeholder="请输入角色（如：班长/技术员）">
        </div>
      </div>

      <!-- 备注信息 -->
      <div class="form-section">
        <h3 class="section-title">备注信息</h3>
        <div class="form-group">
          <label>备注：</label>
          <input v-model="formData.remarks" placeholder="请输入备注信息">
        </div>
      </div>

      <button class="submit-btn" @click="submitForm">提交</button>
    </div>

    <!-- 提交成功后显示提示 -->
    <div v-if="submitSuccess" class="success-tip">
      <p>🎉 人员信息提交成功！</p>
      <button class="close-btn" @click="goBack">关闭</button>
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
        // 新增字段初始化
        secondaryCompany: '',
        thirdLevelCompany: '',
        stationName: '',
        stationType: '',
        fullName: '',
        customerType: '',
        jobId: '',
        cellPhoneNumber: '',
        organization: '',
        team: '',
        isOperationInspectionSeparated: '',
        role: '',
        remarks: ''
      },
      submitSuccess: false
    }
  },
  computed: {
  },
  methods: {
    async submitForm() {
      try {
        const res = await service.post('/beidou/user', this.formData)
        if (res.data.status === 200) {
          this.submitSuccess = true
          console.log(res.data)
        }
      } catch (error) {
        console.error('提交失败:', error)
      }
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
/* 全屏布局调整 */
.form-container {
  width: 100%;
  height: 100%; /* 占满iframe高度 */
  background: #fff; /* 移除背景遮罩 */
  padding: 2rem;
  overflow-y: auto; /* 内容过长时滚动 */
}

/* 表单分区样式 */
.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.section-title {
  font-size: 1.1rem;
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

/* 表单字段组样式优化 */
.form-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.form-group label {
  width: 140px; /* 标签宽度增大，适应长文本 */
  color: #333;
  font-size: 0.95rem;
  flex-shrink: 0; /* 防止标签被压缩 */
}

.form-group input {
  flex: 1;
  padding: 0.8rem 1rem; /* 输入框内边距增大 */
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.95rem;
  max-width: 600px; /* 限制输入框最大宽度 */
}

/* 提交按钮样式 */
.submit-btn {
  max-width: 600px; /* 与输入框对齐 */
  padding: 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 2rem;
}

.submit-btn:hover {
  background: #1d4ed8;
}

/* 成功提示样式 */
.success-tip {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
</style>