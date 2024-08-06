import lexer from "./lexer";
import parser from "./parser";

export default function repl() {
    console.log("-+= welcome to my repl =+-");

    while (true) {
        const input = prompt(">");
        if (!input) continue;
        if (input == "exit") break;

        // todo replace with interpreter
        console.dir(
            {
                lexer: lexer(input),
                parser: new parser().parse(lexer(input)),
            },
            {
                depth: 10,
            }
        );
    }
}
