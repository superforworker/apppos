<template>
  <div class="dash-wrapper">
    <header class="dash-header">
      <div class="dash-title-group">
        <NuxtLink to="/" class="back-btn">⬅️ กลับหน้าขาย</NuxtLink>
        <h1>📊 สรุปยอดขาย & แดชบอร์ด</h1>
      </div>
    </header>

    <div class="dash-container">
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>ยอดขายรวม</h3>
          <p class="value">฿{{ summary.total_sales | formatMoney }}</p>
        </div>
        <div class="metric-card">
          <h3>จำนวนออเดอร์</h3>
          <p class="value">{{ summary.total_orders }} รายการ</p>
        </div>
        <div class="metric-card">
          <h3>ยอดเฉลี่ยต่อบิล</h3>
          <p class="value">฿{{ summary.avg_per_bill | formatMoney }}</p>
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
      summary: { total_sales: 0, total_orders: 0, avg_per_bill: 0 },
      chartInstance: null
    }
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      // ปรับปรุงให้ดึงจาก Endpoint จริงและใช้โครงสร้างข้อมูลใหม่
      const res = await this.$apiRequest('/st_pos_dashboard.php'); 
      if (res && res.status === 'success') {
        this.summary = res.data.summary;
        // ส่งข้อมูล labels และ data จาก sales_trend ตามโครงสร้าง JSON ใหม่
        this.renderChart(res.data.sales_trend.labels, res.data.sales_trend.data);
      }
    },
    renderChart(labels, values) {
      if (this.chartInstance) this.chartInstance.destroy();
      
      const ctx = this.$refs.salesChart.getContext('2d');
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'ยอดขายรายชั่วโมง (บาท)',
            data: values,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.3, // ทำให้เส้นโค้งมนสวยงาม
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }
}
</script>