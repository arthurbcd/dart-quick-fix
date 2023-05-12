// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { createQuickFix } from './fixes';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "quick-fix-sample" is now active!');

	let provider = {
		provideCodeActions: function (document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
			let diagnostics = context.diagnostics;

			let actions: vscode.CodeAction[] = [];

			for (let diagnostic of diagnostics) {
				const action = createQuickFix(diagnostic, document, range);
				if (action !== undefined) { actions.push(action); }
			}

			return actions;
		}
	};

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			{ scheme: 'file', language: 'dart' }, provider, {
			providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
		}
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken) {
// 	let selectedText = document.getText(range);
// 	if (selectedText.startsWith('User(') && selectedText.endsWith(')')) {
// 		let dartQuickFixExists = context.diagnostics.some(diagnostic => diagnostic.code === 'dart.addNullCheck');
// 		if (dartQuickFixExists) {
// 			let fix = new vscode.CodeAction('Add null check', vscode.CodeActionKind.QuickFix);
// 			fix.edit = new vscode.WorkspaceEdit();
// 			fix.edit.replace(document.uri, range, `${selectedText} != null ? ${selectedText} : null`);
// 			fix.isPreferred = true;
// 			return [fix];
// 		}
// 	}
// 	return [];
// }