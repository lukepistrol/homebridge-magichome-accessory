# Homebridge-MagicHome-Accessory

This plugin allows MagicHome single channel devices to be switched on/off and to be dimmed in HomeKit.

## Config

```json
"accessories": [
    {
      "accessory": "MagicHomeAccessory",
      "name": "LED Strip",
      "ip": "<The local IP address>",
      "port": 5577, // (optional, Default: 5577)
      "connect_timeout": 1000, // (optional, Default: 1000)
      "response_timeout": 500, // (optional, Default: 500)
      "command_timeout": 100 // (optional, Default: 100)
    },
],
```

## Supported Devices

At this time only single channel/color controllers are supported like this one:

![Single Channel](./.docs/single-channel.jpeg)
