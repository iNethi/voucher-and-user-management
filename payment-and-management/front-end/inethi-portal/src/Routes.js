import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Purchase from "./Purchase";
import PurchaseLimits from "./PurchaseLimits";

function RouteForApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" component={HomePage} />
        <Route path="/purchaselimits" component={PurchaseLimits} />
        <Route path="/purchase" component={Purchase} />
    </Routes>
    </BrowserRouter>
  );
}

export default RouteForApp;
