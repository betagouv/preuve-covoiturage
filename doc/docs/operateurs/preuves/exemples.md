## Envoi d'un trajet

```
POST /v2/journeys
Authorization: Bearer <token>
```

``` json
{
  "journey_id": "8c872418-37c0-4b94-8cc7-e189c1599c4c",
  "operator_journey_id": "57d08b47-8d1c-4345-b0d2-36a20a182883",
  "operator_class": "C",
  "driver": {
    "revenue": 200,
    "incentives": [],
    "identity": {
      "phone_trunc": "+336123456",
      "operator_user_id": "3085e7bb-ea8f-4e8e-87b1-d8950d8510ba",
      "over_18": true
    },
    "start": {
      "datetime": "2021-01-01T10:00:00Z",
      "lat": 45.8500862636592,
      "lon": 1.2677062964308117
    },
    "end": {
      "datetime": "2021-01-01T11:00:00Z",
      "lat": 45.80491919633787,
      "lon": 1.2149815791287082
    }
  },
  "passenger": {
    "contribution": 200,
    "seats": 1,
    "incentives": [],
    "identity": {
      "phone_trunc": "+336654321",
      "operator_user_id": "1a6b3c2c-7dbf-412c-a21d-47a37627d3c3",
      "over_18": true
    },
    "start": {
      "datetime": "2021-01-01T10:00:00Z",
      "lat": 45.8500862636592,
      "lon": 1.2677062964308117
    },
    "end": {
      "datetime": "2021-01-01T11:00:00Z",
      "lat": 45.80491919633787,
      "lon": 1.2149815791287082
    }
  }
}
```
## Envoi d'un trajet avec incitations

Toutes les incitations sont calculées et envoyées par l'opérateur.

- le passager ne paie pas sont trajet : `passenger.contribution = 0`
- l'AOM verse une incitation de 1,50€ `driver.incentives[0].amount = 150`
- l'opérateur verse une incitation de 50c€ `driver.incentives[1].amount = 50`

``` json
{
  "journey_id": "8c872418-37c0-4b94-8cc7-e189c1599c4c",
  "operator_journey_id": "57d08b47-8d1c-4345-b0d2-36a20a182883",
  "operator_class": "C",
  "driver": {
    "revenue": 200,
    "incentives": [
      {
        "index": 0,
        "amount": 150,
        "siret": "Siret territoire"
      },
      {
        "index": 0,
        "amount": 50,
        "siret": "Siret opérateur"
      }
    ],
    "identity": {
      "phone_trunc": "+336123456",
      "operator_user_id": "3085e7bb-ea8f-4e8e-87b1-d8950d8510ba",
      "over_18": true
    },
    "start": {
      "datetime": "2021-01-01T10:00:00Z",
      "lat": 45.8500862636592,
      "lon": 1.2677062964308117
    },
    "end": {
      "datetime": "2021-01-01T11:00:00Z",
      "lat": 45.80491919633787,
      "lon": 1.2149815791287082
    }
  },
  "passenger": {
    "contribution": 0,
    "seats": 1,
    "incentives": [],
    "identity": {
      "phone_trunc": "+336654321",
      "operator_user_id": "1a6b3c2c-7dbf-412c-a21d-47a37627d3c3",
      "over_18": true
    },
    "start": {
      "datetime": "2021-01-01T10:00:00Z",
      "lat": 45.8500862636592,
      "lon": 1.2677062964308117
    },
    "end": {
      "datetime": "2021-01-01T11:00:00Z",
      "lat": 45.80491919633787,
      "lon": 1.2149815791287082
    }
  }
}
```
