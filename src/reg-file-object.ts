import { GetEncoding, StripLeadingChars } from './helpers';
import { IRegistryExport, IRegKey, RegistryKeyAction } from './reg-file-scheme';
import { RegistryRootHive, IRegistryValue } from './reg-value-scheme';
import { parseRegistryValues } from './reg-value-object';
/**
 * Basic mapping of a key to a value.
 *
 * @interface IRegValueMap
 */
export interface IRegValueMap {
  key: string;
  value: string;
}


/**
 * Gets the contents of the passed file.
 * @function
 * @private
 * 
 * @param filePath File to open
 * @returns A string representing contents of the file.
 */
export function prepareContent(content: string): string {
  if (content || content.length > 0) {                
    return content.replace(/[^a-zA-Z0-9\\[\]%\\_=():,"\s.,]+/g, '');        
  } else {
    throw new Error('No data given!');
  }
}

/**
 * Parses the registry export.
 * @function
 * @public
 * 
 * @param content - The registry export file in string format.
 * @returns An {@link IRegistryExport} object containing parsed keys, values, and data.
 */
export function parse(content: string): IRegistryExport {
  const data = prepareContent(content);
  const regKeyValues: IRegKey[] = [];
  const keys = normalizeKeysDictionary(data);
  if (keys.length > 0) {
    keys.forEach((key) => {
      const regKey = getRegKey(key.key);
      const rootHive = getKeyRoot(regKey);
      const noRoot = getKeyWithoutRoot(regKey);
      const parsedValues = normalizeValues(key.value, regKey);
      regKeyValues.push({
        root: rootHive,
        action: getKeyAction(regKey),
        values: parsedValues,
        keyWithoutRoot: noRoot,
      });
    });
  } else {
    throw new Error('No keys found to process!');
  }
  return {
    content: data,
    encoding: GetEncoding(data),
    regValues: regKeyValues,
  }
}

/**
 * Parses registry key and values into array.
 * @function
 * @private
 * 
 * @param content String of file contents to parse for key/values
 * @returns `IRegValueMap` of Registry Keys and their values.
 */
export function normalizeKeysDictionary(content: string): IRegValueMap[] {
  const regex = new RegExp(/(\[[\w%^(\\| )\]\r\n]+)([^[]*)/gm);
  const matches = [...content.matchAll(regex)];
  const tempHolder: IRegValueMap[] = [];

  if (matches !== null) {
    matches.forEach((match) => {
      let sKey = match[1];
      if (typeof sKey !== 'string') {
        return;
      }
      if (sKey.endsWith('\r\n')) {
        sKey = sKey.substring(0, sKey.length - 2);
      }
      if (sKey.endsWith('=')) {
        sKey = sKey.substring(0, sKey.length - 1);
      }
      if (sKey === '@') {
        sKey = '';
      } else {
        sKey = StripLeadingChars(sKey, '"');
      }

      const sValue = match[2].trim();

      tempHolder.push({ key: sKey, value: sValue });
    });
  }

  return tempHolder;
}

/**
 * Parses Values entry into data:value array.
 * @function
 * @private
 * 
 * @param content Values entry from `normalizeKeys` function.
 * @param parentKey Parent key these values belong to.
 * @returns Parsed values in separate key/value array.
 */
export function normalizeValues(content: string, parentKey: string): IRegistryValue[] {
  const regValues: IRegistryValue[] = [];
  const regex = new RegExp(/(?!^\[.+\])(^(".+"|@)=("[^"]*"|[^"[]+))/gm);
  if (!content) {
    return regValues;
  }
  const matches = [...content.matchAll(regex)];
  if (matches !== null) {
    matches.forEach((match) => {
      let sKey = match[2].trim();
      let sValue = match[3].trim();
      if (sKey.startsWith('"')) {
        sKey = sKey.substring(1, sKey.length);
      }
      if (sKey.endsWith('"')) {
        sKey = sKey.substring(0, sKey.length - 1);
      }
      if (sValue.startsWith('=')) {
        sValue = sValue.substring(1, sValue.length);
      }
      sValue = sValue.split('\r\n').join('');
      regValues.push(parseRegistryValues(parentKey, sKey, sValue, 'UTF8'));
    });
  }
  return regValues;
}

/**
 * Strips brackets and returns Registry Key.
 * @function
 * @private
 * 
 * @param fileLine Registry Key to parse
 * @returns Registry key stripped of the `[` and `]` characters
 */
export function getRegKey(fileLine: string) {
  if (!fileLine) return '';
  if (!fileLine.includes('[HKEY')) {
    return '';
  }

  const startingBracket = fileLine.indexOf('[') + 1;
  const endingBracket = fileLine.indexOf(']');

  return fileLine.substring(startingBracket, endingBracket);
}

/**
 * Parses the Hive of the passed registry key
 * @function
 * @private
 * 
 * @param key Registry Key to parse
 * @returns Root Hive of passed Key
 */
export function getKeyRoot(key: string): RegistryRootHive {
  if (!key) return RegistryRootHive.UNKNOWN;
  if (key.startsWith('HKEY_LOCAL_MACHINE')) {
    return RegistryRootHive.HKLM;
  } else if (key.startsWith('HKEY_CLASSES_ROOT')) {
    return RegistryRootHive.HKCR;
  } else if (key.startsWith('HKEY_USERS')) {
    return RegistryRootHive.HKU;
  } else if (key.startsWith('HKEY_CURRENT_CONFIG')) {
    return RegistryRootHive.HKCC;
  } else if (key.startsWith('HKEY_CURRENT_USER')) {
    return RegistryRootHive.HKCU;
  } else {
    return RegistryRootHive.UNKNOWN;
  }
}

/**
 * Strips off the registry hive from the passed key.
 * @function
 * @private
 * 
 * @param key Registry key to parse
 * @returns Registry key stripped of the root hive.
 */
export function getKeyWithoutRoot(key: string) {
  if (!key) return '';
  if (key.startsWith('HKEY_LOCAL_MACHINE')) {
    key = key.substring(18);
    if (key.startsWith('\\')) {
      key = key.substring(1);
    }
    return key;
  } else if (key.startsWith('HKEY_CLASSES_ROOT')) {
    key = key.substring(17);
    if (key.startsWith('\\')) {
      key = key.substring(1);
    }
    return key;
  } else if (key.startsWith('HKEY_USERS')) {
    key = key.substring(10);
    if (key.startsWith('\\')) {
      key = key.substring(1);
    }
    return key;
  } else if (key.startsWith('HKEY_CURRENT_CONFIG')) {
    key = key.substring(19);
    if (key.startsWith('\\')) {
      key = key.substring(1);
    }
    return key;
  } else if (key.startsWith('HKEY_CURRENT_USER')) {
    key = key.substring(17);
    if (key.startsWith('\\')) {
      key = key.substring(1);
    }
    return key;
  } else {
    return '';
  }
}

/**
 * Determines if registry key is importing data or removing data
 * from the registry.
 * @function
 * @private
 * 
 * @param key Registry key to parse
 * @returns Action taken by key.
 */
export function getKeyAction(key: string): RegistryKeyAction {
  if (!key) {
    return 'import';
  }
  if (key.startsWith('-')) {
    return 'delete';
  }
  return 'import';
}

