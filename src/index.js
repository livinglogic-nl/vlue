
import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);


const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
import App from './App.js';

var app = new Vue({
    render: h => h(App),
    store,
}).$mount('#app')


