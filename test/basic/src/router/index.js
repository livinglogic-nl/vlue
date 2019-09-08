import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

import Home from '../views/Home';
import Axios from '../views/Axios';

const routes = [
  { path: '/', component: Home },
  { path: '/axios', component: Axios },
]

const router = new VueRouter({
    routes,
});

export default router;
