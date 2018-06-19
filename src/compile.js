import dirs from './directives/index';
import link from './link';
import {trim,callHook} from './util/index'

export default function compile(vm) {
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

    // dom挂在完毕
    callHook(vm, 'mounted');
}

export function compileTemplate(vm, el) {
    if (vm._descriptorsTemp) {
        vm._descriptors = [...vm._descriptorsTemp];
    } else {
        vm._descriptors = [];
    }

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
            })
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
        })
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
            }
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
    })
}

function getDirDescriptor(vm, node) {
    let attrs = getAllAttrs(node);

    for (let attr of attrs) {
        if (attr.name === 'v-if' || attr.name === 'v-for' || attr.name === 'component') {

            vm._descriptors.push(createDescriptor(node, attr));
            return false;
        }
    }

    attrs.forEach((attr) => {
        if (dirs[attr.name]) {
            vm._descriptors.push(createDescriptor(node, attr))
        }
    });

    return true;
}

function createDescriptor(node, attr) {
    const tagName = node.nodeName.toLowerCase();

    return {
        tag: tagName,
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
    let attrs = Array.from(node.attributes) || [];

    const tagName = node.nodeName.toLowerCase();
    if (Sue.options.components[tagName]) {
        attrs.push({
            name: 'component',
            value: '21321312321',
        });
    }

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
