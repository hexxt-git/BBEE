import interpret from "../language/interpreter";
import tokenize from "../language/lexer";
import parse from "../language/parser";

export default function repl(verbose: Boolean = false) {
    console.log("-+= welcome to my repl (memory not preserved between operations) =+-");

    while (true) {
        const input = prompt("> ");
        if (!input) continue;
        if (input == "exit") break;

        try {
            if (verbose) {
                const token_arr = tokenize(input);
                console.dir(token_arr, { depth: 10 });

                const ast = parse(token_arr);
                console.dir(ast, { depth: 10 });
            }

            const output = interpret(input);
            console.log(output);
        } catch (error) {
            console.error(error);
        }
    }
}
