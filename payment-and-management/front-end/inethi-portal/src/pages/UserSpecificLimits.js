import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useKeycloak } from '@react-keycloak/web';
import Navigation from '../Components/Navigation/Navigation';


function UserSpecificLimits() {
  const { keycloak } = useKeycloak();
  const [userLimits, setUserLimits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('keycloak_username'); // default search type

  axios.defaults.baseURL = 'http://0.0.0.0:8000';
  axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
  const [userLimitData, setUserLimitData] = useState({
    keycloak_id: '',
    cellphone_number: '',
    email: '',
    service_type_id: '',
    payment_method: '',
    payment_limit: '',
    payment_limit_period_sec: '',
  });
  const [errorMessage, setErrorMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);
const [editLimit, setEditLimit] = useState(false);
  const [createLimit, setCreateLimit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [services, setServices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [serviceType, setServiceType] = useState('');
const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('/get-services/'),
      axios.get('/payment-methods/')
    ])
      .then(([servicesResponse, paymentMethodsResponse]) => {
        setServices(servicesResponse.data);
        const paymentMethodsArray = Object.values(paymentMethodsResponse.data);
        setPaymentMethods(paymentMethodsArray);
      })
      .catch(error => {
        console.error(`Error fetching data: ${error}`);
      });
  }, []);
  // This will be called when the Edit button is clicked
const edit = (limit) => {
  const relatedService = services.find(service => service.id === limit.service_type_id);
  const relatedPaymentMethod = paymentMethods.find(method => method.id === limit.payment_method);

  setEditData({
    ...limit,
    service_name: relatedService ? relatedService.name : 'Not found',
    payment_method_name: relatedPaymentMethod ? relatedPaymentMethod.name : 'Not found',
  });
  setEditLimit(true);
};

  // This will handle the save action for the edited limit
  const save = () => {
    const payload = {
    ...editData,
      searchType: searchType,
    searchValue: searchTerm, // Include the search term in the payload
  };
    axios.put('http://0.0.0.0:8000/update-user-payment-limit/', payload, {
      headers: { 'Authorization': `Bearer ${keycloak.token}` }
    })
      .then(response => {
        setResponseMessage('Limit edited successfully!');
        setShowModal(true);
        setEditLimit(false); // Close the edit form
        searchUserData()
      })
      .catch(error => {
        setErrorMessage(`Error editing limit: ${error.response.data.error}`);
        setShowModal(true);
      });

  };

  const closeModal = () => {
    setShowModal(false);
    setErrorMessage(null);
  };
const searchUserLimits = (e) => {
  e.preventDefault(); // This will prevent the default form submission behavior

  if (searchTerm.trim() === '') {
    setErrorMessage('Please enter a search term.');
    setShowModal(true);
    return;
  }

  searchUserData()
};

const searchUserData = () => {
  const searchUrl = `http://0.0.0.0:8000/search-user-limits/?${searchType}=${searchTerm}`;

  axios.get(searchUrl, {
    headers: { 'Authorization': `Bearer ${keycloak.token}` }
  })
    .then(response => {
      setUserLimits(response.data)
      console.log(response.data)
    })
    .catch(error => {
      console.log(`Error fetching user limits: ${error}`);
    });
  }



  const handleInputChange = (e) => {
    setUserLimitData({
      ...userLimitData,
      [e.target.name]: e.target.value,
    });
  };

  const createUserSpecificLimit = (e) => {
    e.preventDefault();
    // Replace this URL with the correct endpoint for creating user-specific limits
    axios.post('http://0.0.0.0:8000/create-user-specific-limit/', {
      ...userLimitData,
      token: keycloak.token,
    })
      .then(response => {

        setUserLimitData({
          service_type_id: '',
          payment_method: '',
          payment_limit: '',
          payment_limit_period_sec: '',
        });
      setResponseMessage('User specific limit created successfully!');
      setShowModal(true);
      setUserLimits([])
    })
      .catch(error => {
      setErrorMessage(`Error creating user limit: ${error.response.data.error}`);
      setShowModal(true);
    });
  };

  return (
    <div className="homepage-container">
      <div>
        <Navigation />
      </div>
      <div className="homepage-content">
        <div>
  <h2>Search User Specific Limit</h2>
  <form onSubmit={searchUserLimits}>
    <label>
      Search By:
      <select name="searchType" value={searchType} onChange={e => setSearchType(e.target.value)} required>
        <option value="keycloak_username">Keycloak Username</option>
        <option value="phone_num">Phone Number</option>
        <option value="email">Email</option>
      </select>
    </label>
    <label>
      Search Term:
      <input name="searchTerm" type="text" placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} required />
    </label>
    <button type="submit">Search</button>
  </form>
