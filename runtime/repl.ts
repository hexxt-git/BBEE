import readline from "readline";
import interpret from "../language/interpreter";
import tokenize from "../language/lexer";
import parse from "../language/parser";

export default function repl(verbose: boolean = false) {
    console.log("-+= welcome to my repl (history preserved between sessions) =+-");

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
            const ast = parse(token_arr);
            if (verbose) {
                console.dir(token_arr, { depth: 10 });
                console.dir(ast, { depth: 10 });
            }

            const output = interpret(ast);
            console.log(output);
        } catch (error) {
            console.error(error);
        }

        rl.prompt();
    });
}
