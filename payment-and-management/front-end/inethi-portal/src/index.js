import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from './reportWebVitals';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import 'bootstrap/dist/css/bootstrap.min.css';
import keycloak from './keycloak';


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(

    <ReactKeycloakProvider authClient={keycloak}
            initOptions={{
                onLoad: "check-sso",
                checkLoginIframe: false
            }}>

        <App />

    </ReactKeycloakProvider>
);

reportWebVitals();
