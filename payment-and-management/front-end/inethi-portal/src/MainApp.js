import React, { useState, useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";

function App() {
  const [keycloakInitialized, setKeycloakInitialized] = useState(false);
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    setKeycloakInitialized(true);
  }, []);

  if (!keycloakInitialized || !initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return <LoginPage />;
  }

  return <HomePage />;
}

export default App;
