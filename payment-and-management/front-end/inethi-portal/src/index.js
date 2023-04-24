import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(

    <ReactKeycloakProvider authClient={keycloak}
            initOptions={{
                onLoad: "check-sso",
                checkLoginIframe: false
            }}>

        <App />

    </ReactKeycloakProvider>
,
  document.getElementById('root')
);

reportWebVitals();
