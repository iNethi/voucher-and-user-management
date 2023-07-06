import React from "react";
import Navigation from "../Components/Navigation/Navigation";

function Package() {
  return (
    <div className="homepage-container">
        <div className>
            <Navigation/>
        </div>
        <div className="homepage-content">
            <p>This is the Packages page</p>
        </div>
    </div>
  );
}

export default Package;
