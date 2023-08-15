import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from "../Components/Navigation/Navigation";
import {useKeycloak} from "@react-keycloak/web";

const UserList = () => {
  const [users, setUsers] = useState([]);
    const { keycloak } = useKeycloak();
  axios.defaults.baseURL = 'https://paum.inethilocal.net';
  axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;

  useEffect(() => {
    axios.get('/get-keycloak-users/')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div className="homepage-container">
      <div>
        <Navigation />
      </div>
      <div className="homepage-content">
      <h2>Users</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.keycloak_username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      </div>
  );
};

export default UserList;
