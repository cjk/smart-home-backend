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
    '1/1/5',/* UG Keller-1-2 + Hobby1 via Tasterrückmeldung */
    '1/1/6',/* UG Keller-2 Deckenleuchte via Präsenzmelder 1.1.42 Ausg. 0  */
    '1/1/7',/* UG Keller-3 Deckenleuchte via Tasterrückmeldung */
    '1/2/1',/* EG Küche Deckenleuchten via Schaltaktor 1.1.2 Ausg. 3 */
    '1/2/6',/* EG WC Deckenleuchte via Schaltaktor 1.1.2 Ausg. 1 */
    '10/0/10', /* UG Fenster Keller-2 Kontakt via Binäreingang 1.1.39 Ausg. A-1  */
  ]
};

export default config;
