export const alias = 'observatory.getLocation';
export const schema = {
  type: 'object',
  additionalProperties:false,
  required:['start_date','end_date','zoom'],
  properties:{
    start_date: {
      type:'string',
      minLength: 10,
      maxLength: 10,
    },
    end_date: {
      type:'string',
      minLength: 10,
      maxLength: 10,
    },
    zoom:{
      type:'integer',
      minimum:0,
      maximum:8,
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
  }
};

export const binding = [alias, schema];