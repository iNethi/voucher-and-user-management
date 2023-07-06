import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from "./pages/HomePage";
import PurchaseLimits from "./pages/PurchaseLimits";
import Purchase from "./pages/Purchase";
import ServicePage from "./pages/ServicePage";
import Package from "./pages/Package";

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
        <Route path="/default-purchase-limits" element={<PurchaseLimits />} />
        <Route path="/services" element={<ServicePage />} />
        <Route path="/packages" element={<Package />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
