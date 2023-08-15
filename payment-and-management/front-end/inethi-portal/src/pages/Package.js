import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useKeycloak } from "@react-keycloak/web";
import { Form, Button } from 'react-bootstrap';

function Package() {
  const { keycloak } = useKeycloak();
  axios.defaults.baseURL = 'https://paum.inethilocal.net';
  axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    amount: '',
    timePeriod: '',
    paymentMethod: "",
    description: "",
  });
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [packageErrorMessage, setPackageErrorMessage] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    timePeriod: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Fetch services
    axios
      .get("/get-services/")
      .then(response => {
        setServices(response.data);
      })
      .catch(error => {
        console.error(`Error fetching services: ${error}`);
      });
  }, []);

  useEffect(() => {
    // Fetch payment methods
    axios
      .get("/payment-methods/")
      .then((response) => {
        setPaymentMethods(response.data);
      })
      .catch((error) => {
        console.error(`Error fetching payment methods: ${error}`);
      });
  }, []);

  useEffect(() => {
    // Fetch packages
    axios
      .get("/get-packages/")
      .then(response => {
        setPackages(response.data);
        console.log(response.data)
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

  const handlePackageInputChange = (event) => {
    setPackageFormData({
      ...packageFormData,
      [event.target.name]: event.target.value,
    });
  };

  const handlePackageSubmit = (event) => {
    event.preventDefault();

    const newPackageData = {
      name: packageFormData.name,
      amount: parseInt(packageFormData.amount),
      time_period: parseInt(packageFormData.timePeriod),
      payment_method: packageFormData.paymentMethod,
      service_id: parseInt(selectedService),
      description: packageFormData.description
    };

    axios
      .post("/create-package/", newPackageData)
      .then((response) => {
        // Clear form data
        setPackageFormData({
          name: "",
          amount: "",
          timePeriod: "",
          paymentMethod: "",
          description: ""
        });
        // Refresh packages list
        axios
          .get("/get-packages/")
          .then((response) => {
            setPackages(response.data);
          })
          .catch((error) => {
            console.error(`Error fetching packages: ${error}`);
          });
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          setPackageErrorMessage(error.response.data.error);
        } else {
          setPackageErrorMessage("Error creating package.");
        }
        console.error(`Error creating package: ${error}`);
      });
  };

  // Handle package selection from dropdown
  const handlePackageSelection = event => {
    const packageName = event.target.value;
    console.log(packageName);
    console.log(packages);
    const selectedPackage = packages.find(pkg => pkg.name === packageName);
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
      amount:  parseInt(formData.amount),
      time_period: parseInt(formData.timePeriod), // Parse the value as an integer
      payment_method: selectedPackage.payment_method,
    };
    setResponseMessage("");
    setErrorMessage("");

    axios
      .put(`/edit-package/${encodeURIComponent(selectedPackage.name)}/`, updatedPackage)
      .then(response => {
    // Retrieve the updated package from the response data
    const updatedPackageData = response.data;

    // Update the packages array with the updated package
    const updatedPackages = packages.map(pkg => {
      if (pkg.name === updatedPackageData.name) {
        return updatedPackageData;
      }
      return pkg;
    });

    setPackages(updatedPackages);
    setResponseMessage("Package updated successfully.");
  })
      .catch(error => {
        // Display the error message from the server
        if (error.response && error.response.data) {
          // If the server sends an error message
          if (error.response.data.error) { setErrorMessage(error.response.data.error); }
          if (error.response.data.amount) { setErrorMessage(error.response.data.amount); } // no idea why this is amount???
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
          <table className="table table-striped">
            <thead className="thead-light">
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Payment Method</th>
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
                  <td>{pkg.payment_method.name}</td>
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
        <div className="row">
          <div className="col-md-12">
            {packages.length > 0 && (
              <div>
                <h4>Select a Package:</h4>
                <select className="form-control" onChange={handlePackageSelection}>
                  <option value="">Select a package</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.name}>
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
        {responseMessage && <div className="alert alert-success">{responseMessage}</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <div className="row">
          <div className="col-md-12">
            <h2>Create New Package</h2>
            <Form onSubmit={handlePackageSubmit}>
              <Form.Group controlId="packageName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={packageFormData.name}
                  onChange={handlePackageInputChange}
                  required
                />
                <Form.Group controlId="packageDescrition">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={packageFormData.description}
                  onChange={handlePackageInputChange}
                  required
                />
              </Form.Group>
              </Form.Group>
              <Form.Group controlId="packagePaymentMethod">
                <Form.Label>Payment Method</Form.Label>
                <Form.Control
                  as="select"
                  name="paymentMethod"
                  value={packageFormData.paymentMethod}
                  onChange={handlePackageInputChange}
                  required
                >
                  <option value="">Select a payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <div className="form-group">
                <label htmlFor="service">Service:</label>
                <select
                  className="form-control"
                  id="service"
                  name="service"
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <Form.Group controlId="packageAmount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={packageFormData.amount}
                  onChange={handlePackageInputChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="packageTimePeriod">
                <Form.Label>Time Period</Form.Label>
                <Form.Control
                  type="number"
                  name="timePeriod"
                  value={packageFormData.timePeriod}
                  onChange={handlePackageInputChange}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Create Package
              </Button>
              {packageErrorMessage && <div className="text-danger">{packageErrorMessage}</div>}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Package;
