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
import { MHControl } from './MHControl';
import './extensions';

export class MagicHomeAccessory implements AccessoryPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  MHOnControl: MHControl;
  MHBrightnessControl: MHControl;

  constructor(public readonly log: Logger, public readonly config: AccessoryConfig, public readonly api: API) {
    this.log = log;
    this.config = config;
    this.api = api;

    const configuration = {
      host: this.config.ip,
      port: this.config.port || 5577,
      connect_timeout: this.config.connect_timeout || 1000,
      response_timeout: this.config.response_timeout || 500,
      command_timeout: this.config.command_timeout || 100,
    };

    this.MHOnControl = new MHControl(configuration);
    this.MHBrightnessControl = new MHControl(configuration);

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
      .setCharacteristic(this.Characteristic.SerialNumber, '123-456-789')
      .setCharacteristic(this.Characteristic.FirmwareRevision, '0.0.1');

    const lightbulbService = new this.Service.Lightbulb(this.config.name);

    lightbulbService
      .getCharacteristic(this.Characteristic.On)
      .on(CharacteristicEventTypes.GET, this.getPowerState.bind(this))
      .on(CharacteristicEventTypes.SET, this.setPowerState.bind(this));

    lightbulbService
      .addCharacteristic(this.Characteristic.Brightness)
      .on(CharacteristicEventTypes.GET, this.getBrightness.bind(this))
      .on(CharacteristicEventTypes.SET, this.setBrightness.bind(this));

    return [informationService, lightbulbService];
  }

  getPowerState(callback: CharacteristicGetCallback) {
    this.MHOnControl.queryState()
      .then((state) => {
        const isOn = this.powerState(state.on);
        this.log.debug('Power: "' + isOn + '"');
        callback(null, state.on);
      })
      .catch((error) => {
        this.log.error('Error getting power state: ' + error);
        callback(error);
      });
  }

  setPowerState(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.MHOnControl.setPower(value as boolean)
      .then(() => {
        this.log.debug('Power Set: "' + this.powerState(value as boolean) + '"');
        callback(null);
      })
      .catch((error) => {
        this.log.error('Error setting power state: ' + error);
        callback(error);
      });
  }

  getBrightness(callback: CharacteristicGetCallback) {
    this.MHBrightnessControl.queryState()
      .then((state) => {
        const brightness = state.brightness.convertToPercent(255);
        this.log.debug('Brightness: "' + brightness + '%"');
        callback(null, brightness);
      })
      .catch((error) => {
        this.log.error('Error getting brightness: ' + error);
        callback(error);
      });
  }

  setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.MHBrightnessControl.sendBrightnessCommand((value as number).convertToColor(255))
      .then(() => {
        this.log.debug('Brightness Set: "' + value + '%"');
        callback(null);
      })
      .catch((error) => {
        this.log.error('Error setting brightness: ' + error);
        callback(error);
      });
  }

  private powerState(state: boolean): string {
    return state ? 'On' : 'Off';
  }
}
