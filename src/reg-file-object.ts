/* eslint-disable no-useless-escape */
import { StripLeadingChars, RegistryRootHive } from ".";

import fs from 'fs';
import path from 'path';

type RegistryKeyAction = "adding" | "removing";

/**
 * Interface for a registry file object.
 */
export interface IRegFileObject {
    path: string,
    filename: string,
    encoding: string,
    content: string,
    regValues: IRegKey[],
    parseFile(): IRegFileObject,
}

export interface IRegKey {
    root: string;
    action: RegistryKeyAction;
    keyWithoutRoot: string;
    values: IRegValueMap[];
}

interface IRegValueMap {
    key: string;
    value: string;
}

/**
 * @implements `IRegFileObject`.
 * 
 * Class that encompasses a registry file object with registry values
 * 
 */
export class RegFileObject implements IRegFileObject {
    path: string;
    filename: string;
    encoding: string;
    content: string;
    regValues: [];

    constructor(regFileName: string) {
        this.path = regFileName;
        this.filename = path.basename(this.path);
        this.encoding = "UTF8";
        this.regValues = [];
        this.content = "";
    }

    private getFileContents(filePath: string): string {
        // eslint-disable-next-line no-useless-catch
        try {
            if (filePath) {
                const pathName = path.resolve(filePath);
                const fileData = fs.readFileSync(pathName).toString();
                return fileData.replace(/[^a-zA-Z0-9\\[\]%\\_=():,"\s.,]+/g, '');
            } else {
                throw new Error('No filePath specified!');
            }
        } catch (err) {
            throw err;
        }
    };
    
    public parseFile(): IRegFileObject {
        this.content = this.getFileContents(this.path);
        const regKeyValues: IRegKey[] = [];
        const keys = this.normalizeKeysDictionary(this.content);
        if (keys.length > 0) {
            keys.forEach((key) => {
                const regKey = this.getRegKey(key.key);
                const rootHive = this.getKeyRoot(regKey);
                const noRoot = this.getKeyWithoutRoot(regKey);
                const parsedValues = this.normalizeValues(key.value);
                regKeyValues.push({
                    root: rootHive,
                    action: this.getKeyAction(regKey),
                    values: parsedValues,
                    keyWithoutRoot: noRoot,
                });
            });
        } else {
            throw new Error('No keys found to process!');
        }
        const fileObject: IRegFileObject = new RegFileObject(this.path);
        fileObject.regValues = regKeyValues;
        return fileObject;
    }
    
    private normalizeKeysDictionary(content: string): IRegValueMap[] {
        const regex = new RegExp(/(\[[\w\%\^(\\| )\]\r\n]+)([^\[]*)/gm);
        const matches = [...content.matchAll(regex)];
        const tempHolder: IRegValueMap[] = [];
        
        if (matches !== null) {
            matches.forEach((match) => {
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
    
                const sValue = match[2].trim();
    
                tempHolder.push({ key: sKey, value: sValue});
            });       
        }
    
        return tempHolder;
    }
    
    private normalizeValues(content: string): IRegValueMap[] {
        const regValues: IRegValueMap[] = [];
        const regex = new RegExp(/(?!^\[.+\])(^(\".+\"|@)=(\"[^\"]*\"|[^\"\[]+))/gm);
        if (!content) { return regValues }
        const matches = [...content.matchAll(regex)];
        if (matches !== null) {
            matches.forEach((match) => {
                let sKey = match[2].trim();
                let sValue = match[3].trim();
                if (sKey.startsWith('\"')) { sKey = sKey.substring(1, sKey.length); }
                if (sKey.endsWith("\"")) { sKey = sKey.substring(0, sKey.length - 1); }
                if (sValue.startsWith('=')) { sValue = sValue.substring(1, sValue.length); }
                sValue = sValue.split('\r\n').join('');
                regValues.push({
                    key: sKey,
                    value: sValue,
                });
            });
        }
        return regValues;
    }
    
    private getRegKey(fileLine: string) {    
        if (!fileLine) return "";
        if (!fileLine.includes('[HKEY')) { return ""; }
    
        const startingBracket = fileLine.indexOf('[') + 1;
        const endingBracket = fileLine.indexOf(']');
    
        return fileLine.substring(startingBracket, endingBracket);
    }
    
    private getKeyRoot(key: string): RegistryRootHive {
        if (!key) return RegistryRootHive.UNKNOWN;
        if (key.startsWith("HKEY_LOCAL_MACHINE")) {        
            return RegistryRootHive.HKLM;
        } else if (key.startsWith("HKEY_CLASSES_ROOT")) {
            return RegistryRootHive.HKCR;
        } else if (key.startsWith("HKEY_USERS")) {
            return RegistryRootHive.HKU;
        } else if (key.startsWith("HKEY_CURRENT_CONFIG")) {
            return RegistryRootHive.HKCC;
        } else if (key.startsWith("HKEY_CURRENT_USER")) {
            return RegistryRootHive.HKCU;
        } else {
            return RegistryRootHive.UNKNOWN;
        }
    }
    
    private getKeyWithoutRoot(key: string) {
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
    
    private getKeyAction(key: string): RegistryKeyAction {
        if (!key) { return 'adding'; }
        if (key.startsWith('-')) { return 'removing'; }
        return 'adding';
    }
}