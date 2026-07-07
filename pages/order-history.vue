<template>
  <div>
    <header class="history-header">
      <div class="history-title-group">
        <NuxtLink to="/" class="back-btn">⬅️ หน้าขาย POS</NuxtLink>
        <h1>📜 ประวัติการสั่งซื้อ (Order History)</h1>
      </div>
    </header>

    <div class="history-container">
      <table class="bo-table">
        <thead>
          <tr>
            <th>เลขอ้างอิง</th>
            <th>วันที่/เวลา</th>
            <th>ยอดสุทธิ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.ref }}</td>
            <td>{{ order.date }} {{ order.time }}</td>
            <td>฿{{ parseFloat(order.net_price).toFixed(2) }}</td>
            <td>{{ order.bill_status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      orders: []
    }
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      // เรียกข้อมูลประวัติย้อนหลังตามช่วงวันที่ระบุ
      const res = await this.$apiRequest('/st_orders.php?datestart=2026-01-01&dateend=2026-12-31');
      if (res && res.data) {
        this.orders = res.data;
      }
    }
  }
}
</script>