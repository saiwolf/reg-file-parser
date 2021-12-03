import { IRegistryFile, RegFileObject } from '../src';

const bufferContent = `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\SimonTatham\\PuTTY\\Sessions\\Default%20Settings]
"Colour0"="131,148,150"
"Colour1"="147,161,161"
"Colour2"="0,43,54"
"Colour3"="7,54,66"
"Colour4"="0,43,54"
"Colour5"="238,232,213"
"Colour6"="7,54,66"
"Colour7"="0,43,56"
"Colour8"="220,50,47"
"Colour9"="203,75,22"
"Colour10"="133,153,0"
"Colour11"="88,110,117"
"Colour12"="181,137,0"
"Colour13"="101,123,131"
"Colour14"="38,139,210"
"Colour15"="131,148,150"
"Colour16"="211,54,130"
"Colour17"="108,113,196"
"Colour18"="42,161,152"
"Colour19"="147,161,161"
"Colour20"="238,232,213"
"Colour21"="253,246,227"`;

const file: IRegistryFile = new RegFileObject('./putty.reg');
const fileBuffer: Buffer = Buffer.from(bufferContent);
test('fs file should return a valid object', () => {

    expect(typeof file.content).toBe('string');
    expect(file.regValues.length).toBeGreaterThan(0);
    expect(file.encoding).not.toBeNull();
    expect(file.filename).not.toBeNull();
    expect(file.path).not.toBeNull();
});

test('buffer should return a valid object', () => {
    const file = new RegFileObject(fileBuffer);
    expect(typeof file.content).toBe('string');
    expect(file.regValues.length).toBeGreaterThan(0);
    expect(file.encoding).not.toBeNull();
});