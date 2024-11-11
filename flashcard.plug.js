var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// https://deno.land/x/silverbullet@0.9.4/lib/plugos/worker_runtime.ts
var runningAsWebWorker = typeof window === "undefined" && // @ts-ignore: globalThis
typeof globalThis.WebSocketPair === "undefined";
if (typeof Deno === "undefined") {
  self.Deno = {
    args: [],
    // @ts-ignore: Deno hack
    build: {
      arch: "x86_64"
    },
    env: {
      // @ts-ignore: Deno hack
      get() {
      }
    }
  };
}
var pendingRequests = /* @__PURE__ */ new Map();
var syscallReqId = 0;
function workerPostMessage(msg) {
  self.postMessage(msg);
}
if (runningAsWebWorker) {
  globalThis.syscall = async (name, ...args) => {
    return await new Promise((resolve, reject) => {
      syscallReqId++;
      pendingRequests.set(syscallReqId, { resolve, reject });
      workerPostMessage({
        type: "sys",
        id: syscallReqId,
        name,
        args
      });
    });
  };
}
function setupMessageListener(functionMapping2, manifest2) {
  if (!runningAsWebWorker) {
    return;
  }
  self.addEventListener("message", (event) => {
    (async () => {
      const data = event.data;
      switch (data.type) {
        case "inv":
          {
            const fn = functionMapping2[data.name];
            if (!fn) {
              throw new Error(`Function not loaded: ${data.name}`);
            }
            try {
              const result = await Promise.resolve(fn(...data.args || []));
              workerPostMessage({
                type: "invr",
                id: data.id,
                result
              });
            } catch (e) {
              console.error(
                "An exception was thrown as a result of invoking function",
                data.name,
                "error:",
                e.message
              );
              workerPostMessage({
                type: "invr",
                id: data.id,
                error: e.message
              });
            }
          }
          break;
        case "sysr":
          {
            const syscallId = data.id;
            const lookup = pendingRequests.get(syscallId);
            if (!lookup) {
              throw Error("Invalid request id");
            }
            pendingRequests.delete(syscallId);
            if (data.error) {
              lookup.reject(new Error(data.error));
            } else {
              lookup.resolve(data.result);
            }
          }
          break;
      }
    })().catch(console.error);
  });
  workerPostMessage({
    type: "manifest",
    manifest: manifest2
  });
}
function base64Decode(s) {
  const binString = atob(s);
  const len = binString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}
function base64Encode(buffer) {
  if (typeof buffer === "string") {
    buffer = new TextEncoder().encode(buffer);
  }
  let binary = "";
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}
async function sandboxFetch(reqInfo, options) {
  if (typeof reqInfo !== "string") {
    const body = new Uint8Array(await reqInfo.arrayBuffer());
    const encodedBody = body.length > 0 ? base64Encode(body) : void 0;
    options = {
      method: reqInfo.method,
      headers: Object.fromEntries(reqInfo.headers.entries()),
      base64Body: encodedBody
    };
    reqInfo = reqInfo.url;
  }
  return syscall("sandboxFetch.fetch", reqInfo, options);
}
globalThis.nativeFetch = globalThis.fetch;
function monkeyPatchFetch() {
  globalThis.fetch = async function(reqInfo, init) {
    const encodedBody = init && init.body ? base64Encode(
      new Uint8Array(await new Response(init.body).arrayBuffer())
    ) : void 0;
    const r = await sandboxFetch(
      reqInfo,
      init && {
        method: init.method,
        headers: init.headers,
        base64Body: encodedBody
      }
    );
    return new Response(r.base64Body ? base64Decode(r.base64Body) : null, {
      status: r.status,
      headers: r.headers
    });
  };
}
if (runningAsWebWorker) {
  monkeyPatchFetch();
}

