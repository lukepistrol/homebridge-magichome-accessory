# Homebridge-MagicHome-Accessory

> ⚠️ Since I moved from `homebridge` to `Home Assistant` I will no longer work on this plugin.

This plugin allows MagicHome single channel devices to be switched on/off and to be dimmed in HomeKit.

## Config

```json
"platforms": [
  {
    "name": "MagicHome",
    "devices": [
      {
        "name": "Kitchen Light",
        "ip": "192.168.0.54",
        "port": 5577,
        "dimmable": true
      },
      {
        "name": "Bedroom Light",
        "ip": "192.168.0.62",
        "port": 5577,
        "dimmable": false
      }
    ],
    "connect_timeout": 1000,
    "response_timeout": 500,
    "command_timeout": 100,
    "platform": "MagicHomePlatform"
  }
],
```

### Properties

### Platform

| Property                   | Description                                                                               | Default Value            |
| -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| platform *                 | The platform's name. This must not be changed!                                            | `"MagicHomePlatform"`    |
| name *                     | The name of the platform.                                                                 | `"MagicHome"`            |
| devices                    | An array of devices.                                                                      | empty                    |
| connect_timeout            | The time in `ms` after which the connection is beeing aborted without data sent/received. | `1000`                   |
| response_timeout           | The time in `ms` to wait for a response from the device.                                  | `500`                    |
| command_timeout            | The time in `ms` until a command is invalid.                                              | `100`                    |

`*` Required fields

### Devices

| Property   | Description                                                    | Default Value |
| ---------- | -------------------------------------------------------------- | ------------- |
| name *     | The name of the device that will be displayed in the Home app. | `""`          |
| ip *       | The IP addess of the device. (eg. "192.168.0.54")              | `empty`       |
| port *     | The port. Only change this if your device uses another port.   | `5577`        |
| dimmable * | Let the device be dimmable or only use an On/Off switch.       | `true`        |

`*` Required fields

## Supported Devices

At this time only single channel/color controllers are supported like this one:

![Single Channel](./.docs/single-channel.jpeg)

For RGB controllers I recommend using [homebridge-magichome2](https://www.npmjs.com/package/homebridge-magichome2).
