import readline from "readline";
import interpret, { type MemoryBlock } from "../language/interpreter";
import tokenize from "../language/lexer";
import parse from "../language/parser";

let memory: MemoryBlock = {
    values: {},
    parent: null,
};

export default function repl(verbose: boolean = false, discard: boolean = false) {
    console.log("-+= Welcome To The REPL =+-");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        historySize: 100,
    });

    rl.prompt();

    rl.on("line", (input) => {
        if (!input.trim()) {
            1;
            rl.prompt();
            return;
        }
        if (input === "exit") {
            rl.close();
            return;
        }

        try {
            const token_arr = tokenize(input);
            if (verbose) console.dir(token_arr, { depth: 10 });

            const ast = parse(token_arr);
            if (verbose) console.dir(ast, { depth: 10 });

            const output = interpret(ast, memory);
            console.log(output);
            if (verbose) console.dir(memory, { depth: 10 });

            if (discard) memory = { values: {}, parent: null };
        } catch (error) {
            // memory = { values: {}, parent: null };
            console.error(error);
        }

        rl.prompt();
    });
}
