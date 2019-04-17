module.exports = function inRange({ tripStakeholder, range }) {
  const { min, max } = range;
  let result = true;

  if (min && tripStakeholder.distance < min) {
    result = false;
  }

  if (max && tripStakeholder.distance > max) {
    result = false;
  }

  return result;
};
