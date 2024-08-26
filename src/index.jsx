// cra imports
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';


// import redux requirements
// import { Provider } from 'react-redux';
// import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
// import { store, persistedStore } from './store.js';

// import html head tags requirements
// import { Helmet } from 'react-helmet';
// import { REACT_HELMET_PROPS } from './config.js';

// import multi language
import LangProvider from './lang/LangProvider';

// import routing modules
import { BrowserRouter as Router } from 'react-router-dom';
import RouteIdentifier from './routing/components/RouteIdentifier';
import Loading from './components/loading/Loading.jsx';

// import routes
import { getLayoutlessRoutes } from './routing/helper';
import defaultRoutes from './routing/default-routes';
import routesAndMenuItems from './routes.jsx';
import { Provider } from 'react-redux';
import { store, persistedStore } from './store.jsx';


// import toastify for notification
//import { Slide, ToastContainer } from 'react-toastify';

// mock server register for demo
//import '@mock-api';
// import Amplify from 'aws-amplify';

// using aws-Amplify
// import { Amplify } from 'aws-amplify';
// import { DEFAULT_CONFIG } from './config';

// Amplify.configure({
//   Auth: {
//     mandatorySignIn: true,
//     region: DEFAULT_CONFIG.cognito.REGION,
//     userPoolId: DEFAULT_CONFIG.cognito.USER_POOL_ID,
//     identityPoolId: DEFAULT_CONFIG.cognito.IDENTITY_POOL_ID,
//     userPoolWebClientId: DEFAULT_CONFIG.cognito.APP_CLIENT_ID,
//   },
//   Storage: {
//     region: DEFAULT_CONFIG.s3.REGION,
//     bucket: DEFAULT_CONFIG.s3.BUCKET,
//     identityPoolId: DEFAULT_CONFIG.cognito.IDENTITY_POOL_ID,
//   },
//   API: {
//     endpoints: [
//       {
//         name: 'fieldsurvey',
//         endpoint: DEFAULT_CONFIG.apiGateway.URL,
//         region: DEFAULT_CONFIG.apiGateway.REGION,
//       },
//     ],
//   },
// });

const Main = () => {
  const layoutlessRoutes = useMemo(() => getLayoutlessRoutes({ data: routesAndMenuItems }), []);
  return (
    <Provider store={store}>
      <Router >
        <LangProvider>

          <RouteIdentifier routes={[...layoutlessRoutes, ...defaultRoutes]} fallback={<Loading />} />
        </LangProvider>

      </Router>
    </Provider>


  );
};

ReactDOM.render(<Main />, document.getElementById('root'));

/*
 * If you want to start measuring performance in your app, pass a function
 * to log results (for example: reportWebVitals(console.log))
 * or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
 */
//reportWebVitals();
