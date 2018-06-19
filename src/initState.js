import {noop, isFunction, isObject, hasOwn, callHook} from './util/index';
import Watcher from './watcher'
import Observer, {observer} from './observer'
import {compileTemplate} from "./compile";
import dirs from "./directives/index";


export function initState (vm, options) {
    vm.parentScope = null;
    vm._scope = this;
    vm.$filters = {};
    vm.$options = options;
    options.data = isFunction(options.data) ? options.data() : options.data || {};
    initAsset(vm);
    if (options.props) {
        initProps(vm, options);
    }
    if (options.methods) {
        initMethods(vm, options.methods);
    }
    if (options.data) {
        initData(vm, options.data);
    }
    if (options.computed) {
      initComputed(vm, options.computed);
    }

    // 数据绑定完毕
    callHook(vm, 'created');
}

function initProps (vm, options) {
    vm._descriptorsTemp = [];
    const props = options.props;
    const parsedProps = options.parsedProps;
    const data = options.data = options.data || {};
    for (let [prop, value] of Object.entries(props)) {
        const parsedProp = parsedProps[prop];
        if (prop in data) {
            throw new Error(`The prop ${prop} has existing in data`);
        }
        if (parsedProp) {
            if (parsedProp.dynamic) {
                vm._descriptorsTemp.push({
                    tag: '',
                    dir: 'prop',
                    dirValue: parsedProp.parentPath,
                    el: '',
                    dirParam: prop,
                    dirOperations: dirs['prop'],
                    compileTemplate: compileTemplate
                });
                data[prop] = '';
            } else {
                data[prop] = parsedProp.parentPath;
            }
        } else {
            data[prop] = value || '';
        }
    }
}

function initAsset(vm) {
    vm.$filters = Sue.options.filters;
    vm.$components = Sue.options.components;
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

function initData(Sue, datas) {
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
