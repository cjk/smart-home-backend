/* @flow */
import type { BusState$ } from '../../types';

import R from 'ramda';
import { logger } from '../../lib/debug';

const log = logger('backend:state-sync');

/* Handles initial-bus-state requests */
function updateRemoteInitialState(client: any, busState$: BusState$) {
  /* TODO: Need better state-management and cleanup here.
   * Also handle unlistening-case: client.record.unlisten('knx/initialBusState', callback) */

  // const isSubscribed$ = K.fromCallback((subscriptionChanged) => {
  //   client.record.listen('busState', )
  // });

  const putBusStateIntoEther = R.curry((bsRecord, state) => {
    log.debug('[busServer] Pushing full bus-state to deepstream-server');
    bsRecord.set(state);
  });

  client.record.getRecord('knx/initialBusState').whenReady(bsRecord => {
    busState$.onValue(putBusStateIntoEther(bsRecord));
  });

  const callback = (match, isSubscribed, response) => {
    log.debug('Handling subscriptionChanged...');
    if (isSubscribed) {
      log.debug('Someone subscribed to initial busState records');
      response.accept();
    } else {
      log.debug('Unsubscribing to delivering initial busState records');
      busState$.offValue(putBusStateIntoEther);
      client.record.getRecord('knx/initialBusState').discard();
      response.reject();
    }
  };

  /* PENDING: Due to a bug in Deepstream-server <= v2.1.2 a error is emitted when subscribing here - see
     https://github.com/deepstreamIO/deepstream.io/issues/531 */
  //   client.record.listen('knx/initialBusState', callback);
}

export default updateRemoteInitialState;
