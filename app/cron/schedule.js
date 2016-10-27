import {assoc} from 'ramda';

function parse(crontab) {
  return assoc('at', Date.now(), crontab);
}

export default parse;
