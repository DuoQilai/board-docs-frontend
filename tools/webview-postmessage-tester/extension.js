const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.commands.registerCommand("webviewTester.open", () => {
    const panel = vscode.window.createWebviewPanel(
      "webviewTester",
      "WebView Tester",
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    const testUrl = "http://localhost:3000/boards/LicheePi4A/Coremark/";

    // VS Code/Cursor WebView has strict CSP by default.
    // We must explicitly allow framing our dev server, otherwise the iframe is blocked and the panel looks blank.
    const csp = [
      "default-src 'none'",
      `frame-src ${testUrl} http://localhost:3000 http://127.0.0.1:3000`,
      "style-src 'unsafe-inline'",
      "img-src https: data:",
      "script-src 'unsafe-inline'",
    ].join("; ");

    panel.webview.html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>WebView Tester</title>
  </head>
  <body style="margin:0;padding:0;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="position:fixed;top:0;left:0;right:0;z-index:10;background:#111827;color:#e5e7eb;padding:6px 10px;font-size:12px;display:flex;gap:12px;align-items:center">
      <div style="opacity:0.9">WebView Tester</div>
      <div style="opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Loading: ${testUrl}</div>
    </div>
    <iframe
      src="${testUrl}"
      style="border:0;width:100vw;height:100vh;padding-top:28px;box-sizing:border-box"
    ></iframe>
  </body>
</html>`;

    panel.webview.onDidReceiveMessage((msg) => {
      console.log("[WebView message]", msg);
      vscode.window.showInformationMessage(`收到消息: ${JSON.stringify(msg)}`);
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
