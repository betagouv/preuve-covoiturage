const moment = require('moment');

export default function betweenTime({ tripStakeholder, time }) {
  let result = false;
  const tripStakeholderStart = moment(tripStakeholder.start.datetime);
  const tripStakeholderEnd = moment(tripStakeholder.end.datetime);

  time.forEach((t) => {
    const [startHour, startMin] = t.start.split(':').map(v => parseInt(v, 10));
    const [endHour, endMin] = t.end.split(':').map(v => parseInt(v, 10));

    const tripStakeholderStartTimeStart = tripStakeholderStart
      .clone()
      .set({ hour: startHour, minute: startMin });

    const tripStakeholderStartTimeEnd = tripStakeholderStart
      .clone()
      .set({ hour: endHour, minute: endMin });

    const tripStakeholderEndTimeStart = tripStakeholderEnd
      .clone()
      .set({ hour: startHour, minute: startMin });

    const tripStakeholderEndTimeEnd = tripStakeholderEnd
      .clone()
      .set({ hour: endHour, minute: endMin });

    result = result || tripStakeholderStart.isBetween(tripStakeholderStartTimeStart, tripStakeholderStartTimeEnd, 'minute', '[]');
    result = result || tripStakeholderEnd.isBetween(tripStakeholderEndTimeStart, tripStakeholderEndTimeEnd, 'minute', '[]');
  });

  return result;
};
