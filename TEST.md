# Manual testing of API through Postman collection

> import the postman collection file to postman, The file is located in the repo.

## Tests

_Note: It can take up to 30s the get a response on the first request. The API is deployed on a free version of "Render" which sets the service to sleep when it has not been used for a while_

Follow these steps for testing the api with the Postman collection. The requests should mostly fall in order with the collection.

1. Run the first request "root"

```json
// Expected response. Example.
{
  "message": "Welcome to Fishing club API",
  "_links": {
    "self": {
      "href": "https://api-a2.onrender.com",
      "method": "GET"
    },
    "auth": {
      "href": "https://api-a2.onrender.com/auth",
      "method": "GET"
    },
    "reports": {
      "href": "https://api-a2.onrender.com/reports",
      "method": "GET"
    }
  }
}
```

2. TODO ANON REQUESTS

```json
// Expected response. Example.
{
  "reports": [
    {
      "position": {
        "latitude": -45.0311,
        "longitude": 168.6626
      },
      "locationName": "Lake Wakatipu",
      "city": "Queenstown",
      "fishSpecies": "Trout",
      "weight": 6,
      "length": 80,
      "imageUrl": "https://example.com/images/trout.jpg",
      "dateOfCatch": "2022-07-15T00:00:00.000Z",
      "createdAt": "2023-03-31T16:10:46.905Z",
      "updatedAt": "2023-03-31T16:10:46.905Z",
      "id": "64270606364a523854b37c66",
      "_links": {
        "self": {
          "href": "https://api-a2.onrender.com/reports/64270606364a523854b37c66",
          "method": "GET"
        },
        "all": {
          "href": "https://api-a2.onrender.com/reports",
          "method": "GET"
        }
      }
    }
    // ... more report objects ....
  ],
  "_links": {
    "self": {
      "href": "https://api-a2.onrender.com/reports",
      "method": "GET"
    }
  }
}
```

3. Run "GET auth" request

```json
// Expected response. Example.
{
  "message": "Endpoint for authentication",
  "_links": {
    "self": {
      "href": "https://api-a2.onrender.com/auth",
      "method": "GET"
    },
    "login": {
      "href": "https://api-a2.onrender.com/auth/login",
      "method": "POST"
    },
    "register": {
      "href": "https://api-a2.onrender.com/auth/register",
      "method": "POST"
    }
  }
}
```

4. Run "POST register" request. The request body should already be filled in.

```json
// Expected response. Example.
{
  "_links": {
    "self": {
      "href": "https://api-a2.onrender.com/auth/register",
      "method": "POST"
    },
    "login": {
      "href": "https://api-a2.onrender.com/login/",
      "method": "POST"
    }
  }
}
```

5. Run "POST login" request. The request body should already be filled in.

```json
// Expected response. Example.
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDI3MDM5ZDM2NGE1MjM4NTRiMzdjNjAiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ1c2VyMSIsImdpdmVuX25hbWUiOiJVc2VyIiwiZmFtaWx5X25hbWUiOiJPbmUiLCJpYXQiOjE2ODAyNzg1NTIsImV4cCI6MTY4MDI4MjA5Mn0.oxSosRMtqaLAr8EC2udHmMCcbFmCqtC41xvhnrD85LbVWMESC4yrEP4yOesFd9s9lfSSC-7Yo4GR3n2PStx4nFNb3GRU-xddPz3LElhd70HqJ52oZ0Vvn0mcwAC6gPT4tNE2LYnsn7xyv_CCqeldYeT1YZErxfFEqXZKxVuysjeh33Fh2vhI_9mwSyeHlhhrCle9gRrrInkZnUx8sUrNlllBhXcZyd0EqrLGc_gRbBslmKwrdmlQcZjeBWT6HEtXxTXoYVNRxvKu35qMLGRtKknPfCFQ3IEZGvQ6_dIQSqreWjKZrg3DH8bSVdc_cKtzWEh8awMWWlP176ncP2SOag",
  "_links": {
    "self": {
      "href": "https://api-a2.onrender.com/auth/login",
      "method": "POST"
    },
    "reports": {
      "href": "https://api-a2.onrender.com/reports/",
      "method": "GET"
    }
  }
}
```

6. Copy the access_token string from the previus response and insert as Bearer Token under the Auth tab in the collection "1dv027-API-Collcetion" root. In this way subsequent request can inherit the access token. Run "GET all reports" request.

```json
// Expected response. Example.
{
  "reports": [],
  "_links": {
    "self": {
      "href": "https://api-a2.onrender.com/reports",
      "method": "GET"
    },
    "subscribeWebhookUpdatesAllNewReports": {
      "href": "https://api-a2.onrender.com/reports/webhooks",
      "method": "POST"
    }
  }
}
```

7. Run "POST create report" request. The request body should already be filled in.

```json
// Expected response. Example.
{
  "user": {
    "username": "user2",
    "firstName": "Karlsson",
    "lastName": "Kalle",
    "createdAt": "2023-03-31T16:11:57.019Z",
    "updatedAt": "2023-03-31T16:11:57.019Z",
    "id": "6427064d364a523854b37c6e"
  },
  "position": {
    "latitude": 20.7984,
    "longitude": -156.3319
  },
  "locationName": "Pacific Ocean",
  "city": "Maui",
  "fishSpecies": "Mahi Mahi",
  "weight": 15,
  "length": 120,
  "imageUrl": "https://example.com/images/mahimahi.jpg",
  "dateOfCatch": "2021-10-05T00:00:00.000Z",
  "createdAt": "2023-03-31T16:13:08.239Z",
  "updatedAt": "2023-03-31T16:13:08.239Z",
  "id": "64270694364a523854b37c77",
  "_links": {
    "self": {
      "href": "https://api-a2.onrender.com/reports/64270694364a523854b37c77",
      "method": "GET"
    },
    "all": {
      "href": "https://api-a2.onrender.com/reports",
      "method": "GET"
    },
    "create": {
      "href": "https://api-a2.onrender.com/reports",
      "method": "POST"
    },
    "update": {
      "href": "https://api-a2.onrender.com/reports/64270694364a523854b37c77",
      "method": "PATCH"
    },
    "replace": {
      "href": "https://api-a2.onrender.com/reports/64270694364a523854b37c77",
      "method": "PUT"
    },
    "delete": {
      "href": "https://api-a2.onrender.com/reports/64270694364a523854b37c77",
      "method": "DELETE"
    }
  }
}
```
