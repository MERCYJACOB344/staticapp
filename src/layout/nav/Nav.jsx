import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useHistory, useLocation, Link, BrowserRouter, Route, Redirect } from 'react-router-dom';
import { useAppContext } from '../../lib/contextLib';
import { MENU_BEHAVIOUR, MENU_PLACEMENT } from '../../constants.jsx';

import NavUserMenu from './NavUserMenu';
import NavIconMenu from './NavIconMenu';
import MainMenu from './main-menu/MainMenu';
import NavLogo from './NavLogo';
import NavMobileButtons from './NavMobileButtons';
import { menuChangeAttrMenuAnimate, menuChangeCollapseAll } from './main-menu/menuSlice';
import NavLanguageSwitcher from './NavLanguageSwitcher';




const DELAY = 80;

const Nav = () => {
  const dispatch = useDispatch();
  const { navClasses, placementStatus, behaviourStatus, attrMobile, menuPadding } = useSelector((state) => state.menu);
  const mouseActionTimer = useRef(null);
  const history = useHistory();
  const { pathname, search } = useLocation();
  const { isAuthenticated } = useAppContext();
  const {loginStatus} = useAppContext();

  // const refresh = window.performance.getEntriesByType('navigation')[0].type;
  // console.log(refresh);

  // Vertical menu semihidden state showing
  // Only works when the vertical menu is active and mobile menu closed
  const onMouseEnterDelay = () => {
    if (placementStatus.placementHtmlData === MENU_PLACEMENT.Vertical && behaviourStatus.behaviourHtmlData === MENU_BEHAVIOUR.Unpinned && attrMobile !== true) {
      dispatch(menuChangeCollapseAll(false));
      dispatch(menuChangeAttrMenuAnimate('show'));
    }
  };

  // Delayed one that hides or shows the menu. It's required to prevent collapse animation getting stucked
  const onMouseEnter = () => {
    if (mouseActionTimer.current) clearTimeout(mouseActionTimer.current);

    mouseActionTimer.current = setTimeout(() => {
      onMouseEnterDelay();
    }, DELAY);
  };

  // Vertical menu semihidden state hiding
  // Only works when the vertical menu is active and mobile menu closed
  const onMouseLeaveDelay = () => {
    if (placementStatus.placementHtmlData === MENU_PLACEMENT.Vertical && behaviourStatus.behaviourHtmlData === MENU_BEHAVIOUR.Unpinned && attrMobile !== true) {
      dispatch(menuChangeCollapseAll(true));
      dispatch(menuChangeAttrMenuAnimate('hidden'));
    }
  };

  const onMouseLeave = () => {
    if (mouseActionTimer.current) clearTimeout(mouseActionTimer.current);
    mouseActionTimer.current = setTimeout(() => {
      onMouseLeaveDelay();
    }, DELAY);
  };


  if (isAuthenticated) {
    return (
      <div id="nav" className={classNames('nav-container d-flex', navClasses)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <div
          className="nav-content d-flex"
          style={placementStatus.placementHtmlData === MENU_PLACEMENT.Horizontal && menuPadding ? { paddingRight: menuPadding } : {}}
        >
          <NavLogo />
          <NavIconMenu />
          <MainMenu />
          <NavMobileButtons />
        </div>
        <div className="nav-shadow" />
      </div>
    );
  }
  return (
    <div id="nav" className={classNames('nav-container d-flex', navClasses)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div
        className="nav-content d-flex"
        style={placementStatus.placementHtmlData === MENU_PLACEMENT.Horizontal && menuPadding ? { paddingRight: menuPadding } : {}}
      >
        <NavLogo />
        {/* <Redirect to={{ pathname: '/loginpage' }} /> */}
      </div>
      <div className="nav-shadow" />
    </div>
  );
};
export default React.memo(Nav);

