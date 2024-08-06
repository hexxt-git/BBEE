import lexer from "./lexer";

export default function repl() {
  console.log("-+= welcome to my repl =+-");

  while (true) {
    const input = prompt(">");
    if (!input) continue;
    if (input == "exit") break;

    // todo replace with interpreter
    console.log(lexer(input));
  }
}
