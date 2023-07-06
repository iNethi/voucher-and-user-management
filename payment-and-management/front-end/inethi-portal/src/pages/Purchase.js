import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Purchase() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    // Fetch packages
    axios
      .get("/get-packages/")
      .then(response => {
        setPackages(response.data);
      })
      .catch(error => {
        console.error(`Error fetching packages: ${error}`);
      });
  }, []);

  const handlePurchase = (pkg) => {
    const confirmation = window.confirm(`Are you sure you want to purchase ${pkg.name}?`);
    if (confirmation) {
      // Handle purchase logic here
      console.log(`Purchasing ${pkg.name}...`);
    }
  };

  return (
    <div className="homepage-container">
      <div>
        <Navigation/>
      </div>
      <div className="homepage-content">
        <h2>Packages</h2>
        {packages.length > 0 ? (
          <table className="table">
            <thead className="thead-light">
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Time Period</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td>{pkg.name}</td>
                  <td>{pkg.amount}</td>
                  <td>{pkg.time_period}</td>
                  <td>
                    <button onClick={() => handlePurchase(pkg)} className="btn btn-primary">Purchase</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No packages found.</p>
        )}
      </div>
    </div>
  );
}

export default Purchase;
