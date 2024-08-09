export enum TokenKind {
    identifier,
    numericLiteral,
    stringLiteral,
    macro,
    declaration,

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

    openClosure,
    closeClosure,
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
    mut: { kind: TokenKind.declaration, value: "mut" },
    const: { kind: TokenKind.declaration, value: "const" },
};

type TokenRegex = { kind: TokenKind; regex: RegExp };

const TokenMap: Array<TokenRegex> = [
    {
        kind: TokenKind.unary,
        regex: /^((!)|(floor)|(round)|(output)|(stringify))/,
    },
    {
        kind: TokenKind.additive,
        regex: /^[+-]/,
    },
    {
        kind: TokenKind.multiplicative,
        regex: /^[*/]/,
    },
    {
        kind: TokenKind.modulo,
        regex: /^%/,
    },
    {
        kind: TokenKind.exponentiation,
        regex: /^\^/,
    },
    {
        kind: TokenKind.comparative,
        regex: /^((>=)|(<=)|(==)|>|<)/,
    },
    {
        kind: TokenKind.logical,
        regex: /^((&&)|(\|\|)|(\^\^))/,
    },
    {
        kind: TokenKind.assignment,
        regex: /^=/,
    },
    {
        kind: TokenKind.comma,
        regex: /^[,;]/,
    },
    {
        kind: TokenKind.ternaryOpen,
        regex: /^\?/,
    },
    {
        kind: TokenKind.ternaryContinue,
        regex: /^:/,
    },
    {
        kind: TokenKind.openPar,
        regex: /^\(/,
    },
    {
        kind: TokenKind.closePar,
        regex: /^\)/,
    },
    {
        kind: TokenKind.openClosure,
        regex: /^\{/,
    },
    {
        kind: TokenKind.closeClosure,
        regex: /^\}/,
    },
    {
        kind: TokenKind.numericLiteral,
        regex: /^((\d+(\.\d+)?)|(Infinity)|(NaN))/,
    },
    {
        kind: TokenKind.stringLiteral,
        regex: /^"[^"]+"/,
    },
    {
        kind: TokenKind.identifier,
        regex: /^\w+/,
    },
];
export default function tokenize(source: string): Token[] {
    const token_arr: Token[] = [];
    let index = 0;

    while (index < source.length) {
        let match: Token | null = null;

        for (let tokenRegex of TokenMap) {
            const testResult = tokenRegex.regex.test(source.slice(index));
            if (testResult) {
                match = {
                    kind: tokenRegex.kind,
                    value: source.slice(index).match(tokenRegex.regex)![0],
                };
                break;
            }
        }

        if (match) {
            if (match.kind === TokenKind.identifier && RESERVED[match.value]) {
                token_arr.push(RESERVED[match.value]);
            } else {
                token_arr.push(match);
            }
            index += match.value.length;
        } else {
            const spaces = source.slice(index).match(/^[ \t\n]+/)?.length ?? 0;
            index += spaces;
            if (spaces === 0)
                throw new Error(
                    "Unexpected character encountered: " + source.slice(index, index + 10) + "..."
                );
        }
    }

    return token_arr;
}
