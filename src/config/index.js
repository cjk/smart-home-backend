/* @flow */
/* eslint max-len: 0 */

import type { Address, AddressMap, AddressList, Config } from '../types'

import * as R from 'ramda'
import addressList from './group-address-list'
import { createAddress } from '../knx/address'

const readableAddrList: Array<string> = [
  '1/1/0' /* UG Hobby1 Präsenzmelder Sperre f. Schaltung Licht Hobby-Keller-1+2 */,
  '1/1/5' /* UG Keller-1-2 + Hobby1 via Tasterrückmeldung */,
  '1/1/6' /* UG Keller-2 Deckenleuchte via Schaltaktor 1.1.2 Ausg. 14  */,
  '1/1/7' /* UG Keller-3 Deckenleuchte via Schaltaktor 1.1.2 Ausg. 5 */,
  '1/1/9' /* UG Keller-1 Deckenleuchte manuell schalten via Schaltaktor 1.1.1 Schaltaktor 2 Ausg. 15 */,
  // CjK 18.04.2018: 1/1/10 Schaltung Licht Heizraum via Schaltaktor #15 deaktiviert, weil Licht tagsüber nicht schalten soll
  '1/1/10' /* UG Keller-1 Deckenleuchte automatisch schalten per Präsenzmelder (Waschsituation) via Schaltaktor 1.1.1 Schaltaktor 2 Ausg. 15 */,
  '1/2/0' /* EG Technik Deckenleuchte via [TODO] */,
  '1/2/1' /* EG Küche Deckenleuchten via Schaltaktor 1.1.2 Ausg. 3 */,
  '1/2/2' /* EG/OG Treppenlicht LED via Schaltaktor 1.1.1 Ausg. 10 */,
  '1/2/3' /* EG Büro/Emma Deckenleuchte via Schaltaktor 1.1.1 Ausg. 12 */,
  '1/2/4' /* EG Esszimmer Deckenleuchte via Schaltaktor 1.1.2 Ausg. 3 */,
  '1/2/5' /* EG Flur Deckenleuchte via Schaltaktor 1.1.2 Ausg. 9 */,
  '1/2/6' /* EG WC Deckenleuchte via Schaltaktor 1.1.2 Ausg. 1 */,
  '1/2/7' /* EG Küche Deckenleuchten Nord+Ost via Schaltaktor 1.1.5 Ausg. 1 */,
  '1/2/10' /* EG Wohnzimmer Erker Deckenleuchte via Schaltaktor 1.1.45 Ausg. 4 */,
  '1/2/11' /* EG Flur Wandlampe via Schaltaktor 1.1.2 Ausg. 13 */,
  '1/2/13' /* EG Wohnzimmer Wandlampen via Schaltaktor 1.1.1 Ausg. 11 */,
  '1/2/14' /* WL/Leuchtstoffleuchte WZ Nordwand 1.42.1 1.1.1 Ausg. 14 */,
  '1/2/15' /* DL Wohnzimmer Mitte 1.1.45 Ausg. 3 */,
  '1/2/12' /* EG Büro/Emma Hängeleuchte via Schaltaktor 1.1.45 Ausg. 5 */,
  '1/3/0' /* OG Kind-1 Deckenleuchte Süd - [TODO] NO ACTOR YET */,
  '1/3/1' /* OG Kind-2 Deckenleuchte via Schaltaktor [TODO] */,
  '1/3/2' /* OG Kind-3 Deckenleuchte via Schaltaktor 1.1.1 Ausg. 13 */,
  '1/3/3' /* OG Bad Deckenleuchte via [TODO] */,
  '1/3/4' /* OG Flur Wandleuchte via Schaltaktor 1.1.2 Ausg. 8 */,
  //     '1/3/5', /* DG Treppe / Flur LED-Wandleuchte via Schaltaktor 1.1.1 Ausg. 16 - NICHT VERWENDET, kein Sensor! */
  '1/3/10' /* OG Bad Wand-/Waschtisch-Leuchten via Schaltaktor 1.1.1 Ausg. 7 */,
  '1/3/12' /* OG Kind-1 / Schlafzimmer Deckenleuchte Nord via Dimmaktor 1.1.6 Ausg. 4 */,
  '1/4/0' /* Außenleuchte Eingang via Schaltaktor 1.1.1 Ausgang 1 */,
  '1/4/1' /* Außenleuchte Westen / Terrasse via Schaltaktor 1.1.45 Kanal 1 - Helligkeits- / Bewegungsmelder gesteuert */,
  '1/4/2' /* Sperre Außenleuchte Westen / Terrasse über Bewegungsmelder via Bewegungsmelder 1.1.41 Sperrobjekt Block 1 */,
  '1/5/0' /* EG Wohnzimmer/Esszimmer/Küche Szene "Abendessen" via Taster 1.1.24 Taste 7 (für Rückmeldeobjekt s. 9/0/1) */,
  '4/2/0' /* Rollladen EG zentral lang via Schaltaktor 1.2.24 Taste 3 + 4 */,
  '4/2/1' /* Rollladen EG zentral kurz via Schaltaktor 1.2.24 Taste 3 + 4 */,
  '6/0/0' /* EG Außenbereich Westwand / Garten 1.1.41 Lichtsensor 107 - resultierender Istwert senden */,
  '6/0/1' /* UG Keller-1 (Waschraum) / Keller-1 1.1.48 Lichtsensor 107 - resultierender Istwert senden */,
  '8/0/0' /* Zeit wohnen senden - sendet Zeitwert an Taster */,
  '9/0/1' /* EG Wohnzimmer/Esszimmer/Küche Rückmeldeobjekt für Szene "Abendessen" via Taster 1.1.24 Taste 7 (Rückmeldeobjekt Taste 7, Objekt A) */,
  '9/0/3' /* EG Küche Decke Nord+Ost Rückmeldeobjekt via Taster 1.1.24 Taste 5 */,
  '9/1/0' /* OG Kind-1 / Schlafzimmer Deckenleuchte Nord via Rückmeldeobjekt Taster 1.1.31 Taste 1 */,
  '10/0/10' /* UG Fenster Keller-2 Kontakt via Binäreingang 1.1.39 Ausg. A-1  */,
  '10/1/0' /* EG Türen Haustür Kontakt via Binäreingang 1.1.47 Ausg. A-0  */,
  '11/1/0' /* WZ Steckd.-Erker West 2+3 (Stehlampe, ...) */,
  '11/2/0' /* OG Kind-2 / Daniel Steckdose Ost 1/5 via Schaltaktor 1.1.45 Ausg. 7 */,
  '13/0/0' /* OG Hall-2 - Aktivität-Diele-OG */,
  '13/1/0' /* EG KIT-2 - Aktivität-Küche-EZ-EG */,
  '13/1/1' /* EG Hall-1 - Aktivität-Diele-EG */,
]

const toAddressMap = (addrList: AddressList): AddressMap =>
  R.reduce((acc, addr: Address): { [string]: Address } => R.assoc(addr.id, createAddress(addr), acc), {}, addrList)

const addressMap = toAddressMap(addressList)

const readableAddrMap: AddressMap = R.reduce(
  (acc, knxId: string): { [string]: Address } => R.assoc(knxId, addressMap[knxId], acc),
  {},
  readableAddrList
)

const config: Config = {
  server: {
    port: process.env.PORT || '3005' /* TODO: no longer used?! */,
  },
  knxd: {
    host: process.env.KNXD_ADDR /* see your .env- or ecosystem.config.js file, e.g. '192.168.1.28' or 'localhost'  */,
    port: process.env.KNXD_PORT,
    isAvailable: true,
  },
  /* Do not really access KNX-bus */
  commands: {
    simulate: false,
  },
  logging: {
    logBusStateOnEvent: false,
    logBusEvents: false,
  },
  /* Enable / disable some modules / functionality */
  modules: {
    addressRefresher: true,
  },
  knx: {
    addressList,
    addressMap,
    readableAddrMap,
  },
  version: '1.2.1-20190104',
}

export default config
