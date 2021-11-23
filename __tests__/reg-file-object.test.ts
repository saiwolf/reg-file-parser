import { RegFileObject } from "../src";

test('imports and parses file', () => {
    const fileName = './putty.reg';
    const regFileObject = new RegFileObject(fileName);
    regFileObject.regValues.forEach((values, key) => {
        expect(key).not.toBeNull();
        expect(key).toBeDefined();
        expect(key).toContain("Software\\SimonTatham\\PuTTY\\Sessions\\Default%20Settings");
        
        values.forEach((sValues, sKey) => {
            expect(sKey).toContain("Colour");
            // eslint-disable-next-line prefer-const
            let numbers: string[] = sValues.value.split(',');
            numbers.forEach((number) => {
                expect(Number.isNaN(number)).toBe(false);
            });
        });
    });
});