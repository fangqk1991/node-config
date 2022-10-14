const fs = require('fs')
const path = require('path')
const _ = require('lodash')

let _configData

module.exports.makeRunningConfig = (clearEnvData = false) => {
  if (!_configData) {
    const env = process.env.NODE_CONFIG_ENV || process.env.NODE_ENV || 'development'
    console.info(`Config Env: ${env}`)
    if (!process.env.NODE_CONFIG_ENV) {
      process.env.NODE_CONFIG_ENV = env
    }
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = env
    }
    let envConfigData = {}
    if (process.env.ENV_CONFIG_DATA) {
      try {
        envConfigData = JSON.parse(process.env.ENV_CONFIG_DATA) || {}
      } catch (e) {}
    }
    let envConfigDataExtras = {}
    if (process.env.ENV_CONFIG_DATA_EXTRAS) {
      try {
        envConfigDataExtras = JSON.parse(process.env.ENV_CONFIG_DATA_EXTRAS) || {}
      } catch (e) {}
    }

    let workspaceRoot = ''
    let i = 0
    const cwd = process.cwd()
    while (!workspaceRoot) {
      const root = path.resolve(cwd, _.repeat('../', i))
      i += 1
      if (fs.existsSync(path.resolve(root, './config/default.json'))) {
        workspaceRoot = root
      }
      if (root === '/') {
        throw new Error('config/default.json missing.')
      }
    }

    const defaultConfigPath = path.resolve(workspaceRoot, './config/default.json')
    const envConfigPath = path.resolve(workspaceRoot, `./config/${env}.js`)
    const runtimeConfigPath = path.resolve(workspaceRoot, './config/runtime.extras.js')

    let envConfig = {}
    let defaultConfig = {}
    let runtimeConfig = {}
    let extraConfig = {}
    if (typeof __non_webpack_require__ === 'function') {
      // For node.js Runtime
      defaultConfig = __non_webpack_require__(defaultConfigPath)
      envConfig = __non_webpack_require__(envConfigPath)
      if (process.env.NODE_CONFIG_EXTRA_JS) {
        // NODE_CONFIG_EXTRA_JS should use absolute-path
        extraConfig = __non_webpack_require__(process.env.NODE_CONFIG_EXTRA_JS)
      }
      if (fs.existsSync(runtimeConfigPath)) {
        runtimeConfig = __non_webpack_require__(runtimeConfigPath)
      }
    } else {
      // For webpack building
      defaultConfig = require(defaultConfigPath)
      if (fs.existsSync(envConfigPath)) {
        envConfig = require(envConfigPath)
      }
    }

    if (_.isEmpty(envConfig) && env !== 'development') {
      throw new Error(`config/${env}.js missing.`)
    }

    _configData = _.defaultsDeep(
      {
        Env: env,
      },
      envConfigDataExtras,
      envConfigData,
      extraConfig,
      runtimeConfig,
      envConfig,
      defaultConfig
    )
  }
  if (clearEnvData) {
    process.env.ENV_CONFIG_DATA = ''
    process.env.ENV_CONFIG_DATA_EXTRAS = ''
  }
  return _configData
}
