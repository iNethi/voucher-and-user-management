import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainApp from "./MainApp";
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from "./pages/HomePage";
import PurchaseLimits from "./pages/PurchaseLimits";
import Purchase from "./pages/Purchase";

function App() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/purchase-limits" element={<PurchaseLimits />} />
        <Route path="/purchases" element={<Purchase />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
