/**
 * ./src/MHControl.ts
 * @author Lukas Pistrol <lukas@pistrol.com>
 */

import net = require('net');

/** A structure containing options for the {@link MHControl} */
type MHControlOptions = {
  host: string;
  port: number;
  connect_timeout?: number;
  response_timeout?: number;
  command_timeout?: number;
};

/** A structure containing the response of an accessory */
type MHQueryResponse = {
  on: boolean;
  brightness: number;
};

/** A structure containing a Command and callbacks */
type MHCommandBlock = {
  command: Buffer;
  resolve: any;
  reject: any;
  expectReply: boolean;
};

/** A class managing the sending and receiving of data between
 * plugin and the accessory.
 */
export class MHControl {
  private _address: string;
  private _port: number;
  private _socket?: net.Socket;
  private _receivedData: Buffer;
  private _cmdQueue: MHCommandBlock[] = [];

  private _connect_timeout: number;
  private _command_timeout: number;
  private _response_timeot: number;

  private _receiveTimeout?: NodeJS.Timeout;
  private _connectTimeout?: NodeJS.Timeout;
  private _commandTimeout?: NodeJS.Timeout;
  private _preventDataSending = false;

  constructor(options: MHControlOptions) {
    this._address = options.host;
    this._port = options.port;
    this._connect_timeout = options.connect_timeout || 1000;
    this._command_timeout = options.command_timeout || 100;
    this._response_timeot = options.response_timeout || 500;
    this._receivedData = Buffer.alloc(0);
  }

  /**
   * **Receive Data**
   *
   * Query the current state of the device
   *
   * @param  {boolean} empty
   * @param  {Buffer} data?
   * @returns void
   */
  _receiveData(empty: boolean, data?: Buffer): void {
    if (this._commandTimeout !== undefined) {
      clearTimeout(this._commandTimeout);
      this._commandTimeout = undefined;
    }

    if (empty) {
      const finished_command = this._cmdQueue[0];

      if (finished_command !== undefined) {
        const resolve = finished_command.resolve;
        if (resolve !== undefined) {
          resolve(this._receivedData);
        }
      }

      this._receivedData = Buffer.alloc(0);

      this._cmdQueue.shift();

      this._handleNextCommand();
    } else if (data !== undefined) {
      this._receivedData = Buffer.concat([this._receivedData, data]);

      if (this._receiveTimeout !== undefined) {
        clearTimeout(this._receiveTimeout);
      }

      this._receiveTimeout = setTimeout(() => {
        this._receiveData(true);
      }, this._response_timeot);
    }
  }

  /**
   * **Handle Command Timeout**
   *
   * This method is called when the device does not respond to a command within the specified timeout.
   */
  _handleCommandTimeout() {
    this._commandTimeout = undefined;

    const timeout_command = this._cmdQueue[0];

    if (timeout_command !== undefined) {
      const reject = timeout_command.reject;
      if (reject !== undefined) {
        reject(new Error('Command timeout'));
      }
    }

    this._receivedData = Buffer.alloc(0);

    this._cmdQueue.shift();

    this._handleNextCommand();
  }

  /**
   * **Handle Next Command**
   *
   * This method is called when the device has finished processing the previous command.
   */
  _handleNextCommand() {
    if (this._cmdQueue.length === 0) {
      if (this._socket !== null) {
        this._socket?.end();
      }
      this._socket = undefined;
    } else {
      const cmd = this._cmdQueue[0];

      if (!cmd.expectReply) {
        this._socket?.write(cmd.command, 'binary', () => {
          this._receiveData(true);
        });
      } else {
        this._socket?.write(cmd.command, 'binary', () => {
          if (this._command_timeout === undefined) {
            return;
          }
          this._commandTimeout = setTimeout(() => {
            this._handleCommandTimeout();
          }, this._command_timeout);
        });
      }
    }
  }

