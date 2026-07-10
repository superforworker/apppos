<template>
  <div class="bg-light min-vh-100">
    <header class="bg-dark text-white py-3 shadow-sm">
      <div class="container d-flex justify-content-between align-items-center">
        <h1 class="h4 mb-0">SIAMPOS Backoffice</h1>
        <nuxt-link to="/" class="btn btn-outline-light btn-sm">💻 กลับหน้าแรก POS</nuxt-link>
      </div>
    </header>

    <div class="container py-4">
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button :class="['nav-link', activeTab === 'category' ? 'active' : '']" @click="activeTab = 'category'">📁 หมวดหมู่</button>
        </li>
        <li class="nav-item">
          <button :class="['nav-link', activeTab === 'product' ? 'active' : '']" @click="activeTab = 'product'">🛍️ สินค้า</button>
        </li>
      </ul>

      <div v-if="loading" class="text-center py-5">กำลังโหลดข้อมูล...</div>

      <div v-else class="card shadow-sm border-0 ">
        <div v-show="activeTab === 'category'">
          <div class="d-flex justify-content-between mb-3">
            <h5>จัดการหมวดหมู่</h5>
            <button class="btn btn-success" @click="openModal('category')">+ เพิ่มหมวดหมู่</button>
          </div>
          <table class="table table-hover align-middle">
            <thead class="table-light"><tr><th>ID</th><th>ชื่อ</th><th>ลำดับ</th><th>จัดการ</th></tr></thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td>{{ cat.id }}</td>
                <td>{{ cat.name }}</td>
                <td>{{ cat.sort }}</td>
                <td>
                  <button class="btn btn-warning btn-sm" @click="openModal('category', cat)">แก้ไข</button>
                  <button class="btn btn-danger btn-sm" @click="deleteItem('category', cat.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-show="activeTab === 'product'">
          <div class="d-flex justify-content-between mb-3">
            <h5>จัดการสินค้า</h5>
            <button class="btn btn-success" @click="openModal('product')">+ เพิ่มสินค้า</button>
          </div>
          <table class="table table-hover align-middle">
            <thead class="table-light"><tr><th>รูป</th><th>ชื่อ</th><th>หมวดหมู่</th><th>ราคา</th><th>จัดการ</th></tr></thead>
            <tbody>
              <tr v-for="prod in products" :key="prod.id">
                <td><img :src="getProdImg(prod)" class="rounded" width="40" height="40" style="object-fit:cover;"></td>
                <td>{{ prod.name }}</td>
                <td>{{ getCatName(prod.category) }}</td>
                <td>{{ formatPrice(prod.price) }}</td>
                <td>
                  <button class="btn btn-warning btn-sm" @click="openModal('product', prod)">แก้ไข</button>
                  <button class="btn btn-danger btn-sm" @click="deleteItem('product', prod.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="mainModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalTitle }}</h5>
            <!-- <button type="button" class="btn-close" data-bs-dismiss="modal">X</button> -->
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">ชื่อ</label>
              <input v-model="form.name" class="form-control" type="text">
            </div>
            <div v-if="modalType === 'product'" class="mb-3">
              <label class="form-label">ราคา</label>
              <input v-model="form.price" class="form-control" type="number">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
            <button type="button" class="btn btn-primary" @click="saveData">บันทึก</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'category',
      loading: true,
      categories: [],
      products: [],
      modalType: '',
      modalTitle: '',
      form: { id: null, name: '', price: 0 },
      bsModal: null,
      token: ''
    }
  },
  mounted() {
    const bootstrap = require('bootstrap');
    this.bsModal = new bootstrap.Modal(document.getElementById('mainModal'));
    this.token = localStorage.getItem('siampos_auth_token');
    if (!this.token) this.$router.push('/login');
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const config = { headers: { Authorization: `Bearer ${this.token}` } };
        const [catRes, prodRes] = await Promise.all([
          this.$axios.$get('https://admin.siampos.co/res/st_sales_management_category.php', config),
          this.$axios.$get('https://admin.siampos.co/res/st_sales_management_price.php', config)
        ]);
        this.categories = catRes.data || [];
        this.products = prodRes.data || [];
      } catch (e) { alert('โหลดข้อมูลไม่สำเร็จ'); }
      this.loading = false;
    },
    openModal(type, data = null) {
      this.modalType = type;
      this.modalTitle = data ? 'แก้ไข' + (type === 'category' ? 'หมวดหมู่' : 'สินค้า') : 'เพิ่ม' + (type === 'category' ? 'หมวดหมู่' : 'สินค้า');
      this.form = data ? { ...data } : { id: null, name: '', price: 0 };
      this.bsModal.show();
    },
    async saveData() {
      const url = this.modalType === 'category' ? '/st_sales_management_category.php' : '/st_sales_management_price.php';
      const payload = { ...this.form, [this.form.id ? 'put' : 'post']: 1 };
      try {
        await this.$axios.$post(`https://admin.siampos.co/res${url}`, payload, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.bsModal.hide();
        this.fetchData();
      } catch (e) { alert('บันทึกไม่สำเร็จ'); }
    },
    async deleteItem(type, id) {
      if (!confirm('ยืนยันการลบ?')) return;
      const url = type === 'category' ? '/st_sales_management_category.php' : '/st_sales_management_price.php';
      await this.$axios.$post(`https://admin.siampos.co/res${url}`, { delete: 1, id }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.fetchData();
    },
    getProdImg(p) { return p.image && p.image[0] ? p.image[0].url : 'https://placehold.co/50'; },
    getCatName(id) { const c = this.categories.find(c => c.id == id); return c ? c.name : '-'; },
    formatPrice(val) { return parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }); }
  }
}
</script>