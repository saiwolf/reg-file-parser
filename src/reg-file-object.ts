import {
    GetEncoding,
    IRegValueObject,
    RegValueObject,
    StripBraces,
    StripLeadingChars
} from ".";

import * as fs from 'fs-extra';
import path from 'path';
import readline from 'readline';


/**
 * Interface for a registry file object.
 */
export interface IRegFileObject {
    path: string,
    filename: string,
    encoding: string,
    content: string,
    regValues: Map<string, Map<string, IRegValueObject>>
}

/**
 * @implements `IRegFileObject`.
 * 
 * Responsible for loading a registry file and parsing its contents.
 * 
 */
export class RegFileObject implements IRegFileObject {
    path: string;
    filename: string;
    encoding: string;
    content: string;
    regValues: Map<string, Map<string, IRegValueObject>>;

    constructor(regFileName: string) {
        this.path = regFileName;
        this.filename = path.basename(this.path);
        this.encoding = "UTF8";
        this.regValues = new Map<string, Map<string, IRegValueObject>>();
        this.content = "";

        this.Read();
    }

    /**
     * Imports the reg file
     */
    public Read(): void {
        let normalizedContent: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();
        
        const pathName = path.resolve(this.path);

        
        fs.pathExists(pathName)
            .then(() => {
                // TODO: Read file
                this.encoding = GetEncoding(this.content);                
                normalizedContent = this.ParseFile();
            })
            .catch((err) => {
                throw new Error(`Error reading file: ${err}`);
            });
        
        if (!normalizedContent) {
            throw new Error('Error normalizing file content.');
        }

        normalizedContent.forEach((value, key) => {
            const regValueList = new Map<string, IRegValueObject>();

            value.forEach((sValue, sKey) => {
                const regValue: IRegValueObject = new RegValueObject(
                    key, sKey, sValue, this.encoding
                );
                regValueList.set(key, regValue);
            });
            this.regValues.set(key, regValueList);
        });
    }

    /**
     * Parses the reg file for reg keys and reg values.
     * @returns A Map with reg keys as Map keys and a Map of (valuename, valuedata)
     */
    private ParseFile(): Map<string, Map<string, string>> {
        const retValue: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();

        const dictKeys = this.NormalizeKeysDictionary(this.content);
        dictKeys.forEach((value, key) => {
            if (!value) { return; }
            const dictValues = this.NormalizeValuesDictionary(value);
            retValue.set(key, dictValues);
        });

        return retValue;
    }

    /**
     * Creates a Map using given search pattern.
     * @param content The content string to be parsed.
     * @returns A Map with retrieved keys and remaining content.
     */
    private NormalizeKeysDictionary(content: string): Map<string, string> {
        const regex = new RegExp(/\[(.*?)\]/gm);
        const matches = Array.from(content.matchAll(regex));
        
        let startIndex = 0;
        let lengthIndex = 0;

        const dictKeys = new Map<string, string>();

        matches.forEach((match, index) => {
            let sKey: string = match[1];
            while (sKey.endsWith("\r\n")) {
                sKey = sKey.substring(0, sKey.length - 2);
            }
            if (sKey.endsWith("=")) { sKey = sKey.substring(0, sKey.length - 1); }
            sKey = StripBraces(sKey);
            if (sKey === "@") {
                sKey = "";
            } else {
                sKey = StripLeadingChars(sKey, "\"");
            }

            startIndex = index + match.length;
            const nextMatch = match[index + 1];
            if (nextMatch) {
                lengthIndex = nextMatch.length - startIndex;
            } else {
                lengthIndex = content.length - startIndex;
            }

            let sValue: string = content.substring(startIndex, lengthIndex);

            while (sValue.endsWith("\r\n")) {
                sValue = sValue.substring(0, sValue.length - 2);
            }
            
            dictKeys.set(sKey, sValue);
        });

        return dictKeys;
    }

    /**
     * Creates a Map using given search pattern.
     * @param content The content string to be parsed.
     * @returns A Map with retrieved keys and remaining content.
     */
    private NormalizeValuesDictionary(content: string): Map<string, string> {
        const regex = new RegExp(/(".+"|@)=("[^"]*"|[^"]+)/gm);
        const matches = Array.from(content.matchAll(regex));

        const dictKeys = new Map<string, string>();

        matches.forEach((match) => {
            let sKey = match[1];
            let sValue = match[2];

            while (sKey.endsWith("\r\n")) {
                sKey = sKey.substring(0, sKey.length - 2);
            }

            if (sKey === "@") {
                sKey = "";
            } else {
                sKey = StripLeadingChars(sKey, "\"");
            }

            while (sValue.endsWith("\r\n")) {
                sValue = sValue.substring(0, sValue.length - 2);
            }

            dictKeys.set(sKey, sValue);
        });

        return dictKeys;
    }
}