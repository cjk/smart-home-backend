import R, {prop, map, not, assoc, isNil} from 'ramda';

const jobShouldRun = (j) => {
  const isDaily = R.propEq('repeat', 'daily', j);
  const isRunning = R.propEq('running', true, j);
  const hasFixedTime = not(isNil(prop('at', j)));
  const hasRun = not(isNil(prop('lastRun', j)));

  return not(hasRun) && not(isRunning) && isDaily && hasFixedTime;
  //   return not(isRunning);
};

function schedule(crontab) {
  const scheduledTab = map(j => assoc('scheduled', jobShouldRun(j), j));
  return scheduledTab(crontab);
}

export default schedule;
