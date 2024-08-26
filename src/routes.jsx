/* eslint-disable */
import { lazy } from 'react';
import { USER_ROLE } from './constants.jsx';
import { DEFAULT_PATHS } from './config.jsx';




const apps = {};


const dashboards = {
  default: lazy(() => import('./views/dashboards/DashboardsDefault')),
};



const fieldSide = {
  default: lazy(() => import('./views/fieldSide/fieldSide')),

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
      path: `${appRoot}/fieldSide`,
      component: fieldSide.default,
      label: 'menu.fieldSide',
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