// https://jsr.io/@silverbulletmd/silverbullet/0.9.4/plug-api/syscalls/editor.ts
var editor_exports = {};
__export(editor_exports, {
  confirm: () => confirm,
  copyToClipboard: () => copyToClipboard,
  deleteLine: () => deleteLine,
  dispatch: () => dispatch,
  downloadFile: () => downloadFile,
  filterBox: () => filterBox,
  flashNotification: () => flashNotification,
  fold: () => fold,
  foldAll: () => foldAll,
  getCurrentPage: () => getCurrentPage,
  getCursor: () => getCursor,
  getSelection: () => getSelection,
  getText: () => getText,
  getUiOption: () => getUiOption,
  goHistory: () => goHistory,
  hidePanel: () => hidePanel,
  insertAtCursor: () => insertAtCursor,
  insertAtPos: () => insertAtPos,
  moveCursor: () => moveCursor,
  moveCursorToLine: () => moveCursorToLine,
  navigate: () => navigate,
  openCommandPalette: () => openCommandPalette,
  openPageNavigator: () => openPageNavigator,
  openSearchPanel: () => openSearchPanel,
  openUrl: () => openUrl,
  prompt: () => prompt,
  redo: () => redo,
  reloadConfigAndCommands: () => reloadConfigAndCommands,
  reloadPage: () => reloadPage,
  reloadUI: () => reloadUI,
  replaceRange: () => replaceRange,
  save: () => save,
  setSelection: () => setSelection,
  setText: () => setText,
  setUiOption: () => setUiOption,
  showPanel: () => showPanel,
  toggleFold: () => toggleFold,
  undo: () => undo,
  unfold: () => unfold,
  unfoldAll: () => unfoldAll,
  uploadFile: () => uploadFile,
  vimEx: () => vimEx
});

// https://jsr.io/@silverbulletmd/silverbullet/0.9.4/plug-api/syscall.ts
if (typeof self === "undefined") {
  self = {
    syscall: () => {
      throw new Error("Not implemented here");
    }
  };
}
function syscall2(name, ...args) {
  return globalThis.syscall(name, ...args);
}

// https://jsr.io/@silverbulletmd/silverbullet/0.9.4/plug-api/syscalls/editor.ts
function getCurrentPage() {
  return syscall2("editor.getCurrentPage");
}
function getText() {
  return syscall2("editor.getText");
}
function setText(newText) {
  return syscall2("editor.setText", newText);
}
function getCursor() {
  return syscall2("editor.getCursor");
}
function getSelection() {
  return syscall2("editor.getSelection");
}
function setSelection(from, to) {
  return syscall2("editor.setSelection", from, to);
}
function save() {
  return syscall2("editor.save");
}
function navigate(pageRef, replaceState = false, newWindow = false) {
  return syscall2("editor.navigate", pageRef, replaceState, newWindow);
}
function openPageNavigator(mode = "page") {
  return syscall2("editor.openPageNavigator", mode);
}
function openCommandPalette() {
  return syscall2("editor.openCommandPalette");
}
function reloadPage() {
  return syscall2("editor.reloadPage");
}
function reloadUI() {
  return syscall2("editor.reloadUI");
}
function reloadConfigAndCommands() {
  return syscall2("editor.reloadConfigAndCommands");
}
function openUrl(url, existingWindow = false) {
  return syscall2("editor.openUrl", url, existingWindow);
}
function goHistory(delta) {
  return syscall2("editor.goHistory", delta);
}
function downloadFile(filename, dataUrl) {
  return syscall2("editor.downloadFile", filename, dataUrl);
}
function uploadFile(accept, capture) {
  return syscall2("editor.uploadFile", accept, capture);
}
function flashNotification(message, type = "info") {
  return syscall2("editor.flashNotification", message, type);
}
function filterBox(label, options, helpText = "", placeHolder = "") {
  return syscall2("editor.filterBox", label, options, helpText, placeHolder);
}
function showPanel(id, mode, html, script = "") {
  return syscall2("editor.showPanel", id, mode, html, script);
}
function hidePanel(id) {
  return syscall2("editor.hidePanel", id);
}
function insertAtPos(text, pos) {
  return syscall2("editor.insertAtPos", text, pos);
}
function replaceRange(from, to, text) {
  return syscall2("editor.replaceRange", from, to, text);
}
function moveCursor(pos, center = false) {
  return syscall2("editor.moveCursor", pos, center);
}
function moveCursorToLine(line, column = 1, center = false) {
  return syscall2("editor.moveCursorToLine", line, column, center);
}
function insertAtCursor(text) {
  return syscall2("editor.insertAtCursor", text);
}
function dispatch(change) {
  return syscall2("editor.dispatch", change);
}
function prompt(message, defaultValue = "") {
  return syscall2("editor.prompt", message, defaultValue);
}
function confirm(message) {
  return syscall2("editor.confirm", message);
}
function getUiOption(key) {
  return syscall2("editor.getUiOption", key);
}
function setUiOption(key, value) {
  return syscall2("editor.setUiOption", key, value);
}
function fold() {
  return syscall2("editor.fold");
}
function unfold() {
  return syscall2("editor.unfold");
}
function toggleFold() {
  return syscall2("editor.toggleFold");
}
function foldAll() {
  return syscall2("editor.foldAll");
}
function unfoldAll() {
  return syscall2("editor.unfoldAll");
}
function undo() {
  return syscall2("editor.undo");
}
function redo() {
  return syscall2("editor.redo");
}
function openSearchPanel() {
  return syscall2("editor.openSearchPanel");
}
function copyToClipboard(data) {
  return syscall2("editor.copyToClipboard", data);
}
function deleteLine() {
  return syscall2("editor.deleteLine");
}
function vimEx(exCommand) {
  return syscall2("editor.vimEx", exCommand);
}

