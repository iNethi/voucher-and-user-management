import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
axios.defaults.baseURL = 'http://0.0.0.0:8000';

function PurchaseLimits() {
  const [services, setServices] = useState([]);
  const [limits, setLimits] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});

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

    // Fetch payment methods
    axios.get('/payment-methods/')
      .then(response => {
        setPaymentMethods(response.data);
      })
      .catch(error => {
        console.error(`Error fetching payment methods: ${error}`);
      });

  }, []);

  return (
    <div className="homepage-container">
      <div>
        <Navigation />
      </div>
      <div className="homepage-content">
        <h1>Default Purchase Limits</h1>
        <ul>
          {limits.map((limit, index) => {
            const relatedService = services.find(service => service.service_type_id === limit.service_type_id);

            return (
              <li key={index}>
                Service Type ID: {limit.service_type_id},
                Service Description: {relatedService ? relatedService.description : 'Not found'},
                Payment Method ID: {limit.payment_method},
                Payment Method: {paymentMethods[limit.payment_method]},
                Payment Limit: {limit.payment_limit},
                Payment Limit Period (sec): {limit.payment_limit_period_sec}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default PurchaseLimits;
