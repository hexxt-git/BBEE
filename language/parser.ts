import { TokenKind, type Token } from "./lexer";

export enum ExpressionKind {
    FunctionDeclaration,
    FunctionCall,
    NumericLiteral,
    StringLiteral,
    Identifier,
    UnaryOperation,
    BinaryOperation,
    TernaryOperation,
    Loop,
    Conditional,
    Closure,
    Declaration,
    List,
}

export interface FunctionDeclarationExpression {
    kind: ExpressionKind.FunctionDeclaration;
    inputs: string[];
    body: Expression;
}

export interface NumericLiteralExpression {
    kind: ExpressionKind.NumericLiteral;
    value: number;
}

export interface StringLiteralExpression {
    kind: ExpressionKind.StringLiteral;
    content: string;
}

export interface IdentifierExpression {
    kind: ExpressionKind.Identifier;
    identifier: string;
}

export interface UnaryExpression {
    kind: ExpressionKind.UnaryOperation;
    operator: string;
    right: Expression;
}

export interface BinaryExpression {
    kind: ExpressionKind.BinaryOperation;
    left: Expression;
    operator: string;
    right: Expression;
}

export interface TernaryExpression {
    kind: ExpressionKind.TernaryOperation;
    condition: Expression;
    operator: string;
    success: Expression;
    failure: Expression;
}

export interface LoopExpression {
    kind: ExpressionKind.Loop;
    operation: string;
    condition: Expression;
    content: Expression;
}

export interface ConditionalExpression {
    kind: ExpressionKind.Conditional;
    condition: Expression;
    success: Expression;
    failure?: Expression;
}

export interface ClosureExpression {
    kind: ExpressionKind.Closure;
    content: Expression;
}
export interface DeclarationExpression {
    kind: ExpressionKind.Declaration;
    operation: string;
    identifier: string;
    content: Expression;
}

export interface FunctionCallExpression {
    kind: ExpressionKind.FunctionCall;
    left: Expression;
    inputs: Expression[];
}

export interface ListExpression {
    kind: ExpressionKind.List;
    elements: Expression[];
}

export type Expression =
    | FunctionDeclarationExpression
    | FunctionCallExpression
    | NumericLiteralExpression
    | StringLiteralExpression
    | IdentifierExpression
    | UnaryExpression
    | BinaryExpression
    | TernaryExpression
    | LoopExpression
    | ConditionalExpression
    | ClosureExpression
    | DeclarationExpression
    | ListExpression;


// for binary ops only
export const PRECEDENCE: TokenKind[] = [
    // comma
    // declaration
    // assignment
    // function declarations
    // Loops
    // Conditionals
    // ternary
    TokenKind.exponentiation,
    TokenKind.modulo,
    TokenKind.multiplicative,
    TokenKind.additive,
    TokenKind.comparative,
    TokenKind.logical,
    // function calls
    // unary
    // numeric
    // string
    // identifiers
    // lists
    // closures
    // parentheses
];

export const PrimitiveTokens = [
    TokenKind.identifier,
    TokenKind.numericLiteral,
    TokenKind.stringLiteral,
];

export class Parser {
    private tokens: Token[] = [];
    private current = 0;
    private top = () => this.tokens[this.current];
    private pop = () => this.tokens[this.current++];
    private rem = () => this.tokens.length - this.current + 1;

    public parse(source: Token[]): Expression {
        this.tokens = source;
        return this.parseToken();
    }

    public parseToken() {
        const program: Expression = this.parseCommaOperation();

        return program;
    }

    private parseCommaOperation(): Expression {
        let left = this.parseDeclaration();

        while (this.top() && this.top().kind == TokenKind.comma) {
            const operator: string = this.pop().value;
            const right: Expression = this.parseDeclaration();

            const expression: BinaryExpression = {
                kind: ExpressionKind.BinaryOperation,
                left,
                operator,
                right,
            };

            left = expression;
        }

        return left;
    }

    private parseDeclaration(): Expression {
        if (this.top().kind != TokenKind.declaration) return this.parseAssignmentOperation();
        if (this.rem() < 2) throw new Error("Expected 2 more tokens");

        const operation = this.pop().value;
        const identifier = this.pop().value;
        const equalSign = this.pop().value;
        if (equalSign !== "=") throw new Error('Expected "=" Token');
        const content = this.parseAssignmentOperation();

        const expression: DeclarationExpression = {
            kind: ExpressionKind.Declaration,
            operation,
            identifier,
            content,
        };
        return expression;
    }

