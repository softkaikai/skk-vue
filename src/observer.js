import Dep from './dep'
import {noop, isFunction, isObject, hasOwn} from './util/index';


export default class Observer {
    constructor (value) {
        this.value = value;
        this.walk(value)
    }
    // walk through each property and convert them into getter/setter
    // this method should only called when value type is object
    walk (obj) {
        for (let [key, val] of Object.entries(obj)) {
            defineReactive(obj, key);
        }
    }
}

export function defineReactive(obj, key) {
    const dep = new Dep;

    let val = obj[key];
    let childOb = observer(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get () {
            const value = val;

            if (Dep.target) {
                // console.log(val);
                // avoid to repeatly add watcher
                dep.depend();
            }

            return value;
        },
        set (newVal) {
            if (newVal === val) {

                return;
            }
            val = newVal;
            // walk through each property of the newVal if it is a object of array
            // and convert them into getter/setters
            childOb = observer(val);
            dep.notify();
        }
    })
}


// try to create an observer for the value
// return the new observer if observered successfully
// or the existing observer if the value already has one
export function observer(value) {
    let ob = null;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else if (Array.isArray(value) || isObject(value)) {
        ob = new Observer(value);
    }
    return ob;
}