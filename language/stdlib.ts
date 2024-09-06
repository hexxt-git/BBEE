import type { MemoryBlock, Value } from "./interpreter";
// TODO: implement a custom stringifier
// TODO: make some TESTS
// TODO: the whole interpreter will have to be async then i will be able to implement things like sleep and eventually http.
const stdlib: MemoryBlock = {
    parent: null,
    values: {
        // IO Functions
        prompt: {
            value: {
                callback: (question: string) => {
                    const input = prompt(String(question ?? "")) ?? "";

                    if (/^[+-]?[0-9]+(\.[0-9]+)?$/.test(input)) return parseFloat(input);

                    return input;
                },
            },
            mutable: false,
        },
        print: {
            value: {
                callback: (...outputs: Value[]) => {
                    outputs.forEach((value: Value) => {
                        value = String(value);
                        if (value == "[object Object]") value = "[Composite Object]";
                        process.stdout.write(value);
                    });
                    return outputs.at(-1) ?? NaN;
                },
            },
            mutable: false,
        },
        println: {
            value: {
                callback: (...outputs: Value[]) => {
                    outputs.forEach((value: Value) => {
                        value = String(value);
                        if (value == "[object Object]") value = "[Composite Object]";
                        process.stdout.write(value);
                        process.stdout.write("\n");
                    });
                    return outputs.at(-1) ?? NaN;
                },
            },
            mutable: false,
        },
        stringify: {
            value: {
                callback: (value: Value): string => {
                    value = String(value);
                    if (value == "[object Object]") value = "[Composite Object]";
                    return value;
                },
            },
            mutable: false,
        },
        // Math functions
        random: {
            value: {
                callback: Math.random,
            },
            mutable: false,
        },
        floor: {
            value: {
                callback: (x: number) => Math.floor(x),
            },
            mutable: false,
        },
        round: {
            value: {
                callback: (x: number) => Math.round(x),
            },
            mutable: false,
        },
        ceil: {
            value: {
                callback: (x: number) => Math.ceil(x),
            },
            mutable: false,
        },
        log: {
            value: {
                callback: (x: number) => Math.log10(x),
            },
            mutable: false,
        },
    },
};

export { stdlib as default };
