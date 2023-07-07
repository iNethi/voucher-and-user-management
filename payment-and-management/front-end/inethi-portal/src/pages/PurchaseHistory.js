import React, { useEffect, useState } from "react";
import Navigation from "../Components/Navigation/Navigation";
import axios from "axios";
import {useKeycloak} from "@react-keycloak/web";
import "bootstrap/dist/css/bootstrap.min.css";

function PurchaseHistory() {
    const [payments, setPayments] = useState([]);
    const { keycloak } = useKeycloak();
      axios.defaults.baseURL = 'http://0.0.0.0:8000';
      axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await axios.get('/get-my-payments/', {
                headers: {
                    'Authorization': `Bearer ${keycloak.token}`
                }
            });
            setPayments(response.data);
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
                            <th>Service ID</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Package</th>
                            <th>Life Span (minutes)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment, index) => (
                            <tr key={index}>
                                <td>{payment.service_type_id}</td>
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
