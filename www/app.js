(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@capacitor/core/dist/index.js
  var ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp, SystemBarsStyle, SystemBarType, SystemBarsPluginWeb, SystemBars;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins = cap.Plugins = cap.Plugins || {};
        const getPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const isNativePlatform = () => getPlatform() !== "web";
        const isPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const getPluginHeader = (pluginName) => {
          var _a;
          return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
        };
        const handleError = (err) => win.console.error(err);
        const registeredPlugins = /* @__PURE__ */ new Map();
        const registerPlugin2 = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
              }
            } else if (impl) {
              return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve2) => call.then(() => resolve2({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
          });
          return proxy;
        };
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      WebPlugin = class {
        constructor() {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          var _a;
          return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          if (index !== -1) {
            this.listeners[eventName].splice(index, 1);
          }
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve2, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve2(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
      (function(SystemBarsStyle2) {
        SystemBarsStyle2["Dark"] = "DARK";
        SystemBarsStyle2["Light"] = "LIGHT";
        SystemBarsStyle2["Default"] = "DEFAULT";
      })(SystemBarsStyle || (SystemBarsStyle = {}));
      (function(SystemBarType2) {
        SystemBarType2["StatusBar"] = "StatusBar";
        SystemBarType2["NavigationBar"] = "NavigationBar";
      })(SystemBarType || (SystemBarType = {}));
      SystemBarsPluginWeb = class extends WebPlugin {
        async setStyle() {
          this.unavailable("not available for web");
        }
        async setAnimation() {
          this.unavailable("not available for web");
        }
        async show() {
          this.unavailable("not available for web");
        }
        async hide() {
          this.unavailable("not available for web");
        }
      };
      SystemBars = registerPlugin("SystemBars", {
        web: () => new SystemBarsPluginWeb()
      });
    }
  });

  // node_modules/@capacitor/filesystem/dist/esm/definitions.js
  var Directory, Encoding;
  var init_definitions = __esm({
    "node_modules/@capacitor/filesystem/dist/esm/definitions.js"() {
      (function(Directory2) {
        Directory2["Documents"] = "DOCUMENTS";
        Directory2["Data"] = "DATA";
        Directory2["Library"] = "LIBRARY";
        Directory2["Cache"] = "CACHE";
        Directory2["External"] = "EXTERNAL";
        Directory2["ExternalStorage"] = "EXTERNAL_STORAGE";
        Directory2["ExternalCache"] = "EXTERNAL_CACHE";
        Directory2["LibraryNoCloud"] = "LIBRARY_NO_CLOUD";
        Directory2["Temporary"] = "TEMPORARY";
      })(Directory || (Directory = {}));
      (function(Encoding2) {
        Encoding2["UTF8"] = "utf8";
        Encoding2["ASCII"] = "ascii";
        Encoding2["UTF16"] = "utf16";
      })(Encoding || (Encoding = {}));
    }
  });

  // node_modules/@capacitor/filesystem/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    FilesystemWeb: () => FilesystemWeb
  });
  function resolve(path) {
    const posix = path.split("/").filter((item) => item !== ".");
    const newPosix = [];
    posix.forEach((item) => {
      if (item === ".." && newPosix.length > 0 && newPosix[newPosix.length - 1] !== "..") {
        newPosix.pop();
      } else {
        newPosix.push(item);
      }
    });
    return newPosix.join("/");
  }
  function isPathParent(parent, children) {
    parent = resolve(parent);
    children = resolve(children);
    const pathsA = parent.split("/");
    const pathsB = children.split("/");
    return parent !== children && pathsA.every((value, index) => value === pathsB[index]);
  }
  var FilesystemWeb;
  var init_web = __esm({
    "node_modules/@capacitor/filesystem/dist/esm/web.js"() {
      init_dist();
      init_definitions();
      FilesystemWeb = class _FilesystemWeb extends WebPlugin {
        constructor() {
          super(...arguments);
          this.DB_VERSION = 1;
          this.DB_NAME = "Disc";
          this._writeCmds = ["add", "put", "delete"];
          this.downloadFile = async (options) => {
            var _a, _b;
            const requestInit = buildRequestInit(options, options.webFetchExtra);
            const response = await fetch(options.url, requestInit);
            let blob;
            if (!options.progress)
              blob = await response.blob();
            else if (!(response === null || response === void 0 ? void 0 : response.body))
              blob = new Blob();
            else {
              const reader = response.body.getReader();
              let bytes = 0;
              const chunks = [];
              const contentType = response.headers.get("content-type");
              const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
              while (true) {
                const { done, value } = await reader.read();
                if (done)
                  break;
                chunks.push(value);
                bytes += (value === null || value === void 0 ? void 0 : value.length) || 0;
                const status = {
                  url: options.url,
                  bytes,
                  contentLength
                };
                this.notifyListeners("progress", status);
              }
              const allChunks = new Uint8Array(bytes);
              let position = 0;
              for (const chunk of chunks) {
                if (typeof chunk === "undefined")
                  continue;
                allChunks.set(chunk, position);
                position += chunk.length;
              }
              blob = new Blob([allChunks.buffer], { type: contentType || void 0 });
            }
            const result = await this.writeFile({
              path: options.path,
              directory: (_a = options.directory) !== null && _a !== void 0 ? _a : void 0,
              recursive: (_b = options.recursive) !== null && _b !== void 0 ? _b : false,
              data: blob
            });
            return { path: result.uri, blob };
          };
        }
        readFileInChunks(_options, _callback) {
          throw this.unavailable("Method not implemented.");
        }
        async initDb() {
          if (this._db !== void 0) {
            return this._db;
          }
          if (!("indexedDB" in window)) {
            throw this.unavailable("This browser doesn't support IndexedDB");
          }
          return new Promise((resolve2, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onupgradeneeded = _FilesystemWeb.doUpgrade;
            request.onsuccess = () => {
              this._db = request.result;
              resolve2(request.result);
            };
            request.onerror = () => reject(request.error);
            request.onblocked = () => {
              console.warn("db blocked");
            };
          });
        }
        static doUpgrade(event) {
          const eventTarget = event.target;
          const db = eventTarget.result;
          switch (event.oldVersion) {
            case 0:
            case 1:
            default: {
              if (db.objectStoreNames.contains("FileStorage")) {
                db.deleteObjectStore("FileStorage");
              }
              const store = db.createObjectStore("FileStorage", { keyPath: "path" });
              store.createIndex("by_folder", "folder");
            }
          }
        }
        async dbRequest(cmd, args) {
          const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
          return this.initDb().then((conn) => {
            return new Promise((resolve2, reject) => {
              const tx = conn.transaction(["FileStorage"], readFlag);
              const store = tx.objectStore("FileStorage");
              const req = store[cmd](...args);
              req.onsuccess = () => resolve2(req.result);
              req.onerror = () => reject(req.error);
            });
          });
        }
        async dbIndexRequest(indexName, cmd, args) {
          const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
          return this.initDb().then((conn) => {
            return new Promise((resolve2, reject) => {
              const tx = conn.transaction(["FileStorage"], readFlag);
              const store = tx.objectStore("FileStorage");
              const index = store.index(indexName);
              const req = index[cmd](...args);
              req.onsuccess = () => resolve2(req.result);
              req.onerror = () => reject(req.error);
            });
          });
        }
        getPath(directory, uriPath) {
          const cleanedUriPath = uriPath !== void 0 ? uriPath.replace(/^[/]+|[/]+$/g, "") : "";
          let fsPath = "";
          if (directory !== void 0)
            fsPath += "/" + directory;
          if (uriPath !== "")
            fsPath += "/" + cleanedUriPath;
          return fsPath;
        }
        async clear() {
          const conn = await this.initDb();
          const tx = conn.transaction(["FileStorage"], "readwrite");
          const store = tx.objectStore("FileStorage");
          store.clear();
        }
        /**
         * Read a file from disk
         * @param options options for the file read
         * @return a promise that resolves with the read file data result
         */
        async readFile(options) {
          const path = this.getPath(options.directory, options.path);
          const entry = await this.dbRequest("get", [path]);
          if (entry === void 0)
            throw Error("File does not exist.");
          return { data: entry.content ? entry.content : "" };
        }
        /**
         * Write a file to disk in the specified location on device
         * @param options options for the file write
         * @return a promise that resolves with the file write result
         */
        async writeFile(options) {
          const path = this.getPath(options.directory, options.path);
          let data = options.data;
          const encoding = options.encoding;
          const doRecursive = options.recursive;
          const occupiedEntry = await this.dbRequest("get", [path]);
          if (occupiedEntry && occupiedEntry.type === "directory")
            throw Error("The supplied path is a directory.");
          const parentPath = path.substr(0, path.lastIndexOf("/"));
          const parentEntry = await this.dbRequest("get", [parentPath]);
          if (parentEntry === void 0) {
            const subDirIndex = parentPath.indexOf("/", 1);
            if (subDirIndex !== -1) {
              const parentArgPath = parentPath.substr(subDirIndex);
              await this.mkdir({
                path: parentArgPath,
                directory: options.directory,
                recursive: doRecursive
              });
            }
          }
          if (!encoding && !(data instanceof Blob)) {
            data = data.indexOf(",") >= 0 ? data.split(",")[1] : data;
            if (!this.isBase64String(data))
              throw Error("The supplied data is not valid base64 content.");
          }
          const now = Date.now();
          const pathObj = {
            path,
            folder: parentPath,
            type: "file",
            size: data instanceof Blob ? data.size : data.length,
            ctime: now,
            mtime: now,
            content: data
          };
          await this.dbRequest("put", [pathObj]);
          return {
            uri: pathObj.path
          };
        }
        /**
         * Append to a file on disk in the specified location on device
         * @param options options for the file append
         * @return a promise that resolves with the file write result
         */
        async appendFile(options) {
          const path = this.getPath(options.directory, options.path);
          let data = options.data;
          const encoding = options.encoding;
          const parentPath = path.substr(0, path.lastIndexOf("/"));
          const now = Date.now();
          let ctime = now;
          const occupiedEntry = await this.dbRequest("get", [path]);
          if (occupiedEntry && occupiedEntry.type === "directory")
            throw Error("The supplied path is a directory.");
          const parentEntry = await this.dbRequest("get", [parentPath]);
          if (parentEntry === void 0) {
            const subDirIndex = parentPath.indexOf("/", 1);
            if (subDirIndex !== -1) {
              const parentArgPath = parentPath.substr(subDirIndex);
              await this.mkdir({
                path: parentArgPath,
                directory: options.directory,
                recursive: true
              });
            }
          }
          if (!encoding && !this.isBase64String(data))
            throw Error("The supplied data is not valid base64 content.");
          if (occupiedEntry !== void 0) {
            if (occupiedEntry.content instanceof Blob) {
              throw Error("The occupied entry contains a Blob object which cannot be appended to.");
            }
            if (occupiedEntry.content !== void 0 && !encoding) {
              data = btoa(atob(occupiedEntry.content) + atob(data));
            } else {
              data = occupiedEntry.content + data;
            }
            ctime = occupiedEntry.ctime;
          }
          const pathObj = {
            path,
            folder: parentPath,
            type: "file",
            size: data.length,
            ctime,
            mtime: now,
            content: data
          };
          await this.dbRequest("put", [pathObj]);
        }
        /**
         * Delete a file from disk
         * @param options options for the file delete
         * @return a promise that resolves with the deleted file data result
         */
        async deleteFile(options) {
          const path = this.getPath(options.directory, options.path);
          const entry = await this.dbRequest("get", [path]);
          if (entry === void 0)
            throw Error("File does not exist.");
          const entries = await this.dbIndexRequest("by_folder", "getAllKeys", [IDBKeyRange.only(path)]);
          if (entries.length !== 0)
            throw Error("Folder is not empty.");
          await this.dbRequest("delete", [path]);
        }
        /**
         * Create a directory.
         * @param options options for the mkdir
         * @return a promise that resolves with the mkdir result
         */
        async mkdir(options) {
          const path = this.getPath(options.directory, options.path);
          const doRecursive = options.recursive;
          const parentPath = path.substr(0, path.lastIndexOf("/"));
          const depth = (path.match(/\//g) || []).length;
          const parentEntry = await this.dbRequest("get", [parentPath]);
          const occupiedEntry = await this.dbRequest("get", [path]);
          if (depth === 1)
            throw Error("Cannot create Root directory");
          if (occupiedEntry !== void 0)
            throw Error("Current directory does already exist.");
          if (!doRecursive && depth !== 2 && parentEntry === void 0)
            throw Error("Parent directory must exist");
          if (doRecursive && depth !== 2 && parentEntry === void 0) {
            const parentArgPath = parentPath.substr(parentPath.indexOf("/", 1));
            await this.mkdir({
              path: parentArgPath,
              directory: options.directory,
              recursive: doRecursive
            });
          }
          const now = Date.now();
          const pathObj = {
            path,
            folder: parentPath,
            type: "directory",
            size: 0,
            ctime: now,
            mtime: now
          };
          await this.dbRequest("put", [pathObj]);
        }
        /**
         * Remove a directory
         * @param options the options for the directory remove
         */
        async rmdir(options) {
          const { path, directory, recursive } = options;
          const fullPath = this.getPath(directory, path);
          const entry = await this.dbRequest("get", [fullPath]);
          if (entry === void 0)
            throw Error("Folder does not exist.");
          if (entry.type !== "directory")
            throw Error("Requested path is not a directory");
          const readDirResult = await this.readdir({ path, directory });
          if (readDirResult.files.length !== 0 && !recursive)
            throw Error("Folder is not empty");
          for (const entry2 of readDirResult.files) {
            const entryPath = `${path}/${entry2.name}`;
            const entryObj = await this.stat({ path: entryPath, directory });
            if (entryObj.type === "file") {
              await this.deleteFile({ path: entryPath, directory });
            } else {
              await this.rmdir({ path: entryPath, directory, recursive });
            }
          }
          await this.dbRequest("delete", [fullPath]);
        }
        /**
         * Return a list of files from the directory (not recursive)
         * @param options the options for the readdir operation
         * @return a promise that resolves with the readdir directory listing result
         */
        async readdir(options) {
          const path = this.getPath(options.directory, options.path);
          const entry = await this.dbRequest("get", [path]);
          if (options.path !== "" && entry === void 0)
            throw Error("Folder does not exist.");
          const entries = await this.dbIndexRequest("by_folder", "getAllKeys", [IDBKeyRange.only(path)]);
          const files = await Promise.all(entries.map(async (e) => {
            let subEntry = await this.dbRequest("get", [e]);
            if (subEntry === void 0) {
              subEntry = await this.dbRequest("get", [e + "/"]);
            }
            return {
              name: e.substring(path.length + 1),
              type: subEntry.type,
              size: subEntry.size,
              ctime: subEntry.ctime,
              mtime: subEntry.mtime,
              uri: subEntry.path
            };
          }));
          return { files };
        }
        /**
         * Return full File URI for a path and directory
         * @param options the options for the stat operation
         * @return a promise that resolves with the file stat result
         */
        async getUri(options) {
          const path = this.getPath(options.directory, options.path);
          let entry = await this.dbRequest("get", [path]);
          if (entry === void 0) {
            entry = await this.dbRequest("get", [path + "/"]);
          }
          return {
            uri: (entry === null || entry === void 0 ? void 0 : entry.path) || path
          };
        }
        /**
         * Return data about a file
         * @param options the options for the stat operation
         * @return a promise that resolves with the file stat result
         */
        async stat(options) {
          const path = this.getPath(options.directory, options.path);
          let entry = await this.dbRequest("get", [path]);
          if (entry === void 0) {
            entry = await this.dbRequest("get", [path + "/"]);
          }
          if (entry === void 0)
            throw Error("Entry does not exist.");
          return {
            name: entry.path.substring(path.length + 1),
            type: entry.type,
            size: entry.size,
            ctime: entry.ctime,
            mtime: entry.mtime,
            uri: entry.path
          };
        }
        /**
         * Rename a file or directory
         * @param options the options for the rename operation
         * @return a promise that resolves with the rename result
         */
        async rename(options) {
          await this._copy(options, true);
          return;
        }
        /**
         * Copy a file or directory
         * @param options the options for the copy operation
         * @return a promise that resolves with the copy result
         */
        async copy(options) {
          return this._copy(options, false);
        }
        async requestPermissions() {
          return { publicStorage: "granted" };
        }
        async checkPermissions() {
          return { publicStorage: "granted" };
        }
        /**
         * Function that can perform a copy or a rename
         * @param options the options for the rename operation
         * @param doRename whether to perform a rename or copy operation
         * @return a promise that resolves with the result
         */
        async _copy(options, doRename = false) {
          let { toDirectory } = options;
          const { to, from, directory: fromDirectory } = options;
          if (!to || !from) {
            throw Error("Both to and from must be provided");
          }
          if (!toDirectory) {
            toDirectory = fromDirectory;
          }
          const fromPath = this.getPath(fromDirectory, from);
          const toPath = this.getPath(toDirectory, to);
          if (fromPath === toPath) {
            return {
              uri: toPath
            };
          }
          if (isPathParent(fromPath, toPath)) {
            throw Error("To path cannot contain the from path");
          }
          let toObj;
          try {
            toObj = await this.stat({
              path: to,
              directory: toDirectory
            });
          } catch (e) {
            const toPathComponents = to.split("/");
            toPathComponents.pop();
            const toPath2 = toPathComponents.join("/");
            if (toPathComponents.length > 0) {
              const toParentDirectory = await this.stat({
                path: toPath2,
                directory: toDirectory
              });
              if (toParentDirectory.type !== "directory") {
                throw new Error("Parent directory of the to path is a file");
              }
            }
          }
          if (toObj && toObj.type === "directory") {
            throw new Error("Cannot overwrite a directory with a file");
          }
          const fromObj = await this.stat({
            path: from,
            directory: fromDirectory
          });
          const updateTime = async (path, ctime2, mtime) => {
            const fullPath = this.getPath(toDirectory, path);
            const entry = await this.dbRequest("get", [fullPath]);
            entry.ctime = ctime2;
            entry.mtime = mtime;
            await this.dbRequest("put", [entry]);
          };
          const ctime = fromObj.ctime ? fromObj.ctime : Date.now();
          switch (fromObj.type) {
            // The "from" object is a file
            case "file": {
              const file = await this.readFile({
                path: from,
                directory: fromDirectory
              });
              if (doRename) {
                await this.deleteFile({
                  path: from,
                  directory: fromDirectory
                });
              }
              let encoding;
              if (!(file.data instanceof Blob) && !this.isBase64String(file.data)) {
                encoding = Encoding.UTF8;
              }
              const writeResult = await this.writeFile({
                path: to,
                directory: toDirectory,
                data: file.data,
                encoding
              });
              if (doRename) {
                await updateTime(to, ctime, fromObj.mtime);
              }
              return writeResult;
            }
            case "directory": {
              if (toObj) {
                throw Error("Cannot move a directory over an existing object");
              }
              try {
                await this.mkdir({
                  path: to,
                  directory: toDirectory,
                  recursive: false
                });
                if (doRename) {
                  await updateTime(to, ctime, fromObj.mtime);
                }
              } catch (e) {
              }
              const contents = (await this.readdir({
                path: from,
                directory: fromDirectory
              })).files;
              for (const filename of contents) {
                await this._copy({
                  from: `${from}/${filename.name}`,
                  to: `${to}/${filename.name}`,
                  directory: fromDirectory,
                  toDirectory
                }, doRename);
              }
              if (doRename) {
                await this.rmdir({
                  path: from,
                  directory: fromDirectory
                });
              }
            }
          }
          return {
            uri: toPath
          };
        }
        isBase64String(str) {
          try {
            return btoa(atob(str)) == str;
          } catch (err) {
            return false;
          }
        }
      };
      FilesystemWeb._debug = true;
    }
  });

  // node_modules/@capacitor/share/dist/esm/web.js
  var web_exports2 = {};
  __export(web_exports2, {
    ShareWeb: () => ShareWeb
  });
  var ShareWeb;
  var init_web2 = __esm({
    "node_modules/@capacitor/share/dist/esm/web.js"() {
      init_dist();
      ShareWeb = class extends WebPlugin {
        async canShare() {
          if (typeof navigator === "undefined" || !navigator.share) {
            return { value: false };
          } else {
            return { value: true };
          }
        }
        async share(options) {
          if (typeof navigator === "undefined" || !navigator.share) {
            throw this.unavailable("Share API not available in this browser");
          }
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url
          });
          return {};
        }
      };
    }
  });

  // node_modules/@capacitor/filesystem/dist/esm/index.js
  init_dist();

  // node_modules/@capacitor/synapse/dist/synapse.mjs
  function s(t) {
    t.CapacitorUtils.Synapse = new Proxy(
      {},
      {
        get(e, n) {
          return new Proxy({}, {
            get(w, o) {
              return (c, p, r) => {
                const i = t.Capacitor.Plugins[n];
                if (i === void 0) {
                  r(new Error(`Capacitor plugin ${n} not found`));
                  return;
                }
                if (typeof i[o] != "function") {
                  r(new Error(`Method ${o} not found in Capacitor plugin ${n}`));
                  return;
                }
                (async () => {
                  try {
                    const a = await i[o](c);
                    p(a);
                  } catch (a) {
                    r(a);
                  }
                })();
              };
            }
          });
        }
      }
    );
  }
  function u(t) {
    t.CapacitorUtils.Synapse = new Proxy(
      {},
      {
        get(e, n) {
          return t.cordova.plugins[n];
        }
      }
    );
  }
  function f(t = false) {
    typeof window > "u" || (window.CapacitorUtils = window.CapacitorUtils || {}, window.Capacitor !== void 0 && !t ? s(window) : window.cordova !== void 0 && u(window));
  }

  // node_modules/@capacitor/filesystem/dist/esm/index.js
  init_definitions();
  var Filesystem = registerPlugin("Filesystem", {
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.FilesystemWeb())
  });
  f();

  // node_modules/@capacitor/share/dist/esm/index.js
  init_dist();
  var Share = registerPlugin("Share", {
    web: () => Promise.resolve().then(() => (init_web2(), web_exports2)).then((m) => new m.ShareWeb())
  });

  // src/app.js
  var CATALOGO_INICIAL = [
    { name: "Papas", image: "\u{1F954}", unit: "kg", price: 900 },
    { name: "Tomates", image: "\u{1F345}", unit: "kg", price: 1200 },
    { name: "Lechuga", image: "\u{1F96C}", unit: "unidad", price: 700 },
    { name: "Paltas", image: "\u{1F951}", unit: "kg", price: 2500 },
    { name: "Cebolla", image: "\u{1F9C5}", unit: "kg", price: 800 },
    { name: "Zanahoria", image: "\u{1F955}", unit: "kg", price: 700 },
    { name: "Pl\xE1tano", image: "\u{1F34C}", unit: "kg", price: 1e3 },
    { name: "Manzana", image: "\u{1F34E}", unit: "kg", price: 1400 },
    { name: "Naranja", image: "\u{1F34A}", unit: "kg", price: 1100 },
    { name: "Lim\xF3n", image: "\u{1F34B}", unit: "kg", price: 1600 },
    { name: "Ajo", image: "\u{1F9C4}", unit: "kg", price: 3500 },
    { name: "Choclo", image: "\u{1F33D}", unit: "unidad", price: 500 },
    { name: "Pimiento", image: "\u{1FAD1}", unit: "kg", price: 1800 },
    { name: "Pepino", image: "\u{1F952}", unit: "kg", price: 900 },
    { name: "Uva", image: "\u{1F347}", unit: "kg", price: 2200 },
    { name: "Pera", image: "\u{1F350}", unit: "kg", price: 1500 },
    { name: "Sand\xEDa", image: "\u{1F349}", unit: "unidad", price: 3500 },
    { name: "Frutilla", image: "\u{1F353}", unit: "kg", price: 2800 },
    { name: "Zapallo", image: "\u{1F383}", unit: "kg", price: 700 },
    { name: "Espinaca", image: "\u{1F96C}", unit: "unidad", price: 600 }
  ];
  function cargarDeStorage(clave, valorPorDefecto) {
    try {
      const raw = localStorage.getItem(clave);
      return raw ? JSON.parse(raw) : valorPorDefecto;
    } catch (e) {
      return valorPorDefecto;
    }
  }
  function guardarEnStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }
  var productos = cargarDeStorage("productos", null);
  if (!productos) {
    productos = CATALOGO_INICIAL.map((p, i) => ({ id: i + 1, ...p }));
    guardarEnStorage("productos", productos);
  }
  var nextProductoId = Math.max(0, ...productos.map((p) => p.id)) + 1;
  var ventas = cargarDeStorage("ventas", []);
  var nextVentaId = Math.max(0, ...ventas.map((v) => v.id)) + 1;
  var BANCO_ICONOS = [
    // Frutas, verduras y aliños (banco original)
    ["Papas", "\u{1F954}"],
    ["Camote", "\u{1F360}"],
    ["Tomate", "\u{1F345}"],
    ["Tomate cherry", "\u{1F345}"],
    ["Lechuga", "\u{1F96C}"],
    ["Repollo", "\u{1F96C}"],
    ["Espinaca", "\u{1F96C}"],
    ["Acelga", "\u{1F96C}"],
    ["Kale", "\u{1F96C}"],
    ["Palta", "\u{1F951}"],
    ["Cebolla", "\u{1F9C5}"],
    ["Ceboll\xEDn", "\u{1F9C5}"],
    ["Puerro", "\u{1F9C5}"],
    ["Ajo", "\u{1F9C4}"],
    ["Zanahoria", "\u{1F955}"],
    ["Betarraga", "\u{1F955}"],
    ["Rabanito", "\u{1F955}"],
    ["Pepino", "\u{1F952}"],
    ["Zapallo", "\u{1F383}"],
    ["Zapallo italiano", "\u{1F952}"],
    ["Choclo", "\u{1F33D}"],
    ["Pimiento", "\u{1FAD1}"],
    ["Aj\xED", "\u{1F336}\uFE0F"],
    ["Aj\xED cacho de cabra", "\u{1F336}\uFE0F"],
    ["Br\xF3coli", "\u{1F966}"],
    ["Coliflor", "\u{1F966}"],
    ["Apio", "\u{1F96C}"],
    ["Poroto verde", "\u{1FADB}"],
    ["Arveja", "\u{1FADB}"],
    ["Habas", "\u{1FAD8}"],
    ["Berenjena", "\u{1F346}"],
    ["Alcachofa", "\u{1F33F}"],
    ["Champi\xF1\xF3n", "\u{1F344}"],
    ["Hongo ostra", "\u{1F344}"],
    ["Jengibre", "\u{1FADA}"],
    ["Cilantro", "\u{1F33F}"],
    ["Perejil", "\u{1F33F}"],
    ["Albahaca", "\u{1F33F}"],
    ["Or\xE9gano", "\u{1F33F}"],
    ["Tomillo", "\u{1F33F}"],
    ["Romero", "\u{1F33F}"],
    ["Menta", "\u{1F33F}"],
    ["Ensalada preparada", "\u{1F957}"],
    ["Manzana roja", "\u{1F34E}"],
    ["Manzana verde", "\u{1F34F}"],
    ["Pera", "\u{1F350}"],
    ["Naranja", "\u{1F34A}"],
    ["Mandarina", "\u{1F34A}"],
    ["Lim\xF3n", "\u{1F34B}"],
    ["Lim\xF3n sutil", "\u{1F34B}"],
    ["Pomelo", "\u{1F34A}"],
    ["Pl\xE1tano", "\u{1F34C}"],
    ["Uva", "\u{1F347}"],
    ["Uva verde", "\u{1F347}"],
    ["Sand\xEDa", "\u{1F349}"],
    ["Mel\xF3n", "\u{1F348}"],
    ["Frutilla", "\u{1F353}"],
    ["Frambuesa", "\u{1FAD0}"],
    ["Ar\xE1ndano", "\u{1FAD0}"],
    ["Mora", "\u{1FAD0}"],
    ["Kiwi", "\u{1F95D}"],
    ["Pi\xF1a", "\u{1F34D}"],
    ["Mango", "\u{1F96D}"],
    ["Durazno", "\u{1F351}"],
    ["Nectarina", "\u{1F351}"],
    ["Ciruela", "\u{1F351}"],
    ["Chirimoya", "\u{1F348}"],
    ["Papaya", "\u{1F348}"],
    ["Higo", "\u{1F7E4}"],
    ["Damasco", "\u{1F351}"],
    ["Coco", "\u{1F965}"],
    ["Guayaba", "\u{1F348}"],
    ["Maracuy\xE1", "\u{1F7E1}"],
    ["Pepino dulce", "\u{1F952}"],
    ["Membrillo", "\u{1F350}"],
    ["N\xEDspero", "\u{1F34A}"],
    ["Cereza", "\u{1F352}"],
    ["D\xE1til", "\u{1F7E4}"],
    ["Granada", "\u{1F534}"],
    ["Lenteja", "\u{1F7E4}"],
    ["Garbanzo", "\u{1F7E1}"],
    ["Poroto", "\u{1FAD8}"],
    ["Arroz", "\u{1F35A}"],
    ["Quinoa", "\u{1F33E}"],
    ["Avena", "\u{1F33E}"],
    ["Fideos", "\u{1F35D}"],
    ["Harina", "\u{1F33E}"],
    ["Huevos", "\u{1F95A}"],
    ["Huevos de campo", "\u{1F95A}"],
    ["Leche", "\u{1F95B}"],
    ["Queso", "\u{1F9C0}"],
    ["Mantequilla", "\u{1F9C8}"],
    ["Yogurt", "\u{1F95B}"],
    ["Pan", "\u{1F35E}"],
    ["Miel", "\u{1F36F}"],
    ["Aceite", "\u{1F376}"],
    ["Vinagre", "\u{1F376}"],
    ["Sal", "\u{1F9C2}"],
    ["Az\xFAcar", "\u{1F9C2}"],
    ["Pimienta", "\u{1F9C2}"],
    ["Comino", "\u{1F33F}"],
    ["Canela", "\u{1F7E4}"],
    ["Merk\xE9n", "\u{1F336}\uFE0F"],
    ["Nuez", "\u{1F330}"],
    ["Almendra", "\u{1F330}"],
    ["Man\xED", "\u{1F95C}"],
    ["Pasas", "\u{1F7E3}"],
    ["Chocolate", "\u{1F36B}"],
    ["Caf\xE9", "\u2615"],
    ["T\xE9", "\u{1F375}"],
    ["Aceituna", "\u{1FAD2}"],
    // Carnes, pescados y mariscos
    ["Pollo", "\u{1F357}"],
    ["Pollo entero", "\u{1F414}"],
    ["Carne de vacuno", "\u{1F969}"],
    ["Costillar", "\u{1F969}"],
    ["Cerdo", "\u{1F969}"],
    ["Carne molida", "\u{1F969}"],
    ["Tocino", "\u{1F953}"],
    ["Jam\xF3n", "\u{1F356}"],
    ["Salchichas", "\u{1F32D}"],
    ["Longaniza", "\u{1F32D}"],
    ["Chorizo", "\u{1F32D}"],
    ["Pescado", "\u{1F41F}"],
    ["Salm\xF3n", "\u{1F41F}"],
    ["At\xFAn fresco", "\u{1F41F}"],
    ["Camarones", "\u{1F364}"],
    ["Mariscos", "\u{1F990}"],
    // Lácteos y refrigerados
    ["Crema de leche", "\u{1F95B}"],
    ["Queso rallado", "\u{1F9C0}"],
    ["Queso crema", "\u{1F9C0}"],
    ["Mantequilla sin sal", "\u{1F9C8}"],
    ["Leche condensada", "\u{1F96B}"],
    ["Leche en polvo", "\u{1F95B}"],
    ["Margarina", "\u{1F9C8}"],
    ["Leche de almendras", "\u{1F95B}"],
    // Panadería y pastelería
    ["Pan de molde", "\u{1F35E}"],
    ["Hallulla", "\u{1F35E}"],
    ["Marraqueta", "\u{1F956}"],
    ["Baguette", "\u{1F956}"],
    ["Croissant", "\u{1F950}"],
    ["Queque", "\u{1F370}"],
    ["Torta", "\u{1F382}"],
    ["Galletas", "\u{1F36A}"],
    ["Donut", "\u{1F369}"],
    ["Pretzel", "\u{1F968}"],
    ["Tortilla", "\u{1FAD3}"],
    ["Pan integral", "\u{1F35E}"],
    ["Bagel", "\u{1F96F}"],
    // Bebidas
    ["Agua mineral", "\u{1F4A7}"],
    ["Bebida gaseosa", "\u{1F964}"],
    ["Jugo de fruta", "\u{1F9C3}"],
    ["Jugo en caja", "\u{1F9C3}"],
    ["Cerveza", "\u{1F37A}"],
    ["Vino tinto", "\u{1F377}"],
    ["Vino blanco", "\u{1F942}"],
    ["Espumante", "\u{1F37E}"],
    ["Pisco", "\u{1F943}"],
    ["Whisky", "\u{1F943}"],
    ["Caf\xE9 molido", "\u2615"],
    ["T\xE9 en bolsitas", "\u{1F375}"],
    ["Bebida energ\xE9tica", "\u{1F964}"],
    // Snacks y dulces
    ["Papas fritas (snack)", "\u{1F35F}"],
    ["Chocolate en barra", "\u{1F36B}"],
    ["Caramelos", "\u{1F36C}"],
    ["Chicles", "\u{1F36C}"],
    ["Palomitas de ma\xEDz", "\u{1F37F}"],
    ["Barra de cereal", "\u{1F36B}"],
    ["Helado", "\u{1F366}"],
    ["Paleta helada", "\u{1F366}"],
    // Cereales y desayuno
    ["Cereal de desayuno", "\u{1F963}"],
    ["Avena instant\xE1nea", "\u{1F963}"],
    ["Mermelada", "\u{1F36F}"],
    ["Manjar", "\u{1F36F}"],
    ["Crema de avellana", "\u{1F36B}"],
    // Conservas y enlatados
    ["At\xFAn en lata", "\u{1F96B}"],
    ["Choclo en lata", "\u{1F96B}"],
    ["Arvejas en lata", "\u{1F96B}"],
    ["Durazno en conserva", "\u{1F96B}"],
    ["Salsa de tomate", "\u{1F96B}"],
    ["Pur\xE9 de tomate", "\u{1F96B}"],
    ["Pickles", "\u{1F952}"],
    // Congelados
    ["Verduras congeladas", "\u{1F9CA}"],
    ["Papas fritas congeladas", "\u{1F35F}"],
    ["Pizza congelada", "\u{1F355}"],
    ["Empanadas congeladas", "\u{1F95F}"],
    // Pastas y abarrotes
    ["Pasta larga", "\u{1F35D}"],
    ["Ravioles", "\u{1F95F}"],
    ["Lasa\xF1a", "\u{1F35D}"],
    ["Polenta", "\u{1F33D}"],
    ["Salsa pesto", "\u{1F96B}"],
    // Limpieza del hogar
    ["Detergente", "\u{1F9F4}"],
    ["Lavaloza", "\u{1F9F4}"],
    ["Cloro", "\u{1F9F4}"],
    ["Desinfectante", "\u{1F9F4}"],
    ["Esponja", "\u{1F9FD}"],
    ["Papel higi\xE9nico", "\u{1F9FB}"],
    ["Toalla de papel", "\u{1F9FB}"],
    ["Bolsas de basura", "\u{1F5D1}\uFE0F"],
    ["Escoba", "\u{1F9F9}"],
    ["Suavizante de ropa", "\u{1F9F4}"],
    // Cuidado personal e higiene
    ["Shampoo", "\u{1F9F4}"],
    ["Jab\xF3n", "\u{1F9FC}"],
    ["Pasta de dientes", "\u{1FAA5}"],
    ["Cepillo de dientes", "\u{1FAA5}"],
    ["Desodorante", "\u{1F9F4}"],
    ["Pa\xF1ales", "\u{1F37C}"],
    ["Protector solar", "\u{1F9F4}"],
    ["Afeitadora", "\u{1FA92}"],
    // Bebé
    ["Leche de f\xF3rmula", "\u{1F37C}"],
    ["Toallitas h\xFAmedas", "\u{1F9FB}"],
    // Mascotas
    ["Comida para perro", "\u{1F436}"],
    ["Comida para gato", "\u{1F431}"],
    ["Arena para gato", "\u{1F43E}"],
    // Condimentos y salsas
    ["Mayonesa", "\u{1F96B}"],
    ["Ketchup", "\u{1F345}"],
    ["Mostaza", "\u{1F32D}"],
    ["Salsa soya", "\u{1F376}"],
    ["Salsa de aj\xED", "\u{1F336}\uFE0F"],
    ["Aceite de oliva", "\u{1FAD2}"],
    ["Aceite vegetal", "\u{1F376}"]
  ];
  var carrito = [];
  var productoEnSeleccion = null;
  var valorDisplay = "0";
  var iconoSeleccionado = "\u{1F6D2}";
  var unidadSeleccionada = "kg";
  var productoEditandoId = null;
  function renderImagen(image) {
    if (image && image.startsWith("data:image")) return `<img src="${image}" />`;
    return image || "\u{1F6D2}";
  }
  function calcularFrecuenciaVenta() {
    const mapa = {};
    ventas.forEach((v) => v.items.forEach((i) => {
      mapa[i.product_name] = (mapa[i.product_name] || 0) + i.quantity;
    }));
    return mapa;
  }
  function renderProductos() {
    const grid = document.getElementById("grid-productos");
    const frecuencia = calcularFrecuenciaVenta();
    const productosOrdenados = [...productos].sort((a, b) => {
      const diff = (frecuencia[b.name] || 0) - (frecuencia[a.name] || 0);
      return diff !== 0 ? diff : a.id - b.id;
    });
    grid.innerHTML = productosOrdenados.map((p) => `
    <div class="producto-card" data-id="${p.id}">
      <div class="foto-cont">${renderImagen(p.image)}</div>
      <div class="nombre">${p.name}</div>
      <div class="precio">$${Math.round(p.price).toLocaleString("es-CL")}</div>
      <div class="unidad">/ ${p.unit === "kg" ? "kilo" : "unidad"}</div>
    </div>
  `).join("");
    grid.querySelectorAll(".producto-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = parseInt(card.dataset.id);
        abrirSelectorMonto(productos.find((p) => p.id === id));
      });
    });
  }
  function abrirSelectorMonto(producto) {
    productoEnSeleccion = producto;
    valorDisplay = "0";
    document.getElementById("cantidad-emoji").innerHTML = renderImagen(producto.image);
    document.getElementById("cantidad-nombre").textContent = producto.name;
    document.getElementById("cantidad-precio-unit").textContent = `$${Math.round(producto.price).toLocaleString("es-CL")} / ${producto.unit === "kg" ? "kilo" : "unidad"}`;
    actualizarDisplayMonto();
    abrirSheet("overlay-cantidad");
  }
  function actualizarDisplayMonto() {
    const monto = parseInt(valorDisplay || "0", 10);
    document.getElementById("display-valor").textContent = monto.toLocaleString("es-CL");
    const cantidad = productoEnSeleccion.price > 0 ? monto / productoEnSeleccion.price : 0;
    const unidadTxt = productoEnSeleccion.unit === "kg" ? "kg" : "un.";
    document.getElementById("equivalencia-cantidad").textContent = `\u2248 ${cantidad.toFixed(2)} ${unidadTxt}`;
  }
  document.querySelectorAll(".keypad button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      if (key === "back") valorDisplay = valorDisplay.slice(0, -1) || "0";
      else if (key === "000") valorDisplay = valorDisplay === "0" ? "0" : valorDisplay + "000";
      else valorDisplay = valorDisplay === "0" ? key : valorDisplay + key;
      actualizarDisplayMonto();
    });
  });
  document.getElementById("btn-cancelar-cantidad").addEventListener("click", () => cerrarSheet("overlay-cantidad"));
  document.getElementById("btn-confirmar-cantidad").addEventListener("click", () => {
    const monto = parseInt(valorDisplay || "0", 10);
    if (monto <= 0) {
      cerrarSheet("overlay-cantidad");
      return;
    }
    const cantidad = productoEnSeleccion.price > 0 ? monto / productoEnSeleccion.price : 0;
    const existente = carrito.find((i) => i.product_id === productoEnSeleccion.id);
    if (existente) {
      existente.monto += monto;
      existente.quantity += cantidad;
    } else carrito.push({
      product_id: productoEnSeleccion.id,
      product_name: productoEnSeleccion.name,
      image: productoEnSeleccion.image,
      unit: productoEnSeleccion.unit,
      quantity: cantidad,
      unit_price: productoEnSeleccion.price,
      monto
    });
    cerrarSheet("overlay-cantidad");
    actualizarBarraCarrito();
  });
  function actualizarBarraCarrito() {
    const bar = document.getElementById("cart-bar");
    const total = carrito.reduce((s2, i) => s2 + i.monto, 0);
    if (carrito.length === 0) {
      bar.classList.remove("visible");
      return;
    }
    bar.classList.add("visible");
    document.getElementById("cart-count").textContent = `${carrito.length} producto${carrito.length > 1 ? "s" : ""}`;
    document.getElementById("cart-total").textContent = `$${Math.round(total).toLocaleString("es-CL")}`;
  }
  document.getElementById("btn-ver-carrito").addEventListener("click", () => {
    renderCarritoDetalle();
    abrirSheet("overlay-carrito");
  });
  function renderCarritoDetalle() {
    const cont = document.getElementById("lista-carrito-detalle");
    cont.innerHTML = carrito.map((item, i) => `
    <div class="carrito-fila">
      <div class="info">
        <span class="emoji-chico">${renderImagen(item.image)}</span>
        <div class="nombre-cant">
          <div>${item.product_name}</div>
          <div class="cant">\u2248 ${item.quantity.toFixed(2)} ${item.unit === "kg" ? "kg" : "un."} \xB7 $${Math.round(item.unit_price).toLocaleString("es-CL")}/${item.unit === "kg" ? "kg" : "u."}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;">
        <span class="subtotal">$${Math.round(item.monto).toLocaleString("es-CL")}</span>
        <button class="quitar" data-i="${i}">\u2715</button>
      </div>
    </div>
  `).join("");
    cont.querySelectorAll(".quitar").forEach((btn) => {
      btn.addEventListener("click", () => {
        carrito.splice(parseInt(btn.dataset.i), 1);
        renderCarritoDetalle();
        actualizarBarraCarrito();
        if (carrito.length === 0) cerrarSheet("overlay-carrito");
      });
    });
    const total = carrito.reduce((s2, i) => s2 + i.monto, 0);
    document.getElementById("total-final").textContent = `$${Math.round(total).toLocaleString("es-CL")}`;
  }
  document.getElementById("btn-seguir-comprando").addEventListener("click", () => cerrarSheet("overlay-carrito"));
  document.getElementById("btn-finalizar-venta").addEventListener("click", () => {
    const total = carrito.reduce((s2, i) => s2 + i.monto, 0);
    const nuevaVenta = {
      id: nextVentaId++,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      total,
      items: carrito.map((i) => ({
        product_name: i.product_name,
        unit: i.unit,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.monto
      }))
    };
    ventas.push(nuevaVenta);
    guardarEnStorage("ventas", ventas);
    document.getElementById("monto-confirmado").textContent = `$${Math.round(total).toLocaleString("es-CL")}`;
    cerrarSheet("overlay-carrito");
    abrirSheet("overlay-confirmacion");
    carrito = [];
    actualizarBarraCarrito();
    renderProductos();
    setTimeout(() => cerrarSheet("overlay-confirmacion"), 1800);
  });
  document.getElementById("btn-gestionar-productos").addEventListener("click", () => {
    document.getElementById("buscar-producto-gestion").value = "";
    renderGestionProductos("");
    abrirSheet("overlay-gestion-productos");
  });
  document.getElementById("btn-cerrar-gestion").addEventListener("click", () => cerrarSheet("overlay-gestion-productos"));
  function renderGestionProductos(filtro) {
    const cont = document.getElementById("lista-gestion-productos");
    const lista = productos.filter((p) => p.name.toLowerCase().includes(filtro.toLowerCase()));
    cont.innerHTML = lista.map((p) => `
    <div class="gestion-fila">
      <div class="foto-chica">${renderImagen(p.image)}</div>
      <div class="info-producto">
        <div class="nombre-g">${p.name}</div>
        <div class="precio-g">$${Math.round(p.price).toLocaleString("es-CL")} / ${p.unit === "kg" ? "kilo" : "unidad"}</div>
      </div>
      <div class="acciones-g">
        <button class="btn-editar-g" data-id="${p.id}">\u270F\uFE0F</button>
        <button class="btn-eliminar-g" data-id="${p.id}">\u{1F5D1}\uFE0F</button>
      </div>
    </div>
  `).join("") || `<p style="padding:16px;color:#888;">No se encontraron productos.</p>`;
    cont.querySelectorAll(".btn-editar-g").forEach((btn) => btn.addEventListener("click", () => abrirFormularioProducto(parseInt(btn.dataset.id))));
    cont.querySelectorAll(".btn-eliminar-g").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const p = productos.find((x) => x.id === id);
        if (confirm(`\xBFEliminar "${p.name}" del cat\xE1logo?`)) {
          productos = productos.filter((x) => x.id !== id);
          guardarEnStorage("productos", productos);
          renderGestionProductos(document.getElementById("buscar-producto-gestion").value);
          renderProductos();
        }
      });
    });
  }
  document.getElementById("buscar-producto-gestion").addEventListener("input", (e) => renderGestionProductos(e.target.value));
  document.getElementById("btn-abrir-nuevo-producto").addEventListener("click", () => abrirFormularioProducto(null));
  function abrirFormularioProducto(id) {
    productoEditandoId = id;
    const editando = id !== null;
    document.getElementById("titulo-form-producto").textContent = editando ? "Editar producto" : "Nuevo producto";
    if (editando) {
      const p = productos.find((x) => x.id === id);
      iconoSeleccionado = p.image;
      unidadSeleccionada = p.unit;
      document.getElementById("nuevo-nombre").value = p.name;
      document.getElementById("nuevo-precio").value = p.price;
    } else {
      iconoSeleccionado = "\u{1F6D2}";
      unidadSeleccionada = "kg";
      document.getElementById("nuevo-nombre").value = "";
      document.getElementById("nuevo-precio").value = "";
    }
    document.getElementById("foto-preview").innerHTML = renderImagen(iconoSeleccionado);
    document.querySelectorAll(".unidad-btn").forEach((b) => b.classList.toggle("active", b.dataset.unit === unidadSeleccionada));
    document.getElementById("buscar-icono").value = "";
    renderBancoIconos("");
    abrirSheet("overlay-nuevo-producto");
  }
  document.getElementById("btn-cancelar-nuevo").addEventListener("click", () => cerrarSheet("overlay-nuevo-producto"));
  function renderBancoIconos(filtro) {
    const cont = document.getElementById("banco-iconos");
    const lista = BANCO_ICONOS.filter(([nombre]) => nombre.toLowerCase().includes(filtro.toLowerCase()));
    cont.innerHTML = lista.map(([nombre, emoji]) => `
    <div class="icono-opcion" data-emoji="${emoji}" data-nombre="${nombre}"><span>${emoji}</span><span class="etiqueta">${nombre}</span></div>
  `).join("") || `<p style="grid-column:1/-1;color:#888;font-size:12px;padding:8px;">Sin resultados.</p>`;
    cont.querySelectorAll(".icono-opcion").forEach((el) => {
      el.addEventListener("click", () => {
        iconoSeleccionado = el.dataset.emoji;
        document.getElementById("foto-preview").innerHTML = iconoSeleccionado;
        if (!document.getElementById("nuevo-nombre").value.trim()) document.getElementById("nuevo-nombre").value = el.dataset.nombre;
      });
    });
  }
  document.getElementById("buscar-icono").addEventListener("input", (e) => renderBancoIconos(e.target.value));
  document.getElementById("btn-tomar-foto").addEventListener("click", () => document.getElementById("input-foto").click());
  document.getElementById("input-foto").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      iconoSeleccionado = reader.result;
      document.getElementById("foto-preview").innerHTML = `<img src="${iconoSeleccionado}" />`;
    };
    reader.readAsDataURL(file);
  });
  document.querySelectorAll(".unidad-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".unidad-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      unidadSeleccionada = btn.dataset.unit;
    });
  });
  function normalizarTexto(txt) {
    return txt.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  document.getElementById("btn-guardar-nuevo").addEventListener("click", () => {
    const nombre = document.getElementById("nuevo-nombre").value.trim();
    const precio = parseFloat(document.getElementById("nuevo-precio").value);
    if (!nombre || !precio) {
      alert("Ingresa nombre y precio del producto.");
      return;
    }
    const nombreNormalizado = normalizarTexto(nombre);
    const duplicado = productos.some(
      (p) => p.id !== productoEditandoId && normalizarTexto(p.name) === nombreNormalizado
    );
    if (duplicado) {
      alert(`Ya existe un producto llamado "${nombre}" en el cat\xE1logo. Cambia el nombre para poder guardarlo (por ejemplo, agregando una marca o variedad).`);
      return;
    }
    if (productoEditandoId !== null) {
      const p = productos.find((x) => x.id === productoEditandoId);
      p.name = nombre;
      p.image = iconoSeleccionado;
      p.unit = unidadSeleccionada;
      p.price = precio;
    } else {
      productos.push({ id: nextProductoId++, name: nombre, image: iconoSeleccionado, unit: unidadSeleccionada, price: precio });
    }
    guardarEnStorage("productos", productos);
    cerrarSheet("overlay-nuevo-producto");
    renderProductos();
    renderGestionProductos(document.getElementById("buscar-producto-gestion").value);
    abrirSheet("overlay-gestion-productos");
  });
  document.getElementById("btn-reportes").addEventListener("click", () => {
    const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    document.getElementById("reporte-desde").value = hoy;
    document.getElementById("reporte-hasta").value = hoy;
    document.getElementById("resultado-reportes").style.display = "none";
    const nombres = [...new Set(ventas.flatMap((v) => v.items.map((i) => i.product_name)))];
    document.getElementById("reporte-producto").innerHTML = `<option value="todos">Todos los productos</option>` + nombres.map((n) => `<option value="${n}">${n}</option>`).join("");
    renderCorreos();
    abrirSheet("overlay-reportes");
  });
  document.getElementById("btn-cancelar-reportes").addEventListener("click", () => cerrarSheet("overlay-reportes"));
  function ventasFiltradas() {
    const desde = /* @__PURE__ */ new Date(document.getElementById("reporte-desde").value + "T00:00:00");
    const hasta = /* @__PURE__ */ new Date(document.getElementById("reporte-hasta").value + "T23:59:59");
    const filtroProducto = document.getElementById("reporte-producto").value;
    return ventas.filter((v) => {
      const d = new Date(v.created_at);
      return d >= desde && d <= hasta;
    }).map((v) => filtroProducto === "todos" ? v : { ...v, items: v.items.filter((i) => i.product_name === filtroProducto) }).filter((v) => v.items.length > 0);
  }
  document.getElementById("btn-consultar-reportes").addEventListener("click", () => {
    const filtradas = ventasFiltradas();
    const totalPeriodo = filtradas.reduce((s2, v) => s2 + v.items.reduce((s22, i) => s22 + i.subtotal, 0), 0);
    document.getElementById("reporte-total-monto").textContent = `$${Math.round(totalPeriodo).toLocaleString("es-CL")}`;
    document.getElementById("reporte-total-cantidad").textContent = `${filtradas.length} venta${filtradas.length === 1 ? "" : "s"}`;
    const porProducto = {};
    filtradas.forEach((v) => v.items.forEach((i) => {
      if (!porProducto[i.product_name]) porProducto[i.product_name] = { cantidad: 0, total: 0 };
      porProducto[i.product_name].cantidad += i.quantity;
      porProducto[i.product_name].total += i.subtotal;
    }));
    document.getElementById("reporte-por-producto").innerHTML = Object.keys(porProducto).length ? Object.entries(porProducto).map(([nombre, d]) => `
        <div class="reporte-fila"><span class="izq">${nombre} (${d.cantidad.toFixed(2)})</span><span class="der">$${Math.round(d.total).toLocaleString("es-CL")}</span></div>
      `).join("") : `<div class="reporte-fila"><span class="izq">Sin ventas en este per\xEDodo.</span></div>`;
    document.getElementById("reporte-listado-ventas").innerHTML = filtradas.length ? filtradas.map((v) => {
      const d = new Date(v.created_at);
      return `<div class="reporte-fila">
          <span class="izq">Venta #${v.id}<br><span class="hora-chica">${d.toLocaleDateString("es-CL")} - ${d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</span></span>
          <span class="der">$${Math.round(v.items.reduce((s2, i) => s2 + i.subtotal, 0)).toLocaleString("es-CL")}</span>
        </div>`;
    }).join("") : `<div class="reporte-fila"><span class="izq">Sin ventas en este per\xEDodo.</span></div>`;
    document.getElementById("resultado-reportes").style.display = "block";
  });
  function construirFilasDetalle() {
    const filas = [["Fecha", "Hora", "N\xB0 Venta", "Producto", "Unidad", "Cantidad", "Precio Unitario", "Subtotal"]];
    ventasFiltradas().forEach((v) => {
      const d = new Date(v.created_at);
      const fecha = d.toLocaleDateString("es-CL");
      const hora = d.toLocaleTimeString("es-CL", { hour12: false });
      v.items.forEach((i) => filas.push([fecha, hora, v.id, i.product_name, i.unit, i.quantity, i.unit_price, i.subtotal]));
    });
    const total = filas.slice(1).reduce((s2, f2) => s2 + f2[7], 0);
    filas.push([]);
    filas.push(["", "", "", "", "", "", "TOTAL", total]);
    return filas;
  }
  function blobToBase64(blob) {
    return new Promise((resolve2, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve2(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  async function guardarArchivo(nombreArchivo, blob) {
    try {
      const base64 = await blobToBase64(blob);
      const resultado = await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64,
        directory: Directory.Documents
      });
      alert(`Archivo guardado correctamente.

Lo encuentras en la app "Archivos" del dispositivo, dentro de la carpeta Documents, con el nombre: ${nombreArchivo}`);
      return resultado;
    } catch (e) {
      console.error("Error guardando archivo:", e);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert("No se pudo guardar con el m\xE9todo principal. Se intent\xF3 una descarga alternativa - revisa la carpeta Descargas.");
    }
  }
  document.getElementById("btn-descargar-excel").addEventListener("click", () => {
    const filas = construirFilasDetalle();
    const ws = XLSX.utils.aoa_to_sheet(filas);
    ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 9 }, { wch: 22 }, { wch: 9 }, { wch: 10 }, { wch: 15 }, { wch: 13 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle de ventas");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    guardarArchivo(`ventas_${hoy}.xlsx`, blob);
  });
  document.getElementById("btn-descargar-csv").addEventListener("click", () => {
    const filas = construirFilasDetalle();
    const csv = filas.map((f2) => f2.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    guardarArchivo(`ventas_${hoy}.csv`, blob);
  });
  var correosPredeterminados = cargarDeStorage("correos_predeterminados", []);
  function renderCorreos() {
    const cont = document.getElementById("lista-correos");
    cont.innerHTML = correosPredeterminados.length ? correosPredeterminados.map((correo, i) => `
        <button class="chip-correo" data-correo="${correo}">
          ${correo} <span class="quitar-correo" data-i="${i}">\u2715</span>
        </button>
      `).join("") : `<p style="color:#888;font-size:12.5px;">A\xFAn no agregas correos. Escribe uno abajo.</p>`;
    cont.querySelectorAll(".chip-correo").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        if (e.target.classList.contains("quitar-correo")) return;
        copiarCorreo(chip.dataset.correo);
      });
    });
    cont.querySelectorAll(".quitar-correo").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        correosPredeterminados.splice(parseInt(btn.dataset.i), 1);
        guardarEnStorage("correos_predeterminados", correosPredeterminados);
        renderCorreos();
      });
    });
  }
  function copiarCorreo(correo) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(correo).then(() => {
        alert(`Copiado: ${correo}

Ahora presiona "Enviar por correo" y p\xE9galo en el campo "Para".`);
      }).catch(() => {
        alert(`Correo: ${correo}

(No se pudo copiar autom\xE1ticamente; an\xF3talo o selecci\xF3nalo manualmente.)`);
      });
    } else {
      alert(`Correo: ${correo}`);
    }
  }
  document.getElementById("btn-agregar-correo").addEventListener("click", () => {
    const input = document.getElementById("nuevo-correo");
    const correo = input.value.trim();
    if (!correo || !correo.includes("@")) {
      alert("Ingresa un correo v\xE1lido.");
      return;
    }
    if (!correosPredeterminados.includes(correo)) {
      correosPredeterminados.push(correo);
      guardarEnStorage("correos_predeterminados", correosPredeterminados);
      renderCorreos();
    }
    input.value = "";
  });
  function generarExcelBlob() {
    const filas = construirFilasDetalle();
    const ws = XLSX.utils.aoa_to_sheet(filas);
    ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 9 }, { wch: 22 }, { wch: 9 }, { wch: 10 }, { wch: 15 }, { wch: 13 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle de ventas");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  document.getElementById("btn-enviar-correo").addEventListener("click", async () => {
    const blob = generarExcelBlob();
    const hoy = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const nombreArchivo = `ventas_${hoy}.xlsx`;
    try {
      const base64 = await blobToBase64(blob);
      const resultado = await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64,
        directory: Directory.Cache
      });
      await Share.share({
        title: "Reporte de ventas - Verduler\xEDa",
        text: "Adjunto el reporte de ventas.",
        url: resultado.uri,
        dialogTitle: "Enviar reporte por correo"
      });
    } catch (e) {
      console.error("Error al compartir:", e);
      alert("No se pudo abrir el selector de apps para compartir. Prueba con 'Descargar Excel' y adj\xFAntalo manualmente desde tu app de correo.");
    }
  });
  function abrirSheet(id) {
    document.getElementById(id).classList.add("open");
  }
  function cerrarSheet(id) {
    document.getElementById(id).classList.remove("open");
  }
  document.querySelectorAll(".sheet-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
  renderProductos();
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
