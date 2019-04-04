import Vue from 'vue';
import Router from 'vue-router';
import hostgroup from './views/hostgroup';
import Login from './views/Login';

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
  ]
})
