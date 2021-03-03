import Vue from 'vue'
import App from './App'

import basicline from './pages/line/basicline/basicline.vue'
Vue.component('basicline',basicline)
import stackedArea from './pages/line/stackedArea/stackedArea.vue'
Vue.component('stackedArea',stackedArea)
import rainfall from './pages/line/rainfall/rainfall.vue'
Vue.component('rainfall',rainfall)
import shareDataset from './pages/line/shareDataset/shareDataset.vue'
Vue.component('shareDataset',shareDataset)


import bar10 from './pages/bar/bar10/bar10.vue'
Vue.component('bar10',bar10)
import basicbar from './pages/bar/basicbar/basicbar.vue'
Vue.component('basicbar',basicbar)
import jianbianbar from './pages/bar/jianbianbar/jianbianbar.vue'
Vue.component('jianbianbar',jianbianbar)


import cardark from './pages/gauge/cardark/cardark.vue'
Vue.component('cardark',cardark)


import chinamap from './pages/chinamap/chinamap.vue'
Vue.component('chinamap',chinamap)



Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
