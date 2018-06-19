
export default class FragFactory {
    constructor (vm, el, vfor, index, compileTemplate) {
        this.parentScope = vm;
        this._scope = Object.create(vm);
        this._scope[vfor.val] = vm[vfor.dataField][index];
        this._scope[vfor.key] = index;
        this.cloneEl = el.cloneNode(true);
        this.frag = compileTemplate(this._scope, this.cloneEl);
    }
}