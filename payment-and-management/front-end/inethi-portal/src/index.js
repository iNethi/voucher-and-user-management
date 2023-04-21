import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';

ReactDOM.render(
  <div>
    <ReactKeycloakProvider authClient={keycloak}
            initOptions={{
                onLoad: "check-sso",
                checkLoginIframe: false
            }}>
      <App />
    </ReactKeycloakProvider>
  </div>,
  document.getElementById('root')
);

reportWebVitals();
