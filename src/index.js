
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);


import App from './App';
import store from './store';

const app = new Vue({
    render: h => h(App),
    store,
}).$mount('#app')

console.log(1);
