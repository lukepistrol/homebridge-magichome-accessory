import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  Characteristic,
  CharacteristicValue,
  Logger,
  Service,
} from 'homebridge';

import { Control } from 'magic-home';

/*
 * Initializer function called when the plugin is loaded.
 */

export class MagicHomeAccessory implements AccessoryPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  MagicHome: Control;

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.MagicHome = new Control(this.config.ip, {
      apply_masks: this.config.apply_masks || false,
      command_timeout: this.config.timeout || 1000,
    });

    this.log.debug('MagicHomePlugin finished initializing!');
    this.log.debug('IP: ' + this.config.ip);
    this.log.debug('Timeout: ' + this.config.timeout);
    this.log.debug('Apply Masks: ' + this.config.apply_masks);
  }

  identify(): void {
    this.log.info('Identify!');
  }

  getServices(): Service[] {
    const informationService = new this.Service.AccessoryInformation();

    informationService
      .setCharacteristic(this.Characteristic.Manufacturer, 'MagicHome')
      .setCharacteristic(this.Characteristic.Model, 'LED Controller')
      .setCharacteristic(this.Characteristic.SerialNumber, '123-456-789');

    const lightbulbService = new this.Service.Lightbulb(this.config.name);

    lightbulbService
      .getCharacteristic(this.Characteristic.On)
      .on(CharacteristicEventTypes.GET, this.getPowerState.bind(this))
      .on(CharacteristicEventTypes.SET, this.setPowerState.bind(this));

    return [informationService, lightbulbService];
  }

  getPowerState(callback: CharacteristicGetCallback) {
    this.log.debug('Get Power State');
    this.MagicHome.queryState().then((state) => {
      const isOn = this.powerState(state.on);
      this.log.debug('Power State is currently: ' + isOn);
      callback(null, state.on);
    }).catch((error) => {
      this.log.error('Error getting power state: ' + error);
    });
  }

  setPowerState(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.log.debug('Set Power State to: ' + this.powerState(value as boolean));
    this.MagicHome.setPower(value as boolean).then(() => {
      callback(null);
    }).catch((error) => {
      callback(error);
    });
  }

  private powerState(state: boolean): string {
    return state ? 'On' : 'Off';
  }
}