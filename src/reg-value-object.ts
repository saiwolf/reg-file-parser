import {
    GetStringRepresentation,
    StripContinueChar,
    StripLeadingChars
} from '.';

/**
 * Enum describing the root keys of the Windows Registry.
 * 
 * Information provided by: https://en.wikipedia.org/wiki/Windows_Registry#Root_keys
 */
export enum RegistryRootHive {
    /**
     * Stores settings that are specific to the local computer.
     */
    HKLM = "HKEY_LOCAL_MACHINE",
    /**
     * Contains information about registered applications, such as
     * file associations and OLE Object IDs.
     */
    HKCR = "HKEY_CLASSES_ROOT",
    /**
     * Contains subkeys corresponding to the `HKEY_CURRENT_USER` keys for
     * each user profile actively loaded on the machine, though user hives
     * are usually only loaded for currently logged-in users.
     */
    HKU = "HKEY_USERS",
    /**
     * Stores settings that specific to the currently logged in user.
     * 
     * This key is a link to the subkey of `HKEY_USERS` that corresponds to the user.
     */
    HKCU = "HKEY_CURRENT_USER",
    /**
     * Provides runtime information into performance data provided by either
     * the NT Kernel or running system drivers, programs, and services that provide
     * performance data.
     * 
     * This key is not stored in any hive and is not visible through the Registry Editor,
     * but is visible through the registry functions in the Windows API, or in a simplified
     * view via the Performance tab of the Task Manager or more advanced control panels.
     */
    HKPD = "HKEY_PERFORMANCE_DATA",
    /**
     * **ONLY USED ON Windows 95, 98, and ME**
     * 
     * Contains information about hardware devices, including Plug and Play and network
     * performance statistics. The information in this hive is stored in memory only.
     */
    HKDD = "HKEY_DYN_DATA",
    /**
     * A pointer/shortcut to `HKLM\SYSTEM\CurrentControlSet\Hardware Profiles\Current\`.
     * 
     * This is a convienence key.
     */
    HKCC = "HKEY_CURRENT_CONFIG",
    /**
     * We were not able to parse the key. So an empty string is returned.
     */
    UNKNOWN = "",
};

/**
 * A registry value can store data in various formats. This enum
 * describes those types.
 * 
 * Type definitions come from: https://docs.microsoft.com/en-us/windows/win32/sysinfo/registry-value-types
 */
 export enum RegistryValueType {
    /**
     * Binary data in any form.
     */
    REG_BINARY = "REG_BINARY",
    /**
     * A 32-bit number.
     */
    REG_DWORD = "REG_DWORD",
    /**
     * A 32-bit number in little-endian format. Windows is designed to run
     * on little-endian computer architectures. Therefor, this value is defined
     * as REG_DWORD in the Windows header files.
     */
    REG_DWORD_LITTLE_ENDIAN = "REG_DWORD_LITTLE_ENDIAN",
    /**
     * A 32-bit number in big-endian format.
     * Some UNIX systems support big-endian architectures.
     */
    REG_DWORD_BIG_ENDIAN = "REG_DWORD_BIG_ENDIAN",
    /**
     * A null-terminated string that contains unexpanded references
     * to environment variables (for example "%PATH%"). It will be a
     * Unicode or ANSI string depending on whether you use the Unicode
     * or ANSI functions. To expand the environment variable references, 
     * use the Win32 `ExpandEnvironmentStrings` function.
     */
    REG_EXPAND_SZ = "REG_EXPAND_SZ",
    /**
     * A null-terminated Unicode string that contains the target path
     * of a symbolic link that was created by calling the `RegCreateKeyEx`
     * Win32 function with `REG_OPTION_CREATE_LINK`.
     */
    REG_LINK = "REG_LINK",
    /**
     * A sequence of null-terminated strings, terminated by an empty string (`\0`).
     * Note: The final terminator must be factored into the length of the string.
     */
    REG_MULTI_SZ = "REG_MULTI_SZ",
    /**
     * No defined value type.
     */
    REG_NONE = "REG_NONE",
    /**
     * A 64-bit number.
     */
    REG_QWORD = "REG_QWORD",
    /**
     * A 64-bit number in little-endian format. Windows is designed to run
     * on little-endian computer architectures. Therefor, this value is defined
     * as REG_QWORD in the Windows header files.
     */
    REG_QWORD_LITTLE_ENDIAN = "REG_QWORD_LITTLE_ENDIAN",
    /**
     * A string value, normally stored and exposed in `UTF-16LE`
     * (when using the Unicode version of Win32 API functions),
     * usually terminated by a `NUL` character.
     */
    REG_SZ = "REG_SZ",
    /**
     * A device driver's list of hardware resources, used by the driver or one
     * of the physical devices it controls, in the `\ResourceMap` tree.
     */
    REG_RESOURCE_LIST = "REG_RESOURCE_LIST",
    /**
     * A device driver's list of possible hardware resources it or one of the
     * physical devices it controls can use, from which the systems a subset into 
     * the `\ResourceMap` tree.
     */
    REG_RESOURCE_REQUIREMENTS_LIST = "REG_RESOURCE_REQUIREMENTS_LIST",
    /**
     * A list of hardware resources that a physical device is using, detected and written
     * into the `\HardwareDescription` tree by the system.
     */
    REG_FULL_RESOURCE_DESCRIPTOR = "REG_FULL_RESOURCE_DESCRIPTOR",
};

/**
 * Interface that defines a registry value object.
 */