  /**
   * **Send Command**
   *
   * This method is called when a command is sent to the device.
   *
   * @param  {Buffer} buffer
   * @param  {boolean} expectReply
   * @param  {any} resolve
   * @param  {any} reject
   * @returns void
   */
  _sendCommand(buffer: Buffer, expectReply: boolean, resolve: any, reject: any): void {
    let checksum = 0;
    for (const byte of buffer.values()) {
      checksum += byte;
    }
    checksum &= 0xff;

    const command = Buffer.concat([buffer, Buffer.from([checksum])]);

    if (this._cmdQueue.length === 0 && this._socket === undefined) {
      this._cmdQueue.push({ command, resolve, reject, expectReply });

      this._preventDataSending = false;

      this._socket = net.connect(this._port, this._address, () => {
        if (this._connectTimeout !== undefined) {
          clearTimeout(this._connectTimeout);
          this._connectTimeout = undefined;
        }
        if (!this._preventDataSending) {
          this._socket && this._socket.write(command, 'binary');
        }
      });

      this._socket.on('error', (error) => {
        this._socket = undefined;
        reject(error);
      });

      this._socket.on('data', (data) => {
        this._receiveData(false, data);
      });

      if (this._connectTimeout !== undefined) {
        this._connectTimeout = setTimeout(() => {
          this._socket = undefined;
          reject(new Error('Connection timeout'));
        }, this._connect_timeout);
      }
    } else {
      this._cmdQueue.push({ command, resolve, reject, expectReply });
    }
  }

  /**
   * **Socket Error Handler**
   *
   * This method is called when an error occurs on the socket.
   *
   * @param  {Error} err
   * @param  {any} reject
   */
  _socketErrorHandler(err: Error, reject: any) {
    this._preventDataSending = true;

    reject(err);

    if (this._socket !== undefined) {
      this._socket.end();
    }
    this._socket = undefined;

    for (const c of this._cmdQueue) {
      const reject = c.reject;
      if (reject !== undefined) {
        reject(err);
      }
    }

    this._cmdQueue = [];
  }

  /**
   * **Send Brightness Command**
   *
   * This method is called when sending the brightness to the device.
   *
   * @param  {number} brightness
   * @param  {any} callback
   * @returns {Promise<boolean>} A Promise
   */
  sendBrightnessCommand(brightness: number, callback?: any): Promise<boolean> {
    const cmd_buf = Buffer.from([0x31, brightness, 0, 0, 0x03, 0x01, 0x0f]);

    const promise = new Promise<any>((resolve, reject) => {
      this._sendCommand(cmd_buf, false, resolve, reject);
    })
      .then((data) => {
        return data.count > 0;
      })
      .then((result) => {
        return result;
      });

    if (callback && typeof callback === 'function') {
      promise.then(callback.bind(null, null), callback);
    }

    return promise;
  }

  /**
   * **Send Power Command**
   *
   * This method is called when sending the power state to the device.
   *
   * @param  {boolean} on
   * @param  {any} callback?
   * @returns {Promise<boolean>} A Promise
   */
  setPower(on: boolean, callback?: any): Promise<boolean> {
    const cmd_buf = Buffer.from([0x71, on ? 0x23 : 0x24, 0x0f]);

    const promise = new Promise<any>((resolve, reject) => {
      this._sendCommand(cmd_buf, false, resolve, reject);
    }).then((data) => {
      return data.lenght > 0;
    });

    if (callback && typeof callback === 'function') {
      promise.then(callback.bind(null, null), callback);
    }

    return promise;
  }

  /**
   * **Query State**
   *
   * This method is called when querying the state of the device.
   *
   * @param  {any} callback?
   * @returns {Promise<boolean>} A Promise
   */
  queryState(callback?: any): Promise<MHQueryResponse> {
    const cmd_buf = Buffer.from([0x81, 0x8a, 0x8b]);

    const promise = new Promise<any>((resolve, reject) => {
      this._sendCommand(cmd_buf, true, resolve, reject);
    })
      .then((data) => {
        if (data.length !== 14) {
          throw new Error('Invalid response');
        }

        const state: MHQueryResponse = {
          on: data.readUInt8(2) === 0x23,
          brightness: data.readUInt8(6),
        };

        return state;
      })
      .catch((err) => {
        callback(err);
        return err;
      });

    if (callback && typeof callback === 'function') {
      promise.then(callback.bind(null, null), callback);
    }

    return promise;
  }
}
