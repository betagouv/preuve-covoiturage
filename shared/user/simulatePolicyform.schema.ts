export const sendSimulationEmail = {
  $id: 'user.sendSimulationEmail',
  type: 'object',
  required: ['email', 'name', 'firstname', 'job', 'simulation', 'territory_name'],
  additionalProperties: false,
  properties: {
    email: { macro: 'email' },
    job: { macro: 'varchar' },
    territory_name: { macro: 'varchar' },
    name: { macro: 'varchar' },
    firstname: { macro: 'varchar' },
    simulation: {
      type: 'object',
      additionalProperties: false,
      required: ['territory_insee', 'policy_template_id'],
      properties: {
        territory_insee: { macro: 'varchar' },
        policy_template_id: { enum: ['1', '2', '3'] },
      },
    },
  },
};

export const alias = sendSimulationEmail.$id;
