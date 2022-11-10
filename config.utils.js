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
      if (fs.existsSync(path.resolve(root, './config/default.js')) || fs.existsSync(path.resolve(root, './config/default.json'))) {
        workspaceRoot = root
      }
      if (root === '/') {
        throw new Error('Neither config/default.js or config/default.json exists.')
      }
    }

    const defaultConfigPath = path.resolve(workspaceRoot, './config/default.js')
    const defaultConfigPath2 = path.resolve(workspaceRoot, './config/default.json')
    const envConfigPath = path.resolve(workspaceRoot, `./config/${env}.js`)

    let defaultConfig = {}
    let envConfig = {}
    let extraConfig = {}

    // NODE_CONFIG_EXTRA_JS should use absolute-path
    const extrasConfigPath = process.env.NODE_CONFIG_EXTRA_JS
    const requireFunc = typeof __non_webpack_require__ === 'function' ? __non_webpack_require__ : require

    if (fs.existsSync(defaultConfigPath)) {
      defaultConfig = requireFunc(defaultConfigPath)
    } else if (fs.existsSync(defaultConfigPath2)) {
      defaultConfig = requireFunc(defaultConfigPath2)
    }
    if (fs.existsSync(envConfigPath)) {
      envConfig = requireFunc(envConfigPath)
    } else {
      console.warn(`config/${env}.js missing.`)
    }
    if (extrasConfigPath) {
      extraConfig = requireFunc(extrasConfigPath)
    }

    _configData = _.defaultsDeep(
      {
        Env: env,
      },
      envConfigDataExtras,
      envConfigData,
      extraConfig,
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
