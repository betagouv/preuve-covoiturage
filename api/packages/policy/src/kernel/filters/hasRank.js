export default function hasRank({ tripStakeholder, rank }) {
  return rank.indexOf(tripStakeholder.class) >= 0;
};
