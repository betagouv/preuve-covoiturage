export const alias = 'observatory.evolMonthlyOccupation';
export const schema = {
  type: 'object',
  additionalProperties:false,
  required:['year','month','t','code','indic'],
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
    code: {
      type:'string',
      minLength: 2,
      maxLength: 9,
    },
    indic: {
      type:'string',
      enum:['journeys','trips','has_incentive','occupation_rate'],
    },
    past: {
      type:'string',
      minLength: 1,
      maxLength: 2,
      default:'2'
    },
  }
};

export const binding = [alias, schema];