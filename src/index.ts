import { API } from 'homebridge';

import { ACESSORY_NAME } from './settings';
import { MagicHomeAccessory } from './accessory';

export = (api: API) => {
  api.registerAccessory(ACESSORY_NAME, MagicHomeAccessory);
};