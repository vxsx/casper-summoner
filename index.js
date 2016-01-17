import d from 'debug';
import fs from 'fs';
import path from 'path';
import Instrumenter from './lib/instrumenter';
const debug = d('app');

export default function (files) {
    const instrumenter = new Instrumenter();
    files.forEach((file) => {
        debug(`Instrumenting ${file}`);
        const fileContents = fs.readFileSync(file);
        const fileName = path.basename(file, '.js');

        const result = instrumenter.instrument(fileContents, fileName);

        fs.writeFileSync(file.replace(/\.js$/, '.summoned.js'), result);
    });
}
