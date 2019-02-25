const throwAssertError = require('./error');
const checkType = require('./type');

const getKey = (name, key) => (name ? `${name}[${key}]` : key);

const expect = async (params, expectation, allParams, name) => Promise.all(Object
  .entries(expectation)
  .map(async ([key, value]) => {
    const keyName = getKey(name, key);
    if (typeof value !== 'object') {
      if (params[key] === undefined || params[key] === null) {
        throwAssertError(`Bad request, ${keyName} is required`, value, 'required');
      }
      checkType(params[key], value, key, keyName, params);
      return;
    }

    const {
      type, required = true, default: defaultVal,
      validate, schema, item, process,
    } = value;

    if (params[key] === undefined || params[key] === null) {
      if (required === true || (typeof required === 'function' && await required(allParams))) {
        if (defaultVal) {
        // eslint-disable-next-line no-param-reassign
          params[key] = typeof defaultVal === 'function' ? await defaultVal(allParams) : defaultVal;
        } else {
          throwAssertError(`Bad request, ${keyName} is required, no default value provided`, value, 'required');
        }
      } else {
        return;
      }
    }

    if (type) {
      checkType(params[key], type, key, keyName, params, value);
    }

    if (validate && !validate(params[key], params)) {
      throwAssertError(`Bad request, ${keyName} is invalid`, value, 'validate');
    }

    if (schema && typeof schema === 'object') {
      await expect(params[key], schema, allParams, keyName);
    }

    if (type === Array && item) {
      await expect(params[key], (new Array(params[key].length)).fill(item), allParams, keyName);
    }

    if (process && typeof process === 'function') {
      params[key] = await process(params[key], allParams);
    }
  }));

module.exports = expect;
