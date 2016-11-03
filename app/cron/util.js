/* General purpose functions */
import {pluck, filter, compose} from 'ramda';

const scheduled = j => j.scheduled;
const running = j => j.running;

const scheduledJobIds = compose(
  pluck('jobId'),
  filter(running)
);

const runningJobIds = compose(
  pluck('jobId'),
  filter(scheduled)
);

export {scheduled, running, scheduledJobIds, runningJobIds};
