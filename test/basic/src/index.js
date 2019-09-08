import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

import App from './App';

const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

const routes = [
  { path: '/', component: Foo },
  { path: '/axios', component: Foo },
]

const router = new VueRouter({
    routes,
});

const app = new Vue({
    render: h => h(App),
    router,
}).$mount('#app');
