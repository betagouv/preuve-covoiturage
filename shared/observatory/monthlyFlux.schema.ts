export const alias = 'observatory.monthlyFlux';
export const schema = {
  type: 'object',
  additionalProperties:false,
  required:['year','month','t'],
  properties:{
    year: {type:'string'},
    month: {type:'string'},
    t: {type:'string'},
    t2: {type:'string'},
    code: {type:'string'}
  }
};

export const binding = [alias, schema];