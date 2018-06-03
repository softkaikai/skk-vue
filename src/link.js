import Directive from './directives/directive';

export default function link(vm) {
    // create directives
    vm._dirs = vm._descriptors.map((des) => {
        return new Directive(des, vm);
    });
    // bind all directives and add watchers for them
    vm._dirs.forEach((dir) => {
        dir._bind();
    })
}