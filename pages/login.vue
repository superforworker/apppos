<template>
  <div id="login-screen" style="height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div class="login-container">
      <h1 id="login-title">SIAMPOS</h1>
      <p>ระบบจัดการร้านค้าอัจฉริยะ</p>
      
      <input 
        v-model="username" 
        type="text" 
        placeholder="ชื่อผู้ใช้งาน" 
        style="text-transform: uppercase;"
        @keypress.enter="authenticate"
      >
      
      <input 
        v-model="password" 
        type="password" 
        placeholder="รหัสผ่านเข้าสู่ระบบ" 
        @keypress.enter="authenticate"
      >
      
      <button @click="authenticate">เข้าสู่ระบบ</button>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  watch: {
    username(val) {
      this.username = val.toUpperCase();
    }
  },
  methods: {
    async authenticate() {
      if (!this.username || !this.password) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }

      const response = await this.$apiRequest('/login', 'POST', {
        username: this.username,
        password: this.password
      });

      if (response.status === 'success' && response.data) {
        const currentAuthToken = `${response.data.code}:${response.data.team}:${response.data.type}`;
        const companyName = response.data.company || 'SIAMPOS';
        
        localStorage.setItem('siampos_auth_token', currentAuthToken);
        localStorage.setItem('siampos_username', this.username);
        localStorage.setItem('siampos_company', companyName);
        
        this.$router.push('/');
      } else {
        alert(response.msg || 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      }
    }
  }
}
</script>