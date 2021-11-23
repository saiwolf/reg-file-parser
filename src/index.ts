import { RegFileObject } from ".";
export * from './helpers';
export * from './reg-value-object';
export * from './reg-file-object';

function main() {
    const fileName = './putty.reg';
    const regFileObject = new RegFileObject(fileName);
    const content = JSON.stringify(regFileObject.regValues);
    console.log(regFileObject);
}

main();

