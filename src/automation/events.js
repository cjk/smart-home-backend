import { any, assoc, filter, prop, keys } from 'ramda';

const events = {
  dayLight: {
    on: {
      '6/0/0': (env, value) => assoc(['dayTime', 'outsideLight'], value, env),
    },
  },
};

// Return all events, that have the given address-/string in one of their 'on'-keys
const affectedEnvEntries = busEventId =>
  filter(e => any(a => a === busEventId)(keys(prop('on', e))), events);

export default affectedEnvEntries;
