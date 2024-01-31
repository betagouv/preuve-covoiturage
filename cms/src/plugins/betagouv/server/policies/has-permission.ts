export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user && policyContext.state.user.roles.includes('Authenticated')) {
    return true;
  }

  return false;
};