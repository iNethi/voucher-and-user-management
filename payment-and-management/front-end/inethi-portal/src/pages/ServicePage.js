import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../Components/Navigation/Navigation';
import { Button, Modal, Form } from 'react-bootstrap';

axios.defaults.baseURL = 'http://0.0.0.0:8000';

function ServicePage() {
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
    axios.get('/services/')
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

    axios.post('/create-service-type/', formData)
      .then(response => {
        setModalMessage("Successfully created a new service type.");
        setShowModal(true);
        // Refresh services list
        axios.get('/services/')
          .then(response => {
            setServices(response.data);
          });
      })
      .catch(error => {
        setModalMessage("Failed to create a new service type. " + error.response.data.error);
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
         <ul>
          {services.map((service, index) => (
            <li key={index}>Name: {service.description}, ID: {service.service_type_id}</li>
          ))}
        </ul>
        <h2>Create a New Service</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="serviceTypeId">
            <Form.Label>Service Type ID</Form.Label>
            <Form.Control type="text" name="service_type_id" onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" name="description" onChange={handleChange} required />
          </Form.Group>
          <Form.Group controlId="payType">
            <Form.Label>Pay Type</Form.Label>
            <Form.Control as="select" name="pay_type" onChange={handleChange} required>
              <option value="FR">Free</option>
              <option value="PA">Paid</option>
            </Form.Control>
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

      </div>
    </div>
  );
}

export default ServicePage;
