import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Package() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(""); // Update initial value to an empty string
  const [formData, setFormData] = useState({
    amount: "",
    timePeriod: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

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


  useEffect(() => {
    if (packages.length > 0) {
      const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);
      setSelectedPackage(selectedPackage);
      setFormData({
        amount: selectedPackage ? selectedPackage.amount : "",
        timePeriod: selectedPackage ? selectedPackage.time_period : "",
      });
    }
  }, [packages, selectedPackageId]);

  // Handle package selection from dropdown


  // Function to format the datetime string
  const formatDateTime = datetime => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return new Date(datetime).toLocaleString("en-US", options);
  };

  // Handle package selection from dropdown
  const handlePackageSelection = event => {
    const packageId = Number(event.target.value);
    console.log(packageId)
    console.log(packages);
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    setSelectedPackage(selectedPackage);
    if (selectedPackage) {
      setFormData({
        amount: selectedPackage.amount,
        timePeriod: selectedPackage.time_period,
      });
    }
  };


  // Handle form input changes
  const handleInputChange = event => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = event => {
    event.preventDefault();

    if (!selectedPackage) {
      return;
    }

    const updatedPackage = {
      ...selectedPackage,
      amount: formData.amount,
      time_period: formData.timePeriod,

    };
    setResponseMessage("");
  setErrorMessage("");


    axios
    .put(`http://0.0.0.0:8000/edit_package/${selectedPackage.id}/`, updatedPackage)
        .then(response => {
        setResponseMessage("Package updated successfully.");
        // Update the packages array with the new details
      const updatedPackages = packages.map(pkg => {
        return pkg.id === selectedPackage.id ? {...pkg, ...response.data} : pkg;
      });

      setPackages(updatedPackages);
      })
      .catch(error => {
      // Display the error message from the server
      if (error.response && error.response.data) {
        // If the server sends an error message
        if (error.response.data.error) {setErrorMessage(error.response.data.error);}
        if (error.response.data.amount) {setErrorMessage(error.response.data.amount);}// no idea why this is amount???
      } else {
        // If the error did not come from the server (like network error)
        setErrorMessage("Error updating package.");
      }
      console.error(`Error updating package: ${error}`);
    });
  };

  return (
    <div className="homepage-container">
      <div>
        <Navigation />
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
                <th>Created Date</th>
                <th>Updated Date</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td>{pkg.name}</td>
                  <td>{pkg.amount}</td>
                  <td>{pkg.time_period}</td>
                  <td>{formatDateTime(pkg.created_date)}</td>
                  <td>{formatDateTime(pkg.updated_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No packages found.</p>
        )}
        {/* ... */}
      <div className="row">
        <div className="col-md-12">
          {packages.length > 0 && (
            <div>
              <h4>Select a Package:</h4>
              <select className="form-control" onChange={handlePackageSelection}>
                <option value="">Select a package</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          {selectedPackage && (
            <form onSubmit={handleSubmit}>
              <h4>Edit Package:</h4>
              <div className="form-group">
                <label htmlFor="amount">Amount:</label>
                <input
                  type="number"
                  className="form-control"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="timePeriod">Time Period:</label>
                <input
                  type="number"
                  className="form-control"
                  id="timePeriod"
                  name="timePeriod"
                  value={formData.timePeriod}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Update Package
              </button>
            </form>
          )}
        </div>
      </div>
      {/* ... */}

        {responseMessage && <div className="alert alert-success">{responseMessage}</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      </div>
    </div>
  );
}


export default Package;