// https://jsr.io/@silverbulletmd/silverbullet/0.9.4/plug-api/syscalls/space.ts
var space_exports = {};
__export(space_exports, {
  deleteAttachment: () => deleteAttachment,
  deleteFile: () => deleteFile,
  deletePage: () => deletePage,
  fileExists: () => fileExists,
  getAttachmentMeta: () => getAttachmentMeta,
  getFileMeta: () => getFileMeta,
  getPageMeta: () => getPageMeta,
  listAttachments: () => listAttachments,
  listFiles: () => listFiles,
  listPages: () => listPages,
  listPlugs: () => listPlugs,
  readAttachment: () => readAttachment,
  readFile: () => readFile,
  readPage: () => readPage,
  writeAttachment: () => writeAttachment,
  writeFile: () => writeFile,
  writePage: () => writePage
});
function listPages() {
  return syscall2("space.listPages");
}
function getPageMeta(name) {
  return syscall2("space.getPageMeta", name);
}
function readPage(name) {
  return syscall2("space.readPage", name);
}
function writePage(name, text) {
  return syscall2("space.writePage", name, text);
}
function deletePage(name) {
  return syscall2("space.deletePage", name);
}
function listPlugs() {
  return syscall2("space.listPlugs");
}
function listAttachments() {
  return syscall2("space.listAttachments");
}
function getAttachmentMeta(name) {
  return syscall2("space.getAttachmentMeta", name);
}
function readAttachment(name) {
  return syscall2("space.readAttachment", name);
}
function writeAttachment(name, data) {
  return syscall2("space.writeAttachment", name, data);
}
function deleteAttachment(name) {
  return syscall2("space.deleteAttachment", name);
}
function listFiles() {
  return syscall2("space.listFiles");
}
function readFile(name) {
  return syscall2("space.readFile", name);
}
function getFileMeta(name) {
  return syscall2("space.getFileMeta", name);
}
function writeFile(name, data) {
  return syscall2("space.writeFile", name, data);
}
function deleteFile(name) {
  return syscall2("space.deleteFile", name);
}
function fileExists(name) {
  return syscall2("space.fileExists", name);
}

// https://jsr.io/@silverbulletmd/silverbullet/0.9.4/plug-api/syscalls/system.ts
var system_exports = {};
__export(system_exports, {
  applyAttributeExtractors: () => applyAttributeExtractors,
  getEnv: () => getEnv,
  getMode: () => getMode,
  getSpaceConfig: () => getSpaceConfig,
  getVersion: () => getVersion,
  invokeCommand: () => invokeCommand,
  invokeFunction: () => invokeFunction,
  invokeSpaceFunction: () => invokeSpaceFunction,
  listCommands: () => listCommands,
  listSyscalls: () => listSyscalls,
  reloadConfig: () => reloadConfig,
  reloadPlugs: () => reloadPlugs
});
function invokeFunction(name, ...args) {
  return syscall2("system.invokeFunction", name, ...args);
}
function invokeCommand(name, args) {
  return syscall2("system.invokeCommand", name, args);
}
function listCommands() {
  return syscall2("system.listCommands");
}
function listSyscalls() {
  return syscall2("system.listSyscalls");
}
function invokeSpaceFunction(name, ...args) {
  return syscall2("system.invokeSpaceFunction", name, ...args);
}
function applyAttributeExtractors(tags, text, tree) {
  return syscall2("system.applyAttributeExtractors", tags, text, tree);
}
async function getSpaceConfig(key, defaultValue) {
  return await syscall2("system.getSpaceConfig", key) ?? defaultValue;
}
function reloadPlugs() {
  return syscall2("system.reloadPlugs");
}
function reloadConfig() {
  return syscall2("system.reloadConfig");
}
function getEnv() {
  return syscall2("system.getEnv");
}
function getMode() {
  return syscall2("system.getMode");
}
function getVersion() {
  return syscall2("system.getVersion");
}

