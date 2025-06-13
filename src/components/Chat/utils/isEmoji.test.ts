import isEmoji from "./isEmoji";

describe("isEmoji", () => {
    test.each([
        ["😀", true],
        ["😍", true],
        ["🎉", true],
        ["🔥", true],
        ["🚀", true],
        ["🏆", true],
        ["🐶", true],
        ["⚽", true],
        ["❤️", true],
        ["😀😍", true],
        ["  😀  ", true],
        ["a", false],
        ["hello", false],
        ["1", false],
        ["!", false],
        ["😀 hello", false],
        ["hello 😀", false],
        ["", false],
        ["   ", false],
        [" ", false],
        [":", false],
        [":)", false],
        ["α", false],
        ["©", false],
    ])('should return %s for input "%s"', (input, expected) => {
        expect(isEmoji(input)).toBe(expected);
    });

    test.each([
        [null, false],
        [undefined, false],
    ])("should handle invalid inputs: %s", (input, expected) => {
        expect(isEmoji(input as any)).toBe(expected);
    });

    test("should not throw errors", () => {
        expect(() => isEmoji("")).not.toThrow();
        expect(() => isEmoji("😀")).not.toThrow();
    });
});
