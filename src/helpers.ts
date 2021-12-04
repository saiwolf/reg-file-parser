/**
 * Retrieves the encoding of the reg file, checking for "REGEDIT4".
 * @returns The text encoding of the .reg file.
 */
export function GetEncoding(content: string): string {
  const regex = new RegExp(/([ ]*(\r\n)*)REGEDIT4/, 'is');
  if (regex.test(content)) {
    return 'ANSI';
  } else {
    return 'UTF8';
  }
}

/**
 * Converts the byte arrays (saved as array of string) into a single string.
 * @param stringArray Array of strings
 * @param encoding Text Encoding
 * @returns String value
 */
export function GetStringRepresentation(stringArray: string[], encoding: string): string {
  let sb = '';
  if (stringArray.length > 1) {
    if (encoding === 'UTF8') {
      for (let i = 0; i < stringArray.length - 2; i += 2) {
        const tmpCharacter = stringArray[i + 1] + stringArray[i];
        if (tmpCharacter === '0000') {
          sb = sb + '\n';
        } else {
          sb = sb + parseInt(tmpCharacter, 16).toString();
        }
      }
    } else {
      for (let j = 0; j < stringArray.length - 1; j += 1) {
        if (stringArray[j] === '00') {
          sb = sb + '\n';
        } else {
          sb = sb + parseInt(stringArray[j], 16).toString();
        }
      }
    }
    return sb;
  } else {
    return '';
  }
}

/**
 * Removes the leading and ending characters from the given string
 * @param sLine Given string
 * @param leadChar Lead character to strip
 * @returns Stripped string
 */
export function StripLeadingChars(sLine: string, leadChar: string): string {
  const tmpValue = sLine.trim();
  if (tmpValue.startsWith(leadChar) && tmpValue.endsWith(leadChar)) {
    return tmpValue.substring(1, tmpValue.length - 2);
  }
  return tmpValue;
}

/**
 * Removes the leading and ending brackets from the given string.
 * @param sLine Given string
 * @returns Stripped string
 */
export function StripBraces(sLine: string): string {
  const tmpValue = sLine.trim();
  if (tmpValue.startsWith('[') && tmpValue.endsWith(']')) {
    return tmpValue.substring(1, tmpValue.length - 2);
  }
  return tmpValue;
}

/**
 * Removes the ending blackslashes from the given string.
 * @param sLine Given string
 * @returns Stripped string
 */
export function StripContinueChar(sLine: string): string {
  const regex = /\\\r\n[ ]*/;
  return sLine.replace(regex, '');
}
