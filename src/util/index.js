export function noop () {

}

export function isObject (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}
export function isFunction (obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
}

export function hasOwn (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export function trim (str) {
    return str.replace(/^\s+|\s+$/g, '');
}

export function parseDom (str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.childNodes;
}

export function callHook (vm, hookName) {
    const fn = vm.$options[hookName];
    if (fn) {
        if (isFunction(fn)) {
            fn.call(vm);
        } else {
            throw new Error('${hookName} is not a hook funciton')
        }
    }

}