    private parseAssignmentOperation(): Expression {
        let left = this.parseFunctionDeclaration();

        while (this.top() && this.top().kind == TokenKind.assignment) {
            const operator: string = this.pop().value;
            const right: Expression = this.parseFunctionDeclaration();

            const expression: BinaryExpression = {
                kind: ExpressionKind.BinaryOperation,
                left,
                operator,
                right,
            };

            left = expression;
        }

        return left;
    }

    private parseFunctionDeclaration(): Expression {
        if (this.top() && this.top().kind != TokenKind.func) return this.parseLoop();

        this.pop(); // FUNC
        const inputs = this.parseFunctionInputs();
        if (this.top().kind !== TokenKind.arrow) this.pop(); // => optional
        this.pop(); // =>
        let body = this.parseLoop();
        if (body.kind !== ExpressionKind.Closure) {
            body = {
                kind: ExpressionKind.Closure,
                content: body,
            };
        }
        const expression: FunctionDeclarationExpression = {
            kind: ExpressionKind.FunctionDeclaration,
            inputs,
            body,
        };

        return expression;
    }

    private parseFunctionInputs(): string[] {
        if (this.top().kind !== TokenKind.openPar && this.top().kind !== TokenKind.identifier)
            throw new Error("expected parentheses or identifier for function inputs");

        if (this.top().kind === TokenKind.identifier) return [this.top().value];

        this.pop(); // (

        const identifiers: string[] = [];

        while (this.top().kind !== TokenKind.closePar) {
            if (this.top().kind !== TokenKind.identifier)
                throw new Error("Expected identifiers in function inputs");

            identifiers.push(this.pop().value);

            if (this.top().kind !== TokenKind.comma && this.top().kind !== TokenKind.closePar)
                throw new Error(
                    "Expected comma operator or closing parentheses in function inputs"
                );
            if (this.top().kind === TokenKind.comma) this.pop(); // ,
        }

        this.pop(); // )

        return identifiers;
    }

    private parseLoop(): Expression {
        if (this.top().kind != TokenKind.loop) return this.parseConditional();
        if (this.rem() < 2) throw new Error("Expected 2 more tokens");

        const operation = this.pop().value;
        const condition = this.parseConditional();
        const content = this.parseConditional();
        if (content.kind !== ExpressionKind.Closure) throw new Error("Expected closure");

        const expression: LoopExpression = {
            kind: ExpressionKind.Loop,
            operation,
            condition,
            content,
        };
        return expression;
    }
    private parseConditional(): Expression {
        if (this.top().kind != TokenKind.if) return this.parseTernaryOperation();
        if (this.rem() < 2) throw new Error("Expected 2 more tokens");

        this.pop(); // IF
        const condition = this.parseTernaryOperation();
        const success = this.parseTernaryOperation();
        if (success.kind !== ExpressionKind.Closure) throw new Error("Expected closure");
        const elseToken = this.top().kind == TokenKind.else;
        let failure;
        if (elseToken) {
            this.pop(); // ELSE
            failure = this.parseTernaryOperation();
            if (failure.kind !== ExpressionKind.Closure) throw new Error("Expected closure");
        }

        const expression: ConditionalExpression = {
            kind: ExpressionKind.Conditional,
            condition,
            success,
            failure,
        };
        return expression;
    }

    private parseTernaryOperation(): Expression {
        let condition = this.parseBinaryOperation();

        while (this.top() && this.top().kind == TokenKind.ternaryOpen) {
            const operator: string = this.pop().value;
            const success: Expression = this.parseBinaryOperation();
            const otherwise: Token = this.pop();
            if (otherwise.kind !== TokenKind.ternaryContinue)
                throw new Error("expected : after ternary expression");
            const failure: Expression = this.parseBinaryOperation();

            const expression: TernaryExpression = {
                kind: ExpressionKind.TernaryOperation,
                condition,
                operator,
                success,
                failure,
            };

            condition = expression;
        }

        return condition;
    }

    private parseBinaryOperation(precedence: number = 0): Expression {
        if (precedence >= PRECEDENCE.length) return this.parseFunctionCall();
        let left = this.parseBinaryOperation(precedence + 1);

        while (this.top() && this.top().kind == PRECEDENCE[PRECEDENCE.length - precedence - 1]) {
            const operator: string = this.pop().value;
            const right: Expression = this.parseBinaryOperation(precedence + 1);

            const expression: BinaryExpression = {
                kind: ExpressionKind.BinaryOperation,
                left,
                operator,
                right,
            };

            left = expression;
        }

        return left;
    }

