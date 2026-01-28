/// <reference types="jest" />

import {
    makeAdhocId,
    parseArgs,
    parseDecimalToRawValue,
} from "../adhoc-upstream-transfer";

describe("adhoc-upstream-transfer helpers", () => {
    test("makeAdhocId prefixes adhoc:", () => {
        const id = makeAdhocId();
        expect(id.startsWith("adhoc:")).toBe(true);
        expect(id.length).toBeGreaterThan("adhoc:".length);
    });

    describe("parseArgs", () => {
        test("parses required args", () => {
            const args = parseArgs([
                "--to",
                "abcdef",
                "--amount",
                "12.34",
                "--decimals",
                "18",
            ]);
            expect(args).toEqual({
                to: "abcdef",
                amount: "12.34",
                decimals: 18,
            });
        });

        test("parses optional memo", () => {
            const args = parseArgs([
                "--to",
                "abcdef",
                "--amount",
                "1",
                "--decimals",
                "0",
                "--memo",
                "hello",
            ]);
            expect(args.memo).toBe("hello");
        });

        test("throws on missing value", () => {
            expect(() => parseArgs(["--to", "abc", "--amount"])).toThrow(
                /Missing value/,
            );
        });

        test("throws on non --key token", () => {
            expect(() => parseArgs(["to", "abc"])).toThrow(/Invalid argument/);
        });
    });

    describe("parseDecimalToRawValue", () => {
        test("converts integer amounts", () => {
            expect(parseDecimalToRawValue("1", 18)).toBe(10n ** 18n);
            expect(parseDecimalToRawValue("0", 18)).toBe(0n);
        });

        test("converts fractional amounts at 18 decimals", () => {
            expect(parseDecimalToRawValue("0.000000000000000001", 18)).toBe(1n);
            expect(parseDecimalToRawValue("12.34", 2)).toBe(1234n);
        });

        test("rejects too many fractional digits", () => {
            expect(() => parseDecimalToRawValue("0.001", 2)).toThrow(
                /more fractional digits/,
            );
        });

        test("rejects negative", () => {
            expect(() => parseDecimalToRawValue("-1", 18)).toThrow(
                /non-negative/,
            );
        });
    });
});

