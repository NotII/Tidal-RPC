Self Reload JSON
================
[![GitHub issues](https://img.shields.io/github/issues/JLChnToZ/selfreloadjson.svg)](https://github.com/JLChnToZ/selfreloadjson/issues)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node version](https://img.shields.io/node/v/self-reload-json.svg)](package.json)
[![NPM version](https://img.shields.io/npm/v/self-reload-json.svg)](https://www.npmjs.com/package/self-reload-json)
[![NPM downloads](https://img.shields.io/npm/dt/self-reload-json.svg)](https://www.npmjs.com/package/self-reload-json)

Simple node.js module which will auto reload specified JSON file.
The instance created with this module will act as the parsed JSON object itself once loaded, you can read and write JSON content directly with the instance, also it will update automatically when the source JSON file is changed. Optional there is a save function that allows you write the modified data back into the JSON file.

Installation
------------

With NPM:
```sh
$ npm install self-reload-json
```

Then in script file:
```javascript
var SelfReloadJSON = require('self-reload-json');
```

Usage
-----
To load a JSON file:
```javascript
var config = new SelfReloadJSON(___dirname + '/config.json');
```
Then all loaded JSON content will be the part of the instance, just change it freely, then you can use the save function to save the changes back to the JSON file.

The `SelfReloadJSON` class itself inherits [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter).

### Methods
#### `new SelfReloadJSON(options | fileName)`
Construct the instance of self reload JSON file.
- **options** - object, see the options below:
  - **fileName** - string, defines the path to the JSON file.
  - **encoding** - string, defines the encoding of the JSON file. Default is `'utf8'`.
  - **additive** - boolean, defines the behavior when the JSON file changed externally, set to `true` if you want to keep the removed properties in the instance. Default is `false`.
  - **method** - string, must be `'native'` or `'polling'`, default is `'native'`, defines what method to determine the changes of JSON file. `'native'` mode will use system API to detect, and `'polling'` mode will poll the modefied time of the JSON file. In the most case 'native' is more efficient, but some of the operating system does not support this, in this case `'polling'` should be used as fallback.
  - **interval** - integer, the checking interval if 'polling' mode is used. Default is `5000` milliseconds.
  - **reviver** - function, the [reviver](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter) function when parsing JSON. Default is `null`.
  - **replacer** - either number, string or function, the [replacer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter) function when converting JSON object back to string. You can override this option while calling `save` (see below). Default is `null`.
  - **depth** - integer, depth of deep patching which try to keeps child object with same references, 0 to disable, negative values to apply all. Default is -1.
  - **delay** - integer, set the delay time to trigger update the object in order to prevent event triggered several times or sometimes throws error because of trying to read the source JSON file but it is not yet completely updated. Default is 0 (immediately).

#### `stop()`
Stop watching the changes of the JSON file. You can use `resume` to continue watching the changes.

#### `resume()`
Start to watch the changes of the JSON file. In default, this is automatically called after instance construction.

#### `forceUpdate()`
Force update the JSON file.

#### `save(options)`
Write the changes back to the JSON file.
- **options** - object, optional, will use default or inherted settings if this is not defined, see the options below:
  - **encoding** - string, defines the encoding of the JSON file. Default value is inherted from the constructor options.
  - **replacer** - either number, string or function, see the description in the option with same name in constructor. Default value is inherted from there.
  - **space** - either number or string, [space](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_space_argument) parameter passed to `JSON.stringify`. Default is `null`.

### Events
As this class is also inherits from `EventHandler` class of Node.JS, it will expose 2 event types with event handler.

#### `on('updated', function(json) { ... })`
This event will be emitted after the JSON content refreshed. The `json` parameter is the raw parsed JSON object (not the SelfReloadJSON instance itself).

#### `on('error', function(err) { ... })`
This event will be emitted while error occured when loading the updated JSON file. The `err` parameter will be the error thrown by the updater.

Limit
-----
If a property name conflicts with the function names described above, they will be ignored. To get those values you should use `updated` event listener instead.

license
-------
[MIT](LICENSE)
