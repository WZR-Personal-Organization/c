<template>
  <div>
    <h2>车辆信息录入</h2>
    <!-- 这里添加车辆信息录入的表单 -->
    <form>
      <label for="licensePlate">车牌号:</label>
      <input type="text" id="licensePlate" name="licensePlate" />
      <br />
      <label for="brand">品牌:</label>
      <input type="text" id="brand" name="brand" />
      <br />
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'VehicleInfo'
}
</script>

<style scoped>
/* 这里添加样式 */
</style>