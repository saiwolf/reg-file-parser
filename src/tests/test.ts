import { IRegistryFile, RegFileObject } from '../';
import util from 'util';

export default function main(): IRegistryFile {
  try {
    const result: IRegistryFile = new RegFileObject('./test.reg');
    if (process.env.NODE_ENV === 'development') {
      console.log(util.inspect(result, true));
    }
    return result;
  } catch (err) {
    throw new Error(err as string);
  }
}

main();
