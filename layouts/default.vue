<template>
  <div>
    <Nuxt />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
  mounted() {
    // ปลดล็อกการเลื่อนหน้าจอตามความเหมาะสมของหน้าย่อย
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    document.body.style.backgroundColor = '#f1f5f9';
    document.body.style.display = 'block';
  }
}
</script>