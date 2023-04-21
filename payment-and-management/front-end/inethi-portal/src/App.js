import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import LoginPage from "./LoginPage";
import MainApp from "./MainApp";

function App() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return <LoginPage />;
  }

  return <MainApp />;
}

export default App;
