/* @flow */

/* Determines whether there are clients interested in our bus-events, if so, activates sending out those events when
   they occur */

import logger from 'debug';
import type { BusEvent$ } from '../../types';

const debug = logger('smt:busevents');

function handleBusEvents(conn: any, busEvent$: BusEvent$) {
  /* Sends out bus-events to interested clients */
  const sendBusEvent = event => {
    debug('Sending out bus event.');
    conn.event.emit('knx/event', event);
  };

  conn.event.listen('knx/event', (eventName, isSubscribed, response) => {
    if (isSubscribed) {
      debug(`Some client subscribed to <${eventName}>`);
      response.accept();
      busEvent$.onValue(sendBusEvent);
    } else {
      debug(`Some client unsubscribed to <${eventName}>`);
      //           response.reject();
      busEvent$.offValue(sendBusEvent);
    }
  });
}

export default handleBusEvents;
