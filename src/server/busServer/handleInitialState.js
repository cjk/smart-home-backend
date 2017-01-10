/* @flow */
import type { BusState } from '../../types';
import K from 'kefir';
import R from 'ramda';

/* Handles initial-bus-state requests */
function updateRemoteInitialState(client: any, busState: BusState) {

  /* TODO: Need better state-management and cleanup here.
   * Also handle unlistening-case: client.record.unlisten('knx/initialBusState', callback) */

  // const isSubscribed$ = K.fromCallback((subscriptionChanged) => {
  //   client.record.listen('busState', )
  // });

  const putBusStateIntoEther = R.curry(
    (bsRecord, state) => {
      console.info('[busServer] Setting initial bus-state on deepstream-server');
      bsRecord.set(state.toJS());
    }
  );

  client.record.getRecord('knx/initialBusState').whenReady((bsRecord) => {
    busState.onValue(putBusStateIntoEther(bsRecord));
  });

  const callback = (match, isSubscribed, response) => {
    console.log('[handleInitialState] Handling subscriptionChanged...');
    if (isSubscribed) {
      console.log('[handleInitialState] Someone subscribed to initial busState records');
      response.accept();
    } else {
      console.log('[handleInitialState] Unsubscribing to delivering initial busState records');
      busState.offValue(putBusStateIntoEther);
      client.record.getRecord('knx/initialBusState').discard();
      //       response.reject();
    }
  };

  /* PENDING: Due to a bug in Deepstream-server <= v2.1.2 a error is emitted when subscribing here - see
     https://github.com/deepstreamIO/deepstream.io/issues/531 */
  //   client.record.listen('knx/initialBusState', callback);

}

export default updateRemoteInitialState;
