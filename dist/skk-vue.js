var Sue = (function () {
    'use strict';

    function noop () {

    }

    function isObject (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
    function isFunction (obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }

    function hasOwn (obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    let uid = 0;
    class Dep {
        constructor () {
            this.id = uid++;
            // watchers
            this.subs = [];
        }
        addSub (watcher) {
            this.subs.push(watcher);
        }
        notify () {
            this.subs.forEach((sub) => {
                sub.update();
            });
        }
        depend () {
            if (Dep.target) {
                Dep.target.addDep(this);
            }
        }
    }


    Dep.target = null;

    class Observer {
        constructor (value) {
            this.value = value;
            this.walk(value);
        }
        // walk through each property and convert them into getter/setter
        // this method should only called when value type is object
        walk (obj) {
            for (let [key, val] of Object.entries(obj)) {
                defineReactive(obj, key);
            }
        }
    }

    function defineReactive(obj, key) {
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
        });
    }


    // try to create an observer for the value
    // return the new observer if observered successfully
    // or the existing observer if the value already has one
    function observer(value) {
        let ob = null;
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            ob = value.__ob__;
        } else if (Array.isArray(value) || isObject(value)) {
            ob = new Observer(value);
        }
        return ob;
    }

    function initState (Sue, options) {
        Sue.$options = options;
        options.data = options.data || {};
        if (options.methods) {
            initMethods(Sue, options.methods);
        }
        if (options.data) {
            initData(Sue, options.data);
        }
    }

    var sharePropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    };
    function proxy(Sue, key, sourceKey) {
        sharePropertyDefinition.get = function() {
            return Sue[sourceKey][key];
        };
        sharePropertyDefinition.set = function(val) {
            Sue[sourceKey][key] = val;
        };
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

    var vBind = {
        dirBind: function (el, value) {
            this.updateAttr = this.dirParam;
            this.el.removeAttribute(this.dir);
            this.el.setAttribute(this.dirParam, this.vm[this.dirValue]);
            this.dirUpdate(el, this.vm[this.dirValue]);
        },
        dirUpdate: function (el, value) {
            this.el.setAttribute(this.updateAttr, value.toString());
        }
    }

    var vHtml = {
        dirBind: function (el, value) {
            this.updateAttr = 'innerHTML';
            this.el.removeAttribute(this.dir);
            this.dirUpdate(el, this.vm[value]);
        },
        dirUpdate: function (el, value) {
            el[this.updateAttr] = value.toString();
        }
    }

    var vOn = {
        dirBind: function (el, value) {
            this.el.removeAttribute(this.dir);
            this.el.addEventListener(this.dirParam, (e) => {
                this.vm[this.dirValue](e);
            });
        },
        dirUpdate: function (el, value) {

        }
    }

    var vText = {
        dirBind: function (el, value) {
            this.updateAttr = 'textContent';
            this.el.removeAttribute(this.dir);
            this.dirUpdate(el, this.vm[value]);
        },
        dirUpdate: function (el, value) {
            el[this.updateAttr] = value.toString();
        }
    }

    var vModel = {
        dirBind: function (el, value) {
            this.updateAttr = 'value';
            this.el.removeAttribute(this.dir);
            this.dirUpdate(el, this.vm[this.dirValue]);
            this.el.addEventListener('input', (e) => {
                this.dirUpdate(el, el.value);
            });
        },
        dirUpdate: function (el, value) {
            el[this.updateAttr] = value.toString();
        }
    }

    var dirs = {
        'v-bind': vBind,
        'v-html': vHtml,
        'v-on': vOn,
        'v-text': vText,
        'v-model': vModel,
    }

    let watcherId = 0;
    let wait = false;
    let watchers = [];
    function pushQueen(watcher) {
        if (watchers.includes(watcher.id)) {
            return;
        }
        watchers.push(watcher);
        if (!wait) {
            watcherQueen();
        }
    }
    function watcherQueen() {
        setTimeout(() => {
            watchers.forEach((watcher) => {
                watcher.run();
            });
            wait = false;
            watchers = [];
        }, 0);
    }
    class Watcher {
        constructor (vm, expOrFn, cb, options) {
            if (options) {
                this.deep = options.deep;
                this.sync = options.sync;
            } else {
                this.deep = false;
                this.sync = false;
            }
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
            const value = this.get();
            if (this.value !== value || isObject(value) || Array.isArray(value)) {
                this.cb.call(this.vm, value, this.value);
                this.value = value;
            }
        }
        get () {
            let vm = this.vm;
            const getter = parseExpOrFn(this.expOrFn);
            Dep.target = this;
            const value = getter(vm);
            if (this.deep) {
                // touch every property so they can all track their getter for deep watching
                traverse(value);
            }
            Dep.target = null;
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

    class Directive {
        constructor (des, vm) {
            this.vm = vm;
            this.el = des.el;
            for (let key of  Object.keys(des.dirOperations)) {
                this[key] = des.dirOperations[key];
            }
            this.dir = des.dir;
            this.dirValue = des.dirValue;
            this.dirParam = des.dirParam;
        }
        _bind () {
            let that = this;
            this.dirBind(this.el, this.dirValue);
            new Watcher(this.vm, this.dirValue, function (newVal, oldVal) {
                that.dirUpdate(that.el, newVal);
            }, {
                deep: true,
                sync: false
            });
        }
        _update (newVal, oldVal) {
            this.dirUpdate(this.el, newVal);
        }
    }

    function link(vm) {
        // create directives
        vm._dirs = vm._descriptors.map((des) => {
            return new Directive(des, vm);
        });
        // bind all directives and add watchers for them
        vm._dirs.forEach((dir) => {
            dir._bind();
        });
    }

    function compile(vm) {
        let opts = vm.$options;
        if (!opts.el) {
            throw new Error('A el property that contains root dom id must be passed');
        }
        //
        let el = document.getElementById(opts.el);
        // copy a el for later replacing
        let originElParent = el.parentNode;

        let frag = compileTemplate(vm, el);

        if (originElParent) {
            originElParent.appendChild(frag);
        }
    }

    function compileTemplate(vm, el) {
        let frag = document.createDocumentFragment();
        frag.appendChild(el);

        frag.childNodes.forEach((childNode) => {
            compileNode(vm, childNode);
        });

        link(vm);

        return frag;
    }
    function compileNode(vm, node) {
        if (node.nodeType === 1) {
            getDirDescriptor(vm, node);
            if (node.hasChildNodes) {
                compileNodeList(vm, node.childNodes);
            }
        }
    }

    function compileNodeList(vm, childNodes) {
        childNodes.forEach((node) => {
            compileNode(vm, node);
        });
    }

    function getDirDescriptor(vm, node) {
        let attrs = getAllAttrs(node);
        attrs.forEach((attr) => {
            if (dirs[attr.name]) {
                vm._descriptors.push(createDescriptor(node, attr));
            }
        });
    }

    function createDescriptor(node, attr) {

        return {
            tag: node.nodeName.toLowerCase(),
            dir: attr.name,
            dirValue: attr.value,
            el: node,
            dirParam: attr.dirParam,
            dirOperations: dirs[attr.name]
        }
    }

    let matchVBind = /v-bind/;
    let matchVOn = /v-on/;
    function getAllAttrs(node) {
        let attrs = Array.from(node.attributes);

        return attrs.map((attr) => {
            let dirParam = '';
            let name = '';
            if (matchVBind.test(attr.name)) {
                dirParam = attr.name.split(':')[1];
                name = attr.name.split(':')[0];
            }
            if (matchVOn.test(attr.name)) {
                dirParam = attr.name.split(':')[1];
                name = attr.name.split(':')[0];
            }
            return {
                name: name || attr.name,
                value: attr.value,
                dirParam: dirParam
            }
        })
    }

    function Sue (options) {
        this._descriptors = [];
        this._dirs = [];
        this._init(options);
        this._compile();
    }
    Sue.prototype._init = function(options) {

        initState(this, options);
    };
    Sue.prototype._compile = function() {
        compile(this);
    };
    Sue.prototype.$watch = function(key, cb, options) {
        const watcher = new Watcher(this, key, cb, options);
    };

    return Sue;

}());
