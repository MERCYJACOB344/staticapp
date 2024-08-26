import  { useMemo, useState } from 'react';

// import redux for auth guard
import { useSelector } from 'react-redux';

// import layout
import Layout from './layout/Layout';

// import routing modules
import RouteIdentifier from './routing/components/RouteIdentifier';
import { getRoutes } from './routing/helper';
import routesAndMenuItems from './routes.jsx';
import Loading from './components/loading/Loading';


// import Date-Picker styling to be passed to all pages
//import 'react-datepicker/dist/react-datepicker.css';

import { AppContext } from './lib/contextLib';

const App = () => {
  
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [userEmail, setuserEmail] = useState('');
  const { currentUser, isLogin } = useSelector((state) => state.auth);
 
  

  let loginStatus = isLogin;
  let loginUserRole = currentUser.role ? currentUser.role : null;
  const fieldsurveyUser = JSON.parse(window.localStorage.getItem('fieldsurveyUser'));
  console.log(fieldsurveyUser);

  if (fieldsurveyUser !== null && fieldsurveyUser.isAuthenticated) {
    loginStatus = fieldsurveyUser.isAuthenticated;
    loginUserRole = fieldsurveyUser.userInfo ? fieldsurveyUser.userInfo.role : null;
  }
  
  
  



  const routes = useMemo(() => getRoutes({ data: routesAndMenuItems, isLogin: loginStatus }),[isLogin] );
  if (routes) {
    return (
      <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated, userEmail, setuserEmail,isLogin: loginStatus }}>
   
      <Layout>

          <RouteIdentifier routes={routes} fallback={<Loading />} />
          </Layout>
          </AppContext.Provider>
         
       
  
    );
  }
  return <></>;
};

export default App;
