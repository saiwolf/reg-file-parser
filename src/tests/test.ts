import { IRegFileObject, RegFileObject } from '../';

export default function main(): IRegFileObject {
    try {        
        const regObject: IRegFileObject = new RegFileObject('./src/tests/test.reg');
        const result = regObject.parseFile();
        if (process.env.NODE_ENV === 'development') { console.log(result); }
        return result;
    } catch (err) {
        throw new Error(err as string);
    }
}

main();