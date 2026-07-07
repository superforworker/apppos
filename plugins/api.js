export default (context, inject) => {
  const API_BASE_URL = 'https://admin.siampos.co/res';

  const apiRequest = async (endpoint, method = 'GET', data = null) => {
    const token = localStorage.getItem('siampos_auth_token') || '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: method,
      headers: headers
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { status: 'error', msg: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' };
    }
  };

  inject('apiRequest', apiRequest);
};