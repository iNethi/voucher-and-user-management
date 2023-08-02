import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useKeycloak} from "@react-keycloak/web";


function PurchaseLimits() {
  const { keycloak } = useKeycloak();
  axios.defaults.baseURL = 'http://0.0.0.0:8000';
  axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [services, setServices] = useState([]);
  const [limits, setLimits] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
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
  Promise.all([
    axios.get('/get-services/'),
    axios.get('/getdefaultlimits/'),
    axios.get('/payment-methods/')
  ])
  .then(([servicesResponse, limitsResponse, paymentMethodsResponse]) => {
    console.log('servicesResponse')
    console.log(servicesResponse.data)
    setServices(servicesResponse.data);
    console.log('limitsResponse')
    console.log(limitsResponse.data)
    setLimits(limitsResponse.data);
    console.log('paymentMethodsResponse')
    console.log(paymentMethodsResponse.data)
    const paymentMethodsArray = Object.values(paymentMethodsResponse.data);
    setPaymentMethods(paymentMethodsArray);
  })
  .catch(error => {
    console.error(`Error fetching data: ${error}`);
  });
}, []);


  const edit = limit => {
    setEditLimit(limit);
    setEditData({
      service_type_id: limit.service_id,
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
    axios.put('/update-default-payment-limit/', editDataWithToken)
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
  axios.post('/create-default-payment-limit/', newLimitDataWithToken)
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
        <table className="table table-striped">
  <thead className="thead-light">
    <tr>
      <th>Service Name</th>
      <th>Service Description</th>
      <th>Payment Method</th>
      <th>Payment Limit</th>
      <th>Payment Limit Period (sec)</th>
      {(keycloak.tokenParsed && keycloak.tokenParsed.preferred_username === 'inethi') && (
        <th>Action</th>
      )}
    </tr>
  </thead>
  <tbody>
    {limits.map((limit, index) => {
      const relatedService = services.find(service => service.id === limit.service_id);
      const relatedPaymentMethod = paymentMethods.find(method => method.id === limit.payment_method);

      return (
        <tr key={index}>
          <td>{relatedService.name}</td>
          <td>{relatedService ? relatedService.description : 'Not found'}</td>
          <td>{relatedPaymentMethod ? relatedPaymentMethod.name : 'Not found'}</td>
          <td>{limit.payment_limit}</td>
          <td>{limit.payment_limit_period_sec}</td>
          {(keycloak.tokenParsed && keycloak.tokenParsed.preferred_username === 'inethi') && (
            <td>
              <button onClick={() => edit(limit)}>Edit</button>
            </td>
          )}
        </tr>
      );
    })}
  </tbody>
</table>
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
              Service:
              <select name="service_type_id" value={newLimitData.service_type_id} onChange={handleNewLimitInputChange}>
                <option value="">Select a service type</option>
                {services.map((service, index) => (
                  <option value={service.id} key={index}>
                    {service.name} - {service.description}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Payment Method:
              <select name="payment_method" value={newLimitData.payment_method} onChange={handleNewLimitInputChange}>
  <option value="">Select a payment method</option>
  {paymentMethods.map((method) => (
                    <option key={method.payment_method} value={method.payment_method}>
                      {method.name}
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
