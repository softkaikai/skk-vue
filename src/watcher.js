import Dep from "./dep";
import {isObject} from "./util/index";

let watcherId = 0;
let wait = false;
let watchers = [];
function pushQueen(watcher) {
    if (watchers.some(item => {return item.id === watcher.id})) {
        return;
    }

    watchers.push(watcher);
    watcherQueen();

}
function watcherQueen() {
    clearTimeout(wait);
    wait = setTimeout(() => {
        let temp = [...watchers];
        watchers = [];
        temp.forEach((watcher) => {
            if (watcher.expOrFn === 'firstname') {
            }
            watcher.run();
        })
        wait = false;
    }, 0);
}
export default class Watcher {
    constructor (vm, expOrFn, cb, options) {
        if (options) {
            this.deep = options.deep;
            this.sync = options.sync;
        } else {
            this.deep = false;
            this.sync = false;
        }
        this.getfn = null;
        this.id = watcherId++;
        this.vm = vm;
        this.cb = cb;
        this.expOrFn = expOrFn;
        this.depIds = new Set();
        this.value = this.get();

    }
    update () {
        if (!this.sync) {
            pushQueen(this);
        } else {
            this.run();
        }
    }
    run () {
        let value = '';
        if (this.getfn) {
            value =  this.getfn(this.vm);
        } else {
            value =  this.get();
        }

        if (this.value !== value || isObject(value) || Array.isArray(value)) {
            this.cb.call(this.vm, value, this.value);
            this.value = value;
        }
    }
    get () {
        let vm = this.vm;
        let getter = null;
        if (typeof this.expOrFn === 'function') {
          getter = this.expOrFn.bind(vm);
        } else {
          if (vm.$options.computed && vm.$options.computed[this.expOrFn]) {
            getter = vm.$options.computed[this.expOrFn].bind(vm);
          } else {
            getter = parseExpOrFn(this.expOrFn);
          }
        }
        Dep.target = this;
        const value = getter(vm);
        if (this.deep) {
            // touch every property so they can all track their getter for deep watching
            traverse(value);
        }
        Dep.target = null;
        this.getfn = getter;

        return value;
    }
    addDep (dep) {
        if (!this.depIds.has(dep.id)) {
            this.depIds.add(dep.id);
            dep.addSub(this);
        }
    }
}

function traverse(val) {
    const isA = Array.isArray(val);
    const isObj = isObject(val);
    if (!isA && !isObj) {
        return;
    }
    if (isA) {
        for (let [index, arrVal] of val.entries()) {
            traverse(arrVal);
        }
    } else if(isObj) {
        for (let [key, objVal] of Object.entries(val)) {
            traverse(val[key]);
        }
    }
}


function parseExpOrFn (expOrFn) {
    const segments = expOrFn.split('.');

    return function(obj) {
        for (let val of segments) {
            if (!obj) {
                break;
            } else {
                obj = obj[val];
            }
        }
        if (isObject(obj)) {
            return Object.assign({}, obj);
        }
        if (Array.isArray(obj)) {
            return [...obj]
        }
        return obj;
    }
}
