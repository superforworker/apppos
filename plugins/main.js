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