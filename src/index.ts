/**
 * ./src/index.ts
 * @author Lukas Pistrol <lukas@pistrol.com>
 */

import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { MagicHomePlatform } from './MagicHomePlatform';

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, MagicHomePlatform);
};
