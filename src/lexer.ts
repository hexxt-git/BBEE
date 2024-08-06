export enum TokenKind {
    identifier,
    numericLiteral,

    additive,
    multiplicative,

    openPar,
    closePar,
}

export interface Token {
    kind: TokenKind;
    value: string;
}

export default function lexer(source: string): Token[] {
    const token_arr: Token[] = [];

    let newNumber = "";
    let newIdentifier = "";

    // adding a trailing whitespace so identifiers work at the end
    for (let char of source + " ") {
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
                token_arr.push({
                    kind: TokenKind.identifier,
                    value: newIdentifier,
                });
                newIdentifier = "";
            } else if (char === "+" || char === "-") {
                token_arr.push({
                    kind: TokenKind.additive,
                    value: char,
                });
            } else if (char === "*" || char === "/") {
                token_arr.push({
                    kind: TokenKind.multiplicative,
                    value: char,
                });
            } else if (char === "(") {
                token_arr.push({
                    kind: TokenKind.openPar,
                    value: char,
                });
            } else if (char === ")") {
                token_arr.push({
                    kind: TokenKind.closePar,
                    value: char,
                });
            } else if (char != " " && char != "\n") {
                throw new Error("Tokenizer unexpected character: " + char);
            }
        }
    }

    return token_arr;
}
