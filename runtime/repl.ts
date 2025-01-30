import readline from "readline";
import interpret, { type MemoryBlock } from "../language/interpreter";
import tokenize from "../language/lexer";
import parse from "../language/parser";
import stdlib from "../language/stdlib";

let memory: MemoryBlock = stdlib;

export default function repl(
    verbose: boolean = false,
    discard: boolean = false,
    parseOnly: boolean = false
) {
    console.log("-+= Welcome To The REPL =+-");
    console.log("\"Ctrl + C\" or \"exit\" to exit")

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        historySize: 100,
    });

    rl.prompt();

    rl.on("line", (input) => {
        if (!input.trim()) {
            rl.prompt();
            return;
        }
        if (input.trim() === "exit") {
            process.exit(0)
        }

        try {
            const token_arr = tokenize(input);
            if (verbose) console.dir(token_arr, { depth: 10 });

            const ast = parse(token_arr);
            if (verbose) console.dir(ast, { depth: 10 });

            if (parseOnly) return;
            const output = interpret(ast, memory);
            console.dir(output, { depth: Infinity });
            if (verbose) console.dir(memory, { depth: 10 });

            if (discard) memory = { values: {}, parent: null };
        } catch (error) {
            // memory = stdlib;
            console.error(error);
        }

        rl.prompt();
    });
}