// https://jsr.io/@silverbulletmd/silverbullet/0.9.4/plug-api/syscalls/asset.ts
var asset_exports = {};
__export(asset_exports, {
  readAsset: () => readAsset
});

// https://jsr.io/@silverbulletmd/silverbullet/0.9.4/lib/crypto.ts
function base64Decode2(s) {
  const binString = atob(s);
  const len = binString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}
function base64DecodeDataUrl(dataUrl) {
  const b64Encoded = dataUrl.split(",", 2)[1];
  return base64Decode2(b64Encoded);
}

// https://jsr.io/@silverbulletmd/silverbullet/0.9.4/plug-api/syscalls/asset.ts
async function readAsset(plugName, name, encoding = "utf8") {
  const dataUrl = await syscall2("asset.readAsset", plugName, name);
  switch (encoding) {
    case "utf8":
      return new TextDecoder().decode(base64DecodeDataUrl(dataUrl));
    case "dataurl":
      return dataUrl;
  }
}

// ../data/flashcard.ts
function parse(text) {
  const array1 = [...text.matchAll(/(.*)::(.*)/g)];
  var regex = new RegExp("^(.+)\\n\\?\\n((?:(?:\\n|.+).+)+)", "gm");
  const array2 = [...text.matchAll(regex)];
  const array = array1.concat(array2);
  var data = [];
  for (var j = 0; j < array.length; j++) {
    data.push([array[j][1], array[j][2]]);
  }
  return data;
}
async function generateDecks() {
  const result = await system_exports.invokeFunction("index.queryObjects", "flashcards", "page");
  var decksQA = {};
  for (var i = 0; i < result.length; i++) {
    var page = result[i]["name"];
    var text = await space_exports.readPage(page);
    decksQA[page] = parse(text);
  }
  return decksQA;
}
async function showDecks() {
  console.log("start showDecks()");
  const decks = await generateDecks();
  const decks_keys = Object.keys(decks);
  var decksHtml = await asset_exports.readAsset("flashcard", "assets/decks.html");
  const decksJS = await asset_exports.readAsset("flashcard", "assets/decks.js");
  for (var k = 0; k < decks_keys.length; k++) {
    var page = decks_keys[k];
    decksHtml += `<button type="button" onclick="syscall('system.invokeFunction','flashcard.showCards','` + page + `');">` + page + "</button> (with " + decks[page].length + " cards)<br><br>";
  }
  await editor_exports.showPanel("modal", 50, decksHtml, decksJS);
}
async function showCards(page) {
  console.log("start showCards()");
  const cardHtml = await asset_exports.readAsset("flashcard", "assets/cards.html");
  var cardJS = "page = '" + page + "';";
  cardJS += await asset_exports.readAsset("flashcard", "assets/cards.js");
  await editor_exports.showPanel("modal", 50, cardHtml, cardJS);
  console.log("end showCards()");
}

