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