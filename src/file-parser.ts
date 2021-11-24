/* eslint-disable no-useless-escape */
//import { IRegFileObject, IRegValueObject, RegFileObject, RegValueObject } from ".";
import lineReader from 'line-reader';
import fs, { ReadStream } from 'fs';
import path from 'path';
import { StripLeadingChars } from '.';
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

export function getFileContents(filePath: string): string {
    // eslint-disable-next-line no-useless-catch
    try {
        if (filePath) {
            const pathName = path.resolve(filePath);
            const fileData = fs.readFileSync(pathName).toString();
            return fileData.replace(/[^a-zA-Z0-9\\[\]%\\_="\s.,]+/g, '');
        } else {
            throw new Error('No filePath specified!');
        }
    } catch (err) {
        throw err;
    }
};

export async function parseFile(filePath: string) {
    const fileData = getFileContents(filePath);
    const regKeyValues: IRegKey[] = [];
    const keys = normalizeKeysDictionary(fileData);
    if (keys.length > 0) {
        keys.forEach((key) => {
            const regKey = getRegKey(key.key);
            const rootHive = getKeyRoot(regKey);
            const noRoot = getKeyWithoutRoot(regKey);
            const parsedValues = normalizeValues(key.value);
            console.log(parsedValues);
        });
    } else {
        throw new Error('No keys found to process!');
    }
}

function normalizeKeysDictionary(content: string): IRegValueMap[] {
    const regex = new RegExp(/(\[.+\]\s)([\"\w\d\=\s\,\\\-\.]+)/g);
    const matches = [...content.matchAll(regex)];
    const tempHolder: IRegValueMap[] = [];
    // eslint-disable-next-line no-debugger
    if (matches !== null) {
        matches.forEach((match, index) => {
            let sKey = match[1];
            if (typeof sKey !== "string") { return; }
            if (sKey.endsWith("\r\n")) {
                sKey = sKey.substring(0, sKey.length - 2)
            }
            if (sKey.endsWith("=")) { sKey = sKey.substring(0, sKey.length - 1) };
            if (sKey === "@") {
                sKey = "";
            } else {
                sKey = StripLeadingChars(sKey, "\"");
            }

            const sValue = match[2];

            tempHolder.push({ key: sKey, value: sValue});
        });       
    }

    return tempHolder;
}

function normalizeValues(content: string): IRegValueMap[] {
    const regValues: IRegValueMap[] = [];
    const regex = new RegExp(/(\".+\")(\=[\w\d\:\s\(\)\,\\]+)/gm);
    if (!content) { return regValues }
    const matches = [...content.matchAll(regex)];
    if (matches !== null) {
        matches.forEach((match, index) => {
            let sKey = match[1].trim();
            let sValue = match[2].trim();
            if (sKey.startsWith('\"')) { sKey = sKey.substring(1, sKey.length); }
            if (sKey.endsWith("\"")) { sKey = sKey.substring(0, sKey.length - 1); }
            if (sValue.startsWith('=')) { sValue = sValue.substring(1, sValue.length); }
            // sValue = sValue.replace(/\s/g, '');
            regValues.push({
                key: sKey,
                value: sValue,
            });
        });
    }
    return regValues;
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

// function getKeyValues(line: string): IRegValueMap[] | null {
//     const regValues: IRegValueMap[] = [];
//     if (line.includes('[HKEY')) { return null; }
//     const lineRegex = new RegExp(/(".+"|@)=(".+")/g);
//     const matches = [...line.matchAll(lineRegex)];

//     if (matches.length === 0) { return null }

//     matches.forEach((match) => {
//         if (match[1] === undefined || match[2] === undefined) { return; }
//         const key = match[1].replace('"', '');
//         const value = match[2].replace('"', '');
//         regValues.push({ key: key, value: value });
//     })

//     return regValues;
// }