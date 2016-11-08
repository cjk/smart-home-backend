/* General purpose functions */
import {assoc, pluck, filter, compose} from 'ramda';

const scheduled = j => j.scheduled;
const running = j => j.running;

const setRunning = assoc('running', true);
const setLastRun = assoc('lastRun', Date.now());

const scheduledJobIds = compose(
  pluck('jobId'),
  filter(running)
);

const runningJobIds = compose(
  pluck('jobId'),
  filter(scheduled)
);

export {scheduled, running, setLastRun, setRunning, scheduledJobIds, runningJobIds};
