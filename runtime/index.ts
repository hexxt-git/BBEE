import { Command } from "commander";
import interpret from "../language/interpreter";
import tokenize from "../language/lexer";
import parse from "../language/parser";
import repl from "./repl";
import fs from "fs";
import visualize from "../visualizer";

const program = new Command();

program
    .command("tokenize <file>")
    .description("Tokenize a source file")
    .action((file) => {
        const source = fs.readFileSync(file).toString();
        const tokens = tokenize(source);
        console.dir(tokens, { depth: 100 });
    });

program
    .command("parse <file>")
    .description("Parse a source file")
    .action((file) => {
        const source = fs.readFileSync(file).toString();
        const tokens = tokenize(source);
        const ast = parse(tokens);
        console.dir(ast, { depth: 100 });
    });

program
    .command("visualize <file>")
    .description("produces a tree visualization of the abstract syntax tree")
    .action((file) => {
        const source = fs.readFileSync(file).toString();
        const tokens = tokenize(source);
        const ast = parse(tokens);
        visualize(ast);
    });

program
    .command("interpret <file>")
    .description("Interpret a source file")
    .action((file) => {
        const source = fs.readFileSync(file).toString();
        const tokens = tokenize(source);
        const ast = parse(tokens);
        const output = interpret(ast);
        console.log(output);
    });

program.option("-v, --verbose", "Enable verbose mode for REPL").action((options) => {
    repl(options.verbose);
});

program.parse(process.argv);
