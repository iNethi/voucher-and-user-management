import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../Components/Navigation/Navigation';
import { Button, Modal, Form } from 'react-bootstrap';
import { useKeycloak } from "@react-keycloak/web";


function ServicePage() {
  const { keycloak } = useKeycloak();
  axios.defaults.baseURL = 'http://paum.inethilocal.net';
  axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formData, setFormData] = useState({
    service_type_id: "",
    description: "",
    pay_type: ""
  });

  useEffect(() => {
    // Fetch services
    axios.get('/get-services/')
      .then(response => {
        console.log(response.data);
        setServices(response.data);
      })
      .catch(error => {
        console.error(`Error fetching services: ${error}`);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  const fromData= {
    name: formData.name,
    description: formData.description,
  };

  axios.post('/create-service-type/', fromData)
    .then(response => {
      setModalMessage("Successfully created a new service type.");
      setShowModal(true);
      // Refresh services list
      axios.get('/get-services/')
        .then(response => {
          setServices(response.data);
        });
      })
      .catch(error => {
        setModalMessage(error.response.data.error);
        setShowModal(true);
      });
  };


  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="homepage-container">
      <div>
        <Navigation />
      </div>
      <div className="homepage-content">
        <h1>Services</h1>
        <h2>Available Services</h2>
        <table className="table table-striped">
          <thead className="thead-light">
            <tr>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.name}>
                <td>{service.name}</td>
                <td>{service.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {keycloak.tokenParsed && keycloak.tokenParsed.preferred_username === 'inethi' && (
          <>
            <h2>Create a New Service</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="serviceName">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" onChange={handleChange} required />
              </Form.Group>
              <Form.Group controlId="serviceDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" name="description" onChange={handleChange} required />
              </Form.Group>

              <Button variant="primary" type="submit">Create</Button>
            </Form>
            <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Service Type Creation Status</Modal.Title>
              </Modal.Header>
              <Modal.Body>{modalMessage}</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
}

export default ServicePage;
