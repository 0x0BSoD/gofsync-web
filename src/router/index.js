import Vue from 'vue';
import Router from 'vue-router';
import HosGroup from '../views/hostgroup/Hostgroup';
import Login from '../views/Login';
import Batch from '../views/Batch';
import JsonEditor from '../views/editor/JsonEditor';
import Locations from '../views/editor/LocationsEditor';
import Error from '../views/Error';
import SweStatus from '../views/SweStatus';
import SweStatusGit from '../views/SweStatusGit';
import Jobs from '../views/Jobs';
import Index from '../views/Index';

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
            path: '/swe',
            name: 'swe',
            component: SweStatus
        },
        {
            path: '/swegit',
            name: 'swegit',
            component: SweStatusGit
        },
        {
            path: '/error',
            name: 'error',
            component: Error
        },
        {
            path: '/jobs',
            name: 'jobs',
            component: Jobs
        },
        {
            path: '/',
            name: 'index',
            component: Index
        },
        {
            path: '*',
            redirect: 'index',
        }
    ]
});

export default router;
