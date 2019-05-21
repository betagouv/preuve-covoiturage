const statsQueue = require('../queue');

module.exports = {
  async calculate({ key, collection, commands }) {
    const jobName = `${key} - calculate`;

    // find out if the job is already running with the same name
    const jobs = await statsQueue.getJobs();
    const alreadyRunning = jobs.reduce((p, c) => {
      if (c.finishedOn) return p;
      // eslint-disable-next-line
      p = p || c.name === jobName;
      return p;
    }, false);

    if (!alreadyRunning) {
      statsQueue.add(jobName, {
        key,
        collection,
        commands,
        type: 'calculate',
      });
    }
  },
};
