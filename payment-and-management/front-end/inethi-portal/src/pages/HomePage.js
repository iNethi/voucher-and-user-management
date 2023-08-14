import React, { useEffect } from 'react';
import { useKeycloak } from "@react-keycloak/web";

import "./HomePage.css";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
axios.defaults.baseURL = 'http://paum.inethilocal.net';
function HomePage() {
  const { keycloak } = useKeycloak();

  return (
    <div className="homepage-container">
      <div>
        <Navigation/>
      </div>
      <div className="homepage-content">
        <h1>Welcome, {keycloak.authenticated && keycloak.tokenParsed.preferred_username}!</h1>
        <p>You are now logged in to the app</p>
      </div>
    </div>
  );
}

export default HomePage;
