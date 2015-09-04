import addresses from './group-address-list';

let config = {};

config.server = {
  port: process.env.PORT || 3005
};

config.monitor = {
  host: 'zircon',
  port: '6720'
};

config.knx = {
  addresses: addresses,
  readableAddr: [
    '1/1/5',/* Kellerlicht Hobby1 + Waschraum via Tasterrückmeldung */
    '1/1/7',/* Keller-3 Deckenleuchte via Tasterrückmeldung */
    '1/2/1',/* Küche Deckenleuchten via Schaltaktor 1.1.2 Ausg. 3 */
  ]
};

export default config;
