import { LAYOUT, MENU_BEHAVIOUR, NAV_COLOR, MENU_PLACEMENT, RADIUS, THEME_COLOR, USER_ROLE } from './constants.jsx';
 
export const IS_DEMO = false;
export const IS_AUTH_GUARD_ACTIVE = true;
export const SERVICE_URL = '/app';
export const USE_MULTI_LANGUAGE = true;
//export const GOOGLE_MAP_KEY = process.env.REACT_APP_GOOGLE_MAP_KEY;
 
// For detailed information: https://github.com/nfl/react-helmet#reference-guide
export const REACT_HELMET_PROPS = {
  defaultTitle: 'UAS Dashboard',
  titleTemplate: 'UAS Dashboard | %s',
};
 
export const DEFAULT_PATHS = {
  APP: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  USER_WELCOME: '/dashboards/default',
  NOTFOUND: '/page-not-found',
  UNAUTHORIZED: '/unauthorized',
  INVALID_ACCESS: '/invalid-access',
};
 
export const DEFAULT_SETTINGS = {
  MENU_PLACEMENT: MENU_PLACEMENT.Horizontal,
  MENU_BEHAVIOUR: MENU_BEHAVIOUR.Pinned,
  LAYOUT: LAYOUT.Fluid,
  RADIUS: RADIUS.Rounded,
  COLOR: THEME_COLOR.LightBlue,
  NAV_COLOR: NAV_COLOR.Default,
  USE_SIDEBAR: false,
};
 
export const DEFAULT_USER = {
  id: 1,
  name: 'Lisa Jackson',
  thumb: '/img/profile/profile-9.webp',
  role: USER_ROLE.Admin,
  email: 'lisajackson@gmail.com',
};
//  export const DEFAULT_CONFIG = {
//  s3: {
//   REGION: import.meta.env.VITE_REGION,
//   BUCKET: import.meta.env.VITE_BUCKET,
// },
// apiGateway: {
//   REGION: import.meta.env.VITE_REGION,
//   URL: import.meta.env.VITE_API_URL,
// },
// cognito: {
//   REGION: import.meta.env.VITE_REGION,
//   USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
//   APP_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
//   IDENTITY_POOL_ID: import.meta.env.VITE_IDENTITY_POOL_ID,
// },
// };
export const REDUX_PERSIST_KEY = 'classic-dashboard';