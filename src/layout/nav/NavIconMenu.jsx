import React, { useState } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
//  import { NavLink, Link, Redirect, useHistory, useNavigate } from 'react-router-dom';
import { MENU_BEHAVIOUR } from '../../constants.jsx';
import { Auth } from 'aws-amplify';
import CsLineIcons from '../../cs-line-icons/CsLineIcons';
import { useAppContext } from '../../lib/contextLib';
import { settingsChangeColor } from '../../settings/settingsSlice';
import { removeSession } from '../../lib/commonLib';
import { useHistory } from 'react-router-dom';
import SearchModal from './search/SearchModal.jsx';
import FeedbackModal from './feedback/FeedbackModal.jsx';

import { menuChangeBehaviour } from './main-menu/menuSlice';

const NavIconMenu = () => {
 
   const history = useHistory();
  const { pinButtonEnable, behaviour } = useSelector((state) => state.menu);
  const { color } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  // const { loginUserRole, userName } = useAppContext();

  const onPinButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinButtonEnable) {
      dispatch(menuChangeBehaviour(behaviour === MENU_BEHAVIOUR.Pinned ? MENU_BEHAVIOUR.Unpinned : MENU_BEHAVIOUR.Pinned));
    }
    return false;
  };
  const onLightDarkModeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(settingsChangeColor(color.includes('light') ? color.replace('light', 'dark') : color.replace('dark', 'light')));
  };
  const onDisabledPinButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFeedbackModal, setFeedbackModal] = useState(false);

  const onSettingsIconClick = (e) => {
    e.preventDefault();
    setShowSearchModal(true);
    // useNavigate()
  };
  const onFeedbackIconClick = (e) => {
    history.push('/calendar'); 
  };
  const onLogout = async (e) => {
    e.preventDefault();
    await Auth.signOut();
   
    removeSession();
    // history.push('/loginpage');
    window.location.href = '/loginpage';
  };

  return (
    <>
      <ul className="list-unstyled list-inline text-center menu-icons">
        <li className="list-inline-item">
          <a href="#/" id="colorButton" onClick={onLightDarkModeClick}>
            <CsLineIcons icon="light-on" size="18" className="light" />
            <CsLineIcons icon="light-off" size="18" className="dark" />
          </a>
        </li>      

        {/* <IconMenuNotifications /> */}
        {/* <li className="list-inline-item">    */}
          {/* <a href="#/">       
            <span style={{cursor:'default'}}>{userName}({loginUserRole})</span>    
          </a>                 
        </li> */}
        <li className="list-inline-item">
        <a href="" onClick={onFeedbackIconClick}>
         
            <CsLineIcons icon="calendar" size="25" />
         </a>
        </li>
        {/* <li className="list-inline-item">
          <a href="/settings">
            <CsLineIcons icon="gear" size="18" />
          </a>
        </li> */}
        <li className="list-inline-item">
          <a href="#/" onClick={onLogout}>
            <CsLineIcons icon="logout" size="18" />
          </a>
        </li>
      </ul>
      <SearchModal show={showSearchModal} setShow={setShowSearchModal} />
      <FeedbackModal show={showFeedbackModal} setShow={setFeedbackModal}/>
    </>
  );
};

export default React.memo(NavIconMenu);
