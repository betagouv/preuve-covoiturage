module.exports = function hasInsee({ tripStakeholder, insee }) {
  let whiteListOrStart = true;
  let whiteListOrEnd = true;
  let blackListOrStart = true;
  let blackListOrEnd = true;

  let whiteListOrStartIsDefined = true;
  let whiteListOrEndIsDefined = true;
  let blackListOrStartIsDefined = true;
  let blackListOrEndIsDefined = true;

  let whiteListOr = true;
  let whiteListAnd = true;
  let blackListOr = true;
  let blackListAnd = true;

  if (insee.whiteList) {
    if (insee.whiteList.or) {
      if (insee.whiteList.or.start) {
        if (insee.whiteList.or.start.indexOf(tripStakeholder.start.insee) === -1) {
          // is not in white list
          whiteListOrStart = false;
        }
      } else {
        whiteListOrStartIsDefined = false;
      }

      if (insee.whiteList.or.end) {
        if (insee.whiteList.or.end.indexOf(tripStakeholder.end.insee) === -1) {
          // is not in white list
          whiteListOrEnd = false;
        }
      } else {
        whiteListOrEndIsDefined = false;
      }

      // if start list or end list is not defined only use defined list
      if (!whiteListOrEndIsDefined) {
        whiteListOr = whiteListOrStart;
      } else if (!whiteListOrStartIsDefined) {
        whiteListOr = whiteListOrEnd;
      } else {
        whiteListOr = whiteListOrStart || whiteListOrEnd;
      }
    }
    if (insee.whiteList.and) {
      if (insee.whiteList.and.start
          && insee.whiteList.and.end) {
        if (insee.whiteList.and.start.indexOf(tripStakeholder.start.insee) === -1
            || insee.whiteList.and.end.indexOf(tripStakeholder.end.insee) === -1) {
          // is not in start nor end list
          whiteListAnd = false;
        }
      }
    }
  }


  if (insee.blackList) {
    if (insee.blackList.or) {
      if (insee.blackList.or.start) {
        if (insee.blackList.or.start.indexOf(tripStakeholder.start.insee) !== -1) {
          // is in blacklist
          blackListOrStart = false;
        }
      } else {
        blackListOrStartIsDefined = false;
      }
      if (insee.blackList.or.end) {
        if (insee.blackList.or.end.indexOf(tripStakeholder.end.insee) !== -1) {
          // is in blacklist
          blackListOrEnd = false;
        }
      } else {
        blackListOrEndIsDefined = false;
      }

      // if start list or end list is not defined only use defined list
      if (!blackListOrEndIsDefined) {
        blackListOr = blackListOrStart;
      } else if (!blackListOrStartIsDefined) {
        blackListOr = blackListOrEnd;
      } else {
        blackListOr = blackListOrStart && blackListOrEnd;
      }
    }
    if (insee.blackList.and) {
      if (insee.blackList.and.start
          && insee.blackList.and.end
          && insee.blackList.and.start.indexOf(tripStakeholder.start.insee) !== -1
          && insee.blackList.and.end.indexOf(tripStakeholder.end.insee) !== -1) {
        // is in start and end blacklist
        blackListAnd = false;
      }
    }
  }

  return whiteListOr
        && whiteListAnd
        && blackListOr
        && blackListAnd;
};
