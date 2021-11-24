//import { IRegFileObject, IRegValueObject, RegFileObject, RegValueObject } from ".";
import lineReader from 'line-reader';
import fs, { ReadStream } from 'fs';
import path from 'path';
import readline from 'readline';
import { isNull } from 'util';
export interface IRegKey {
    root: string;
    action: 'adding' | 'removing';
    keyWithoutRoot: string;
    values: IRegValueMap[];
}

interface IRegValueMap {
    key: string;
    value: string;
}

export function getFileStream(filePath: string): ReadStream {
    // eslint-disable-next-line no-useless-catch
    try {
        if (filePath) {
            const pathName = path.resolve(filePath);
            return fs.createReadStream(pathName, {
                encoding: 'ascii'
            });
        } else {
            throw new Error('No filePath specified!');
        }
    } catch (err) {
        throw err;
    }
};

export async function parseFile(filePath: string) {
    const stream = getFileStream(filePath);

    lineReader.eachLine(stream, function (line: string) {
        const pline = line.replace(/[^a-zA-Z0-9\\[\]%\\_="\s.,]+/g, '');
        const keys: IRegKey[] = [];
        const rawKey = getRegKey(pline);
        // if (!rawKey || rawKey === "") { return; }

        const vals = getKeyValues(pline);

        if (vals !== null) {
            const key: IRegKey = {
                root: getKeyRoot(rawKey),
                action: getKeyAction(rawKey) ? 'removing' : 'adding',
                keyWithoutRoot: getKeyWithoutRoot(rawKey),
                values: vals
            };

            keys.push(key);
            console.log(keys);
        }        
    }, function (err) {
        if (err) throw err;
    });
}

function getRegKey(fileLine: string) {    
    if (!fileLine) return "";
    if (!fileLine.includes('[HKEY')) { return ""; }

    const startingBracket = fileLine.indexOf('[') + 1;
    const endingBracket = fileLine.indexOf(']');

    return fileLine.substring(startingBracket, endingBracket);
}

function getKeyRoot(key: string) {
    if (!key) return "";
    if (key.startsWith("HKEY_LOCAL_MACHINE")) {        
        return "HKEY_LOCAL_MACHINE";
    } else if (key.startsWith("HKEY_CLASSES_ROOT")) {
        return "HKEY_CLASSES_ROOT";
    } else if (key.startsWith("HKEY_USERS")) {
        return "HKEY_USERS";
    } else if (key.startsWith("HKEY_CURRENT_CONFIG")) {
        return "HKEY_CURRENT_CONFIG";
    } else if (key.startsWith("HKEY_CURRENT_USER")) {
        return "HKEY_CURRENT_USER";
    } else {
        return "";
    }
}

function getKeyWithoutRoot(key: string) {
    if (!key) return "";
    if (key.startsWith("HKEY_LOCAL_MACHINE")) {
        key = key.substring(18);
        if (key.startsWith("\\")) { key = key.substring(1) }
        return key;
    } else if (key.startsWith("HKEY_CLASSES_ROOT")) {
        key = key.substring(17);
        if (key.startsWith("\\")) { key = key.substring(1) }
        return key;
    } else if (key.startsWith("HKEY_USERS")) {
        key = key.substring(10);
        if (key.startsWith("\\")) { key = key.substring(1) }
        return key;
    } else if (key.startsWith("HKEY_CURRENT_CONFIG")) {
        key = key.substring(19);
        if (key.startsWith("\\")) { key = key.substring(1) }
        return key;
    } else if (key.startsWith("HKEY_CURRENT_USER")) {
        key = key.substring(17);
        if (key.startsWith("\\")) { key = key.substring(1) }
        return key;
    } else {
        return "";
    }
}

function getKeyAction(key: string): boolean {
    if (!key) { return false; }
    if (key.startsWith('-')) { return true; }
    return false;
}

function getKeyValues(line: string): IRegValueMap[] | null {
    const regValues: IRegValueMap[] = [];
    if (line.includes('[HKEY')) { return null; }
    const lineRegex = new RegExp(/(".+"|@)=(".+")/g);
    const matches = [...line.matchAll(lineRegex)];

    if (matches.length === 0) { return null }

    matches.forEach((match) => {
        if (match[1] === undefined || match[2] === undefined) { return; }
        const key = match[1].replace('"', '');
        const value = match[2].replace('"', '');
        regValues.push({ key: key, value: value });
    })

    return regValues;
}