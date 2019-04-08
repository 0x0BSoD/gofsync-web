import Vue from 'vue';
import Router from 'vue-router';
import hostgroup from './views/Hostgroup';
import Login from './views/Login';
import Batch from './views/Batch';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'hostgroup',
      component: hostgroup
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
