import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { MHPlatformAccessory } from './MHPlatformAccessory';

import { isEqual } from 'lodash';

/**
 * This is a type for the device configuration.
 */
export type Device = {
  name: string;
  ip: string;
  port: number;
  dimmable: boolean;
};

export class MagicHomePlatform implements DynamicPlatformPlugin {

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.api.updatePlatformAccessories([accessory]);
    this.accessories.push(accessory);
  }

  /** This funtion will be called after `didFinishLaunching` event. It gets the configured
   * devices from the config.json and adds them to the homebridge platform. If a device is already
   * cached it will be restored from cache. Should a device have been changed in the config.json
   * it will be removed and added again.
   */
  discoverDevices() {
    this.log.debug('Discovering devices');

    this.config.devices.forEach((device: Device) => {
      this.log.debug('Device found:', device.name);

      const uuid = this.api.hap.uuid.generate(device.ip);

      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        if (!isEqual(existingAccessory.context.device, device)) {
          this.log.warn('Device configuration changed, updating accessory', existingAccessory.displayName);
          this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
          this._addDevice(device, uuid);
        } else {
          this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
          new MHPlatformAccessory(this, existingAccessory, device);
        }
      } else {
        this._addDevice(device, uuid);
      }
    });
  }

  /** Adds a device to the platform */
  _addDevice(device: any, uuid: string) {
    this.log.info('Adding new accessory:', device.name);

    const accessory = new this.api.platformAccessory(device.name, uuid);
    accessory.context.device = device;

    new MHPlatformAccessory(this, accessory, device);

    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
  }

}