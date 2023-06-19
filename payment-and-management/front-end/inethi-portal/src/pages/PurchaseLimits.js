import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
axios.defaults.baseURL = 'http://0.0.0.0:8000';

function PurchaseLimits() {
  const [services, setServices] = useState([]);
  const [limits, setLimits] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [editLimit, setEditLimit] = useState(null);
  const [editData, setEditData] = useState({
    service_type_id: '',
    payment_method: '',
    payment_limit: '',
    payment_limit_period_sec: '',
  });

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

  const edit = limit => {
    setEditLimit(limit);
    setEditData({
      service_type_id: limit.service_type_id,
      payment_method: limit.payment_method,
      payment_limit: limit.payment_limit,
      payment_limit_period_sec: limit.payment_limit_period_sec,
    });
  };

  const handleInputChange = e => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const save = () => {
    axios.put('/update_default_payment_limit/', editData)
      .then(response => {
        const updatedLimit = response.data;
        setLimits(limits.map(limit => limit === editLimit ? updatedLimit : limit));
        setEditLimit(null);
        setEditData({
          service_type_id: '',
          payment_method: '',
          payment_limit: '',
          payment_limit_period_sec: '',
        });
      })
      .catch(error => {
        console.error(`Error updating default payment limit: ${error}`);
      });
  };

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
                <button onClick={() => edit(limit)}>Edit</button>
              </li>
            );
          })}
        </ul>
        {editLimit && (
          <div>
            <h2>Edit Limit</h2>
            <label>Service Type ID: <input name="service_type_id" value={editData.service_type_id} onChange={handleInputChange} /></label>
            <label>Payment Method: <input name="payment_method" value={editData.payment_method} onChange={handleInputChange} /></label>
            <label>Payment Limit: <input name="payment_limit" value={editData.payment_limit} onChange={handleInputChange} /></label>
            <label>Payment Limit Period (sec): <input name="payment_limit_period_sec" value={editData.payment_limit_period_sec} onChange={handleInputChange} /></label>
            <button onClick={save}>Save</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PurchaseLimits;
