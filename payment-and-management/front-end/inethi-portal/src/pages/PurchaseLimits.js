import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useKeycloak} from "@react-keycloak/web";
axios.defaults.baseURL = 'http://0.0.0.0:8000';

function PurchaseLimits() {
  const { keycloak } = useKeycloak();
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
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
  const [newLimitData, setNewLimitData] = useState({
    service_type_id: '',
    payment_method: '',
    payment_limit: '',
    payment_limit_period_sec: '',
  });

  useEffect(() => {
    // Fetch services
    axios.get('/services/')
      .then(response => {
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
      ...editData, // create a new object with the same properties as an existing object
      [e.target.name]: e.target.value,
    });
  };

  const handleNewLimitInputChange = e => {
    setNewLimitData({
      ...newLimitData,
      [e.target.name]: e.target.value,
    });
  };

  const save = () => {
    const editDataWithToken = {
    ...editData,
    token: keycloak.token,  // append token to formData
  };
    axios.put('/update_default_payment_limit/', editDataWithToken)
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
        console.log(updatedLimit)
      setResponseMessage(`Successfully updated limit.`);
    setShowModal(true);
  })
  .catch(error => {
    console.error(`Error updating default payment limit: ${error.response.data.error}`);
setErrorMessage(`Error updating default payment limit: ${error.response.data.error}`);
setShowModal(true);

  });
  };

const createNewLimit = e => {
  e.preventDefault();
  const newLimitDataWithToken = {
    ...newLimitData,
    token: keycloak.token,  // append token to formData
  };
  axios.post('/create_default_payment_limit/', newLimitDataWithToken)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        setLimits([...limits, response.data]);
        setNewLimitData({
          service_type_id: '',
          payment_method: '',
          payment_limit: '',
          payment_limit_period_sec: '',
        });
        setResponseMessage(`Successfully created limit`);
        setShowModal(true);
      } else {
        throw Error('Server responded with an error status');
      }
    })
    .catch(error => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setErrorMessage(`ERROR: ${error.response.data.error}`);
        setShowModal(true);
      } else {
        // Something happened in setting up the request and triggered an Error
        console.error(`Error creating new limit: ${error.message}`);
      }
    });
};

  return (
    <div className="homepage-container">
      <div>
        <Navigation />
      </div>
      <div className="homepage-content">
        <h1>Default Purchase Limits</h1>
        <div>
          <h2>Default Limits</h2>
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
                {(keycloak.tokenParsed && keycloak.tokenParsed.preferred_username === 'inethi') && (
        <button onClick={() => edit(limit)}>Edit</button>
      )}
              </li>
            );
          })}
        </ul>
          {editLimit && (
  <div className="card">
    <h2>Edit Limit</h2>
    <form>
      <label>
        Service Type ID:
        <input name="service_type_id" value={editData.service_type_id} readOnly />
      </label>
      <label>
        Payment Method:
        <input name="payment_method" value={editData.payment_method} readOnly />
      </label>
      <label>
        Payment Limit:
        <input name="payment_limit" type="number" value={editData.payment_limit} onChange={handleInputChange} required />
      </label>
      <label>
        Payment Limit Period (sec):
        <input name="payment_limit_period_sec" type="number" value={editData.payment_limit_period_sec} onChange={handleInputChange} required />
      </label>
      <button type="button" onClick={save}>Save</button>
    </form>
  </div>
)}
          {(keycloak.tokenParsed && keycloak.tokenParsed.preferred_username === 'inethi') && (
<div>
          <h2>Create New Limit</h2>
          <form onSubmit={createNewLimit}>
            <label>
              Service Type ID:
              <select name="service_type_id" value={newLimitData.service_type_id} onChange={handleNewLimitInputChange}>
                <option value="">Select a service type</option>
                {services.map((service, index) => (
                  <option value={service.service_type_id} key={index}>
                    {service.service_type_id} - {service.description}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Payment Method:
              <select name="payment_method" value={newLimitData.payment_method} onChange={handleNewLimitInputChange}>
                <option value="">Select a payment method</option>
                {Object.entries(paymentMethods).map(([key, value], index) => (
                  <option value={key} key={index}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Payment Limit:
              <input name="payment_limit" type="number" value={newLimitData.payment_limit} onChange={handleNewLimitInputChange} required />
            </label>
            <label>
              Payment Limit Period (sec):
              <input name="payment_limit_period_sec" type="number" value={newLimitData.payment_limit_period_sec} onChange={handleNewLimitInputChange} required />
            </label>
            <button type="submit">Create New Limit</button>
          </form>
  </div>
)}

        </div>



      </div>
      {showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Response Message</h5>
          <button type="button" className="btn-close" onClick={() => {setShowModal(false); setErrorMessage(null);}}></button>
        </div>
        <div className="modal-body">
          <p>{errorMessage ? errorMessage : responseMessage}</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={() => {setShowModal(false); setErrorMessage(null);}}>Close</button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default PurchaseLimits;
