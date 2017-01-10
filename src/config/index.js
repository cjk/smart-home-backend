/* @flow */
/* eslint max-len: 0 */

import type {Config, AddressList} from '../types';
import {Map} from 'immutable';
import Addr from '../knx/address';
import addresses from './group-address-list';

const config:Config = {
  server: {
    port: process.env.PORT || '3005'/* TODO: no longer used?! */
  },
  knxd: {
    host: '192.168.1.28', /* like '192.168.1.28' or 'localhost'  */
    //     host: 'localhost', /* like '192.168.1.28' or 'localhost'  */
    port: '6720',
    isAvailable: true
  },
  wsServer: {
    //     host: 'localhost',
    host: '192.168.1.28',
    port: '6020',
    user: 'smartHomeBackend',
  },
  /* WIP */
  commands: {
    simulate: false
  },
  logging: {
    logBusStateOnEvent: false,
    logBusEvents: false,
  },
  /* Enable / disable some modules / functionality */
  modules: {
    addressRefresher: false,
  },
  knx: {
    addresses,
    addressMap: () => new Map(addresses.reduce((col = {}, addr) => {
      col[addr.id] = new Addr(addr);
      return col;
    })),
    readableAddr: [
      '1/1/0', /* UG Hobby1 Präsenzmelder Sperre f. Schaltung Licht Hobby-Keller-1+2 */
      '1/1/5', /* UG Keller-1-2 + Hobby1 via Tasterrückmeldung */
      '1/1/6', /* UG Keller-2 Deckenleuchte via Schaltaktor 1.1.2 Ausg. 14  */
      '1/1/7', /* UG Keller-3 Deckenleuchte via Schaltaktor 1.1.2 Ausg. 5 */
      '1/2/0', /* EG Technik Deckenleuchte via [TODO] */
      '1/2/1', /* EG Küche Deckenleuchten via Schaltaktor 1.1.2 Ausg. 3 */
      '1/2/2', /* EG/OG Treppenlicht LED via Schaltaktor 1.1.1 Ausg. 10 */
      '1/2/3', /* EG Büro/Emma Deckenleuchte via Schaltaktor 1.1.1 Ausg. 12 */
      '1/2/4', /* EG Esszimmer Deckenleuchte via Schaltaktor 1.1.2 Ausg. 3 */
      '1/2/5', /* EG Flur Deckenleuchte via Schaltaktor 1.1.2 Ausg. 9 */
      '1/2/6', /* EG WC Deckenleuchte via Schaltaktor 1.1.2 Ausg. 1 */
      '1/2/7', /* EG Küche Deckenleuchten Nord+Ost via Schaltaktor 1.1.5 Ausg. 1 */
      '1/2/13', /* EG Wohnzimmer Wandlampen via Schaltaktor 1.1.1 Ausg. 11 */
      '1/2/14', /* WL/Leuchtstoffleuchte WZ Nordwand 1.42.1 1.1.1 Ausg. 14 */
      '1/2/12', /* EG Büro/Emma Hängeleuchte via Schaltaktor 1.1.45 Ausg. 5 */
      '1/2/10', /* EG Wohnzimmer Erker Deckenleuchte via Schaltaktor 1.1.45 Ausg. 4 */
      '1/2/11', /* EG Flur Wandlampe via Schaltaktor 1.1.2 Ausg. 13 */
      '1/3/1', /* OG Kind-2 Deckenleuchte via Schaltaktor [TODO] */
      '1/3/2', /* OG Kind-3 Deckenleuchte via Schaltaktor 1.1.1 Ausg. 13 */
      '1/3/3', /* OG Bad Deckenleuchte via [TODO] */
      '1/3/4', /* OG Flur Wandleuchte via Schaltaktor 1.1.2 Ausg. 8 */
      //     '1/3/5', /* DG Treppe / Flur LED-Wandleuchte via Schaltaktor 1.1.1 Ausg. 16 - NICHT VERWENDET, kein Sensor! */
      '1/3/10', /* OG Bad Wand-/Waschtisch-Leuchten via Schaltaktor 1.1.1 Ausg. 7 */
      '1/3/12', /* OG Kind-1 / Schlafzimmer Deckenleuchte Nord via Dimmaktor 1.1.6 Ausg. 4 */
      '1/4/0', /* Außenleuchte Eingang via Schaltaktor 1.1.1 Ausgang 1 */
      '1/4/1', /* Außenleuchte Westen / Terrasse via Schaltaktor 1.1.45 Kanal 1 - Helligkeits- / Bewegungsmelder gesteuert */
      '1/4/2', /* Sperre Außenleuchte Westen / Terrasse über Bewegungsmelder via Bewegungsmelder 1.1.41 Sperrobjekt Block 1 */
      '1/5/0', /* EG Wohnzimmer/Esszimmer/Küche Szene "Abendessen" via Taster 1.1.24 Taste 7 (für Rückmeldeobjekt s. 9/0/1) */
      '4/2/0', /* Rollladen EG zentral lang via Schaltaktor 1.2.24 Taste 3 + 4 */
      '4/2/1', /* Rollladen EG zentral kurz via Schaltaktor 1.2.24 Taste 3 + 4 */
      '6/0/0', /* EG Außenbereich Westwand / Garten 1.1.41 Lichtsensor 107 - resultierender Istwert senden */
      '9/0/1', /* EG Wohnzimmer/Esszimmer/Küche Rückmeldeobjekt für Szene "Abendessen" via Taster 1.1.24 Taste 7 (Rückmeldeobjekt Taste 7, Objekt A) */
      '9/0/3', /* EG Küche Decke Nord+Ost Rückmeldeobjekt via Taster 1.1.24 Taste 5 */
      '9/1/0', /* OG Kind-1 / Schlafzimmer Deckenleuchte Nord via Rückmeldeobjekt Taster 1.1.31 Taste 1 */
      '10/1/0', /* EG Türen Haustür Kontakt via Binäreingang 1.1.47 Ausg. A-0  */
      '10/0/10', /* UG Fenster Keller-2 Kontakt via Binäreingang 1.1.39 Ausg. A-1  */
      '11/2/0', /* OG Kind-2 / Daniel Steckdose Ost 1/5 via Schaltaktor 1.1.45 Ausg. 7 */
    ]
  }
};

export default config;
