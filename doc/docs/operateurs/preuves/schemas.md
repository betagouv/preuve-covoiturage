## Création de trajet

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Registre de preuve de covoiturage - Journey Schema V2",
  "$id": "rpc.journey.v2",
  "definitions": {
    "macros": {
      "varchar": {
        "type": "string",
        "minLength": 1,
        "maxLength": 255
      },
      "longchar": {
        "type": "string",
        "minLength": 1,
        "maxLength": 511
      },
      "email": {
        "type": "string",
        "format": "email",
        "minLength": 5,
        "maxLength": 256
      },
      "phone": {
        "type": "string",
        "minLength": 10,
        "maxLength": 15
      },
      "phone_trunc": {
        "type": "string",
        "minLength": 8,
        "maxLength": 15
      },
      "timestamp": {
        "type": "string",
        "pattern": "^\\d\\d\\d\\d-[0-1]\\d-[0-3]\\d[T\\s](?:[0-2]\\d:[0-5]\\d:[0-5]\\d|23:59:60)(?:\\.\\d+)?(?:Z|[+-]\\d\\d(?::?\\d\\d)?)$"
      },
      "lat": {
        "type": "number",
        "minimum": -90,
        "maximum": 90
      },
      "lon": {
        "type": "number",
        "minimum": -180,
        "maximum": 180
      },
      "insee": {
        "type": "string",
        "format": "insee",
        "minLength": 5,
        "maxLength": 5
      },
      "siret": {
        "type": "string",
        "format": "siret",
        "minLength": 14,
        "maxLength": 14
      }
    },
    "travelpass": {
      "type": "object",
      "minProperties": 2,
      "additionalProperties": false,
      "properties": {
        "name": {
          "enum": ["navigo"]
        },
        "user_id": {
          "$ref": "#/definitions/macros/varchar"
        }
      }
    },
    "identity": {
      "type": "object",
      "anyOf": [{ "required": ["phone"] }, { "required": ["operator_user_id", "phone_trunc"] }],
      "additionalProperties": false,
      "properties": {
        "firstname": {
          "$ref": "#/definitions/macros/varchar"
        },
        "lastname": {
          "$ref": "#/definitions/macros/varchar"
        },
        "email": {
          "$ref": "#/definitions/macros/email"
        },
        "phone": {
          "$ref": "#/definitions/macros/phone"
        },
        "phone_trunc": {
          "$ref": "#/definitions/macros/phone_trunc"
        },
        "operator_user_id": {
          "$ref": "#/definitions/macros/varchar"
        },
        "company": {
          "$ref": "#/definitions/macros/varchar"
        },
        "over_18": {
          "enum": [true, false, null],
          "default": null
        },
        "travel_pass": { "$ref": "#/definitions/travelpass" }
      }
    },
    "position": {
      "type": "object",
      "required": ["datetime"],
      "additionalProperties": false,
      "minProperties": 2,
      "dependencies": {
        "lat": ["lon"],
        "lon": ["lat"],
        "country": ["literal"]
      },
      "properties": {
        "datetime": {
          "$ref": "#/definitions/macros/timestamp"
        },
        "lat": {
          "$ref": "#/definitions/macros/lat"
        },
        "lon": {
          "$ref": "#/definitions/macros/lon"
        },
        "insee": {
          "$ref": "#/definitions/macros/insee"
        },
        "country": {
          "$ref": "#/definitions/macros/varchar"
        },
        "literal": {
          "$ref": "#/definitions/macros/longchar"
        }
      }
    },
    "incentive": {
      "type": "object",
      "required": ["index", "siret", "amount"],
      "additionalProperties": false,
      "properties": {
        "index": {
          "type": "integer",
          "minimum": 0
        },
        "siret": {
          "$ref": "#/definitions/macros/siret"
        },
        "amount": {
          "type": "number",
          "minimum": 0,
          "maximum": 20000
        }
      }
    },
    "payment": {
      "type": "object",
      "required": ["pass", "amount"],
      "additionalProperties": false,
      "properties": {
        "index": {
          "type": "integer",
          "minimum": 0,
          "maximum": 42
        },
        "siret": {
          "$ref": "#/definitions/macros/siret"
        },
        "type": {
          "$ref": "#/definitions/macros/varchar"
        },
        "amount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100000
        }
      }
    },
    "passenger": {
      "type": "object",
      "required": ["identity", "start", "end", "contribution", "incentives"],
      "additionalProperties": false,
      "properties": {
        "identity": { "$ref": "#/definitions/identity" },
        "start": { "$ref": "#/definitions/position" },
        "end": { "$ref": "#/definitions/position" },
        "seats": {
          "type": "integer",
          "default": 1,
          "minimum": 1,
          "maximum": 8
        },
        "contribution": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000,
          "$comment": "Montant après que toutes les incitations aient été attribuées"
        },
        "incentives": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/incentive" }
        },
        "payments": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/payment" }
        },
        "distance": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        },
        "duration": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 86400
        }
      }
    },
    "driver": {
      "type": "object",
      "required": ["identity", "start", "end", "revenue", "incentives"],
      "additionalProperties": false,
      "properties": {
        "identity": { "$ref": "#/definitions/identity" },
        "start": { "$ref": "#/definitions/position" },
        "end": { "$ref": "#/definitions/position" },
        "revenue": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000,
          "$comment": "Montant perçu après que toutes les incitations et contributions des passagers aient été attribuées"
        },
        "incentives": {
          "type": "array",
          "minItems": 0,
          "maxItems": 20,
          "items": { "$ref": "#/definitions/incentive" }
        },
        "payments": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/payment" }
        },
        "distance": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        },
        "duration": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 86400
        }
      }
    }
  },
  "type": "object",
  "required": ["journey_id", "operator_class"],
  "anyOf": [{ "required": ["passenger"] }, { "required": ["driver"] }],
  "additionalProperties": false,
  "properties": {
    "journey_id": {
      "$ref": "#/definitions/macros/varchar"
    },
    "operator_journey_id": {
      "$ref": "#/definitions/macros/varchar"
    },
    "operator_class": {
      "enum": ["A", "B", "C"]
    },
    "passenger": { "$ref": "#/definitions/passenger" },
    "driver": { "$ref": "#/definitions/driver" }
  }
}
```

## Simulation d'incitations
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Registre de preuve de covoiturage - Simulation Schema V1",
  "$id": "rpc.simulation.v1",
  "definitions": {
    "macros": {
      "varchar": {
        "type": "string",
        "minLength": 1,
        "maxLength": 255
      },
      "longchar": {
        "type": "string",
        "minLength": 1,
        "maxLength": 511
      },
      "email": {
        "type": "string",
        "format": "email",
        "minLength": 5,
        "maxLength": 256
      },
      "phone": {
        "type": "string",
        "minLength": 10,
        "maxLength": 15
      },
      "phone_trunc": {
        "type": "string",
        "minLength": 8,
        "maxLength": 15
      },
      "timestamp": {
        "type": "string",
        "pattern": "^\\d\\d\\d\\d-[0-1]\\d-[0-3]\\d[T\\s](?:[0-2]\\d:[0-5]\\d:[0-5]\\d|23:59:60)(?:\\.\\d+)?(?:Z|[+-]\\d\\d(?::?\\d\\d)?)$"
      },
      "lat": {
        "type": "number",
        "minimum": -90,
        "maximum": 90
      },
      "lon": {
        "type": "number",
        "minimum": -180,
        "maximum": 180
      },
      "siret": {
        "type": "string",
        "format": "siret",
        "minLength": 14,
        "maxLength": 14
      }
    },
    "travelpass": {
      "type": "object",
      "minProperties": 2,
      "additionalProperties": false,
      "properties": {
        "name": {
          "enum": ["navigo"]
        },
        "user_id": {
          "$ref": "#/definitions/macros/varchar"
        }
      }
    },
    "identity": {
      "type": "object",
      "anyOf": [{ "required": ["phone"] }, { "required": ["operator_user_id", "phone_trunc"] }],
      "additionalProperties": false,
      "properties": {
        "firstname": {
          "$ref": "#/definitions/macros/varchar"
        },
        "lastname": {
          "$ref": "#/definitions/macros/varchar"
        },
        "email": {
          "$ref": "#/definitions/macros/email"
        },
        "phone": {
          "$ref": "#/definitions/macros/phone"
        },
        "phone_trunc": {
          "$ref": "#/definitions/macros/phone_trunc"
        },
        "operator_user_id": {
          "$ref": "#/definitions/macros/varchar"
        },
        "company": {
          "$ref": "#/definitions/macros/varchar"
        },
        "over_18": {
          "enum": [true, false, null],
          "default": null
        },
        "travel_pass": { "$ref": "#/definitions/travelpass" }
      }
    },
    "position": {
      "type": "object",
      "required": ["datetime", "lat", "lon"],
      "additionalProperties": false,
      "properties": {
        "datetime": {
          "$ref": "#/definitions/macros/timestamp"
        },
        "lat": {
          "$ref": "#/definitions/macros/lat"
        },
        "lon": {
          "$ref": "#/definitions/macros/lon"
        }
      }
    },
    "incentive": {
      "type": "object",
      "required": ["index", "siret", "amount"],
      "additionalProperties": false,
      "properties": {
        "index": {
          "type": "integer",
          "minimum": 0
        },
        "siret": {
          "$ref": "#/definitions/macros/siret"
        },
        "amount": {
          "type": "number",
          "minimum": 0,
          "maximum": 20000
        }
      }
    },
    "payment": {
      "type": "object",
      "required": ["pass", "amount"],
      "additionalProperties": false,
      "properties": {
        "index": {
          "type": "integer",
          "minimum": 0,
          "maximum": 42
        },
        "siret": {
          "$ref": "#/definitions/macros/siret"
        },
        "type": {
          "$ref": "#/definitions/macros/varchar"
        },
        "amount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100000
        }
      }
    },
    "passenger": {
      "type": "object",
      "required": ["identity", "start", "end", "contribution", "incentives"],
      "additionalProperties": false,
      "properties": {
        "identity": { "$ref": "#/definitions/identity" },
        "start": { "$ref": "#/definitions/position" },
        "end": { "$ref": "#/definitions/position" },
        "seats": {
          "type": "integer",
          "default": 1,
          "minimum": 1,
          "maximum": 8
        },
        "contribution": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000,
          "$comment": "Montant après que toutes les incitations aient été attribuées"
        },
        "incentives": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/incentive" }
        },
        "payments": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/payment" }
        },
        "distance": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        },    "incentive": {
      "type": "object",
      "required": ["index", "siret", "amount"],
      "additionalProperties": false,
      "properties": {
        "index": {
          "type": "integer",
          "minimum": 0
        },
        "siret": {
          "$ref": "#/definitions/macros/siret"
        },
        "amount": {
          "type": "number",
          "minimum": 0,
          "maximum": 20000
        }
      }
    },
    },
    "driver": {
      "type": "object",
      "required": ["identity", "start", "end", "revenue", "incentives"],
      "additionalProperties": false,
      "properties": {
        "identity": { "$ref": "#/definitions/identity" },
        "start": { "$ref": "#/definitions/position" },
        "end": { "$ref": "#/definitions/position" },
        "revenue": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000,
          "$comment": "Montant perçu après que toutes les incitations et contributions des passagers aient été attribuées"
        },
        "incentives": {
          "type": "array",
          "minItems": 0,
          "maxItems": 20,
          "items": { "$ref": "#/definitions/incentive" }
        },
        "payments": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/payment" }
        },
        "distance": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        },
        "duration": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 86400
        }
      }
    }
  },
  "type": "object",
  "required": ["journey_id", "operator_class"],
  "anyOf": [{ "required": ["passenger"] }, { "required": ["driver"] }],
  "additionalProperties": false,
  "properties": {
    "journey_id": {
      "$ref": "#/definitions/macros/varchar"
    },
    "operator_class": {
      "enum": ["A", "B", "C"]
    },
    "passenger": { "$ref": "#/definitions/passenger" },
    "driver": { "$ref": "#/definitions/driver" }
  }
}
```