    private parseFunctionCall(): Expression {
        let left = this.parseUnaryOperation();

        while (this.top() && this.top().kind == TokenKind.call) {
            this.pop(); // @

            if (PrimitiveTokens.includes(this.top().kind)) {
                const right: Expression = this.parseUnaryOperation();

                const expression: FunctionCallExpression = {
                    kind: ExpressionKind.FunctionCall,
                    left,
                    inputs: [right],
                };

                left = expression;
                continue;
            }

            if (this.top().kind != TokenKind.openPar)
                throw new Error("Expected primitive or argument list for function call");

            this.pop(); // (

            const inputs: Expression[] = [];

            while (this.top().kind !== TokenKind.closePar) {
                // this feels illegal
                const input = this.parseAssignmentOperation();
                inputs.push(input);

                if (this.top().kind !== TokenKind.comma && this.top().kind !== TokenKind.closePar)
                    throw new Error(
                        "Expected comma operator or closing parentheses in function inputs"
                    );

                if (this.top().kind === TokenKind.comma) this.pop(); // ,
            }

            this.pop(); // )

            const expression: FunctionCallExpression = {
                kind: ExpressionKind.FunctionCall,
                left: left,
                inputs: inputs,
            };

            left = expression;
        }

        return left;
    }

    private parseUnaryOperation(): Expression {
        if (this.top().kind !== TokenKind.unary) return this.parseNumericLiteral();
        const operator = this.pop().value;
        const right: Expression = this.parseNumericLiteral();

        const expression: UnaryExpression = {
            kind: ExpressionKind.UnaryOperation,
            operator,
            right,
        };

        return expression;
    }

    private parseNumericLiteral(): Expression {
        if (this.top().kind !== TokenKind.numericLiteral) return this.parseStringLiteral();
        const expression: NumericLiteralExpression = {
            kind: ExpressionKind.NumericLiteral,
            value: parseFloat(this.pop().value),
        };
        return expression;
    }

    private parseStringLiteral(): Expression {
        if (this.top().kind !== TokenKind.stringLiteral) return this.parseIdentifier();
        const expression: StringLiteralExpression = {
            kind: ExpressionKind.StringLiteral,
            content: this.pop().value.slice(1, -1).replaceAll("\\n", "\n"),
        };

        return expression;
    }

    private parseIdentifier(): Expression {
        if (this.top().kind !== TokenKind.identifier) return this.parseList();
        const expression: IdentifierExpression = {
            kind: ExpressionKind.Identifier,
            identifier: this.pop().value,
        };
        return expression;
    }

    private parseList(): Expression {
        if (this.top().kind !== TokenKind.openList) return this.parseClosure();

        this.pop();

        const elements = [];
        while (this.top().kind !== TokenKind.closeList) {
            const element = this.parseDeclaration();
            elements.push(element);

            if (this.top().kind !== TokenKind.comma && this.top().kind !== TokenKind.closeList)
                throw new Error("Expected comma or closing bracket in list declaration");

            if (this.top().kind === TokenKind.comma) this.pop(); // ,
        }

        const expression: Expression = { kind: ExpressionKind.List, elements };

        const closing = this.pop();
        if (closing.kind !== TokenKind.closeList)
            throw new Error("Expected closing closure token, got: " + JSON.stringify(closing));

        return expression;
    }

    private parseClosure(): Expression {
        if (this.top().kind !== TokenKind.openClosure) return this.parsePar();

        this.pop();

        const content = this.parseToken();
        const expression: Expression = { kind: ExpressionKind.Closure, content };

        const closing = this.pop();
        if (closing.kind !== TokenKind.closeClosure)
            throw new Error("Expected closing closure token, got: " + JSON.stringify(closing));

        return expression;
    }

    private parsePar(): Expression {
        if (this.top().kind !== TokenKind.openPar)
            throw new Error("Unexpected Token Encountered: " + JSON.stringify(this.top()));
        this.pop();

        const expression = this.parseToken();

        const closing = this.pop();
        if (closing.kind !== TokenKind.closePar)
            throw new Error("Expected closing paren token, got: " + JSON.stringify(closing));

        return expression;
    }
}

export default function parse(source: Token[]): Expression {
    const parser = new Parser();
    const ast = parser.parse(source);
    return ast;
}
