import { any, assocPath, filter, prop } from 'ramda';

const events = {
  dayLight: {
    on: ['6/0/0'],
    action: (env, value) => assocPath(['dayTime', 'outsideLight'], value, env),
  },
};

// Return all events, that have the given address-/string in one of their 'on'-keys
const affectedEnvEntries = busEventId =>
  filter(
    event => any(trigger => trigger === busEventId)(prop('on', event)),
    events
  );

export default affectedEnvEntries;
