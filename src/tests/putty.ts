import { IRegistryFile, RegFileObject } from '../';
import util from 'util';

export default function main(): void {
  try {
    const puttyReg: IRegistryFile = new RegFileObject('./putty.reg');
    if (puttyReg.regValues.length === 0) {
      throw new Error('No values found for test!');
    }
    puttyReg.regValues.forEach((result) => {
      result.values.forEach((dataEntry) => {
        if (dataEntry.entry.includes('Colour')) {
          console.log(`${dataEntry.entry}:${dataEntry.value}`);
        }
      });
    });
  } catch (err) {
    throw new Error(err as string);
  }
}

main();
