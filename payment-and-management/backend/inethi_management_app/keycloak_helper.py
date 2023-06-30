from keycloak import KeycloakOpenID


class KeycloakClient:
    def __init__(self, server_url, client_id, realm_name):
        self.keycloak_openid = KeycloakOpenID(
            server_url=server_url,
            client_id=client_id,
            realm_name=realm_name
        )

    def get_user_info(self, token):
        return self.keycloak_openid.userinfo(token)

    def get_token(self, username, password):
        return self.keycloak_openid.token(username, password)
