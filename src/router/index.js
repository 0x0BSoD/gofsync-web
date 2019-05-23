import Vue from 'vue';
import Router from 'vue-router';
import HosGroup from '../views/hostgroup/Hostgroup';
import Login from '../views/Login';
import Batch from '../views/Batch';
import JsonEditor from '../views/editor/JsonEditor';
import Locations from '../views/editor/LocationsEditor';
import Error from '../views/Error';

Vue.use(Router);

const router = new Router({
    routes: [
        {
            path: '/hostgroup',
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
        {
            path: '/jsoneditor',
            name: 'jsoneditor',
            component: JsonEditor
        },
        {
            path: '/locations',
            name: 'locations',
            component: Locations
        },
        {
            path: '/error',
            name: 'error',
            component: Error
        },
        {
            path: '*',
            name: "app",
            redirect: 'hostgroup',
        }
    ]
});

// router.beforeEach((to, from, next) => {
//     if (from.name === 'error') {
//     } else {
//         router.push('error');
//     }
//     return next;
//     console.log("TO: ", to);
//     console.log("FROM: ", from);
// });


export default router;
