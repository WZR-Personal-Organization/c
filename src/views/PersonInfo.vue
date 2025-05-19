<template>
  <div>
    <h2>人员信息录入</h2>
    <!-- 这里添加人员信息录入的表单 -->
    <form>
      <label for="name">姓名:</label>
      <input type="text" id="name" name="name" />
      <br />
      <label for="age">年龄:</label>
      <input type="number" id="age" name="age" />
      <br />
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'PersonInfo'
}
</script>

<style scoped>
/* 这里添加样式 */
</style>