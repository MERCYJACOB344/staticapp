import { useAppContext } from './contextLib';
import { setCurrentUser } from '../auth/authSlice';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { USER_ROLE } from '../constants.jsx';

export function getInt(strVal, nVal = 0) {
  const tmpVal = parseInt(strVal, 10);
  if (Number.isNaN(tmpVal)) {
    return nVal;
  }
  return tmpVal;
}

export function getroundUp(strVal, nVal = 0) {
  const tmpVal = parseInt(strVal, 10);
  if (Number.isNaN(tmpVal)) {
    return nVal;
  }
  return Math.ceil(strVal);
}

export function getPercent(strVal, strTotal) {
  const tmpVal1 = parseInt(strVal, 10);
  const tmpVal2 = parseInt(strTotal, 10);
  if (Number.isNaN(tmpVal1)) {
    return 0;
  }
  if (Number.isNaN(tmpVal2)) {
    return 0;
  }
  if (tmpVal1 === 0) {
    return 0;
  }
  if (tmpVal2 === 0) {
    return 0;
  }
  // Round to 2 decimal places.
  return (Math.round((tmpVal1 / tmpVal2) * 100) * 100) / 100;
}

export function getDateValueAsString(strVal) {
  if (strVal === null || strVal === '') {
    return null;
  }
  return new Date(strVal);
}

export function setLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // catch possible errors:
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  }
}
export function convertToDms(deg, isLng) {
  deg = Number.parseFloat(deg).toFixed(6);
  const absDeg = Math.abs(deg);
  let d = Math.trunc(absDeg);
  d = Math.abs(d);
  const minfloat = (absDeg - d) * 60;
  let m = Math.trunc(minfloat);
  m = Math.abs(m);
  const secfloat = (minfloat - m) * 60;
  let s = Number.parseFloat(secfloat).toFixed(4);
  s = Math.abs(s);
  let dir = 'N';
  // After rounding, the seconds might become 60. These two
  // if-tests are not necessary if no rounding is done.
  if (s === 60) {
    m += 1;
    s = 0;
  }
  if (m === 60) {
    d += 1;
    m = 0;
  }
  if (deg < 0 && isLng) {
    dir = 'W';
  } else if (deg < 0) {
    dir = 'S';
  } else if (isLng) {
    dir = 'E';
  } else {
    dir = 'N';
  }

  const result = `${d}° ${m}' ${s}" ${dir}`;
  // console.log(result);
  return result;
}

export function getLocalStorage(key, initialValue) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : initialValue;
  } catch (e) {
    // if error, return initial value
    return initialValue;
  }
}

export function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Checks current browser session. If not valid session, redirect to login page.
export function checkForValidSession() {
  const { userHasAuthenticated } = useAppContext();
  const { setuserEmail } = useAppContext();
  const history = useHistory();
  const dispatch = useDispatch();

  const initialState = { isAuthenticated: false, userEmail: '', userInfo: null };
  const uasUser = getLocalStorage('uasUser', initialState);
  userHasAuthenticated(uasUser.isAuthenticated);

  const sQueryParam = window.location.pathname;
  if (uasUser.isAuthenticated) {
    setuserEmail(uasUser.userEmail);
    if (sQueryParam) {
      // history.push(sQueryParam);
    } else {
      history.push('/dashboards/default');
    }
    dispatch(setCurrentUser(uasUser.userInfo));
  } else {
    history.push(`/loginpage`);
  }
}

// Persist the session for browser refresh.
export function storeSession(loginState) {
  if (loginState !== 'no local storage') {
    setLocalStorage('uasUser', loginState);
  }
}

// Remove the session from browser when logout.
export function removeSession() {
  const initialState = { isAuthenticated: false, userEmail: '', userInfo: null, userName: '' };
  setLocalStorage('uasUser', initialState);
}

// Checks current user is admin
export function isAdmin() {
  const uasUser = JSON.parse(window.localStorage.getItem('uasUser'));
  if (uasUser) {
    return uasUser.userInfo.role === USER_ROLE.Admin;
  }
  return false;
}

// Console.logs only if the app.stage!=production

export function debugLogger(...message) {
  if (process.env.REACT_APP_DEBUG === 'on') {
    console.log(...message);
  }
}

export function handleValueChange(event, setFn, prop) {
  let val = null;
  if (event.target.type === 'checkbox') {
    val = event.target.checked;
  } else if (event.target.type === 'map') {
    val = event.target.value;
  } else {
    val = event.target.value;
  }

  setFn({
    ...prop,
    [event.target.name]: val,
  });
}
function subtractMonths(date, months) {
  date = new Date(date.setMonth(date.getMonth() - months));
  return date;
}
export function getCertificationStatus(latestTestDate) {
  let date = new Date();
  const dateBefore24 = subtractMonths(date, 24);
  date = new Date();
  const dateBefore23 = subtractMonths(date, 23);
  const dtlatestTestDate = new Date(latestTestDate);
  let certificationStatus;
  if (dateBefore24 > dtlatestTestDate) {
    certificationStatus = 'Expired';
  } else if (dateBefore24 < dtlatestTestDate && dateBefore23 > dtlatestTestDate) {
    certificationStatus = '30 Day Notice';
  } else {
    certificationStatus = 'Certified';
  }
  return certificationStatus;
}

export function convertoUSDate(strVal) {
  let usDate = new Date(strVal).toLocaleString('en-US').split(',')[0];
  if (usDate === 'Invalid Date') {
    usDate = '';
  }

  return usDate;
}

