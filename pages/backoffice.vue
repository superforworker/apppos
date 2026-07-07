<template>
  <div>
    <header class="bo-header">
      <div class="bo-title-group">
        <NuxtLink to="/" class="back-btn">⬅️ หน้าขาย POS</NuxtLink>
        <h1>⚙️ Backoffice Management</h1>
      </div>
      <button class="btn-add" @click="openModal(null)">➕ เพิ่มสินค้าใหม่</button>
    </header>

    <div class="bo-container">
      <table class="bo-table">
        <thead>
          <tr>
            <th>รหัสสินค้า</th>
            <th>ชื่อสินค้า</th>
            <th>หมวดหมู่</th>
            <th>ราคา</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in products" :key="prod.id">
            <td>{{ prod.product_code }}</td>
            <td>{{ prod.name }}</td>
            <td>{{ prod.category }}</td>
            <td>฿{{ parseFloat(prod.price).toFixed(2) }}</td>
            <td>
              <button @click="openModal(prod)">แก้ไข</button>
              <button @click="deleteProduct(prod.id)" style="background-color:red; color:white;">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" style="display: flex;">
      <div class="modal-content">
        <h3>{{ form.id ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่' }}</h3>
        <hr>
        <div style="margin-bottom: 10px;">
          <label>รหัสสินค้า:</label>
          <input v-model="form.product_code" type="text" class="form-control">
        </div>
        <div style="margin-bottom: 10px;">
          <label>ชื่อสินค้า:</label>
          <input v-model="form.name" type="text" class="form-control">
        </div>
        <div style="margin-bottom: 10px;">
          <label>หมวดหมู่:</label>
          <input v-model="form.category" type="text" class="form-control">
        </div>
        <div style="margin-bottom: 10px;">
          <label>ราคาขาย:</label>
          <input v-model="form.price" type="number" class="form-control">
        </div>
        <div style="text-align: right; margin-top: 15px;">
          <button @click="closeModal" style="background:#64748b; color:white; margin-right:5px;">ยกเลิก</button>
          <button @click="saveProduct" style="background:#10b981; color:white;">บันทึกข้อมูล</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [],
      isModalOpen: false,
      form: {
        id: null,
        product_code: '',
        name: '',
        category: '',
        price: 0
      }
    }
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      const res = await this.$apiRequest('/st_sales_management_price.php?get_products=1');
      if (res && res.data) this.products = res.data;
    },
    openModal(product) {
      if (product) {
        this.form = { ...product };
      } else {
        this.form = { id: null, product_code: '', name: '', category: '', price: 0 };
      }
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    async saveProduct() {
      let payload = {
        product_code: this.form.product_code,
        name: this.form.name,
        category: this.form.category,
        price: this.form.price,
        category_sub: '',
        cost: 0,
        product_type: 'normal',
        image: JSON.stringify([]),
        items: JSON.stringify([]),
        ingredient: ''
      };

      if (this.form.id) {
        payload.put = 1;
        payload.id = this.form.id;
      } else {
        payload.post = 1;
      }

      const res = await this.$apiRequest('/st_sales_management_price.php', 'POST', payload);
      if (res.status === 'success') {
        this.closeModal();
        this.fetchProducts();
      } else {
        alert(res.msg || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    },
    async deleteProduct(id) {
      if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? ข้อมูลจะไม่สามารถกู้คืนได้')) return;
      const res = await this.$apiRequest('/st_sales_management_price.php', 'POST', { delete: 1, id: id });
      if (res.status === 'success') {
        this.fetchProducts();
      } else {
        alert(res.msg || 'ลบสินค้าไม่สำเร็จ');
      }
    }
  }
}
</script>