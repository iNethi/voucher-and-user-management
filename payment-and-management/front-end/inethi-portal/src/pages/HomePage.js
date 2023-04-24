import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { Link } from "react-router-dom";
import "./HomePage.css";
import Navigation from "../Components/Navigation/Navigation";

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
