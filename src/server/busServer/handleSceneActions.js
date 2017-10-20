/* @flow */

/* Subscribes to + handle scene-actions like "activate-/deactive scene" from other clients */
import logger from 'debug';
import K from 'kefir';
import Address from '../../knx/address';
import { writeGroupAddr } from '../../knx/performBusAction';

const debug = logger('smt:scene-handler'),
  error = logger('error');

const createSceneActionEventSub$ = client =>
  K.stream(emitter => {
    const onSceneActivate = sceneNo => {
      emitter.emit({ sceneNo, action: 'on' });
    };
    const onSceneDeactivate = sceneNo => {
      emitter.emit({ sceneNo, action: 'off' });
    };

    client.event.subscribe('scenes/activate', onSceneActivate);
    client.event.subscribe('scenes/deactivate', onSceneActivate);
    return () => {
      client.event.unsubscribe('scenes/activate', onSceneActivate);
      client.event.unsubscribe('scenes/activate', onSceneDeactivate);
    };
  });

function performSceneAction(sceneAction) {
  debug(
    `About to perform address-write on request for address: ${JSON.stringify(
      addr
    )}`
  );
  if (addr.id) {
    // Sending a new value for an address in a specific format to the knx-bus may fail. Catch and print errors but don't let it crash
    try {
      writeGroupAddr(new Address(addr));
    } catch (e) {
      error(
        `Failed to write to KNX-bus for address ${addr.id}. Check the address-type and format.`
      );
    }
  } else {
    error(
      'Illegal KNX-address received for bus-writing - will not perform any bus action!'
    );
  }
}

function errorHandler(err) {
  error(err);
}

function handleSceneActions(conn: Function) {
  const sceneActionHandler = createSceneActionEventSub$(conn);

  return sceneActionHandler.observe({
    value(addr) {
      writeAddressToBus(addr);
    },
    error(e) {
      errorHandler(e);
    },
  });
}

export default handleSceneActions;
