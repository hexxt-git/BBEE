import interpret from "./interpreter";
import tokenize from "./lexer";
import parse from "./parser";

export default function repl(verbose: Boolean = false) {
    console.log("-+= welcome to my repl (memory not preserved) =+-");

    while (true) {
        const input = prompt(">");
        if (!input) continue;
        if (input == "exit") break;

        try {
            const output: number = interpret(input);
            console.log(output);

            if (verbose) {
                const token_arr = tokenize(input);
                console.dir(
                    {
                        lexer: token_arr,
                        parser: parse(token_arr),
                        interpreter: output,
                    },
                    {
                        depth: 10,
                    }
                );
            }
        } catch (error) {
            console.error(error);
        }
    }
}
