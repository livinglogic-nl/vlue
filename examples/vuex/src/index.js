import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import store from './store';
import App from './App';

const app = new Vue({
    render: h => h(App),
    store,
}).$mount('#app');

