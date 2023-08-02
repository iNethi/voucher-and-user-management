import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useKeycloak} from "@react-keycloak/web";

const UserList = () => {
  const [users, setUsers] = useState([]);
    const { keycloak } = useKeycloak();
  axios.defaults.baseURL = 'http://0.0.0.0:8000';
  axios.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;

  useEffect(() => {
    axios.get('http://0.0.0.0:8000/get-keycloak-users/')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div className="container mt-5">
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
              <td>{user.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
