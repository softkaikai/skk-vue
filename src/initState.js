import {noop, isFunction, isObject, hasOwn} from './util/index';
import Watcher from './watcher'
import Observer, {observer} from './observer'


export function initState (Sue, options) {
    Sue.parentScope = null;
    Sue._scope = this;
    Sue.$filters = {};
    Sue.$options = options;
    options.data = options.data || {};
    if (options.filters) {
        Sue.$filters = options.filters;
    }
    if (options.methods) {
        initMethods(Sue, options.methods);
    }
    if (options.data) {
        initData(Sue, options.data);
    }
    if (options.computed) {
      initComputed(Sue, options.computed);
    }
}

var sharePropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}
function proxy(Sue, key, sourceKey) {
    sharePropertyDefinition.get = function() {
        return Sue[sourceKey][key];
    }
    sharePropertyDefinition.set = function(val) {
        Sue[sourceKey][key] = val;
    }
    Object.defineProperty(Sue, key, sharePropertyDefinition);
}

function initComputed(Sue, computed) {
  let watchers = Sue._computedWatchers = Object.create(null);

  for (let key in computed) {
    if (key in Sue) {
      throw new Error(`The computed property has in Sue`);
    } else {
      const getter = computed[key];
      watchers[key] = new Watcher(Sue, getter, noop);
      defineComputed(Sue, key, getter);
    }
  }
}

function defineComputed(Sue, key, getter) {
  sharePropertyDefinition.get = getter;
  sharePropertyDefinition.set = noop;

  Object.defineProperty(Sue, key, sharePropertyDefinition);
}

function initData(Sue, data) {
    var datas = isFunction(data) ? data() : data || {};
    var opts = Sue.$options;
    Sue._data = datas;

    for (let key in datas) {
        if (key in Sue) {
            throw new Error(`data ${key} conflicts with an existing Sue instance property`);
        }
        proxy(Sue, key, '_data');
    }
    observer(Sue._data);
    // observer(Sue._data, datas);
}




function initMethods(Sue, methods) {
    for (let key in methods) {
        if (key in Sue) {
            throw new Error(`method ${key} conflicts with an existing Sue instance property`);
        }
        Sue[key] = methods[key] == null ? noop : methods[key];
    }
}
