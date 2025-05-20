<template>
  <div class="form-container">
    <!-- 左侧已录入人员列表  -->
    <div class="left-list">
      <h3 class="list-title">已录入人员</h3>
      <div class="list-content" v-if="personList.length">
        <div 
          class="list-item" 
          v-for="person in personList" 
          :key="person.id"
          :class="{ active:  currentPerson.id === person.id}"
          @click="selectPerson(person)"
        >
          <p>姓名：{{ person.fullName }}</p>
          <p>ID：{{ person.id }}</p>
        </div>
      </div>
      <div v-else class="empty-tip">暂无录入人员</div>
    </div>

    <!-- 右侧录入表单 -->
    <div class="right-form">
      <!-- 未提交时显示表单 -->
      <div v-if="!submitSuccess" class="form-content">
        <h3 class="section-title">{{sectionTitle}}</h3>
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

        <!-- 操作按钮组 -->
        <div class="btn-group">
          <button class="submit-btn" @click="submitForm">新增</button>
          <button class="modify-btn" v-if="currentPerson.id != -1" @click="updatePerson">修改</button>
          <button class="delete-btn" v-if="currentPerson.id != -1" @click="deletePerson">删除</button>
        </div>
      </div>

      <!-- 提交成功后显示提示 -->
      <div v-if="submitSuccess" class="success-tip">
        <p>🎉 人员信息提交成功！</p>
        <button class="back-btn" @click="resetForm">返回</button>
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
        id:0, //提交时仅占位
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
      submitSuccess: false,
      personList: [], // 已录入人员列表
      currentPerson: {id:-1}, // 当前选中人员
      refreshTimer: null, // 定时刷新定时器
      sectionTitle:"新增人员", // section-title内容
    }
  },
  computed: {
  },
  watch: {
    // 监听 currentPerson 变化
    currentPerson: {
      handler(newval) {  
        if(newval.id === -1){ // 根据是否选中已有人员，更改section-title
          this.sectionTitle = "新增人员"
        }else{
          this.sectionTitle = "修改人员信息"
        }
      },
      deep: true
    },
  },
  mounted() {
    // 页面加载时获取人员列表
    this.getAllPersonInfo()
    // 初始化60秒定时刷新
    this.refreshTimer = setInterval(() => {
      this.getAllPersonInfo()
    }, 60000)
  },
  beforeDestroy() {
    // 销毁定时器
    clearInterval(this.refreshTimer)
  },
  methods: {
    // 提交表单
    async submitForm() {
      try {
        const res = await service.post('/beidou/user', this.formData)
        if (res.data.status === 200) { // 这个是http的返回状态
          //if(res.data.data.status === 200){ // 这个是api接口的返回状态
            this.submitSuccess = true
            this.getAllPersonInfo() // 刷新列表
          //}
        }
      } catch (error) {
        console.error('提交失败:', error)
      }
    },
    // 获取已录入人员列表
    async getAllPersonInfo() {
      try {
        const res = await service.get('/beidou/user')
        if (res.status === 200) {
          if(res.data.status === 200){ // 这个是api接口的返回状态
            const result = res.data.data;
            this.personList = result;
          }
        }
      } catch (error) {
        console.error('获取人员列表失败:', error)
      }
    },
    // 选择人员填充表单
    selectPerson(person) {
      
      if(this.currentPerson.id != person.id){ // 选择人员
        this.currentPerson = person
        // 将人员信息填充到表单（需根据实际字段匹配）
        this.formData = { ...person } // 深拷贝避免引用问题
      }else{ // 取消选择人员
        this.currentPerson = {id:-1}
        // 重置表单
        this.resetForm()
      }
      
    },

    // 修改人员信息
    async updatePerson() { // 先新增再删除原有
      if (this.currentPerson.id === -1) return
      try {
        const submitRes = await service.post('/beidou/user', this.formData)
        if (submitRes.status === 200) { // 这个是http的返回状态
          if(submitRes.data.status === 200){ // 这个是api接口的返回状态
            const deleteRes = await service.delete(`/beidou/user/${this.currentPerson.id}`)
            if (deleteRes.status === 200) { // 这个是http的返回状态
              if(deleteRes.data.status === 200){ // 这个是api接口的返回状态
                this.submitSuccess = true
                this.getAllPersonInfo() // 刷新列表
              }
            }
          }
        }
      } catch (error) {
        console.error('提交失败:', error)
      }
    },

    // 删除人员信息
    async deletePerson() {
      if (this.currentPerson.id === -1) return
      try {
        const res = await service.delete(`/beidou/user/${this.currentPerson.id}`)
        if (res.status === 200) {
          if (res.data.status === 200) {
            this.getAllPersonInfo() // 刷新列表
            this.resetForm() // 清空表单
          }
        }
      } catch (error) {
        console.error('删除失败:', error)
      }
    },

    // 重置表单状态
    resetForm() {
      this.submitSuccess = false
      this.formData = {} // 清空表单（或保留初始值）
      this.currentPerson = {id:-1}
    },

  },
  
}
</script>

<style scoped>
/* 整体布局：左右分栏 */
.form-container {
  position:relative;
  display: flex;
  gap: 2rem;
  padding: 2rem;
  margin: 0rem;
  min-height: 100vh; /* 全屏高度 */
  background: #ffffff;
}


/* 左侧列表样式 */
.left-list {
  width: 30%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  height: 1279.2px; /* 关键：高度设置为右侧form高度 */
}

.list-content {
  height: calc(100% - 24px - 24px); /* 填满 left-list 高度 */
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

/* 右侧表单区域 */
.form-content{
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: #2563eb;
  border-width: 2px;
  flex: 1;
}

.right-form {
  flex: 1;
}

/* 表单分区样式 */
.form-section {
  padding: 1.5rem;
  background: #ebeff3;
  border-radius: 8px;
}

.section-title {
  font-size: 1.1rem;
  color: #2563eb;
  font-weight: 600;
  margin: 0rem;
  margin-bottom: 0.5rem;
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

/* 操作按钮组 */
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

/* 提交成功提示（全屏） */
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
  background: #475569; /* 与修改按钮同色 */
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