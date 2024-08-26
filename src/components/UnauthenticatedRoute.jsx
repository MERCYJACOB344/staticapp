import { debugLogger } from '../lib/commonLib';
import React, { cloneElement } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAppContext } from '../lib/contextLib';

export default function UnauthenticatedRoute(props) {
  const { isAuthenticated } = useAppContext();
  const { children } = props;
  const history = useHistory();

  // Function to parse query string parameter 'redirect'
  function querystring(name, url = window.location.href) {
    const parsedName = name.replace(/[[]]/g, '\\$&');
    const regex = new RegExp(`[?&]${parsedName}(=([^&#]*)|&|#|$)`, 'i');
    const results = regex.exec(url);

    if (!results || !results[2]) {
      return false;
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  // Logging for debugging purposes
  debugLogger('before unauth');
  const redirect = querystring('redirect');
  debugLogger('unauthen');

  if (isAuthenticated) {
    return <Link to={redirect || '/'} />;
  }

  // Render children with current props for unauthenticated user
  return cloneElement(children, props);
}
