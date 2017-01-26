/* @flow */

/* Determines whether there are clients interested in our bus-events, if so, activates sending out those events when
   they occur */

import type { BusEvent } from '../../types';

function errorHandler(error) {
  console.error(error);
}

function handleBusEvents(client: any, busEvents: BusEvent) {
  /* Sends out bus-events to interested clients */
  const sendBusEvent = (event) => {
    console.log('[busServer] Sending out bus event.');
    client.event.emit('knx/event', event)
  };

  client.event.listen('knx/event', (eventName, isSubscribed, response) => {
    if (isSubscribed) {
      console.log(`[knx-event-handler] Some client subscribed to <${eventName}>`);
      response.accept();
      busEvents.onValue(sendBusEvent);
    } else {
      console.log(`[knx-event-handler] Some client unsubscribed to <${eventName}>`);
      //           response.reject();
      busEvents.offValue(sendBusEvent);
    }
  })
}

export default handleBusEvents;
