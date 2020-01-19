interface ParamsInterface {
  identity: string;
  type?: string;
  start_at?: Date;
  end_at?: Date;
}

export function castParams<T extends ParamsInterface>(params: T): T {
  const origin = new Date('2018-01-01T00:00:00+0100'); // Europe/Paris

  params.start_at = 'start_at' in params ? new Date(params.start_at) : origin;
  params.end_at = 'end_at' in params ? new Date(params.end_at) : new Date();

  // normalize dates
  if (params.end_at.getTime() > new Date().getTime()) {
    params.end_at = new Date();
  }

  if (params.start_at.getTime() >= params.end_at.getTime()) {
    params.start_at = origin;
  }

  // normalize identity
  params.identity = params.identity
    .replace(/^\s([1-9]{2,3})/, '+$1')
    .replace(/[^+0-9]/g, '')
    .replace(/^0/, '+33');

  // normalize type
  if ('type' in params) {
    params.type = params.type.trim().toLowerCase();
  }

  return params;
}
