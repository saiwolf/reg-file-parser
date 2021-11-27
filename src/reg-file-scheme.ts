import { IRegistryValue } from './reg-value-scheme';

export type RegistryKeyAction = "import" | "delete";
export type RegistryFileEncoding = 'ANSI' | 'UTF8';
/**
 * Interface for a registry file object.
 */
export interface IRegistryFile {
    /** The .reg file path. */
    path: string,
    /** The .reg file name. */
    filename: string,
    /**
     * A registry file can either be in ANSI or Unicode format.
     * 
     * Legacy .reg files beginning with REGEDIT4 are in ANSI. Later formats
     * are in Unicode UTF8.
     */
    encoding: RegistryFileEncoding,
    /** The raw data from the .reg file in string format. */
    content: string,
    /** An array of registry keys and their values. */
    regValues: IRegKey[]
}

/**
 * Describes the structure of a registry key entry.
 */
export interface IRegKey {
    /** The root hive this key belongs to. */
    root: string;
    /** The action this key is taking. Is it importing or deleting? */
    action: RegistryKeyAction;
    /** The key without the root hive. */
    keyWithoutRoot: string;
    /** An array of registry values belong to this key. */
    values: IRegistryValue[];
}