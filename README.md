# iNethi ft. User management and Voucher
An user management portal for iNethi

## Setting up
To set up **_Keycloak_** to allow users to log in to the front end follow these steps:
1. Log in to the Keycloak admin console and select the realm that you want to use. 
2. Click on the "Clients" link in the left-hand navigation menu. 
3. Click on the "Create" button to create a new client. 
4. In the "Client ID" field, enter the ID that you want to use for your client. 
5. In the "Client Protocol" field, select the protocol that you want to use for your client. If you are using a React app, you can select "openid-connect" as the protocol. 
6. In the "Root URL" field, enter the root URL of your React app. This is the URL that users will use to access your app. 
7. In the "Valid Redirect URIs" field, enter the URLs that are allowed to redirect to your app after authentication. If you are running your React app on localhost, you can enter http://localhost:3000/* as the valid redirect URI. 
8. In the "Web Origins" field, enter the URLs that are allowed to access your app. If you are running your React app on localhost, you can enter http://localhost:3000 as the web origin. 
9. In the "Access Type" field, select the type of access that you want to use for your client. If you are using a React app, you can select "public" as the access type. 
10. Click on the "Save" button to save your client.