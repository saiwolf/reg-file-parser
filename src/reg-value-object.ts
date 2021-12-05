import { RegistryFileEncoding } from '.';
import { GetStringRepresentation, StripContinueChar, StripLeadingChars } from './helpers';

import { IRegistryValue, RegistryRootHive, RegistryValueType } from './reg-value-scheme';

/**
 * Constructs an {@link IRegistryValue} object out of the
 * params given.
 * 
 * @param regKeyName - The Registry Key's name
 * @param regValueName - The exported value name. This lies to the left of the `=`. 
 * @param regValueData - The exported data value. This lies to the right of the `=`.
 * @param encoding - The encoding.
 *
 * @returns A constructed value that implements {@link IRegistryValue}
 */
export default function parseRegistryValues(
  regKeyName: string,
  regValueName: string,
  regValueData: string,
  encoding: RegistryFileEncoding = 'UTF8',
  ): IRegistryValue {
    const parentKey = regKeyName.trim();
    const root = GetRootHive(parentKey);
    const parentKWR = GetKeyWithoutRootHive(parentKey);
    
    return {
      parentKey: parentKey,
      parentKeyWithoutRoot: parentKWR,
      root: root,
      entry: regValueName,
      value: regValueData,
      encoding: encoding,
      type: GetRegEntryType(regValueData, encoding),
    };
}

/**
 * Formats registry entries and values into an registry-export-style string.
 * @function
 * @public
 * @returns An entry for the [Registry] section of the *.sig signature file.
 */
export function toSigString(parentKey: string, entry: string, type: RegistryValueType, value: string) {
  return `${parentKey}\\\\${entry}=${SetRegEntryType(type)}${value}`;
}

/**
 * Strips the root hive off the passed registry key.
 * @function
 * @public
 * @param parentKey Registry Key to parse.
 * @returns The passed registry key without the root hive.
 */
export function GetKeyWithoutRootHive(parentKey: string): string {
  let tmpLine = parentKey.trim();
  switch (true) {
    case tmpLine.startsWith('HKEY_LOCAL_MACHINE'):
      tmpLine = tmpLine.substring(18);
      break;
    case tmpLine.startsWith('HKEY_CLASSES_ROOT'):
      tmpLine = tmpLine.substring(17);
      break;
    case tmpLine.startsWith('HKEY_USERS'):
      tmpLine = tmpLine.substring(10);
      break;
    case tmpLine.startsWith('HKEY_CURRENT_CONFIG'):
      tmpLine = tmpLine.substring(19);
      break;
    case tmpLine.startsWith('HKEY_CURRENT_USER'):
      tmpLine = tmpLine.substring(17);
      break;
    default:
      break;
  }
  if (tmpLine.startsWith('\\')) {
    tmpLine = tmpLine.substring(1);
  }

  return tmpLine;
}

/**
 * Returns the root hive of the passed registry key.
 *
 * @function
 * @public
 * @returns - {@link RegistryRootHive} matching the root key in passed registry key.
 */
export function GetRootHive(parentKey: string): RegistryRootHive {
  const tmpLine = parentKey.trim();
  switch (true) {
    case tmpLine.startsWith('HKEY_LOCAL_MACHINE'):
      return RegistryRootHive.HKLM;
    case tmpLine.startsWith('HKEY_CLASSES_ROOT'):
      return RegistryRootHive.HKCR;
    case tmpLine.startsWith('HKEY_USERS'):
      return RegistryRootHive.HKU;
    case tmpLine.startsWith('HKEY_CURRENT_CONFIG'):
      return RegistryRootHive.HKCC;
    case tmpLine.startsWith('HKEY_CURRENT_USER'):
      return RegistryRootHive.HKCU;
    default:
      return RegistryRootHive.UNKNOWN;
  }
}

/**
 * Returns value type of passed registry value data.
 *
 * @function
 * @public
 * @param regValueData The string representation of the registry type.
 * @returns - {@link RegistryValueType} member matching `regValueData`
 */
export function GetRegEntryType(regValueData: string, encoding: RegistryFileEncoding): RegistryValueType {
  let value = "";
  switch (true) {
    case regValueData.startsWith('hex(a):'):
      value = regValueData.substring(7);
      return RegistryValueType.REG_RESOURCE_REQUIREMENTS_LIST;
    case regValueData.startsWith('hex(b):'):
      value = parseInt(regValueData.substring(7), 32).toString();
      return RegistryValueType.REG_QWORD;
    case regValueData.startsWith('dword:'):
      value = parseInt(regValueData.substring(6), 16).toString();
      return RegistryValueType.REG_DWORD;
    case regValueData.startsWith('hex(7):'):
      value = StripContinueChar(regValueData.substring(7));
      value = GetStringRepresentation(regValueData.split(','), encoding);
      return RegistryValueType.REG_MULTI_SZ;
    case regValueData.startsWith('hex(6):'):
      value = StripContinueChar(regValueData.substring(7));
      value = GetStringRepresentation(regValueData.split(','), encoding);
      return RegistryValueType.REG_LINK;
    case regValueData.startsWith('hex(2):'):
      value = StripContinueChar(regValueData.substring(7));
      value = GetStringRepresentation(regValueData.split(','), encoding);
      return RegistryValueType.REG_EXPAND_SZ;
    case regValueData.startsWith('hex(0):'):
      value = regValueData.substring(7);
      return RegistryValueType.REG_NONE;
    case regValueData.startsWith('hex:'):
      value = StripContinueChar(regValueData.substring(4));
      if (value.endsWith(',')) {
        value = value.substring(0, value.length - 1);
      }
      return RegistryValueType.REG_BINARY;
    default:
      value = StripLeadingChars(value, '\\');
      return RegistryValueType.REG_SZ;
  }
}

/**
 * Maps a Registry data type to a Registry value type.
 *
 * @function
 * @public
 * @param sRegDataType Registry data type to parse.
 * @returns Corresponding {@link RegistryValueType}.
 */
export function SetRegEntryType(sRegDataType: RegistryValueType) {
  switch (sRegDataType) {
    case RegistryValueType.REG_QWORD:
      return 'hex(b):';
    case RegistryValueType.REG_RESOURCE_REQUIREMENTS_LIST:
      return 'hex(a):';
    case RegistryValueType.REG_FULL_RESOURCE_DESCRIPTOR:
      return 'hex(9):';
    case RegistryValueType.REG_RESOURCE_LIST:
      return 'hex(8):';
    case RegistryValueType.REG_MULTI_SZ:
      return 'hex(7):';
    case RegistryValueType.REG_LINK:
      return 'hex(6):';
    case RegistryValueType.REG_DWORD:
      return 'dword:';
    case RegistryValueType.REG_EXPAND_SZ:
      return 'hex(2):';
    case RegistryValueType.REG_NONE:
      return 'hex(0):';
    case RegistryValueType.REG_BINARY:
      return 'hex:';
    case RegistryValueType.REG_SZ:
      return '';
    default:
      return '';
  }
}

