export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user && policyContext.state.user.roles.indexOf('Authenticated')) {
    return true;
  }

  return false;
};