<template>
  <div class="app-bg min-vh-100 font-prompt">
    <!-- Navbar -->
    <header class="history-header shadow-sm">
      <div
        class="container-fluid max-w-1200 d-flex justify-content-between align-items-center"
      >
        <h1 class="h5 m-0 fw-bold text-white tracking-wide">
          SIAMPOS Order History
        </h1>
        <nuxt-link to="/" class="btn-nav">💻 กลับหน้าระบบ POS</nuxt-link>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container-fluid max-w-1200 py-4 py-md-5">
      <div class="card history-card border-0">
        <div class="card-body p-4 p-md-5">
          <!-- Filter Section -->
          <div class="row g-3 filter-section pb-4 mb-4">
            <div class="col-12 col-md-2 form-group">
              <label class="form-label">วันที่เริ่มต้น (Start Date)</label>
              <input
                type="date"
                v-model="filters.start"
                class="form-control custom-input"
              />
            </div>
            <div class="col-12 col-md-2 form-group">
              <label class="form-label">วันที่สิ้นสุด (End Date)</label>
              <input
                type="date"
                v-model="filters.end"
                class="form-control custom-input"
              />
            </div>
            <div class="col-12 col-md-3 form-group">
              <label class="form-label">เลขที่บิล (Ref)</label>
              <input
                type="text"
                v-model="filters.ref"
                class="form-control custom-input"
                placeholder="ค้นหาเลขอ้างอิง..."
              />
            </div>
            <div class="col-12 col-md-2 form-group">
              <label class="form-label">สถานะบิล</label>
              <select v-model="filters.status" class="form-select custom-input">
                <option value="">ทั้งหมด (All)</option>
                <option value="success">สำเร็จ (Success)</option>
                <option value="cancel">ยกเลิก (Cancel)</option>
              </select>
            </div>
            <div class="col-12 col-md-3 d-flex align-items-end form-group">
              <button
                class="btn btn-search w-100 shadow-sm"
                @click="fetchOrders"
                :disabled="isLoading"
              >
                <span
                  v-if="isLoading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                🔍 ดึงข้อมูล
              </button>
            </div>
          </div>

          <!-- Table Section -->
          <div class="table-wrapper">
            <table class="table data-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>วันที่-เวลา</th>
                  <th>เลขที่อ้างอิง (Ref)</th>
                  <th>เบอร์สมาชิก</th>
                  <th class="text-center">ช่องทาง</th>
                  <th class="text-end">ยอดสุทธิ</th>
                  <th class="text-center">สถานะ</th>
                  <th class="text-center">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="7" class="text-center text-muted py-4">
                    กำลังดึงข้อมูลจากเซิร์ฟเวอร์...
                  </td>
                </tr>
                <tr v-else-if="orders.length === 0">
                  <td colspan="7" class="text-center text-danger py-4">
                    ไม่พบข้อมูลรายการขายในช่วงเวลาดังกล่าว
                  </td>
                </tr>
                <tr v-else v-for="(order, index) in orders" :key="index">
                  <td>{{ order.date }} {{ order.time }}</td>
                  <td class="font-monospace text-dark">{{ order.ref }}</td>
                  <td>{{ order.member_phone || '-' }}</td>
                  <td class="text-center">
                    <span
                      :class="[
                        'custom-badge',
                        order.paymentMethod === 'cash'
                          ? 'badge-cash'
                          : 'badge-transfer',
                      ]"
                    >
                      {{
                        order.paymentMethod === 'cash' ? 'เงินสด' : 'สแกนจ่าย'
                      }}
                    </span>
                  </td>
                  <td class="text-end fw-bold text-dark">
                    ฿{{
                      Number(order.net_price).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })
                    }}
                  </td>
                  <td class="text-center">
                    <span
                      :class="[
                        'custom-badge',
                        order.bill_status === 'success'
                          ? 'badge-success'
                          : 'badge-cancel',
                      ]"
                    >
                      {{
                        order.bill_status === 'success'
                          ? 'สำเร็จ'
                          : 'ยกเลิกแล้ว'
                      }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button
                      class="btn btn-detail shadow-sm"
                      @click="openModal(order)"
                    >
                      👁️ ดูบิล
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal รายละเอียดบิล -->
    <div
      v-if="selectedOrder"
      class="custom-modal-overlay"
      @click.self="closeModal"
    >
      <div class="custom-modal-box">
        <div class="modal-header-custom">
          <span>รายละเอียดบิล (Order Details)</span>
          <button class="btn-close-modal" @click="closeModal">&times;</button>
        </div>
        <div class="custom-modal-body">
          <div class="order-info-grid">
            <div>
              <span>เลขที่อ้างอิง (Ref)</span
              ><strong>{{ selectedOrder.ref }}</strong>
            </div>
            <div>
              <span>วันที่และเวลา</span
              ><strong
                >{{ selectedOrder.date }} {{ selectedOrder.time }}</strong
              >
            </div>
            <div>
              <span>ช่องทางชำระเงิน</span
              ><strong>{{
                selectedOrder.paymentMethod === 'cash'
                  ? 'เงินสด (Cash)'
                  : 'สแกนจ่าย (Transfer)'
              }}</strong>
            </div>
            <div>
              <span>พนักงาน/ช่องทางขาย</span
              ><strong>{{ selectedOrder.chanel_id || '-' }}</strong>
            </div>
          </div>

          <div class="fw-bold mb-2 text-dark">รายการสินค้า:</div>
          <div class="items-list">
            <template
              v-if="
                selectedOrder.order_list && selectedOrder.order_list.length > 0
              "
            >
              <div
                v-for="(item, idx) in selectedOrder.order_list"
                :key="idx"
                class="item-row"
              >
                <div>
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-qty">
                    {{ item.qty }} x ฿{{ Number(item.price).toFixed(2) }}
                  </div>
                </div>
                <div class="item-price">
                  ฿{{ (item.price * item.qty).toFixed(2) }}
                </div>
              </div>
            </template>
            <div v-else class="text-danger small">ไม่พบข้อมูลสินค้า</div>
          </div>

          <div class="summary-box">
            <div class="summary-row">
              <span>ยอดรวม (Subtotal)</span>
              <span
                >฿{{
                  Number(selectedOrder.total_price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })
                }}</span
              >
            </div>
            <div class="summary-row">
              <span>ส่วนลด (Discount)</span>
              <span
                >฿{{
                  Number(selectedOrder.discount_amount).toLocaleString(
                    'en-US',
                    { minimumFractionDigits: 2 }
                  )
                }}</span
              >
            </div>
            <div class="summary-row total">
              <span>ยอดสุทธิ (Net Total)</span>
              <span
                >฿{{
                  Number(selectedOrder.net_price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })
                }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: 'SIAMPOS - Order History',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap',
        },
      ],
    }
  },
  data() {
    return {
      isLoading: false,
      filters: {
        start: '',
        end: '',
        ref: '',
        status: '',
      },
      orders: [],
      selectedOrder: null,
    }
  },
  mounted() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0]
    this.filters.start = today
    this.filters.end = today
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      this.isLoading = true

      // จำลองการโหลด API (ลบ setTimeout ออกแล้วใช้ this.$axios.$get ในของจริง)
      // setTimeout(() => {
      //   this.orders = [
      //     {
      //       date: '2026-07-10',
      //       time: '11:05:29',
      //       ref: 'OD-03960-3539',
      //       member_phone: '-',
      //       paymentMethod: 'cash',
      //       chanel_id: 'หน้าร้าน',
      //       total_price: 10.0,
      //       discount_amount: 0.0,
      //       net_price: 10.0,
      //       bill_status: 'success',
      //       order_list: [{ name: 'สินค้าตัวอย่าง A', qty: 1, price: 10.0 }],
      //     },
      //   ]
      //   this.isLoading = false
      // }, 500)

      //  โค้ดสำหรับใช้งานจริง:
      try {
        const res = await this.$axios.$get('https://admin.siampos.co/res/st_orders.php', { 
          params: {
            datestart: this.filters.start,
            dateend: this.filters.end,
            ref: this.filters.ref,
            bill_status: this.filters.status
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('siampos_auth_token')}` }
        });
        this.orders = res.data || [];
      } catch (error) {
        console.error(error);
        this.orders = [];
      } finally {
        this.isLoading = false;
      }
      
    },
    openModal(order) {
      this.selectedOrder = order
      document.body.style.overflow = 'hidden' // ป้องกันการ scroll ข้างหลัง modal
    },
    closeModal() {
      this.selectedOrder = null
      document.body.style.overflow = 'auto'
    },
  },
}
</script>

<style scoped>
.font-prompt {
  font-family: 'Prompt', sans-serif;
}
.app-bg {
  background-color: #f1f5f9;
}
.max-w-1200 {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.history-header {
  background: #0f172a;
  padding: 15px 25px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.tracking-wide {
  letter-spacing: 0.05em;
}
.btn-nav {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}
.btn-nav:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* Card & Filter */
.history-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.filter-section {
  border-bottom: 2px dashed #e2e8f0;
}
.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 5px;
}
.custom-input {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 5px;
  transition: border-color 0.2s;
}
.custom-input:focus {
  border-color: #f97316; /* สีส้ม */
  background-color: #ffffff;
  box-shadow: none;
}
.btn-search {
  background-color: #f97316; /* สีส้มตามรูป */
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  height: 45px;
  transition: background-color 0.2s;
}
.btn-search:hover,
.btn-search:focus {
  background-color: #ea580c;
  color: #fff;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.data-table th {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 600;
  padding: 15px;
  white-space: nowrap;
  border-bottom: 1px solid #e2e8f0;
}
.data-table td {
  padding: 15px;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
}

/* Badges */
.custom-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}
.badge-success {
  background: #dcfce7;
  color: #166534;
}
.badge-cancel {
  background: #fee2e2;
  color: #991b1b;
}
.badge-cash {
  background: #dbeafe;
  color: #1e40af;
}
.badge-transfer {
  background: #fef3c7;
  color: #b45309;
}

/* Buttons */
.btn-detail {
  background-color: #f1f5f9;
  color: #2563eb;
  border: 1px solid #cbd5e1;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-detail:hover {
  background-color: #e2e8f0;
  color: #1d4ed8;
}

/* Modal Custom */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.75);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}
.custom-modal-box {
  background-color: #ffffff;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}
.modal-header-custom {
  background-color: #0f172a;
  color: #ffffff;
  padding: 15px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
}
.btn-close-modal {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.8rem;
  cursor: pointer;
  line-height: 1;
}
.custom-modal-body {
  padding: 20px;
  overflow-y: auto;
}
.order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
}
.order-info-grid span {
  color: #64748b;
  display: block;
  font-size: 0.85rem;
}
.order-info-grid strong {
  color: #1e293b;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.95rem;
}
.item-name {
  font-weight: 500;
  color: #1e293b;
}
.item-qty {
  color: #64748b;
  font-size: 0.85rem;
}
.item-price {
  font-weight: 600;
  color: #1e293b;
}

.summary-box {
  margin-top: 20px;
  border-top: 2px solid #e2e8f0;
  padding-top: 15px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.95rem;
  color: #64748b;
}
.summary-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f97316;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>