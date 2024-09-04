/* eslint-disable */
import { lazy } from 'react';
import { USER_ROLE } from './constants.jsx';
import { DEFAULT_PATHS } from './config.jsx';




const apps = {};


const dashboards = {
  default: lazy(() => import('./views/dashboards/DashboardsDefault')),
};

const initiation = {
  index: lazy(() => import('./views/initiation/initiationWork')),
  grid: lazy(() => import('./views/initiation/gridList'))

};
const gis = {
  default: lazy(() => import('./views/gis/gisDefault')),

};




const pages = {
  index: lazy(() => import('./views/pages/Pages')),
  authentication: {
    index: lazy(() => import('./views/pages/authentication/Authentication')),
    login: lazy(() => import('./views/pages/authentication/Login')),
    register: lazy(() => import('./views/pages/authentication/Register')),
    forgotPassword: lazy(() => import('./views/pages/authentication/ForgotPassword')),
    resetPassword: lazy(() => import('./views/pages/authentication/ResetPassword')),
  },

};








const appRoot = DEFAULT_PATHS.APP.endsWith('/') ? DEFAULT_PATHS.APP.slice(1, DEFAULT_PATHS.APP.length) : DEFAULT_PATHS.APP;


const routesAndMenuItems = {

  mainMenuItems: [
    {
      path: DEFAULT_PATHS.APP,
      exact: true,
      redirect: true,
      to: `${appRoot}/loginpage`,
    },
   

    {
      path: `${appRoot}/dashboards`,
      component: dashboards.default,
      label: 'menu.dashboard',
    },
    
    {
      path: `${appRoot}/initiation`,
      label: 'menu.initiation',
      component: initiation.index,
      subs: [
        { path: '/CreateInitiation', label: 'menu.createInitiation', component: initiation.index },
        { path: '/GridInitiation', label: 'menu.gridInitiation', component: initiation.grid },
        // { path: '/CopyFCR', component: fcr.createfcr },
      ],
    },

    {
      path: `${appRoot}/gis`,
      component: gis.default,
      label: 'menu.gis',
    },
    
   



    {
      path: `${appRoot}/loginpage`,
      component: pages.authentication.login,
    },
    {
      path: `${appRoot}/registerpage`,
      component: pages.authentication.register,
    },
    {
      path: `${appRoot}/forgotpassword`,
      component: pages.authentication.forgotPassword,
    },



  ],
  sidebarItems: [
  ],
};

export default routesAndMenuItems;
