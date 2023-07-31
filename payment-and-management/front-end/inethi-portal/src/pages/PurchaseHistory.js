import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
import {useKeycloak} from "@react-keycloak/web";
import "bootstrap/dist/css/bootstrap.min.css";

function PurchaseHistory() {
    const [payments, setPayments] = useState([]);
    const { keycloak } = useKeycloak();
    const [services, setServices] = useState([]);
      axios.defaults.baseURL = 'http://0.0.0.0:8000';
      axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;


    useEffect(() => {
    // Fetch services
    axios
      .get("/get-services/")
      .then(response => {
        setServices(response.data);
        // console.log(response.data)
      })
      .catch(error => {
        console.error(`Error fetching services: ${error}`);
      });
}, []);

    useEffect(() => {
  // When services state updates and it's not an empty array, fetch payments
  if(services.length > 0) {
    fetchPayments(services).catch(error => console.error(`Error fetching payments: ${error}`));
  }
}, [services]);



    const fetchPayments = async () => {
    try {
        const response = await axios.get('/get-my-payments/', {
            headers: {
                'Authorization': `Bearer ${keycloak.token}`
            }
        });

        // Map over each payment in the response
        const updatedPayments = response.data.map(payment => {
            // Find the service that has the same id as the service_id of the current payment
            const service = services.find(service => service.id === payment.id);

            // If the service is found, create a new object that has all properties of the current payment and an additional name property that has the value of service.name
            if (service) {
                // console.log('found matches')
                return {
                    ...payment,
                    name: service.name
                };
            }

            // If the service is not found, return the payment as is
            return payment;
        });
        setPayments(updatedPayments);
        // console.log(updatedPayments);
    } catch (error) {
        console.log('Error fetching payments', error);
    }
};

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
    return (
        <div className="homepage-container">
            <div>
                <Navigation/>
            </div>
            <div className="homepage-content">
                <h1>Purchase History</h1>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Service Name</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Package</th>
                            <th>Life Span (minutes)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment, index) => (
                            <tr key={index}>
                                <td>{payment.name}</td>
                                <td>{payment.amount}</td>
                                <td>{formatDateTime(payment.paydate_time)}</td>
                                <td>{payment.package}</td>
                                <td>{Math.floor(Number(payment.service_period_sec)/60)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PurchaseHistory;
