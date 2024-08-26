import React from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_PATHS } from '../../config.jsx';

const NavLogo = () => {
  return (
    <div className="logo position-relative">
      <Link to={DEFAULT_PATHS.USER_WELCOME}>
        {/*
          Logo can be added directly
          <img src="/img/logo/logo-white.svg" alt="logo" />
          Or added via css to provide different ones for different color themes
         */}
        <img src="../../../img/logo/logo.png" alt="logo" style={{ width: '300px' }} className="img-fluid" />
      </Link>
    </div>
  );
};
export default React.memo(NavLogo);
