import * as vscode from 'vscode';


/// Creates a new quickFix action.
export function createQuickFix(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range | vscode.Selection): vscode.CodeAction | undefined {

    if (isNullableError(diagnostic)) {
        let action = new vscode.CodeAction('Add a ternary check', vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.edit = new vscode.WorkspaceEdit();
        action.isPreferred = true;

        let line = document.lineAt(diagnostic.range.start.line);
        let expressionRange = getExpressionRange(line, diagnostic);
        if (!expressionRange) {
            // The expression could not be found in the line
            return;
        }

        let diagnosticText = document.getText(diagnostic.range);
        let expressionText = document.getText(expressionRange);
        let newText = `${diagnosticText} != null ? ${expressionText} : null`;

        action.edit.replace(document.uri, expressionRange, newText);
        return action;
    }
    // if (case) {

    // }

}

function isNullableError(diagnostic: vscode.Diagnostic): boolean {
    if (typeof diagnostic.code === 'object' && (diagnostic.code.value === 'argument_type_not_assignable' || diagnostic.code.value === 'invalid_assignment')) {
        const types = extractTypes(diagnostic.message);
        return types[0].includes(types[1]);
    }
    return false;
}

function getExpressionRange(line: vscode.TextLine, diagnostic: vscode.Diagnostic): vscode.Range | null {
    const diagnosticArg = line.text.slice(diagnostic.range.start.character, diagnostic.range.end.character);
    const match = line.text.match(new RegExp(`(\\b[\\w\\d_]+(?:\\.\\w+)?\\(${diagnosticArg}\\))|(\\b[\\w\\d_]+\\[${diagnosticArg}\\])`));
    if (match) {
        const matchStart = line.text.indexOf(match[0]);
        const matchEnd = matchStart + match[0].length;
        return new vscode.Range(line.range.start.line, matchStart, line.range.start.line, matchEnd);
    }
    return null;
}



function extractTypes(errorMessage: string): string[] {
    const typeRegex = /(?:[^a-zA-Z]|^)'([^']+)'(?:[^a-zA-Z]|$)/g;
    let types = [];
    for (const match of errorMessage.matchAll(typeRegex)) {
        types.push(match[1]);
    }
    return types;
}