// b420a9630de0cb6f.js
var functionMapping = {
  showCards,
  showDecks
};
var manifest = {
  "name": "flashcard",
  "assets": {
    "assets/cards.html": {
      "data": "data:text/html;base64,PGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uY2xpY2s9InN5c2NhbGwoJ2VkaXRvci5oaWRlUGFuZWwnLCAnbW9kYWwnKSIgc3R5bGU9InBvc2l0aW9uOmFic29sdXRlOyB0b3A6MDsgcmlnaHQ6MDsiIHRpdGxlPSJDbG9zZSI+WDwvYnV0dG9uPgo8ZGl2IGlkPSJjb3VudCIgc3R5bGU9InBvc2l0aW9uOmFic29sdXRlOyB0b3A6MDsgbGVmdDowOyI+MS8yPC9kaXY+Cjxicj4KPGRpdiBzdHlsZT0ndGV4dC1hbGlnbjogY2VudGVyOyc+CjxkaXYgaWQ9InF1ZXN0aW9uIiBvbmNsaWNrPSJkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VwYXJhdG9yJykuc3R5bGUudmlzaWJpbGl0eT0ndmlzaWJsZSc7ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcicpLnN0eWxlLnZpc2liaWxpdHk9J3Zpc2libGUnIj48L2Rpdj4KPGRpdiBpZD0ic2VwYXJhdG9yIiBzdHlsZT0idmlzaWJpbGl0eTogaGlkZGVuIj48aHI+PC9kaXY+CjxkaXYgaWQ9ImFuc3dlciIgc3R5bGU9InZpc2liaWxpdHk6IGhpZGRlbiI+PC9kaXY+Cgo8YnI+PGJyPgogIDxidXR0b24gdHlwZT0iYnV0dG9uIiBpZD0icHJldmlvdXMiPlByZXZpb3VzPC9idXR0b24+CiAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGlkPSJuZXh0Ij5OZXh0PC9idXR0b24+CjwvZGl2Pgo=",
      "mtime": 1731319708806
    },
    "assets/cards.js": {
      "data": "data:application/javascript;base64,Y29uc29sZS5sb2coInN0YXJ0IGNhcmRzLmpzIik7Cgpjb25zdCB0ZXh0UGFnZSA9IHN5c2NhbGwoJ3NwYWNlLnJlYWRQYWdlJyxwYWdlKTsKdGV4dFBhZ2UudGhlbigodGV4dCkgPT4gewogIGNvbnN0IGFycmF5MSA9IFsuLi50ZXh0Lm1hdGNoQWxsKC8oLiopOjooLiopL2cpXTsKCiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnXiguKylcXG5cXD9cXG4oKD86KD86XFxufC4rKS4rKSspJywgJ2dtJyk7CiAgY29uc3QgYXJyYXkyID0gWy4uLnRleHQubWF0Y2hBbGwocmVnZXgpXTsKCiAgY29uc3QgYXJyYXkgPSBhcnJheTEuY29uY2F0KGFycmF5Mik7CiAgdmFyIHF1ZXN0aW9ucyA9IFtdOyAKICBmb3IodmFyIGogPSAwO2ogPCBhcnJheS5sZW5ndGg7IGorKykgewogICAgcXVlc3Rpb25zLnB1c2goW2FycmF5W2pdWzFdLCBhcnJheVtqXVsyXV0pOwogIH0KCiAgdmFyIHF1ZXN0aW9uY291bnQgPSAwOwoKICBjb25zdCBuZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIm5leHQiKTsKICBjb25zdCBwcmV2aW91cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCJwcmV2aW91cyIpOwogIGNvbnN0IGNvdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoImNvdW50Iik7CgogIHF1ZXN0aW9uLnRleHRDb250ZW50ID0gcXVlc3Rpb25zW3F1ZXN0aW9uY291bnRdWzBdOwogIGFuc3dlci50ZXh0Q29udGVudCA9IHF1ZXN0aW9uc1txdWVzdGlvbmNvdW50XVsxXTsKICBjb3VudC50ZXh0Q29udGVudCA9IChxdWVzdGlvbmNvdW50ICsgMSApICsgIi8iICsgcXVlc3Rpb25zLmxlbmd0aDsKCiAgZnVuY3Rpb24gdXBkYXRlQ2FyZHMoYWN0aW9uKSB7CiAgICBpZihhY3Rpb24gPT0gInByZXZpb3VzIiApIHtxdWVzdGlvbmNvdW50IC09MTt9OwogICAgaWYoYWN0aW9uID09ICJuZXh0IiApIHtxdWVzdGlvbmNvdW50ICs9MTt9OwogICAgICAKICAgIGlmKHF1ZXN0aW9uY291bnQgPj0gMCAmJiBxdWVzdGlvbmNvdW50IDwgcXVlc3Rpb25zLmxlbmd0aCkgewogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcicpLnN0eWxlLnZpc2liaWxpdHk9J2hpZGRlbic7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VwYXJhdG9yJykuc3R5bGUudmlzaWJpbGl0eT0naGlkZGVuJzsKICAgIAogICAgY291bnQudGV4dENvbnRlbnQgPSAocXVlc3Rpb25jb3VudCArIDEgKSArICIvIiArIHF1ZXN0aW9ucy5sZW5ndGg7CiAgICBxdWVzdGlvbi50ZXh0Q29udGVudCA9IHF1ZXN0aW9uc1txdWVzdGlvbmNvdW50XVswXTsKICAgIGFuc3dlci50ZXh0Q29udGVudCA9IHF1ZXN0aW9uc1txdWVzdGlvbmNvdW50XVsxXTsKICAgIH0KICAgIAogICAgaWYocXVlc3Rpb25jb3VudCA8IDApIHtxdWVzdGlvbmNvdW50ID0gMH07CiAgICBpZihxdWVzdGlvbmNvdW50ID49IHF1ZXN0aW9ucy5sZW5ndGgpIHtxdWVzdGlvbmNvdW50ID0gcXVlc3Rpb25zLmxlbmd0aCAtIDF9OwogIH0KCiAgbmV4dC5hZGRFdmVudExpc3RlbmVyKCJjbGljayIsICgpID0+IHsgdXBkYXRlQ2FyZHMoJ25leHQnKSB9KTsKICBwcmV2aW91cy5hZGRFdmVudExpc3RlbmVyKCJjbGljayIsICgpID0+IHsgdXBkYXRlQ2FyZHMoJ3ByZXZpb3VzJykgfSk7Cgp9KTsKCgo=",
      "mtime": 1731319708808
    },
    "assets/decks.html": {
      "data": "data:text/html;base64,PGRpdj4KICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgb25jbGljaz0ic3lzY2FsbCgnZWRpdG9yLmhpZGVQYW5lbCcsICdtb2RhbCcpIiBzdHlsZT0icG9zaXRpb246YWJzb2x1dGU7IHRvcDowOyByaWdodDowOyIgdGl0bGU9IkNsb3NlIj5YPC9idXR0b24+Cg==",
      "mtime": 1731319708810
    },
    "assets/decks.js": {
      "data": "data:application/javascript;base64,Cg==",
      "mtime": 1731319708810
    },
    "assets/decks.js.save": {
      "data": "data:application/octet-stream;base64,Y29uc3QgY2FyZHNKUyA9IGAKY29uc3QgcXVlc3Rpb25zID0gZGVja3NbcGFnZV07CnZhciBmbGlwY291bnQgPSAwOwp2YXIgcXVlc3Rpb25jb3VudCA9IDA7Cgpjb25zdCBuZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIm5leHQiKTsKY29uc3QgcHJldmlvdXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgicHJldmlvdXMiKTsKY29uc3QgZnJvbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIuZnJvbnQiKTsKY29uc3QgYmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIi5iYWNrIik7CmNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoImNhcmQiKTsKCmZyb250LnRleHRDb250ZW50ID0gcXVlc3Rpb25zW3F1ZXN0aW9uY291bnRdWzBdOwpiYWNrLnRleHRDb250ZW50ID0gcXVlc3Rpb25zW3F1ZXN0aW9uY291bnRdWzFdOwoKZnVuY3Rpb24gdXBkYXRlQ2FyZHMoYWN0aW9uKSB7CiAgaWYoYWN0aW9uID09ICJwcmV2aW91cyIpIHtxdWVzdGlvbmNvdW50IC09MTt9OwogIGlmKGFjdGlvbiA9PSAibmV4dCIpIHtxdWVzdGlvbmNvdW50ICs9MTt9OwoKICBpZihxdWVzdGlvbmNvdW50IDwgMCkge3F1ZXN0aW9uY291bnQgPSAwO307CiAgaWYocXVlc3Rpb25jb3VudCA+IHF1ZXN0aW9ucy5sZW5ndGgpIHtxdWVzdGlvbmNvdW50ID0gcXVlc3Rpb25zLmxlbmd0aDt9OwoKICBmcm9udC50ZXh0Q29udGVudCA9IHF1ZXN0aW9uc1txdWVzdGlvbmNvdW50XVswXTsKICBiYWNrLnRleHRDb250ZW50ID0gcXVlc3Rpb25zW3F1ZXN0aW9uY291bnRdWzFdOwp9CgoKZWwuYWRkRXZlbnRMaXN0ZW5lcigidHJhbnNpdGlvbnN0YXJ0IiwgKCkgPT4gewogIGZsaXBjb3VudCArPSAxOwogIGlmKCBmbGlwY291bnQgJSAyID09IDApIHsKICAgIHVwZGF0ZUNhcmRzKCJuZXh0Iik7IH0KfSk7CgpuZXh0LmFkZEV2ZW50TGlzdGVuZXIoImNsaWNrIiwgKCkgPT4geyB1cGRhdGVDYXJkcygnbmV4dCcpIH0pOwpwcmV2aW91cy5hZGRFdmVudExpc3RlbmVyKCJjbGljayIsICgpID0+IHsgdXBkYXRlQ2FyZHMoJ3ByZXZpb3VzJykgfSk7CmAKCnZhciBjYXJkc0h0bWwgPSBgCjxkaXY+CiAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uY2xpY2s9InN5c2NhbGwoJ2VkaXRvci5oaWRlUGFuZWwnLCAnbW9kYWwnKSIgc3R5bGU9InBvc2l0aW9uOmFic29sdXRlOyB0b3A6MDsgcmlnaHQ6MDsiIHRpdGxlPSJDbG9zZSI+WDwvYnV0dG9uPgo8L2Rpdj4KCjxzdHlsZT4KbGFiZWwgewogICAgLXdlYmtpdC1wZXJzcGVjdGl2ZTogMTAwMHB4OwogICAgcGVyc3BlY3RpdmU6IDEwMDBweDsKICAgIC13ZWJraXQtdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDsKICAgIHRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7CiAgICBkaXNwbGF5OiBibG9jazsKICAgIHdpZHRoOiAzMDBweDsKICAgIGhlaWdodDogNDAwcHg7CiAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICBsZWZ0OiA1MCU7CiAgICB0b3A6IDUwJTsKICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7CiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTsKICAgIGN1cnNvcjogcG9pbnRlcjsKfQoKLmNhcmQgewogICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgYmFja2dyb3VuZDogI2VlZTsKICAgIGNvbG9yOiAjMDAwOwogICAgaGVpZ2h0OiAxMDAlOwogICAgd2lkdGg6IDEwMCU7CiAgICAtd2Via2l0LXRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7CiAgICB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkOwogICAgLXdlYmtpdC10cmFuc2l0aW9uOiBhbGwgNjAwbXM7CiAgICB0cmFuc2l0aW9uOiBhbGwgNjAwbXM7CiAgICB6LWluZGV4OiAyMDsKfQoKICAgIC5jYXJkIGRpdiB7CiAgICAgICAgcG9zaXRpb246IGFic29sdXRlOwogICAgICAgIGhlaWdodDogMTAwJTsKICAgICAgICB3aWR0aDogMTAwJTsKICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgbGluZS1oZWlnaHQ6IDMwcHg7CiAgICAgICAgcGFkZGluZy1sZWZ0OiAzMHB4OwogICAgICAgIHBhZGRpbmctcmlnaHQ6IDMwcHg7CiAgICAgICAgLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47CiAgICAgICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuOwogICAgICAgIGJvcmRlci1yYWRpdXM6IDJweDsKICAgICAgICAtLXN0YXRlOiAiZnJvbnQiOwogICAgfQoKICAgIC5jYXJkIC5iYWNrIHsKICAgICAgICBiYWNrZ3JvdW5kOiAjZjRmNGY0OwogICAgICAgIGNvbG9yOiAjMDAwOwogICAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGVYKDE4MGRlZyk7CiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGVYKDE4MGRlZyk7CiAgICB9CgoKaW5wdXQgewogICAgZGlzcGxheTogbm9uZTsKfQoKOmNoZWNrZWQgKyAuY2FyZCB7CiAgICB0cmFuc2Zvcm06IHJvdGF0ZVgoMTgwZGVnKTsKICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGVYKDE4MGRlZyk7Cn0KCgo8L3N0eWxlPgoKCjxsYWJlbD4KICAgIDxpbnB1dCB0eXBlPSJjaGVja2JveCIvPgogICAgPGRpdiBpZD0iY2FyZCIgY2xhc3M9ImNhcmQiPgogICAgICAgIDxkaXYgY2xhc3M9ImZyb250Ij48L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJiYWNrIj48L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0ibWVzc2FnZSI+PC9kaXY+CjwvbGFiZWw+CiAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIHN0eWxlPSIiIGlkPSJwcmV2aW91cyI+UHJldmlvdXM8L2J1dHRvbj4KICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgc3R5bGU9IiIgaWQ9Im5leHQiPk5leHQ8L2J1dHRvbj4KYAo=",
      "mtime": 1731319708811
    }
  },
  "functions": {
    "showCards": {
      "path": "flashcard.ts:showCards"
    },
    "showDecks": {
      "path": "flashcard.ts:showDecks",
      "command": {
        "name": "Flashcards"
      }
    }
  }
};
var plug = { manifest, functionMapping };
setupMessageListener(functionMapping, manifest);
export {
  plug
};
//# sourceMappingURL=flashcard.plug.js.map
