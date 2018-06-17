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

    function trim (str) {
        return str.replace(/^\s+|\s+$/g, '');
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
            this.updateAttr = el.nodeType === 3 ? 'data' : 'textContent';
            if (el.nodeType !== 3) {
                this.el.removeAttribute(this.dir);
            }
            let realValue = '';
            if (typeof value === 'function') {
                realValue = value.call(this.vm);
            } else {
                realValue = this.vm[value];
            }
            this.dirUpdate(el, realValue);
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
                this.vm[this.dirValue] = el.value;
            });
        },
        dirUpdate: function (el, value) {
            el[this.updateAttr] = value.toString();
        }
    }

    var vIf = {
        dirBind: function (el, value) {
            el.removeAttribute(this.dir);

            this.parentScope = this.vm;
            this._scope = Object.create(this.vm);
            this.parentNode = el.parentNode;
            this.refStart = document.createComment('v-if-start');
            this.refEnd = document.createComment('v-if-end');
            this.parentNode.insertBefore(this.refEnd, el);
            this.parentNode.insertBefore(this.refStart, this.refEnd);
            this.parentNode.removeChild(el);

            if (this.vm[value]) {
                this.dirInsert();
            }
        },
        dirUpdate: function (el, value) {
            if (value) {
                this.dirInsert();
            } else {
                this.dirRemove();
            }
        },
        dirInsert: function () {
            this.cloneEl = this.el.cloneNode(true);
            this.frag = this.compileTemplate(this._scope, this.cloneEl);
            this.parentNode.insertBefore(this.frag, this.refEnd);
        },
        dirRemove: function () {
            let removeEl = this.refStart.nextElementSibling;
            this.parentNode.removeChild(removeEl);
        }
    }

    class FragFactory {
        constructor (vm, el, vfor, index, compileTemplate) {
            this.parentScope = vm;
            this._scope = Object.create(vm);
            this._scope[vfor.val] = vm[vfor.dataField][index];
            this._scope[vfor.key] = index;
            this.cloneEl = el.cloneNode(true);
            this.frag = compileTemplate(this._scope, this.cloneEl);
        }
    }

    var vFor = {
        dirBind: function (el, value) {
            el.removeAttribute(this.dir);

            this.processVFor(value);

            // this.parentScope = this.vm;
            // this._scope = Object.create(this.vm);
            this.parentNode = el.parentNode;
            this.refStart = document.createComment('v-for-start');
            this.refEnd = document.createComment('v-for-end');
            this.parentNode.insertBefore(this.refEnd, el);
            this.parentNode.insertBefore(this.refStart, this.refEnd);
            this.parentNode.removeChild(el);
            this.dirUpdate(el, this.vm[this.vfor_dataField]);
        },
        dirUpdate: function (el, arrValue) {
            this.frags = [];
            if (!Array.isArray(arrValue)) {
                throw new Error('The map value of v-for must be a array');
            }
            this.clearNode();
            arrValue.forEach((val, index) => {
                this.frags.push(new FragFactory(this.vm, this.el, this.vfor, index, this.compileTemplate));
            });
            this.insertNode();
        },
        clearNode () {
            let next = this.refStart.nextSibling;
            while (next !== this.refEnd) {
                this.parentNode.removeChild(next);
                next = this.refStart.nextSibling;
            }
        },
        insertNode () {
            this.frags.forEach((value, index) => {
                this.parentNode.insertBefore(value.frag, this.refEnd);
            });
        },
        processVFor: function (value) {
            const reg = /(.*) (?:in|of) (.*)/;
            let inMatch = value.match(reg);

            this.vfor_dataField = trim(inMatch[2]);
            if (inMatch) {
                let itMatch = inMatch[1].match(/\((.*),(.*)\)/);
                if (itMatch) {
                    this.vfor_val = trim(itMatch[1]);
                    this.vfor_key = trim(itMatch[2]);
                } else {
                    this.vfor_val = trim(inMatch[1]);
                }
            } else {
                throw new Error('The express of v-for is wrong');
            }
            this.vfor = {
                dataField: this.vfor_dataField,
                val: this.vfor_val,
                key: this.vfor_key || 'index'
            };
            console.log(this.vfor);
        }
    }

    var vShow = {
        dirBind: function (el, value) {
            this.toggle(this.vm[value]);
        },
        dirUpdate: function (el, value) {
            this.toggle(value);
        },
        toggle (value) {
            this.el.style.display = !!value ? '' : 'none';
        }
    }

    var dirs = {
        'v-bind': vBind,
        'v-html': vHtml,
        'v-on': vOn,
        'v-text': vText,
        'v-model': vModel,
        'v-if': vIf,
        'v-for': vFor,
        'v-show': vShow,
    }

    class Directive {
        constructor (des, vm) {
            this.vm = vm;
            this.el = des.el;
            this.compileTemplate = des.compileTemplate;
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
            let watchValue = this.dirValue;
            if (this.dir === 'v-for') {
                watchValue = this.vfor_dataField;
            }
            new Watcher(this.vm, watchValue, function (newVal, oldVal) {
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
        vm._descriptors = [];
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
            const result = getDirDescriptor(vm, node);
            // 如果遇到v-if或者v-for就不继续编辑，因为他们有单独的作用域
            if (node.hasChildNodes && result) {
                compileNodeList(vm, node.childNodes);
            }
        } else if (node.nodeType === 3) {
            let tokens = compileTextNode(node);
            let parsedTokens = processToken(tokens);
            getTokensDescriptor(vm, node, parsedTokens);
            // console.log(tokens);
        }
    }

    const tagRE = /{{.+?}}/g;
    function compileTextNode (node) {
        let lastIndex = 0;
        let tokens = [];
        let text = node.data;
        let match = null;
        let index, tagValue;

        while(match = tagRE.exec(text)) {
            index = match.index;

            // If index is bigger then lastIndex, there has pure string between index and lastIndex
            // eg: {{to}} demo {{from}}
            if (index > lastIndex) {
                tokens.push({
                    value: text.slice(lastIndex, index)
                });
            }
            tagValue = match[0];
            tokens.push({
                // 是否是插值
                tag: true,
                value: tagValue
            });
            lastIndex = index + tagValue.length;
        }
        if (lastIndex < text.length) {
            tokens.push({
                value: text.slice(lastIndex)
            });
        }

        return tokens;
    }

    function processToken (tokens) {
        let parsedTokens = [];
        tokens.forEach((token, index) => {
            if (!token.tag) {
                parsedTokens.push(token);
            } else {
                parsedTokens.push(parseTokenValue(token));
            }
        });

        return parsedTokens;
    }

    function parseTokenValue (token) {
        let value = token.value.replace(/^{{|}}$/g, '');
        let splitValues = value.split('|');
        const filters = [];
        let tokenValue = '';
        splitValues.forEach((val, index) => {
            if (index === 0) {
                tokenValue = trim(val);
            } else {
                filters.push(trim(val));
            }
        });

        token.value = tokenValue;
        token.filters = filters;
        return token;
    }

    function getTokensDescriptor (vm, node, tokens) {
        let frag = document.createDocumentFragment();
        tokens.forEach(token => {
            frag.appendChild(createTextNode(vm, token));
        });
        if (node.parentNode) {
            node.parentNode.replaceChild(frag, node);
        }
    }

    function createTextNode (vm, token) {
        let el = null;
        if (!token.tag) {
            el = document.createTextNode(token.value || '');
        } else {
            el = document.createTextNode('');
            let expOrFn = '';
            if (token.filters && token.filters.length) {
                expOrFn = function () {
                   return token.filters.reduce((val, fn) => {
                        if (!this.$filters[fn]) {
                            throw new Error(`filter ${fn} does not exist`);
                        }
                        return this.$filters[fn](val);
                    }, this[token.value]);
                };
            } else {
                expOrFn = token.value;
            }

            const descriptor = {
                tag: 'text',
                dir: 'v-text',
                dirValue: expOrFn,
                el,
                dirParam: '',
                dirOperations: dirs['v-text']
            };
            vm._descriptors.push(descriptor);
        }

        return el;
    }

    function compileNodeList(vm, childNodes) {
        childNodes.forEach((node) => {
            compileNode(vm, node);
        });
    }

    function getDirDescriptor(vm, node) {
        let attrs = getAllAttrs(node);

        for (let attr of attrs) {
            if (attr.name === 'v-if' || attr.name === 'v-for') {
                vm._descriptors.push(createDescriptor(node, attr));
                return false;
            }
        }

        attrs.forEach((attr) => {
            if (dirs[attr.name]) {
                vm._descriptors.push(createDescriptor(node, attr));
            }
        });

        return true;
    }

    function createDescriptor(node, attr) {

        return {
            tag: node.nodeName.toLowerCase(),
            dir: attr.name,
            dirValue: attr.value,
            el: node,
            dirParam: attr.dirParam,
            dirOperations: dirs[attr.name],
            compileTemplate: compileTemplate
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
