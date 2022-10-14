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

    let envConfig = {}
    let defaultConfig = {}
    let runtimeConfig = {}
    let extraConfig = {}

    // NODE_CONFIG_EXTRA_JS should use absolute-path
    const extrasConfigPath = process.env.NODE_CONFIG_EXTRA_JS
    if (typeof __non_webpack_require__ === 'function') {
      // For node.js Runtime
      console.info(`__non_webpack_require__ is a function, for runtime`)
      defaultConfig = __non_webpack_require__(defaultConfigPath)
      envConfig = __non_webpack_require__(envConfigPath)
      if (extrasConfigPath) {
        extraConfig = __non_webpack_require__(extrasConfigPath)
      }
    } else {
      console.info(`__non_webpack_require__ is undefined, maybe for webpack building`)
      // For webpack building
      defaultConfig = require(defaultConfigPath)
      if (fs.existsSync(envConfigPath)) {
        envConfig = require(envConfigPath)
      }
      if (extrasConfigPath) {
        extraConfig = require(extrasConfigPath)
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
