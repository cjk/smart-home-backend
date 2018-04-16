/* @flow */

/* Determines whether there are clients interested in our bus-events, if so, activates sending out those events when
   they occur */

import type { BusEvent$ } from '../../types';
import { logger } from '../../lib/debug';

const log = logger('backend:busEvents');

function handleBusEvents(conn: any, busEvent$: BusEvent$) {
  /* Sends out bus-events to interested clients */
  const sendBusEvent = event => {
    log.debug('Sending out bus event.');
    conn.event.emit('knx/event', event);
  };

  conn.event.listen('knx/event', (eventName, isSubscribed, response) => {
    if (isSubscribed) {
      log.debug(`Some client subscribed to <${eventName}>`);
      response.accept();
      busEvent$.onValue(sendBusEvent);
    } else {
      log.debug(`Some client unsubscribed to <${eventName}>`);
      //           response.reject();
      busEvent$.offValue(sendBusEvent);
    }
  });
}

export default handleBusEvents;
