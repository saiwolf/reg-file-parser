import { GetStringRepresentation, StripContinueChar, StripLeadingChars } from './helpers';

import { IRegistryValue, RegistryRootHive, RegistryValueType } from './reg-value-scheme';

/**
 * Represents a registry value object with corresponding
 * properties.
 *
 * @class
 * @implements {IRegistryValue}
 */
export class RegValueObject implements IRegistryValue {
  root: RegistryRootHive;
  parentKey: string;
  parentKeyWithoutRoot: string;
  entry: string;
  value: string;
  type: RegistryValueType;
  encoding: string;

  /**
   *
   * @constructor
   * @param regKeyName The key name: [HKEY_etc]
   * @param regValueName The data entry name. To left of the '='
   * @param regValueData The data value. To the right of the '='
   * @param encoding The encoding.
   */
  constructor(regKeyName: string, regValueName: string, regValueData: string, encoding: string) {
    this.parentKey = regKeyName.trim();
    this.parentKeyWithoutRoot = this.parentKey;
    this.root = this.GetRootHive();
    this.entry = regValueName;
    this.value = regValueData;
    this.encoding = encoding ?? 'UTF8';
    this.type = this.GetRegEntryType(this.encoding);
  }

  /**
   * @override
   * @returns An entry for the [Registry] section of the *.sig signature file.
   */
  public toString() {
    return `${this.parentKey}\\\\${this.entry}=${this.SetRegEntryType(this.type)}${this.value}`;
  }

  /**
   * Trims the registry root from `this.parentKey` and returns the root used.
   *
   * @function
   * @returns Enum value of `RegistryRootHive` matching the root key in `this.parentKey`.
   */
  private GetRootHive(): RegistryRootHive {
    const tmpLine = this.parentKey.trim();
    switch (true) {
      case tmpLine.startsWith('HKEY_LOCAL_MACHINE'):
        this.parentKey = this.parentKey.substring(18);
        if (this.parentKey.startsWith('\\')) {
          this.parentKey = this.parentKey.substring(1);
        }
        return RegistryRootHive.HKLM;

      case tmpLine.startsWith('HKEY_CLASSES_ROOT'):
        this.parentKey = this.parentKey.substring(17);
        if (this.parentKey.startsWith('\\')) {
          this.parentKey = this.parentKey.substring(1);
        }
        return RegistryRootHive.HKCR;

      case tmpLine.startsWith('HKEY_USERS'):
        this.parentKey = this.parentKey.substring(10);
        if (this.parentKey.startsWith('\\')) {
          this.parentKey = this.parentKey.substring(1);
        }
        return RegistryRootHive.HKU;

      case tmpLine.startsWith('HKEY_CURRENT_CONFIG'):
        this.parentKey = this.parentKey.substring(19);
        if (this.parentKey.startsWith('\\')) {
          this.parentKey = this.parentKey.substring(1);
        }
        return RegistryRootHive.HKCC;

      case tmpLine.startsWith('HKEY_CURRENT_USER'):
        this.parentKey = this.parentKey.substring(17);
        if (this.parentKey.startsWith('\\')) {
          this.parentKey = this.parentKey.substring(1);
        }
        return RegistryRootHive.HKCU;

      default:
        return RegistryRootHive.UNKNOWN;
    }
  }

  /**
   * Trims `this.value` of the value's data type and returns said value type.
   *
   * @function
   * @param regValueData The string representation of the registry type.
   * @returns `RegistryValueType` member matching `regValueData`
   */
  private GetRegEntryType(regValueData: string): RegistryValueType {
    switch (true) {
      case regValueData.startsWith('hex(a):'):
        this.value = regValueData.substring(7);
        return RegistryValueType.REG_RESOURCE_REQUIREMENTS_LIST;
      case regValueData.startsWith('hex(b):'):
        this.value = parseInt(regValueData.substring(7), 32).toString();
        return RegistryValueType.REG_QWORD;
      case regValueData.startsWith('dword:'):
        this.value = parseInt(regValueData.substring(6), 16).toString();
        return RegistryValueType.REG_DWORD;
      case regValueData.startsWith('hex(7):'):
        this.value = StripContinueChar(regValueData.substring(7));
        this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
        return RegistryValueType.REG_MULTI_SZ;
      case regValueData.startsWith('hex(6):'):
        this.value = StripContinueChar(regValueData.substring(7));
        this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
        return RegistryValueType.REG_LINK;
      case regValueData.startsWith('hex(2):'):
        this.value = StripContinueChar(regValueData.substring(7));
        this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
        return RegistryValueType.REG_EXPAND_SZ;
      case regValueData.startsWith('hex(0):'):
        this.value = regValueData.substring(7);
        return RegistryValueType.REG_NONE;
      case regValueData.startsWith('hex:'):
        this.value = StripContinueChar(regValueData.substring(4));
        if (this.value.endsWith(',')) {
          this.value = this.value.substring(0, this.value.length - 1);
        }
        return RegistryValueType.REG_BINARY;
      default:
        this.value = StripLeadingChars(this.value, '\\');
        return RegistryValueType.REG_SZ;
    }
  }

  /**
   * Maps a Registry data type to a Registry value type.
   *
   * @function
   * @param sRegDataType Registry data type to parse.
   * @returns Matching Registry value type.
   */
  private SetRegEntryType(sRegDataType: RegistryValueType) {
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
}