</div>



        {userLimits.length > 0 && (
          <div>
            <h2>User Limits</h2>
            {/* Table to display user-specific limits */}
        <table className="table">
          <thead className="thead-light">
    <tr>
      <th>Service Name</th>
      <th>Payment Method</th>
      <th>Payment Limit</th>
      <th>Payment Limit Period (sec)</th>
      {(keycloak.tokenParsed && keycloak.tokenParsed.preferred_username === 'inethi') && (
        <th>Action</th>
      )}
    </tr>
  </thead>
          <tbody>
            {userLimits.map((limit, index) => {
              const relatedService = services.find(service => service.id === limit.service_type_id);
              const relatedPaymentMethod = paymentMethods.find(method => method.id === limit.payment_method);
              return (
                  <tr key={index}>
                    {/* Replace these with the correct fields */}
                    <td>{relatedService ? relatedService.name : 'Not found'}</td>
                    <td>{relatedPaymentMethod ? relatedPaymentMethod.name : 'Not found'}</td>
                    <td>{limit.payment_limit}</td>
                    <td>{limit.payment_limit_period_sec}</td>
                    {(keycloak.tokenParsed && keycloak.tokenParsed.preferred_username === 'inethi') && (
                        <td>
                          <button onClick={() => edit(limit)}>Edit</button>
                        </td>
                    )}
                  </tr>
              )
            })}
          </tbody>
        </table>
          </div>

        )}
        </div>
        <div>
          {editLimit && (
  <div className="card">
    <h2>Edit Limit</h2>
    <form onSubmit={e => { e.preventDefault(); save(); }}>
      <label>
        Service Name:
        <input name="service_name" type="text" value={editData && editData.service_name} readOnly />
      </label>
      <label>
        Payment Method:
        <input name="payment_method_name" type="text" value={editData && editData.payment_method_name} readOnly />
      </label>
      <label>
        Payment Limit:
        <input name="payment_limit" type="number" value={editData && editData.payment_limit} onChange={e => setEditData({...editData, payment_limit: e.target.value})} required />
      </label>
      <label>
        Payment Limit Period (sec):
        <input name="payment_limit_period_sec" type="number" value={editData && editData.payment_limit_period_sec} onChange={e => setEditData({...editData, payment_limit_period_sec: e.target.value})} required />
      </label>
      <button type="submit">Save</button>
    </form>
  </div>
)}
   <h2>Create User Specific Limit</h2>
      <form onSubmit={createUserSpecificLimit}>
        <label>
          Keycloak ID:
          <input name="keycloak_id" value={userLimitData.keycloak_id} onChange={handleInputChange}  />
        </label>
        <label>
          Cellphone Number:
          <input name="cellphone_number" value={userLimitData.cellphone_number} onChange={handleInputChange}  />
        </label>
        <label>
          Email:
          <input name="email" type="email" value={userLimitData.email} onChange={handleInputChange}  />
        </label>
        <label>
          Service Type ID:
          <select name="service_type_id" value={userLimitData.service_type_id} onChange={handleInputChange} required>
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
          <select name="payment_method" value={userLimitData.payment_method} onChange={handleInputChange} required>
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
      <input name="payment_limit" type="number" value={userLimitData.payment_limit} onChange={handleInputChange} required />
    </label>
    <label>
      Payment Limit Period (sec):
      <input name="payment_limit_period_sec" type="number" value={userLimitData.payment_limit_period_sec} onChange={handleInputChange} required />
    </label>
    <button type="submit">Create</button>
  </form>
</div>
       {/* Edit limit form */}



        {/* Create new limit form */}
        {createLimit && (
          <div className="card">
            <h2>Create New Limit</h2>
            {/* ... Similar form fields as edit, but for creating ... */}
          </div>
        )}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Response Message</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p>{errorMessage ? errorMessage : responseMessage}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default UserSpecificLimits;
