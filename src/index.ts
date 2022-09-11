/**
 * ./src/index.ts
 * @author Lukas Pistrol <lukas@pistrol.com>
 */

import { API } from 'homebridge';

// import { ACCESSORY_NAME } from './settings';
// import { MagicHomeAccessory } from './MagicHomeAccessory';
import { PLATFORM_NAME } from './settings';
import { MagicHomePlatform } from './MagicHomePlatform';

export = (api: API) => {
  // api.registerAccessory(ACCESSORY_NAME, MagicHomeAccessory);
  api.registerPlatform(PLATFORM_NAME, MagicHomePlatform);
};
