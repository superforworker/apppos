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
          <button :class="['nav-link', activeTab === 'category' ? 'active' : '']" @click="activeTab = 'category'">📁
            หมวดหมู่</button>
        </li>
        <li class="nav-item">
          <button :class="['nav-link', activeTab === 'product' ? 'active' : '']" @click="activeTab = 'product'">🛍️
            สินค้า</button>
        </li>
      </ul>

      <div v-if="loading" class="text-center py-5">กำลังโหลดข้อมูล...</div>

      <div v-else class="card shadow-sm border-0">
        <!-- ตารางหมวดหมู่ -->
        <div v-show="activeTab === 'category'">
          <div class="d-flex justify-content-between mb-3">
            <h5>จัดการหมวดหมู่</h5>
            <button class="btn btn-success" @click="openModal('category')">+ เพิ่มหมวดหมู่</button>
          </div>
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>ชื่อ</th>
                <th>ลำดับ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categories" :key="cat.id">
                <td>{{ cat.id }}</td>
                <td>{{ cat.name }}</td>
                <td>{{ cat.sort }}</td>
                <td>
                  <button class="btn btn-warning btn-sm mr-1" @click="openModal('category', cat)">แก้ไข</button>
                  <button class="btn btn-danger btn-sm" @click="deleteItem('category', cat.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ตารางสินค้า -->
        <div v-show="activeTab === 'product'">
          <div class="d-flex justify-content-between mb-3">
            <h5>จัดการสินค้า</h5>
            <button class="btn btn-success" @click="openModal('product')">+ เพิ่มสินค้า</button>
          </div>
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>รูป</th>
                <th>ชื่อ</th>
                <th>หมวดหมู่</th>
                <th>ราคา</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in products" :key="prod.id">
                <td>
                  <template v-if="getFirstImage(prod.image)">
                    <img :src="getFirstImage(prod.image)" class="rounded" width="45" height="45"
                      style="object-fit:cover; cursor:pointer; border:1px solid #ced4da;"
                      @click="openLightbox(getFirstImage(prod.image))">
                    <div class="text-success" style="font-size:11px; cursor:pointer; margin-top:2px;"
                      @click="openUploadModal(prod)">
                      🖼 จัดการรูป
                    </div>
                  </template>
                  <template v-else>
                    <img src="https://placehold.co/45" class="rounded" width="45" height="45"
                      style="object-fit:cover; cursor:pointer; border:1px solid #ced4da;"
                      @click="openUploadModal(prod)">
                    <div class="text-danger" style="font-size:11px; cursor:pointer; margin-top:2px;"
                      @click="openUploadModal(prod)">
                      📤 อัปโหลดรูป
                    </div>
                  </template>
                </td>
                <td>{{ prod.name }}</td>
                <td>{{ getCatName(prod.category) }}</td>
                <td>{{ formatPrice(prod.price) }}</td>
                <td>
                  <button class="btn btn-warning btn-sm mr-1" @click="openModal('product', prod)">แก้ไข</button>
                  <button class="btn btn-danger btn-sm" @click="deleteItem('product', prod.id)">ลบ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal เพิ่ม/แก้ไข -->
    <div class="modal fade" id="mainModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modalTitle }}</h5>
            <button type="button" class="close" @click="bsModal.hide()">&times;</button>
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
            <div v-if="modalType === 'product'" class="mb-3">
              <label class="form-label">หมวดหมู่</label>
              <select v-model="form.category" class="form-control">
                <option value="">-- เลือกหมวดหมู่ --</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <!-- อัปโหลดรูปภาพ (เฉพาะสินค้า) -->
            <div v-if="modalType === 'product'" class="mb-3">
              <label class="form-label">รูปภาพสินค้า</label>

              <!-- รูปเดิม (กรณีแก้ไข) -->
              <div v-if="form.id && existingImages.length > 0" class="mb-2">
                <div class="d-flex flex-wrap" style="gap:6px;">
                  <div v-for="(img, i) in existingImages" :key="'ex-'+i"
                    style="position:relative; width:72px; height:72px;">
                    <img :src="img" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #ced4da;">
                    <button type="button" @click.stop="deleteExistingImage(img, i)"
                      style="position:absolute;top:2px;right:2px;background:rgba(220,53,69,.9);color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;">✕</button>
                  </div>
                </div>
              </div>
              <div v-else-if="form.id && existingImages.length === 0" class="text-muted small mb-2">ยังไม่มีรูปภาพ</div>

              <!-- Dropzone -->
              <div @click="$refs.modalFileInput.click()"
                style="border:2px dashed #cbd5e1;border-radius:10px;background:#f8fafc;cursor:pointer;padding:14px;text-align:center;transition:border-color .2s;"
                @mouseover="$event.currentTarget.style.borderColor='#3b82f6'"
                @mouseleave="$event.currentTarget.style.borderColor='#cbd5e1'">
                <input type="file" ref="modalFileInput" accept="image/*" multiple @change="previewImage" class="d-none">
                <span style="font-size:20px;">📤</span>
                <div style="font-size:13px; color:#64748b; margin-top:4px;">คลิกเพื่อเลือกรูปภาพ</div>
              </div>

              <!-- Preview รูปใหม่ -->
              <div v-if="previewImages.length > 0" class="mt-2">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-primary fw-bold">ไฟล์ที่เลือก ({{ previewImages.length }} ไฟล์)</small>
                </div>
                <div class="d-flex flex-wrap" style="gap:6px;">
                  <div v-for="(img, i) in previewImages" :key="'pw-'+i"
                    style="position:relative; width:72px; height:72px;">
                    <img :src="img" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #bfdbfe;">
                    <button type="button" @click.stop="removePreviewImage(i)"
                      style="position:absolute;top:2px;right:2px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:20px;height:20px;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;">✕</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="bsModal.hide()" :disabled="isSaving">ปิด</button>
            <button type="button" class="btn btn-primary" @click="saveData" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm mr-1"></span>
              {{ isSaving ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal จัดการรูปภาพสินค้า (pattern จาก history_total.vue) -->
    <div v-if="showUploadModal" class="modal fade show d-block" tabindex="-1"
      style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border:none; border-radius:20px; box-shadow:0 15px 40px rgba(0,0,0,0.12);">
          <div class="modal-header border-bottom-0 pb-0 pt-4 px-4">
            <h5 class="modal-title w-100 text-center fw-bold">🖼 จัดการรูปภาพสินค้า</h5>
            <button type="button" class="close" @click="closeUploadModal" :disabled="isUploading">&times;</button>
          </div>
          <div class="modal-body px-4 pt-3 pb-4">

            <!-- Dropzone อัปโหลด -->
            <div class="upload-dropzone mb-4" @click="$refs.fileInput.click()"
              style="border:2px dashed #e2e8f0; border-radius:16px; background:#f8fafc; cursor:pointer; transition:all .25s;">
              <input type="file" ref="fileInput" name="image[]" accept="image/*" multiple
                @change="previewImage" class="d-none" />
              <div class="text-center py-4">
                <div style="width:56px;height:56px;background:#e0e7ff;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                  <span style="font-size:24px;">📤</span>
                </div>
                <h6 class="mb-1 fw-bold text-dark">คลิกเพื่อเลือกไฟล์รูปภาพ</h6>
                <span class="text-muted" style="font-size:12px;">รองรับไฟล์ JPG, PNG</span>
              </div>
            </div>

            <!-- รูปเดิมที่มีในระบบ -->
            <div v-if="existingImages && existingImages.length > 0">
              <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                <span class="fw-bold text-secondary" style="font-size:14px;">รูปเดิมในระบบ</span>
                <span class="badge badge-light border text-secondary">{{ existingImages.length }} ไฟล์</span>
              </div>
              <div class="row mb-3" style="margin:0 -4px;">
                <div class="col-4 px-1 mb-2" v-for="(img, index) in existingImages" :key="'ex-' + index">
                  <div style="position:relative; border-radius:10px; overflow:hidden; border:1px solid #f1f5f9; box-shadow:0 2px 6px rgba(0,0,0,.04); background:#fff;">
                    <img :src="img" style="width:100%; height:90px; object-fit:cover; display:block;">
                    <button type="button"
                      style="position:absolute;top:5px;right:5px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"
                      @click.stop="deleteExistingImage(img, index)"
                      :disabled="isUploading">🗑</button>
                  </div>
                </div>
              </div>
            </div>

            <hr v-if="existingImages.length > 0 && previewImages.length > 0" class="my-3 opacity-25">

            <!-- รูปที่กำลังจะอัปโหลด (preview) -->
            <div v-if="previewImages && previewImages.length > 0">
              <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                <span class="fw-bold text-primary" style="font-size:14px;">ไฟล์ใหม่ที่เตรียมอัปโหลด</span>
                <span class="badge badge-primary">{{ previewImages.length }} ไฟล์</span>
              </div>
              <div class="row" style="margin:0 -4px;">
                <div class="col-4 px-1 mb-2" v-for="(img, index) in previewImages" :key="'pw-' + index">
                  <div style="position:relative; border-radius:10px; overflow:hidden; border:1px solid #bfdbfe; box-shadow:0 2px 6px rgba(0,0,0,.04); background:#fff;">
                    <img :src="img" style="width:100%; height:90px; object-fit:cover; display:block;">
                    <button type="button"
                      style="position:absolute;top:5px;right:5px;background:rgba(255,255,255,.9);border:none;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;"
                      @click.stop="removePreviewImage(index)">✕</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer border-top-0 justify-content-center pb-4 pt-0">
            <button type="button" class="btn btn-light px-4" @click="closeUploadModal"
              :disabled="isUploading" style="border-radius:8px;">ยกเลิก</button>
            <button type="button" class="btn btn-primary px-4" @click="saveUploadImages"
              :disabled="isUploading" style="border-radius:8px;">
              <span v-if="isUploading" class="spinner-border spinner-border-sm mr-2"></span>
              <span v-else>💾</span>
              {{ isUploading ? 'กำลังอัปโหลด...' : 'บันทึกรูปภาพ' }}
            </button>
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
      token: '',
      // ---- Image upload state (pattern จาก history_total.vue) ----
      showUploadModal: false,
      selectedRecordUpload: null,
      existingImages: [],
      previewImages: [],
      selectedFiles: [],
      isUploading: false,
      isSaving: false,
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
    // ==========================================
    // Fetch ข้อมูล
    // ==========================================
    async fetchData() {
      this.loading = true;
      try {
        const config = { headers: { Authorization: `Bearer ${this.token}` } };
        const [catRes, prodRes] = await Promise.all([
          this.$axios.$get('https://admin.siampos.co/res/st_sales_management_category', config),
          this.$axios.$get('https://admin.siampos.co/res/st_sales_management_price', config)
        ]);
        this.categories = catRes.data || [];
        this.products = prodRes.data || [];
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'โหลดข้อมูลไม่สำเร็จ', confirmButtonText: 'ตกลง' });
      }
      this.loading = false;
    },

    // ==========================================
    // Modal เพิ่ม/แก้ไข
    // ==========================================
    openModal(type, data = null) {
      this.modalType = type;
      this.modalTitle = data ? 'แก้ไข' + (type === 'category' ? 'หมวดหมู่' : 'สินค้า') : 'เพิ่ม' + (type === 'category' ? 'หมวดหมู่' : 'สินค้า');
      this.form = data ? { ...data } : { id: null, name: '', price: 0 };
      // reset รูปภาพ และโหลดรูปเดิมถ้าเป็นการแก้ไข
      this.previewImages = [];
      this.selectedFiles = [];
      this.existingImages = data && type === 'product' ? this.parseImages(data.image) : [];
      this.selectedRecordUpload = data || null;
      this.bsModal.show();
    },
    async saveData() {
      const isProduct = this.modalType === 'product';
      const isNew = isProduct && !this.form.id;
      const savedName = this.form.name;
      const url = this.modalType === 'category' ? '/st_sales_management_category' : '/st_sales_management_price';
      const payload = { ...this.form, [this.form.id ? 'put' : 'post']: 1 };
      this.isSaving = true;
      try {
        const res = await this.$axios.$post(`https://admin.siampos.co/res${url}`, payload, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        if (res.status === 'error') {
          Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: res.msg || 'บันทึกไม่สำเร็จ', confirmButtonText: 'ตกลง' });
          this.isSaving = false;
          return;
        }

        // ถ้าเป็นสินค้าและมีรูปที่เลือกไว้ → อัปโหลดต่อทันที
        if (isProduct && this.selectedFiles.length > 0) {
          // หา ID สินค้า: ถ้าเป็นใหม่ refetch แล้วค้นจาก response หรือชื่อ
          let prodId = this.form.id;
          if (isNew) {
            await this.fetchData();
            const newId = res.data?.id || res.id || null;
            const newProd = newId
              ? this.products.find(p => p.id == newId)
              : this.products.find(p => p.name === savedName);
            prodId = newProd?.id || null;
          }
          if (prodId) {
            await this._uploadFilesForProduct(prodId);
          }
        }

        this.bsModal.hide();
        Swal.fire({ icon: 'success', title: 'สำเร็จ', text: res.msg || 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false });
        this.fetchData();
      } catch (e) {
        const msg = e?.response?.data?.msg || e?.response?.data?.message || 'บันทึกไม่สำเร็จ';
        Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: msg, confirmButtonText: 'ตกลง' });
      }
      this.isSaving = false;
    },
    // อัปโหลดรูปที่ user เลือกใน modal แล้ว PUT image JSON ลง DB
    async _uploadFilesForProduct(prodId) {
      const formData = new FormData();
      this.selectedFiles.forEach(file => { formData.append('image[]', file); });
      formData.append('token', localStorage.getItem('token'));
      try {
        const res = await fetch('https://siampos.co/uploadimg', { method: 'POST', body: formData });
        const result = await res.json();
        let newUrls = (result && result.data && Array.isArray(result.data)) ? result.data : [];
        const allImages = [...this.existingImages, ...newUrls].map(url => ({ url }));
        await this.$axios.$post(
          'https://admin.siampos.co/res/st_sales_management_price',
          { id: prodId, image: JSON.stringify(allImages), put: '1' },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
      } catch (e) {
        Swal.fire({ icon: 'warning', title: 'คำเตือน', text: 'บันทึกข้อมูลสำเร็จ แต่อัปโหลดรูปภาพไม่สำเร็จ', confirmButtonText: 'ตกลง' });
      }
    },
    async deleteItem(type, id) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'ยืนยันการลบ',
        text: 'คุณแน่ใจว่าต้องการลบรายการนี้?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'ลบเลย',
        cancelButtonText: 'ยกเลิก'
      });
      if (!result.isConfirmed) return;
      const url = type === 'category' ? '/st_sales_management_category' : '/st_sales_management_price';
      try {
        const res = await this.$axios.$post(`https://admin.siampos.co/res${url}`, { delete: 1, id }, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        if (res.status === 'error') {
          Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: res.msg || 'ลบไม่สำเร็จ', confirmButtonText: 'ตกลง' });
          return;
        }
        Swal.fire({ icon: 'success', title: 'ลบแล้ว', text: res.msg || 'ลบสำเร็จ', timer: 1500, showConfirmButton: false });
        this.fetchData();
      } catch (e) {
        const msg = e?.response?.data?.msg || e?.response?.data?.message || 'ลบไม่สำเร็จ';
        Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: msg, confirmButtonText: 'ตกลง' });
      }
    },

    // ==========================================
    // จัดการรูปภาพสินค้า (adapt จาก history_total.vue)
    // ==========================================
    parseImages(imageData) {
      if (!imageData) return [];
      // กรณีเป็น Array อยู่แล้ว (จาก API ที่ return array of {url})
      if (Array.isArray(imageData)) {
        return imageData.map(item => item.url || item).filter(Boolean);
      }
      // กรณีเป็น JSON string
      if (typeof imageData === 'string') {
        const trimmed = imageData.trim();
        try {
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.map(item => item.url || item).filter(Boolean);
            if (parsed && typeof parsed === 'object') return [parsed.url || parsed].filter(Boolean);
          }
          if (trimmed.includes(',')) return trimmed.split(',').map(u => u.trim()).filter(Boolean);
          return [trimmed];
        } catch (e) {
          return [trimmed];
        }
      }
      return [];
    },
    getFirstImage(imageData) {
      const imgs = this.parseImages(imageData);
      return imgs.length > 0 ? imgs[0] : null;
    },
    openLightbox(url) {
      Swal.fire({
        imageUrl: url,
        imageAlt: 'รูปสินค้า',
        showCloseButton: true,
        showConfirmButton: false,
        width: 'auto'
      });
    },
    openUploadModal(prod) {
      this.selectedRecordUpload = prod;
      this.existingImages = this.parseImages(prod.image);
      this.previewImages = [];
      this.selectedFiles = [];
      this.showUploadModal = true;
    },
    closeUploadModal() {
      this.showUploadModal = false;
      this.selectedRecordUpload = null;
      this.existingImages = [];
      this.previewImages = [];
      this.selectedFiles = [];
    },
    previewImage(event) {
      this.previewImages = [];
      this.selectedFiles = Array.from(event.target.files);
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => { this.previewImages.push(e.target.result); };
        reader.readAsDataURL(file);
      });
    },
    removePreviewImage(index) {
      this.previewImages.splice(index, 1);
      this.selectedFiles.splice(index, 1);
    },
    async deleteExistingImage(urlimg, index) {
      const confirm = await Swal.fire({
        title: 'ยืนยันการลบรูปภาพ?',
        text: 'คุณไม่สามารถกู้คืนรูปภาพนี้ได้!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ลบเลย',
        cancelButtonText: 'ยกเลิก'
      });
      if (!confirm.isConfirmed) return;

      const filename = urlimg.split('/').pop();
      const formData = new FormData();
      formData.append('filename', filename);
      formData.append('token', localStorage.getItem('token'));

      try {
        const res = await fetch('https://siampos.co/removeimg', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success === true || data.status === 'success') {
          // ลบออกจาก UI ทันที
          this.existingImages.splice(index, 1);
          // อัปเดต DB
          await this.updateProductImagesInDB();
          Swal.fire({ icon: 'success', title: 'ลบแล้ว', text: data.message || 'ลบรูปภาพสำเร็จ', timer: 1200, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: data.message || 'ลบรูปภาพไม่สำเร็จ', confirmButtonText: 'ตกลง' });
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'เกิดข้อผิดพลาดในการลบรูปภาพ', confirmButtonText: 'ตกลง' });
      }
    },
    async saveUploadImages() {
      if (this.selectedFiles.length === 0) {
        this.closeUploadModal();
        return;
      }
      this.isUploading = true;
      let newUploadedUrls = [];

      const formData = new FormData();
      this.selectedFiles.forEach(file => { formData.append('image[]', file); });
      formData.append('token', localStorage.getItem('token'));

      try {
        // 1. อัปโหลดไฟล์ไปยัง siampos.co/uploadimg
        const res = await fetch('https://siampos.co/uploadimg', { method: 'POST', body: formData });
        const uploadResults = await res.json();
        if (uploadResults && uploadResults.data && Array.isArray(uploadResults.data)) {
          newUploadedUrls = uploadResults.data;
        }

        // 2. รวม URL เดิม + ใหม่ แล้ว PUT ลง DB
        const allImages = [...this.existingImages, ...newUploadedUrls];
        const formattedImages = allImages.map(url => ({ url }));
        const response = await this.$axios.$post(
          'https://admin.siampos.co/res/st_sales_management_price',
          { id: this.selectedRecordUpload.id, image: JSON.stringify(formattedImages), put: '1' },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        if (response.status === 'error') {
          Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: response.msg || 'บันทึกรูปภาพไม่สำเร็จ', confirmButtonText: 'ตกลง' });
        } else {
          Swal.fire({ icon: 'success', title: 'สำเร็จ', text: response.msg || 'อัปโหลดและบันทึกรูปภาพสำเร็จ', timer: 1500, showConfirmButton: false });
          this.closeUploadModal();
          this.fetchData();
        }
      } catch (error) {
        const msg = error?.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการอัปโหลด';
        Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: msg, confirmButtonText: 'ตกลง' });
      } finally {
        this.isUploading = false;
      }
    },
    async updateProductImagesInDB() {
      // อัปเดต image ที่เหลือหลังจากลบรูป
      const formattedImages = this.existingImages.map(url => ({ url }));
      try {
        await this.$axios.$post(
          'https://admin.siampos.co/res/st_sales_management_price',
          { id: this.selectedRecordUpload.id, image: JSON.stringify(formattedImages), put: '1' },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        this.fetchData();
      } catch (e) {
        Swal.fire({ icon: 'warning', title: 'คำเตือน', text: 'ลบไฟล์สำเร็จ แต่ไม่สามารถอัปเดตฐานข้อมูลได้', confirmButtonText: 'ตกลง' });
      }
    },

    // ==========================================
    // Helpers
    // ==========================================
    getProdImg(p) { return this.getFirstImage(p.image) || 'https://placehold.co/50'; },
    getCatName(id) { const c = this.categories.find(c => c.id == id); return c ? c.name : '-'; },
    formatPrice(val) { return parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }); }
  }
}
</script>