# @fangcha/config

## Installation
```
# Use npm
npm install @fangcha/config

# Or use yarn
yarn add @fangcha/config
```

## Prepare
Create `config/default.js`

```
module.exports = {
  Env: 'It will be rewritten by process.env.NODE_CONFIG_ENV or process.env.NODE_ENV',
  prop1: 123,
  prop2: 'abc',
  ……
}
```

## Usage
```
import { GlobalAppConfig } from '@fangcha/config'

...
```

## Tips
1. `Env`'s default value is `development`
2. `./config/${env}.js` will be the `EnvConfigFile` 
3. `process.env.NODE_CONFIG_EXTRA_JS` will be the `ExtrasConfigFile`, it should use absolute-path
4. `process.env.ENV_CONFIG_DATA` will be the `RuntimeConfig`, it should be a JSON-string.
5. **Merge Priority**: `RuntimeConfig` > `ExtrasConfigFile` > `EnvConfigFile` > `default.js`

