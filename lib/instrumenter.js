import d from 'debug';
import esprima from 'esprima';
import escodegen from 'escodegen';
import Walker from './walker';
import { flatMap } from 'lodash';
const debug = d('instrumenter');

// ast block of the expression we want to inject
const capture = (fileName) => esprima.parse((function x () {
    this.capture && this.capture(function () {
        global.i = global.i || 0;
        global.i++;
        return `screenshots/file/${global.i}.png`;
    }());
}).toString().replace('file', fileName)).body[0].body.body[0];
// body of program > function > block statement > Expression Statement

let captureAST;

export default class Instrumenter {
    constructor(opts) {
        debug(`Creating Instrumenter with ${opts}`);
        this.opts = opts;
        this.walker = new Walker({
            FunctionExpression: this.injectInCallback,
            ExpressionStatement: this.checkIfInsideCasperTest
        });
    }

    instrument(fileContents, fileName) {
        debug('Received file ' + fileName);
        captureAST = capture(fileName);
        let ast = esprima.parse(fileContents, { loc: true });
        debug('Parsed AST');
        ast = this.walker.walk(ast);

        debug('Generating new file from AST');
        const generated = escodegen.generate(ast);

        return '// summoned!\n' + generated;
    }

    injectInCallback(node) {
        debug('injecting in callback');
        // this === walker
        if (!this.insideCasperBegin) {
            debug('not inside of casper.test.begin, bailing');
            return node;
        }
        debug('injecting in callback!');
        if (node && node.body && node.body && node.body.body.length) {
            debug('injecting the captures');
            debug('filename is ' + this.fileName);
            node.body.body = flatMap(node.body.body, (item) => [captureAST, item]);
            node.body.body.push(captureAST);
        }
        return node;
    }

    checkIfInsideCasperTest(node) {
        debug('check if inside casper.test.begin');
        if (node.expression.callee) {
            if (node.expression.callee && node.expression.callee.property && node.expression.callee.property.name === 'begin') {
                if (node.expression.callee && node.expression.callee.object && node.expression.callee.object.object && node.expression.callee.object.object.name === 'casper') {
                    if (node.expression.callee.object.property && node.expression.callee.object.property.name === 'test') {
                        debug('go inside casper.test.begin !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                        // this = walker
                        this.insideCasperBegin = true;
                    }
                }
            }
        }
        return node;
    }
}
