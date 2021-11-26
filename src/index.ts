import { parseFile } from './';
export * from './file-parser';
export * from './helpers';
export * from './reg-value-object';
export * from './reg-file-object';

function main() {
    try {        
        console.log(parseFile('./test.reg'));
    } catch (err) {
        console.error(err);
    }
}

main();

