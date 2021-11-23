import {
    GetStringRepresentation,
    StripContinueChar,
    StripLeadingChars
} from '.';

/**
 * Interface that defines a registry value object.
 */
export interface IRegValueObject {
    root: string;
    parentKey: string;
    parentKeyWithoutRoot: string;
    entry: string;
    value: string;
    type: string;
    encoding?: string;
}

/**
 * Represents a registry value object with corresponding
 * properties.
 * 
 * @implements `IRegValueObject`
 */
export class RegValueObject implements IRegValueObject {
    root: string;
    parentKey: string;
    parentKeyWithoutRoot: string;
    entry: string;
    value: string;
    type: string;
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
        this.root = this.GetHive();
        this.entry = regValueName;
        this.value = regValueData;
        this.encoding = encoding ?? "UTF8";
        this.type = this.GetRegEntryType(this.encoding);
    }

    /**
     * Custom `toString()` method.
     * @returns An entry for the [Registry] section of the *.sig signature file.
     */
    public toString() {
        return `${this.parentKey}\\\\${this.entry}=${this.SetRegEntryType(this.type)}${this.value}`;
    }

    /**
     * Trims the registry root from `this.parentKey` and returns the root used.
     * @returns String containing the registry root in use.
     */
    private GetHive(): string {
        const tmpLine = this.parentKey.trim();

        if (tmpLine.startsWith("HKEY_LOCAL_MACHINE")) {
            this.parentKey = this.parentKey.substring(18);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return "HKEY_LOCAL_MACHINE";
        }

        else if (tmpLine.startsWith("HKEY_CLASSES_ROOT")) {
            this.parentKey = this.parentKey.substring(17);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return "HKEY_CLASSES_ROOT";
        }

        else if (tmpLine.startsWith("HKEY_USERS")) {
            this.parentKey = this.parentKey.substring(10);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return "HKEY_USERS";
        }

        else if (tmpLine.startsWith("HKEY_CURRENT_CONFIG")) {
            this.parentKey = this.parentKey.substring(19);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return "HKEY_CURRENT_CONFIG";
        }

        else if (tmpLine.startsWith("HKEY_CURRENT_USER")) {
            this.parentKey = this.parentKey.substring(17);
            if (this.parentKey.startsWith("\\")) { this.parentKey = this.parentKey.substring(1) }
            return "HKEY_CURRENT_USER";
        }

        else {
            return "";
        }
    }

    /**
     * Trims `this.value` of the value's data type and returns said value type.
     * @param regValueData Registry value data.
     * @returns The registry type for the value passed.
     */
    private GetRegEntryType(regValueData: string): string {
        if (regValueData.startsWith("hex(a):")) {
            this.value = regValueData.substring(7);
            return "REG_RESOURCE_REQUIREMENTS_LIST";
        }

        else if (regValueData.startsWith("hex(b):")) {
            this.value = regValueData.substring(7);
            return "REG_QWORD";
        }

        else if (regValueData.startsWith("dword:")) {
            this.value = parseInt(regValueData.substring(6), 16).toString();
            return "REG_DWORD";
        }

        else if (regValueData.startsWith("hex(7):")) {
            this.value = StripContinueChar(regValueData.substring(7));
            this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
            return "REG_MULTI_SZ";
        }
        
        else if (regValueData.startsWith("hex(6):")) {
            this.value = StripContinueChar(regValueData.substring(7));
            this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
            return "REG_LINK";
        }

        else if (regValueData.startsWith("hex(2):")) {
            this.value = StripContinueChar(regValueData.substring(7));
            this.value = GetStringRepresentation(regValueData.split(','), this.encoding);
            return "REG_EXPAND_SZ";
        }

        else if (regValueData.startsWith("hex(0):")) {
            this.value = regValueData.substring(7);
            return "REG_NONE";
        }

        else if (regValueData.startsWith("hex:")) {
            this.value = StripContinueChar(regValueData.substring(4));
            if (this.value.endsWith(",")) {
                this.value = this.value.substring(0, this.value.length - 1);
            }
            return "REG_BINARY";
        }

        this.value = StripLeadingChars(this.value, "\\");
        return "REG_SZ";
    }

    /**
     * Maps a Registry data type to a Registry value type.
     * @param sRegDataType Registry data type to parse.
     * @returns Matching Registry value type.
     */
    private SetRegEntryType(sRegDataType: string)
    {
        switch (sRegDataType)
        {
            case "REG_QWORD":
                return "hex(b):";
            case "REG_RESOURCE_REQUIREMENTS_LIST":
                return "hex(a):";
            case "REG_FULL_RESOURCE_DESCRIPTOR":
                return "hex(9):";
            case "REG_RESOURCE_LIST":
                return "hex(8):";
            case "REG_MULTI_SZ":
                return "hex(7):";
            case "REG_LINK":
                return "hex(6):";
            case "REG_DWORD":
                return "dword:";
            case "REG_EXPAND_SZ":
                return "hex(2):";
            case "REG_NONE":
                return "hex(0):";
            case "REG_BINARY":
                return "hex:";
            case "REG_SZ":
                return "";
            default:
                return "";
        }
    }
}