export interface IRegValueObject {
    root: RegistryRootHive;
    parentKey: string;
    parentKeyWithoutRoot: string;
    entry: string;
    value: string;
    type: RegistryValueType;
    encoding?: string;
}

/**
 * Represents a registry value object with corresponding
 * properties.
 * 
 * @implements `IRegValueObject`
 */
export class RegValueObject implements IRegValueObject {
    root: RegistryRootHive;
    parentKey: string;
    parentKeyWithoutRoot: string;
    entry: string;
    value: string;
    type: RegistryValueType;
    encoding: string;

    constructor(
        regKeyName: string,
        regValueName: string,
        regValueData: string,
        encoding: string,
    )
    {
        this.parentKey = regKeyName.trim();
        this.parentKeyWithoutRoot = this.parentKey;
        this.root = this.GetRootHive();
        this.entry = regValueName;
        this.value = regValueData;
        this.encoding = encoding ?? "UTF8";
        this.type = this.GetRegEntryType(this.encoding);
    }

    /**
     * @returns An entry for the [Registry] section of the *.sig signature file.
     */
    public sigString() {
        return `${this.parentKey}\\\\${this.entry}=${this.SetRegEntryType(this.type)}${this.value}`;
    }

    /**
     * Trims the registry root from `this.parentKey` and returns the root used.
     * @returns Enum value of `RegistryRootHive` matching the root key in `this.parentKey`.
     */
    private GetRootHive(): RegistryRootHive {
        const tmpLine = this.parentKey.trim();

        if (tmpLine.startsWith("HKEY_LOCAL_MACHINE")) {
            this.parentKey = this.parentKey.substring(18);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return RegistryRootHive.HKLM;
        }

        else if (tmpLine.startsWith("HKEY_CLASSES_ROOT")) {
            this.parentKey = this.parentKey.substring(17);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return RegistryRootHive.HKCR;
        }

        else if (tmpLine.startsWith("HKEY_USERS")) {
            this.parentKey = this.parentKey.substring(10);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return RegistryRootHive.HKU;
        }

        else if (tmpLine.startsWith("HKEY_CURRENT_CONFIG")) {
            this.parentKey = this.parentKey.substring(19);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return RegistryRootHive.HKCC;
        }

        else if (tmpLine.startsWith("HKEY_CURRENT_USER")) {
            this.parentKey = this.parentKey.substring(17);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return RegistryRootHive.HKCU;
        }

        else {
            return RegistryRootHive.UNKNOWN;
        }
    }

    /**
     * Trims `this.value` of the value's data type and returns said value type.
     * @param regValueData The string representation of the registry type.
     * @returns `RegistryValueType` member matching `regValueData`
     */
    private GetRegEntryType(regValueData: string): RegistryValueType {
        switch (true)
        {
            case regValueData.startsWith("hex(a):"):
		        this.value = regValueData.substring(7);
		        return RegistryValueType.REG_RESOURCE_REQUIREMENTS_LIST;
            case regValueData.startsWith("hex(b):"):
                this.value = parseInt(regValueData.substring(7), 32).toString();
                return RegistryValueType.REG_QWORD;
            case regValueData.startsWith("dword:"):
                this.value = parseInt(regValueData.substring(6), 16).toString();
                return RegistryValueType.REG_DWORD;
            case regValueData.startsWith("hex(7):"):
                this.value = StripContinueChar(regValueData.substring(7));
                this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
                return RegistryValueType.REG_MULTI_SZ;
            case regValueData.startsWith("hex(6):"):
                this.value = StripContinueChar(regValueData.substring(7));
                this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
                return RegistryValueType.REG_LINK;
            case regValueData.startsWith("hex(2):"):
                this.value = StripContinueChar(regValueData.substring(7));
                this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
                return RegistryValueType.REG_EXPAND_SZ;
            case regValueData.startsWith("hex(0):"):
                this.value = regValueData.substring(7);
                return RegistryValueType.REG_NONE;
            case regValueData.startsWith("hex:"):
                this.value = StripContinueChar(regValueData.substring(4));
                if (this.value.endsWith(",")) {
                    this.value = this.value.substring(0, this.value.length - 1);
                }
                return RegistryValueType.REG_BINARY;
            default:
                this.value = StripLeadingChars(this.value, "\\");
                return RegistryValueType.REG_SZ;
        }
    }

    /**
     * Maps a Registry data type to a Registry value type.
     * @param sRegDataType Registry data type to parse.
     * @returns Matching Registry value type.
     */
    private SetRegEntryType(sRegDataType: RegistryValueType)
    {        
        switch (sRegDataType)
        {
            case RegistryValueType.REG_QWORD:
                return "hex(b):";
            case RegistryValueType.REG_RESOURCE_REQUIREMENTS_LIST:
                return "hex(a):";
            case RegistryValueType.REG_FULL_RESOURCE_DESCRIPTOR:
                return "hex(9):";
            case RegistryValueType.REG_RESOURCE_LIST:
                return "hex(8):";
            case RegistryValueType.REG_MULTI_SZ:
                return "hex(7):";
            case RegistryValueType.REG_LINK:
                return "hex(6):";
            case RegistryValueType.REG_DWORD:
                return "dword:";
            case RegistryValueType.REG_EXPAND_SZ:
                return "hex(2):";
            case RegistryValueType.REG_NONE:
                return "hex(0):";
            case RegistryValueType.REG_BINARY:
                return "hex:";
            case RegistryValueType.REG_SZ:
                return "";
            default:
                return "";
        }
    }
}