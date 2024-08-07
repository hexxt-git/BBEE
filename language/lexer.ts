export enum TokenKind {
    identifier,
    numericLiteral,

    macro,

    unary,

    additive,
    multiplicative,
    modulo,
    exponentiation,
    comparative,
    logical,

    ternaryOpen,
    ternaryContinue,
    block,

    assignment,
    comma,

    openPar,
    closePar,
}

export interface Token {
    kind: TokenKind;
    value: string;
}

const RESERVED: Record<string, Token> = {
    random: { kind: TokenKind.macro, value: "random" },
    input: { kind: TokenKind.macro, value: "input" },
    for: { kind: TokenKind.block, value: "for" },
    if: { kind: TokenKind.block, value: "if" },
};

export default function tokenize(source: string): Token[] {
    // adding a trailing whitespace so identifiers work at the end
    source += " ";
    const token_arr: Token[] = [];

    let newNumber = "";
    let newIdentifier = "";

    for (let char of source) {
        // letter, numbers, _ and .
        if (char.match(/\w|\./)) {
            if (newNumber.length > 0) {
                if (!char.match(/\d|\./)) {
                    throw new Error("Expected a digit or dot got: " + char);
                }
                if (newNumber.includes(".") && char === ".") {
                    throw new Error("Did not expect more than one dot");
                }
                newNumber += char;
            } else if (newIdentifier.length > 0) {
                newIdentifier += char;
            } else {
                if (char.match(/\d|\./)) newNumber = char;
                else newIdentifier = char;
            }
        } else {
            if (newNumber.length > 0) {
                token_arr.push({
                    kind: TokenKind.numericLiteral,
                    value: newNumber,
                });
                newNumber = "";
            } else if (newIdentifier.length > 0) {
                if (newIdentifier in RESERVED) {
                    token_arr.push(RESERVED[newIdentifier]);
                } else {
                    token_arr.push({
                        kind: TokenKind.identifier,
                        value: newIdentifier,
                    });
                }
                newIdentifier = "";
            }

            switch (char) {
                case "#":
                case "!":
                    token_arr.push({
                        kind: TokenKind.unary,
                        value: char,
                    });
                    break;
                case "+":
                case "-":
                    token_arr.push({
                        kind: TokenKind.additive,
                        value: char,
                    });
                    break;
                case "*":
                case "/":
                    token_arr.push({
                        kind: TokenKind.multiplicative,
                        value: char,
                    });
                    break;
                case "%":
                    token_arr.push({
                        kind: TokenKind.modulo,
                        value: char,
                    });
                    break;
                case "^":
                    token_arr.push({
                        kind: TokenKind.exponentiation,
                        value: char,
                    });
                    break;
                case ">":
                case "<":
                case "~":
                    // TODO: implement a smarter lexer that can handle symbols like == and <=
                    token_arr.push({
                        kind: TokenKind.comparative,
                        value: char,
                    });
                    break;
                case "|":
                case "@":
                case "&":
                    token_arr.push({
                        kind: TokenKind.logical,
                        value: char,
                    });
                    break;
                case "=":
                    token_arr.push({
                        kind: TokenKind.assignment,
                        value: char,
                    });
                    break;
                case ",":
                case ";":
                    token_arr.push({
                        kind: TokenKind.comma,
                        value: char,
                    });
                    break;
                case "?":
                    token_arr.push({
                        kind: TokenKind.ternaryOpen,
                        value: char,
                    });
                    break;
                case ":":
                    token_arr.push({
                        kind: TokenKind.ternaryContinue,
                        value: char,
                    });
                    break;
                case "{":
                case "(":
                    token_arr.push({
                        kind: TokenKind.openPar,
                        value: char,
                    });
                    break;
                case "}":
                case ")":
                    token_arr.push({
                        kind: TokenKind.closePar,
                        value: char,
                    });
                    break;
                case " ":
                case "\n":
                case "\t":
                    break;
                default:
                    throw new Error("Tokenizer unexpected character: " + char);
            }
        }
    }

    return token_arr;
}
