import interpret from "./interpreter";
import repl from "./repl";
import fs from "fs";

const file = process.argv[2];

if (file) {
    const source: string = fs.readFileSync(file).toString();
    const output: number = interpret(source);

    console.log(output);
} else {
    repl();
}
