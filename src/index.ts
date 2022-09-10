import { API } from 'homebridge';

import { ACCESSORY_NAME } from './settings';
import { MagicHomeAccessory } from './MagicHomeAccessory';

export = (api: API) => {
  api.registerAccessory(ACCESSORY_NAME, MagicHomeAccessory);
};
