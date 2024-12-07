const vscode = require('vscode');
const fetch = require('node-fetch'); // Ensure you install `node-fetch`

// LM Studio API URL
const BASE_URL = "http://localhost:1234/v1";

// Function to fetch the LLM completion
async function getCompletion(prompt) {
    console.log("IN HERE");
    const payload = {
        model: "llama-3.2-3b-instruct:2",
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7,
    };

    try {
        console.log("Sending request to LLM Studio with payload:", payload);

        const response = await fetch(`${BASE_URL}/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].text.trim();
        } else {
            throw new Error("No completion received from the LLM");
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to fetch LLM completion: ${error.message}`);
        console.error("Error fetching LLM completion:", error);
        return "";
    }
}

// This method is called when your extension is activated
function activate(context) {
    console.log("LLM Autocomplete extension activated!");

    let disposable = vscode.commands.registerCommand(
        'llm-autocomplete.completeCode',
        async function () {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage("No active editor found.");
                return;
            }

            const document = editor.document;
            const cursorPosition = editor.selection.active;
            const lineText = document.lineAt(cursorPosition.line).text.trim();

            if (!lineText) {
                vscode.window.showWarningMessage("The current line is empty. Please type something for completion.");
                return;
            }

            vscode.window.showInformationMessage("Fetching code completion...");
            const completion = await getCompletion(lineText);

            if (completion) {
                editor.edit((editBuilder) => {
                    editBuilder.insert(cursorPosition, `\n${completion}`);
                });
                vscode.window.showInformationMessage("Code completion added successfully.");
            } else {
                vscode.window.showWarningMessage("No completion received.");
            }
        }
    );

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {
    console.log("LLM Autocomplete extension deactivated.");
}

module.exports = {
    activate,
    deactivate,
};
