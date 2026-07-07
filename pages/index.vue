<template>
  <div class="pos-wrapper">
    <div v-if="isLoading" id="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div id="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        {{ toast.message }}
      </div>
    </div>

    <div id="pos-screen" style="display: flex">
      <header>
        <h1 id="header-title">{{ companyName }}</h1>
        <div class="header-actions">
          <button class="header-btn fullscreen" @click="toggleFullScreen">
            {{ isFullScreen ? 'ย่อหน้าจอ' : 'เต็มจอ' }}
          </button>
          <button class="header-btn" @click="$router.push('/backoffice')">
            จัดการ
          </button>
          <button class="header-btn" @click="logout">ออก</button>
        </div>
      </header>

      <div class="main-container">
        <div class="products-area">
          <div class="control-panel">
            <div class="search-box">
              <input
                type="text"
                v-model="searchQuery"
                class="search-input"
                placeholder="🔍 ค้นหาสินค้า..."
              />
            </div>

            <div
              class="category-bar"
              ref="categoryBar"
              @mousedown="startDrag"
              @mouseleave="endDrag"
              @mouseup="endDrag"
              @mousemove="onDrag"
            >
              <button
                v-for="cat in categories"
                :key="cat.id"
                :class="[
                  'category-btn',
                  { active: currentCategory === cat.id },
                ]"
                @click="currentCategory = cat.id"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <div class="products-section">
            <div
              v-if="filteredProducts.length === 0"
              style="
                grid-column: 1 / -1;
                text-align: center;
                color: var(--text-muted);
                padding: 2rem;
              "
            >
              ไม่พบสินค้าที่ค้นหา
            </div>
            <div
              v-else
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
              @click="addToCart(product)"
            >
              <img
                :src="product.image"
                :alt="product.name"
                class="product-image"
                loading="lazy"
              />
              <h3>{{ product.name }}</h3>
              <p>฿{{ product.price.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div class="cart-section">
          <div
            class="cart-header"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span>รายการสั่งซื้อปัจจุบัน</span>
            <button class="btn-clear-cart" @click="clearCart">
              ล้างตะกร้า
            </button>
          </div>

          <div class="cart-items">
            <div
              v-for="(item, index) in cart"
              :key="item.id"
              class="cart-item"
              style="
                background: var(--bg-main);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                padding: 10px;
                margin-bottom: 10px;
              "
            >
              <div
                style="
                  display: flex;
                  gap: 12px;
                  margin-bottom: 10px;
                  align-items: flex-start;
                "
              >
                <img
                  :src="item.image"
                  style="
                    width: 45px;
                    height: 45px;
                    object-fit: cover;
                    border-radius: 6px;
                    border: 1px solid #cbd5e1;
                    flex-shrink: 0;
                  "
                />
                <div style="flex: 1; min-width: 0">
                  <strong
                    style="
                      color: #0f172a;
                      display: block;
                      font-size: 0.95rem;
                      white-space: normal;
                      word-break: break-word;
                      line-height: 1.2;
                      margin-bottom: 4px;
                    "
                    >{{ item.name }}</strong
                  >
                  <span style="font-size: 0.85rem; color: #64748b"
                    >฿{{ item.price.toFixed(2) }} / ชิ้น</span
                  >
                </div>
                <button
                  @click="removeFromCart(index)"
                  style="
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0 5px;
                  "
                >
                  ✕
                </button>
              </div>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-top: 1px dashed #e2e8f0;
                  padding-top: 8px;
                "
              >
                <div
                  style="
                    display: flex;
                    align-items: center;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    overflow: hidden;
                  "
                >
                  <button
                    @click="updateCartQty(index, -1)"
                    style="
                      background: #f1f5f9;
                      border: none;
                      width: 30px;
                      height: 30px;
                      font-weight: bold;
                      cursor: pointer;
                      color: #0f172a;
                    "
                  >
                    -
                  </button>
                  <span
                    style="
                      width: 35px;
                      text-align: center;
                      font-weight: 600;
                      font-size: 0.95rem;
                      color: #0f172a;
                      background: #ffffff;
                      line-height: 30px;
                    "
                    >{{ item.qty }}</span
                  >
                  <button
                    @click="updateCartQty(index, 1)"
                    style="
                      background: #f1f5f9;
                      border: none;
                      width: 30px;
                      height: 30px;
                      font-weight: bold;
                      cursor: pointer;
                      color: #0f172a;
                    "
                  >
                    +
                  </button>
                </div>
                <span
                  style="font-weight: 700; font-size: 1.1rem; color: #ea580c"
                  >฿{{ (item.price * item.qty).toFixed(2) }}</span
                >
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-sub-row">
              <span>ยอดรวม (Subtotal)</span>
              <span>฿{{ cartSubTotal.toFixed(2) }}</span>
            </div>
            <div class="summary-sub-row">
              <label class="vat-toggle-label">
                <input
                  type="checkbox"
                  v-model="isVatEnabled"
                  class="vat-toggle-checkbox"
                />
                ภาษีมูลค่าเพิ่ม (VAT 7%)
              </label>
              <span>฿{{ cartVatAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>ยอดสุทธิ</span>
              <span>฿{{ cartGrandTotal.toFixed(2) }}</span>
            </div>
            <button class="checkout-btn" @click="processCheckout">
              ชำระเงิน
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="paymentModalVisible" style="display: flex">
      <div class="modal-box">
        <div v-if="!successModalVisible">
          <div class="modal-header">สรุปยอดชำระเงิน</div>
          <div class="modal-body">
            <div class="payment-row">
              <span>ยอดรวม (Subtotal):</span>
              <span>฿{{ cartSubTotal.toFixed(2) }}</span>
            </div>
            <div class="payment-row">
              <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
              <span>฿{{ cartVatAmount.toFixed(2) }}</span>
            </div>
            <div class="payment-row total">
              <span>ยอดสุทธิที่ต้องชำระ:</span>
              <span>฿{{ cartGrandTotal.toFixed(2) }}</span>
            </div>
            <div
              style="
                margin-bottom: 0.8rem;
                font-weight: 600;
                color: var(--text-main);
              "
            >
              เบอร์สมาชิก (Member Phone)
            </div>
            <input
              type="tel"
              v-model="memberPhone"
              placeholder="กรอกเบอร์โทรศัพท์ (ถ้ามี)"
              style="
                width: 100%;
                padding: 16px;
                border-radius: var(--radius-md);
                border: 2px solid var(--border-color);
                font-size: 1.1rem;
                font-family: 'Prompt', sans-serif;
                margin-bottom: 1.5rem;
                color: var(--text-main);
                background-color: #f8fafc;
                box-sizing: border-box;
                outline: none;
                transition: all 0.3s;
              "
              onfocus="this.style.borderColor='var(--primary-color)'; this.style.backgroundColor='#ffffff';"
              onblur="this.style.borderColor='var(--border-color)'; this.style.backgroundColor='#f8fafc';"
            />
            <div
              style="
                margin-bottom: 0.8rem;
                font-weight: 600;
                color: var(--text-main);
              "
            >
              วิธีการชำระเงิน
            </div>
            <select
              class="payment-type-select"
              v-model="paymentMethod"
              @change="resetWarningUI"
            >
              <option value="cash">เงินสด (Cash)</option>
              <option value="scan">สแกนจ่าย (QR PromptPay)</option>
            </select>

            <div v-if="paymentMethod === 'cash'">
              <div
                style="
                  margin-bottom: 0.8rem;
                  font-weight: 600;
                  color: var(--text-main);
                "
              >
                รับเงินสด (บาท)
              </div>
              <input
                type="number"
                class="input-received"
                v-model="amountReceived"
                placeholder="0.00"
                ref="receivedInput"
                :style="{ borderColor: receivedInputColor }"
              />
              <div
                v-if="isAmountWarning"
                style="
                  color: var(--danger-color);
                  font-size: 0.95rem;
                  margin-top: 8px;
                  text-align: right;
                  font-weight: 500;
                "
              >
                * จำนวนเงินรับมาไม่เพียงพอ
              </div>

              <div
                style="
                  margin-top: 1.5rem;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                "
              >
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                  "
                >
                  <span
                    style="
                      font-weight: 600;
                      font-size: 1.2rem;
                      color: var(--text-main);
                    "
                    >เงินทอน:</span
                  >
                  <span
                    class="change-display"
                    :style="{ color: changeAmountColor }"
                    >฿{{ changeAmount.toFixed(2) }}</span
                  >
                </div>
                <div
                  v-if="changeAmount > 0"
                  class="change-breakdown-box"
                  style="display: block"
                  v-html="changeBreakdown"
                ></div>
              </div>
            </div>

            <div
              v-else
              style="
                text-align: center;
                padding: 1.5rem;
                background: #f8fafc;
                border-radius: var(--radius-md);
                border: 1px dashed #cbd5e1;
              "
            >
              <span
                style="
                  color: var(--primary-color);
                  font-weight: 600;
                  font-size: 1.1rem;
                "
                >รอสแกนชำระเงิน...</span
              >
              <p
                style="
                  font-size: 0.95rem;
                  color: var(--text-muted);
                  margin-top: 8px;
                "
              >
                ระบบกำลังตรวจสอบยอดเงินเข้า<br />หรือกด "ยืนยันการชำระเงิน"
                หากโอนสำเร็จแล้ว
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-block btn-success" @click="submitPayment">
              ยืนยันการชำระเงิน
            </button>
            <button class="btn-block btn-secondary" @click="closePaymentModal">
              ยกเลิก / กลับ
            </button>
          </div>
        </div>

        <div v-else>
          <div class="success-screen">
            <div class="success-icon">✓</div>
            <h2>ชำระเงินสำเร็จเรียบร้อย</h2>
            <p
              style="
                margin: 15px 0;
                color: var(--text-muted);
                font-size: 1.05rem;
              "
              v-html="successDetailText"
            ></p>
          </div>
          <div class="modal-footer">
            <button class="btn-block btn-primary" @click="printReceiptAction">
              🖨️ พิมพ์ใบเสร็จรับเงิน
            </button>
            <button class="btn-block btn-secondary" @click="resetOrderAndClose">
              เริ่มออเดอร์ใหม่
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      id="receipt-print-area"
      style="display: none; font-family: sans-serif; line-height: 1.4"
    >
      <div
        class="receipt-header"
        style="text-align: center; margin-bottom: 10px"
      >
        <h2 style="margin: 0 0 2px 0; font-size: 16px; font-weight: bold">
          {{ companyInfo.name || 'SIAMPOS' }}
        </h2>
        <p
          v-if="companyInfo.acc_maincom_name"
          style="margin: 2px 0; font-size: 13px"
        >
          {{ companyInfo.acc_maincom_name }}
        </p>
        <p style="margin: 2px 0; font-size: 13px">{{ formattedAddress }}</p>
        <p v-if="companyInfo.acc_vat" style="margin: 2px 0; font-size: 13px">
          เลขผู้เสียภาษี {{ companyInfo.acc_vat }}
        </p>
        <p v-if="companyInfo.acc_phone" style="margin: 2px 0; font-size: 13px">
          โทร. {{ companyInfo.acc_phone }}
        </p>
        <hr
          style="border: none; border-top: 1px solid #000; margin: 8px 0 4px 0"
        />
        <p
          style="
            margin: 2px 0;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
          "
        >
          ใบกำกับภาษีอย่างย่อ/ใบเสร็จรับเงิน
        </p>
        <p style="margin: 2px 0; font-size: 13px; text-align: left">
          Ref: {{ receiptData.ref }}
        </p>
        <p style="margin: 4px 0; border-top: 1px dashed #000; height: 0"></p>
        <div
          style="
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-top: 4px;
          "
        >
          <span style="font-weight: bold">พนักงานขาย</span>
          <span>{{ currentUsername }}</span>
        </div>
        <hr
          style="border: none; border-top: 1px solid #000; margin: 4px 0 8px 0"
        />
      </div>
      <table
        class="receipt-table"
        style="
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
          font-size: 12px;
        "
      >
        <thead>
          <tr>
            <th style="text-align: left; padding: 2px 0; width: 55%">รายการ</th>
            <th style="text-align: center; padding: 2px 0; width: 15%">จน.</th>
            <th style="text-align: right; padding: 2px 0; width: 30%">รวม</th>
          </tr>
        </thead>
        <tbody style="border-top: 1px dashed black">
          <tr v-for="item in receiptData.items" :key="item.id">
            <td class="item-name-col" style="text-align: left; padding: 4px 0">
              {{ item.name }}
            </td>
            <td style="text-align: center; padding: 4px 0">{{ item.qty }}</td>
            <td style="text-align: right; padding: 4px 0">
              {{ (item.price * item.qty).toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
      <div
        style="
          border-top: 1px dashed black;
          margin-top: 5px;
          margin-bottom: 5px;
        "
      ></div>
      <div class="receipt-total-section" style="font-size: 12px">
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          "
        >
          <span>ยอดรวม:</span
          ><span>{{ receiptData.subtotal?.toFixed(2) }}</span>
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          "
        >
          <span>ภาษี:</span><span>{{ receiptData.vat?.toFixed(2) }}</span>
        </div>
        <div
          style="
            border-top: 1px dashed black;
            margin-top: 5px;
            margin-bottom: 5px;
          "
        ></div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-weight: bold;
            font-size: 14px;
          "
        >
          <span>สุทธิ:</span><span>{{ receiptData.total?.toFixed(2) }}</span>
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            margin-top: 5px;
          "
        >
          <span>ช่องทาง:</span><span>{{ receiptData.method }}</span>
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          "
        >
          <span>รับเงิน:</span
          ><span>{{ receiptData.received?.toFixed(2) }}</span>
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          "
        >
          <span>เงินทอน:</span><span>{{ receiptData.change?.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PosScreen',
  data() {
    return {
      apiBaseUrl: 'https://admin.siampos.co/res',
      currentAuthToken: '',
      currentUsername: '',
      companyName: 'SIAMPOS',
      companyInfo: {},
      memberPhone: '',
      isLoading: false,
      toasts: [],
      isFullScreen: false,

      categories: [{ id: 'all', name: 'ทั้งหมด' }],
      products: [],
      currentCategory: 'all',
      searchQuery: '',

      cart: [],
      isVatEnabled: false,
      vatRate: 0.07,

      paymentModalVisible: false,
      successModalVisible: false,
      paymentMethod: 'cash',
      amountReceived: '',

      receiptData: {},

      // Drag to scroll variables
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
    }
  },
  computed: {
    filteredProducts() {
      const query = this.searchQuery.toLowerCase().trim()
      return this.products.filter((p) => {
        const matchCategory =
          this.currentCategory === 'all' || p.category === this.currentCategory
        const matchSearch = p.name.toLowerCase().includes(query)
        return matchCategory && matchSearch
      })
    },
    cartSubTotal() {
      return this.cart.reduce((total, item) => total + item.price * item.qty, 0)
    },
    cartVatAmount() {
      return this.isVatEnabled ? this.cartSubTotal * this.vatRate : 0
    },
    cartGrandTotal() {
      return this.cartSubTotal + this.cartVatAmount
    },
    parsedAmountReceived() {
      return parseFloat(this.amountReceived) || 0
    },
    changeAmount() {
      if (this.amountReceived === '') return 0
      const change = this.parsedAmountReceived - this.cartGrandTotal
      return change > 0 ? change : 0
    },
    isAmountWarning() {
      return (
        this.amountReceived !== '' &&
        this.parsedAmountReceived < this.cartGrandTotal
      )
    },
    receivedInputColor() {
      if (this.amountReceived === '') return 'var(--border-color)'
      return this.isAmountWarning
        ? 'var(--danger-color)'
        : 'var(--success-color)'
    },
    changeAmountColor() {
      if (this.amountReceived === '') return 'var(--text-main)'
      return this.isAmountWarning
        ? 'var(--danger-color)'
        : 'var(--success-color)'
    },
    changeBreakdown() {
      if (this.changeAmount <= 0) return ''
      let breakdown = []
      let amount = Math.round(this.changeAmount * 100)
      const denominations = [
        { value: 100000, label: 'แบงก์ 1000' },
        { value: 50000, label: 'แบงก์ 500' },
        { value: 10000, label: 'แบงก์ 100' },
        { value: 5000, label: 'แบงก์ 50' },
        { value: 2000, label: 'แบงก์ 20' },
        { value: 1000, label: 'เหรียญ 10' },
        { value: 500, label: 'เหรียญ 5' },
        { value: 200, label: 'เหรียญ 2' },
        { value: 100, label: 'เหรียญ 1' },
      ]

      for (let denom of denominations) {
        if (amount >= denom.value) {
          let count = Math.floor(amount / denom.value)
          breakdown.push(
            `<span class="breakdown-item">${denom.label} = ${count}</span>`
          )
          amount %= denom.value
        }
      }
      return breakdown.join(' ')
    },
    successDetailText() {
      if (this.paymentMethod === 'cash') {
        return `รับเงินสด: <b>฿${this.parsedAmountReceived.toFixed(
          2
        )}</b><br>เงินทอน: <b>฿${this.changeAmount.toFixed(2)}</b>`
      } else {
        return `ช่องทาง: <b>สแกน QR Code</b><br>ยอดรวม: <b>฿${this.cartGrandTotal.toFixed(
          2
        )}</b>`
      }
    },
    formattedAddress() {
      const c = this.companyInfo
      let arr = []
      if (c.acc_number && c.acc_number !== '-') arr.push(c.acc_number)
      if (c.acc_group && c.acc_group !== '-') arr.push(`หมู่ ${c.acc_group}`)
      if (c.acc_subdistrict && c.acc_subdistrict !== '-')
        arr.push(`ต.${c.acc_subdistrict}`)
      if (c.acc_district && c.acc_district !== '-')
        arr.push(`อ.${c.acc_district}`)
      if (c.acc_province && c.acc_province !== '-')
        arr.push(`จ.${c.acc_province}`)
      if (c.acc_post && c.acc_post !== '-') arr.push(c.acc_post)
      return arr.join(' ')
    },
  },
  mounted() {
    this.currentAuthToken = localStorage.getItem('siampos_auth_token')
    this.currentUsername = localStorage.getItem('siampos_username') || 'พนักงาน'
    this.companyName = localStorage.getItem('siampos_company') || 'SIAMPOS'

    if (!this.currentAuthToken) {
      this.$router.push('/login')
      return
    }

    // Set page title
    document.title = `${this.companyName} - Premium Web POS System`

    this.initializePOS()

    // Listen to fullscreen changes
    document.addEventListener('fullscreenchange', this.checkFullScreen)
  },
  beforeDestroy() {
    document.removeEventListener('fullscreenchange', this.checkFullScreen)
  },
  methods: {
    async apiRequest(endpoint, method = 'GET', body = null) {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.currentAuthToken}`,
      }
      const options = { method, headers }
      if (body) options.body = JSON.stringify(body)

      try {
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options)
        if (response.status === 401) {
          this.showToast('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'error')
          setTimeout(() => this.logout(), 1500)
          return { status: 'error', msg: 'Unauthorized' }
        }
        return await response.json()
      } catch (error) {
        return {
          status: 'error',
          msg: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
        }
      }
    },
    async initializePOS() {
      this.isLoading = true
      await Promise.all([
        this.fetchCategories(),
        this.fetchProducts(),
        this.fetchCompanyInfo(),
      ])
      this.isLoading = false
    },
    async fetchCategories() {
      const res = await this.apiRequest(
        '/st_sales_management_category.php',
        'GET'
      )
      if (res.status === 'success' && res.data) {
        this.categories = [{ id: 'all', name: 'ทั้งหมด' }, ...res.data]
      }
    },
    async fetchProducts() {
      const res = await this.apiRequest('/st_sales_management_price.php', 'GET')
      if (res.status === 'success' && res.data) {
        this.products = res.data.map((p) => {
          let imgUrl =
            'https://placehold.co/300x200/f1f5f9/a0aec0?text=No+Image'
          if (
            p.image &&
            Array.isArray(p.image) &&
            p.image.length > 0 &&
            p.image[0].url
          ) {
            imgUrl = p.image[0].url
          }
          return {
            id: p.id,
            name: p.name && p.name.trim() !== '' ? p.name : 'ไม่มีชื่อสินค้า',
            price: parseFloat(p.price) || 0,
            category: p.category || 'all',
            image: imgUrl,
          }
        })
      }
    },
    async fetchCompanyInfo() {
      const res = await this.apiRequest('/company', 'GET')
      if (res.status === 'success' && res.data && res.data.length > 0) {
        this.companyInfo = res.data[0]
        this.companyName = this.companyInfo.name || 'SIAMPOS'
        document.title = `${this.companyName} - Premium Web POS System`
      }
    },

    // Cart Actions
    addToCart(product) {
      const existingItem = this.cart.find((item) => item.id === product.id)
      if (existingItem) {
        existingItem.qty += 1
      } else {
        this.cart.push({ ...product, qty: 1 })
      }
    },
    updateCartQty(index, change) {
      if (this.cart[index].qty + change > 0) {
        this.cart[index].qty += change
      } else {
        this.removeFromCart(index)
      }
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },
    clearCart() {
      if (this.cart.length === 0) return
      if (confirm('ยืนยันการล้างตะกร้าสินค้าทั้งหมด?')) {
        this.cart = []
        this.showToast('ล้างรายการสั่งซื้อเรียบร้อย', 'warning')
      }
    },

    // Checkout Flow
    processCheckout() {
      if (this.cart.length === 0) {
        this.showToast('ยังไม่มีสินค้าในรายการสั่งซื้อ', 'error')
        return
      }
      this.paymentMethod = 'cash'
      this.amountReceived = ''
      this.successModalVisible = false
      this.paymentModalVisible = true

      this.$nextTick(() => {
        if (this.$refs.receivedInput) this.$refs.receivedInput.focus()
      })
    },
    closePaymentModal() {
      this.paymentModalVisible = false
    },
    resetWarningUI() {
      this.amountReceived = ''
    },
    generateOrderRef() {
      const date = new Date()
      return `POS${date.getFullYear().toString().slice(-2)}${String(
        date.getMonth() + 1
      ).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(
        date.getHours()
      ).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(
        date.getSeconds()
      ).padStart(2, '0')}${Math.floor(Math.random() * 9000) + 1000}`
    },
    async submitPayment() {
      let received = this.cartGrandTotal
      let change = 0

      if (this.paymentMethod === 'cash') {
        if (this.parsedAmountReceived < this.cartGrandTotal) {
          this.showToast('จำนวนเงินที่รับมาไม่เพียงพอ', 'error')
          this.$refs.receivedInput.focus()
          return
        }
        received = this.parsedAmountReceived
        change = received - this.cartGrandTotal
      }

      const orderRef = this.generateOrderRef()
      const payload = {
        post: 1,
        ref: orderRef,
        chanel_id: 'POS-WEB',
        tax_id: 'this.companyInfo.acc_vat',
        time_in: currentTime,
        time_out: currentTime,
        receipt_no: generatedReceiptNo,
        member_phone: this.memberPhone,
        order_list: JSON.stringify(this.cart),
        order_item: [],
        total_discount: '',
        exclude_vat: '',
        include_vat: '',
        vat: '',
        paymentMethod: this.paymentMethod === 'scan' ? 'transfer' : 'cash',
        total_price: this.cartSubTotal,
        bill_status: 'success',
        detail: '',
        options_items: '',
        discount_amount: 0,
        receive_amount: received,
        change_amount: change,
        coupon_code: '',
        net_price: this.cartGrandTotal,
      }

      this.isLoading = true
      const response = await this.apiRequest('/pos/order', 'POST', payload)
      this.isLoading = false

      if (response.status !== 'success') {
        this.showToast('เกิดข้อผิดพลาดในการบันทึกบิล: ' + response.msg, 'error')
        return
      }

      this.showToast('บันทึกข้อมูลการชำระเงินสำเร็จ', 'success')
      this.receiptData = {
        ref: orderRef,
        items: [...this.cart],
        subtotal: this.cartSubTotal,
        vat: this.cartVatAmount,
        total: this.cartGrandTotal,
        method: this.paymentMethod === 'cash' ? 'เงินสด' : 'สแกนจ่าย',
        received: received,
        change: change,
      }

      this.successModalVisible = true
    },
    printReceiptAction() {
      window.print()
    },
    resetOrderAndClose() {
      this.cart = []
      this.searchQuery = ''
      this.paymentModalVisible = false
    },

    // UI Utilities
    showToast(message, type = 'success') {
      const id = Date.now()
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id)
      }, 3000)
    },
    logout() {
      localStorage.removeItem('siampos_auth_token')
      localStorage.removeItem('siampos_company')
      this.$router.push('/login')
    },
    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    },
    checkFullScreen() {
      this.isFullScreen = !!document.fullscreenElement
    },

    // Category Slider Drag
    startDrag(e) {
      this.isDragging = true
      this.startX = e.pageX - this.$refs.categoryBar.offsetLeft
      this.scrollLeft = this.$refs.categoryBar.scrollLeft
    },
    endDrag() {
      this.isDragging = false
    },
    onDrag(e) {
      if (!this.isDragging) return
      e.preventDefault()
      const x = e.pageX - this.$refs.categoryBar.offsetLeft
      const walk = (x - this.startX) * 2
      this.$refs.categoryBar.scrollLeft = this.scrollLeft - walk
    },
    getCurrentDateTime() {
      const now = new Date()

      // แปลงเป็น YYYY-MM-DD HH:mm:ss
      const pad = (num) => String(num).padStart(2, '0')

      const year = now.getFullYear()
      const month = pad(now.getMonth() + 1)
      const day = pad(now.getDate())
      const hours = pad(now.getHours())
      const minutes = pad(now.getMinutes())
      const seconds = pad(now.getSeconds())

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    getCurrentDateTime() {
      const now = new Date()
      const pad = (num) => String(num).padStart(2, '0')
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
        now.getSeconds()
      )}`
    },

    // ฟังก์ชันใหม่สำหรับสร้างเลขที่ใบเสร็จ (NO + YYYYMMDDHHmmss)
    generateReceiptNo() {
      const now = new Date()
      const pad = (num) => String(num).padStart(2, '0')

      const year = now.getFullYear()
      const month = pad(now.getMonth() + 1)
      const day = pad(now.getDate())
      const hours = pad(now.getHours())
      const minutes = pad(now.getMinutes())
      const seconds = pad(now.getSeconds())

      // ส่งค่ากลับในรูปแบบ NO20260707111230
      return `NO${year}${month}${day}${hours}${minutes}${seconds}`
    },
    resetOrderAndClose() {
      this.cart = [];                 // ล้างตะกร้าสินค้า
      this.searchQuery = '';          // ล้างช่องค้นหา
      this.memberPhone = '';          // ล้างช่องกรอกเบอร์โทรสมาชิก
      this.amountReceived = '';       // ล้างช่องรับเงินสด
      this.paymentModalVisible = false; // ปิด Modal ชำระเงิน
      this.successModalVisible = false; // รีเซ็ตหน้า Success กลับไปสถานะเริ่มต้น
    },
  },
}
</script>

<style scoped>
/* Page-Specific Styles ONLY (Global styles moved to assets/css/main.css) */
.pos-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

#loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}
.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #cbd5e1;
  border-top-color: #ea580c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

#toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toast {
  min-width: 250px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-family: 'Prompt', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s forwards;
}
.toast-success {
  background-color: #10b981;
}
.toast-error {
  background-color: #ef4444;
}
.toast-warning {
  background-color: #f59e0b;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ปรับซ่อน UI เวลาปริ้นใบเสร็จ (Vue Scoped CSS) */
@media print {
  #pos-screen,
  .modal-overlay,
  #toast-container,
  #loading-overlay {
    display: none !important;
  }
  #receipt-print-area {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 58mm;
    padding: 0;
    margin: 0;
  }
  body {
    background: white !important;
  }
}
</style>