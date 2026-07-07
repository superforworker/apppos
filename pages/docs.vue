<template>
  <div class="api-container">
    <h1>📄 SIAMPOS - Full API Documentation</h1>
    <p>คู่มือการใช้งาน Endpoint API ทั้งหมดสำหรับระบบสตรีมข้อมูลร้านค้าและหน้าบ้าน</p>
    <hr>
    
    <div class="api-card">
      <h2>📊 ระบบสรุปแดชบอร์ดและการขาย</h2>
      <div class="endpoint-row">
        <span class="method-badge method-get" style="background:green; color:white; padding:2px 6px; border-radius:4px;">GET</span>
        <span>/st_pos_dashboard.php</span>
      </div>
      <p style="margin-top:5px; color:#64748b;">ดึงข้อมูลตัวเลขผลประกอบการ คำนวณยอดขายประจำวันเพื่อนำไปพล็อตกราฟ</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiDocsPage'
}
</script>