<template>
  <div class="app-bg min-vh-100 font-prompt pb-5">
    
    <header class="dash-header shadow-sm">
      <div class="container-fluid max-w-1400 d-flex justify-content-between align-items-center">
        <h1 class="h5 m-0 fw-bold text-white tracking-wide">SIAMPOS Analytics</h1>
        <nuxt-link to="/" class="btn-nav">💻 กลับหน้าระบบ POS</nuxt-link>
      </div>
    </header>

    <div class="container-fluid max-w-1400 mt-4">
      
      <div class="card custom-card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-12 col-md-4 col-lg-3">
              <label class="form-label text-muted small fw-medium">วันที่เริ่มต้น (Start Date)</label>
              <input type="date" v-model="filters.start" class="form-control custom-input">
            </div>
            <div class="col-12 col-md-4 col-lg-3">
              <label class="form-label text-muted small fw-medium">วันที่สิ้นสุด (End Date)</label>
              <input type="date" v-model="filters.end" class="form-control custom-input">
            </div>
            <div class="col-12 col-md-4 col-lg-3 d-flex align-items-end">
              <button class="btn btn-search w-100 shadow-sm" @click="fetchData" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span v-else>🔍</span> ค้นหาและอัปเดตข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card custom-card kpi-card kpi-sales">
            <div class="card-body">
              <div class="kpi-title">ยอดขายสุทธิรวม (บาท)</div>
              <div class="kpi-value">฿{{ Number(summary.total_sales).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card custom-card kpi-card kpi-orders">
            <div class="card-body">
              <div class="kpi-title">จำนวนบิลที่สำเร็จ (ออเดอร์)</div>
              <div class="kpi-value">{{ summary.total_orders }}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card custom-card kpi-card kpi-avg">
            <div class="card-body">
              <div class="kpi-title">ยอดใช้จ่ายเฉลี่ยต่อบิล (บาท)</div>
              <div class="kpi-value">฿{{ Number(summary.avg_per_bill).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card custom-card kpi-card kpi-void">
            <div class="card-body">
              <div class="kpi-title">จำนวนบิลที่ยกเลิก (Void)</div>
              <div class="kpi-value">{{ summary.total_void }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-12 col-lg-8">
          <div class="card custom-card h-100">
            <div class="card-body">
              <h5 class="panel-header">📈 แนวโน้มยอดขายรายชั่วโมง</h5>
              <div class="chart-container">
                <canvas id="salesTrendChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="card custom-card h-100">
            <div class="card-body">
              <h5 class="panel-header">💳 สัดส่วนช่องทางชำระเงิน</h5>
              <div class="chart-container d-flex justify-content-center align-items-center">
                <canvas id="paymentMethodChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-6">
          <div class="card custom-card h-100">
            <div class="card-body">
              <h5 class="panel-header">🔥 5 อันดับสินค้าขายดี (นับจากจำนวนชิ้น)</h5>
              <div class="table-responsive">
                <table class="table dash-table align-middle">
                  <thead>
                    <tr>
                      <th>อันดับ</th>
                      <th>ชื่อสินค้า</th>
                      <th class="text-end">จำนวน (ชิ้น)</th>
                      <th class="text-end">ยอดรวม (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="isLoading">
                      <td colspan="4" class="text-center text-muted py-4">กำลังโหลดข้อมูล...</td>
                    </tr>
                    <tr v-else-if="topProducts.length === 0">
                      <td colspan="4" class="text-center text-muted py-4">ยังไม่มีข้อมูลสินค้า</td>
                    </tr>
                    <tr v-else v-for="product in topProducts" :key="product.rank">
                      <td class="fw-bold text-dark">#{{ product.rank }}</td>
                      <td>{{ product.name }}</td>
                      <td class="text-end">{{ product.qty }}</td>
                      <td class="text-end fw-bold text-orange">฿{{ Number(product.total).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="card custom-card h-100">
            <div class="card-body">
              <h5 class="panel-header">🕒 รายการขายล่าสุด 10 รายการ</h5>
              <div class="table-responsive">
                <table class="table dash-table align-middle">
                  <thead>
                    <tr>
                      <th>เลขที่บิล (Ref)</th>
                      <th>วันที่/เวลา</th>
                      <th class="text-center">สถานะ/ช่องทาง</th>
                      <th class="text-end">ยอดสุทธิ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="isLoading">
                      <td colspan="4" class="text-center text-muted py-4">กำลังโหลดข้อมูล...</td>
                    </tr>
                    <tr v-else-if="recentTransactions.length === 0">
                      <td colspan="4" class="text-center text-muted py-4">ยังไม่มีรายการขาย</td>
                    </tr>
                    <tr v-else v-for="trx in recentTransactions" :key="trx.ref">
                      <td class="font-monospace text-muted small">{{ trx.ref }}</td>
                      <td class="small">{{ trx.date }} {{ trx.time }}</td>
                      <td class="text-center">
                        <span v-if="trx.bill_status === 'cancel'" class="badge rounded-pill px-3 bg-danger">ยกเลิก (Void)</span>
                        <span v-else :class="['badge rounded-pill px-3', trx.method === 'cash' ? 'bg-primary' : 'bg-success']">
                          {{ trx.method === 'cash' ? 'เงินสด' : 'สแกนจ่าย' }}
                        </span>
                      </td>
                      <td :class="['text-end fw-bold', trx.bill_status === 'cancel' ? 'text-danger text-decoration-line-through' : 'text-dark']">
                        ฿{{ Number(trx.total).toLocaleString('en-US', {minimumFractionDigits: 2}) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  head() {
    return {
      title: 'SIAMPOS - Dashboard Analytics',
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },
  data() {
    return {
      isLoading: false,
      filters: { start: '', end: '' },
      
      // โครงสร้างข้อมูลตาม API ตอบกลับ
      summary: { total_sales: 0, total_orders: 0, avg_per_bill: 0, total_void: 0 },
      salesTrend: { labels: [], data: [] },
      paymentMethods: { cash: 0, transfer: 0 },
      topProducts: [],
      recentTransactions: [],
      
      // Chart Instances
      chartLineInstance: null,
      chartDoughnutInstance: null
    }
  },
  mounted() {
    // กำหนดวันที่เริ่มต้นเป็นวันนี้
    const today = new Date().toISOString().split('T')[0];
    this.filters.start = today;
    this.filters.end = today;
    
    // ดึงข้อมูลเมื่อโหลดหน้าเว็บ
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      try {
        const token = localStorage.getItem('siampos_auth_token') || '';
        
        // ต่อ API จริงด้วย query string วันที่
        const url = `https://admin.siampos.co/res/st_pos_dashboard.php?datestart=${this.filters.start}&dateend=${this.filters.end}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();

        if (result.status === 'success' && result.data) {
          const d = result.data;
          
          // นำข้อมูลลง State
          this.summary = d.summary || this.summary;
          this.salesTrend = d.sales_trend || this.salesTrend;
          this.paymentMethods = d.payment_methods || this.paymentMethods;
          this.topProducts = d.top_products || [];
          this.recentTransactions = d.recent_transactions || [];
          
          // วาดกราฟใหม่
          this.renderCharts();
        } else {
          console.warn("API ไม่ส่งสถานะ success หรือไม่มีข้อมูล");
          this.clearData();
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard:", error);
        this.clearData();
      } finally {
        this.isLoading = false;
      }
    },
    clearData() {
      this.summary = { total_sales: 0, total_orders: 0, avg_per_bill: 0, total_void: 0 };
      this.topProducts = [];
      this.recentTransactions = [];
      this.salesTrend = { labels: [], data: [] };
      this.paymentMethods = { cash: 0, transfer: 0 };
      this.renderCharts();
    },
    renderCharts() {
      // 1. Line Chart (แนวโน้มยอดขายรายชั่วโมง)
      if (this.chartLineInstance) this.chartLineInstance.destroy();
      const ctxLine = document.getElementById('salesTrendChart').getContext('2d');
      this.chartLineInstance = new Chart(ctxLine, {
        type: 'line',
        data: {
          labels: this.salesTrend.labels.length ? this.salesTrend.labels : ['08:00', '09:00', '10:00', '11:00', '12:00'],
          datasets: [{
            label: 'ยอดขายรวมในชั่วโมงนี้ (บาท)',
            data: this.salesTrend.data.length ? this.salesTrend.data : [0, 0, 0, 0, 0],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#3b82f6',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, border: { dash: [5, 5] } },
            x: { grid: { display: false } }
          }
        }
      });

      // 2. Doughnut Chart (สัดส่วนช่องทางชำระเงิน)
      if (this.chartDoughnutInstance) this.chartDoughnutInstance.destroy();
      const ctxDoughnut = document.getElementById('paymentMethodChart').getContext('2d');
      
      const transferVal = this.paymentMethods.transfer || 0;
      const cashVal = this.paymentMethods.cash || 0;
      // ถ้าไม่มีข้อมูลเลย ให้แสดงเป็นกราฟเปล่าสีเทา
      const noData = (transferVal === 0 && cashVal === 0);

      this.chartDoughnutInstance = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
          labels: ['สแกนจ่าย (Transfer)', 'เงินสด (Cash)'],
          datasets: [{
            data: noData ? [1] : [transferVal, cashVal],
            backgroundColor: noData ? ['#e2e8f0'] : ['#10b981', '#3b82f6'],
            borderWidth: 0,
            hoverOffset: noData ? 0 : 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            tooltip: { enabled: !noData },
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'Prompt' } } }
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.font-prompt { font-family: 'Prompt', sans-serif; }
.app-bg { background-color: #f1f5f9; }
.max-w-1400 { max-width: 1400px; margin: 0 auto; }

/* Header */
.dash-header { background: #0f172a; padding: 15px 25px; position: sticky; top: 0; z-index: 100; }
.tracking-wide { letter-spacing: 0.05em; }
.btn-nav { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; transition: background 0.2s; }
.btn-nav:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }

/* Cards */
.custom-card { border-radius: 12px; border: none; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03); background: #fff; }
.kpi-card { border-top: 4px solid #cbd5e1; }
.kpi-sales { border-top-color: #f97316; }
.kpi-orders { border-top-color: #10b981; }
.kpi-avg { border-top-color: #facc15; }
.kpi-void { border-top-color: #ef4444; }

.kpi-title { color: #64748b; font-size: 0.95rem; font-weight: 500; margin-bottom: 5px; }
.kpi-value { color: #1e293b; font-size: 2rem; font-weight: 700; letter-spacing: -0.5px; }

/* Filter */
.custom-input { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 15px; }
.custom-input:focus { border-color: #f97316; background-color: #ffffff; box-shadow: 0 0 0 0.2rem rgba(249, 115, 22, 0.15); }
.btn-search { background-color: #f97316; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; height: 45px; transition: all 0.2s; }
.btn-search:hover { background-color: #ea580c; color: #fff; }

/* Charts Area */
.panel-header { font-size: 1.05rem; font-weight: 600; color: #1e293b; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #e2e8f0; }
.chart-container { position: relative; height: 280px; width: 100%; }

/* Tables */
.dash-table th { color: #64748b; font-weight: 600; font-size: 0.9rem; border-bottom: 1px dashed #e2e8f0; padding-bottom: 12px; }
.dash-table td { padding: 12px 8px; border-bottom: 1px dashed #f1f5f9; font-size: 0.95rem; }
.text-orange { color: #f97316; }
</style>