import dirs from './directives/index';
import link from './link';

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
    })
}

function getDirDescriptor(vm, node) {
    let attrs = getAllAttrs(node);
    attrs.forEach((attr) => {
        if (dirs[attr.name]) {
            vm._descriptors.push(createDescriptor(node, attr))
        }
    })
}

function createDescriptor(node, attr) {
    let dirParam = '';

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
