import { createApp } from 'vue'
import "./style.css"
import App from './App.vue'
import './samples/node-api'


import MqttBus from './utils/mqtt_bus'
//Vue.use(MqttBus);



let app = createApp(App);
app.use(MqttBus);

app.mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
