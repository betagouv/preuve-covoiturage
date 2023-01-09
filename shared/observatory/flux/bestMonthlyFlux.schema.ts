export const alias = 'observatory.bestMonthlyFlux';
export const schema = {
  type: 'object',
  additionalProperties:false,
  required:['year','month','t','code'],
  properties:{
    year: {
      type:'integer',
      minimum: 2020,
      maximum: new Date().getFullYear(),
    },
    month: {
      type:'integer',
      minimum: 1,
      maximum: 12,
    },
    t: {
      type:'string',
      enum:['com','epci','aom','dep','reg','country'],
    },
    code: {
      type:'string',
      minLength: 2,
      maxLength: 9,
    },
    limit: {
      type:'integer',
      minimum: 5,
      maximum: 100,
      default: 10
    },
  }
};

export const binding = [alias, schema];