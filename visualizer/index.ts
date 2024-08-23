import { ExpressionKind, type Expression } from "../language/parser";
import fs from "fs";

interface Node {
    id: number;
    label: string;
    shape: string;
}

interface Edge {
    from: number;
    to: number;
    label?: string;
}

const expression_labels = Object.keys(ExpressionKind)
    .filter((key) => isNaN(Number(key)))
    .map((name) =>
        name
            .replaceAll(/([A-Z])/g, " $1") // camel case to regular case
            .toLowerCase()
            .trim()
    );

function getNodeShape(expressionKind: ExpressionKind): string {
    switch (expressionKind) {
        case ExpressionKind.NumericLiteral:
            return "ellipse";
        case ExpressionKind.Identifier:
        case ExpressionKind.Macro:
            return "box";
        case ExpressionKind.UnaryOperation:
            return "diamond";
        case ExpressionKind.BinaryOperation:
            return "triangle";
        case ExpressionKind.TernaryOperation:
            return "star";
        case ExpressionKind.Conditional:
        case ExpressionKind.Loop:
            return "hexagon";
        default:
            return "box";
    }
}

export default function visualize(ast: Expression) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let id_counter = 0;

    function flattenAST(expression: Expression, parentID: number | null = null) {
        const id = id_counter++;
        let label = expression_labels[expression.kind] + " ";

        const shape = getNodeShape(expression.kind);

        switch (expression.kind) {
            case ExpressionKind.NumericLiteral:
                label += `${expression.value}`;
                break;
            case ExpressionKind.Identifier:
            case ExpressionKind.Macro:
                label += `${expression.identifier}`;
                break;
            case ExpressionKind.UnaryOperation:
                label += `${expression.operator}`;
                break;
            case ExpressionKind.BinaryOperation:
                label += `${expression.operator}`;
                break;
            case ExpressionKind.TernaryOperation:
                label += `${expression.operator}`;
                break;
            case ExpressionKind.Loop:
                label += `${expression.operation}`;
                break;
            case ExpressionKind.Conditional:
                label += `if`;
                break;
        }

        nodes.push({ id, label, shape });

        if (parentID !== null) {
            edges.push({ from: parentID, to: id });
        }

        switch (expression.kind) {
            case ExpressionKind.UnaryOperation:
                flattenAST(expression.right, id);
                break;
            case ExpressionKind.BinaryOperation:
                flattenAST(expression.left, id);
                flattenAST(expression.right, id);
                break;
            case ExpressionKind.TernaryOperation:
                flattenAST(expression.condition, id);
                flattenAST(expression.success, id);
                flattenAST(expression.failure, id);
                break;
            case ExpressionKind.Loop:
                flattenAST(expression.condition, id);
                flattenAST(expression.content, id);
                break;
            case ExpressionKind.Conditional:
                flattenAST(expression.condition, id);
                flattenAST(expression.success, id);
                expression.failure && flattenAST(expression.failure, id);
                break;
        }
    }

    flattenAST(ast);

    // console.dir({ nodes, edges }, { depth: 100 });

    const nodes_string = `const nodes = JSON.parse('${JSON.stringify(nodes)}')`;
    const edges_string = `const edges = JSON.parse('${JSON.stringify(edges)}')`;

    const template: string = fs.readFileSync("visualizer/template.html").toString();

    const html: string = template
        .replace("{{NODES}}", nodes_string)
        .replace("{{EDGES}}", edges_string);

    fs.writeFileSync("index.html", html);
}
