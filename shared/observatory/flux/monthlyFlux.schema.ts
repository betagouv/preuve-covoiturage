export const alias = 'observatory.monthlyFlux';
export const schema = {
  type: 'object',
  additionalProperties:false,
  required:['year','month','t'],
  properties:{
    year: {
      type:'string',
      minLength: 4,
      maxLength: 4,
    },
    month: {
      type:'string',
      minLength: 1,
      maxLength: 2,
    },
    t: {
      type:'string',
      enum:['com','epci','aom','dep','reg','country'],
    },
    t2: {
      type:'string',
      enum:['com','epci','aom','dep','reg','country'],
    },
    code: {
      type:'string',
      minLength: 2,
      maxLength: 9,
    }
  }
};

export const binding = [alias, schema];