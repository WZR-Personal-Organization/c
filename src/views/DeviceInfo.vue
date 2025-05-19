<template>
  <div>
    <h2>设备信息录入</h2>
    <!-- 这里添加设备信息录入的表单 -->
    <form>
      <label for="deviceName">设备名称:</label>
      <input type="text" id="deviceName" name="deviceName" />
      <br />
      <label for="model">型号:</label>
      <input type="text" id="model" name="model" />
      <br />
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'DeviceInfo'
}
</script>

<style scoped>
/* 这里添加样式 */
</style>