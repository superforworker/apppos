<template>
  <div>
    <header class="dash-header">
      <div class="dash-title-group">
        <NuxtLink to="/" class="back-btn">⬅️ กลับหน้าขาย</NuxtLink>
        <h1>📊 สรุปยอดขาย & แดชบอร์ด</h1>
      </div>
    </header>

    <div class="dash-container">
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>ยอดขายวันนี้</h3>
          <p class="value">฿{{ summary.today_sales | formatMoney }}</p>
        </div>
        <div class="metric-card">
          <h3>จำนวนออเดอร์</h3>
          <p class="value">{{ summary.total_orders }} รายการ</p>
        </div>
      </div>

      <div class="chart-section" style="margin-top: 2rem;">
        <h3>📈 กราฟแสดงแนวโน้มยอดขาย</h3>
        <canvas ref="salesChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
// เปลี่ยนมานำเข้าแบบดั้งเดิมที่ Webpack 4 เข้าใจ และสั่ง Register ชิ้นส่วนทั้งหมดด้วยตัวเอง
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  filters: {
    formatMoney(value) {
      return parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
  },
  data() {
    return {
      summary: {
        today_sales: 0,
        total_orders: 0
      },
      chartInstance: null
    }
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      const res = await this.$apiRequest('/st_pos_dashboard.php'); // แก้ไข Endpoint ตามจริงของคุณ
      if (res && res.status === 'success') {
        this.summary = res.data.summary;
        this.renderChart(res.data.chartLabels, res.data.chartValues);
      }
    },
    renderChart(labels, values) {
      if (this.chartInstance) this.chartInstance.destroy();
      
      const ctx = this.$refs.salesChart.getContext('2d');
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels || ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [{
            label: 'ยอดขายรายชั่วโมง',
            data: values || [0, 0, 1200, 4500, 2300, 0],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true
          }]
        }
      });
    }
  }
}
</script>