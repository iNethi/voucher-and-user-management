import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const { keycloak } = useKeycloak();

  return (
    <div className="homepage-container">
      <div className="homepage-navbar">
        <ul>
          {/*<li><Link to="/purchaselimits">PurchaseLimits</Link></li>*/}
          {/*<li><Link to="/HomePage">Purchase</Link></li>*/}
        </ul>
      </div>
      <div className="homepage-content">
        <h1>Welcome, {keycloak.authenticated && keycloak.tokenParsed.preferred_username}!</h1>
        <p>You are now logged in to the app</p>
      </div>
    </div>
  );
}

export default HomePage;
