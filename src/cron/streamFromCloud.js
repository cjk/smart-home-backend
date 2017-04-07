/* @flow */
import K from 'kefir';
import loadCrontab from './crontab';

/* Load and transform initial crontab entries */
const _crontab = loadCrontab();
console.log(`[CRON] Loaded crontab with ${_crontab.length} entries`);

export default function createStream(connection: Function) {
  const cron$ = K.stream(emitter => {
    const crontab = connection.record.getRecord('smartHome/crontab');

    const crontabChanged = (tab) => {
      emitter.emit(tab);
    };

    crontab.subscribe(crontabChanged);

    crontab.whenReady(tab => tab.set(_crontab));

    return () => {};
  });

  return cron$;
}
