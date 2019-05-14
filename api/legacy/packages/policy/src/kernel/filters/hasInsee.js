export default function hasInsee({ tripStakeholder, insee }) {
  if (insee.whiteList) {
    if (insee.whiteList.start
        && insee.whiteList.start.indexOf(tripStakeholder.start.insee) === -1) return false;

    if (insee.whiteList.end
        && insee.whiteList.end.indexOf(tripStakeholder.end.insee) === -1) return false;
  }
  if (insee.blackList) {
    if (insee.blackList.start
        && insee.blackList.start.indexOf(tripStakeholder.start.insee) !== -1) return false;

    if (insee.blackList.end
        && insee.blackList.end.indexOf(tripStakeholder.end.insee) !== -1) return false;
  }
  return true;
};
