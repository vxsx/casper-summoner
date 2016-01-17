import d from 'debug';
import { isArray } from 'lodash';
import SYNTAX from './syntax';
const debug = d('walker');

export default class Walker {
    constructor(walkMap) {
        debug('Creating Walker');
        this.walkMap = walkMap;
        this.insideCasperBegin = false;
    }

    walk(node) {
        debug('walk');

        this.applyTransform(node);

        return node;
    }

    applyTransform(node, walkFn=this.walkFn) {
        // debug('Apply transform');
        const ret = walkFn.call(this, node);
        // debug('Finish apply transform');
        return ret || node;
    }

    walkFn(node) {
        // debug('walk', node);
        const type = node.type;
        // skip the ones we have injected
        const applyCustomWalker = !!node.loc;
        const walkerFn = applyCustomWalker ? this.walkMap[type] : null;

        let ret;

        if (this.insideCasperBegin) {
            debug('!!! go inside casper.test.begin');
        }

        if (walkerFn) {
            ret = this.applyTransform(node, walkerFn);
        }
        const childrenType = SYNTAX[node.type].children;

        debug(`ChildrenType: ${JSON.stringify(childrenType, null, 4)}`);
        if (childrenType && childrenType.length) {
            childrenType.forEach((childType) => {
                // debug(`Child: ${node[childType]}`);
                const child = node[childType];
                if (child) {
                    if (isArray(child)) {
                        node[childType].map((child) => this.applyTransform(child));
                    } else {
                        node[childType] = this.applyTransform(child);
                    }
                }
            });
        }

        return ret || node;
    }
}
