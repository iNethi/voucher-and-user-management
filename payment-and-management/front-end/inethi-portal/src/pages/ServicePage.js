import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../Components/Navigation/Navigation';
axios.defaults.baseURL = 'http://0.0.0.0:8000';
function ServicePage() {

  const [services, setServices] = useState([]);
  const [limits, setLimits] = useState([]);

  useEffect(() => {
    // Fetch services
    axios.get('/services/')
      .then(response => {
          console.log(response.data);
        setServices(response.data);
      })
      .catch(error => {
        console.error(`Error fetching services: ${error}`);
      });

    // Fetch default payment limits
    axios.get('/getdefaultlimits/')
      .then(response => {
        setLimits(response.data);
      })
      .catch(error => {
        console.error(`Error fetching default payment limits: ${error}`);
      });
  }, []);

return (
  <div className="homepage-container">
    <div>
      <Navigation/>
    </div>
    <div className="homepage-content">
      <h1>Services</h1>
      <ul>
        {services.map((service, index) => (
          <li key={index}>Name: {service.description}, ID: {service.service_type_id}</li>
        ))}
      </ul>
    </div>
  </div>
);


}

export default ServicePage;
