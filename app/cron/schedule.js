import R, {prop, map, not, isEmpty, isNil} from 'ramda';

const isDaily = R.propEq('repeat', 'daily');

const jobShouldRun = (j) => {
  const hasFixedTime = not(isNil(prop('at', j)));

  return isDaily && hasFixedTime;
};

function schedule(crontab) {
  const scheduledTab = R.map(j => R.assoc('scheduled', jobShouldRun(j), j));
  return scheduledTab(crontab);
}

export default schedule;
