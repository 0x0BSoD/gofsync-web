import Vue from 'vue'
import Router from 'vue-router'
import hostgroup from './views/hostgroup'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'hostgroup',
      component: hostgroup
    },
  ]
})
