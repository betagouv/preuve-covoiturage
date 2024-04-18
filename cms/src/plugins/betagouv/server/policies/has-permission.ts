export default (policyContext, config, { strapi }) => {
  if (policyContext.state.user && policyContext.state.user.isActive) {
    return true;
  }

  return false;
};