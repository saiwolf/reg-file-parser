import { IRegValueObject } from ".";

import path from 'path';


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
 * Class that encompasses a registry file object with registry values
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
    }
}