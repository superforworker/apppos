import Vue from 'vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const options = {
  transition: 'Vue-Toastification__bounce',
  position: 'top-right',
  timeout: 3500,
  maxToasts: 10,
  newestOnTop: true,
}

Vue.use(Toast, options)

if (
  window.location.protocol != "https:" &&
  window.location.hostname != "127.0.0.1"
) {
  window.location.href =
    "https:" + window.location.href.substring(window.location.protocol.length);
}