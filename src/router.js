import Vue from 'vue';
import Router from 'vue-router';
import HosGroup from './views/hostgroup/Hostgroup';
import Login from './views/Login';
import Batch from './views/Batch';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'hostgroup',
      component: HosGroup
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/batch',
      name: 'batch',
      component: Batch
    },
  ]
})
