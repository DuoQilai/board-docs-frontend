# broad-docs-frontend 的变更

由于 VSCode WebView API 的安全限制，内嵌外部网页必须通过 `<iframe>` 进行，
而 `<iframe>` 内的代码无权直接调用 VSCode 提供的 API。因此，
对于 `在 VSCode 内打开` 功能需要进行一定的变更：

```patch
From 60cd387f692e753dc7a13a69255e44b6ee56e4e1 Mon Sep 17 00:00:00 2001
From: sisungo <sisungo@icloud.com>
Date: Thu, 23 Apr 2026 17:00:09 +0800
Subject: [PATCH] support ruyisdk vscode module

---
 src/pages/boards/[board]/[example].astro | 9 ++-------
 1 file changed, 2 insertions(+), 7 deletions(-)

diff --git a/src/pages/boards/[board]/[example].astro b/src/pages/boards/[board]/[example].astro
index 4132aa1..95e5955 100644
--- a/src/pages/boards/[board]/[example].astro
+++ b/src/pages/boards/[board]/[example].astro
@@ -93,18 +93,13 @@ const sourceDocUrl = `/${rawDocPath}`;
         const profile = button.dataset.profile ?? "";
         const sourceDocUrl = button.dataset.sourceDocUrl ?? "";
         const url = sourceDocUrl ? new URL(sourceDocUrl, window.location.origin).href : window.location.href;
-        const vscode =
-          typeof window.acquireVsCodeApi === "function"
-            ? window.acquireVsCodeApi()
-            : window.vscode;
 
-        if (!vscode?.postMessage) return;
-        vscode.postMessage({
+        window.parent.postMessage({
           type: "copilot",
           url,
           model,
           profile,
-        });
+        }, '*');
       });
     }
   }
-- 
2.50.1 (Apple Git-155)
```

需要将 `vscode.postMessage()` 调用更换成对 `window.parent.postMessage` 的调用，
并删除获取 VSCode API 的代码。插件内将会监听这个事件，并转发给 VSCode API。
