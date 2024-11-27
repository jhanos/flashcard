var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// https://deno.land/x/silverbullet@0.10.1/lib/plugos/worker_runtime.ts
var workerPostMessage = (_msg) => {
  throw new Error("Not initialized yet");
};
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
function setupMessageListener(functionMapping2, manifest2, postMessageFn) {
  if (!runningAsWebWorker) {
    return;
  }
  workerPostMessage = postMessageFn;
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

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/plug-api/syscalls/editor.ts
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
  newWindow: () => newWindow,
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

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/plug-api/syscall.ts
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

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/plug-api/syscalls/editor.ts
function getCurrentPage() {
  return syscall2("editor.getCurrentPage");
}
function getText() {
  return syscall2("editor.getText");
}
function setText(newText, isolateHistory = false) {
  return syscall2("editor.setText", newText, isolateHistory);
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
function navigate(pageRef, replaceState = false, newWindow2 = false) {
  return syscall2("editor.navigate", pageRef, replaceState, newWindow2);
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
function newWindow() {
  return syscall2("editor.newWindow");
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

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/plug-api/syscalls/space.ts
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

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/plug-api/syscalls/system.ts
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

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/plug-api/syscalls/asset.ts
var asset_exports = {};
__export(asset_exports, {
  readAsset: () => readAsset
});

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/lib/crypto.ts
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

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/plug-api/syscalls/asset.ts
async function readAsset(plugName, name, encoding = "utf8") {
  const dataUrl = await syscall2("asset.readAsset", plugName, name);
  switch (encoding) {
    case "utf8":
      return new TextDecoder().decode(base64DecodeDataUrl(dataUrl));
    case "dataurl":
      return dataUrl;
  }
}

// https://jsr.io/@silverbulletmd/silverbullet/0.10.1/plug-api/syscalls/datastore.ts
var datastore_exports = {};
__export(datastore_exports, {
  batchDel: () => batchDel,
  batchGet: () => batchGet,
  batchSet: () => batchSet,
  del: () => del,
  get: () => get,
  listFunctions: () => listFunctions,
  query: () => query,
  queryDelete: () => queryDelete,
  set: () => set
});
function set(key, value) {
  return syscall2("datastore.set", key, value);
}
function batchSet(kvs) {
  return syscall2("datastore.batchSet", kvs);
}
function get(key) {
  return syscall2("datastore.get", key);
}
function batchGet(keys) {
  return syscall2("datastore.batchGet", keys);
}
function del(key) {
  return syscall2("datastore.delete", key);
}
function batchDel(keys) {
  return syscall2("datastore.batchDelete", keys);
}
function query(query2, variables = {}) {
  return syscall2("datastore.query", query2, variables);
}
function queryDelete(query2, variables) {
  return syscall2("datastore.queryDelete", query2, variables);
}
function listFunctions() {
  return syscall2("datastore.listFunctions");
}

// ../deno-dir/deno_esbuild/ts-fsrs@4.4.3/node_modules/ts-fsrs/dist/index.mjs
var u = ((r) => (r[r.New = 0] = "New", r[r.Learning = 1] = "Learning", r[r.Review = 2] = "Review", r[r.Relearning = 3] = "Relearning", r))(u || {});
var l = ((r) => (r[r.Manual = 0] = "Manual", r[r.Again = 1] = "Again", r[r.Hard = 2] = "Hard", r[r.Good = 3] = "Good", r[r.Easy = 4] = "Easy", r))(l || {});
var h = class _h {
  static card(t) {
    return { ...t, state: _h.state(t.state), due: _h.time(t.due), last_review: t.last_review ? _h.time(t.last_review) : void 0 };
  }
  static rating(t) {
    if (typeof t == "string") {
      const e = t.charAt(0).toUpperCase(), i = t.slice(1).toLowerCase(), a = l[`${e}${i}`];
      if (a === void 0)
        throw new Error(`Invalid rating:[${t}]`);
      return a;
    } else if (typeof t == "number")
      return t;
    throw new Error(`Invalid rating:[${t}]`);
  }
  static state(t) {
    if (typeof t == "string") {
      const e = t.charAt(0).toUpperCase(), i = t.slice(1).toLowerCase(), a = u[`${e}${i}`];
      if (a === void 0)
        throw new Error(`Invalid state:[${t}]`);
      return a;
    } else if (typeof t == "number")
      return t;
    throw new Error(`Invalid state:[${t}]`);
  }
  static time(t) {
    if (typeof t == "object" && t instanceof Date)
      return t;
    if (typeof t == "string") {
      const e = Date.parse(t);
      if (isNaN(e))
        throw new Error(`Invalid date:[${t}]`);
      return new Date(e);
    } else if (typeof t == "number")
      return new Date(t);
    throw new Error(`Invalid date:[${t}]`);
  }
  static review_log(t) {
    return { ...t, due: _h.time(t.due), rating: _h.rating(t.rating), state: _h.state(t.state), review: _h.time(t.review) };
  }
};
var $ = 0.9;
var A = 36500;
var F = [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544, 1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567];
var L = false;
var H = true;
var b = (r) => {
  let t = F;
  return r?.w && (r.w.length === 19 ? t = r?.w : r.w.length === 17 && (t = r?.w.concat([0, 0]), t[4] = +(t[5] * 2 + t[4]).toFixed(8), t[5] = +(Math.log(t[5] * 3 + 1) / 3).toFixed(8), console.debug("[FSRS V5]auto fill w to 19 length"))), { request_retention: r?.request_retention || $, maximum_interval: r?.maximum_interval || A, w: t, enable_fuzz: r?.enable_fuzz ?? L, enable_short_term: r?.enable_short_term ?? H };
};
function w(r, t) {
  const e = { due: r ? h.time(r) : /* @__PURE__ */ new Date(), stability: 0, difficulty: 0, elapsed_days: 0, scheduled_days: 0, reps: 0, lapses: 0, state: u.New, last_review: void 0 };
  return t && typeof t == "function" ? t(e) : e;
}
Date.prototype.scheduler = function(r, t) {
  return G(this, r, t);
}, Date.prototype.diff = function(r, t) {
  return k(this, r, t);
}, Date.prototype.format = function() {
  return N(this);
}, Date.prototype.dueFormat = function(r, t, e) {
  return D(this, r, t, e);
};
function G(r, t, e) {
  return new Date(e ? _(r).getTime() + t * 24 * 60 * 60 * 1e3 : _(r).getTime() + t * 60 * 1e3);
}
function k(r, t, e) {
  if (!r || !t)
    throw new Error("Invalid date");
  const i = _(r).getTime() - _(t).getTime();
  let a = 0;
  switch (e) {
    case "days":
      a = Math.floor(i / (24 * 60 * 60 * 1e3));
      break;
    case "minutes":
      a = Math.floor(i / (60 * 1e3));
      break;
  }
  return a;
}
function N(r) {
  const t = _(r), e = t.getFullYear(), i = t.getMonth() + 1, a = t.getDate(), s = t.getHours(), n = t.getMinutes(), d = t.getSeconds();
  return `${e}-${g(i)}-${g(a)} ${g(s)}:${g(n)}:${g(d)}`;
}
function g(r) {
  return r < 10 ? `0${r}` : `${r}`;
}
var M = [60, 60, 24, 31, 12];
var R = ["second", "min", "hour", "day", "month", "year"];
function D(r, t, e, i = R) {
  r = _(r), t = _(t), i.length !== R.length && (i = R);
  let a = r.getTime() - t.getTime(), s;
  for (a /= 1e3, s = 0; s < M.length && !(a < M[s]); s++)
    a /= M[s];
  return `${Math.floor(a)}${e ? i[s] : ""}`;
}
function _(r) {
  return h.time(r);
}
var z = [l.Again, l.Hard, l.Good, l.Easy];
var j = [{ start: 2.5, end: 7, factor: 0.15 }, { start: 7, end: 20, factor: 0.1 }, { start: 20, end: 1 / 0, factor: 0.05 }];
function I(r, t, e) {
  let i = 1;
  for (const n of j)
    i += n.factor * Math.max(Math.min(r, n.end) - n.start, 0);
  r = Math.min(r, e);
  let a = Math.max(2, Math.round(r - i));
  const s = Math.min(Math.round(r + i), e);
  return r > t && (a = Math.max(a, t + 1)), a = Math.min(a, s), { min_ivl: a, max_ivl: s };
}
function p(r, t, e) {
  return Math.min(Math.max(r, t), e);
}
var B = class {
  c;
  s0;
  s1;
  s2;
  constructor(t) {
    const e = J();
    this.c = 1, this.s0 = e(" "), this.s1 = e(" "), this.s2 = e(" "), t == null && (t = +/* @__PURE__ */ new Date()), this.s0 -= e(t), this.s0 < 0 && (this.s0 += 1), this.s1 -= e(t), this.s1 < 0 && (this.s1 += 1), this.s2 -= e(t), this.s2 < 0 && (this.s2 += 1);
  }
  next() {
    const t = 2091639 * this.s0 + this.c * 23283064365386963e-26;
    return this.s0 = this.s1, this.s1 = this.s2, this.s2 = t - (this.c = t | 0), this.s2;
  }
  set state(t) {
    this.c = t.c, this.s0 = t.s0, this.s1 = t.s1, this.s2 = t.s2;
  }
  get state() {
    return { c: this.c, s0: this.s0, s1: this.s1, s2: this.s2 };
  }
};
function J() {
  let r = 4022871197;
  return function(t) {
    t = String(t);
    for (let e = 0; e < t.length; e++) {
      r += t.charCodeAt(e);
      let i = 0.02519603282416938 * r;
      r = i >>> 0, i -= r, i *= r, r = i >>> 0, i -= r, r += i * 4294967296;
    }
    return (r >>> 0) * 23283064365386963e-26;
  };
}
function K(r) {
  const t = new B(r), e = () => t.next();
  return e.int32 = () => t.next() * 4294967296 | 0, e.double = () => e() + (e() * 2097152 | 0) * 11102230246251565e-32, e.state = () => t.state, e.importState = (i) => (t.state = i, e), e;
}
var E = -0.5;
var S = 19 / 81;
var q = class {
  param;
  intervalModifier;
  _seed;
  constructor(t) {
    this.param = new Proxy(b(t), this.params_handler_proxy()), this.intervalModifier = this.calculate_interval_modifier(this.param.request_retention);
  }
  get interval_modifier() {
    return this.intervalModifier;
  }
  set seed(t) {
    this._seed = t;
  }
  calculate_interval_modifier(t) {
    if (t <= 0 || t > 1)
      throw new Error("Requested retention rate should be in the range (0,1]");
    return +((Math.pow(t, 1 / E) - 1) / S).toFixed(8);
  }
  get parameters() {
    return this.param;
  }
  set parameters(t) {
    this.update_parameters(t);
  }
  params_handler_proxy() {
    const t = this;
    return { set: function(e, i, a) {
      return i === "request_retention" && Number.isFinite(a) && (t.intervalModifier = t.calculate_interval_modifier(Number(a))), Reflect.set(e, i, a), true;
    } };
  }
  update_parameters(t) {
    const e = b(t);
    for (const i in e)
      if (i in this.param) {
        const a = i;
        this.param[a] = e[a];
      }
  }
  init_stability(t) {
    return Math.max(this.param.w[t - 1], 0.1);
  }
  init_difficulty(t) {
    return this.constrain_difficulty(this.param.w[4] - Math.exp((t - 1) * this.param.w[5]) + 1);
  }
  apply_fuzz(t, e) {
    if (!this.param.enable_fuzz || t < 2.5)
      return Math.round(t);
    const i = K(this._seed)(), { min_ivl: a, max_ivl: s } = I(t, e, this.param.maximum_interval);
    return Math.floor(i * (s - a + 1) + a);
  }
  next_interval(t, e) {
    const i = Math.min(Math.max(1, Math.round(t * this.intervalModifier)), this.param.maximum_interval);
    return this.apply_fuzz(i, e);
  }
  next_difficulty(t, e) {
    const i = t - this.param.w[6] * (e - 3);
    return this.constrain_difficulty(this.mean_reversion(this.init_difficulty(l.Easy), i));
  }
  constrain_difficulty(t) {
    return Math.min(Math.max(+t.toFixed(8), 1), 10);
  }
  mean_reversion(t, e) {
    return +(this.param.w[7] * t + (1 - this.param.w[7]) * e).toFixed(8);
  }
  next_recall_stability(t, e, i, a) {
    const s = l.Hard === a ? this.param.w[15] : 1, n = l.Easy === a ? this.param.w[16] : 1;
    return +p(e * (1 + Math.exp(this.param.w[8]) * (11 - t) * Math.pow(e, -this.param.w[9]) * (Math.exp((1 - i) * this.param.w[10]) - 1) * s * n), 0.01, 36500).toFixed(8);
  }
  next_forget_stability(t, e, i) {
    return +p(this.param.w[11] * Math.pow(t, -this.param.w[12]) * (Math.pow(e + 1, this.param.w[13]) - 1) * Math.exp((1 - i) * this.param.w[14]), 0.01, 36500).toFixed(8);
  }
  next_short_term_stability(t, e) {
    return +p(t * Math.exp(this.param.w[17] * (e - 3 + this.param.w[18])), 0.01, 36500).toFixed(8);
  }
  forgetting_curve(t, e) {
    return +Math.pow(1 + S * t / e, E).toFixed(8);
  }
};
var C = class {
  last;
  current;
  review_time;
  next = /* @__PURE__ */ new Map();
  algorithm;
  constructor(t, e, i) {
    this.algorithm = i, this.last = h.card(t), this.current = h.card(t), this.review_time = h.time(e), this.init();
  }
  init() {
    const { state: t, last_review: e } = this.current;
    let i = 0;
    t !== u.New && e && (i = this.review_time.diff(e, "days")), this.current.last_review = this.review_time, this.current.elapsed_days = i, this.current.reps += 1, this.initSeed();
  }
  preview() {
    return { [l.Again]: this.review(l.Again), [l.Hard]: this.review(l.Hard), [l.Good]: this.review(l.Good), [l.Easy]: this.review(l.Easy), [Symbol.iterator]: this.previewIterator.bind(this) };
  }
  *previewIterator() {
    for (const t of z)
      yield this.review(t);
  }
  review(t) {
    const { state: e } = this.last;
    let i;
    switch (e) {
      case u.New:
        i = this.newState(t);
        break;
      case u.Learning:
      case u.Relearning:
        i = this.learningState(t);
        break;
      case u.Review:
        i = this.reviewState(t);
        break;
    }
    if (i)
      return i;
    throw new Error("Invalid grade");
  }
  initSeed() {
    const t = this.review_time.getTime(), e = this.current.reps, i = this.current.difficulty * this.current.stability;
    this.algorithm.seed = `${t}_${e}_${i}`;
  }
  buildLog(t) {
    const { last_review: e, due: i, elapsed_days: a } = this.last;
    return { rating: t, state: this.current.state, due: e || i, stability: this.current.stability, difficulty: this.current.difficulty, elapsed_days: this.current.elapsed_days, last_elapsed_days: a, scheduled_days: this.current.scheduled_days, review: this.review_time };
  }
};
var T = class extends C {
  newState(t) {
    const e = this.next.get(t);
    if (e)
      return e;
    const i = h.card(this.current);
    switch (i.difficulty = this.algorithm.init_difficulty(t), i.stability = this.algorithm.init_stability(t), t) {
      case l.Again:
        i.scheduled_days = 0, i.due = this.review_time.scheduler(1), i.state = u.Learning;
        break;
      case l.Hard:
        i.scheduled_days = 0, i.due = this.review_time.scheduler(5), i.state = u.Learning;
        break;
      case l.Good:
        i.scheduled_days = 0, i.due = this.review_time.scheduler(10), i.state = u.Learning;
        break;
      case l.Easy: {
        const s = this.algorithm.next_interval(i.stability, this.current.elapsed_days);
        i.scheduled_days = s, i.due = this.review_time.scheduler(s, true), i.state = u.Review;
        break;
      }
      default:
        throw new Error("Invalid grade");
    }
    const a = { card: i, log: this.buildLog(t) };
    return this.next.set(t, a), a;
  }
  learningState(t) {
    const e = this.next.get(t);
    if (e)
      return e;
    const { state: i, difficulty: a, stability: s } = this.last, n = h.card(this.current), d = this.current.elapsed_days;
    switch (n.difficulty = this.algorithm.next_difficulty(a, t), n.stability = this.algorithm.next_short_term_stability(s, t), t) {
      case l.Again: {
        n.scheduled_days = 0, n.due = this.review_time.scheduler(5, false), n.state = i;
        break;
      }
      case l.Hard: {
        n.scheduled_days = 0, n.due = this.review_time.scheduler(10), n.state = i;
        break;
      }
      case l.Good: {
        const c = this.algorithm.next_interval(n.stability, d);
        n.scheduled_days = c, n.due = this.review_time.scheduler(c, true), n.state = u.Review;
        break;
      }
      case l.Easy: {
        const c = this.algorithm.next_short_term_stability(s, l.Good), f = this.algorithm.next_interval(c, d), y = Math.max(this.algorithm.next_interval(n.stability, d), f + 1);
        n.scheduled_days = y, n.due = this.review_time.scheduler(y, true), n.state = u.Review;
        break;
      }
      default:
        throw new Error("Invalid grade");
    }
    const o = { card: n, log: this.buildLog(t) };
    return this.next.set(t, o), o;
  }
  reviewState(t) {
    const e = this.next.get(t);
    if (e)
      return e;
    const i = this.current.elapsed_days, { difficulty: a, stability: s } = this.last, n = this.algorithm.forgetting_curve(i, s), d = h.card(this.current), o = h.card(this.current), c = h.card(this.current), f = h.card(this.current);
    this.next_ds(d, o, c, f, a, s, n), this.next_interval(d, o, c, f, i), this.next_state(d, o, c, f), d.lapses += 1;
    const y = { card: d, log: this.buildLog(l.Again) }, v = { card: o, log: super.buildLog(l.Hard) }, m = { card: c, log: super.buildLog(l.Good) }, x = { card: f, log: super.buildLog(l.Easy) };
    return this.next.set(l.Again, y), this.next.set(l.Hard, v), this.next.set(l.Good, m), this.next.set(l.Easy, x), this.next.get(t);
  }
  next_ds(t, e, i, a, s, n, d) {
    t.difficulty = this.algorithm.next_difficulty(s, l.Again), t.stability = this.algorithm.next_forget_stability(s, n, d), e.difficulty = this.algorithm.next_difficulty(s, l.Hard), e.stability = this.algorithm.next_recall_stability(s, n, d, l.Hard), i.difficulty = this.algorithm.next_difficulty(s, l.Good), i.stability = this.algorithm.next_recall_stability(s, n, d, l.Good), a.difficulty = this.algorithm.next_difficulty(s, l.Easy), a.stability = this.algorithm.next_recall_stability(s, n, d, l.Easy);
  }
  next_interval(t, e, i, a, s) {
    let n, d;
    n = this.algorithm.next_interval(e.stability, s), d = this.algorithm.next_interval(i.stability, s), n = Math.min(n, d), d = Math.max(d, n + 1);
    const o = Math.max(this.algorithm.next_interval(a.stability, s), d + 1);
    t.scheduled_days = 0, t.due = this.review_time.scheduler(5), e.scheduled_days = n, e.due = this.review_time.scheduler(n, true), i.scheduled_days = d, i.due = this.review_time.scheduler(d, true), a.scheduled_days = o, a.due = this.review_time.scheduler(o, true);
  }
  next_state(t, e, i, a) {
    t.state = u.Relearning, e.state = u.Review, i.state = u.Review, a.state = u.Review;
  }
};
var V = class extends C {
  newState(t) {
    const e = this.next.get(t);
    if (e)
      return e;
    this.current.scheduled_days = 0, this.current.elapsed_days = 0;
    const i = h.card(this.current), a = h.card(this.current), s = h.card(this.current), n = h.card(this.current);
    this.init_ds(i, a, s, n);
    const d = 0;
    return this.next_interval(i, a, s, n, d), this.next_state(i, a, s, n), this.update_next(i, a, s, n), this.next.get(t);
  }
  init_ds(t, e, i, a) {
    t.difficulty = this.algorithm.init_difficulty(l.Again), t.stability = this.algorithm.init_stability(l.Again), e.difficulty = this.algorithm.init_difficulty(l.Hard), e.stability = this.algorithm.init_stability(l.Hard), i.difficulty = this.algorithm.init_difficulty(l.Good), i.stability = this.algorithm.init_stability(l.Good), a.difficulty = this.algorithm.init_difficulty(l.Easy), a.stability = this.algorithm.init_stability(l.Easy);
  }
  learningState(t) {
    return this.reviewState(t);
  }
  reviewState(t) {
    const e = this.next.get(t);
    if (e)
      return e;
    const i = this.current.elapsed_days, { difficulty: a, stability: s } = this.last, n = this.algorithm.forgetting_curve(i, s), d = h.card(this.current), o = h.card(this.current), c = h.card(this.current), f = h.card(this.current);
    return this.next_ds(d, o, c, f, a, s, n), this.next_interval(d, o, c, f, i), this.next_state(d, o, c, f), d.lapses += 1, this.update_next(d, o, c, f), this.next.get(t);
  }
  next_ds(t, e, i, a, s, n, d) {
    t.difficulty = this.algorithm.next_difficulty(s, l.Again), t.stability = this.algorithm.next_forget_stability(s, n, d), e.difficulty = this.algorithm.next_difficulty(s, l.Hard), e.stability = this.algorithm.next_recall_stability(s, n, d, l.Hard), i.difficulty = this.algorithm.next_difficulty(s, l.Good), i.stability = this.algorithm.next_recall_stability(s, n, d, l.Good), a.difficulty = this.algorithm.next_difficulty(s, l.Easy), a.stability = this.algorithm.next_recall_stability(s, n, d, l.Easy);
  }
  next_interval(t, e, i, a, s) {
    let n, d, o, c;
    n = this.algorithm.next_interval(t.stability, s), d = this.algorithm.next_interval(e.stability, s), o = this.algorithm.next_interval(i.stability, s), c = this.algorithm.next_interval(a.stability, s), n = Math.min(n, d), d = Math.max(d, n + 1), o = Math.max(o, d + 1), c = Math.max(c, o + 1), t.scheduled_days = n, t.due = this.review_time.scheduler(n, true), e.scheduled_days = d, e.due = this.review_time.scheduler(d, true), i.scheduled_days = o, i.due = this.review_time.scheduler(o, true), a.scheduled_days = c, a.due = this.review_time.scheduler(c, true);
  }
  next_state(t, e, i, a) {
    t.state = u.Review, e.state = u.Review, i.state = u.Review, a.state = u.Review;
  }
  update_next(t, e, i, a) {
    const s = { card: t, log: this.buildLog(l.Again) }, n = { card: e, log: super.buildLog(l.Hard) }, d = { card: i, log: super.buildLog(l.Good) }, o = { card: a, log: super.buildLog(l.Easy) };
    this.next.set(l.Again, s), this.next.set(l.Hard, n), this.next.set(l.Good, d), this.next.set(l.Easy, o);
  }
};
var Q = class {
  fsrs;
  constructor(t) {
    this.fsrs = t;
  }
  replay(t, e, i) {
    return this.fsrs.next(t, e, i);
  }
  handleManualRating(t, e, i, a, s, n, d) {
    if (typeof e > "u")
      throw new Error("reschedule: state is required for manual rating");
    let o, c;
    if (e === u.New)
      o = { rating: l.Manual, state: e, due: d ?? i, stability: t.stability, difficulty: t.difficulty, elapsed_days: a, last_elapsed_days: t.elapsed_days, scheduled_days: t.scheduled_days, review: i }, c = w(i), c.last_review = i;
    else {
      if (typeof d > "u")
        throw new Error("reschedule: due is required for manual rating");
      const f = d.diff(i, "days");
      o = { rating: l.Manual, state: t.state, due: t.last_review || t.due, stability: t.stability, difficulty: t.difficulty, elapsed_days: a, last_elapsed_days: t.elapsed_days, scheduled_days: t.scheduled_days, review: i }, c = { ...t, state: e, due: d, last_review: i, stability: s || t.stability, difficulty: n || t.difficulty, elapsed_days: a, scheduled_days: f, reps: t.reps + 1 };
    }
    return { card: c, log: o };
  }
  reschedule(t, e) {
    const i = [];
    let a = w(t.due);
    for (const s of e) {
      let n;
      if (s.review = h.time(s.review), s.rating === l.Manual) {
        let d = 0;
        a.state !== u.New && a.last_review && (d = s.review.diff(a.last_review, "days")), n = this.handleManualRating(a, s.state, s.review, d, s.stability, s.difficulty, s.due ? h.time(s.due) : void 0);
      } else
        n = this.replay(a, s.review, s.rating);
      i.push(n), a = n.card;
    }
    return i;
  }
  calculateManualRecord(t, e, i, a) {
    if (!i)
      return null;
    const { card: s, log: n } = i, d = h.card(t);
    return d.due.getTime() === s.due.getTime() ? null : (d.scheduled_days = s.due.diff(d.due, "days"), this.handleManualRating(d, s.state, h.time(e), n.elapsed_days, a ? s.stability : void 0, a ? s.difficulty : void 0, s.due));
  }
};
var O = class extends q {
  Scheduler;
  constructor(t) {
    super(t);
    const { enable_short_term: e } = this.parameters;
    this.Scheduler = e ? T : V;
  }
  params_handler_proxy() {
    const t = this;
    return { set: function(e, i, a) {
      return i === "request_retention" && Number.isFinite(a) ? t.intervalModifier = t.calculate_interval_modifier(Number(a)) : i === "enable_short_term" && (t.Scheduler = a === true ? T : V), Reflect.set(e, i, a), true;
    } };
  }
  repeat(t, e, i) {
    const a = this.Scheduler, s = new a(t, e, this).preview();
    return i && typeof i == "function" ? i(s) : s;
  }
  next(t, e, i, a) {
    const s = this.Scheduler, n = new s(t, e, this), d = h.rating(i);
    if (d === l.Manual)
      throw new Error("Cannot review a manual rating");
    const o = n.review(d);
    return a && typeof a == "function" ? a(o) : o;
  }
  get_retrievability(t, e, i = true) {
    const a = h.card(t);
    e = e ? h.time(e) : /* @__PURE__ */ new Date();
    const s = a.state !== u.New ? Math.max(e.diff(a.last_review, "days"), 0) : 0, n = a.state !== u.New ? this.forgetting_curve(s, +a.stability.toFixed(8)) : 0;
    return i ? `${(n * 100).toFixed(2)}%` : n;
  }
  rollback(t, e, i) {
    const a = h.card(t), s = h.review_log(e);
    if (s.rating === l.Manual)
      throw new Error("Cannot rollback a manual rating");
    let n, d, o;
    switch (s.state) {
      case u.New:
        n = s.due, d = void 0, o = 0;
        break;
      case u.Learning:
      case u.Relearning:
      case u.Review:
        n = s.review, d = s.due, o = a.lapses - (s.rating === l.Again && s.state === u.Review ? 1 : 0);
        break;
    }
    const c = { ...a, due: n, stability: s.stability, difficulty: s.difficulty, elapsed_days: s.last_elapsed_days, scheduled_days: s.scheduled_days, reps: Math.max(0, a.reps - 1), lapses: Math.max(0, o), state: s.state, last_review: d };
    return i && typeof i == "function" ? i(c) : c;
  }
  forget(t, e, i = false, a) {
    const s = h.card(t);
    e = h.time(e);
    const n = s.state === u.New ? 0 : e.diff(s.last_review, "days"), d = { rating: l.Manual, state: s.state, due: s.due, stability: s.stability, difficulty: s.difficulty, elapsed_days: 0, last_elapsed_days: s.elapsed_days, scheduled_days: n, review: e }, o = { card: { ...s, due: e, stability: 0, difficulty: 0, elapsed_days: 0, scheduled_days: 0, reps: i ? 0 : s.reps, lapses: i ? 0 : s.lapses, state: u.New, last_review: s.last_review }, log: d };
    return a && typeof a == "function" ? a(o) : o;
  }
  reschedule(t, e = [], i = {}) {
    const { recordLogHandler: a, reviewsOrderBy: s, skipManual: n = true, now: d = /* @__PURE__ */ new Date(), update_memory_state: o = false } = i;
    s && typeof s == "function" && e.sort(s), n && (e = e.filter((x) => x.rating !== l.Manual));
    const c = new Q(this), f = c.reschedule(i.first_card || w(), e), y = f.length, v = h.card(t), m = c.calculateManualRecord(v, d, y ? f[y - 1] : void 0, o);
    return a && typeof a == "function" ? { collections: f.map(a), reschedule_item: m ? a(m) : null } : { collections: f, reschedule_item: m };
  }
};
var W = (r) => new O(r || {});

// ../data/flashcard.ts
function parse(text) {
  const start = /* @__PURE__ */ new Date();
  const array1 = [...text.matchAll(/(.*)::(.*)/g)];
  var regex = new RegExp("^(.+)\\n\\?\\n((?:(?:\\n|.+).+)+)", "gm");
  const array2 = [...text.matchAll(regex)];
  const array = array1.concat(array2);
  var data = {};
  for (let j2 = 0; j2 < array.length; j2++) {
    var idBase64 = btoa(array[j2][1] + array[j2][2]);
    data[idBase64] = {};
    data[idBase64]["front"] = array[j2][1];
    data[idBase64]["back"] = array[j2][2];
  }
  console.log("time parse: " + ((/* @__PURE__ */ new Date()).getTime() - start.getTime()));
  return data;
}
async function createDeck(page) {
  var text = await space_exports.readPage(page);
  var QA = parse(text);
  var qa_keys = Object.keys(QA);
  var deck = await datastore_exports.get("p_flashcards_" + page);
  var now = /* @__PURE__ */ new Date();
  const f = W();
  if (deck == void 0) {
    var deck = {};
    deck["cards"] = {};
    deck.lastModified = now.getTime();
    qa_keys.forEach((k2) => {
      let scheduling = w();
      deck["cards"][k2] = {};
      deck["cards"][k2]["front"] = QA[k2]["front"];
      deck["cards"][k2]["back"] = QA[k2]["back"];
      deck["cards"][k2]["scheduling"] = scheduling;
    });
    await datastore_exports.set("p_flashcards_" + page, deck);
  } else {
    var info = await space_exports.getPageMeta(page);
    var pageLastModified = new Date(info["lastModified"]);
    if (pageLastModified.getTime() > deck.lastModified) {
      console.log("deck check is less recent");
      var deck_keys = Object.keys(deck["cards"]);
      qa_keys.forEach((k2) => {
        if (!deck_keys.includes(k2)) {
          let scheduling = w();
          deck["cards"][k2] = {};
          deck["cards"][k2]["front"] = QA[k2]["front"];
          deck["cards"][k2]["back"] = QA[k2]["back"];
          deck["cards"][k2]["scheduling"] = scheduling;
        }
      });
      deck_keys.forEach((k2) => {
        if (!qa_keys.includes(k2)) {
          delete deck["cards"][k2];
        }
      });
      deck.lastModified = now.getTime();
      await datastore_exports.set("p_flashcards_" + page, deck);
    }
  }
  return deck;
}
async function updateDeck(page, card) {
  var text = await space_exports.readPage(page);
}
async function generateDecks() {
  const result = await system_exports.invokeFunction("index.queryObjects", "flashcards", "page");
  var decksQA = {};
  for (let i = 0; i < result.length; i++) {
    var page = result[i]["name"];
    decksQA[page] = await createDeck(page);
  }
  return decksQA;
}
function generateDueCards(page, decks) {
  var cards = decks[page]["cards"];
  var cards_keys = Object.keys(cards);
  var dueCards = {};
  const now = (/* @__PURE__ */ new Date()).getTime();
  cards_keys.forEach((k2) => {
    var cardDueDate = new Date(cards[k2]["scheduling"]["due"]);
    if (cardDueDate.getTime() < now) {
      dueCards[k2] = cards[k2];
    }
  });
  return dueCards;
}
async function showDecks() {
  console.log("start showDecks()");
  const start = /* @__PURE__ */ new Date();
  const decks = await generateDecks();
  const decks_keys = Object.keys(decks);
  var decksHtml = await asset_exports.readAsset("flashcard", "assets/decks.html");
  const decksJS = await asset_exports.readAsset("flashcard", "assets/decks.js");
  for (let k2 = 0; k2 < decks_keys.length; k2++) {
    var page = decks_keys[k2];
    var cardsCount = Object.keys(decks[page]["cards"]).length;
    var dueCards = generateDueCards(page, decks);
    var dueCardsCount = Object.keys(dueCards).length;
    decksHtml += `<button type="button" onclick="syscall('system.invokeFunction','flashcard.showCards','` + page + `');">` + page + "</button> (due: " + dueCardsCount + ", total: " + cardsCount + "cards)<br><br>";
  }
  console.log("time showDecks: " + ((/* @__PURE__ */ new Date()).getTime() - start.getTime()));
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
async function testFlashcards() {
  console.log("start testFlashcards()");
  var decks = await generateDecks();
  console.log(decks);
}

// 44468fa8058e06d8.js
var functionMapping = {
  testCard: testFlashcards,
  updateDeck,
  createDeck,
  showCards,
  showDecks
};
var manifest = {
  "name": "flashcard",
  "assets": {
    "assets/cards.html": {
      "data": "data:text/html;base64,PGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uY2xpY2s9InN5c2NhbGwoJ2VkaXRvci5oaWRlUGFuZWwnLCAnbW9kYWwnKSIgc3R5bGU9InBvc2l0aW9uOmFic29sdXRlOyB0b3A6MDsgcmlnaHQ6MDsiIHRpdGxlPSJDbG9zZSI+WDwvYnV0dG9uPgo8ZGl2IGlkPSJjb3VudCIgc3R5bGU9InBvc2l0aW9uOmFic29sdXRlOyB0b3A6MDsgbGVmdDowOyI+MS8yPC9kaXY+Cjxicj4KPGRpdiBzdHlsZT0ndGV4dC1hbGlnbjogY2VudGVyOyc+CjxkaXYgaWQ9InF1ZXN0aW9uIiBvbmNsaWNrPSJkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VwYXJhdG9yJykuc3R5bGUudmlzaWJpbGl0eT0ndmlzaWJsZSc7ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcicpLnN0eWxlLnZpc2liaWxpdHk9J3Zpc2libGUnIj48L2Rpdj4KPGRpdiBpZD0ic2VwYXJhdG9yIiBzdHlsZT0idmlzaWJpbGl0eTogaGlkZGVuIj48aHI+PC9kaXY+CjxkaXYgaWQ9ImFuc3dlciIgc3R5bGU9InZpc2liaWxpdHk6IGhpZGRlbiI+PC9kaXY+Cgo8YnI+PGJyPgogIDxidXR0b24gdHlwZT0iYnV0dG9uIiBpZD0icHJldmlvdXMiPlByZXZpb3VzPC9idXR0b24+CiAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGlkPSJuZXh0Ij5OZXh0PC9idXR0b24+CjwvZGl2Pgo=",
      "mtime": 1732722302960
    },
    "assets/decks.html": {
      "data": "data:text/html;base64,PGRpdj4KICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgb25jbGljaz0ic3lzY2FsbCgnZWRpdG9yLmhpZGVQYW5lbCcsICdtb2RhbCcpIiBzdHlsZT0icG9zaXRpb246YWJzb2x1dGU7IHRvcDowOyByaWdodDowOyIgdGl0bGU9IkNsb3NlIj5YPC9idXR0b24+Cg==",
      "mtime": 1732722302962
    },
    "assets/decks.js": {
      "data": "data:application/javascript;base64,Cg==",
      "mtime": 1732722302963
    },
    "assets/cards.js": {
      "data": "data:application/javascript;base64,CnZhciBxdWVzdGlvbmNvdW50ID0gMDsKCmNvbnN0IG5leHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgibmV4dCIpOwpjb25zdCBwcmV2aW91cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCJwcmV2aW91cyIpCmNvbnN0IGNvdW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoImNvdW50Iik7Ci8vY29uc3QgcXVlc3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgicXVlc3Rpb24iKTsKLy9jb25zdCBhbnN3ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgiYW5zd2VyIik7CgoKCgoKZnVuY3Rpb24gZ2VuZXJhdGVEdWVDYXJkcyhkZWNrKSB7CiAgdmFyIGNhcmRzID0gZGVja1snY2FyZHMnXQogIHZhciBjYXJkc19rZXlzID0gT2JqZWN0LmtleXMoY2FyZHMpOwogIHZhciBkdWVDYXJkcyA9IHt9CiAgY29uc3Qgbm93ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKQogIGNhcmRzX2tleXMuZm9yRWFjaCgoaykgPT4gewogICAgdmFyIGNhcmREdWVEYXRlID0gbmV3IERhdGUoY2FyZHNba11bJ3NjaGVkdWxpbmcnXVsnZHVlJ10pCiAgICBpZiggY2FyZER1ZURhdGUuZ2V0VGltZSgpIDwgbm93ICl7CiAgICAgIGR1ZUNhcmRzW2tdID0gY2FyZHNba107CiAgICB9CiAgfSk7CiAgcmV0dXJuIGR1ZUNhcmRzCn0KCgoKCgpjb25zdCBkZWNrID0gc3lzY2FsbCgic3lzdGVtLmludm9rZUZ1bmN0aW9uIiwgImZsYXNoY2FyZC5jcmVhdGVEZWNrIiwgcGFnZSk7CmRlY2sudGhlbigoZCkgID0+IHsKICB2YXIgZHVlQ2FyZHMgPSBnZW5lcmF0ZUR1ZUNhcmRzKGQpCiAgdmFyIGR1ZUNhcmRzX2tleXMgPSBPYmplY3Qua2V5cyhkdWVDYXJkcyk7CgogIGNvdW50LnRleHRDb250ZW50ID0gKHF1ZXN0aW9uY291bnQgKyAxICkgKyAiLyIgKyBkdWVDYXJkc19rZXlzLmxlbmd0aDsKCiAgcXVlc3Rpb24udGV4dENvbnRlbnQgPSBkdWVDYXJkc1tkdWVDYXJkc19rZXlzW3F1ZXN0aW9uY291bnRdXVsnZnJvbnQnXTsKICBhbnN3ZXIudGV4dENvbnRlbnQgPSBkdWVDYXJkc1tkdWVDYXJkc19rZXlzW3F1ZXN0aW9uY291bnRdXVsnYmFjayddOwoKZnVuY3Rpb24gdXBkYXRlQ2FyZHMoYWN0aW9uKSB7CiAgaWYoYWN0aW9uID09ICJwcmV2aW91cyIgKSB7cXVlc3Rpb25jb3VudCAtPTE7fTsKICBpZihhY3Rpb24gPT0gIm5leHQiICkge3F1ZXN0aW9uY291bnQgKz0xO307CiAgICAKICBpZihxdWVzdGlvbmNvdW50ID49IDAgJiYgcXVlc3Rpb25jb3VudCA8IGR1ZUNhcmRzX2tleXMubGVuZ3RoKSB7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcicpLnN0eWxlLnZpc2liaWxpdHk9J2hpZGRlbic7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlcGFyYXRvcicpLnN0eWxlLnZpc2liaWxpdHk9J2hpZGRlbic7CiAgCiAgY291bnQudGV4dENvbnRlbnQgPSAocXVlc3Rpb25jb3VudCArIDEgKSArICIvIiArIGR1ZUNhcmRzX2tleXMubGVuZ3RoOwogIHF1ZXN0aW9uLnRleHRDb250ZW50ID0gZHVlQ2FyZHNbZHVlQ2FyZHNfa2V5c1txdWVzdGlvbmNvdW50XV1bJ2Zyb250J107CiAgYW5zd2VyLnRleHRDb250ZW50ID0gZHVlQ2FyZHNbZHVlQ2FyZHNfa2V5c1txdWVzdGlvbmNvdW50XV1bJ2JhY2snXTsKICB9CiAgCiAgaWYocXVlc3Rpb25jb3VudCA8IDApIHtxdWVzdGlvbmNvdW50ID0gMH07CiAgaWYocXVlc3Rpb25jb3VudCA+PSBkdWVDYXJkc19rZXlzLmxlbmd0aCkge3F1ZXN0aW9uY291bnQgPSBkdWVDYXJkc19rZXlzLmxlbmd0aCAtIDF9Owp9CgpuZXh0LmFkZEV2ZW50TGlzdGVuZXIoImNsaWNrIiwgKCkgPT4geyB1cGRhdGVDYXJkcygnbmV4dCcpIH0pOwpwcmV2aW91cy5hZGRFdmVudExpc3RlbmVyKCJjbGljayIsICgpID0+IHsgdXBkYXRlQ2FyZHMoJ3ByZXZpb3VzJykgfSk7Cgp9KTsKCgo=",
      "mtime": 1732722302964
    }
  },
  "functions": {
    "testCard": {
      "path": "flashcard.ts:testFlashcards",
      "command": {
        "name": "FlashcardsTest"
      }
    },
    "updateDeck": {
      "path": "flashcard.ts:updateDeck"
    },
    "createDeck": {
      "path": "flashcard.ts:createDeck"
    },
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
setupMessageListener(functionMapping, manifest, self.postMessage);
export {
  plug
};
//# sourceMappingURL=flashcard.plug.js.map
