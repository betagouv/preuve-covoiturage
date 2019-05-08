# Server authentication

This document explains how the operator or AOM servers can gain access to the registry API in a secure way.

Operators are entities with a pool of users attached to them. Users with an _admin_ role have the token creation and deletion permissions for their parent entity.

Token management in the dashboard is done through an Application section where applications can be created, edited or deleted. Each application has a name and a set of permissions. An ID and a secret token are generated for authentication. They must be kept secure and installed on the requesting server.

To access the API, an operator server will get a token first at `POST /auth/token` passing it's ID and secret token.  
The JWT token in the response must be stored locally for re-use.

Subsequent requests with the header `Authorization: Bearer {token}` will be accepted as long as the token is valid.

To enhance security, JWT tokens will be short-lived and a `401 Unauthorized` HTTP error code will be issued for invalid tokens. Therefore, a refresh mecanism should be implemented by the client to renew the token and retry the failed request.

## Generate journeys with Postman

1. Import the `Preuve de covoiturage.postman_collection.json` file
2. Import the `Preuve de covoiturage LOCAL.postman_environment.json` file
3. Run _Signin Operator 1_
4. Run _Auth/token_
5. Run _Journeys/Create (server)_
