#!/usr/bin/env node
import { createRequire as __codexplatCreateRequire } from 'node:module'; import { fileURLToPath as __codexplatFileURLToPath } from 'node:url'; import { dirname as __codexplatDirname } from 'node:path'; const require = __codexplatCreateRequire(import.meta.url); const __filename = __codexplatFileURLToPath(import.meta.url); const __dirname = __codexplatDirname(__filename);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/sql.js/dist/sql-wasm.js
var require_sql_wasm = __commonJS({
  "node_modules/sql.js/dist/sql-wasm.js"(exports, module) {
    "use strict";
    var initSqlJsPromise = void 0;
    var initSqlJs2 = function(moduleConfig) {
      if (initSqlJsPromise) {
        return initSqlJsPromise;
      }
      initSqlJsPromise = new Promise(function(resolveModule, reject) {
        var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
        var originalOnAbortFunction = Module["onAbort"];
        Module["onAbort"] = function(errorThatCausedAbort) {
          reject(new Error(errorThatCausedAbort));
          if (originalOnAbortFunction) {
            originalOnAbortFunction(errorThatCausedAbort);
          }
        };
        Module["postRun"] = Module["postRun"] || [];
        Module["postRun"].push(function() {
          resolveModule(Module);
        });
        module = void 0;
        var k;
        k ||= typeof Module != "undefined" ? Module : {};
        var aa = !!globalThis.window, ba = !!globalThis.WorkerGlobalScope, ca = globalThis.process?.versions?.node && "renderer" != globalThis.process?.type;
        k.onRuntimeInitialized = function() {
          function a(f, l) {
            switch (typeof l) {
              case "boolean":
                bc(f, l ? 1 : 0);
                break;
              case "number":
                cc(f, l);
                break;
              case "string":
                dc(f, l, -1, -1);
                break;
              case "object":
                if (null === l) lb(f);
                else if (null != l.length) {
                  var n = da(l.length);
                  m.set(l, n);
                  ec(f, n, l.length, -1);
                  ea(n);
                } else sa(f, "Wrong API use : tried to return a value of an unknown type (" + l + ").", -1);
                break;
              default:
                lb(f);
            }
          }
          function b(f, l) {
            for (var n = [], p = 0; p < f; p += 1) {
              var u = r(l + 4 * p, "i32"), v = fc(u);
              if (1 === v || 2 === v) u = gc(u);
              else if (3 === v) u = hc(u);
              else if (4 === v) {
                v = u;
                u = ic(v);
                v = jc(v);
                for (var K = new Uint8Array(u), I = 0; I < u; I += 1) K[I] = m[v + I];
                u = K;
              } else u = null;
              n.push(u);
            }
            return n;
          }
          function c(f, l) {
            this.Qa = f;
            this.db = l;
            this.Oa = 1;
            this.mb = [];
          }
          function d(f, l) {
            this.db = l;
            this.fb = fa(f);
            if (null === this.fb) throw Error("Unable to allocate memory for the SQL string");
            this.lb = this.fb;
            this.$a = this.sb = null;
          }
          function e(f) {
            this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
            if (null != f) {
              var l = this.filename, n = "/", p = l;
              n && (n = "string" == typeof n ? n : ha(n), p = l ? ia(n + "/" + l) : n);
              l = ja(true, true);
              p = ka(
                p,
                l
              );
              if (f) {
                if ("string" == typeof f) {
                  n = Array(f.length);
                  for (var u = 0, v = f.length; u < v; ++u) n[u] = f.charCodeAt(u);
                  f = n;
                }
                la(p, l | 146);
                n = ma(p, 577);
                na(n, f, 0, f.length, 0);
                oa(n);
                la(p, l);
              }
            }
            this.handleError(q(this.filename, g));
            this.db = r(g, "i32");
            ob(this.db);
            this.gb = {};
            this.Sa = {};
          }
          var g = y(4), h = k.cwrap, q = h("sqlite3_open", "number", ["string", "number"]), w = h("sqlite3_close_v2", "number", ["number"]), t = h("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), x = h("sqlite3_changes", "number", ["number"]), D = h(
            "sqlite3_prepare_v2",
            "number",
            ["number", "string", "number", "number", "number"]
          ), pb = h("sqlite3_sql", "string", ["number"]), lc = h("sqlite3_normalized_sql", "string", ["number"]), qb = h("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), mc = h("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), rb = h("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), nc = h("sqlite3_bind_double", "number", ["number", "number", "number"]), oc = h("sqlite3_bind_int", "number", [
            "number",
            "number",
            "number"
          ]), pc = h("sqlite3_bind_parameter_index", "number", ["number", "string"]), qc = h("sqlite3_step", "number", ["number"]), rc = h("sqlite3_errmsg", "string", ["number"]), sc = h("sqlite3_column_count", "number", ["number"]), tc = h("sqlite3_data_count", "number", ["number"]), uc = h("sqlite3_column_double", "number", ["number", "number"]), sb = h("sqlite3_column_text", "string", ["number", "number"]), vc = h("sqlite3_column_blob", "number", ["number", "number"]), wc = h("sqlite3_column_bytes", "number", ["number", "number"]), xc = h(
            "sqlite3_column_type",
            "number",
            ["number", "number"]
          ), yc = h("sqlite3_column_name", "string", ["number", "number"]), zc = h("sqlite3_reset", "number", ["number"]), Ac = h("sqlite3_clear_bindings", "number", ["number"]), Bc = h("sqlite3_finalize", "number", ["number"]), tb = h("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), fc = h("sqlite3_value_type", "number", ["number"]), ic = h("sqlite3_value_bytes", "number", ["number"]), hc = h("sqlite3_value_text", "string", ["number"]), jc = h(
            "sqlite3_value_blob",
            "number",
            ["number"]
          ), gc = h("sqlite3_value_double", "number", ["number"]), cc = h("sqlite3_result_double", "", ["number", "number"]), lb = h("sqlite3_result_null", "", ["number"]), dc = h("sqlite3_result_text", "", ["number", "string", "number", "number"]), ec = h("sqlite3_result_blob", "", ["number", "number", "number", "number"]), bc = h("sqlite3_result_int", "", ["number", "number"]), sa = h("sqlite3_result_error", "", ["number", "string", "number"]), ub = h("sqlite3_aggregate_context", "number", ["number", "number"]), ob = h(
            "RegisterExtensionFunctions",
            "number",
            ["number"]
          ), vb = h("sqlite3_update_hook", "number", ["number", "number", "number"]);
          c.prototype.bind = function(f) {
            if (!this.Qa) throw "Statement closed";
            this.reset();
            return Array.isArray(f) ? this.Gb(f) : null != f && "object" === typeof f ? this.Hb(f) : true;
          };
          c.prototype.step = function() {
            if (!this.Qa) throw "Statement closed";
            this.Oa = 1;
            var f = qc(this.Qa);
            switch (f) {
              case 100:
                return true;
              case 101:
                return false;
              default:
                throw this.db.handleError(f);
            }
          };
          c.prototype.Ab = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            return uc(this.Qa, f);
          };
          c.prototype.Ob = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            f = sb(this.Qa, f);
            if ("function" !== typeof BigInt) throw Error("BigInt is not supported");
            return BigInt(f);
          };
          c.prototype.Tb = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            return sb(this.Qa, f);
          };
          c.prototype.getBlob = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            var l = wc(this.Qa, f);
            f = vc(this.Qa, f);
            for (var n = new Uint8Array(l), p = 0; p < l; p += 1) n[p] = m[f + p];
            return n;
          };
          c.prototype.get = function(f, l) {
            l = l || {};
            null != f && this.bind(f) && this.step();
            f = [];
            for (var n = tc(this.Qa), p = 0; p < n; p += 1) switch (xc(this.Qa, p)) {
              case 1:
                var u = l.useBigInt ? this.Ob(p) : this.Ab(p);
                f.push(u);
                break;
              case 2:
                f.push(this.Ab(p));
                break;
              case 3:
                f.push(this.Tb(p));
                break;
              case 4:
                f.push(this.getBlob(p));
                break;
              default:
                f.push(null);
            }
            return f;
          };
          c.prototype.qb = function() {
            for (var f = [], l = sc(this.Qa), n = 0; n < l; n += 1) f.push(yc(this.Qa, n));
            return f;
          };
          c.prototype.zb = function(f, l) {
            f = this.get(f, l);
            l = this.qb();
            for (var n = {}, p = 0; p < l.length; p += 1) n[l[p]] = f[p];
            return n;
          };
          c.prototype.Sb = function() {
            return pb(this.Qa);
          };
          c.prototype.Pb = function() {
            return lc(this.Qa);
          };
          c.prototype.run = function(f) {
            null != f && this.bind(f);
            this.step();
            return this.reset();
          };
          c.prototype.wb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            f = fa(f);
            this.mb.push(f);
            this.db.handleError(mc(this.Qa, l, f, -1, 0));
          };
          c.prototype.Fb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            var n = da(f.length);
            m.set(f, n);
            this.mb.push(n);
            this.db.handleError(rb(this.Qa, l, n, f.length, 0));
          };
          c.prototype.vb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            this.db.handleError((f === (f | 0) ? oc : nc)(
              this.Qa,
              l,
              f
            ));
          };
          c.prototype.Ib = function(f) {
            null == f && (f = this.Oa, this.Oa += 1);
            rb(this.Qa, f, 0, 0, 0);
          };
          c.prototype.xb = function(f, l) {
            null == l && (l = this.Oa, this.Oa += 1);
            switch (typeof f) {
              case "string":
                this.wb(f, l);
                return;
              case "number":
                this.vb(f, l);
                return;
              case "bigint":
                this.wb(f.toString(), l);
                return;
              case "boolean":
                this.vb(f + 0, l);
                return;
              case "object":
                if (null === f) {
                  this.Ib(l);
                  return;
                }
                if (null != f.length) {
                  this.Fb(f, l);
                  return;
                }
            }
            throw "Wrong API use : tried to bind a value of an unknown type (" + f + ").";
          };
          c.prototype.Hb = function(f) {
            var l = this;
            Object.keys(f).forEach(function(n) {
              var p = pc(l.Qa, n);
              0 !== p && l.xb(f[n], p);
            });
            return true;
          };
          c.prototype.Gb = function(f) {
            for (var l = 0; l < f.length; l += 1) this.xb(f[l], l + 1);
            return true;
          };
          c.prototype.reset = function() {
            this.freemem();
            return 0 === Ac(this.Qa) && 0 === zc(this.Qa);
          };
          c.prototype.freemem = function() {
            for (var f; void 0 !== (f = this.mb.pop()); ) ea(f);
          };
          c.prototype.Ya = function() {
            this.freemem();
            var f = 0 === Bc(this.Qa);
            delete this.db.gb[this.Qa];
            this.Qa = 0;
            return f;
          };
          d.prototype.next = function() {
            if (null === this.fb) return { done: true };
            null !== this.$a && (this.$a.Ya(), this.$a = null);
            if (!this.db.db) throw this.ob(), Error("Database closed");
            var f = pa(), l = y(4);
            qa(g);
            qa(l);
            try {
              this.db.handleError(qb(this.db.db, this.lb, -1, g, l));
              this.lb = r(l, "i32");
              var n = r(g, "i32");
              if (0 === n) return this.ob(), { done: true };
              this.$a = new c(n, this.db);
              this.db.gb[n] = this.$a;
              return { value: this.$a, done: false };
            } catch (p) {
              throw this.sb = z(this.lb), this.ob(), p;
            } finally {
              ra(f);
            }
          };
          d.prototype.ob = function() {
            ea(this.fb);
            this.fb = null;
          };
          d.prototype.Qb = function() {
            return null !== this.sb ? this.sb : z(this.lb);
          };
          "function" === typeof Symbol && "symbol" === typeof Symbol.iterator && (d.prototype[Symbol.iterator] = function() {
            return this;
          });
          e.prototype.run = function(f, l) {
            if (!this.db) throw "Database closed";
            if (l) {
              f = this.tb(f, l);
              try {
                f.step();
              } finally {
                f.Ya();
              }
            } else this.handleError(t(this.db, f, 0, 0, g));
            return this;
          };
          e.prototype.exec = function(f, l, n) {
            if (!this.db) throw "Database closed";
            var p = null, u = null, v = null;
            try {
              v = u = fa(f);
              var K = y(4);
              for (f = []; 0 !== r(v, "i8"); ) {
                qa(g);
                qa(K);
                this.handleError(qb(this.db, v, -1, g, K));
                var I = r(
                  g,
                  "i32"
                );
                v = r(K, "i32");
                if (0 !== I) {
                  var H = null;
                  p = new c(I, this);
                  for (null != l && p.bind(l); p.step(); ) null === H && (H = { columns: p.qb(), values: [] }, f.push(H)), H.values.push(p.get(null, n));
                  p.Ya();
                }
              }
              return f;
            } catch (L) {
              throw p && p.Ya(), L;
            } finally {
              u && ea(u);
            }
          };
          e.prototype.Mb = function(f, l, n, p, u) {
            "function" === typeof l && (p = n, n = l, l = void 0);
            f = this.tb(f, l);
            try {
              for (; f.step(); ) n(f.zb(null, u));
            } finally {
              f.Ya();
            }
            if ("function" === typeof p) return p();
          };
          e.prototype.tb = function(f, l) {
            qa(g);
            this.handleError(D(this.db, f, -1, g, 0));
            f = r(g, "i32");
            if (0 === f) throw "Nothing to prepare";
            var n = new c(f, this);
            null != l && n.bind(l);
            return this.gb[f] = n;
          };
          e.prototype.Ub = function(f) {
            return new d(f, this);
          };
          e.prototype.Nb = function() {
            Object.values(this.gb).forEach(function(l) {
              l.Ya();
            });
            Object.values(this.Sa).forEach(A);
            this.Sa = {};
            this.handleError(w(this.db));
            var f = ta(this.filename);
            this.handleError(q(this.filename, g));
            this.db = r(g, "i32");
            ob(this.db);
            return f;
          };
          e.prototype.close = function() {
            null !== this.db && (Object.values(this.gb).forEach(function(f) {
              f.Ya();
            }), Object.values(this.Sa).forEach(A), this.Sa = {}, this.Za && (A(this.Za), this.Za = void 0), this.handleError(w(this.db)), ua("/" + this.filename), this.db = null);
          };
          e.prototype.handleError = function(f) {
            if (0 === f) return null;
            f = rc(this.db);
            throw Error(f);
          };
          e.prototype.Rb = function() {
            return x(this.db);
          };
          e.prototype.Kb = function(f, l) {
            Object.prototype.hasOwnProperty.call(this.Sa, f) && (A(this.Sa[f]), delete this.Sa[f]);
            var n = va(function(p, u, v) {
              u = b(u, v);
              try {
                var K = l.apply(null, u);
              } catch (I) {
                sa(p, I, -1);
                return;
              }
              a(p, K);
            }, "viii");
            this.Sa[f] = n;
            this.handleError(tb(
              this.db,
              f,
              l.length,
              1,
              0,
              n,
              0,
              0,
              0
            ));
            return this;
          };
          e.prototype.Jb = function(f, l) {
            var n = l.init || function() {
              return null;
            }, p = l.finalize || function(H) {
              return H;
            }, u = l.step;
            if (!u) throw "An aggregate function must have a step function in " + f;
            var v = {};
            Object.hasOwnProperty.call(this.Sa, f) && (A(this.Sa[f]), delete this.Sa[f]);
            l = f + "__finalize";
            Object.hasOwnProperty.call(this.Sa, l) && (A(this.Sa[l]), delete this.Sa[l]);
            var K = va(function(H, L, Pa) {
              var V = ub(H, 1);
              Object.hasOwnProperty.call(v, V) || (v[V] = n());
              L = b(L, Pa);
              L = [v[V]].concat(L);
              try {
                v[V] = u.apply(null, L);
              } catch (Dc) {
                delete v[V], sa(H, Dc, -1);
              }
            }, "viii"), I = va(function(H) {
              var L = ub(H, 1);
              try {
                var Pa = p(v[L]);
              } catch (V) {
                delete v[L];
                sa(H, V, -1);
                return;
              }
              a(H, Pa);
              delete v[L];
            }, "vi");
            this.Sa[f] = K;
            this.Sa[l] = I;
            this.handleError(tb(this.db, f, u.length - 1, 1, 0, 0, K, I, 0));
            return this;
          };
          e.prototype.Zb = function(f) {
            this.Za && (vb(this.db, 0, 0), A(this.Za), this.Za = void 0);
            if (!f) return this;
            this.Za = va(function(l, n, p, u, v) {
              switch (n) {
                case 18:
                  l = "insert";
                  break;
                case 23:
                  l = "update";
                  break;
                case 9:
                  l = "delete";
                  break;
                default:
                  throw "unknown operationCode in updateHook callback: " + n;
              }
              p = z(p);
              u = z(u);
              if (v > Number.MAX_SAFE_INTEGER) throw "rowId too big to fit inside a Number";
              f(l, p, u, Number(v));
            }, "viiiij");
            vb(this.db, this.Za, 0);
            return this;
          };
          c.prototype.bind = c.prototype.bind;
          c.prototype.step = c.prototype.step;
          c.prototype.get = c.prototype.get;
          c.prototype.getColumnNames = c.prototype.qb;
          c.prototype.getAsObject = c.prototype.zb;
          c.prototype.getSQL = c.prototype.Sb;
          c.prototype.getNormalizedSQL = c.prototype.Pb;
          c.prototype.run = c.prototype.run;
          c.prototype.reset = c.prototype.reset;
          c.prototype.freemem = c.prototype.freemem;
          c.prototype.free = c.prototype.Ya;
          d.prototype.next = d.prototype.next;
          d.prototype.getRemainingSQL = d.prototype.Qb;
          e.prototype.run = e.prototype.run;
          e.prototype.exec = e.prototype.exec;
          e.prototype.each = e.prototype.Mb;
          e.prototype.prepare = e.prototype.tb;
          e.prototype.iterateStatements = e.prototype.Ub;
          e.prototype["export"] = e.prototype.Nb;
          e.prototype.close = e.prototype.close;
          e.prototype.handleError = e.prototype.handleError;
          e.prototype.getRowsModified = e.prototype.Rb;
          e.prototype.create_function = e.prototype.Kb;
          e.prototype.create_aggregate = e.prototype.Jb;
          e.prototype.updateHook = e.prototype.Zb;
          k.Database = e;
        };
        var wa = "./this.program", xa = (a, b) => {
          throw b;
        }, ya = globalThis.document?.currentScript?.src;
        "undefined" != typeof __filename ? ya = __filename : ba && (ya = self.location.href);
        var za = "", Aa, Ba;
        if (ca) {
          var fs10 = __require("node:fs");
          za = __dirname + "/";
          Ba = (a) => {
            a = Ca(a) ? new URL(a) : a;
            return fs10.readFileSync(a);
          };
          Aa = async (a) => {
            a = Ca(a) ? new URL(a) : a;
            return fs10.readFileSync(a, void 0);
          };
          1 < process.argv.length && (wa = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          "undefined" != typeof module && (module.exports = k);
          xa = (a, b) => {
            process.exitCode = a;
            throw b;
          };
        } else if (aa || ba) {
          try {
            za = new URL(".", ya).href;
          } catch {
          }
          ba && (Ba = (a) => {
            var b = new XMLHttpRequest();
            b.open("GET", a, false);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          });
          Aa = async (a) => {
            if (Ca(a)) return new Promise((c, d) => {
              var e = new XMLHttpRequest();
              e.open("GET", a, true);
              e.responseType = "arraybuffer";
              e.onload = () => {
                200 == e.status || 0 == e.status && e.response ? c(e.response) : d(e.status);
              };
              e.onerror = d;
              e.send(null);
            });
            var b = await fetch(a, { credentials: "same-origin" });
            if (b.ok) return b.arrayBuffer();
            throw Error(b.status + " : " + b.url);
          };
        }
        var Da = console.log.bind(console), B = console.error.bind(console), Ea, Fa = false, Ga, Ca = (a) => a.startsWith("file://"), m, C, Ha, E, F, Ia, Ja, G;
        function Ka() {
          var a = La.buffer;
          m = new Int8Array(a);
          Ha = new Int16Array(a);
          C = new Uint8Array(a);
          new Uint16Array(a);
          E = new Int32Array(a);
          F = new Uint32Array(a);
          Ia = new Float32Array(a);
          Ja = new Float64Array(a);
          G = new BigInt64Array(a);
          new BigUint64Array(a);
        }
        function Ma(a) {
          k.onAbort?.(a);
          a = "Aborted(" + a + ")";
          B(a);
          Fa = true;
          throw new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
        }
        var Na;
        async function Oa(a) {
          if (!Ea) try {
            var b = await Aa(a);
            return new Uint8Array(b);
          } catch {
          }
          if (a == Na && Ea) a = new Uint8Array(Ea);
          else if (Ba) a = Ba(a);
          else throw "both async and sync fetching of the wasm failed";
          return a;
        }
        async function Qa(a, b) {
          try {
            var c = await Oa(a);
            return await WebAssembly.instantiate(c, b);
          } catch (d) {
            B(`failed to asynchronously prepare wasm: ${d}`), Ma(d);
          }
        }
        async function Ra(a) {
          var b = Na;
          if (!Ea && !Ca(b) && !ca) try {
            var c = fetch(b, { credentials: "same-origin" });
            return await WebAssembly.instantiateStreaming(c, a);
          } catch (d) {
            B(`wasm streaming compile failed: ${d}`), B("falling back to ArrayBuffer instantiation");
          }
          return Qa(b, a);
        }
        class Sa {
          name = "ExitStatus";
          constructor(a) {
            this.message = `Program terminated with exit(${a})`;
            this.status = a;
          }
        }
        var Ta = (a) => {
          for (; 0 < a.length; ) a.shift()(k);
        }, Ua = [], Va = [], Wa = () => {
          var a = k.preRun.shift();
          Va.push(a);
        }, J = 0, Xa = null;
        function r(a, b = "i8") {
          b.endsWith("*") && (b = "*");
          switch (b) {
            case "i1":
              return m[a];
            case "i8":
              return m[a];
            case "i16":
              return Ha[a >> 1];
            case "i32":
              return E[a >> 2];
            case "i64":
              return G[a >> 3];
            case "float":
              return Ia[a >> 2];
            case "double":
              return Ja[a >> 3];
            case "*":
              return F[a >> 2];
            default:
              Ma(`invalid type for getValue: ${b}`);
          }
        }
        var Ya = true;
        function qa(a) {
          var b = "i32";
          b.endsWith("*") && (b = "*");
          switch (b) {
            case "i1":
              m[a] = 0;
              break;
            case "i8":
              m[a] = 0;
              break;
            case "i16":
              Ha[a >> 1] = 0;
              break;
            case "i32":
              E[a >> 2] = 0;
              break;
            case "i64":
              G[a >> 3] = BigInt(0);
              break;
            case "float":
              Ia[a >> 2] = 0;
              break;
            case "double":
              Ja[a >> 3] = 0;
              break;
            case "*":
              F[a >> 2] = 0;
              break;
            default:
              Ma(`invalid type for setValue: ${b}`);
          }
        }
        var Za = new TextDecoder(), $a = (a, b, c, d) => {
          c = b + c;
          if (d) return c;
          for (; a[b] && !(b >= c); ) ++b;
          return b;
        }, z = (a, b, c) => a ? Za.decode(C.subarray(a, $a(C, a, b, c))) : "", ab = (a, b) => {
          for (var c = 0, d = a.length - 1; 0 <= d; d--) {
            var e = a[d];
            "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
          }
          if (b) for (; c; c--) a.unshift("..");
          return a;
        }, ia = (a) => {
          var b = "/" === a.charAt(0), c = "/" === a.slice(-1);
          (a = ab(a.split("/").filter((d) => !!d), !b).join("/")) || b || (a = ".");
          a && c && (a += "/");
          return (b ? "/" : "") + a;
        }, bb = (a) => {
          var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
          a = b[0];
          b = b[1];
          if (!a && !b) return ".";
          b &&= b.slice(0, -1);
          return a + b;
        }, cb = (a) => a && a.match(/([^\/]+|\/)\/*$/)[1], db = () => {
          if (ca) {
            var a = __require("node:crypto");
            return (b) => a.randomFillSync(b);
          }
          return (b) => crypto.getRandomValues(b);
        }, eb = (a) => {
          (eb = db())(a);
        }, fb = (...a) => {
          for (var b = "", c = false, d = a.length - 1; -1 <= d && !c; d--) {
            c = 0 <= d ? a[d] : "/";
            if ("string" != typeof c) throw new TypeError("Arguments to path.resolve must be strings");
            if (!c) return "";
            b = c + "/" + b;
            c = "/" === c.charAt(0);
          }
          b = ab(b.split("/").filter((e) => !!e), !c).join("/");
          return (c ? "/" : "") + b || ".";
        }, gb = (a) => {
          var b = $a(a, 0);
          return Za.decode(a.buffer ? a.subarray(0, b) : new Uint8Array(a.slice(0, b)));
        }, hb = [], ib = (a) => {
          for (var b = 0, c = 0; c < a.length; ++c) {
            var d = a.charCodeAt(c);
            127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
          }
          return b;
        }, M = (a, b, c, d) => {
          if (!(0 < d)) return 0;
          var e = c;
          d = c + d - 1;
          for (var g = 0; g < a.length; ++g) {
            var h = a.codePointAt(g);
            if (127 >= h) {
              if (c >= d) break;
              b[c++] = h;
            } else if (2047 >= h) {
              if (c + 1 >= d) break;
              b[c++] = 192 | h >> 6;
              b[c++] = 128 | h & 63;
            } else if (65535 >= h) {
              if (c + 2 >= d) break;
              b[c++] = 224 | h >> 12;
              b[c++] = 128 | h >> 6 & 63;
              b[c++] = 128 | h & 63;
            } else {
              if (c + 3 >= d) break;
              b[c++] = 240 | h >> 18;
              b[c++] = 128 | h >> 12 & 63;
              b[c++] = 128 | h >> 6 & 63;
              b[c++] = 128 | h & 63;
              g++;
            }
          }
          b[c] = 0;
          return c - e;
        }, jb = [];
        function kb(a, b) {
          jb[a] = { input: [], output: [], eb: b };
          mb(a, nb);
        }
        var nb = { open(a) {
          var b = jb[a.node.rdev];
          if (!b) throw new N(43);
          a.tty = b;
          a.seekable = false;
        }, close(a) {
          a.tty.eb.fsync(a.tty);
        }, fsync(a) {
          a.tty.eb.fsync(a.tty);
        }, read(a, b, c, d) {
          if (!a.tty || !a.tty.eb.Bb) throw new N(60);
          for (var e = 0, g = 0; g < d; g++) {
            try {
              var h = a.tty.eb.Bb(a.tty);
            } catch (q) {
              throw new N(29);
            }
            if (void 0 === h && 0 === e) throw new N(6);
            if (null === h || void 0 === h) break;
            e++;
            b[c + g] = h;
          }
          e && (a.node.atime = Date.now());
          return e;
        }, write(a, b, c, d) {
          if (!a.tty || !a.tty.eb.ub) throw new N(60);
          try {
            for (var e = 0; e < d; e++) a.tty.eb.ub(a.tty, b[c + e]);
          } catch (g) {
            throw new N(29);
          }
          d && (a.node.mtime = a.node.ctime = Date.now());
          return e;
        } }, wb = { Bb() {
          a: {
            if (!hb.length) {
              var a = null;
              if (ca) {
                var b = Buffer.alloc(256), c = 0, d = process.stdin.fd;
                try {
                  c = fs10.readSync(d, b, 0, 256);
                } catch (e) {
                  if (e.toString().includes("EOF")) c = 0;
                  else throw e;
                }
                0 < c && (a = b.slice(0, c).toString("utf-8"));
              } else globalThis.window?.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
              if (!a) {
                a = null;
                break a;
              }
              b = Array(ib(a) + 1);
              a = M(a, b, 0, b.length);
              b.length = a;
              hb = b;
            }
            a = hb.shift();
          }
          return a;
        }, ub(a, b) {
          null === b || 10 === b ? (Da(gb(a.output)), a.output = []) : 0 != b && a.output.push(b);
        }, fsync(a) {
          0 < a.output?.length && (Da(gb(a.output)), a.output = []);
        }, hc() {
          return { bc: 25856, dc: 5, ac: 191, cc: 35387, $b: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
        }, ic() {
          return 0;
        }, jc() {
          return [24, 80];
        } }, xb = { ub(a, b) {
          null === b || 10 === b ? (B(gb(a.output)), a.output = []) : 0 != b && a.output.push(b);
        }, fsync(a) {
          0 < a.output?.length && (B(gb(a.output)), a.output = []);
        } }, O = { Wa: null, Xa() {
          return O.createNode(null, "/", 16895, 0);
        }, createNode(a, b, c, d) {
          if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new N(63);
          O.Wa || (O.Wa = { dir: { node: { Ta: O.La.Ta, Ua: O.La.Ua, lookup: O.La.lookup, ib: O.La.ib, rename: O.La.rename, unlink: O.La.unlink, rmdir: O.La.rmdir, readdir: O.La.readdir, symlink: O.La.symlink }, stream: { Va: O.Ma.Va } }, file: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: { Va: O.Ma.Va, read: O.Ma.read, write: O.Ma.write, jb: O.Ma.jb, kb: O.Ma.kb } }, link: { node: { Ta: O.La.Ta, Ua: O.La.Ua, readlink: O.La.readlink }, stream: {} }, yb: { node: { Ta: O.La.Ta, Ua: O.La.Ua }, stream: yb } });
          c = zb(a, b, c, d);
          P(c.mode) ? (c.La = O.Wa.dir.node, c.Ma = O.Wa.dir.stream, c.Na = {}) : 32768 === (c.mode & 61440) ? (c.La = O.Wa.file.node, c.Ma = O.Wa.file.stream, c.Ra = 0, c.Na = null) : 40960 === (c.mode & 61440) ? (c.La = O.Wa.link.node, c.Ma = O.Wa.link.stream) : 8192 === (c.mode & 61440) && (c.La = O.Wa.yb.node, c.Ma = O.Wa.yb.stream);
          c.atime = c.mtime = c.ctime = Date.now();
          a && (a.Na[b] = c, a.atime = a.mtime = a.ctime = c.atime);
          return c;
        }, fc(a) {
          return a.Na ? a.Na.subarray ? a.Na.subarray(0, a.Ra) : new Uint8Array(a.Na) : new Uint8Array(0);
        }, La: {
          Ta(a) {
            var b = {};
            b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            P(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.Ra : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
            b.atime = new Date(a.atime);
            b.mtime = new Date(a.mtime);
            b.ctime = new Date(a.ctime);
            b.blksize = 4096;
            b.blocks = Math.ceil(b.size / b.blksize);
            return b;
          },
          Ua(a, b) {
            for (var c of ["mode", "atime", "mtime", "ctime"]) null != b[c] && (a[c] = b[c]);
            void 0 !== b.size && (b = b.size, a.Ra != b && (0 == b ? (a.Na = null, a.Ra = 0) : (c = a.Na, a.Na = new Uint8Array(b), c && a.Na.set(c.subarray(0, Math.min(b, a.Ra))), a.Ra = b)));
          },
          lookup() {
            O.nb || (O.nb = new N(44), O.nb.stack = "<generic error, no stack>");
            throw O.nb;
          },
          ib(a, b, c, d) {
            return O.createNode(a, b, c, d);
          },
          rename(a, b, c) {
            try {
              var d = Q(b, c);
            } catch (g) {
            }
            if (d) {
              if (P(a.mode)) for (var e in d.Na) throw new N(55);
              Ab(d);
            }
            delete a.parent.Na[a.name];
            b.Na[c] = a;
            a.name = c;
            b.ctime = b.mtime = a.parent.ctime = a.parent.mtime = Date.now();
          },
          unlink(a, b) {
            delete a.Na[b];
            a.ctime = a.mtime = Date.now();
          },
          rmdir(a, b) {
            var c = Q(a, b), d;
            for (d in c.Na) throw new N(55);
            delete a.Na[b];
            a.ctime = a.mtime = Date.now();
          },
          readdir(a) {
            return [".", "..", ...Object.keys(a.Na)];
          },
          symlink(a, b, c) {
            a = O.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          readlink(a) {
            if (40960 !== (a.mode & 61440)) throw new N(28);
            return a.link;
          }
        }, Ma: { read(a, b, c, d, e) {
          var g = a.node.Na;
          if (e >= a.node.Ra) return 0;
          a = Math.min(a.node.Ra - e, d);
          if (8 < a && g.subarray) b.set(g.subarray(e, e + a), c);
          else for (d = 0; d < a; d++) b[c + d] = g[e + d];
          return a;
        }, write(a, b, c, d, e, g) {
          b.buffer === m.buffer && (g = false);
          if (!d) return 0;
          a = a.node;
          a.mtime = a.ctime = Date.now();
          if (b.subarray && (!a.Na || a.Na.subarray)) {
            if (g) return a.Na = b.subarray(c, c + d), a.Ra = d;
            if (0 === a.Ra && 0 === e) return a.Na = b.slice(c, c + d), a.Ra = d;
            if (e + d <= a.Ra) return a.Na.set(b.subarray(c, c + d), e), d;
          }
          g = e + d;
          var h = a.Na ? a.Na.length : 0;
          h >= g || (g = Math.max(g, h * (1048576 > h ? 2 : 1.125) >>> 0), 0 != h && (g = Math.max(g, 256)), h = a.Na, a.Na = new Uint8Array(g), 0 < a.Ra && a.Na.set(h.subarray(0, a.Ra), 0));
          if (a.Na.subarray && b.subarray) a.Na.set(b.subarray(c, c + d), e);
          else for (g = 0; g < d; g++) a.Na[e + g] = b[c + g];
          a.Ra = Math.max(a.Ra, e + d);
          return d;
        }, Va(a, b, c) {
          1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.Ra);
          if (0 > b) throw new N(28);
          return b;
        }, jb(a, b, c, d, e) {
          if (32768 !== (a.node.mode & 61440)) throw new N(43);
          a = a.node.Na;
          if (e & 2 || !a || a.buffer !== m.buffer) {
            e = true;
            d = 65536 * Math.ceil(b / 65536);
            var g = Bb(65536, d);
            g && C.fill(0, g, g + d);
            d = g;
            if (!d) throw new N(48);
            if (a) {
              if (0 < c || c + b < a.length) a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
              m.set(a, d);
            }
          } else e = false, d = a.byteOffset;
          return { Xb: d, Eb: e };
        }, kb(a, b, c, d) {
          O.Ma.write(a, b, 0, d, c, false);
          return 0;
        } } }, ja = (a, b) => {
          var c = 0;
          a && (c |= 365);
          b && (c |= 146);
          return c;
        }, Cb = null, Db = {}, Eb = [], Fb = 1, R = null, Gb = false, Hb = true, N = class {
          name = "ErrnoError";
          constructor(a) {
            this.Pa = a;
          }
        }, Ib = class {
          hb = {};
          node = null;
          get flags() {
            return this.hb.flags;
          }
          set flags(a) {
            this.hb.flags = a;
          }
          get position() {
            return this.hb.position;
          }
          set position(a) {
            this.hb.position = a;
          }
        }, Jb = class {
          La = {};
          Ma = {};
          bb = null;
          constructor(a, b, c, d) {
            a ||= this;
            this.parent = a;
            this.Xa = a.Xa;
            this.id = Fb++;
            this.name = b;
            this.mode = c;
            this.rdev = d;
            this.atime = this.mtime = this.ctime = Date.now();
          }
          get read() {
            return 365 === (this.mode & 365);
          }
          set read(a) {
            a ? this.mode |= 365 : this.mode &= -366;
          }
          get write() {
            return 146 === (this.mode & 146);
          }
          set write(a) {
            a ? this.mode |= 146 : this.mode &= -147;
          }
        };
        function S(a, b = {}) {
          if (!a) throw new N(44);
          b.pb ?? (b.pb = true);
          "/" === a.charAt(0) || (a = "//" + a);
          var c = 0;
          a: for (; 40 > c; c++) {
            a = a.split("/").filter((q) => !!q);
            for (var d = Cb, e = "/", g = 0; g < a.length; g++) {
              var h = g === a.length - 1;
              if (h && b.parent) break;
              if ("." !== a[g]) if (".." === a[g]) if (e = bb(e), d === d.parent) {
                a = e + "/" + a.slice(g + 1).join("/");
                c--;
                continue a;
              } else d = d.parent;
              else {
                e = ia(e + "/" + a[g]);
                try {
                  d = Q(d, a[g]);
                } catch (q) {
                  if (44 === q?.Pa && h && b.Wb) return { path: e };
                  throw q;
                }
                !d.bb || h && !b.pb || (d = d.bb.root);
                if (40960 === (d.mode & 61440) && (!h || b.ab)) {
                  if (!d.La.readlink) throw new N(52);
                  d = d.La.readlink(d);
                  "/" === d.charAt(0) || (d = bb(e) + "/" + d);
                  a = d + "/" + a.slice(g + 1).join("/");
                  continue a;
                }
              }
            }
            return { path: e, node: d };
          }
          throw new N(32);
        }
        function ha(a) {
          for (var b; ; ) {
            if (a === a.parent) return a = a.Xa.Db, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
            b = b ? `${a.name}/${b}` : a.name;
            a = a.parent;
          }
        }
        function Kb(a, b) {
          for (var c = 0, d = 0; d < b.length; d++) c = (c << 5) - c + b.charCodeAt(d) | 0;
          return (a + c >>> 0) % R.length;
        }
        function Ab(a) {
          var b = Kb(a.parent.id, a.name);
          if (R[b] === a) R[b] = a.cb;
          else for (b = R[b]; b; ) {
            if (b.cb === a) {
              b.cb = a.cb;
              break;
            }
            b = b.cb;
          }
        }
        function Q(a, b) {
          var c = P(a.mode) ? (c = Lb(a, "x")) ? c : a.La.lookup ? 0 : 2 : 54;
          if (c) throw new N(c);
          for (c = R[Kb(a.id, b)]; c; c = c.cb) {
            var d = c.name;
            if (c.parent.id === a.id && d === b) return c;
          }
          return a.La.lookup(a, b);
        }
        function zb(a, b, c, d) {
          a = new Jb(a, b, c, d);
          b = Kb(a.parent.id, a.name);
          a.cb = R[b];
          return R[b] = a;
        }
        function P(a) {
          return 16384 === (a & 61440);
        }
        function Lb(a, b) {
          return Hb ? 0 : b.includes("r") && !(a.mode & 292) || b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73) ? 2 : 0;
        }
        function Mb(a, b) {
          if (!P(a.mode)) return 54;
          try {
            return Q(a, b), 20;
          } catch (c) {
          }
          return Lb(a, "wx");
        }
        function Nb(a, b, c) {
          try {
            var d = Q(a, b);
          } catch (e) {
            return e.Pa;
          }
          if (a = Lb(a, "wx")) return a;
          if (c) {
            if (!P(d.mode)) return 54;
            if (d === d.parent || "/" === ha(d)) return 10;
          } else if (P(d.mode)) return 31;
          return 0;
        }
        function Ob(a) {
          if (!a) throw new N(63);
          return a;
        }
        function T(a) {
          a = Eb[a];
          if (!a) throw new N(8);
          return a;
        }
        function Pb(a, b = -1) {
          a = Object.assign(new Ib(), a);
          if (-1 == b) a: {
            for (b = 0; 4096 >= b; b++) if (!Eb[b]) break a;
            throw new N(33);
          }
          a.fd = b;
          return Eb[b] = a;
        }
        function Qb(a, b = -1) {
          a = Pb(a, b);
          a.Ma?.ec?.(a);
          return a;
        }
        function Rb(a, b, c) {
          var d = a?.Ma.Ua;
          a = d ? a : b;
          d ??= b.La.Ua;
          Ob(d);
          d(a, c);
        }
        var yb = { open(a) {
          a.Ma = Db[a.node.rdev].Ma;
          a.Ma.open?.(a);
        }, Va() {
          throw new N(70);
        } };
        function mb(a, b) {
          Db[a] = { Ma: b };
        }
        function Sb(a, b) {
          var c = "/" === b;
          if (c && Cb) throw new N(10);
          if (!c && b) {
            var d = S(b, { pb: false });
            b = d.path;
            d = d.node;
            if (d.bb) throw new N(10);
            if (!P(d.mode)) throw new N(54);
          }
          b = { type: a, kc: {}, Db: b, Vb: [] };
          a = a.Xa(b);
          a.Xa = b;
          b.root = a;
          c ? Cb = a : d && (d.bb = b, d.Xa && d.Xa.Vb.push(b));
        }
        function Tb(a, b, c) {
          var d = S(a, { parent: true }).node;
          a = cb(a);
          if (!a) throw new N(28);
          if ("." === a || ".." === a) throw new N(20);
          var e = Mb(d, a);
          if (e) throw new N(e);
          if (!d.La.ib) throw new N(63);
          return d.La.ib(d, a, b, c);
        }
        function ka(a, b = 438) {
          return Tb(a, b & 4095 | 32768, 0);
        }
        function U(a, b = 511) {
          return Tb(a, b & 1023 | 16384, 0);
        }
        function Ub(a, b, c) {
          "undefined" == typeof c && (c = b, b = 438);
          Tb(a, b | 8192, c);
        }
        function Vb(a, b) {
          if (!fb(a)) throw new N(44);
          var c = S(b, { parent: true }).node;
          if (!c) throw new N(44);
          b = cb(b);
          var d = Mb(c, b);
          if (d) throw new N(d);
          if (!c.La.symlink) throw new N(63);
          c.La.symlink(c, b, a);
        }
        function Wb(a) {
          var b = S(a, { parent: true }).node;
          a = cb(a);
          var c = Q(b, a), d = Nb(b, a, true);
          if (d) throw new N(d);
          if (!b.La.rmdir) throw new N(63);
          if (c.bb) throw new N(10);
          b.La.rmdir(b, a);
          Ab(c);
        }
        function ua(a) {
          var b = S(a, { parent: true }).node;
          if (!b) throw new N(44);
          a = cb(a);
          var c = Q(b, a), d = Nb(b, a, false);
          if (d) throw new N(d);
          if (!b.La.unlink) throw new N(63);
          if (c.bb) throw new N(10);
          b.La.unlink(b, a);
          Ab(c);
        }
        function Xb(a, b) {
          a = S(a, { ab: !b }).node;
          return Ob(a.La.Ta)(a);
        }
        function Yb(a, b, c, d) {
          Rb(a, b, { mode: c & 4095 | b.mode & -4096, ctime: Date.now(), Lb: d });
        }
        function la(a, b) {
          a = "string" == typeof a ? S(a, { ab: true }).node : a;
          Yb(null, a, b);
        }
        function Zb(a, b, c) {
          if (P(b.mode)) throw new N(31);
          if (32768 !== (b.mode & 61440)) throw new N(28);
          var d = Lb(b, "w");
          if (d) throw new N(d);
          Rb(a, b, { size: c, timestamp: Date.now() });
        }
        function ma(a, b, c = 438) {
          if ("" === a) throw new N(44);
          if ("string" == typeof b) {
            var d = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
            if ("undefined" == typeof d) throw Error(`Unknown file open mode: ${b}`);
            b = d;
          }
          c = b & 64 ? c & 4095 | 32768 : 0;
          if ("object" == typeof a) d = a;
          else {
            var e = a.endsWith("/");
            var g = S(a, { ab: !(b & 131072), Wb: true });
            d = g.node;
            a = g.path;
          }
          g = false;
          if (b & 64) if (d) {
            if (b & 128) throw new N(20);
          } else {
            if (e) throw new N(31);
            d = Tb(a, c | 511, 0);
            g = true;
          }
          if (!d) throw new N(44);
          8192 === (d.mode & 61440) && (b &= -513);
          if (b & 65536 && !P(d.mode)) throw new N(54);
          if (!g && (d ? 40960 === (d.mode & 61440) ? e = 32 : (e = ["r", "w", "rw"][b & 3], b & 512 && (e += "w"), e = P(d.mode) && ("r" !== e || b & 576) ? 31 : Lb(d, e)) : e = 44, e)) throw new N(e);
          b & 512 && !g && (e = d, e = "string" == typeof e ? S(e, { ab: true }).node : e, Zb(null, e, 0));
          b = Pb({ node: d, path: ha(d), flags: b & -131713, seekable: true, position: 0, Ma: d.Ma, Yb: [], error: false });
          b.Ma.open && b.Ma.open(b);
          g && la(d, c & 511);
          return b;
        }
        function oa(a) {
          if (null === a.fd) throw new N(8);
          a.rb && (a.rb = null);
          try {
            a.Ma.close && a.Ma.close(a);
          } catch (b) {
            throw b;
          } finally {
            Eb[a.fd] = null;
          }
          a.fd = null;
        }
        function $b(a, b, c) {
          if (null === a.fd) throw new N(8);
          if (!a.seekable || !a.Ma.Va) throw new N(70);
          if (0 != c && 1 != c && 2 != c) throw new N(28);
          a.position = a.Ma.Va(a, b, c);
          a.Yb = [];
        }
        function ac(a, b, c, d, e) {
          if (0 > d || 0 > e) throw new N(28);
          if (null === a.fd) throw new N(8);
          if (1 === (a.flags & 2097155)) throw new N(8);
          if (P(a.node.mode)) throw new N(31);
          if (!a.Ma.read) throw new N(28);
          var g = "undefined" != typeof e;
          if (!g) e = a.position;
          else if (!a.seekable) throw new N(70);
          b = a.Ma.read(a, b, c, d, e);
          g || (a.position += b);
          return b;
        }
        function na(a, b, c, d, e) {
          if (0 > d || 0 > e) throw new N(28);
          if (null === a.fd) throw new N(8);
          if (0 === (a.flags & 2097155)) throw new N(8);
          if (P(a.node.mode)) throw new N(31);
          if (!a.Ma.write) throw new N(28);
          a.seekable && a.flags & 1024 && $b(a, 0, 2);
          var g = "undefined" != typeof e;
          if (!g) e = a.position;
          else if (!a.seekable) throw new N(70);
          b = a.Ma.write(a, b, c, d, e, void 0);
          g || (a.position += b);
          return b;
        }
        function ta(a) {
          var b = b || 0;
          var c = "binary";
          "utf8" !== c && "binary" !== c && Ma(`Invalid encoding type "${c}"`);
          b = ma(a, b);
          a = Xb(a).size;
          var d = new Uint8Array(a);
          ac(b, d, 0, a, 0);
          "utf8" === c && (d = gb(d));
          oa(b);
          return d;
        }
        function W(a, b, c) {
          a = ia("/dev/" + a);
          var d = ja(!!b, !!c);
          W.Cb ?? (W.Cb = 64);
          var e = W.Cb++ << 8 | 0;
          mb(e, { open(g) {
            g.seekable = false;
          }, close() {
            c?.buffer?.length && c(10);
          }, read(g, h, q, w) {
            for (var t = 0, x = 0; x < w; x++) {
              try {
                var D = b();
              } catch (pb) {
                throw new N(29);
              }
              if (void 0 === D && 0 === t) throw new N(6);
              if (null === D || void 0 === D) break;
              t++;
              h[q + x] = D;
            }
            t && (g.node.atime = Date.now());
            return t;
          }, write(g, h, q, w) {
            for (var t = 0; t < w; t++) try {
              c(h[q + t]);
            } catch (x) {
              throw new N(29);
            }
            w && (g.node.mtime = g.node.ctime = Date.now());
            return t;
          } });
          Ub(a, d, e);
        }
        var X = {};
        function Y(a, b, c) {
          if ("/" === b.charAt(0)) return b;
          a = -100 === a ? "/" : T(a).path;
          if (0 == b.length) {
            if (!c) throw new N(44);
            return a;
          }
          return a + "/" + b;
        }
        function kc(a, b) {
          F[a >> 2] = b.dev;
          F[a + 4 >> 2] = b.mode;
          F[a + 8 >> 2] = b.nlink;
          F[a + 12 >> 2] = b.uid;
          F[a + 16 >> 2] = b.gid;
          F[a + 20 >> 2] = b.rdev;
          G[a + 24 >> 3] = BigInt(b.size);
          E[a + 32 >> 2] = 4096;
          E[a + 36 >> 2] = b.blocks;
          var c = b.atime.getTime(), d = b.mtime.getTime(), e = b.ctime.getTime();
          G[a + 40 >> 3] = BigInt(Math.floor(c / 1e3));
          F[a + 48 >> 2] = c % 1e3 * 1e6;
          G[a + 56 >> 3] = BigInt(Math.floor(d / 1e3));
          F[a + 64 >> 2] = d % 1e3 * 1e6;
          G[a + 72 >> 3] = BigInt(Math.floor(e / 1e3));
          F[a + 80 >> 2] = e % 1e3 * 1e6;
          G[a + 88 >> 3] = BigInt(b.ino);
          return 0;
        }
        var Cc = void 0, Ec = () => {
          var a = E[+Cc >> 2];
          Cc += 4;
          return a;
        }, Fc = 0, Gc = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Hc = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], Ic = {}, Jc = (a) => {
          Ga = a;
          Ya || 0 < Fc || (k.onExit?.(a), Fa = true);
          xa(a, new Sa(a));
        }, Kc = (a) => {
          if (!Fa) try {
            a();
          } catch (b) {
            b instanceof Sa || "unwind" == b || xa(1, b);
          } finally {
            if (!(Ya || 0 < Fc)) try {
              Ga = a = Ga, Jc(a);
            } catch (b) {
              b instanceof Sa || "unwind" == b || xa(1, b);
            }
          }
        }, Lc = {}, Nc = () => {
          if (!Mc) {
            var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8", _: wa || "./this.program" }, b;
            for (b in Lc) void 0 === Lc[b] ? delete a[b] : a[b] = Lc[b];
            var c = [];
            for (b in a) c.push(`${b}=${a[b]}`);
            Mc = c;
          }
          return Mc;
        }, Mc, Oc = (a, b, c, d) => {
          var e = { string: (t) => {
            var x = 0;
            if (null !== t && void 0 !== t && 0 !== t) {
              x = ib(t) + 1;
              var D = y(x);
              M(t, C, D, x);
              x = D;
            }
            return x;
          }, array: (t) => {
            var x = y(t.length);
            m.set(t, x);
            return x;
          } };
          a = k["_" + a];
          var g = [], h = 0;
          if (d) for (var q = 0; q < d.length; q++) {
            var w = e[c[q]];
            w ? (0 === h && (h = pa()), g[q] = w(d[q])) : g[q] = d[q];
          }
          c = a(...g);
          return c = (function(t) {
            0 !== h && ra(h);
            return "string" === b ? z(t) : "boolean" === b ? !!t : t;
          })(c);
        }, fa = (a) => {
          var b = ib(a) + 1, c = da(b);
          c && M(a, C, c, b);
          return c;
        }, Pc, Qc = [], A = (a) => {
          Pc.delete(Z.get(a));
          Z.set(a, null);
          Qc.push(a);
        }, Rc = (a) => {
          const b = a.length;
          return [b % 128 | 128, b >> 7, ...a];
        }, Sc = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 }, Tc = (a) => Rc(Array.from(a, (b) => Sc[b])), va = (a, b) => {
          if (!Pc) {
            Pc = /* @__PURE__ */ new WeakMap();
            var c = Z.length;
            if (Pc) for (var d = 0; d < 0 + c; d++) {
              var e = Z.get(d);
              e && Pc.set(e, d);
            }
          }
          if (c = Pc.get(a) || 0) return c;
          c = Qc.length ? Qc.pop() : Z.grow(1);
          try {
            Z.set(c, a);
          } catch (g) {
            if (!(g instanceof TypeError)) throw g;
            b = Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0, 1, ...Rc([1, 96, ...Tc(b.slice(1)), ...Tc("v" === b[0] ? "" : b[0])]), 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
            b = new WebAssembly.Module(b);
            b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
            Z.set(c, b);
          }
          Pc.set(a, c);
          return c;
        };
        R = Array(4096);
        Sb(O, "/");
        U("/tmp");
        U("/home");
        U("/home/web_user");
        (function() {
          U("/dev");
          mb(259, { read: () => 0, write: (d, e, g, h) => h, Va: () => 0 });
          Ub("/dev/null", 259);
          kb(1280, wb);
          kb(1536, xb);
          Ub("/dev/tty", 1280);
          Ub("/dev/tty1", 1536);
          var a = new Uint8Array(1024), b = 0, c = () => {
            0 === b && (eb(a), b = a.byteLength);
            return a[--b];
          };
          W("random", c);
          W("urandom", c);
          U("/dev/shm");
          U("/dev/shm/tmp");
        })();
        (function() {
          U("/proc");
          var a = U("/proc/self");
          U("/proc/self/fd");
          Sb({ Xa() {
            var b = zb(a, "fd", 16895, 73);
            b.Ma = { Va: O.Ma.Va };
            b.La = { lookup(c, d) {
              c = +d;
              var e = T(c);
              c = { parent: null, Xa: { Db: "fake" }, La: { readlink: () => e.path }, id: c + 1 };
              return c.parent = c;
            }, readdir() {
              return Array.from(Eb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
            } };
            return b;
          } }, "/proc/self/fd");
        })();
        k.noExitRuntime && (Ya = k.noExitRuntime);
        k.print && (Da = k.print);
        k.printErr && (B = k.printErr);
        k.wasmBinary && (Ea = k.wasmBinary);
        k.thisProgram && (wa = k.thisProgram);
        if (k.preInit) for ("function" == typeof k.preInit && (k.preInit = [k.preInit]); 0 < k.preInit.length; ) k.preInit.shift()();
        k.stackSave = () => pa();
        k.stackRestore = (a) => ra(a);
        k.stackAlloc = (a) => y(a);
        k.cwrap = (a, b, c, d) => {
          var e = !c || c.every((g) => "number" === g || "boolean" === g);
          return "string" !== b && e && !d ? k["_" + a] : (...g) => Oc(a, b, c, g);
        };
        k.addFunction = va;
        k.removeFunction = A;
        k.UTF8ToString = z;
        k.stringToNewUTF8 = fa;
        k.writeArrayToMemory = (a, b) => {
          m.set(a, b);
        };
        var da, ea, Bb, Uc, ra, y, pa, La, Z, Vc = {
          a: (a, b, c, d) => Ma(`Assertion failed: ${z(a)}, at: ` + [b ? z(b) : "unknown filename", c, d ? z(d) : "unknown function"]),
          i: function(a, b) {
            try {
              return a = z(a), la(a, b), 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          L: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b);
              if (c & -8) return -28;
              var d = S(b, { ab: true }).node;
              if (!d) return -44;
              a = "";
              c & 4 && (a += "r");
              c & 2 && (a += "w");
              c & 1 && (a += "x");
              return a && Lb(d, a) ? -2 : 0;
            } catch (e) {
              if ("undefined" == typeof X || "ErrnoError" !== e.name) throw e;
              return -e.Pa;
            }
          },
          j: function(a, b) {
            try {
              var c = T(a);
              Yb(c, c.node, b, false);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          h: function(a) {
            try {
              var b = T(a);
              Rb(b, b.node, { timestamp: Date.now(), Lb: false });
              return 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          b: function(a, b, c) {
            Cc = c;
            try {
              var d = T(a);
              switch (b) {
                case 0:
                  var e = Ec();
                  if (0 > e) break;
                  for (; Eb[e]; ) e++;
                  return Qb(d, e).fd;
                case 1:
                case 2:
                  return 0;
                case 3:
                  return d.flags;
                case 4:
                  return e = Ec(), d.flags |= e, 0;
                case 12:
                  return e = Ec(), Ha[e + 0 >> 1] = 2, 0;
                case 13:
                case 14:
                  return 0;
              }
              return -28;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          g: function(a, b) {
            try {
              var c = T(a), d = c.node, e = c.Ma.Ta;
              a = e ? c : d;
              e ??= d.La.Ta;
              Ob(e);
              var g = e(a);
              return kc(b, g);
            } catch (h) {
              if ("undefined" == typeof X || "ErrnoError" !== h.name) throw h;
              return -h.Pa;
            }
          },
          H: function(a, b) {
            b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
            try {
              if (isNaN(b)) return -61;
              var c = T(a);
              if (0 > b || 0 === (c.flags & 2097155)) throw new N(28);
              Zb(c, c.node, b);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          G: function(a, b) {
            try {
              if (0 === b) return -28;
              var c = ib("/") + 1;
              if (b < c) return -68;
              M("/", C, a, b);
              return c;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          K: function(a, b) {
            try {
              return a = z(a), kc(b, Xb(a, true));
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          C: function(a, b, c) {
            try {
              return b = z(b), b = Y(a, b), U(b, c), 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          J: function(a, b, c, d) {
            try {
              b = z(b);
              var e = d & 256;
              b = Y(a, b, d & 4096);
              return kc(c, e ? Xb(b, true) : Xb(b));
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          x: function(a, b, c, d) {
            Cc = d;
            try {
              b = z(b);
              b = Y(a, b);
              var e = d ? Ec() : 0;
              return ma(b, c, e).fd;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return -g.Pa;
            }
          },
          v: function(a, b, c, d) {
            try {
              b = z(b);
              b = Y(a, b);
              if (0 >= d) return -28;
              var e = S(b).node;
              if (!e) throw new N(44);
              if (!e.La.readlink) throw new N(28);
              var g = e.La.readlink(e);
              var h = Math.min(d, ib(g)), q = m[c + h];
              M(
                g,
                C,
                c,
                d + 1
              );
              m[c + h] = q;
              return h;
            } catch (w) {
              if ("undefined" == typeof X || "ErrnoError" !== w.name) throw w;
              return -w.Pa;
            }
          },
          u: function(a) {
            try {
              return a = z(a), Wb(a), 0;
            } catch (b) {
              if ("undefined" == typeof X || "ErrnoError" !== b.name) throw b;
              return -b.Pa;
            }
          },
          f: function(a, b) {
            try {
              return a = z(a), kc(b, Xb(a));
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return -c.Pa;
            }
          },
          r: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b);
              if (c) if (512 === c) Wb(b);
              else return -28;
              else ua(b);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return -d.Pa;
            }
          },
          q: function(a, b, c) {
            try {
              b = z(b);
              b = Y(a, b, true);
              var d = Date.now(), e, g;
              if (c) {
                var h = F[c >> 2] + 4294967296 * E[c + 4 >> 2], q = E[c + 8 >> 2];
                1073741823 == q ? e = d : 1073741822 == q ? e = null : e = 1e3 * h + q / 1e6;
                c += 16;
                h = F[c >> 2] + 4294967296 * E[c + 4 >> 2];
                q = E[c + 8 >> 2];
                1073741823 == q ? g = d : 1073741822 == q ? g = null : g = 1e3 * h + q / 1e6;
              } else g = e = d;
              if (null !== (g ?? e)) {
                a = e;
                var w = S(b, { ab: true }).node;
                Ob(w.La.Ua)(w, { atime: a, mtime: g });
              }
              return 0;
            } catch (t) {
              if ("undefined" == typeof X || "ErrnoError" !== t.name) throw t;
              return -t.Pa;
            }
          },
          m: () => Ma(""),
          l: () => {
            Ya = false;
            Fc = 0;
          },
          A: function(a, b) {
            a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
            a = new Date(1e3 * a);
            E[b >> 2] = a.getSeconds();
            E[b + 4 >> 2] = a.getMinutes();
            E[b + 8 >> 2] = a.getHours();
            E[b + 12 >> 2] = a.getDate();
            E[b + 16 >> 2] = a.getMonth();
            E[b + 20 >> 2] = a.getFullYear() - 1900;
            E[b + 24 >> 2] = a.getDay();
            var c = a.getFullYear();
            E[b + 28 >> 2] = (0 !== c % 4 || 0 === c % 100 && 0 !== c % 400 ? Hc : Gc)[a.getMonth()] + a.getDate() - 1 | 0;
            E[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
            c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
            var d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
            E[b + 32 >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
          },
          y: function(a, b, c, d, e, g, h) {
            e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e);
            try {
              var q = T(d);
              if (0 !== (b & 2) && 0 === (c & 2) && 2 !== (q.flags & 2097155)) throw new N(2);
              if (1 === (q.flags & 2097155)) throw new N(2);
              if (!q.Ma.jb) throw new N(43);
              if (!a) throw new N(28);
              var w = q.Ma.jb(q, a, e, b, c);
              var t = w.Xb;
              E[g >> 2] = w.Eb;
              F[h >> 2] = t;
              return 0;
            } catch (x) {
              if ("undefined" == typeof X || "ErrnoError" !== x.name) throw x;
              return -x.Pa;
            }
          },
          z: function(a, b, c, d, e, g) {
            g = -9007199254740992 > g || 9007199254740992 < g ? NaN : Number(g);
            try {
              var h = T(e);
              if (c & 2) {
                c = g;
                if (32768 !== (h.node.mode & 61440)) throw new N(43);
                if (!(d & 2)) {
                  var q = C.slice(a, a + b);
                  h.Ma.kb && h.Ma.kb(h, q, c, b, d);
                }
              }
            } catch (w) {
              if ("undefined" == typeof X || "ErrnoError" !== w.name) throw w;
              return -w.Pa;
            }
          },
          n: (a, b) => {
            Ic[a] && (clearTimeout(Ic[a].id), delete Ic[a]);
            if (!b) return 0;
            var c = setTimeout(() => {
              delete Ic[a];
              Kc(() => Uc(a, performance.now()));
            }, b);
            Ic[a] = { id: c, lc: b };
            return 0;
          },
          B: (a, b, c, d) => {
            var e = (/* @__PURE__ */ new Date()).getFullYear(), g = new Date(e, 0, 1).getTimezoneOffset();
            e = new Date(e, 6, 1).getTimezoneOffset();
            F[a >> 2] = 60 * Math.max(g, e);
            E[b >> 2] = Number(g != e);
            b = (h) => {
              var q = Math.abs(h);
              return `UTC${0 <= h ? "-" : "+"}${String(Math.floor(q / 60)).padStart(2, "0")}${String(q % 60).padStart(2, "0")}`;
            };
            a = b(g);
            b = b(e);
            e < g ? (M(a, C, c, 17), M(b, C, d, 17)) : (M(a, C, d, 17), M(b, C, c, 17));
          },
          d: () => Date.now(),
          s: () => 2147483648,
          c: () => performance.now(),
          o: (a) => {
            var b = C.length;
            a >>>= 0;
            if (2147483648 < a) return false;
            for (var c = 1; 4 >= c; c *= 2) {
              var d = b * (1 + 0.2 / c);
              d = Math.min(d, a + 100663296);
              a: {
                d = (Math.min(2147483648, 65536 * Math.ceil(Math.max(
                  a,
                  d
                ) / 65536)) - La.buffer.byteLength + 65535) / 65536 | 0;
                try {
                  La.grow(d);
                  Ka();
                  var e = 1;
                  break a;
                } catch (g) {
                }
                e = void 0;
              }
              if (e) return true;
            }
            return false;
          },
          E: (a, b) => {
            var c = 0, d = 0, e;
            for (e of Nc()) {
              var g = b + c;
              F[a + d >> 2] = g;
              c += M(e, C, g, Infinity) + 1;
              d += 4;
            }
            return 0;
          },
          F: (a, b) => {
            var c = Nc();
            F[a >> 2] = c.length;
            a = 0;
            for (var d of c) a += ib(d) + 1;
            F[b >> 2] = a;
            return 0;
          },
          e: function(a) {
            try {
              var b = T(a);
              oa(b);
              return 0;
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return c.Pa;
            }
          },
          p: function(a, b) {
            try {
              var c = T(a);
              m[b] = c.tty ? 2 : P(c.mode) ? 3 : 40960 === (c.mode & 61440) ? 7 : 4;
              Ha[b + 2 >> 1] = 0;
              G[b + 8 >> 3] = BigInt(0);
              G[b + 16 >> 3] = BigInt(0);
              return 0;
            } catch (d) {
              if ("undefined" == typeof X || "ErrnoError" !== d.name) throw d;
              return d.Pa;
            }
          },
          w: function(a, b, c, d) {
            try {
              a: {
                var e = T(a);
                a = b;
                for (var g, h = b = 0; h < c; h++) {
                  var q = F[a >> 2], w = F[a + 4 >> 2];
                  a += 8;
                  var t = ac(e, m, q, w, g);
                  if (0 > t) {
                    var x = -1;
                    break a;
                  }
                  b += t;
                  if (t < w) break;
                  "undefined" != typeof g && (g += t);
                }
                x = b;
              }
              F[d >> 2] = x;
              return 0;
            } catch (D) {
              if ("undefined" == typeof X || "ErrnoError" !== D.name) throw D;
              return D.Pa;
            }
          },
          D: function(a, b, c, d) {
            b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
            try {
              if (isNaN(b)) return 61;
              var e = T(a);
              $b(e, b, c);
              G[d >> 3] = BigInt(e.position);
              e.rb && 0 === b && 0 === c && (e.rb = null);
              return 0;
            } catch (g) {
              if ("undefined" == typeof X || "ErrnoError" !== g.name) throw g;
              return g.Pa;
            }
          },
          I: function(a) {
            try {
              var b = T(a);
              return b.Ma?.fsync?.(b);
            } catch (c) {
              if ("undefined" == typeof X || "ErrnoError" !== c.name) throw c;
              return c.Pa;
            }
          },
          t: function(a, b, c, d) {
            try {
              a: {
                var e = T(a);
                a = b;
                for (var g, h = b = 0; h < c; h++) {
                  var q = F[a >> 2], w = F[a + 4 >> 2];
                  a += 8;
                  var t = na(e, m, q, w, g);
                  if (0 > t) {
                    var x = -1;
                    break a;
                  }
                  b += t;
                  if (t < w) break;
                  "undefined" != typeof g && (g += t);
                }
                x = b;
              }
              F[d >> 2] = x;
              return 0;
            } catch (D) {
              if ("undefined" == typeof X || "ErrnoError" !== D.name) throw D;
              return D.Pa;
            }
          },
          k: Jc
        };
        function Wc() {
          function a() {
            k.calledRun = true;
            if (!Fa) {
              if (!k.noFSInit && !Gb) {
                var b, c;
                Gb = true;
                b ??= k.stdin;
                c ??= k.stdout;
                d ??= k.stderr;
                b ? W("stdin", b) : Vb("/dev/tty", "/dev/stdin");
                c ? W("stdout", null, c) : Vb("/dev/tty", "/dev/stdout");
                d ? W("stderr", null, d) : Vb("/dev/tty1", "/dev/stderr");
                ma("/dev/stdin", 0);
                ma("/dev/stdout", 1);
                ma("/dev/stderr", 1);
              }
              Xc.N();
              Hb = false;
              k.onRuntimeInitialized?.();
              if (k.postRun) for ("function" == typeof k.postRun && (k.postRun = [k.postRun]); k.postRun.length; ) {
                var d = k.postRun.shift();
                Ua.push(d);
              }
              Ta(Ua);
            }
          }
          if (0 < J) Xa = Wc;
          else {
            if (k.preRun) for ("function" == typeof k.preRun && (k.preRun = [k.preRun]); k.preRun.length; ) Wa();
            Ta(Va);
            0 < J ? Xa = Wc : k.setStatus ? (k.setStatus("Running..."), setTimeout(() => {
              setTimeout(() => k.setStatus(""), 1);
              a();
            }, 1)) : a();
          }
        }
        var Xc;
        (async function() {
          function a(c) {
            c = Xc = c.exports;
            k._sqlite3_free = c.P;
            k._sqlite3_value_text = c.Q;
            k._sqlite3_prepare_v2 = c.R;
            k._sqlite3_step = c.S;
            k._sqlite3_reset = c.T;
            k._sqlite3_exec = c.U;
            k._sqlite3_finalize = c.V;
            k._sqlite3_column_name = c.W;
            k._sqlite3_column_text = c.X;
            k._sqlite3_column_type = c.Y;
            k._sqlite3_errmsg = c.Z;
            k._sqlite3_clear_bindings = c._;
            k._sqlite3_value_blob = c.$;
            k._sqlite3_value_bytes = c.aa;
            k._sqlite3_value_double = c.ba;
            k._sqlite3_value_int = c.ca;
            k._sqlite3_value_type = c.da;
            k._sqlite3_result_blob = c.ea;
            k._sqlite3_result_double = c.fa;
            k._sqlite3_result_error = c.ga;
            k._sqlite3_result_int = c.ha;
            k._sqlite3_result_int64 = c.ia;
            k._sqlite3_result_null = c.ja;
            k._sqlite3_result_text = c.ka;
            k._sqlite3_aggregate_context = c.la;
            k._sqlite3_column_count = c.ma;
            k._sqlite3_data_count = c.na;
            k._sqlite3_column_blob = c.oa;
            k._sqlite3_column_bytes = c.pa;
            k._sqlite3_column_double = c.qa;
            k._sqlite3_bind_blob = c.ra;
            k._sqlite3_bind_double = c.sa;
            k._sqlite3_bind_int = c.ta;
            k._sqlite3_bind_text = c.ua;
            k._sqlite3_bind_parameter_index = c.va;
            k._sqlite3_sql = c.wa;
            k._sqlite3_normalized_sql = c.xa;
            k._sqlite3_changes = c.ya;
            k._sqlite3_close_v2 = c.za;
            k._sqlite3_create_function_v2 = c.Aa;
            k._sqlite3_update_hook = c.Ba;
            k._sqlite3_open = c.Ca;
            da = k._malloc = c.Da;
            ea = k._free = c.Ea;
            k._RegisterExtensionFunctions = c.Fa;
            Bb = c.Ga;
            Uc = c.Ha;
            ra = c.Ia;
            y = c.Ja;
            pa = c.Ka;
            La = c.M;
            Z = c.O;
            Ka();
            J--;
            k.monitorRunDependencies?.(J);
            0 == J && Xa && (c = Xa, Xa = null, c());
            return Xc;
          }
          J++;
          k.monitorRunDependencies?.(J);
          var b = { a: Vc };
          if (k.instantiateWasm) return new Promise((c) => {
            k.instantiateWasm(b, (d, e) => {
              c(a(d, e));
            });
          });
          Na ??= k.locateFile ? k.locateFile("sql-wasm.wasm", za) : za + "sql-wasm.wasm";
          return a((await Ra(b)).instance);
        })();
        Wc();
        return Module;
      });
      return initSqlJsPromise;
    };
    if (typeof exports === "object" && typeof module === "object") {
      module.exports = initSqlJs2;
      module.exports.default = initSqlJs2;
    } else if (typeof define === "function" && define["amd"]) {
      define([], function() {
        return initSqlJs2;
      });
    } else if (typeof exports === "object") {
      exports["Module"] = initSqlJs2;
    }
  }
});

// packages/cli/src/index.ts
import fs9 from "node:fs";
import path11 from "node:path";

// packages/contracts/src/index.ts
import { createHash } from "node:crypto";

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json2 = JSON.stringify(obj, null, 2);
  return json2.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path12, errorMaps, issueData } = params;
  const fullPath = [...path12, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path12, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path12;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// packages/contracts/src/index.ts
var SCHEMA_VERSION = 1;
var PRODUCT_VERSION = "1.0.0";
var entityKinds = [
  "PROJECT",
  "TASK",
  "TODO",
  "CONTEXT_PACK",
  "BINDING",
  "OPERATION",
  "CHANGE_CANDIDATE",
  "CHECKPOINT",
  "LEASE",
  "KNOWLEDGE_CANDIDATE",
  "OFFICIAL_INFO_CANDIDATE",
  "ARTIFACT",
  "ARCHIVE"
];
var entityStates = [
  "DRAFT",
  "ACTIVE",
  "WAITING",
  "VERIFYING",
  "COMPLETED",
  "ARCHIVED",
  "ORPHANED",
  "MANUAL_INTERVENTION",
  "FAILED"
];
var entityInputSchema = external_exports.object({
  schemaVersion: external_exports.literal(SCHEMA_VERSION),
  id: external_exports.string().uuid(),
  kind: external_exports.enum(entityKinds),
  state: external_exports.enum(entityStates).default("DRAFT"),
  title: external_exports.string().trim().min(1).max(240),
  data: external_exports.record(external_exports.unknown()).default({})
});
var eventInputSchema = external_exports.object({
  schemaVersion: external_exports.literal(SCHEMA_VERSION),
  eventId: external_exports.string().uuid(),
  idempotencyKey: external_exports.string().trim().min(8).max(200),
  eventType: external_exports.string().trim().min(1).max(120),
  objectId: external_exports.string().uuid().nullable(),
  actor: external_exports.string().trim().min(1).max(160),
  timestamp: external_exports.string().datetime(),
  payload: external_exports.record(external_exports.unknown()).default({})
});
var allowedTransitions = {
  DRAFT: ["ACTIVE", "FAILED"],
  ACTIVE: ["WAITING", "VERIFYING", "ARCHIVED", "ORPHANED", "MANUAL_INTERVENTION", "FAILED"],
  WAITING: ["ACTIVE", "MANUAL_INTERVENTION", "FAILED"],
  VERIFYING: ["ACTIVE", "COMPLETED", "MANUAL_INTERVENTION", "FAILED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: ["ACTIVE", "COMPLETED"],
  ORPHANED: ["MANUAL_INTERVENTION", "ARCHIVED"],
  MANUAL_INTERVENTION: ["ACTIVE", "FAILED", "ARCHIVED"],
  FAILED: ["ACTIVE", "ARCHIVED"]
};
var actions = [
  "object.create",
  "object.read",
  "object.transition",
  "object.update",
  "object.archive",
  "event.append",
  "migration.apply",
  "diagnostic.run"
];
var rolePermissions = {
  OWNER: actions,
  SYSTEM: actions,
  OPERATOR: ["object.create", "object.read", "object.transition", "object.update", "object.archive", "event.append", "diagnostic.run"],
  VIEWER: ["object.read", "diagnostic.run"]
};
function assertAuthorized(role, action) {
  if (!rolePermissions[role]?.includes(action)) throw new Error(`PERMISSION_DENIED:${role}:${action}`);
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  }
  return value;
}
function canonicalJson(value) {
  return JSON.stringify(canonical(value));
}
function sha256Json(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
function stableUuidFromKey(key, namespace = "codex-work-platform") {
  const normalizedKey = key.trim();
  const normalizedNamespace = namespace.trim();
  if (!normalizedKey) throw new Error("STABLE_UUID_KEY_REQUIRED");
  if (!normalizedNamespace) throw new Error("STABLE_UUID_NAMESPACE_REQUIRED");
  const bytes = createHash("sha256").update(`${normalizedNamespace}\0${normalizedKey}`).digest().subarray(0, 16);
  bytes[6] = bytes[6] & 15 | 80;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function assertTransition(from, to) {
  if (!allowedTransitions[from]?.includes(to)) throw new Error(`INVALID_TRANSITION:${from}:${to}`);
}
var finalCriteria = Object.freeze([
  "F01_VERSIONED_INSTALL_UPGRADE_ARCHIVE",
  "F02_STABLE_CODEX_ENTRY_WITH_FALLBACK",
  "F03_REAL_KERNEL_DATA",
  "F04_COMPLETE_LIFECYCLE",
  "F05_RESTART_AND_RETRY_CONSISTENCY",
  "F06_EXPLICIT_FINITE_TERMINALS",
  "F07_FOUR_PART_COMPLETION",
  "F08_LAYERED_VERIFICATION",
  "F09_NONPARTICIPANT_HUMAN_ACCEPTANCE",
  "F10_TRACEABLE_NO_MANUAL_DB_EDIT"
]);

// packages/kernel/src/index.ts
var import_sql = __toESM(require_sql_wasm(), 1);
import { createRequire } from "node:module";
import crypto2 from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var require2 = createRequire(import.meta.url);
var sqlPromise;
var writeQueues = /* @__PURE__ */ new Map();
async function acquireWriteLease(databasePath) {
  const prior = writeQueues.get(databasePath) ?? Promise.resolve();
  let releaseGate;
  const gate = new Promise((resolve) => {
    releaseGate = resolve;
  });
  const current = prior.then(() => gate);
  writeQueues.set(databasePath, current);
  await prior;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    releaseGate();
    if (writeQueues.get(databasePath) === current) writeQueues.delete(databasePath);
  };
}
function bytesSha256(bytes) {
  return crypto2.createHash("sha256").update(bytes).digest("hex");
}
function sqlRuntime() {
  const bundledWasm = path.join(path.dirname(fileURLToPath(import.meta.url)), "sql-wasm.wasm");
  const wasmPath = fs.existsSync(bundledWasm) ? bundledWasm : require2.resolve("sql.js/dist/sql-wasm.wasm");
  sqlPromise ??= (0, import_sql.default)({ locateFile: () => wasmPath });
  return sqlPromise;
}
function row(result) {
  const first = result?.[0];
  if (!first || first.values.length === 0) return null;
  return Object.fromEntries(first.columns.map((column, index) => [column, first.values[0][index]]));
}
function rows(result) {
  const first = result?.[0];
  if (!first) return [];
  return first.values.map((values) => Object.fromEntries(first.columns.map((column, index) => [column, values[index]])));
}
function resolveDatabasePath(env = process.env, runtimeCwd = process.cwd()) {
  const direct = env.CODEX_WORK_PLATFORM_DB?.trim();
  if (direct) {
    if (!path.isAbsolute(direct)) throw new Error("ABSOLUTE_PATH_REQUIRED:CODEX_WORK_PLATFORM_DB");
    return path.normalize(direct);
  }
  const dataDirectory = env.CODEX_WORK_PLATFORM_DATA_DIR?.trim();
  if (dataDirectory) {
    if (!path.isAbsolute(dataDirectory)) throw new Error("ABSOLUTE_PATH_REQUIRED:CODEX_WORK_PLATFORM_DATA_DIR");
    return path.join(path.normalize(dataDirectory), "platform.sqlite");
  }
  const pluginData = env.PLUGIN_DATA?.trim() || env.CLAUDE_PLUGIN_DATA?.trim();
  if (pluginData) {
    if (!path.isAbsolute(pluginData)) throw new Error("ABSOLUTE_PATH_REQUIRED:PLUGIN_DATA");
    return path.join(path.normalize(pluginData), "platform.sqlite");
  }
  const codexHome = env.CODEX_HOME?.trim();
  if (codexHome) {
    if (!path.isAbsolute(codexHome)) throw new Error("ABSOLUTE_PATH_REQUIRED:CODEX_HOME");
    return path.join(path.normalize(codexHome), "data", "codex-work-platform", "platform.sqlite");
  }
  const normalizedCwd = path.normalize(runtimeCwd);
  const cacheMarker = `${path.sep}plugins${path.sep}cache${path.sep}`;
  const markerIndex = normalizedCwd.lastIndexOf(cacheMarker);
  if (markerIndex > 0) {
    const suffix = normalizedCwd.slice(markerIndex + cacheMarker.length).split(path.sep).filter(Boolean);
    if (suffix.length >= 3) {
      const installedCodexHome = normalizedCwd.slice(0, markerIndex);
      return path.join(installedCodexHome, "data", "codex-work-platform", "platform.sqlite");
    }
  }
  throw new Error("CODEX_WORK_PLATFORM_DATA_PATH_REQUIRED");
}
var ControlKernel = class _ControlKernel {
  constructor(database, databasePath, actor, role, readOnly, integrityMode, releaseWriteLease, diskFingerprint) {
    this.database = database;
    this.databasePath = databasePath;
    this.actor = actor;
    this.role = role;
    this.readOnly = readOnly;
    this.integrityMode = integrityMode;
    this.releaseWriteLease = releaseWriteLease;
    this.diskFingerprint = diskFingerprint;
  }
  database;
  databasePath;
  actor;
  role;
  readOnly;
  integrityMode;
  releaseWriteLease;
  diskFingerprint;
  static async open(options) {
    if (!path.isAbsolute(options.databasePath)) throw new Error("ABSOLUTE_PATH_REQUIRED:databasePath");
    const databasePath = path.normalize(options.databasePath);
    const readOnly = options.readOnly ?? false;
    const releaseWriteLease = readOnly ? void 0 : await acquireWriteLease(databasePath);
    try {
      const SQL = await sqlRuntime();
      const exists = fs.existsSync(databasePath);
      if (readOnly && !exists) throw new Error("DATABASE_NOT_INITIALIZED");
      const sourceBytes = exists ? fs.readFileSync(databasePath) : null;
      const database = sourceBytes ? new SQL.Database(sourceBytes) : new SQL.Database();
      const integrityMode = options.integrityMode ?? "FULL";
      const kernel = new _ControlKernel(database, databasePath, options.actor, options.role ?? "OPERATOR", readOnly, integrityMode, releaseWriteLease, sourceBytes ? bytesSha256(sourceBytes) : null);
      if (!kernel.readOnly) kernel.initializeSchema();
      kernel.verifyIntegrity();
      if (!kernel.readOnly) kernel.persist();
      return kernel;
    } catch (error) {
      releaseWriteLease?.();
      throw error;
    }
  }
  assertWritable() {
    if (this.readOnly) throw new Error("READ_ONLY_KERNEL");
  }
  initializeSchema() {
    this.database.run(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS objects (
        id TEXT PRIMARY KEY,
        schema_version INTEGER NOT NULL,
        kind TEXT NOT NULL,
        state TEXT NOT NULL,
        title TEXT NOT NULL,
        data_json TEXT NOT NULL CHECK (json_valid(data_json)),
        version INTEGER NOT NULL,
        content_sha256 TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS events (
        sequence INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL UNIQUE,
        schema_version INTEGER NOT NULL,
        idempotency_key TEXT NOT NULL UNIQUE,
        event_type TEXT NOT NULL,
        object_id TEXT,
        actor TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
        payload_sha256 TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL,
        checksum TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS objects_kind_created_id ON objects(kind, created_at, id);
      CREATE INDEX IF NOT EXISTS objects_kind_project_created_id ON objects(kind, json_extract(data_json, '$.projectId'), created_at, id);
      CREATE INDEX IF NOT EXISTS objects_brief_scope_created_id ON objects(kind, json_extract(data_json, '$.projectId'), json_extract(data_json, '$.artifactType'), json_extract(data_json, '$.taskId'), json_extract(data_json, '$.section'), created_at, id);
      CREATE INDEX IF NOT EXISTS objects_todo_parent_created_id ON objects(kind, json_extract(data_json, '$.projectId'), json_extract(data_json, '$.parentTaskId'), created_at, id);
      CREATE INDEX IF NOT EXISTS objects_operation_task_created_id ON objects(kind, json_extract(data_json, '$.projectId'), json_extract(data_json, '$.action'), json_extract(data_json, '$.taskId'), created_at, id);
      CREATE TRIGGER IF NOT EXISTS events_no_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT, 'EVENTS_APPEND_ONLY'); END;
      CREATE TRIGGER IF NOT EXISTS events_no_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT, 'EVENTS_APPEND_ONLY'); END;
      INSERT OR IGNORE INTO metadata(key, value) VALUES ('schema_version', '${SCHEMA_VERSION}');
    `);
  }
  query(sql, params) {
    return this.database.exec(sql, params);
  }
  persist() {
    const directory = path.dirname(this.databasePath);
    fs.mkdirSync(directory, { recursive: true });
    const currentBytes = fs.existsSync(this.databasePath) ? fs.readFileSync(this.databasePath) : null;
    const currentFingerprint = currentBytes ? bytesSha256(currentBytes) : null;
    if (currentFingerprint !== this.diskFingerprint) throw new Error("DATABASE_EXTERNAL_WRITE_CONFLICT");
    const exported = this.database.export();
    const temporary = `${this.databasePath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(temporary, exported, { flag: "wx" });
    fs.renameSync(temporary, this.databasePath);
    this.diskFingerprint = bytesSha256(exported);
  }
  existingEvent(idempotencyKey2) {
    const found = row(this.query("SELECT * FROM events WHERE idempotency_key = ?", [idempotencyKey2]));
    return found ? this.eventFromRow(found) : null;
  }
  insertEvent(input) {
    const parsed = eventInputSchema.parse(input);
    const existing = this.existingEvent(parsed.idempotencyKey);
    const payloadHash = sha256Json(parsed.payload);
    if (existing) {
      const same = existing.eventType === parsed.eventType && existing.objectId === parsed.objectId && existing.payloadHash === payloadHash;
      if (!same) throw new Error(`IDEMPOTENCY_CONFLICT:${parsed.idempotencyKey}`);
      return { ...existing, deduplicated: true };
    }
    this.database.run(
      "INSERT INTO events(event_id,schema_version,idempotency_key,event_type,object_id,actor,timestamp,payload_json,payload_sha256) VALUES (?,?,?,?,?,?,?,?,?)",
      [parsed.eventId, parsed.schemaVersion, parsed.idempotencyKey, parsed.eventType, parsed.objectId, parsed.actor, parsed.timestamp, canonicalJson(parsed.payload), payloadHash]
    );
    const stored = this.existingEvent(parsed.idempotencyKey);
    if (!stored) throw new Error("EVENT_INSERT_NOT_OBSERVED");
    return stored;
  }
  appendEvent(input, role = this.role) {
    this.assertWritable();
    assertAuthorized(role, "event.append");
    const stored = this.insertEvent(input);
    this.persist();
    return stored;
  }
  createObject(input, idempotencyKey2, role = this.role) {
    this.assertWritable();
    assertAuthorized(role, "object.create");
    const parsed = entityInputSchema.parse(input);
    const existingEvent = this.existingEvent(idempotencyKey2);
    const existingObject = this.getObject(parsed.id, "SYSTEM");
    if (existingEvent) {
      if (!existingObject || existingEvent.objectId !== parsed.id || existingEvent.payloadHash !== sha256Json({ object: parsed })) throw new Error(`IDEMPOTENCY_CONFLICT:${idempotencyKey2}`);
      return existingObject;
    }
    if (existingObject) throw new Error(`OBJECT_ALREADY_EXISTS:${parsed.id}`);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const contentHash = sha256Json(parsed);
    this.database.run("BEGIN IMMEDIATE");
    try {
      this.database.run(
        "INSERT INTO objects(id,schema_version,kind,state,title,data_json,version,content_sha256,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [parsed.id, parsed.schemaVersion, parsed.kind, parsed.state, parsed.title, canonicalJson(parsed.data), 1, contentHash, now, now]
      );
      this.insertEvent({ schemaVersion: SCHEMA_VERSION, eventId: crypto2.randomUUID(), idempotencyKey: idempotencyKey2, eventType: `${parsed.kind}_CREATED`, objectId: parsed.id, actor: this.actor, timestamp: now, payload: { object: parsed } });
      this.database.run("COMMIT");
    } catch (error) {
      this.database.run("ROLLBACK");
      throw error;
    }
    this.persist();
    const stored = this.getObject(parsed.id, "SYSTEM");
    if (!stored) throw new Error("OBJECT_INSERT_NOT_OBSERVED");
    return stored;
  }
  createObjectsAtomically(items, role = this.role) {
    this.assertWritable();
    assertAuthorized(role, "object.create");
    if (items.length < 1 || items.length > 500) throw new Error("ATOMIC_CREATE_BATCH_SIZE_INVALID");
    const parsed = items.map((item) => ({ input: entityInputSchema.parse(item.input), idempotencyKey: item.idempotencyKey.trim() }));
    const ids = /* @__PURE__ */ new Set();
    const keys = /* @__PURE__ */ new Set();
    for (const item of parsed) {
      if (ids.has(item.input.id)) throw new Error(`ATOMIC_CREATE_DUPLICATE_OBJECT_ID:${item.input.id}`);
      if (keys.has(item.idempotencyKey)) throw new Error(`ATOMIC_CREATE_DUPLICATE_IDEMPOTENCY_KEY:${item.idempotencyKey}`);
      ids.add(item.input.id);
      keys.add(item.idempotencyKey);
      eventInputSchema.parse({
        schemaVersion: SCHEMA_VERSION,
        eventId: crypto2.randomUUID(),
        idempotencyKey: item.idempotencyKey,
        eventType: `${item.input.kind}_CREATED`,
        objectId: item.input.id,
        actor: this.actor,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        payload: { object: item.input }
      });
    }
    const replayed = parsed.map((item) => {
      const event = this.existingEvent(item.idempotencyKey);
      const object = this.getObject(item.input.id, "SYSTEM");
      if (!event && !object) return null;
      if (!event || !object || event.objectId !== item.input.id || event.payloadHash !== sha256Json({ object: item.input })) {
        throw new Error(`IDEMPOTENCY_CONFLICT:${item.idempotencyKey}`);
      }
      return object;
    });
    if (replayed.every((item) => item !== null)) return replayed;
    if (replayed.some((item) => item !== null)) throw new Error("ATOMIC_CREATE_PARTIAL_REPLAY");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.database.run("BEGIN IMMEDIATE");
    try {
      for (const item of parsed) {
        const contentHash = sha256Json(item.input);
        this.database.run(
          "INSERT INTO objects(id,schema_version,kind,state,title,data_json,version,content_sha256,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [item.input.id, item.input.schemaVersion, item.input.kind, item.input.state, item.input.title, canonicalJson(item.input.data), 1, contentHash, now, now]
        );
        this.insertEvent({
          schemaVersion: SCHEMA_VERSION,
          eventId: crypto2.randomUUID(),
          idempotencyKey: item.idempotencyKey,
          eventType: `${item.input.kind}_CREATED`,
          objectId: item.input.id,
          actor: this.actor,
          timestamp: now,
          payload: { object: item.input }
        });
      }
      this.database.run("COMMIT");
    } catch (error) {
      this.database.run("ROLLBACK");
      throw error;
    }
    this.persist();
    return parsed.map((item) => {
      const stored = this.getObject(item.input.id, "SYSTEM");
      if (!stored) throw new Error(`OBJECT_INSERT_NOT_OBSERVED:${item.input.id}`);
      return stored;
    });
  }
  getObject(id, role = this.role) {
    assertAuthorized(role, "object.read");
    const found = row(this.query("SELECT * FROM objects WHERE id = ?", [id]));
    if (!found) return null;
    const object = this.objectFromRow(found);
    this.verifyObjectHash(object);
    return object;
  }
  listObjects(kind, role = this.role) {
    assertAuthorized(role, "object.read");
    const found = kind ? this.query("SELECT * FROM objects WHERE kind = ? ORDER BY created_at,id", [kind]) : this.query("SELECT * FROM objects ORDER BY created_at,id");
    return rows(found).map((item) => this.objectFromRow(item));
  }
  countObjects(kind, projectId, role = this.role) {
    assertAuthorized(role, "object.read");
    const clauses = [];
    const params = [];
    if (kind) {
      clauses.push("kind = ?");
      params.push(kind);
    }
    if (projectId) {
      clauses.push("(id = ? OR json_extract(data_json, '$.projectId') = ?)");
      params.push(projectId, projectId);
    }
    const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
    return Number(row(this.query(`SELECT COUNT(*) AS count FROM objects${where}`, params))?.count ?? 0);
  }
  listObjectsPage(options = {}, role = this.role) {
    assertAuthorized(role, "object.read");
    const limit = options.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("OBJECT_PAGE_LIMIT_INVALID");
    const order = options.order ?? "ASC";
    const clauses = [];
    const params = [];
    if (options.kind) {
      clauses.push("kind = ?");
      params.push(options.kind);
    }
    if (options.projectId) {
      clauses.push("(id = ? OR json_extract(data_json, '$.projectId') = ?)");
      params.push(options.projectId, options.projectId);
    }
    for (const [key, value] of Object.entries(options.dataFilters ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
      if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key)) throw new Error(`OBJECT_PAGE_FILTER_INVALID:${key}`);
      clauses.push(value === null ? `json_extract(data_json, '$.${key}') IS NULL` : `json_extract(data_json, '$.${key}') = ?`);
      if (value !== null) params.push(value);
    }
    if (options.cursor) {
      const cursorClauses = [...clauses, "id = ?"];
      const cursor = row(this.query(`SELECT created_at,id FROM objects WHERE ${cursorClauses.join(" AND ")}`, [...params, options.cursor]));
      if (!cursor) throw new Error("OBJECT_PAGE_CURSOR_INVALID");
      const operator = order === "ASC" ? ">" : "<";
      clauses.push(`(created_at ${operator} ? OR (created_at = ? AND id ${operator} ?))`);
      params.push(String(cursor.created_at), String(cursor.created_at), String(cursor.id));
    }
    const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
    const found = rows(this.query(`SELECT * FROM objects${where} ORDER BY created_at ${order},id ${order} LIMIT ?`, [...params, limit + 1]));
    const hasMore = found.length > limit;
    const items = found.slice(0, limit).map((item) => this.objectFromRow(item));
    for (const item of items) this.verifyObjectHash(item);
    return { items, nextCursor: hasMore && items.length ? items.at(-1).id : null, limit };
  }
  listObjectsPartitioned(options, role = this.role) {
    assertAuthorized(role, "object.read");
    const limit = options.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("OBJECT_PARTITION_LIMIT_INVALID");
    if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(options.partitionKey)) throw new Error(`OBJECT_PARTITION_KEY_INVALID:${options.partitionKey}`);
    const partitionValues = [...new Set(options.partitionValues)];
    if (partitionValues.length < 1 || partitionValues.length > 50 || partitionValues.some((value) => !value || value.length > 4096)) throw new Error("OBJECT_PARTITION_VALUES_INVALID");
    const order = options.order ?? "ASC";
    const clauses = ["kind = ?"];
    const params = [options.kind];
    if (options.projectId) {
      clauses.push("(id = ? OR json_extract(data_json, '$.projectId') = ?)");
      params.push(options.projectId, options.projectId);
    }
    for (const [key, value] of Object.entries(options.dataFilters ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
      if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key)) throw new Error(`OBJECT_PAGE_FILTER_INVALID:${key}`);
      if (key === options.partitionKey) throw new Error(`OBJECT_PARTITION_FILTER_CONFLICT:${key}`);
      clauses.push(value === null ? `json_extract(data_json, '$.${key}') IS NULL` : `json_extract(data_json, '$.${key}') = ?`);
      if (value !== null) params.push(value);
    }
    const partitionExpression = `json_extract(data_json, '$.${options.partitionKey}')`;
    clauses.push(`${partitionExpression} IN (${partitionValues.map(() => "?").join(",")})`);
    params.push(...partitionValues);
    const found = rows(this.query(
      `SELECT * FROM (
        SELECT objects.*, ${partitionExpression} AS __partition_value,
          ROW_NUMBER() OVER (PARTITION BY ${partitionExpression} ORDER BY created_at ${order},id ${order}) AS __partition_row
        FROM objects WHERE ${clauses.join(" AND ")}
      ) WHERE __partition_row <= ? ORDER BY __partition_value,created_at ${order},id ${order}`,
      [...params, limit + 1]
    ));
    const grouped = /* @__PURE__ */ new Map();
    for (const item of found) {
      const object = this.objectFromRow(item);
      this.verifyObjectHash(object);
      const key = String(item.__partition_value);
      const values = grouped.get(key) ?? [];
      values.push(object);
      grouped.set(key, values);
    }
    return {
      pages: Object.fromEntries(partitionValues.map((value) => {
        const values = grouped.get(value) ?? [];
        const items = values.slice(0, limit);
        return [value, { items, nextCursor: values.length > limit && items.length ? items.at(-1).id : null, limit }];
      }))
    };
  }
  inspectObjectLinks(options, role = this.role) {
    assertAuthorized(role, "object.read");
    const fieldPattern = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
    const keys = [options.linkKey, ...options.scopeKeys, ...Object.keys(options.dataFilters ?? {}), ...options.partitionKey ? [options.partitionKey] : []];
    for (const key of keys) if (!fieldPattern.test(key)) throw new Error(`OBJECT_LINK_FIELD_INVALID:${key}`);
    if (options.scopeKeys.length < 1 || options.scopeKeys.length > 8 || new Set(options.scopeKeys).size !== options.scopeKeys.length) throw new Error("OBJECT_LINK_SCOPE_INVALID");
    const partitionValues = [...new Set(options.partitionValues ?? [])];
    if (options.partitionKey && (partitionValues.length < 1 || partitionValues.length > 50 || partitionValues.some((value) => !value || value.length > 4096))) throw new Error("OBJECT_LINK_PARTITION_VALUES_INVALID");
    if (!options.partitionKey && partitionValues.length) throw new Error("OBJECT_LINK_PARTITION_KEY_REQUIRED");
    if (options.partitionKey && Object.hasOwn(options.dataFilters ?? {}, options.partitionKey)) throw new Error(`OBJECT_LINK_PARTITION_FILTER_CONFLICT:${options.partitionKey}`);
    const visibleObjectIds = [...new Set(options.visibleObjectIds ?? [])];
    if (visibleObjectIds.length > 5e3 || visibleObjectIds.some((value) => !value || value.length > 4096)) throw new Error("OBJECT_LINK_VISIBLE_IDS_INVALID");
    const clauses = ["kind = ?"];
    const params = [options.kind];
    if (options.projectId) {
      clauses.push("(id = ? OR json_extract(data_json, '$.projectId') = ?)");
      params.push(options.projectId, options.projectId);
    }
    for (const [key, value] of Object.entries(options.dataFilters ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
      clauses.push(value === null ? `json_extract(data_json, '$.${key}') IS NULL` : `json_extract(data_json, '$.${key}') = ?`);
      if (value !== null) params.push(value);
    }
    if (options.partitionKey) {
      clauses.push(`json_extract(data_json, '$.${options.partitionKey}') IN (${partitionValues.map(() => "?").join(",")})`);
      params.push(...partitionValues);
    }
    const baseSql = `SELECT id,kind,data_json FROM objects WHERE ${clauses.join(" AND ")}`;
    const linkExpression = `json_extract(child.data_json, '$.${options.linkKey}')`;
    const matchingKeys = [.../* @__PURE__ */ new Set([...options.scopeKeys, ...Object.keys(options.dataFilters ?? {})])];
    const validTarget = ["target.kind = child.kind", ...matchingKeys.map((key) => `json_extract(target.data_json, '$.${key}') IS json_extract(child.data_json, '$.${key}')`)].join(" AND ");
    const scopeColumns = options.scopeKeys.map((key, index) => `json_extract(child.data_json, '$.${key}') AS scope_${index}`);
    const scopeNames = options.scopeKeys.map((_, index) => `scope_${index}`);
    const scopeSelect = scopeNames.length ? `,${scopeNames.join(",")}` : "";
    const scopeGroup = scopeNames.length ? ` GROUP BY ${scopeNames.join(",")}` : "";
    const visibleJson = JSON.stringify(visibleObjectIds);
    const supersededRows = rows(this.query(
      `WITH base AS (${baseSql}), visible AS (SELECT value AS id FROM json_each(?))
       SELECT DISTINCT ${linkExpression} AS id
       FROM base child JOIN objects target ON target.id = ${linkExpression}
       JOIN visible ON visible.id = ${linkExpression}
       WHERE ${linkExpression} IS NOT NULL AND ${validTarget}
       ORDER BY id`,
      [...params, visibleJson]
    ));
    const conflictRows = rows(this.query(
      `WITH base AS (${baseSql}),
       classified AS (
         SELECT child.id AS source_id, ${linkExpression} AS link_id${scopeColumns.length ? `,${scopeColumns.join(",")}` : ""},
           CASE WHEN target.id IS NULL THEN 'TARGET_MISSING' WHEN ${validTarget} THEN 'VALID' ELSE 'SCOPE_MISMATCH' END AS relation
         FROM base child LEFT JOIN objects target ON target.id = ${linkExpression}
         WHERE ${linkExpression} IS NOT NULL
       ),
       simple AS (
         SELECT relation AS type${scopeSelect},COUNT(*) AS count,MIN(source_id) AS example_source_id,MIN(link_id) AS example_target_id
         FROM classified WHERE relation IN ('TARGET_MISSING','SCOPE_MISMATCH')${scopeGroup ? `${scopeGroup},relation` : " GROUP BY relation"}
       ),
       branches AS (
         SELECT ${scopeNames.length ? `${scopeNames.join(",")},` : ""}link_id,COUNT(*) AS child_count,MIN(source_id) AS example_source_id
         FROM classified WHERE relation = 'VALID'
         GROUP BY ${scopeNames.length ? `${scopeNames.join(",")},` : ""}link_id HAVING COUNT(*) > 1
       ),
       branch_summary AS (
         SELECT 'BRANCH' AS type${scopeSelect},COUNT(*) AS count,MIN(example_source_id) AS example_source_id,MIN(link_id) AS example_target_id
         FROM branches${scopeGroup}
       )
       SELECT * FROM simple UNION ALL SELECT * FROM branch_summary ORDER BY type${scopeSelect}`,
      params
    ));
    const conflicts = conflictRows.map((item) => ({
      type: String(item.type),
      scope: Object.fromEntries(options.scopeKeys.map((key, index) => [key, item[`scope_${index}`] === null ? null : String(item[`scope_${index}`])])),
      count: Number(item.count),
      exampleSourceId: String(item.example_source_id),
      exampleTargetId: String(item.example_target_id)
    }));
    return {
      supersededVisibleIds: supersededRows.map((item) => String(item.id)),
      conflicts
    };
  }
  transitionObject(id, to, expectedVersion, idempotencyKey2, role = this.role) {
    this.assertWritable();
    const action = to === "ARCHIVED" ? "object.archive" : "object.transition";
    assertAuthorized(role, action);
    const current = this.getObject(id, "SYSTEM");
    if (!current) throw new Error(`OBJECT_NOT_FOUND:${id}`);
    const existing = this.existingEvent(idempotencyKey2);
    if (existing) {
      const payload2 = existing.payload;
      const replayMatches = existing.eventType === "OBJECT_STATE_CHANGED" && existing.objectId === id && payload2.to === to && payload2.previousVersion === expectedVersion && current.state === to && current.version === expectedVersion + 1;
      if (!replayMatches) throw new Error(`IDEMPOTENCY_CONFLICT:${idempotencyKey2}`);
      return current;
    }
    assertTransition(current.state, to);
    if (current.version !== expectedVersion) throw new Error(`VERSION_CONFLICT:${expectedVersion}:${current.version}`);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const nextVersion = current.version + 1;
    const nextBase = { schemaVersion: SCHEMA_VERSION, id: current.id, kind: current.kind, state: to, title: current.title, data: current.data };
    const payload = { from: current.state, to, previousVersion: expectedVersion };
    this.database.run("BEGIN IMMEDIATE");
    try {
      this.database.run("UPDATE objects SET state=?,version=?,content_sha256=?,updated_at=? WHERE id=? AND version=?", [to, nextVersion, sha256Json(nextBase), now, id, expectedVersion]);
      if (this.database.getRowsModified() !== 1) throw new Error(`VERSION_CONFLICT:${expectedVersion}`);
      this.insertEvent({ schemaVersion: SCHEMA_VERSION, eventId: crypto2.randomUUID(), idempotencyKey: idempotencyKey2, eventType: "OBJECT_STATE_CHANGED", objectId: id, actor: this.actor, timestamp: now, payload });
      this.database.run("COMMIT");
    } catch (error) {
      this.database.run("ROLLBACK");
      throw error;
    }
    this.persist();
    const stored = this.getObject(id, "SYSTEM");
    if (!stored) throw new Error("OBJECT_TRANSITION_NOT_OBSERVED");
    return stored;
  }
  updateObject(id, change, expectedVersion, idempotencyKey2, role = this.role) {
    this.assertWritable();
    assertAuthorized(role, "object.update");
    const current = this.getObject(id, "SYSTEM");
    if (!current) throw new Error(`OBJECT_NOT_FOUND:${id}`);
    const nextTitle = change.title?.trim() ?? current.title;
    if (!nextTitle || nextTitle.length > 240) throw new Error("OBJECT_TITLE_INVALID");
    const nextData = change.data ?? current.data;
    const nextBase = { schemaVersion: current.schemaVersion, id: current.id, kind: current.kind, state: current.state, title: nextTitle, data: nextData };
    const nextHash = sha256Json(nextBase);
    const existing = this.existingEvent(idempotencyKey2);
    if (existing) {
      const payload2 = existing.payload;
      const replayMatches = existing.eventType === "OBJECT_UPDATED" && existing.objectId === id && payload2.previousVersion === expectedVersion && payload2.nextContentHash === nextHash && current.version === expectedVersion + 1 && current.contentHash === nextHash;
      if (!replayMatches) throw new Error(`IDEMPOTENCY_CONFLICT:${idempotencyKey2}`);
      return current;
    }
    if (current.version !== expectedVersion) throw new Error(`VERSION_CONFLICT:${expectedVersion}:${current.version}`);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const nextVersion = current.version + 1;
    const payload = { previousVersion: expectedVersion, nextContentHash: nextHash };
    this.database.run("BEGIN IMMEDIATE");
    try {
      this.database.run(
        "UPDATE objects SET title=?,data_json=?,version=?,content_sha256=?,updated_at=? WHERE id=? AND version=?",
        [nextTitle, canonicalJson(nextData), nextVersion, nextHash, now, id, expectedVersion]
      );
      if (this.database.getRowsModified() !== 1) throw new Error(`VERSION_CONFLICT:${expectedVersion}`);
      this.insertEvent({ schemaVersion: SCHEMA_VERSION, eventId: crypto2.randomUUID(), idempotencyKey: idempotencyKey2, eventType: "OBJECT_UPDATED", objectId: id, actor: this.actor, timestamp: now, payload });
      this.database.run("COMMIT");
    } catch (error) {
      this.database.run("ROLLBACK");
      throw error;
    }
    this.persist();
    const stored = this.getObject(id, "SYSTEM");
    if (!stored) throw new Error("OBJECT_UPDATE_NOT_OBSERVED");
    return stored;
  }
  listEvents(role = this.role) {
    assertAuthorized(role, "object.read");
    return rows(this.query("SELECT * FROM events ORDER BY sequence")).map((item) => this.eventFromRow(item));
  }
  countEvents(role = this.role) {
    assertAuthorized(role, "object.read");
    return Number(row(this.query("SELECT COUNT(*) AS count FROM events"))?.count ?? 0);
  }
  listEventsPage(options = {}, role = this.role) {
    assertAuthorized(role, "object.read");
    const limit = options.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("EVENT_PAGE_LIMIT_INVALID");
    const order = options.order ?? "DESC";
    const clauses = [];
    const params = [];
    if (options.cursor !== void 0) {
      if (!Number.isInteger(options.cursor) || options.cursor < 1) throw new Error("EVENT_PAGE_CURSOR_INVALID");
      clauses.push(`sequence ${order === "ASC" ? ">" : "<"} ?`);
      params.push(options.cursor);
    }
    const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
    const found = rows(this.query(`SELECT * FROM events${where} ORDER BY sequence ${order} LIMIT ?`, [...params, limit + 1]));
    const hasMore = found.length > limit;
    const items = found.slice(0, limit).map((item) => this.eventFromRow(item));
    for (const item of items) this.verifyEventHash(item);
    return { items, nextCursor: hasMore && items.length ? items.at(-1).sequence : null, limit };
  }
  verifyIntegrity() {
    const integrity = row(this.query("PRAGMA integrity_check"));
    if (!integrity || Object.values(integrity)[0] !== "ok") throw new Error("SQLITE_INTEGRITY_FAILED");
    const metadata = row(this.query("SELECT value FROM metadata WHERE key='schema_version'"));
    if (Number(metadata?.value) !== SCHEMA_VERSION) throw new Error(`UNKNOWN_SCHEMA_VERSION:${metadata?.value ?? "missing"}`);
    if (this.integrityMode === "FULL") {
      for (const event of this.listEvents("SYSTEM")) this.verifyEventHash(event);
      for (const object of this.listObjects(void 0, "SYSTEM")) this.verifyObjectHash(object);
    }
  }
  close() {
    try {
      this.database.close();
    } finally {
      this.releaseWriteLease?.();
    }
  }
  objectFromRow(found) {
    return {
      schemaVersion: Number(found.schema_version),
      id: String(found.id),
      kind: String(found.kind),
      state: String(found.state),
      title: String(found.title),
      data: JSON.parse(String(found.data_json)),
      version: Number(found.version),
      contentHash: String(found.content_sha256),
      createdAt: String(found.created_at),
      updatedAt: String(found.updated_at)
    };
  }
  verifyObjectHash(object) {
    const base = { schemaVersion: object.schemaVersion, id: object.id, kind: object.kind, state: object.state, title: object.title, data: object.data };
    if (sha256Json(base) !== object.contentHash) throw new Error(`OBJECT_INTEGRITY_FAILED:${object.id}`);
  }
  verifyEventHash(event) {
    if (sha256Json(event.payload) !== event.payloadHash) throw new Error(`EVENT_INTEGRITY_FAILED:${event.eventId}`);
  }
  eventFromRow(found) {
    return {
      schemaVersion: Number(found.schema_version),
      eventId: String(found.event_id),
      idempotencyKey: String(found.idempotency_key),
      eventType: String(found.event_type),
      objectId: found.object_id === null ? null : String(found.object_id),
      actor: String(found.actor),
      timestamp: String(found.timestamp),
      payload: JSON.parse(String(found.payload_json)),
      payloadHash: String(found.payload_sha256),
      sequence: Number(found.sequence)
    };
  }
};

// packages/ui-adapter/src/index.ts
import http from "node:http";
import crypto4 from "node:crypto";
import fs2 from "node:fs";
import path3 from "node:path";
import { URL as URL2, fileURLToPath as fileURLToPath2 } from "node:url";

// packages/project-brief/src/index.ts
import crypto3 from "node:crypto";
import path2 from "node:path";
var briefSections = ["GOAL", "STEP", "DECISION", "OWNER_STATEMENT", "PITFALL"];
var briefSourceTypes = ["KERNEL_OBJECT", "KERNEL_EVENT", "CONTEXT_PACK", "CODEX_TURN", "MANUAL"];
var briefVerificationStatuses = ["VERIFIED_KERNEL", "PENDING_VERIFICATION", "MANUAL_ENTRY"];
var quoteAudiences = ["UI", "CLI", "MCP"];
var uuid = external_exports.string().uuid();
var sha256 = external_exports.string().regex(/^[a-f0-9]{64}$/);
var briefRecordInputSchema = external_exports.object({
  projectId: uuid,
  taskId: uuid.nullable().optional(),
  section: external_exports.enum(briefSections),
  summary: external_exports.string().trim().min(1).max(4e3),
  details: external_exports.record(external_exports.unknown()).default({}),
  sourceType: external_exports.enum(briefSourceTypes),
  sourceObjectId: uuid.optional(),
  sourceEventSequence: external_exports.number().int().positive().optional(),
  sourceThreadId: external_exports.string().trim().min(1).max(200).optional(),
  sourceTurnId: external_exports.string().trim().min(1).max(200).optional(),
  sourceQuote: external_exports.string().trim().min(1).max(4e3).optional(),
  supersedesId: uuid.optional()
}).strict().superRefine((input, context) => {
  if (input.sourceType === "KERNEL_OBJECT" && !input.sourceObjectId) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "SOURCE_OBJECT_ID_REQUIRED" });
  if (input.sourceType === "KERNEL_EVENT" && input.sourceEventSequence === void 0) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "SOURCE_EVENT_SEQUENCE_REQUIRED" });
  if (input.sourceType === "CONTEXT_PACK" && !input.sourceObjectId) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "CONTEXT_PACK_ID_REQUIRED" });
  if (input.sourceType === "CODEX_TURN" && (!input.sourceThreadId || !input.sourceQuote)) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "CODEX_TURN_THREAD_AND_QUOTE_REQUIRED" });
  if (input.section === "DECISION") {
    const decisionState = input.details.decisionState;
    const applicationState = input.details.applicationState;
    if (!["PENDING", "CONFIRMED", "WITHDRAWN"].includes(String(decisionState))) context.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["details", "decisionState"], message: "DECISION_STATE_REQUIRED" });
    if (!["NOT_APPLICABLE", "PENDING", "APPLIED"].includes(String(applicationState))) context.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["details", "applicationState"], message: "DECISION_APPLICATION_STATE_REQUIRED" });
    if (applicationState === "APPLIED" && decisionState !== "CONFIRMED") context.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["details"], message: "APPLIED_DECISION_MUST_BE_CONFIRMED" });
  }
  if ((input.section === "GOAL" || input.section === "STEP") && ["state", "status", "order", "completionCriteria"].some((key) => key in input.details)) {
    context.addIssue({ code: external_exports.ZodIssueCode.custom, path: ["details"], message: "FORMAL_TASK_FIELDS_FORBIDDEN_IN_BRIEF_ARTIFACT" });
  }
});
var briefRecordBatchSchema = external_exports.object({
  idempotencyKey: external_exports.string().trim().min(8).max(120),
  records: external_exports.array(briefRecordInputSchema).min(1).max(50)
}).strict();
var quoteGrants = /* @__PURE__ */ new Map();
function capabilityDigest(token) {
  return crypto3.createHash("sha256").update(token).digest("hex");
}
function consumeQuoteCapability(token, projectId, audience) {
  if (!token || token.length > 256) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_INVALID");
  const key = capabilityDigest(token);
  const grant = quoteGrants.get(key);
  if (!grant) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_INVALID");
  if (grant.used) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_REPLAYED");
  if (grant.revoked) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_REVOKED");
  if (Date.now() >= grant.expiresAtMs) {
    quoteGrants.delete(key);
    throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_EXPIRED");
  }
  if (grant.projectId !== projectId) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_PROJECT_MISMATCH");
  if (grant.audience !== audience) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_AUDIENCE_MISMATCH");
  grant.used = true;
  return key;
}
async function appendQuoteAudit(databasePath, actor, input) {
  const kernel = await ControlKernel.open({ databasePath, actor: `${actor}-quote-audit`, role: "OPERATOR", integrityMode: "STRUCTURAL" });
  try {
    kernel.appendEvent({
      schemaVersion: SCHEMA_VERSION,
      eventId: crypto3.randomUUID(),
      idempotencyKey: `project-brief-quote:${input.outcome.toLowerCase()}:${input.capabilityHash}`,
      eventType: `PROJECT_BRIEF_QUOTE_CAPABILITY_${input.outcome}`,
      objectId: input.projectId,
      actor,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      payload: {
        projectId: input.projectId,
        audience: input.audience,
        outcome: input.outcome,
        capabilityHash: input.capabilityHash,
        ...input.issuedAt ? { issuedAt: input.issuedAt } : {},
        ...input.expiresAt ? { expiresAt: input.expiresAt } : {}
      }
    });
  } finally {
    kernel.close();
  }
}
function entityProjectId(entity) {
  if (entity.kind === "PROJECT") return entity.id;
  return typeof entity.data.projectId === "string" ? entity.data.projectId : null;
}
function isBriefItem(entity) {
  return entity.kind === "ARTIFACT" && entity.data.artifactType === "PROJECT_BRIEF_ITEM";
}
function dataOf(entity) {
  if (!isBriefItem(entity)) throw new Error(`PROJECT_BRIEF_ITEM_REQUIRED:${entity.id}`);
  const data = entity.data;
  if (data.briefSchemaVersion !== 1 || !briefSections.includes(data.section) || !briefSourceTypes.includes(data.sourceType)) throw new Error(`PROJECT_BRIEF_ITEM_INVALID:${entity.id}`);
  if (!briefVerificationStatuses.includes(data.verificationStatus) || !sha256.safeParse(data.contentSha256).success) throw new Error(`PROJECT_BRIEF_AUDIT_INVALID:${entity.id}`);
  return data;
}
function viewOf(entity, includeQuotes) {
  const data = dataOf(entity);
  const { sourceQuote, ...rest } = data;
  return {
    id: entity.id,
    ...rest,
    createdAt: entity.createdAt,
    ...includeQuotes && sourceQuote ? { sourceQuote } : {}
  };
}
function assertTargetProject(entity, projectId, label) {
  if (!entity) throw new Error(`${label}_NOT_FOUND`);
  if (entityProjectId(entity) !== projectId) throw new Error(`${label}_PROJECT_MISMATCH:${entity.id}`);
  return entity;
}
function conflictText(conflict) {
  const section = conflict.scope.section ?? "UNKNOWN";
  if (conflict.type === "BRANCH") return `SUPERSEDES_BRANCH:${section}:${conflict.exampleTargetId}:BRANCH_TARGETS=${conflict.count}`;
  if (conflict.type === "SCOPE_MISMATCH") return `SUPERSEDES_SCOPE_MISMATCH:${section}:${conflict.exampleSourceId}:${conflict.exampleTargetId}:COUNT=${conflict.count}`;
  return `SUPERSEDES_TARGET_MISSING:${section}:${conflict.exampleSourceId}:${conflict.exampleTargetId}:COUNT=${conflict.count}`;
}
function coverageFor(section, formalAvailable, records, conflicts) {
  if (conflicts.some((item) => item.includes(section))) return "CONFLICT";
  if (formalAvailable || records.length > 0) {
    if (records.some((record) => record.verificationStatus === "PENDING_VERIFICATION")) return "PENDING_VERIFICATION";
    if (records.length > 0 && records.every((record) => record.details.notApplicable === true)) return "NOT_APPLICABLE";
    return "AVAILABLE";
  }
  return section === "GOAL" ? "REQUIRED_MISSING" : "NO_RECORD";
}
function eventBySequence(events, sequence) {
  if (sequence === void 0) return null;
  return events.find((event) => event.sequence === sequence) ?? null;
}
var ProjectBriefService = class {
  databasePath;
  actor;
  constructor(options) {
    if (!path2.isAbsolute(options.databasePath)) throw new Error("ABSOLUTE_PATH_REQUIRED:databasePath");
    this.databasePath = path2.normalize(options.databasePath);
    this.actor = options.actor?.trim() || "codex-project-brief";
  }
  async issueQuoteCapability(projectId, audience, ttlMs = 5 * 6e4) {
    uuid.parse(projectId);
    if (!quoteAudiences.includes(audience)) throw new Error("PROJECT_BRIEF_QUOTE_AUDIENCE_INVALID");
    if (!Number.isInteger(ttlMs) || ttlMs < 1 || ttlMs > 5 * 6e4) throw new Error("PROJECT_BRIEF_QUOTE_TTL_INVALID");
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: `${this.actor}-quote-issue`, role: "VIEWER", readOnly: true, integrityMode: "STRUCTURAL" });
    try {
      const project = kernel.getObject(projectId);
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${projectId}`);
    } finally {
      kernel.close();
    }
    const now = Date.now();
    for (const [key, grant] of quoteGrants) if (grant.used || grant.expiresAtMs <= now) quoteGrants.delete(key);
    const token = crypto3.randomBytes(32).toString("base64url");
    const capabilityHash = capabilityDigest(token);
    const expiresAtMs = now + ttlMs;
    const issuedAt = new Date(now).toISOString();
    const expiresAt = new Date(expiresAtMs).toISOString();
    await appendQuoteAudit(this.databasePath, this.actor, { projectId, audience, capabilityHash, outcome: "ISSUED", issuedAt, expiresAt });
    quoteGrants.set(capabilityHash, { projectId, audience, issuedAtMs: now, expiresAtMs, used: false, revoked: false });
    return { token, projectId, audience, expiresAt };
  }
  async revokeQuoteCapability(token) {
    if (!token || token.length > 256) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_INVALID");
    const capabilityHash = capabilityDigest(token);
    const grant = quoteGrants.get(capabilityHash);
    if (!grant) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_INVALID");
    if (grant.used) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_REPLAYED");
    if (grant.revoked) return;
    grant.revoked = true;
    await appendQuoteAudit(this.databasePath, this.actor, { projectId: grant.projectId, audience: grant.audience, capabilityHash, outcome: "REVOKED" });
  }
  async record(input) {
    const parsed = briefRecordBatchSchema.parse(input);
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      const allObjects = kernel.listObjects();
      const byId = new Map(allObjects.map((entity) => [entity.id, entity]));
      const allEvents = kernel.listEvents();
      const briefItems = allObjects.filter(isBriefItem);
      const supersededIds = new Set(briefItems.map((item) => dataOf(item).supersedesId).filter((id) => Boolean(id)));
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const creates = [];
      for (const [index, record] of parsed.records.entries()) {
        const project = byId.get(record.projectId);
        if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${record.projectId}`);
        const taskId = record.taskId ?? null;
        if (taskId) {
          const task = assertTargetProject(byId.get(taskId) ?? null, record.projectId, "PROJECT_BRIEF_TASK");
          if (task.kind !== "TASK" && task.kind !== "TODO") throw new Error(`PROJECT_BRIEF_TASK_KIND_INVALID:${task.kind}`);
        }
        if (record.sourceObjectId) {
          const source = assertTargetProject(byId.get(record.sourceObjectId) ?? null, record.projectId, "PROJECT_BRIEF_SOURCE_OBJECT");
          if (record.sourceType === "CONTEXT_PACK" && source.kind !== "CONTEXT_PACK") throw new Error(`PROJECT_BRIEF_CONTEXT_SOURCE_INVALID:${source.kind}`);
        }
        if (record.sourceType === "KERNEL_EVENT") {
          const event = eventBySequence(allEvents, record.sourceEventSequence);
          if (!event) throw new Error(`PROJECT_BRIEF_SOURCE_EVENT_NOT_FOUND:${record.sourceEventSequence}`);
          if (event.objectId) assertTargetProject(byId.get(event.objectId) ?? null, record.projectId, "PROJECT_BRIEF_SOURCE_EVENT_OBJECT");
        }
        if (record.supersedesId) {
          const prior = byId.get(record.supersedesId);
          if (!prior || !isBriefItem(prior)) throw new Error(`PROJECT_BRIEF_SUPERSEDES_NOT_FOUND:${record.supersedesId}`);
          const priorData = dataOf(prior);
          if (priorData.projectId !== record.projectId || priorData.taskId !== taskId || priorData.section !== record.section) throw new Error("PROJECT_BRIEF_SUPERSEDES_SCOPE_MISMATCH");
          if (supersededIds.has(prior.id)) throw new Error(`PROJECT_BRIEF_SUPERSEDES_NOT_LEAF:${prior.id}`);
        }
        if (record.section === "DECISION" && record.details.applicationState === "APPLIED") {
          const appliedObjectId = typeof record.details.appliedObjectId === "string" ? record.details.appliedObjectId : "";
          const appliedObjectVersion = Number(record.details.appliedObjectVersion);
          const applied = assertTargetProject(byId.get(appliedObjectId) ?? null, record.projectId, "PROJECT_BRIEF_APPLIED_OBJECT");
          if (!Number.isInteger(appliedObjectVersion) || applied.version !== appliedObjectVersion) throw new Error(`PROJECT_BRIEF_APPLIED_VERSION_MISMATCH:${applied.id}:${appliedObjectVersion}:${applied.version}`);
        }
        const verificationStatus = record.sourceType === "MANUAL" ? "MANUAL_ENTRY" : record.sourceType === "CODEX_TURN" ? "PENDING_VERIFICATION" : "VERIFIED_KERNEL";
        const content = {
          projectId: record.projectId,
          taskId,
          section: record.section,
          summary: record.summary,
          details: record.details,
          sourceType: record.sourceType,
          sourceObjectId: record.sourceObjectId ?? null,
          sourceEventSequence: record.sourceEventSequence ?? null,
          sourceThreadId: record.sourceThreadId ?? null,
          sourceTurnId: record.sourceTurnId ?? null,
          sourceQuote: record.sourceQuote,
          verificationStatus,
          supersedesId: record.supersedesId ?? null
        };
        const contentSha256 = sha256Json(content);
        const id = stableUuidFromKey(`PROJECT_BRIEF_ITEM:${parsed.idempotencyKey}:${index}`);
        const existing = byId.get(id);
        let recordedAt = now;
        let recordedBy = this.actor;
        if (existing) {
          if (!isBriefItem(existing)) throw new Error(`IDEMPOTENCY_CONFLICT:brief:${parsed.idempotencyKey}:${index}`);
          const existingData = dataOf(existing);
          if (existingData.contentSha256 !== contentSha256) throw new Error(`IDEMPOTENCY_CONFLICT:brief:${parsed.idempotencyKey}:${index}`);
          recordedAt = existingData.recordedAt;
          recordedBy = existingData.recordedBy;
        }
        const data = {
          artifactType: "PROJECT_BRIEF_ITEM",
          briefSchemaVersion: 1,
          ...content,
          recordedAt,
          recordedBy,
          contentSha256
        };
        creates.push({
          input: {
            schemaVersion: SCHEMA_VERSION,
            id,
            kind: "ARTIFACT",
            state: "COMPLETED",
            title: `${record.section}: ${record.summary.slice(0, 160)}`,
            data
          },
          idempotencyKey: `brief:${parsed.idempotencyKey}:${index}`
        });
      }
      return kernel.createObjectsAtomically(creates);
    } finally {
      kernel.close();
    }
  }
  async read(projectId, options = {}) {
    uuid.parse(projectId);
    if ("includeQuotes" in options) throw new Error("PROJECT_BRIEF_QUOTE_PARAMETER_UNSUPPORTED");
    const capabilityRequested = options.quoteCapability !== void 0 || options.quoteAudience !== void 0;
    if (capabilityRequested && (!options.quoteCapability || !options.quoteAudience)) throw new Error("PROJECT_BRIEF_QUOTE_CAPABILITY_REQUIRED");
    const capabilityHash = capabilityRequested ? consumeQuoteCapability(options.quoteCapability, projectId, options.quoteAudience) : null;
    const includeQuotes = capabilityHash !== null;
    const taskLimit = options.taskLimit ?? 20;
    const recordLimit = options.recordLimit ?? 20;
    if (!Number.isInteger(taskLimit) || taskLimit < 1 || taskLimit > 50) throw new Error("PROJECT_BRIEF_TASK_LIMIT_INVALID");
    if (!Number.isInteger(recordLimit) || recordLimit < 1 || recordLimit > 50) throw new Error("PROJECT_BRIEF_RECORD_LIMIT_INVALID");
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: `${this.actor}-read`, role: "VIEWER", readOnly: true, integrityMode: "STRUCTURAL" });
    try {
      const project = kernel.getObject(projectId);
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${projectId}`);
      const taskPage = kernel.listObjectsPage({ kind: "TASK", projectId, limit: taskLimit, cursor: options.taskCursor, order: "ASC" });
      const tasks = taskPage.items;
      const taskIds = tasks.map((task) => task.id);
      const emptyPage = { items: [], nextCursor: null, limit: 50 };
      const recordPages = taskIds.length ? kernel.listObjectsPartitioned({
        kind: "ARTIFACT",
        projectId,
        partitionKey: "taskId",
        partitionValues: taskIds,
        dataFilters: { artifactType: "PROJECT_BRIEF_ITEM" },
        limit: recordLimit,
        order: "DESC"
      }).pages : {};
      const visibleTaskRecordIds = Object.values(recordPages).flatMap((page) => page.items.map((item) => item.id));
      const taskLinkInspection = taskIds.length ? kernel.inspectObjectLinks({
        kind: "ARTIFACT",
        projectId,
        partitionKey: "taskId",
        partitionValues: taskIds,
        dataFilters: { artifactType: "PROJECT_BRIEF_ITEM" },
        linkKey: "supersedesId",
        scopeKeys: ["projectId", "taskId", "section"],
        visibleObjectIds: visibleTaskRecordIds
      }) : { supersededVisibleIds: [], conflicts: [] };
      const supersededTaskRecordIds = new Set(taskLinkInspection.supersededVisibleIds);
      const taskConflictsById = /* @__PURE__ */ new Map();
      for (const conflict of taskLinkInspection.conflicts) {
        const taskId = conflict.scope.taskId;
        if (!taskId) continue;
        const values = taskConflictsById.get(taskId) ?? [];
        values.push(conflictText(conflict));
        taskConflictsById.set(taskId, values);
      }
      const todoPages = taskIds.length ? kernel.listObjectsPartitioned({
        kind: "TODO",
        projectId,
        partitionKey: "parentTaskId",
        partitionValues: taskIds,
        limit: 50,
        order: "ASC"
      }).pages : {};
      const operationPages = taskIds.length ? kernel.listObjectsPartitioned({
        kind: "OPERATION",
        projectId,
        partitionKey: "taskId",
        partitionValues: taskIds,
        dataFilters: { action: "LONG_TASK_RUN" },
        limit: 50,
        order: "ASC"
      }).pages : {};
      const projections = tasks.map((task) => {
        const recordPage = recordPages[task.id] ?? { ...emptyPage, limit: recordLimit };
        const taskLeaves = recordPage.items.filter((record) => !supersededTaskRecordIds.has(record.id));
        const taskConflicts = (taskConflictsById.get(task.id) ?? []).sort();
        const taskRecords = taskLeaves.map((record) => viewOf(record, includeQuotes));
        const todoPage = todoPages[task.id] ?? emptyPage;
        const operationPage = operationPages[task.id] ?? emptyPage;
        const taskTodos = todoPage.items;
        const taskOperations = operationPage.items;
        const formalSteps = [
          ...taskTodos.map((todo, index) => ({
            id: todo.id,
            sourceKind: "TODO",
            title: todo.title,
            state: todo.state,
            order: typeof todo.data.order === "number" ? todo.data.order : index + 1,
            dueAt: typeof todo.data.dueAt === "string" ? todo.data.dueAt : null,
            operationId: null
          })),
          ...taskOperations.flatMap((operation) => {
            const plan = operation.data.plan;
            const stageIndex = typeof operation.data.stageIndex === "number" ? operation.data.stageIndex : 0;
            return (plan?.stages ?? []).map((stage, index) => ({
              id: `${operation.id}:${String(stage.stageId ?? index)}`,
              sourceKind: "LONG_TASK_STAGE",
              title: String(stage.title ?? stage.stageId ?? `Stage ${index + 1}`),
              state: index < stageIndex ? "COMPLETED" : index === stageIndex && operation.data.runStatus !== "COMPLETED" ? String(operation.data.runStatus ?? "READY") : operation.data.runStatus === "COMPLETED" ? "COMPLETED" : "READY",
              order: index + 1,
              dueAt: null,
              operationId: operation.id
            }));
          })
        ].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
        const section = (name) => taskRecords.filter((record) => record.section === name);
        const objective = typeof task.data.objective === "string" ? task.data.objective : null;
        const completionCriteria = typeof task.data.completionCriteria === "string" ? task.data.completionCriteria : null;
        return {
          task: {
            id: task.id,
            title: task.title,
            state: task.state,
            version: task.version,
            dueAt: typeof task.data.dueAt === "string" ? task.data.dueAt : null,
            objective,
            completionCriteria
          },
          formalSteps,
          supplementalGoals: section("GOAL"),
          supplementalSteps: section("STEP"),
          decisions: section("DECISION"),
          ownerStatements: section("OWNER_STATEMENT"),
          pitfalls: section("PITFALL"),
          coverage: {
            GOAL: coverageFor("GOAL", Boolean(objective), section("GOAL"), taskConflicts),
            STEP: coverageFor("STEP", formalSteps.length > 0, section("STEP"), taskConflicts),
            DECISION: coverageFor("DECISION", false, section("DECISION"), taskConflicts),
            OWNER_STATEMENT: coverageFor("OWNER_STATEMENT", false, section("OWNER_STATEMENT"), taskConflicts),
            PITFALL: coverageFor("PITFALL", false, section("PITFALL"), taskConflicts)
          },
          conflicts: taskConflicts,
          hasMoreRecords: recordPage.nextCursor !== null,
          hasMoreFormalSteps: todoPage.nextCursor !== null || operationPage.nextCursor !== null
        };
      });
      const boundedTodos = kernel.listObjectsPage({ kind: "TODO", projectId, limit: 100, order: "ASC" });
      const boundedOperations = kernel.listObjectsPage({ kind: "OPERATION", projectId, dataFilters: { action: "LONG_TASK_RUN" }, limit: 100, order: "ASC" });
      const orphanWorkItems = [
        ...boundedTodos.items.filter((todo) => typeof todo.data.parentTaskId !== "string" || kernel.getObject(todo.data.parentTaskId)?.kind !== "TASK").map((todo) => ({
          id: todo.id,
          kind: "TODO",
          title: todo.title,
          state: todo.state,
          reason: typeof todo.data.parentTaskId === "string" ? "PARENT_TASK_NOT_FOUND" : "PARENT_TASK_UNASSIGNED"
        })),
        ...boundedOperations.items.filter((operation) => typeof operation.data.taskId !== "string" || kernel.getObject(operation.data.taskId)?.kind !== "TASK").map((operation) => ({
          id: operation.id,
          kind: "OPERATION",
          title: operation.title,
          state: operation.state,
          reason: typeof operation.data.taskId === "string" ? "TASK_NOT_FOUND" : "TASK_UNASSIGNED"
        }))
      ];
      const projectRecords = {};
      const projectRecordHasMore = {};
      const projectRecordPages = kernel.listObjectsPartitioned({
        kind: "ARTIFACT",
        projectId,
        partitionKey: "section",
        partitionValues: briefSections,
        dataFilters: { artifactType: "PROJECT_BRIEF_ITEM", taskId: null },
        limit: recordLimit,
        order: "DESC"
      }).pages;
      const visibleProjectRecordIds = Object.values(projectRecordPages).flatMap((page) => page.items.map((item) => item.id));
      const projectLinkInspection = kernel.inspectObjectLinks({
        kind: "ARTIFACT",
        projectId,
        dataFilters: { artifactType: "PROJECT_BRIEF_ITEM", taskId: null },
        linkKey: "supersedesId",
        scopeKeys: ["projectId", "taskId", "section"],
        visibleObjectIds: visibleProjectRecordIds
      });
      const supersededProjectRecordIds = new Set(projectLinkInspection.supersededVisibleIds);
      const projectConflicts = projectLinkInspection.conflicts.map(conflictText).sort();
      for (const section of briefSections) {
        const page = projectRecordPages[section] ?? { ...emptyPage, limit: recordLimit };
        projectRecords[section] = page.items.filter((record) => !supersededProjectRecordIds.has(record.id)).map((record) => viewOf(record, includeQuotes));
        projectRecordHasMore[section] = page.nextCursor !== null;
      }
      const projectObjective = typeof project.data.objective === "string" ? project.data.objective : null;
      const projectCoverage = Object.fromEntries(briefSections.map((section) => [section, coverageFor(section, section === "GOAL" && Boolean(projectObjective), projectRecords[section], projectConflicts)]));
      const historyPage = kernel.listObjectsPage({ kind: "ARTIFACT", projectId, dataFilters: { artifactType: "PROJECT_BRIEF_ITEM" }, limit: options.limit ?? 25, cursor: options.cursor, order: "DESC" });
      const conflicts = [...projectConflicts, ...projections.flatMap((projection2) => projection2.conflicts)].sort();
      const projection = {
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        project: {
          id: project.id,
          title: project.title,
          state: project.state,
          version: project.version,
          objective: projectObjective,
          coverage: projectCoverage,
          conflicts: projectConflicts
        },
        tasks: projections,
        tasksPage: { nextCursor: taskPage.nextCursor, limit: taskPage.limit },
        orphanWorkItems,
        projectRecords,
        projectRecordHasMore,
        conflicts,
        history: {
          items: historyPage.items.map((record) => viewOf(record, includeQuotes)),
          nextCursor: historyPage.nextCursor,
          limit: historyPage.limit
        }
      };
      if (capabilityHash) await appendQuoteAudit(this.databasePath, this.actor, { projectId, audience: options.quoteAudience, capabilityHash, outcome: "CONSUMED" });
      return projection;
    } finally {
      kernel.close();
    }
  }
};

// packages/ui-adapter/src/index.ts
function buildIdentity() {
  const manifestPath = path3.join(path3.dirname(fileURLToPath2(import.meta.url)), "build-manifest.json");
  try {
    const bytes = fs2.readFileSync(manifestPath);
    const parsed = JSON.parse(bytes.toString("utf8"));
    if (parsed.version !== PRODUCT_VERSION) throw new Error("BUILD_MANIFEST_VERSION_MISMATCH");
    return { version: PRODUCT_VERSION, manifestShortHash: crypto4.createHash("sha256").update(bytes).digest("hex").slice(0, 12) };
  } catch {
    return { version: PRODUCT_VERSION, manifestShortHash: "source-tree" };
  }
}
function projectProjection(entity) {
  if (entity.kind !== "PROJECT") throw new Error(`PROJECTION_KIND_INVALID:${entity.kind}`);
  const thread = entity.data.codexThreadId;
  return {
    id: entity.id,
    title: entity.title,
    state: entity.state,
    version: entity.version,
    contentHash: entity.contentHash,
    projectDirectory: typeof entity.data.projectDirectory === "string" ? entity.data.projectDirectory : null,
    codexThreadId: typeof thread === "string" ? thread : null
  };
}
async function readPlatformSnapshot(databasePath, options = {}) {
  const kernel = await ControlKernel.open({ databasePath, actor: "control-page", role: "VIEWER", readOnly: true, integrityMode: "STRUCTURAL" });
  try {
    const projectPage = kernel.listObjectsPage({ kind: "PROJECT", limit: 50, cursor: options.projectCursor, order: "ASC" });
    const includeArchived = options.includeArchived === true;
const visibleProjects = projectPage.items;
    const visibleProjectIds = new Set(visibleProjects.map((item) => item.id));
    const taskPage = kernel.listObjectsPage({ kind: "TASK", limit: 25, order: "DESC" });
    const todoPage = kernel.listObjectsPage({ kind: "TODO", limit: 25, order: "DESC" });
    const candidatePage = kernel.listObjectsPage({ kind: "CHANGE_CANDIDATE", limit: 50, cursor: options.candidateCursor, order: "DESC" });
    const eventPage = kernel.listEventsPage({ limit: 100, cursor: options.eventCursor, order: "DESC" });
    const workItems = [...taskPage.items, ...todoPage.items].filter((item) => !item.data.projectId || visibleProjectIds.has(item.data.projectId)).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt) || right.id.localeCompare(left.id));
    return {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      objectCount: kernel.countObjects(),
      eventCount: kernel.countEvents(),
      projectCount: visibleProjects.length,
      workItemCount: workItems.length,
      candidateCount: candidatePage.items.filter((item) => !item.data.projectId || visibleProjectIds.has(item.data.projectId)).length,
      product: buildIdentity(),
      projects: visibleProjects.map(projectProjection),
      workItems: workItems.map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        state: item.state,
        version: item.version,
        projectId: typeof item.data.projectId === "string" ? item.data.projectId : null,
        dueAt: typeof item.data.dueAt === "string" ? item.data.dueAt : null
      })),
      candidates: candidatePage.items.filter((item) => !item.data.projectId || visibleProjectIds.has(item.data.projectId)).map((item) => ({
        id: item.id,
        title: item.title,
        state: item.state,
        projectId: typeof item.data.projectId === "string" ? item.data.projectId : null,
        outcome: typeof item.data.outcome === "string" ? item.data.outcome : "PENDING"
      })),
      recentEvents: eventPage.items.map((event) => ({
        sequence: event.sequence,
        eventType: event.eventType,
        objectId: event.objectId,
        timestamp: event.timestamp
      })),
      pages: {
        projects: { nextCursor: projectPage.nextCursor, limit: projectPage.limit },
        candidates: { nextCursor: candidatePage.nextCursor, limit: candidatePage.limit },
        events: { nextCursor: eventPage.nextCursor, limit: eventPage.limit }
      }
    };
  } finally {
    kernel.close();
  }
}
function json(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(`${JSON.stringify(payload)}
`);
}
function optionalPositiveInteger(url, name) {
  const raw = url.searchParams.get(name);
  if (raw === null) return void 0;
  if (!/^[1-9][0-9]*$/.test(raw)) throw new Error(`QUERY_INTEGER_INVALID:${name}`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) throw new Error(`QUERY_INTEGER_INVALID:${name}`);
  return value;
}
function briefReadOptions(url) {
  return {
    limit: optionalPositiveInteger(url, "limit"),
    cursor: url.searchParams.get("cursor") ?? void 0,
    taskLimit: optionalPositiveInteger(url, "taskLimit"),
    taskCursor: url.searchParams.get("taskCursor") ?? void 0,
    recordLimit: optionalPositiveInteger(url, "recordLimit")
  };
}
async function readJsonRequest(request, maxBytes = 256 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBytes) throw new Error("REQUEST_BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  if (!total) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("REQUEST_BODY_INVALID");
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_BODY_INVALID") throw error;
    throw new Error("REQUEST_JSON_INVALID");
  }
}
function projectWriteSummary(project) {
  return projectProjection(project);
}
async function writeProject(databasePath, action, projectId, input = {}) {
  const key = String(input.idempotencyKey ?? `${action}:${projectId ?? crypto2.randomUUID()}`).trim();
  if (key.length < 8 || key.length > 200) throw new Error("IDEMPOTENCY_KEY_INVALID");
  const kernel = await ControlKernel.open({ databasePath, actor: "control-page", role: "OPERATOR" });
  try {
    if (action === "CREATE") {
      const title = String(input.title ?? "").trim();
      if (!title || title.length > 240) throw new Error("PROJECT_TITLE_INVALID");
      const id = stableUuidFromKey(`PROJECT:${key}`);
      const projectDirectory = input.projectDirectory ? String(input.projectDirectory).trim() : null;
      const project = kernel.createObject({ schemaVersion: SCHEMA_VERSION, id, kind: "PROJECT", state: "ACTIVE", title, data: { objective: String(input.objective ?? "").trim() || null, projectDirectory, codexThreadId: null } }, key);
      return projectWriteSummary(project);
    }
    if (!projectId) throw new Error("PROJECT_ID_REQUIRED");
    let project = kernel.getObject(projectId, "SYSTEM");
    if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${projectId}`);
    if (action === "DELETE") {
      const linked = rows(kernel.query("SELECT id,kind,state FROM objects WHERE id = ? OR json_extract(data_json,'$.projectId') = ?", [projectId, projectId]));
      const projectDirectory = project.data?.projectDirectory ? path.resolve(String(project.data.projectDirectory)) : null;
      if (projectDirectory && fs.existsSync(projectDirectory)) {
        try { fs.rmSync(projectDirectory, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }); } catch { throw new Error("PROJECT_DIRECTORY_IN_USE"); }
      }
      const deletedAt = new Date().toISOString();
      kernel.database.run("BEGIN IMMEDIATE");
      try {
        kernel.database.run("DELETE FROM objects WHERE id = ? OR json_extract(data_json,'$.projectId') = ?", [projectId, projectId]);
        kernel.insertEvent({ schemaVersion: SCHEMA_VERSION, eventId: crypto2.randomUUID(), idempotencyKey: key, eventType: "PROJECT_DELETED", objectId: projectId, actor: kernel.actor, timestamp: deletedAt, payload: { projectId, title: project.title, deletedObjectCount: linked.length, deletedAt } });
        kernel.database.run("COMMIT");
        kernel.persist();
      } catch (error) {
        try { kernel.database.run("ROLLBACK"); } catch {}
        throw error;
      }
      return { id: projectId, title: project.title, previousState: project.state, deletedAt, deletedObjectCount: linked.length };
    }
    const target = action === "RESTORE" ? "ACTIVE" : "ARCHIVED";
    if (project.state !== target) project = kernel.transitionObject(project.id, target, project.version, key);
    return projectWriteSummary(project);
  } finally {
    kernel.close();
  }
}
var controlPage = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Codex Work Platform</title>
  <style>
    :root{--ink:#172027;--muted:#607079;--paper:#f6f8f9;--surface:#fff;--line:#d8e0e3;--teal:#0f6b78;--teal-soft:#e4f0f1;--amber:#8b5a12;--amber-soft:#f7eddd;--green:#297a52;--red:#a33d3d;--focus:#176fc1;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--paper)}
    *{box-sizing:border-box}[hidden]{display:none!important}body{margin:0;min-height:100vh;background:linear-gradient(110deg,#edf4f4 0 9rem,var(--paper) 9rem)}a{color:var(--teal)}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
    button{font:inherit}.skip{position:absolute;left:-999px;top:1rem}.skip:focus{left:1rem;z-index:3;background:#fff;padding:.65rem 1rem}header{max-width:1320px;margin:auto;padding:2.6rem 1.4rem 1.25rem;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:end}
    .eyebrow{font:700 .72rem/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--teal)}h1{font-family:"Avenir Next",Avenir,-apple-system,sans-serif;font-size:clamp(2rem,5vw,4.25rem);font-weight:650;letter-spacing:-.055em;line-height:.92;margin:.55rem 0 0;max-width:13ch}.live{display:flex;align-items:center;gap:.55rem;color:var(--muted);font-size:.88rem}.live::before{content:"";width:.62rem;height:.62rem;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px #dcebe3}
    main{max-width:1320px;margin:auto;padding:0 1.4rem 4rem}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--line);background:var(--surface)}.metric{padding:1rem 1.15rem;border-right:1px solid var(--line)}.metric:last-child{border-right:0}.metric span{display:block;color:var(--muted);font-size:.76rem}.metric strong{display:block;font:650 1.55rem/1.2 "Avenir Next",sans-serif;margin-top:.35rem}
    .layout{display:grid;grid-template-columns:minmax(17rem,.72fr) minmax(0,1.6fr);gap:1.25rem;margin-top:1.25rem;align-items:start}.panel{background:var(--surface);border:1px solid var(--line);min-width:0}.panel-head{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem 1.1rem;border-bottom:1px solid var(--line)}h2{font:650 1rem/1.2 "Avenir Next",sans-serif;margin:0}.hint{font-size:.75rem;color:var(--muted)}
    #projects{display:grid;gap:.7rem;padding:1rem}.project{--state-color:var(--teal);border:1px solid var(--line);border-left:5px solid var(--state-color);padding:.9rem;display:grid;grid-template-columns:1fr auto;gap:.65rem;background:#fff}.project[data-state="COMPLETED"]{--state-color:var(--green)}.project[data-state="FAILED"],.project[data-state="MANUAL_INTERVENTION"]{--state-color:var(--red)}.project[data-state="WAITING"],.project[data-state="VERIFYING"]{--state-color:var(--amber)}.project[data-selected="true"]{box-shadow:0 0 0 3px var(--teal-soft);border-color:var(--teal)}.project h3{font-size:.96rem;margin:0 0 .35rem}.meta{font:500 .69rem/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);overflow-wrap:anywhere}.state{align-self:start;border:1px solid var(--state-color);color:var(--state-color);padding:.22rem .46rem;font:700 .63rem/1 ui-monospace,SFMono-Regular,Menlo,monospace}.project-actions{display:flex;gap:.65rem;align-items:center;margin-top:.7rem}.select{border:0;background:var(--teal);color:#fff;padding:.48rem .72rem;font-weight:700;font-size:.75rem;cursor:pointer}.thread{font-size:.75rem;font-weight:650}
    .brief-empty{padding:4rem 1.5rem;text-align:center;color:var(--muted)}.brief-head{padding:1.25rem 1.3rem;border-bottom:1px solid var(--line);background:linear-gradient(110deg,var(--teal-soft),#fff 62%)}.brief-title-row{display:flex;justify-content:space-between;gap:1rem;align-items:start}.brief-head h2{font-size:1.35rem}.brief-objective{margin:.75rem 0 0;max-width:76ch;line-height:1.55}.quote-toggle{border:1px solid var(--teal);background:#fff;color:var(--teal);padding:.48rem .65rem;font-weight:700;font-size:.72rem;cursor:pointer}
    .brief-body{padding:1.1rem}.task-card{border:1px solid var(--line);margin-bottom:1rem;background:#fff}.task-card>summary{cursor:pointer;list-style:none;padding:1rem 1.05rem;display:grid;grid-template-columns:1fr auto;gap:.8rem;align-items:start}.task-card>summary::-webkit-details-marker{display:none}.task-title{font-weight:750}.task-meta{display:block;margin-top:.3rem;color:var(--muted);font:500 .68rem/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.task-sections{display:grid;grid-template-columns:8px minmax(0,1fr);border-top:1px solid var(--line)}.provenance-spine{background:linear-gradient(to bottom,var(--teal) 0 20%,#4c8790 20% 40%,var(--amber) 40% 60%,#6c7085 60% 80%,var(--red) 80%)}.section-stack{padding:.25rem 1rem 1rem}.brief-section{padding:.85rem 0;border-bottom:1px solid var(--line)}.brief-section:last-child{border-bottom:0}.section-head{display:flex;justify-content:space-between;gap:.75rem;align-items:center}.section-head h3{font-size:.82rem;margin:0;text-transform:uppercase;letter-spacing:.07em}.coverage{font:700 .59rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;padding:.26rem .42rem;border:1px solid var(--line);color:var(--muted)}.coverage[data-status="AVAILABLE"]{border-color:var(--green);color:var(--green)}.coverage[data-status="REQUIRED_MISSING"],.coverage[data-status="CONFLICT"]{border-color:var(--red);color:var(--red)}.coverage[data-status="PENDING_VERIFICATION"]{border-color:var(--amber);color:var(--amber)}.section-copy{margin:.55rem 0 0;line-height:1.5;font-size:.84rem}.record-list,.step-list,.events,.candidate-list{list-style:none;margin:.55rem 0 0;padding:0}.record-list li,.step-list li{padding:.55rem 0;border-top:1px dashed var(--line);font-size:.8rem}.record-list li:first-child,.step-list li:first-child{border-top:0}.record-source{display:block;margin-top:.25rem;color:var(--muted);font:500 .65rem/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}.quote{border-left:3px solid var(--amber);margin:.55rem 0 0;padding:.2rem 0 .2rem .7rem;color:#493916;font-size:.78rem}
    .orphan{border:1px solid #e5c89e;background:var(--amber-soft);padding:.85rem;margin:0 0 1rem}.orphan h3{margin:0 0 .45rem;font-size:.82rem}.orphan ul{margin:.35rem 0 0;padding-left:1.1rem;font-size:.78rem}.project-records,.history{border-top:1px solid var(--line);padding:1rem 1.1rem}.project-records h3{font-size:.84rem;margin:0 0 .65rem}.history summary{cursor:pointer;font-weight:700;font-size:.82rem}.events li,.candidate-list li{padding:.72rem 0;border-bottom:1px solid var(--line);font-size:.75rem}.event-time{display:block;color:var(--muted);font-size:.68rem;margin-top:.2rem}.secondary{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-top:1.25rem}.empty,.error{padding:2rem 1rem;color:var(--muted);text-align:center}.error{color:var(--red)}.load-more{display:block;width:calc(100% - 2rem);margin:0 1rem 1rem;border:1px solid var(--teal);background:#fff;color:var(--teal);padding:.65rem;font-weight:750;cursor:pointer}.conflicts{margin:.55rem 0 0;padding-left:1.15rem;color:var(--red);font:600 .7rem/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}.partial{color:var(--amber);font-size:.72rem;margin:.5rem 0 0}.product-id{margin-top:.55rem;font:650 .7rem/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted)}footer{max-width:1320px;margin:auto;padding:0 1.4rem 2rem;color:var(--muted);font-size:.72rem}
    @media(max-width:900px){body{background:var(--paper)}header{grid-template-columns:1fr;padding-top:2rem}.summary{grid-template-columns:repeat(2,1fr)}.metric:nth-child(2){border-right:0}.metric:nth-child(-n+2){border-bottom:1px solid var(--line)}.layout,.secondary{grid-template-columns:1fr}.project{grid-template-columns:1fr}.state{justify-self:start}.brief-title-row{display:block}.quote-toggle{margin-top:.8rem}}
    @media(max-width:520px){.summary{grid-template-columns:1fr}.metric{border-right:0;border-bottom:1px solid var(--line)}.metric:last-child{border-bottom:0}.project-actions{align-items:flex-start;flex-direction:column}.task-card>summary{grid-template-columns:1fr}.task-sections{grid-template-columns:5px minmax(0,1fr)}}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
  </style>
  <style>.project-tools{display:flex;gap:.45rem;flex-wrap:wrap}.project-create-toggle{border:1px solid var(--teal);background:#fff;color:var(--teal);padding:.45rem .65rem;font-weight:700;cursor:pointer}.project-create{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.65rem;align-items:center;padding:.9rem 1rem;border-bottom:1px solid var(--line);background:#fbfdfd}.project-create input{min-width:0;border:1px solid var(--line);border-radius:9px;padding:.6rem .7rem;font-size:.82rem}.project-create button{border:0;border-radius:9px;background:var(--teal);color:#fff;padding:.6rem .85rem;font-weight:700;cursor:pointer}.project-create-note{grid-column:1/-1;color:var(--muted);font-size:.7rem;line-height:1.4}.project-delete{border:1px solid var(--red);background:#fff;color:var(--red);padding:.42rem .62rem;font-size:.72rem;font-weight:700;cursor:pointer}</style>
</head>
<body>
  <a class="skip" href="#main">Skip to work state</a>
  <header><div><div class="eyebrow">Local control · permanent delete</div><h1>Every project, explained.</h1><p class="hint">Work state you can verify.</p><div class="product-id" id="product-id">Loading build identity</div></div><div class="live" id="freshness">Loading local state</div></header>
  <main id="main">
    <section class="summary" aria-label="Platform summary"><div class="metric"><span>Projects</span><strong id="project-count">—</strong></div><div class="metric"><span>Tasks + todos</span><strong id="work-count">—</strong></div><div class="metric"><span>Candidates</span><strong id="candidate-count">—</strong></div><div class="metric"><span>Events</span><strong id="event-count">—</strong></div></section>
    <div class="layout"><section class="panel"><div class="panel-head"><div><h2>Projects</h2><span class="hint">Select one</span></div><div class="project-tools"><button class="project-create-toggle" id="project-create-toggle" type="button">新建项目</button></div></div><form class="project-create" id="project-create" hidden><input id="project-title" maxlength="240" required placeholder="项目名称"><button type="submit">创建项目</button><span class="project-create-note">目录将根据项目名称自动生成；项目目标和完成标准在工作流中定义。</span></form><div id="projects" aria-live="polite"></div><button class="load-more" id="more-projects" type="button" hidden>Load more projects</button></section><aside class="panel" id="brief" aria-live="polite"><div class="brief-empty">Select a project to read its brief.</div></aside></div>
    <div class="secondary"><section class="panel"><div class="panel-head"><h2>Change candidates</h2><span class="hint">Approval required</span></div><ol class="candidate-list" id="candidates"></ol></section><section class="panel"><div class="panel-head"><h2>Recent events</h2><span class="hint">Newest first</span></div><ol class="events" id="events"></ol></section></div>
  </main>
  <footer>This page never edits formal state. Use Codex tools or the CLI for validated changes. Owner quotes remain hidden until explicitly revealed.</footer>
  <script>
    const byId=(id)=>document.getElementById(id);const text=(tag,value,className)=>{const node=document.createElement(tag);node.textContent=value;if(className)node.className=className;return node};
    const params=new URLSearchParams(location.search);let selectedProject=params.get('project');let quotesVisible=false;let projectNextCursor=null;
    const coverage=(status)=>{const labels={AVAILABLE:'已有内容',REQUIRED_MISSING:'尚未填写',NO_RECORD:'暂无记录',PENDING_VERIFICATION:'待验证',CONFLICT:'存在冲突'};const node=text('span',labels[status]||status.replaceAll('_',' '),'coverage');node.dataset.status=status;return node};
    const recordList=(records)=>{const list=document.createElement('ul');list.className='record-list';if(!records.length){list.append(text('li','暂无记录。'));return list}for(const record of records){const item=document.createElement('li');item.append(text('span',record.summary));item.append(text('span',record.sourceType+' · '+record.verificationStatus+' · '+new Date(record.recordedAt).toLocaleString(),'record-source'));if(record.sourceQuote)item.append(text('blockquote',record.sourceQuote,'quote'));list.append(item)}return list};
    const conflictList=(items)=>{const list=document.createElement('ul');list.className='conflicts';for(const item of items)list.append(text('li',item));return list};
    const section=(label,status,body,conflicts=[])=>{const wrap=document.createElement('section');wrap.className='brief-section';const head=document.createElement('div');head.className='section-head';head.append(text('h3',label),coverage(status));wrap.append(head,body);if(conflicts.length)wrap.append(conflictList(conflicts));return wrap};
    const taskCard=(task)=>{const card=document.createElement('details');card.className='task-card';card.open=task.task.state==='ACTIVE'||task.task.state==='WAITING';const summary=document.createElement('summary');const title=document.createElement('div');title.append(text('span',task.task.title,'task-title'),text('span',task.task.state+' · v'+task.task.version+(task.task.dueAt?' · due '+new Date(task.task.dueAt).toLocaleString():''),'task-meta'));summary.append(title,text('span',task.task.id,'meta'));const sections=document.createElement('div');sections.className='task-sections';sections.append(document.createElement('div'));sections.firstChild.className='provenance-spine';const stack=document.createElement('div');stack.className='section-stack';const goal=document.createElement('div');goal.append(text('p',task.task.objective||'Goal not yet recorded.','section-copy'),text('p',task.task.completionCriteria?'Completion: '+task.task.completionCriteria:'Completion criteria not yet recorded.','section-copy'));if(task.supplementalGoals.length)goal.append(recordList(task.supplementalGoals));stack.append(section('Goal',task.coverage.GOAL,goal,task.conflicts.filter((item)=>item.includes('GOAL'))));const steps=document.createElement('div');if(task.formalSteps.length){const list=document.createElement('ol');list.className='step-list';for(const step of task.formalSteps)list.append(text('li',step.order+'. '+step.title+' · '+step.state+' · '+step.sourceKind));steps.append(list)}else steps.append(text('p','No formal steps recorded.','section-copy'));if(task.supplementalSteps.length)steps.append(recordList(task.supplementalSteps));stack.append(section('Steps',task.coverage.STEP,steps,task.conflicts.filter((item)=>item.includes('STEP'))),section('Decisions',task.coverage.DECISION,recordList(task.decisions),task.conflicts.filter((item)=>item.includes('DECISION'))),section('Owner statements',task.coverage.OWNER_STATEMENT,recordList(task.ownerStatements),task.conflicts.filter((item)=>item.includes('OWNER_STATEMENT'))),section('Pitfalls',task.coverage.PITFALL,recordList(task.pitfalls),task.conflicts.filter((item)=>item.includes('PITFALL'))));if(task.hasMoreRecords||task.hasMoreFormalSteps)stack.append(text('p','Additional bounded records exist; use history or the CLI to continue.','partial'));sections.append(stack);card.append(summary,sections);return card};
    const projectRecordSections=['GOAL','STEP','DECISION','OWNER_STATEMENT','PITFALL'];
    const appendTasks=(data)=>{const body=byId('task-list');for(const task of data.tasks)body.append(taskCard(task));const old=byId('more-tasks');if(old)old.remove();if(data.tasksPage.nextCursor){const more=text('button','Load more tasks','load-more');more.id='more-tasks';more.type='button';more.addEventListener('click',()=>{quotesVisible=false;loadBrief(data.project.id,data.tasksPage.nextCursor,true)});body.after(more)}};
    const renderBrief=(data)=>{const root=byId('brief');root.replaceChildren();const head=document.createElement('div');head.className='brief-head';const row=document.createElement('div');row.className='brief-title-row';const title=document.createElement('div');title.append(text('div','Project brief · '+data.project.state,'eyebrow'),text('h2',data.project.title),text('div',data.project.id+' · v'+data.project.version,'meta'));const toggle=text('button',quotesVisible?'Hide owner quotes':'Reveal owner quotes','quote-toggle');toggle.type='button';toggle.addEventListener('click',()=>{if(quotesVisible){quotesVisible=false;loadBrief(data.project.id)}else revealBrief(data.project.id)});row.append(title,toggle);head.append(row,text('p',data.project.objective||'尚未记录项目目标。项目创建时只建立目录和项目身份；工作流执行结果显示在工作流与活动页，正式项目说明记录写入后本页才会显示目标、步骤和决策。','brief-objective'));root.append(head);const projectRecords=document.createElement('section');projectRecords.className='project-records';projectRecords.append(text('h3','Project-level status and narrative'));for(const name of projectRecordSections){const conflicts=data.project.conflicts.filter((item)=>item.includes(name));const block=section(name.replaceAll('_',' '),data.project.coverage[name],recordList(data.projectRecords[name]),conflicts);if(data.projectRecordHasMore[name])block.append(text('p','More records available in history.','partial'));projectRecords.append(block)}root.append(projectRecords);const body=document.createElement('div');body.className='brief-body';body.id='task-list';if(data.orphanWorkItems.length){const orphan=document.createElement('section');orphan.className='orphan';orphan.append(text('h3','Unassigned legacy work'));const list=document.createElement('ul');for(const item of data.orphanWorkItems)list.append(text('li',item.title+' · '+item.reason));orphan.append(list);body.append(orphan)}if(!data.tasks.length)body.append(text('p','No formal tasks in this project.','empty'));root.append(body);appendTasks(data);const history=document.createElement('details');history.className='history';const sum=document.createElement('summary');sum.textContent='Recent brief history ('+data.history.items.length+')';history.append(sum,recordList(data.history.items));if(data.history.nextCursor)history.append(text('p','More history is available through the bounded cursor.','partial'));root.append(history)};
    const parseResponse=(response)=>response.json().then((body)=>{if(!response.ok)throw new Error(body.code||'REQUEST_FAILED');return body});
    const loadBrief=(projectId,taskCursor=null,append=false)=>{selectedProject=projectId;for(const card of document.querySelectorAll('.project'))card.dataset.selected=String(card.dataset.projectId===projectId);const url=new URL(location.href);url.searchParams.set('project',projectId);history.replaceState({},'',url);const query=new URLSearchParams({limit:'25',taskLimit:'20',recordLimit:'20'});if(taskCursor)query.set('taskCursor',taskCursor);fetch('/api/projects/'+encodeURIComponent(projectId)+'/brief?'+query,{cache:'no-store'}).then(parseResponse).then((data)=>append?appendTasks(data):renderBrief(data)).catch((error)=>{byId('brief').replaceChildren(text('p','Project brief unavailable: '+error.message,'error'))})};
    const revealBrief=(projectId)=>{fetch('/api/projects/'+encodeURIComponent(projectId)+'/brief/quotes?limit=25&taskLimit=20&recordLimit=20',{method:'POST',cache:'no-store',headers:{'content-type':'application/json'}}).then(parseResponse).then((data)=>{quotesVisible=true;renderBrief(data)}).catch((error)=>{byId('brief').prepend(text('p','Owner quotes remain hidden: '+error.message,'error'))})};
    const projectCard=(item)=>{const card=document.createElement('article');card.className='project';card.dataset.state=item.state;card.dataset.projectId=item.id;const body=document.createElement('div');body.append(text('h3',item.title),text('div',item.id+' · v'+item.version,'meta'));if(item.projectDirectory)body.append(text('div','目录：'+item.projectDirectory,'meta'));const actions=document.createElement('div');actions.className='project-actions';const button=text('button','查看项目说明','select');button.type='button';button.addEventListener('click',()=>{quotesVisible=false;loadBrief(item.id)});actions.append(button);const remove=text('button','永久删除项目','project-delete');remove.type='button';remove.addEventListener('click',(event)=>{event.stopPropagation();deleteProject(item.id,item.title)});actions.append(remove);if(item.codexThreadId){const link=text('a','Open Codex task','thread');link.href='codex://threads/'+encodeURIComponent(item.codexThreadId);actions.append(link)}body.append(actions);card.append(body,text('span',item.state,'state'));return card};
    const renderProjects=(data,append=false)=>{const projects=byId('projects');if(!append)projects.replaceChildren();if(!append&&!data.projects.length)projects.append(text('p','No projects yet. Create one with Codex or the CLI.','empty'));for(const item of data.projects)projects.append(projectCard(item));projectNextCursor=data.pages.projects.nextCursor;const more=byId('more-projects');more.hidden=!projectNextCursor;more.onclick=()=>loadStatus(projectNextCursor,true)};
    const renderStatus=(data,append=false)=>{byId('project-count').textContent=String(data.projectCount);byId('work-count').textContent=String(data.workItemCount);byId('candidate-count').textContent=String(data.candidateCount);byId('event-count').textContent=String(data.eventCount);byId('product-id').textContent='Version '+data.product.version+' · manifest '+data.product.manifestShortHash;byId('freshness').textContent='Read '+new Date(data.generatedAt).toLocaleTimeString();renderProjects(data,append);if(append)return;const candidates=byId('candidates');candidates.replaceChildren();if(!data.candidates.length)candidates.append(text('li','No change candidates.','empty'));for(const item of data.candidates)candidates.append(text('li',item.outcome+' · '+item.state+' · '+item.title));const events=byId('events');events.replaceChildren();if(!data.recentEvents.length)events.append(text('li','No events yet.','empty'));for(const item of data.recentEvents){const row=document.createElement('li');row.append(text('span','#'+item.sequence+' · '+item.eventType),text('time',new Date(item.timestamp).toLocaleString(),'event-time'));events.append(row)}const initial=data.projects.some((item)=>item.id===selectedProject)?selectedProject:data.projects[0]?.id;if(initial)loadBrief(initial)};
    const deleteProject=(projectId,title)=>{if(!window.confirm('确认永久删除项目“'+title+'”？项目记录、关联工作项和本地目录都将不可恢复。'))return;fetch('/api/projects/'+encodeURIComponent(projectId),{method:'DELETE',headers:{'content-type':'application/json','idempotency-key':'delete-project-'+projectId+'-'+Date.now()},body:'{}'}).then(parseResponse).then(()=>{selectedProject=null;loadStatus()}).catch((error)=>window.alert('删除失败：'+error.message))};
    const createProject=(event)=>{event.preventDefault();const title=byId('project-title').value.trim();if(!title)return;fetch('/api/projects',{method:'POST',headers:{'content-type':'application/json','idempotency-key':'create-project-'+crypto.randomUUID()},body:JSON.stringify({title})}).then(parseResponse).then((payload)=>{byId('project-create').reset();byId('project-create').hidden=true;selectedProject=payload.project.id;loadStatus()}).catch((error)=>window.alert('创建失败：'+error.message))};
    const loadStatus=(cursor=null,append=false)=>{const query=new URLSearchParams();if(cursor)query.set('projectCursor',cursor);fetch('/api/status?'+query,{cache:'no-store'}).then(parseResponse).then((data)=>renderStatus(data,append)).catch((error)=>{byId('projects').replaceChildren(text('p','Local state is unavailable: '+error.message,'error'));byId('freshness').textContent='State unavailable'})};
    byId('project-create-toggle').addEventListener('click',()=>{const form=byId('project-create');form.hidden=!form.hidden;if(!form.hidden)byId('project-title').focus()});
    byId('project-create').addEventListener('submit',createProject);
    loadStatus();
  </script>
</body>
</html>`;
async function startControlPage(options) {
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 0;
  const brief = new ProjectBriefService({ databasePath: options.databasePath, actor: "control-page-brief" });
  if (host !== "127.0.0.1") throw new Error("LOOPBACK_BIND_REQUIRED");
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("PORT_INVALID");
  const server = http.createServer(async (request, response) => {
    const parsedUrl = new URL2(request.url ?? "/", `http://${host}`);
    const pathname = parsedUrl.pathname;
    if (pathname === "/healthz") {
      if (request.method !== "GET") return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
      return json(response, 200, { ok: true, host, formalStateReadOnly: true });
    }
    if (pathname === "/api/status") {
      if (request.method !== "GET") return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
      try {
        return json(response, 200, await readPlatformSnapshot(options.databasePath, {
          projectCursor: parsedUrl.searchParams.get("projectCursor") ?? void 0,
          candidateCursor: parsedUrl.searchParams.get("candidateCursor") ?? void 0,
          eventCursor: optionalPositiveInteger(parsedUrl, "eventCursor"),
          includeArchived: parsedUrl.searchParams.get("includeArchived") === "1"
        }));
      } catch (error) {
        return json(response, 503, { ok: false, code: error instanceof Error ? error.message : String(error) });
      }
    }
    if (pathname === "/api/projects" && request.method === "POST") {
      try {
        const project = await writeProject(options.databasePath, "CREATE", null, await readJsonRequest(request));
        return json(response, 201, { ok: true, project });
      } catch (error) {
        const code = error instanceof Error ? error.message : String(error);
        return json(response, code.startsWith("PROJECT_") || code.startsWith("IDEMPOTENCY_") ? 400 : 503, { ok: false, code });
      }
    }
    const projectDeleteMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (projectDeleteMatch && request.method === "DELETE") {
      try {
        const project = await writeProject(options.databasePath, "DELETE", decodeURIComponent(projectDeleteMatch[1]), await readJsonRequest(request));
        return json(response, 200, { ok: true, deleted: project });
      } catch (error) {
        const code = error instanceof Error ? error.message : String(error);
        return json(response, code.startsWith("PROJECT_") || code.startsWith("IDEMPOTENCY_") ? 409 : 503, { ok: false, code });
      }
    }
    const briefMatch = pathname.match(/^\/api\/projects\/([^/]+)\/brief$/);
    if (briefMatch) {
      if (request.method !== "GET") return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
      try {
        if (parsedUrl.searchParams.has("includeQuotes")) throw new Error("PROJECT_BRIEF_QUOTE_PARAMETER_UNSUPPORTED");
        const projection = await brief.read(decodeURIComponent(briefMatch[1]), briefReadOptions(parsedUrl));
        return json(response, 200, projection);
      } catch (error) {
        const code = error instanceof Error ? error.message : String(error);
        return json(response, code.startsWith("PROJECT_NOT_FOUND:") ? 404 : 400, { ok: false, code });
      }
    }
    const quoteMatch = pathname.match(/^\/api\/projects\/([^/]+)\/brief\/quotes$/);
    if (quoteMatch) {
      if (request.method !== "POST") return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
      try {
        if (parsedUrl.searchParams.has("includeQuotes")) throw new Error("PROJECT_BRIEF_QUOTE_PARAMETER_UNSUPPORTED");
        const projectId = decodeURIComponent(quoteMatch[1]);
        const capability = await brief.issueQuoteCapability(projectId, "UI");
        const projection = await brief.read(projectId, { ...briefReadOptions(parsedUrl), quoteCapability: capability.token, quoteAudience: "UI" });
        return json(response, 200, projection);
      } catch (error) {
        const code = error instanceof Error ? error.message : String(error);
        return json(response, code.startsWith("PROJECT_NOT_FOUND:") ? 404 : 400, { ok: false, code });
      }
    }
    if (pathname === "/favicon.ico") {
      if (request.method !== "GET") return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
      response.writeHead(204, { "cache-control": "public, max-age=86400" });
      return response.end();
    }
    if (pathname !== "/") return json(response, 404, { ok: false, code: "NOT_FOUND" });
    if (request.method !== "GET") return json(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-security-policy": "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY"
    });
    response.end(controlPage);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("CONTROL_PAGE_ADDRESS_UNAVAILABLE");
  return {
    host,
    port: address.port,
    url: `http://${host}:${address.port}/`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}
var hostFallbacks = Object.freeze(["A_PLUGIN_MCP_APPS_UI", "B_PLUGIN_MCP_LOCAL_CONTROL", "C_CLI_TOOL"]);

// packages/lifecycle/src/index.ts
import crypto5 from "node:crypto";
import fs3 from "node:fs";
import path4 from "node:path";
var RemoteTaskUncertainError = class extends Error {
  constructor(message, threadId = null) {
    super(message);
    this.threadId = threadId;
    this.name = "RemoteTaskUncertainError";
  }
  threadId;
};
var SimulatedProcessCrash = class extends Error {
  constructor(step) {
    super(`SIMULATED_PROCESS_CRASH_AFTER:${step}`);
    this.step = step;
    this.name = "SimulatedProcessCrash";
  }
  step;
};
function sha256Bytes(bytes) {
  return crypto5.createHash("sha256").update(bytes).digest("hex");
}
function hashFile(filePath) {
  return sha256Bytes(fs3.readFileSync(filePath));
}
function ensureAbsolute(value, label) {
  if (!path4.isAbsolute(value)) throw new Error(`ABSOLUTE_PATH_REQUIRED:${label}`);
  return path4.normalize(value);
}
function ensureWithin(root, candidate) {
  const normalized = path4.normalize(candidate);
  if (normalized !== root && !normalized.startsWith(`${root}${path4.sep}`)) throw new Error(`PATH_OUTSIDE_PROJECTS_ROOT:${normalized}`);
  return normalized;
}
function ensureDirectoryRoot(root) {
  fs3.mkdirSync(root, { recursive: true });
  if (fs3.lstatSync(root).isSymbolicLink()) throw new Error("PROJECTS_ROOT_SYMLINK_FORBIDDEN");
}
function writeJsonOnce(filePath, payload) {
  const bytes = `${canonicalJson(payload)}
`;
  fs3.mkdirSync(path4.dirname(filePath), { recursive: true });
  if (fs3.existsSync(filePath)) {
    if (fs3.lstatSync(filePath).isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN:${filePath}`);
    const existing = fs3.readFileSync(filePath, "utf8");
    if (existing !== bytes) throw new Error(`IMMUTABLE_FILE_CONFLICT:${filePath}`);
    return sha256Bytes(existing);
  }
  const temporary = `${filePath}.tmp-${process.pid}-${crypto5.randomUUID()}`;
  fs3.writeFileSync(temporary, bytes, { flag: "wx", mode: 384 });
  fs3.renameSync(temporary, filePath);
  return sha256Bytes(bytes);
}
function uuid2(value, label) {
  if (typeof value !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)) {
    throw new Error(`UUID_REQUIRED:${label}`);
  }
  return value;
}
var ProjectLifecycleService = class {
  databasePath;
  projectsRoot;
  actor;
  taskPort;
  faults;
  constructor(options) {
    this.databasePath = ensureAbsolute(options.databasePath, "databasePath");
    this.projectsRoot = ensureAbsolute(options.projectsRoot, "projectsRoot");
    this.taskPort = options.taskPort;
    this.actor = options.actor ?? "codex-lifecycle";
    this.faults = options.faults ?? {};
    ensureDirectoryRoot(this.projectsRoot);
  }
  ids(idempotencyKey2, action = "BOOTSTRAP") {
    if (idempotencyKey2.trim().length < 8 || idempotencyKey2.trim().length > 120) throw new Error("IDEMPOTENCY_KEY_LENGTH_INVALID");
    const base = `${action}:${idempotencyKey2.trim()}`;
    return {
      operationId: stableUuidFromKey(`OPERATION:${base}`),
      projectId: stableUuidFromKey(`PROJECT:${idempotencyKey2.trim()}`),
      taskId: stableUuidFromKey(`TASK:${idempotencyKey2.trim()}`),
      bindingId: stableUuidFromKey(`BINDING:${idempotencyKey2.trim()}`),
      contextPackId: stableUuidFromKey(`CONTEXT_PACK:${idempotencyKey2.trim()}:1`)
    };
  }
  projectPaths(projectId, operationId) {
    const active = ensureWithin(this.projectsRoot, path4.join(this.projectsRoot, projectId));
    const archived = ensureWithin(this.projectsRoot, path4.join(this.projectsRoot, "90-archive", "projects", projectId));
    const failed = ensureWithin(this.projectsRoot, path4.join(this.projectsRoot, "90-archive", "failed", `${projectId}-${operationId}`));
    const orphaned = ensureWithin(this.projectsRoot, path4.join(this.projectsRoot, "90-archive", "orphaned", `${projectId}-${operationId}`));
    const metadata = path4.join(active, ".codex-work-platform");
    return {
      active,
      archived,
      failed,
      orphaned,
      marker: path4.join(metadata, "project.json"),
      binding: path4.join(metadata, "binding.json"),
      contextPack: path4.join(metadata, "context-packs", "v1.json"),
      receiptRoot: ensureWithin(this.projectsRoot, path4.join(this.projectsRoot, ".codex-work-platform", "saga-receipts", operationId))
    };
  }
  stepEvent(kernel, operationId, step, phase) {
    return kernel.listEvents().find((event) => event.eventType === `SAGA_STEP_${phase}` && event.payload.operationId === operationId && event.payload.step === step) ?? null;
  }
  appendSagaEvent(kernel, operationId, step, phase, result = {}) {
    return kernel.appendEvent({
      schemaVersion: SCHEMA_VERSION,
      eventId: stableUuidFromKey(`EVENT:${operationId}:${step}:${phase}`),
      idempotencyKey: `p2:${operationId}:${step}:${phase}`,
      eventType: `SAGA_STEP_${phase}`,
      objectId: operationId,
      actor: this.actor,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      payload: { operationId, step, result }
    });
  }
  async runStep(kernel, operationId, step, action) {
    const prior = this.stepEvent(kernel, operationId, step, "SUCCEEDED");
    if (prior) return prior.payload.result ?? {};
    if (!this.stepEvent(kernel, operationId, step, "INTENT")) this.appendSagaEvent(kernel, operationId, step, "INTENT");
    try {
      const result = await action();
      this.appendSagaEvent(kernel, operationId, step, "SUCCEEDED", result);
      if (this.faults.crashAfterStep === step) throw new SimulatedProcessCrash(step);
      return result;
    } catch (error) {
      if (error instanceof SimulatedProcessCrash) throw error;
      if (!this.stepEvent(kernel, operationId, step, "FAILED")) {
        this.appendSagaEvent(kernel, operationId, step, "FAILED", {
          error: error instanceof Error ? error.message : String(error),
          threadId: error instanceof RemoteTaskUncertainError ? error.threadId : null
        });
      }
      throw error;
    }
  }
  maybeFail(step) {
    if (this.faults.failAt === step) throw new Error(`FAULT_INJECTED:${step}`);
  }
  ensureOperation(kernel, ids, action, idempotencyKey2, data) {
    const existing = kernel.getObject(ids.operationId);
    if (existing) return existing;
    return kernel.createObject({
      schemaVersion: SCHEMA_VERSION,
      id: ids.operationId,
      kind: "OPERATION",
      state: "ACTIVE",
      title: `${action} ${String(data.title ?? ids.projectId)}`,
      data: { action, projectId: ids.projectId, requestKey: idempotencyKey2, ...data }
    }, `p2:operation:${action}:${idempotencyKey2}`);
  }
  completeOperation(kernel, operationId, key) {
    let operation = kernel.getObject(operationId);
    if (!operation) throw new Error(`OPERATION_NOT_FOUND:${operationId}`);
    if (operation.state === "COMPLETED") return operation;
    if (operation.state === "ACTIVE") operation = kernel.transitionObject(operationId, "VERIFYING", operation.version, `${key}:operation-verifying`);
    if (operation.state === "VERIFYING") operation = kernel.transitionObject(operationId, "COMPLETED", operation.version, `${key}:operation-completed`);
    if (operation.state !== "COMPLETED") throw new Error(`OPERATION_NOT_COMPLETABLE:${operation.state}`);
    return operation;
  }
  moveDirectory(source, destination) {
    if (fs3.existsSync(source) && fs3.lstatSync(source).isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN:${source}`);
    if (fs3.existsSync(destination) && fs3.lstatSync(destination).isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN:${destination}`);
    if (!fs3.existsSync(source) && fs3.existsSync(destination)) return { source, destination, moved: false };
    if (!fs3.existsSync(source) && !fs3.existsSync(destination)) return { source, destination, moved: false };
    if (fs3.existsSync(source) && fs3.existsSync(destination)) throw new Error(`ARCHIVE_DESTINATION_CONFLICT:${destination}`);
    fs3.mkdirSync(path4.dirname(destination), { recursive: true });
    fs3.renameSync(source, destination);
    return { source, destination, moved: true };
  }
  transitionToArchived(kernel, object, key) {
    if (!object || object.state === "ARCHIVED") return;
    let current = object;
    if (current.state === "DRAFT") current = kernel.transitionObject(current.id, "FAILED", current.version, `${key}:failed`);
    if (current.state !== "ARCHIVED") kernel.transitionObject(current.id, "ARCHIVED", current.version, `${key}:archived`);
  }
  async compensateBootstrap(kernel, ids, paths, error) {
    const remoteSuccess = this.stepEvent(kernel, ids.operationId, "CODEX_MAIN_TASK", "SUCCEEDED");
    const failedRemote = this.stepEvent(kernel, ids.operationId, "CODEX_MAIN_TASK", "FAILED");
    const possible = error instanceof RemoteTaskUncertainError ? error.threadId : failedRemote?.payload.result && failedRemote.payload.result.threadId;
    const threadId = typeof remoteSuccess?.payload.result === "object" && remoteSuccess.payload.result ? remoteSuccess.payload.result.threadId : possible;
    const remoteOutcomeUnknown = error instanceof RemoteTaskUncertainError && (threadId === null || threadId === void 0);
    let remoteCompensated = !remoteOutcomeUnknown && (threadId === null || threadId === void 0);
    if (typeof threadId === "string") {
      try {
        await this.taskPort.archiveMainTask(threadId, `p2-compensate-${ids.operationId}`, path4.join(paths.receiptRoot, "compensate-remote-archive.json"));
        remoteCompensated = true;
        if (!this.stepEvent(kernel, ids.operationId, "COMPENSATE_CODEX_MAIN_TASK", "SUCCEEDED")) this.appendSagaEvent(kernel, ids.operationId, "COMPENSATE_CODEX_MAIN_TASK", "SUCCEEDED", { threadId });
      } catch (archiveError) {
        remoteCompensated = false;
        if (!this.stepEvent(kernel, ids.operationId, "COMPENSATE_CODEX_MAIN_TASK", "FAILED")) this.appendSagaEvent(kernel, ids.operationId, "COMPENSATE_CODEX_MAIN_TASK", "FAILED", { threadId, error: archiveError instanceof Error ? archiveError.message : String(archiveError) });
      }
    }
    let localCompensated = true;
    try {
      const destination = remoteCompensated ? paths.failed : paths.orphaned;
      const moved = this.moveDirectory(paths.active, destination);
      if (!this.stepEvent(kernel, ids.operationId, "COMPENSATE_LOCAL_DIRECTORY", "SUCCEEDED")) this.appendSagaEvent(kernel, ids.operationId, "COMPENSATE_LOCAL_DIRECTORY", "SUCCEEDED", moved);
    } catch (moveError) {
      localCompensated = false;
      if (!this.stepEvent(kernel, ids.operationId, "COMPENSATE_LOCAL_DIRECTORY", "FAILED")) this.appendSagaEvent(kernel, ids.operationId, "COMPENSATE_LOCAL_DIRECTORY", "FAILED", { error: moveError instanceof Error ? moveError.message : String(moveError) });
    }
    const terminal = !remoteOutcomeUnknown && remoteCompensated && localCompensated ? "FAILED" : "ORPHANED";
    for (const objectId of [ids.bindingId, ids.contextPackId, ids.taskId, ids.projectId]) {
      const object = kernel.getObject(objectId);
      if (terminal === "FAILED") this.transitionToArchived(kernel, object, `p2:compensate:${ids.operationId}:${objectId}`);
    }
    const operation = kernel.getObject(ids.operationId);
    if (operation?.state === "ACTIVE") kernel.transitionObject(operation.id, terminal, operation.version, `p2:operation-terminal:${ids.operationId}:${terminal}`);
    return terminal;
  }
  async bootstrap(input) {
    const key = input.idempotencyKey.trim();
    const title = input.title.trim();
    if (!title) throw new Error("PROJECT_TITLE_REQUIRED");
    const ids = this.ids(key);
    const paths = this.projectPaths(ids.projectId, ids.operationId);
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      let operation = this.ensureOperation(kernel, ids, "PROJECT_BOOTSTRAP", key, { title, objective: input.objective ?? null, projectsRoot: this.projectsRoot });
      if (["COMPLETED", "FAILED", "ORPHANED", "MANUAL_INTERVENTION"].includes(operation.state)) return this.snapshot(kernel, ids, paths);
      let remoteThreadId = null;
      try {
        await this.runStep(kernel, ids.operationId, "LOCAL_DIRECTORY", () => {
          this.maybeFail("LOCAL_DIRECTORY");
          if (fs3.existsSync(paths.active) && fs3.lstatSync(paths.active).isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN:${paths.active}`);
          fs3.mkdirSync(paths.active, { recursive: true });
          const entries = fs3.readdirSync(paths.active).filter((entry) => entry !== ".codex-work-platform");
          if (entries.length > 0) throw new Error(`PROJECT_DIRECTORY_FOREIGN_CONTENT:${paths.active}`);
          const markerSha256 = writeJsonOnce(paths.marker, { schemaVersion: 1, projectId: ids.projectId, operationId: ids.operationId, ownership: "CODEX_WORK_PLATFORM" });
          return { projectDirectory: paths.active, markerSha256 };
        });
        const remote = await this.runStep(kernel, ids.operationId, "CODEX_MAIN_TASK", async () => {
          this.maybeFail("CODEX_MAIN_TASK");
          const receipt = await this.taskPort.createMainTask({ cwd: paths.active, title, idempotencyKey: key, receiptPath: path4.join(paths.receiptRoot, "codex-main-task.json") });
          return { threadId: uuid2(receipt.threadId, "threadId"), receiptPath: path4.join(paths.receiptRoot, "codex-main-task.json") };
        });
        remoteThreadId = uuid2(remote.threadId, "threadId");
        await this.runStep(kernel, ids.operationId, "PROJECT_ENTITY", () => {
          this.maybeFail("PROJECT_ENTITY");
          const project = kernel.createObject({
            schemaVersion: SCHEMA_VERSION,
            id: ids.projectId,
            kind: "PROJECT",
            state: "DRAFT",
            title,
            data: {
              objective: input.objective ?? null,
              projectDirectory: paths.active,
              archiveDirectory: paths.archived,
              taskId: ids.taskId,
              bindingId: ids.bindingId,
              contextPackId: ids.contextPackId,
              codexThreadId: remoteThreadId
            }
          }, `p2:${key}:project`);
          return { projectId: project.id };
        });
        await this.runStep(kernel, ids.operationId, "TASK_ENTITY", () => {
          this.maybeFail("TASK_ENTITY");
          const task = kernel.createObject({ schemaVersion: SCHEMA_VERSION, id: ids.taskId, kind: "TASK", state: "ACTIVE", title: `${title} main Codex task`, data: { projectId: ids.projectId, codexThreadId: remoteThreadId, role: "MAIN_TASK", objective: input.objective ?? null, completionCriteria: null } }, `p2:${key}:task`);
          return { taskId: task.id, threadId: remoteThreadId };
        });
        const context = await this.runStep(kernel, ids.operationId, "CONTEXT_PACK", () => {
          this.maybeFail("CONTEXT_PACK");
          const payload = {
            schemaVersion: 1,
            contextPackVersion: 1,
            contextPackId: ids.contextPackId,
            projectId: ids.projectId,
            taskId: ids.taskId,
            bindingId: ids.bindingId,
            codexThreadId: remoteThreadId,
            goal: input.objective ?? null,
            facts: [],
            decisions: [],
            constraints: ["Business state is owned by the local control kernel."],
            openQuestions: [],
            fileIndex: [".codex-work-platform/project.json", ".codex-work-platform/binding.json"]
          };
          const fileSha256 = writeJsonOnce(paths.contextPack, payload);
          const contextPack = kernel.createObject({ schemaVersion: SCHEMA_VERSION, id: ids.contextPackId, kind: "CONTEXT_PACK", state: "ACTIVE", title: `${title} Context Pack v1`, data: { projectId: ids.projectId, version: 1, path: paths.contextPack, fileSha256, codexThreadId: remoteThreadId } }, `p2:${key}:context-pack`);
          return { contextPackId: contextPack.id, path: paths.contextPack, fileSha256 };
        });
        await this.runStep(kernel, ids.operationId, "ID_BINDING", () => {
          this.maybeFail("ID_BINDING");
          const payload = { schemaVersion: 1, bindingId: ids.bindingId, projectId: ids.projectId, taskId: ids.taskId, contextPackId: ids.contextPackId, contextPackSha256: context.fileSha256, codexThreadId: remoteThreadId, projectDirectory: paths.active };
          const fileSha256 = writeJsonOnce(paths.binding, payload);
          const binding = kernel.createObject({ schemaVersion: SCHEMA_VERSION, id: ids.bindingId, kind: "BINDING", state: "ACTIVE", title: `${title} identity binding`, data: { ...payload, path: paths.binding, fileSha256 } }, `p2:${key}:binding`);
          return { bindingId: binding.id, path: paths.binding, fileSha256 };
        });
        await this.runStep(kernel, ids.operationId, "PROJECT_ACTIVATION", () => {
          this.maybeFail("PROJECT_ACTIVATION");
          let project = kernel.getObject(ids.projectId);
          if (!project) throw new Error(`PROJECT_NOT_FOUND:${ids.projectId}`);
          if (project.state === "DRAFT") project = kernel.transitionObject(project.id, "ACTIVE", project.version, `p2:${key}:project-active`);
          if (project.state !== "ACTIVE") throw new Error(`PROJECT_ACTIVATION_STATE_INVALID:${project.state}`);
          return { projectId: project.id, state: project.state, version: project.version };
        });
        operation = this.completeOperation(kernel, ids.operationId, `p2:${key}`);
        return this.snapshot(kernel, ids, paths, operation);
      } catch (error) {
        if (error instanceof SimulatedProcessCrash) throw error;
        await this.compensateBootstrap(kernel, ids, paths, error);
        throw new Error(`LIFECYCLE_BOOTSTRAP_FAILED:${ids.operationId}:${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      kernel.close();
    }
  }
  relatedIds(project) {
    return {
      operationId: "",
      projectId: project.id,
      taskId: uuid2(project.data.taskId, "taskId"),
      bindingId: uuid2(project.data.bindingId, "bindingId"),
      contextPackId: uuid2(project.data.contextPackId, "contextPackId")
    };
  }
  relocatedObjectPath(object, projectDirectory, paths, fallbackRelative) {
    if (!object) return ensureWithin(projectDirectory, path4.join(projectDirectory, fallbackRelative));
    let relative;
    if (typeof object.data.relativePath === "string") {
      if (path4.isAbsolute(object.data.relativePath)) throw new Error(`RELATIVE_PATH_REQUIRED:${object.id}`);
      relative = path4.normalize(object.data.relativePath);
      if (!relative || relative === ".." || relative.startsWith(`..${path4.sep}`)) throw new Error(`RELATIVE_PATH_INVALID:${object.id}`);
    } else {
      const stored = ensureAbsolute(String(object.data.path ?? ""), `objectPath:${object.id}`);
      const activeRelative = path4.relative(paths.active, stored);
      const archiveRelative = path4.relative(paths.archived, stored);
      if (activeRelative && activeRelative !== ".." && !activeRelative.startsWith(`..${path4.sep}`)) relative = activeRelative;
      else if (archiveRelative && archiveRelative !== ".." && !archiveRelative.startsWith(`..${path4.sep}`)) relative = archiveRelative;
      else throw new Error(`OBJECT_PATH_NOT_RELOCATABLE:${object.id}:${stored}`);
    }
    return ensureWithin(projectDirectory, path4.join(projectDirectory, relative));
  }
  contextHistory(kernel, projectId) {
    return kernel.listObjects().filter((item) => (item.kind === "CONTEXT_PACK" || item.kind === "BINDING") && item.data.projectId === projectId);
  }
  snapshot(kernel, ids, paths, operationOverride) {
    const operation = operationOverride ?? kernel.getObject(ids.operationId);
    if (!operation) throw new Error(`OPERATION_NOT_FOUND:${ids.operationId}`);
    const project = kernel.getObject(ids.projectId);
    const task = kernel.getObject(ids.taskId);
    const binding = kernel.getObject(ids.bindingId);
    const contextPack = kernel.getObject(ids.contextPackId);
    const remote = this.stepEvent(kernel, ids.operationId, "CODEX_MAIN_TASK", "SUCCEEDED");
    const remoteResult = remote?.payload.result;
    const thread = typeof binding?.data.codexThreadId === "string" ? binding.data.codexThreadId : typeof remoteResult?.threadId === "string" ? remoteResult.threadId : null;
    const projectDirectory = project?.state === "ARCHIVED" ? paths.archived : paths.active;
    return {
      operation,
      project,
      task,
      binding,
      contextPack,
      projectDirectory,
      codexThreadId: thread,
      codexDeepLink: thread ? `codex://threads/${encodeURIComponent(thread)}` : null,
      contextPackPath: this.relocatedObjectPath(contextPack, projectDirectory, paths, path4.join(".codex-work-platform", "context-packs", "v1.json")),
      bindingPath: this.relocatedObjectPath(binding, projectDirectory, paths, path4.join(".codex-work-platform", "binding.json"))
    };
  }
  async enter(projectId) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "VIEWER", readOnly: true });
    try {
      const project = kernel.getObject(uuid2(projectId, "projectId"));
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${projectId}`);
      const ids = this.relatedIds(project);
      const operation = kernel.listObjects("OPERATION").filter((item) => item.data.projectId === project.id && item.data.action === "PROJECT_BOOTSTRAP").at(-1);
      if (!operation) throw new Error(`BOOTSTRAP_OPERATION_NOT_FOUND:${project.id}`);
      ids.operationId = operation.id;
      const paths = this.projectPaths(project.id, operation.id);
      const snapshot = this.snapshot(kernel, ids, paths, operation);
      const bindingPath = snapshot.bindingPath;
      const contextPath = snapshot.contextPackPath;
      if (!fs3.existsSync(bindingPath) || !fs3.existsSync(contextPath)) throw new Error(`PROJECT_FILES_MISSING:${project.id}`);
      if (snapshot.binding?.data.fileSha256 !== hashFile(bindingPath)) throw new Error(`BINDING_HASH_MISMATCH:${project.id}`);
      if (snapshot.contextPack?.data.fileSha256 !== hashFile(contextPath)) throw new Error(`CONTEXT_PACK_HASH_MISMATCH:${project.id}`);
      return { ...snapshot, bindingPath, contextPackPath: contextPath, projectDirectory: project.state === "ARCHIVED" ? paths.archived : paths.active };
    } finally {
      kernel.close();
    }
  }
  async returnToProject(projectId) {
    return this.enter(projectId);
  }
  ensureLifecycleOperation(kernel, project, action, idempotencyKey2) {
    const ids = this.ids(idempotencyKey2, action);
    const existing = kernel.getObject(ids.operationId);
    if (existing) return existing;
    return kernel.createObject({ schemaVersion: SCHEMA_VERSION, id: ids.operationId, kind: "OPERATION", state: "ACTIVE", title: `${action} ${project.title}`, data: { action, projectId: project.id, requestKey: idempotencyKey2 } }, `p2:operation:${action}:${idempotencyKey2}`);
  }
  transitionEntityToCompleted(kernel, entityId, key) {
    let entity = kernel.getObject(entityId);
    if (!entity) throw new Error(`OBJECT_NOT_FOUND:${entityId}`);
    if (entity.state === "ACTIVE") entity = kernel.transitionObject(entity.id, "VERIFYING", entity.version, `${key}:verifying`);
    if (entity.state === "VERIFYING") entity = kernel.transitionObject(entity.id, "COMPLETED", entity.version, `${key}:completed`);
    if (entity.state !== "COMPLETED") throw new Error(`OBJECT_NOT_COMPLETABLE:${entity.kind}:${entity.state}`);
    return entity;
  }
  async complete(projectId, idempotencyKey2) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      const project = kernel.getObject(uuid2(projectId, "projectId"));
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${projectId}`);
      const related = this.relatedIds(project);
      const operation = this.ensureLifecycleOperation(kernel, project, "COMPLETE", idempotencyKey2);
      await this.runStep(kernel, operation.id, "COMPLETE_TASK", () => ({ task: this.transitionEntityToCompleted(kernel, related.taskId, `p2:${idempotencyKey2}:task`).id }));
      await this.runStep(kernel, operation.id, "COMPLETE_PROJECT", () => ({ project: this.transitionEntityToCompleted(kernel, project.id, `p2:${idempotencyKey2}:project`).id }));
      const completedOperation = this.completeOperation(kernel, operation.id, `p2:${idempotencyKey2}`);
      related.operationId = kernel.listObjects("OPERATION").find((item) => item.data.projectId === project.id && item.data.action === "PROJECT_BOOTSTRAP")?.id ?? operation.id;
      return this.snapshot(kernel, related, this.projectPaths(project.id, related.operationId), completedOperation);
    } finally {
      kernel.close();
    }
  }
  async archive(projectId, idempotencyKey2) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      let project = kernel.getObject(uuid2(projectId, "projectId"));
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${projectId}`);
      if (project.state !== "COMPLETED" && project.state !== "ARCHIVED") throw new Error(`PROJECT_MUST_BE_COMPLETED:${project.state}`);
      const persistedProjectId = project.id;
      const related = this.relatedIds(project);
      const bootstrap = kernel.listObjects("OPERATION").find((item) => item.data.projectId === persistedProjectId && item.data.action === "PROJECT_BOOTSTRAP");
      if (!bootstrap) throw new Error(`BOOTSTRAP_OPERATION_NOT_FOUND:${persistedProjectId}`);
      related.operationId = bootstrap.id;
      const paths = this.projectPaths(persistedProjectId, bootstrap.id);
      const operation = this.ensureLifecycleOperation(kernel, project, "ARCHIVE", idempotencyKey2);
      const threadId = uuid2(project.data.codexThreadId, "codexThreadId");
      await this.runStep(kernel, operation.id, "ARCHIVE_CODEX_TASK", async () => {
        await this.taskPort.archiveMainTask(threadId, idempotencyKey2, path4.join(paths.receiptRoot, `archive-${operation.id}.json`));
        return { threadId };
      });
      await this.runStep(kernel, operation.id, "ARCHIVE_LOCAL_DIRECTORY", () => this.moveDirectory(paths.active, paths.archived));
      await this.runStep(kernel, operation.id, "ARCHIVE_OBJECTS", () => {
        const objectIds = /* @__PURE__ */ new Set([related.taskId, persistedProjectId, ...this.contextHistory(kernel, persistedProjectId).map((item) => item.id)]);
        for (const objectId of objectIds) this.transitionToArchived(kernel, kernel.getObject(objectId), `p2:${idempotencyKey2}:${objectId}`);
        return { projectId: persistedProjectId };
      });
      const completedOperation = this.completeOperation(kernel, operation.id, `p2:${idempotencyKey2}`);
      project = kernel.getObject(persistedProjectId);
      return this.snapshot(kernel, related, paths, completedOperation);
    } finally {
      kernel.close();
    }
  }
  async restore(projectId, idempotencyKey2) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      let project = kernel.getObject(uuid2(projectId, "projectId"));
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${projectId}`);
      if (project.state !== "ARCHIVED" && project.state !== "COMPLETED") throw new Error(`PROJECT_NOT_ARCHIVED:${project.state}`);
      const persistedProjectId = project.id;
      const related = this.relatedIds(project);
      const bootstrap = kernel.listObjects("OPERATION").find((item) => item.data.projectId === persistedProjectId && item.data.action === "PROJECT_BOOTSTRAP");
      if (!bootstrap) throw new Error(`BOOTSTRAP_OPERATION_NOT_FOUND:${persistedProjectId}`);
      related.operationId = bootstrap.id;
      const paths = this.projectPaths(persistedProjectId, bootstrap.id);
      const operation = this.ensureLifecycleOperation(kernel, project, "RESTORE", idempotencyKey2);
      const threadId = uuid2(project.data.codexThreadId, "codexThreadId");
      await this.runStep(kernel, operation.id, "RESTORE_LOCAL_DIRECTORY", () => this.moveDirectory(paths.archived, paths.active));
      await this.runStep(kernel, operation.id, "RESTORE_CODEX_TASK", async () => {
        await this.taskPort.restoreMainTask(threadId, idempotencyKey2, path4.join(paths.receiptRoot, `restore-${operation.id}.json`));
        return { threadId };
      });
      await this.runStep(kernel, operation.id, "RESTORE_OBJECTS", () => {
        const targets = [
          [related.taskId, "COMPLETED"],
          ...this.contextHistory(kernel, persistedProjectId).map((item) => [item.id, "ACTIVE"]),
          [persistedProjectId, "COMPLETED"]
        ];
        for (const [objectId, target] of targets) {
          const object = kernel.getObject(objectId);
          if (!object) throw new Error(`OBJECT_NOT_FOUND:${objectId}`);
          if (object.state === "ARCHIVED") kernel.transitionObject(object.id, target, object.version, `p2:${idempotencyKey2}:${objectId}:restored`);
          else if (object.state !== target) throw new Error(`RESTORE_STATE_CONFLICT:${object.kind}:${object.state}`);
        }
        return { projectId: persistedProjectId };
      });
      const completedOperation = this.completeOperation(kernel, operation.id, `p2:${idempotencyKey2}`);
      project = kernel.getObject(persistedProjectId);
      return this.snapshot(kernel, related, paths, completedOperation);
    } finally {
      kernel.close();
    }
  }
  async listActionableOperations() {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "VIEWER", readOnly: true });
    try {
      return kernel.listObjects("OPERATION").filter((item) => ["ACTIVE", "ORPHANED", "MANUAL_INTERVENTION", "FAILED"].includes(item.state));
    } finally {
      kernel.close();
    }
  }
};

// packages/codex-adapter/src/index.ts
import { spawn } from "node:child_process";
import fs4 from "node:fs";
import os from "node:os";
import path5 from "node:path";
import readline from "node:readline";
function absolute(value, label) {
  if (!path5.isAbsolute(value)) throw new Error(`ABSOLUTE_PATH_REQUIRED:${label}`);
  return path5.normalize(value);
}
function safeEnvironment(codexHome) {
  const allowed = ["PATH", "HOME", "LANG", "LC_ALL", "LC_CTYPE", "TMPDIR", "SHELL", "TERM"];
  const env = {};
  for (const key of allowed) if (typeof process.env[key] === "string") env[key] = process.env[key];
  env.CODEX_HOME = codexHome;
  env.NO_COLOR = "1";
  return env;
}
function atomicJson(filePath, payload) {
  const normalized = absolute(filePath, "receiptPath");
  const bytes = `${JSON.stringify(payload)}
`;
  fs4.mkdirSync(path5.dirname(normalized), { recursive: true });
  if (fs4.existsSync(normalized)) {
    if (fs4.lstatSync(normalized).isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN:${normalized}`);
    if (fs4.readFileSync(normalized, "utf8") !== bytes) throw new Error(`RECEIPT_CONFLICT:${normalized}`);
    return;
  }
  const temporary = `${normalized}.tmp-${process.pid}-${Date.now()}`;
  fs4.writeFileSync(temporary, bytes, { flag: "wx", mode: 384 });
  fs4.renameSync(temporary, normalized);
}
function readReceipt(filePath) {
  const normalized = absolute(filePath, "receiptPath");
  if (!fs4.existsSync(normalized)) return null;
  if (fs4.lstatSync(normalized).isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN:${normalized}`);
  const parsed = JSON.parse(fs4.readFileSync(normalized, "utf8"));
  if (parsed.schemaVersion !== 1 || typeof parsed.threadId !== "string" || !parsed.threadId) throw new Error(`RECEIPT_INVALID:${normalized}`);
  return parsed;
}
var AppServerSession = class {
  constructor(codexBin, codexHome, cwd, timeoutMs) {
    this.timeoutMs = timeoutMs;
    this.child = spawn(codexBin, ["app-server", "--stdio"], {
      cwd,
      env: safeEnvironment(codexHome),
      stdio: ["pipe", "pipe", "pipe"]
    });
    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", (chunk) => this.stderr.push(chunk));
    this.child.once("error", (error) => this.rejectAll(error));
    this.child.once("exit", (code, signal) => {
      this.exited = true;
      if (!this.stopping) this.rejectAll(new Error(`APP_SERVER_EXITED:${code ?? "null"}:${signal ?? "null"}`));
    });
    const lines = readline.createInterface({ input: this.child.stdout, crlfDelay: Infinity });
    lines.on("line", (line) => this.onLine(line));
  }
  timeoutMs;
  child;
  pending = /* @__PURE__ */ new Map();
  nextId = 1;
  stopping = false;
  exited = false;
  stderr = [];
  rejectAll(error) {
    for (const request of this.pending.values()) {
      clearTimeout(request.timer);
      request.reject(error);
    }
    this.pending.clear();
  }
  onLine(line) {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      this.rejectAll(new Error(`APP_SERVER_NON_JSON_OUTPUT:${line}`));
      return;
    }
    if (message.id === void 0) return;
    const pending = this.pending.get(String(message.id));
    if (!pending) return;
    this.pending.delete(String(message.id));
    clearTimeout(pending.timer);
    if (message.error !== void 0) pending.reject(new Error(`APP_SERVER_RPC_ERROR:${pending.method}:${JSON.stringify(message.error)}`));
    else pending.resolve(message.result);
  }
  request(method, params) {
    if (this.exited) return Promise.reject(new Error("APP_SERVER_NOT_RUNNING"));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(String(id));
        reject(new Error(`APP_SERVER_RPC_TIMEOUT:${method}`));
      }, this.timeoutMs);
      this.pending.set(String(id), { method, timer, resolve: (value) => resolve(value), reject });
      this.child.stdin.write(`${JSON.stringify({ id, method, params })}
`);
    });
  }
  async initialize() {
    const result = await this.request("initialize", {
      clientInfo: { name: "codex-work-platform-lifecycle", version: PRODUCT_VERSION },
      capabilities: { experimentalApi: true }
    });
    this.child.stdin.write(`${JSON.stringify({ method: "initialized" })}
`);
    return result;
  }
  async close() {
    if (this.exited) return;
    this.stopping = true;
    this.child.stdin.end();
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (!this.exited) this.child.kill("SIGTERM");
        resolve();
      }, 2e3);
      this.child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
};
var AppServerTaskAdapter = class {
  codexHome;
  codexBin;
  timeoutMs;
  constructor(options) {
    this.codexHome = absolute(options.codexHome, "codexHome");
    this.codexBin = options.codexBin?.trim() || "codex";
    this.timeoutMs = options.timeoutMs ?? 3e4;
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 1e3 || this.timeoutMs > 12e4) throw new Error("APP_SERVER_TIMEOUT_INVALID");
    const activeCodexHome = path5.join(os.homedir(), ".codex");
    if (!options.allowActiveCodexHome && (this.codexHome === activeCodexHome || this.codexHome.startsWith(`${activeCodexHome}${path5.sep}`))) {
      throw new Error("ACTIVE_CODEX_HOME_FORBIDDEN");
    }
    fs4.mkdirSync(this.codexHome, { recursive: true });
    if (fs4.lstatSync(this.codexHome).isSymbolicLink()) throw new Error("CODEX_HOME_SYMLINK_FORBIDDEN");
  }
  async session(cwd, action) {
    const normalizedCwd = absolute(cwd, "cwd");
    const session = new AppServerSession(this.codexBin, this.codexHome, normalizedCwd, this.timeoutMs);
    try {
      const initialized = await session.initialize();
      if (initialized.codexHome && path5.normalize(initialized.codexHome) !== this.codexHome) throw new Error(`CODEX_HOME_MISMATCH:${initialized.codexHome}`);
      return await action(session, initialized);
    } finally {
      await session.close();
    }
  }
  validatePrior(prior, action, idempotencyKey2, threadId) {
    if (prior.action !== action || prior.idempotencyKey !== idempotencyKey2 || threadId !== void 0 && prior.threadId !== threadId) {
      throw new Error(`RECEIPT_IDEMPOTENCY_CONFLICT:${action}:${idempotencyKey2}`);
    }
    return prior;
  }
  async createMainTask(input) {
    const prior = readReceipt(input.receiptPath);
    if (prior) return this.validatePrior(prior, "CREATE", input.idempotencyKey);
    let knownThreadId = null;
    try {
      return await this.session(input.cwd, async (session, initialized) => {
        const started = await session.request("thread/start", {
          cwd: absolute(input.cwd, "cwd"),
          sandbox: "read-only",
          approvalPolicy: "never",
          ephemeral: false,
          historyMode: "legacy"
        });
        knownThreadId = started?.thread?.id ?? null;
        if (!knownThreadId) throw new Error("THREAD_START_ID_MISSING");
        await session.request("thread/name/set", { threadId: knownThreadId, name: input.title });
        const receipt = {
          schemaVersion: 1,
          action: "CREATE",
          threadId: knownThreadId,
          title: input.title,
          idempotencyKey: input.idempotencyKey,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          codexHome: this.codexHome,
          codexUserAgent: initialized.userAgent ?? null
        };
        atomicJson(input.receiptPath, receipt);
        return receipt;
      });
    } catch (error) {
      if (error instanceof RemoteTaskUncertainError) throw error;
      throw new RemoteTaskUncertainError(error instanceof Error ? error.message : String(error), knownThreadId);
    }
  }
  async changeArchiveState(action, threadId, idempotencyKey2, receiptPath) {
    const prior = readReceipt(receiptPath);
    if (prior) {
      this.validatePrior(prior, action, idempotencyKey2, threadId);
      return;
    }
    await this.session(this.codexHome, async (session, initialized) => {
      let warning;
      try {
        await session.request(action === "ARCHIVE" ? "thread/archive" : "thread/unarchive", { threadId });
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        const knownPostCommitReadFailure = action === "RESTORE" && detail.includes("failed to read unarchived thread");
        if (!knownPostCommitReadFailure) throw error;
        const readBack = await session.request("thread/read", { threadId, includeTurns: false });
        if (readBack.thread.id !== threadId) throw new Error(`CODEX_THREAD_ID_MISMATCH:${readBack.thread.id}:${threadId}`);
        warning = "CODEX_0_144_4_EMPTY_THREAD_UNARCHIVE_POST_COMMIT_READ_FAILURE";
      }
      const receipt = {
        schemaVersion: 1,
        action,
        threadId,
        idempotencyKey: idempotencyKey2,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        codexHome: this.codexHome,
        codexUserAgent: initialized.userAgent ?? null,
        ...warning ? { warning } : {}
      };
      atomicJson(receiptPath, receipt);
    });
  }
  archiveMainTask(threadId, idempotencyKey2, receiptPath) {
    return this.changeArchiveState("ARCHIVE", threadId, idempotencyKey2, receiptPath);
  }
  restoreMainTask(threadId, idempotencyKey2, receiptPath) {
    return this.changeArchiveState("RESTORE", threadId, idempotencyKey2, receiptPath);
  }
  async inspectMainTask(threadId) {
    return this.session(this.codexHome, async (session) => {
      const response = await session.request("thread/read", { threadId, includeTurns: false });
      if (response.thread.id !== threadId) throw new Error(`CODEX_THREAD_ID_MISMATCH:${response.thread.id}:${threadId}`);
      return { threadId, cwd: response.thread.cwd ?? null, name: response.thread.name ?? null };
    });
  }
};

// packages/task-sync/src/index.ts
import crypto6 from "node:crypto";
import fs5 from "node:fs";
import path6 from "node:path";
var safeStream = external_exports.string().trim().min(1).max(4096).refine((value) => !["__proto__", "prototype", "constructor"].includes(value), "SOURCE_STREAM_ID_FORBIDDEN");
var sha2562 = external_exports.string().regex(/^[a-f0-9]{64}$/);
var candidateInputSchema = external_exports.object({
  projectId: external_exports.string().uuid(),
  sourceKind: external_exports.enum(["CHAT", "FILE", "IMPORT"]),
  sourceStreamId: safeStream,
  sourceKey: external_exports.string().trim().min(1).max(1024).optional(),
  sourceEventId: external_exports.string().trim().min(1).max(200),
  sourceVersion: external_exports.number().int().positive(),
  occurredAt: external_exports.string().datetime(),
  targetKind: external_exports.enum(["TASK", "TODO"]),
  operation: external_exports.enum(["CREATE", "UPDATE", "STATE"]),
  targetId: external_exports.string().uuid().optional(),
  baseVersion: external_exports.number().int().positive().optional(),
  title: external_exports.string().trim().min(1).max(240).optional(),
  dueAt: external_exports.string().datetime().nullable().optional(),
  objective: external_exports.string().trim().min(1).max(4e3).nullable().optional(),
  completionCriteria: external_exports.string().trim().min(1).max(4e3).nullable().optional(),
  parentTaskId: external_exports.string().uuid().nullable().optional(),
  order: external_exports.number().int().min(1).max(1e4).optional(),
  nextState: external_exports.enum(entityStates).optional(),
  filePath: external_exports.string().trim().max(4096).optional(),
  fileSha256: sha2562.optional()
}).superRefine((input, context) => {
  if (input.operation === "CREATE" && !input.title) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "CREATE_TITLE_REQUIRED" });
  if (input.operation !== "CREATE" && !input.targetId) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "TARGET_ID_REQUIRED" });
  if (input.operation !== "CREATE" && !input.baseVersion) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "BASE_VERSION_REQUIRED" });
  if (input.operation === "UPDATE" && input.title === void 0 && input.dueAt === void 0 && input.objective === void 0 && input.completionCriteria === void 0 && input.parentTaskId === void 0 && input.order === void 0) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "UPDATE_CHANGE_REQUIRED" });
  if (input.operation === "STATE" && !input.nextState) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "NEXT_STATE_REQUIRED" });
  if (input.targetKind === "TASK" && (input.parentTaskId !== void 0 || input.order !== void 0)) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "TASK_PARENT_OR_ORDER_FORBIDDEN" });
  if (input.sourceKind === "FILE") {
    if (!input.filePath || !path6.isAbsolute(input.filePath)) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "ABSOLUTE_FILE_PATH_REQUIRED" });
    if (!input.fileSha256) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "FILE_SHA256_REQUIRED" });
  } else if (input.filePath !== void 0 || input.fileSha256 !== void 0 || input.sourceKey !== void 0) {
    context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "FILE_EVIDENCE_ONLY_FOR_FILE_SOURCE" });
  }
  if (input.sourceKind !== "FILE" && input.sourceStreamId.length > 200) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "SOURCE_STREAM_ID_TOO_LONG" });
});
var queues = /* @__PURE__ */ new Map();
async function exclusive(key, operation) {
  const prior = queues.get(key) ?? Promise.resolve();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const current = prior.then(() => gate);
  queues.set(key, current);
  await prior;
  try {
    return await operation();
  } finally {
    release();
    if (queues.get(key) === current) queues.delete(key);
  }
}
function payloadOf(candidate) {
  if (candidate.kind !== "CHANGE_CANDIDATE") throw new Error(`CANDIDATE_KIND_INVALID:${candidate.kind}`);
  return candidateInputSchema.parse(candidate.data.input);
}
function cursorMap(entity) {
  const value = entity.data.sourceCursors;
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}
function effectiveStreamId(input) {
  if (input.sourceKind !== "FILE") return input.sourceStreamId;
  const stableKey = input.sourceKey ?? path6.normalize(input.sourceStreamId);
  const digest = crypto6.createHash("sha256").update(`${input.projectId}\0${stableKey}`).digest("hex");
  return `file:${digest}`;
}
function sourceCursor(cursors, input) {
  return cursors[effectiveStreamId(input)] ?? cursors[input.sourceStreamId];
}
function candidateResult(candidate, official) {
  const outcome = typeof candidate.data.outcome === "string" ? candidate.data.outcome : "PENDING";
  return { candidate, official, outcome };
}
var TaskSyncService = class {
  databasePath;
  actor;
  constructor(options) {
    if (!path6.isAbsolute(options.databasePath)) throw new Error("ABSOLUTE_PATH_REQUIRED:databasePath");
    this.databasePath = path6.normalize(options.databasePath);
    this.actor = options.actor?.trim() || "codex-task-sync";
  }
  async submitCandidate(input) {
    const parsed = candidateInputSchema.parse(input);
    if (parsed.sourceKind === "FILE") {
      const stat = fs5.lstatSync(parsed.filePath);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("FILE_SOURCE_REGULAR_FILE_REQUIRED");
      const actual = crypto6.createHash("sha256").update(fs5.readFileSync(parsed.filePath)).digest("hex");
      if (actual !== parsed.fileSha256) throw new Error(`FILE_SHA256_MISMATCH:${parsed.filePath}`);
    }
    return exclusive(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        const project = kernel.getObject(parsed.projectId);
        if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${parsed.projectId}`);
        const candidateId = stableUuidFromKey(`CHANGE_CANDIDATE:${parsed.projectId}:${effectiveStreamId(parsed)}:${parsed.sourceEventId}`);
        return kernel.createObject({
          schemaVersion: SCHEMA_VERSION,
          id: candidateId,
          kind: "CHANGE_CANDIDATE",
          state: "DRAFT",
          title: `Candidate ${parsed.targetKind} ${parsed.operation}`,
          data: { projectId: parsed.projectId, input: parsed, outcome: "PENDING" }
        }, `candidate-submit:${candidateId}`);
      } finally {
        kernel.close();
      }
    });
  }
  async decideCandidate(candidateId, decision, idempotencyKey2) {
    if (!external_exports.string().uuid().safeParse(candidateId).success) throw new Error("CANDIDATE_ID_INVALID");
    if (!external_exports.string().min(8).max(120).safeParse(idempotencyKey2.trim()).success) throw new Error("IDEMPOTENCY_KEY_LENGTH_INVALID");
    return exclusive(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        let candidate = kernel.getObject(candidateId);
        if (!candidate || candidate.kind !== "CHANGE_CANDIDATE") throw new Error(`CANDIDATE_NOT_FOUND:${candidateId}`);
        const priorDecision = candidate.data.decision;
        if (priorDecision && priorDecision !== decision) throw new Error(`CANDIDATE_DECISION_CONFLICT:${String(priorDecision)}:${decision}`);
        if (["COMPLETED", "FAILED", "MANUAL_INTERVENTION"].includes(candidate.state)) {
          const officialId = typeof candidate.data.officialObjectId === "string" ? candidate.data.officialObjectId : null;
          return candidateResult(candidate, officialId ? kernel.getObject(officialId) : null);
        }
        if (decision === "REJECT") {
          if (candidate.state !== "DRAFT") throw new Error(`CANDIDATE_REJECT_STATE_INVALID:${candidate.state}`);
          candidate = kernel.updateObject(candidate.id, { data: { ...candidate.data, decision: "REJECT", outcome: "REJECTED", decidedAt: (/* @__PURE__ */ new Date()).toISOString() } }, candidate.version, `${idempotencyKey2}:reject-meta`);
          candidate = kernel.transitionObject(candidate.id, "FAILED", candidate.version, `${idempotencyKey2}:reject-state`);
          return candidateResult(candidate, null);
        }
        if (candidate.state === "DRAFT") {
          candidate = kernel.updateObject(candidate.id, { data: { ...candidate.data, decision: "APPROVE", decidedAt: (/* @__PURE__ */ new Date()).toISOString() } }, candidate.version, `${idempotencyKey2}:approve-meta`);
          candidate = kernel.transitionObject(candidate.id, "ACTIVE", candidate.version, `${idempotencyKey2}:approve-state`);
        }
        if (candidate.state === "VERIFYING") {
          candidate = kernel.transitionObject(candidate.id, "COMPLETED", candidate.version, `${idempotencyKey2}:complete`);
          const officialId = typeof candidate.data.officialObjectId === "string" ? candidate.data.officialObjectId : null;
          return candidateResult(candidate, officialId ? kernel.getObject(officialId) : null);
        }
        const input = payloadOf(candidate);
        let official = null;
        let outcome = "APPLIED";
        try {
          const targetId = input.targetId ?? stableUuidFromKey(`${input.targetKind}:FROM_CANDIDATE:${candidate.id}`);
          if (input.parentTaskId) {
            const parent = kernel.getObject(input.parentTaskId);
            if (!parent || parent.kind !== "TASK") throw new Error(`PARENT_TASK_NOT_FOUND:${input.parentTaskId}`);
            if (parent.data.projectId !== input.projectId) throw new Error("PARENT_TASK_PROJECT_MISMATCH");
          }
          official = kernel.getObject(targetId);
          if (!official) {
            if (input.operation !== "CREATE") throw new Error(`SYNC_TARGET_NOT_FOUND:${targetId}`);
            const streamId = effectiveStreamId(input);
            const cursor = { version: input.sourceVersion, eventId: input.sourceEventId, occurredAt: input.occurredAt };
            official = kernel.createObject({
              schemaVersion: SCHEMA_VERSION,
              id: targetId,
              kind: input.targetKind,
              state: input.nextState ?? "ACTIVE",
              title: input.title,
              data: {
                projectId: input.projectId,
                dueAt: input.dueAt ?? null,
                objective: input.objective ?? null,
                completionCriteria: input.completionCriteria ?? null,
                ...input.targetKind === "TODO" ? { parentTaskId: input.parentTaskId ?? null, order: input.order ?? null } : {},
                sourceCursors: { [streamId]: cursor }
              }
            }, `candidate-apply-create:${candidate.id}`);
          } else {
            if (official.kind !== input.targetKind) throw new Error(`SYNC_TARGET_KIND_MISMATCH:${official.kind}:${input.targetKind}`);
            if (official.data.projectId !== input.projectId) throw new Error("SYNC_TARGET_PROJECT_MISMATCH");
            const cursors = cursorMap(official);
            const streamId = effectiveStreamId(input);
            const prior = sourceCursor(cursors, input);
            if (prior && prior.version > input.sourceVersion) {
              outcome = "STALE_REPLAY_IGNORED";
            } else if (prior && prior.version === input.sourceVersion && prior.eventId !== input.sourceEventId) {
              throw new Error(`SYNC_SOURCE_VERSION_COLLISION:${input.sourceStreamId}:${input.sourceVersion}`);
            } else if (prior && prior.version === input.sourceVersion && prior.eventId === input.sourceEventId && (input.operation !== "STATE" || official.state === input.nextState)) {
              outcome = "APPLIED";
            } else {
              if (input.baseVersion !== void 0 && official.version !== input.baseVersion) throw new Error(`VERSION_CONFLICT:${input.baseVersion}:${official.version}`);
              const cursor = { version: input.sourceVersion, eventId: input.sourceEventId, occurredAt: input.occurredAt };
              const nextData = { ...official.data, sourceCursors: { ...cursors, [streamId]: cursor } };
              if (input.operation === "UPDATE") {
                if (input.dueAt !== void 0) nextData.dueAt = input.dueAt;
                if (input.objective !== void 0) nextData.objective = input.objective;
                if (input.completionCriteria !== void 0) nextData.completionCriteria = input.completionCriteria;
                if (input.targetKind === "TODO" && input.parentTaskId !== void 0) nextData.parentTaskId = input.parentTaskId;
                if (input.targetKind === "TODO" && input.order !== void 0) nextData.order = input.order;
                official = kernel.updateObject(official.id, { title: input.title ?? official.title, data: nextData }, official.version, `candidate-apply-update:${candidate.id}`);
              } else if (input.operation === "STATE") {
                if (!prior || prior.version !== input.sourceVersion || prior.eventId !== input.sourceEventId) {
                  official = kernel.updateObject(official.id, { data: nextData }, official.version, `candidate-apply-cursor:${candidate.id}`);
                }
                if (official.state !== input.nextState) official = kernel.transitionObject(official.id, input.nextState, official.version, `candidate-apply-state:${candidate.id}`);
              } else {
                throw new Error(`SYNC_CREATE_TARGET_ALREADY_EXISTS:${official.id}`);
              }
            }
          }
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          candidate = kernel.updateObject(candidate.id, { data: { ...candidate.data, outcome: "CONFLICT", conflict: detail, decidedAt: (/* @__PURE__ */ new Date()).toISOString() } }, candidate.version, `${idempotencyKey2}:conflict-meta`);
          candidate = kernel.transitionObject(candidate.id, "MANUAL_INTERVENTION", candidate.version, `${idempotencyKey2}:conflict-state`);
          return candidateResult(candidate, official);
        }
        candidate = kernel.updateObject(candidate.id, {
          data: { ...candidate.data, outcome, officialObjectId: official?.id ?? null, decidedAt: (/* @__PURE__ */ new Date()).toISOString() }
        }, candidate.version, `${idempotencyKey2}:outcome`);
        candidate = kernel.transitionObject(candidate.id, "VERIFYING", candidate.version, `${idempotencyKey2}:verify`);
        candidate = kernel.transitionObject(candidate.id, "COMPLETED", candidate.version, `${idempotencyKey2}:complete`);
        return candidateResult(candidate, official);
      } finally {
        kernel.close();
      }
    });
  }
  async projection(projectId) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: `${this.actor}-projection`, role: "VIEWER", readOnly: true });
    try {
      const inProject = (item) => !projectId || item.data.projectId === projectId;
      return {
        candidates: kernel.listObjects("CHANGE_CANDIDATE").filter(inProject),
        tasks: kernel.listObjects("TASK").filter(inProject),
        todos: kernel.listObjects("TODO").filter(inProject)
      };
    } finally {
      kernel.close();
    }
  }
};

// packages/context-pack/src/index.ts
import crypto7 from "node:crypto";
import fs6 from "node:fs";
import path7 from "node:path";
var uuidSchema = external_exports.string().uuid();
var digestSchema = external_exports.string().regex(/^[a-f0-9]{64}$/);
var relativePathSchema = external_exports.string().trim().min(1).max(1024);
var textItemSchema = external_exports.string().trim().min(1).max(4e3);
var contextPackContentSchema = external_exports.object({
  goal: external_exports.string().trim().max(8e3).nullable(),
  facts: external_exports.array(textItemSchema).max(200),
  decisions: external_exports.array(textItemSchema).max(200),
  constraints: external_exports.array(textItemSchema).max(200),
  openQuestions: external_exports.array(textItemSchema).max(200),
  fileIndex: external_exports.array(relativePathSchema).max(500),
  handoffSummary: external_exports.string().trim().max(12e3)
}).strict();
var contextPackPublishSchema = contextPackContentSchema.extend({
  projectId: uuidSchema,
  baseVersion: external_exports.number().int().positive(),
  idempotencyKey: external_exports.string().trim().min(8).max(120)
}).strict();
var recoveryTaskInputSchema = external_exports.object({
  projectId: uuidSchema,
  contextPackId: uuidSchema.optional(),
  title: external_exports.string().trim().min(1).max(240),
  idempotencyKey: external_exports.string().trim().min(8).max(120)
}).strict();
var projectBackupInputSchema = external_exports.object({
  projectId: uuidSchema,
  backupRoot: external_exports.string().trim().min(1),
  idempotencyKey: external_exports.string().trim().min(8).max(120)
}).strict();
var projectRestoreBackupInputSchema = external_exports.object({
  manifestPath: external_exports.string().trim().min(1),
  targetDatabasePath: external_exports.string().trim().min(1),
  targetProjectsRoot: external_exports.string().trim().min(1),
  idempotencyKey: external_exports.string().trim().min(8).max(120)
}).strict();
function absolute2(value, label) {
  if (!path7.isAbsolute(value)) throw new Error(`ABSOLUTE_PATH_REQUIRED:${label}`);
  return path7.normalize(value);
}
function sha256Bytes2(bytes) {
  return crypto7.createHash("sha256").update(bytes).digest("hex");
}
function hashFile2(filePath) {
  return sha256Bytes2(fs6.readFileSync(filePath));
}
function assertNoSymlink(filePath) {
  if (!fs6.existsSync(filePath)) throw new Error(`PATH_MISSING:${filePath}`);
  if (fs6.lstatSync(filePath).isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN:${filePath}`);
}
function ensureRoot(root, label) {
  const normalized = absolute2(root, label);
  fs6.mkdirSync(normalized, { recursive: true });
  assertNoSymlink(normalized);
  return normalized;
}
function safeRelative(value, label) {
  if (path7.isAbsolute(value)) throw new Error(`RELATIVE_PATH_REQUIRED:${label}:${value}`);
  const normalized = path7.normalize(value);
  if (!normalized || normalized === "." || normalized === ".." || normalized.startsWith(`..${path7.sep}`)) {
    throw new Error(`RELATIVE_PATH_INVALID:${label}:${value}`);
  }
  return normalized;
}
function within(root, candidate, label) {
  const normalizedRoot = path7.normalize(root);
  const normalized = path7.normalize(candidate);
  if (normalized !== normalizedRoot && !normalized.startsWith(`${normalizedRoot}${path7.sep}`)) throw new Error(`PATH_OUTSIDE_ROOT:${label}:${normalized}`);
  return normalized;
}
function assertPathComponentsNotSymlinks(root, relative) {
  const normalizedRelative = safeRelative(relative, "fileIndex");
  const candidate = within(root, path7.join(root, normalizedRelative), "fileIndex");
  let current = root;
  for (const segment of normalizedRelative.split(path7.sep)) {
    current = path7.join(current, segment);
    assertNoSymlink(current);
  }
  return candidate;
}
function atomicJsonOnce(filePath, payload) {
  const bytes = `${canonicalJson(payload)}
`;
  fs6.mkdirSync(path7.dirname(filePath), { recursive: true });
  if (fs6.existsSync(filePath)) {
    assertNoSymlink(filePath);
    const existing = fs6.readFileSync(filePath, "utf8");
    if (existing !== bytes) throw new Error(`IMMUTABLE_FILE_CONFLICT:${filePath}`);
    return sha256Bytes2(existing);
  }
  const temporary = `${filePath}.tmp-${process.pid}-${crypto7.randomUUID()}`;
  fs6.writeFileSync(temporary, bytes, { flag: "wx", mode: 384 });
  fs6.renameSync(temporary, filePath);
  return sha256Bytes2(bytes);
}
function copyFileOnce(source, destination) {
  assertNoSymlink(source);
  if (!fs6.statSync(source).isFile()) throw new Error(`REGULAR_FILE_REQUIRED:${source}`);
  fs6.mkdirSync(path7.dirname(destination), { recursive: true });
  if (fs6.existsSync(destination)) {
    assertNoSymlink(destination);
    if (!fs6.statSync(destination).isFile() || hashFile2(destination) !== hashFile2(source)) throw new Error(`IMMUTABLE_COPY_CONFLICT:${destination}`);
    return;
  }
  fs6.copyFileSync(source, destination, fs6.constants.COPYFILE_EXCL);
}
function scanTree(root) {
  assertNoSymlink(root);
  if (!fs6.statSync(root).isDirectory()) throw new Error(`DIRECTORY_REQUIRED:${root}`);
  const output = [];
  const visit = (directory, prefix) => {
    for (const entry of fs6.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const source = path7.join(directory, entry.name);
      const relative = prefix ? path7.join(prefix, entry.name) : entry.name;
      if (entry.isSymbolicLink()) throw new Error(`SYMLINK_FORBIDDEN:${source}`);
      if (entry.isDirectory()) visit(source, relative);
      else if (entry.isFile()) {
        const stat = fs6.statSync(source);
        output.push({ path: relative, bytes: stat.size, sha256: hashFile2(source) });
      } else throw new Error(`UNSUPPORTED_FILE_TYPE:${source}`);
    }
  };
  visit(root, "");
  return output;
}
function copyTreeOnce(sourceRoot, destinationRoot) {
  const files = scanTree(sourceRoot);
  fs6.mkdirSync(destinationRoot, { recursive: true });
  assertNoSymlink(destinationRoot);
  for (const file of files) copyFileOnce(path7.join(sourceRoot, file.path), path7.join(destinationRoot, file.path));
  return files;
}
function parseJson(filePath) {
  assertNoSymlink(filePath);
  const parsed = JSON.parse(fs6.readFileSync(filePath, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`JSON_OBJECT_REQUIRED:${filePath}`);
  return parsed;
}
function dataString(entity, key) {
  const value = entity.data[key];
  if (typeof value !== "string" || !value) throw new Error(`OBJECT_DATA_STRING_REQUIRED:${entity.id}:${key}`);
  return value;
}
function dataNumber(entity, key) {
  const value = entity.data[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) throw new Error(`OBJECT_DATA_NUMBER_REQUIRED:${entity.id}:${key}`);
  return value;
}
function operationComplete(kernel, operationId, key) {
  let operation = kernel.getObject(operationId);
  if (!operation) throw new Error(`OPERATION_NOT_FOUND:${operationId}`);
  if (operation.state === "ACTIVE") operation = kernel.transitionObject(operation.id, "VERIFYING", operation.version, `${key}:verifying`);
  if (operation.state === "VERIFYING") operation = kernel.transitionObject(operation.id, "COMPLETED", operation.version, `${key}:completed`);
  if (operation.state !== "COMPLETED") throw new Error(`OPERATION_NOT_COMPLETABLE:${operation.state}`);
  return operation;
}
function appendOnce(kernel, input) {
  kernel.appendEvent({
    schemaVersion: SCHEMA_VERSION,
    eventId: stableUuidFromKey(`P4_EVENT:${input.key}`),
    idempotencyKey: input.key,
    eventType: input.type,
    objectId: input.operationId,
    actor: input.actor,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    payload: input.payload
  });
}
function objectIdentity(objects, projectId) {
  return objects.filter((item) => item.id === projectId || item.data.projectId === projectId).map((item) => ({
    id: item.id,
    kind: item.kind,
    state: item.state,
    projectId: typeof item.data.projectId === "string" ? item.data.projectId : item.id === projectId ? projectId : null,
    codexThreadId: typeof item.data.codexThreadId === "string" ? item.data.codexThreadId : null,
    role: typeof item.data.role === "string" ? item.data.role : null,
    contextPackId: typeof item.data.contextPackId === "string" ? item.data.contextPackId : null,
    contextPackVersion: typeof item.data.version === "number" ? item.data.version : null,
    fileSha256: typeof item.data.fileSha256 === "string" ? item.data.fileSha256 : null
  })).sort((a, b) => a.id.localeCompare(b.id));
}
function sameIdentity(expected, actual) {
  return canonicalJson(expected) === canonicalJson(actual);
}
function verifyBackup(manifestPath) {
  const normalizedManifest = absolute2(manifestPath, "manifestPath");
  const backupDirectory = path7.dirname(normalizedManifest);
  const manifest = parseJson(normalizedManifest);
  if (manifest.schemaVersion !== 1 || manifest.manifestType !== "CODEX_WORK_PLATFORM_PROJECT_BACKUP") throw new Error("BACKUP_MANIFEST_INVALID");
  uuidSchema.parse(manifest.backupId);
  uuidSchema.parse(manifest.projectId);
  uuidSchema.parse(manifest.currentContextPackId);
  uuidSchema.parse(manifest.currentBindingId);
  digestSchema.parse(manifest.currentContextPackSha256);
  digestSchema.parse(manifest.currentBindingSha256);
  if (!Array.isArray(manifest.files) || manifest.files.length < 2) throw new Error("BACKUP_FILES_INVALID");
  const seen = /* @__PURE__ */ new Set();
  for (const file of manifest.files) {
    const relative = safeRelative(file.path, "backup-file");
    if (seen.has(relative)) throw new Error(`BACKUP_FILE_DUPLICATE:${relative}`);
    seen.add(relative);
    const candidate = within(backupDirectory, path7.join(backupDirectory, relative), "backup-file");
    assertNoSymlink(candidate);
    const stat = fs6.statSync(candidate);
    if (!stat.isFile() || stat.size !== file.bytes || hashFile2(candidate) !== file.sha256) throw new Error(`BACKUP_FILE_HASH_MISMATCH:${relative}`);
  }
  const databaseEntry = manifest.files.find((item) => item.path === manifest.databaseRelativePath && item.scope === "DATABASE");
  if (!databaseEntry) throw new Error("BACKUP_DATABASE_ENTRY_MISSING");
  return { manifestPath: normalizedManifest, manifestSha256: hashFile2(normalizedManifest), backupDirectory, manifest, deduplicated: true };
}
var ContextPackService = class _ContextPackService {
  databasePath;
  projectsRoot;
  actor;
  taskPort;
  constructor(options) {
    this.databasePath = absolute2(options.databasePath, "databasePath");
    this.projectsRoot = ensureRoot(options.projectsRoot, "projectsRoot");
    this.taskPort = options.taskPort;
    this.actor = options.actor ?? "codex-context-pack";
  }
  projectRoot(project) {
    const active = absolute2(dataString(project, "projectDirectory"), "projectDirectory");
    const archived = absolute2(dataString(project, "archiveDirectory"), "archiveDirectory");
    const selected = project.state === "ARCHIVED" ? archived : active;
    assertNoSymlink(selected);
    if (!fs6.statSync(selected).isDirectory()) throw new Error(`PROJECT_DIRECTORY_MISSING:${selected}`);
    return selected;
  }
  objectPath(project, object, root) {
    const relative = typeof object.data.relativePath === "string" ? safeRelative(object.data.relativePath, "object-relative-path") : (() => {
      const stored = absolute2(dataString(object, "path"), "objectPath");
      const active = absolute2(dataString(project, "projectDirectory"), "projectDirectory");
      const archived = absolute2(dataString(project, "archiveDirectory"), "archiveDirectory");
      const fromActive = path7.relative(active, stored);
      if (fromActive && fromActive !== ".." && !fromActive.startsWith(`..${path7.sep}`)) return fromActive;
      const fromArchived = path7.relative(archived, stored);
      if (fromArchived && fromArchived !== ".." && !fromArchived.startsWith(`..${path7.sep}`)) return fromArchived;
      throw new Error(`OBJECT_PATH_NOT_RELOCATABLE:${object.id}:${stored}`);
    })();
    return within(root, path7.join(root, relative), "objectPath");
  }
  fileIndex(root, requested) {
    const unique = [...new Set(requested.map((item) => safeRelative(item, "fileIndex")))].sort((a, b) => a.localeCompare(b));
    if (unique.length !== requested.length) throw new Error("FILE_INDEX_DUPLICATE");
    return unique.map((relative) => {
      const filePath = assertPathComponentsNotSymlinks(root, relative);
      const stat = fs6.statSync(filePath);
      if (!stat.isFile()) throw new Error(`INDEXED_REGULAR_FILE_REQUIRED:${relative}`);
      return { path: relative, bytes: stat.size, sha256: hashFile2(filePath) };
    });
  }
  async current(projectId) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "VIEWER", readOnly: true });
    try {
      const project = kernel.getObject(uuidSchema.parse(projectId));
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${projectId}`);
      const contextPack = kernel.getObject(uuidSchema.parse(dataString(project, "contextPackId")));
      const binding = kernel.getObject(uuidSchema.parse(dataString(project, "bindingId")));
      if (!contextPack || contextPack.kind !== "CONTEXT_PACK") throw new Error(`CONTEXT_PACK_NOT_FOUND:${project.id}`);
      if (!binding || binding.kind !== "BINDING") throw new Error(`BINDING_NOT_FOUND:${project.id}`);
      const root = this.projectRoot(project);
      const contextPackPath = this.objectPath(project, contextPack, root);
      const bindingPath = this.objectPath(project, binding, root);
      assertNoSymlink(contextPackPath);
      assertNoSymlink(bindingPath);
      const contextPackSha256 = hashFile2(contextPackPath);
      const bindingSha256 = hashFile2(bindingPath);
      if (contextPackSha256 !== dataString(contextPack, "fileSha256")) throw new Error(`CONTEXT_PACK_HASH_MISMATCH:${project.id}`);
      if (bindingSha256 !== dataString(binding, "fileSha256")) throw new Error(`BINDING_HASH_MISMATCH:${project.id}`);
      const payload = parseJson(contextPackPath);
      const content = payload.content;
      let indexedFilesVerified = 0;
      let legacy = true;
      if (content && typeof content === "object" && !Array.isArray(content)) {
        const entries = content.fileIndex;
        if (!Array.isArray(entries)) throw new Error("CONTEXT_PACK_FILE_INDEX_INVALID");
        for (const item of entries) {
          if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("CONTEXT_PACK_FILE_INDEX_ENTRY_INVALID");
          const entry = item;
          const relative = safeRelative(String(entry.path ?? ""), "stored-file-index");
          const filePath = assertPathComponentsNotSymlinks(root, relative);
          const stat = fs6.statSync(filePath);
          if (!stat.isFile() || stat.size !== entry.bytes || hashFile2(filePath) !== entry.sha256) throw new Error(`INDEXED_FILE_HASH_MISMATCH:${relative}`);
          indexedFilesVerified += 1;
        }
        legacy = false;
      }
      return { project, contextPack, binding, projectDirectory: root, contextPackPath, bindingPath, contextPackSha256, bindingSha256, indexedFilesVerified, legacy, payload };
    } finally {
      kernel.close();
    }
  }
  async publish(input) {
    const parsed = contextPackPublishSchema.parse(input);
    const nextVersion = parsed.baseVersion + 1;
    const operationId = stableUuidFromKey(`P4:CONTEXT_PACK_PUBLISH:${parsed.idempotencyKey}`);
    const contextPackId = stableUuidFromKey(`P4:CONTEXT_PACK:${parsed.projectId}:${nextVersion}`);
    const bindingId = stableUuidFromKey(`P4:BINDING:${parsed.projectId}:${nextVersion}`);
    const requestHash = sha256Json(parsed);
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    let deduplicated = false;
    try {
      let project = kernel.getObject(parsed.projectId);
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${parsed.projectId}`);
      if (project.state === "ARCHIVED") throw new Error("PROJECT_ARCHIVED_READ_ONLY");
      let operation = kernel.getObject(operationId);
      if (operation) {
        if (operation.kind !== "OPERATION" || operation.data.requestHash !== requestHash || operation.data.contextPackId !== contextPackId || operation.data.bindingId !== bindingId) {
          throw new Error(`IDEMPOTENCY_CONFLICT:${parsed.idempotencyKey}`);
        }
        deduplicated = true;
        if (operation.state === "COMPLETED") {
          const current = await this.current(parsed.projectId);
          if (current.contextPack.id !== contextPackId || current.binding.id !== bindingId) throw new Error("PUBLISH_REPLAY_CURRENT_POINTER_MISMATCH");
          return { ...current, operation, deduplicated };
        }
      } else {
        const priorPack = kernel.getObject(uuidSchema.parse(dataString(project, "contextPackId")));
        if (!priorPack || priorPack.kind !== "CONTEXT_PACK") throw new Error(`CONTEXT_PACK_NOT_FOUND:${project.id}`);
        if (dataNumber(priorPack, "version") !== parsed.baseVersion) throw new Error(`CONTEXT_PACK_VERSION_CONFLICT:${parsed.baseVersion}:${String(priorPack.data.version)}`);
        operation = kernel.createObject({
          schemaVersion: SCHEMA_VERSION,
          id: operationId,
          kind: "OPERATION",
          state: "ACTIVE",
          title: `Publish Context Pack v${nextVersion} for ${project.title}`,
          data: {
            action: "CONTEXT_PACK_PUBLISH",
            projectId: project.id,
            requestHash,
            requestKey: parsed.idempotencyKey,
            baseVersion: parsed.baseVersion,
            nextVersion,
            projectBaseVersion: project.version,
            contextPackId,
            bindingId
          }
        }, `p4:publish:operation:${parsed.idempotencyKey}`);
      }
      const root = this.projectRoot(project);
      const contextRelative = path7.join(".codex-work-platform", "context-packs", `v${nextVersion}.json`);
      const bindingRelative = path7.join(".codex-work-platform", "bindings", `v${nextVersion}.json`);
      const contextPackPath = within(root, path7.join(root, contextRelative), "contextPackPath");
      const bindingPath = within(root, path7.join(root, bindingRelative), "bindingPath");
      appendOnce(kernel, {
        operationId,
        key: `p4:publish:intent:${parsed.idempotencyKey}`,
        type: "CONTEXT_PACK_PUBLISH_INTENT",
        actor: this.actor,
        payload: { projectId: project.id, baseVersion: parsed.baseVersion, nextVersion, contextPackId, bindingId }
      });
      const verifiedIndex = this.fileIndex(root, parsed.fileIndex);
      const payload = {
        schemaVersion: 1,
        contextPackVersion: nextVersion,
        contextPackId,
        projectId: project.id,
        content: {
          goal: parsed.goal,
          facts: parsed.facts,
          decisions: parsed.decisions,
          constraints: parsed.constraints,
          openQuestions: parsed.openQuestions,
          fileIndex: verifiedIndex,
          handoffSummary: parsed.handoffSummary
        }
      };
      const contextPackSha256 = atomicJsonOnce(contextPackPath, payload);
      const taskId = uuidSchema.parse(dataString(project, "taskId"));
      const codexThreadId = uuidSchema.parse(dataString(project, "codexThreadId"));
      const bindingPayload = {
        schemaVersion: 1,
        bindingVersion: nextVersion,
        bindingId,
        role: "MAIN_TASK",
        projectId: project.id,
        taskId,
        contextPackId,
        contextPackSha256,
        codexThreadId,
        projectRelativePath: "."
      };
      const bindingSha256 = atomicJsonOnce(bindingPath, bindingPayload);
      const contextPack = kernel.createObject({
        schemaVersion: SCHEMA_VERSION,
        id: contextPackId,
        kind: "CONTEXT_PACK",
        state: "ACTIVE",
        title: `${project.title} Context Pack v${nextVersion}`,
        data: { projectId: project.id, version: nextVersion, path: contextPackPath, relativePath: contextRelative, fileSha256: contextPackSha256, codexThreadId }
      }, `p4:publish:context:${parsed.idempotencyKey}`);
      const binding = kernel.createObject({
        schemaVersion: SCHEMA_VERSION,
        id: bindingId,
        kind: "BINDING",
        state: "ACTIVE",
        title: `${project.title} Context Pack v${nextVersion} binding`,
        data: { ...bindingPayload, path: bindingPath, relativePath: bindingRelative, fileSha256: bindingSha256 }
      }, `p4:publish:binding:${parsed.idempotencyKey}`);
      project = kernel.getObject(project.id);
      if (project.data.contextPackId !== contextPackId || project.data.bindingId !== bindingId) {
        const projectBaseVersion = Number(operation.data.projectBaseVersion);
        project = kernel.updateObject(project.id, {
          data: { ...project.data, contextPackId, bindingId, currentContextPackVersion: nextVersion }
        }, projectBaseVersion, `p4:publish:project:${parsed.idempotencyKey}`);
      }
      operation = operationComplete(kernel, operation.id, `p4:publish:${parsed.idempotencyKey}`);
      appendOnce(kernel, {
        operationId,
        key: `p4:publish:succeeded:${parsed.idempotencyKey}`,
        type: "CONTEXT_PACK_PUBLISHED",
        actor: this.actor,
        payload: { projectId: project.id, contextPackId, bindingId, nextVersion, contextPackSha256, bindingSha256 }
      });
      void contextPack;
      void binding;
      return { ...await this.current(parsed.projectId), operation, deduplicated };
    } finally {
      kernel.close();
    }
  }
  async createRecoveryTask(input) {
    const parsed = recoveryTaskInputSchema.parse(input);
    const operationId = stableUuidFromKey(`P4:RECOVERY_TASK_OPERATION:${parsed.idempotencyKey}`);
    const taskId = stableUuidFromKey(`P4:RECOVERY_TASK:${parsed.projectId}:${parsed.idempotencyKey}`);
    const bindingId = stableUuidFromKey(`P4:RECOVERY_BINDING:${parsed.projectId}:${parsed.idempotencyKey}`);
    const requestHash = sha256Json(parsed);
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    let deduplicated = false;
    try {
      const project = kernel.getObject(parsed.projectId);
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${parsed.projectId}`);
      if (project.state === "ARCHIVED") throw new Error("PROJECT_ARCHIVED_READ_ONLY");
      const contextPackId = parsed.contextPackId ?? uuidSchema.parse(dataString(project, "contextPackId"));
      const contextPack = kernel.getObject(contextPackId);
      if (!contextPack || contextPack.kind !== "CONTEXT_PACK" || contextPack.data.projectId !== project.id) throw new Error(`CONTEXT_PACK_NOT_FOUND:${contextPackId}`);
      let operation = kernel.getObject(operationId);
      if (operation) {
        if (operation.kind !== "OPERATION" || operation.data.requestHash !== requestHash || operation.data.taskId !== taskId || operation.data.bindingId !== bindingId) {
          throw new Error(`IDEMPOTENCY_CONFLICT:${parsed.idempotencyKey}`);
        }
        deduplicated = true;
        if (operation.state === "COMPLETED") {
          const task2 = kernel.getObject(taskId);
          const binding2 = kernel.getObject(bindingId);
          if (!task2 || !binding2) throw new Error("RECOVERY_TASK_REPLAY_OBJECT_MISSING");
          const root2 = this.projectRoot(project);
          const bindingPath2 = this.objectPath(project, binding2, root2);
          const codexThreadId2 = dataString(task2, "codexThreadId");
          return { operation, project, task: task2, binding: binding2, contextPack, projectDirectory: root2, bindingPath: bindingPath2, codexThreadId: codexThreadId2, codexDeepLink: `codex://threads/${encodeURIComponent(codexThreadId2)}`, mainTaskId: dataString(project, "taskId"), mainCodexThreadId: dataString(project, "codexThreadId"), deduplicated };
        }
      } else {
        operation = kernel.createObject({
          schemaVersion: SCHEMA_VERSION,
          id: operationId,
          kind: "OPERATION",
          state: "ACTIVE",
          title: `Create recovery task for ${project.title}`,
          data: { action: "PROJECT_RECOVERY_TASK", projectId: project.id, requestHash, requestKey: parsed.idempotencyKey, taskId, bindingId, contextPackId }
        }, `p4:recovery:operation:${parsed.idempotencyKey}`);
      }
      const root = this.projectRoot(project);
      const receiptPath = path7.join(root, ".codex-work-platform", "recovery-receipts", `${operationId}.json`);
      appendOnce(kernel, {
        operationId,
        key: `p4:recovery:intent:${parsed.idempotencyKey}`,
        type: "RECOVERY_TASK_CREATE_INTENT",
        actor: this.actor,
        payload: { projectId: project.id, taskId, bindingId, contextPackId, receiptPath }
      });
      let codexThreadId;
      try {
        const receipt = await this.taskPort.createMainTask({ cwd: root, title: parsed.title, idempotencyKey: `p4-recovery:${parsed.idempotencyKey}`, receiptPath });
        codexThreadId = uuidSchema.parse(receipt.threadId);
      } catch (error) {
        appendOnce(kernel, {
          operationId,
          key: `p4:recovery:failed:${parsed.idempotencyKey}`,
          type: "RECOVERY_TASK_CREATE_FAILED",
          actor: this.actor,
          payload: { projectId: project.id, taskId, knownThreadId: error instanceof RemoteTaskUncertainError ? error.threadId : null, detail: error instanceof Error ? error.message : String(error) }
        });
        throw error;
      }
      appendOnce(kernel, {
        operationId,
        key: `p4:recovery:remote:${parsed.idempotencyKey}`,
        type: "RECOVERY_TASK_REMOTE_CREATED",
        actor: this.actor,
        payload: { projectId: project.id, taskId, codexThreadId, receiptPath }
      });
      const task = kernel.createObject({
        schemaVersion: SCHEMA_VERSION,
        id: taskId,
        kind: "TASK",
        state: "ACTIVE",
        title: parsed.title,
        data: { projectId: project.id, codexThreadId, role: "RECOVERY_TASK", contextPackId, bindingId }
      }, `p4:recovery:task:${parsed.idempotencyKey}`);
      const bindingRelative = path7.join(".codex-work-platform", "bindings", `recovery-${taskId}.json`);
      const bindingPath = within(root, path7.join(root, bindingRelative), "recoveryBindingPath");
      const bindingPayload = {
        schemaVersion: 1,
        bindingVersion: dataNumber(contextPack, "version"),
        bindingId,
        role: "RECOVERY_TASK",
        projectId: project.id,
        taskId,
        contextPackId,
        contextPackSha256: dataString(contextPack, "fileSha256"),
        codexThreadId,
        projectRelativePath: "."
      };
      const bindingSha256 = atomicJsonOnce(bindingPath, bindingPayload);
      const binding = kernel.createObject({
        schemaVersion: SCHEMA_VERSION,
        id: bindingId,
        kind: "BINDING",
        state: "ACTIVE",
        title: `${parsed.title} binding`,
        data: { ...bindingPayload, path: bindingPath, relativePath: bindingRelative, fileSha256: bindingSha256 }
      }, `p4:recovery:binding:${parsed.idempotencyKey}`);
      operation = operationComplete(kernel, operation.id, `p4:recovery:${parsed.idempotencyKey}`);
      appendOnce(kernel, {
        operationId,
        key: `p4:recovery:succeeded:${parsed.idempotencyKey}`,
        type: "RECOVERY_TASK_CREATED",
        actor: this.actor,
        payload: { projectId: project.id, taskId, bindingId, contextPackId, codexThreadId, bindingSha256 }
      });
      return { operation, project, task, binding, contextPack, projectDirectory: root, bindingPath, codexThreadId, codexDeepLink: `codex://threads/${encodeURIComponent(codexThreadId)}`, mainTaskId: dataString(project, "taskId"), mainCodexThreadId: dataString(project, "codexThreadId"), deduplicated };
    } finally {
      kernel.close();
    }
  }
  async backup(input) {
    const parsed = projectBackupInputSchema.parse(input);
    const backupRoot = ensureRoot(parsed.backupRoot, "backupRoot");
    const backupId = stableUuidFromKey(`P4:PROJECT_BACKUP:${parsed.projectId}:${parsed.idempotencyKey}`);
    const backupDirectory = within(backupRoot, path7.join(backupRoot, parsed.projectId, backupId), "backupDirectory");
    const manifestPath = path7.join(backupDirectory, "manifest.json");
    if (fs6.existsSync(manifestPath)) return verifyBackup(manifestPath);
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    let manifest;
    try {
      const project = kernel.getObject(parsed.projectId);
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${parsed.projectId}`);
      const sourceProjectRoot = this.projectRoot(project);
      if (backupDirectory === sourceProjectRoot || backupDirectory.startsWith(`${sourceProjectRoot}${path7.sep}`)) throw new Error("BACKUP_INSIDE_PROJECT_FORBIDDEN");
      const currentPack = kernel.getObject(uuidSchema.parse(dataString(project, "contextPackId")));
      const currentBinding = kernel.getObject(uuidSchema.parse(dataString(project, "bindingId")));
      if (!currentPack || !currentBinding) throw new Error("CURRENT_CONTEXT_OBJECTS_MISSING");
      appendOnce(kernel, {
        operationId: stableUuidFromKey(`P4:BACKUP_EVENT_OBJECT:${parsed.projectId}`),
        key: `p4:backup:intent:${parsed.idempotencyKey}`,
        type: "PROJECT_BACKUP_INTENT",
        actor: this.actor,
        payload: { projectId: project.id, backupId, backupDirectory }
      });
      const identities = objectIdentity(kernel.listObjects(), project.id);
      fs6.mkdirSync(backupDirectory, { recursive: true });
      assertNoSymlink(backupDirectory);
      const databaseDestination = path7.join(backupDirectory, "platform.sqlite");
      copyFileOnce(this.databasePath, databaseDestination);
      const copiedProject = copyTreeOnce(sourceProjectRoot, path7.join(backupDirectory, "project"));
      const databaseStat = fs6.statSync(databaseDestination);
      const files = [
        { scope: "DATABASE", path: "platform.sqlite", bytes: databaseStat.size, sha256: hashFile2(databaseDestination) },
        ...copiedProject.map((item) => ({ ...item, scope: "PROJECT", path: path7.join("project", item.path) }))
      ];
      manifest = {
        schemaVersion: 1,
        manifestType: "CODEX_WORK_PLATFORM_PROJECT_BACKUP",
        backupId,
        projectId: project.id,
        projectState: project.state,
        projectStorage: project.state === "ARCHIVED" ? "ARCHIVED" : "ACTIVE",
        sourceProjectRoot,
        sourceDatabasePath: this.databasePath,
        databaseRelativePath: "platform.sqlite",
        projectRelativePath: "project",
        currentContextPackId: currentPack.id,
        currentBindingId: currentBinding.id,
        currentContextPackSha256: dataString(currentPack, "fileSha256"),
        currentBindingSha256: dataString(currentBinding, "fileSha256"),
        objectIdentity: identities,
        files,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      atomicJsonOnce(manifestPath, manifest);
    } finally {
      kernel.close();
    }
    const sourceKernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      appendOnce(sourceKernel, {
        operationId: stableUuidFromKey(`P4:BACKUP_EVENT_OBJECT:${parsed.projectId}`),
        key: `p4:backup:succeeded:${parsed.idempotencyKey}`,
        type: "PROJECT_BACKUP_CREATED",
        actor: this.actor,
        payload: { projectId: parsed.projectId, backupId, manifestPath, manifestSha256: hashFile2(manifestPath) }
      });
    } finally {
      sourceKernel.close();
    }
    return { manifestPath, manifestSha256: hashFile2(manifestPath), backupDirectory, manifest, deduplicated: false };
  }
  async restoreBackup(input) {
    const parsed = projectRestoreBackupInputSchema.parse(input);
    const verified = verifyBackup(parsed.manifestPath);
    const targetDatabasePath = absolute2(parsed.targetDatabasePath, "targetDatabasePath");
    const targetProjectsRoot = ensureRoot(parsed.targetProjectsRoot, "targetProjectsRoot");
    if (targetDatabasePath === this.databasePath) throw new Error("RESTORE_TARGET_DATABASE_MUST_DIFFER");
    const projectStorageRoot = verified.manifest.projectStorage === "ARCHIVED" ? path7.join(targetProjectsRoot, "90-archive", "projects", verified.manifest.projectId) : path7.join(targetProjectsRoot, verified.manifest.projectId);
    const targetProjectDirectory = within(targetProjectsRoot, projectStorageRoot, "targetProjectDirectory");
    const receiptPath = path7.join(targetProjectsRoot, ".codex-work-platform", "restore-receipts", `${stableUuidFromKey(`P4:RESTORE:${parsed.idempotencyKey}`)}.json`);
    if (fs6.existsSync(receiptPath)) {
      const receipt = parseJson(receiptPath);
      if (receipt.manifestSha256 !== verified.manifestSha256 || receipt.targetDatabasePath !== targetDatabasePath || receipt.targetProjectsRoot !== targetProjectsRoot) {
        throw new Error(`RESTORE_RECEIPT_CONFLICT:${receiptPath}`);
      }
      const current2 = await new _ContextPackService({ databasePath: targetDatabasePath, projectsRoot: targetProjectsRoot, taskPort: this.taskPort, actor: `${this.actor}-restored-read` }).current(verified.manifest.projectId);
      return { projectId: verified.manifest.projectId, manifestPath: verified.manifestPath, manifestSha256: verified.manifestSha256, targetDatabasePath, targetProjectsRoot, targetProjectDirectory, restoredObjectCount: verified.manifest.objectIdentity.length, current: current2, receiptPath, deduplicated: true };
    }
    const sourceDatabase = path7.join(verified.backupDirectory, verified.manifest.databaseRelativePath);
    const sourceProject = path7.join(verified.backupDirectory, verified.manifest.projectRelativePath);
    copyFileOnce(sourceDatabase, targetDatabasePath);
    copyTreeOnce(sourceProject, targetProjectDirectory);
    const kernel = await ControlKernel.open({ databasePath: targetDatabasePath, actor: this.actor, role: "OPERATOR" });
    let restoredObjectCount = 0;
    try {
      let project = kernel.getObject(verified.manifest.projectId);
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND_IN_BACKUP:${verified.manifest.projectId}`);
      const targetActive = path7.join(targetProjectsRoot, project.id);
      const targetArchive = path7.join(targetProjectsRoot, "90-archive", "projects", project.id);
      if (project.data.projectDirectory !== targetActive || project.data.archiveDirectory !== targetArchive) {
        project = kernel.updateObject(project.id, { data: { ...project.data, projectDirectory: targetActive, archiveDirectory: targetArchive } }, project.version, `p4:restore:project:${parsed.idempotencyKey}`);
      }
      const objects = kernel.listObjects();
      for (const object of objects) {
        if (object.id === project.id || object.data.projectId !== project.id) continue;
        let nextData = null;
        if (typeof object.data.path === "string") {
          const stored = absolute2(object.data.path, "restoredObjectPath");
          const relative = typeof object.data.relativePath === "string" ? safeRelative(object.data.relativePath, "restored-relative-path") : safeRelative(path7.relative(verified.manifest.sourceProjectRoot, stored), "restored-derived-path");
          const nextPath = within(targetProjectDirectory, path7.join(targetProjectDirectory, relative), "restoredObjectPath");
          nextData = { ...object.data, path: nextPath, relativePath: relative };
        }
        if (object.kind === "OPERATION" && typeof object.data.projectsRoot === "string") nextData = { ...nextData ?? object.data, projectsRoot: targetProjectsRoot };
        if (nextData && canonicalJson(nextData) !== canonicalJson(object.data)) {
          kernel.updateObject(object.id, { data: nextData }, object.version, `p4:restore:object:${parsed.idempotencyKey}:${object.id}`);
        }
        restoredObjectCount += 1;
      }
      appendOnce(kernel, {
        operationId: stableUuidFromKey(`P4:RESTORE_EVENT_OBJECT:${project.id}`),
        key: `p4:restore:succeeded:${parsed.idempotencyKey}`,
        type: "PROJECT_BACKUP_RESTORED",
        actor: this.actor,
        payload: { projectId: project.id, backupId: verified.manifest.backupId, manifestSha256: verified.manifestSha256, targetDatabasePath, targetProjectsRoot }
      });
      const actualIdentity = objectIdentity(kernel.listObjects(), project.id);
      if (!sameIdentity(verified.manifest.objectIdentity, actualIdentity)) throw new Error("RESTORED_OBJECT_IDENTITY_MISMATCH");
    } finally {
      kernel.close();
    }
    const restoredService = new _ContextPackService({ databasePath: targetDatabasePath, projectsRoot: targetProjectsRoot, taskPort: this.taskPort, actor: `${this.actor}-restored-read` });
    const current = await restoredService.current(verified.manifest.projectId);
    if (current.contextPack.id !== verified.manifest.currentContextPackId || current.binding.id !== verified.manifest.currentBindingId || current.contextPackSha256 !== verified.manifest.currentContextPackSha256 || current.bindingSha256 !== verified.manifest.currentBindingSha256) {
      throw new Error("RESTORED_CURRENT_CONTEXT_MISMATCH");
    }
    atomicJsonOnce(receiptPath, {
      schemaVersion: 1,
      action: "PROJECT_BACKUP_RESTORE",
      projectId: verified.manifest.projectId,
      manifestPath: verified.manifestPath,
      manifestSha256: verified.manifestSha256,
      targetDatabasePath,
      targetProjectsRoot,
      targetProjectDirectory,
      restoredObjectCount
    });
    return { projectId: verified.manifest.projectId, manifestPath: verified.manifestPath, manifestSha256: verified.manifestSha256, targetDatabasePath, targetProjectsRoot, targetProjectDirectory, restoredObjectCount, current, receiptPath, deduplicated: false };
  }
};

// packages/long-task/src/index.ts
import crypto8 from "node:crypto";
import fs7 from "node:fs";
import path8 from "node:path";
var longTaskTerminalStatuses = ["COMPLETED", "WAITING_USER", "MANUAL_INTERVENTION", "FAILED"];
var longTaskRunStatuses = ["READY", "RUNNING", "BACKOFF", ...longTaskTerminalStatuses];
var relativeArtifactPathSchema = external_exports.string().trim().min(1).max(1024).superRefine((value, context) => {
  if (path8.isAbsolute(value)) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "RELATIVE_PATH_REQUIRED" });
  const normalized = path8.normalize(value);
  if (normalized === "." || normalized === ".." || normalized.startsWith(`..${path8.sep}`)) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "RELATIVE_PATH_INVALID" });
  if (normalized.split(path8.sep).includes(".codex-work-platform")) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "ARTIFACT_PATH_RESERVED" });
});
var longTaskStageSchema = external_exports.object({
  stageId: external_exports.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/),
  title: external_exports.string().trim().min(1).max(240),
  artifactPath: relativeArtifactPathSchema,
  content: external_exports.string().max(1e6),
  estimatedTokens: external_exports.number().int().nonnegative().max(1e7).default(0),
  estimatedCostMicros: external_exports.number().int().nonnegative().max(1e10).default(0)
}).strict();
var longTaskPolicySchema = external_exports.object({
  maxAttemptsPerStage: external_exports.number().int().min(1).max(20).default(3),
  maxDurationMs: external_exports.number().int().min(100).max(7 * 24 * 60 * 60 * 1e3).default(60 * 60 * 1e3),
  maxTokens: external_exports.number().int().nonnegative().max(1e9).default(1e5),
  maxCostMicros: external_exports.number().int().nonnegative().max(1e12).default(1e8),
  leaseTtlMs: external_exports.number().int().min(100).max(60 * 60 * 1e3).default(6e4),
  stallTimeoutMs: external_exports.number().int().min(100).max(24 * 60 * 60 * 1e3).default(5 * 60 * 1e3),
  maxStalls: external_exports.number().int().min(1).max(10).default(2),
  maxInvocationWaitMs: external_exports.number().int().min(0).max(10 * 60 * 1e3).default(3e4),
  backoff: external_exports.object({
    rateLimitMs: external_exports.number().int().min(0).max(60 * 60 * 1e3).default(2e3),
    networkMs: external_exports.number().int().min(0).max(60 * 60 * 1e3).default(1e3),
    processExitMs: external_exports.number().int().min(0).max(60 * 60 * 1e3).default(250),
    noProgressMs: external_exports.number().int().min(0).max(60 * 60 * 1e3).default(500),
    maxMs: external_exports.number().int().min(0).max(24 * 60 * 60 * 1e3).default(6e4)
  }).strict().default({})
}).strict().default({});
var longTaskPlanSchema = external_exports.object({
  title: external_exports.string().trim().min(1).max(240),
  stages: external_exports.array(longTaskStageSchema).min(1).max(100).superRefine((stages, context) => {
    const ids = /* @__PURE__ */ new Set();
    const paths = /* @__PURE__ */ new Set();
    for (const [index, stage] of stages.entries()) {
      const normalized = path8.normalize(stage.artifactPath);
      if (ids.has(stage.stageId)) context.addIssue({ code: external_exports.ZodIssueCode.custom, path: [index, "stageId"], message: "DUPLICATE_STAGE_ID" });
      if (paths.has(normalized)) context.addIssue({ code: external_exports.ZodIssueCode.custom, path: [index, "artifactPath"], message: "DUPLICATE_ARTIFACT_PATH" });
      ids.add(stage.stageId);
      paths.add(normalized);
    }
  }),
  policy: longTaskPolicySchema
}).strict();
var longTaskCreateInputSchema = external_exports.object({
  projectId: external_exports.string().uuid(),
  taskId: external_exports.string().uuid().optional(),
  idempotencyKey: external_exports.string().trim().min(8).max(120),
  title: external_exports.string().trim().min(1).max(240),
  stages: external_exports.array(longTaskStageSchema).min(1).max(100),
  policy: longTaskPolicySchema.optional()
}).strict();
var SystemLongTaskClock = class {
  now() {
    return Date.now();
  }
  async sleep(milliseconds) {
    if (milliseconds <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
};
var LongTaskExecutionError = class extends Error {
  constructor(message, category, retryable, retryAfterMs = 0, tokenUsage = 0, costMicros = 0) {
    super(message);
    this.category = category;
    this.retryable = retryable;
    this.retryAfterMs = retryAfterMs;
    this.tokenUsage = tokenUsage;
    this.costMicros = costMicros;
    this.name = "LongTaskExecutionError";
  }
  category;
  retryable;
  retryAfterMs;
  tokenUsage;
  costMicros;
};
var SimulatedHostExit = class extends Error {
  constructor(message = "SIMULATED_HOST_EXIT") {
    super(message);
    this.name = "SimulatedHostExit";
  }
};
function sha256Bytes3(bytes) {
  return crypto8.createHash("sha256").update(bytes).digest("hex");
}
function normalizedAbsolute(value, label) {
  if (!path8.isAbsolute(value)) throw new Error(`ABSOLUTE_PATH_REQUIRED:${label}`);
  return path8.normalize(value);
}
function within2(root, candidate, label) {
  const normalizedRoot = path8.normalize(root);
  const normalized = path8.normalize(candidate);
  if (normalized !== normalizedRoot && !normalized.startsWith(`${normalizedRoot}${path8.sep}`)) throw new Error(`PATH_OUTSIDE_${label}:${normalized}`);
  return normalized;
}
function safeRelative2(value, label) {
  if (path8.isAbsolute(value)) throw new Error(`RELATIVE_PATH_REQUIRED:${label}`);
  const normalized = path8.normalize(value);
  if (!normalized || normalized === "." || normalized === ".." || normalized.startsWith(`..${path8.sep}`)) throw new Error(`RELATIVE_PATH_INVALID:${label}`);
  return normalized;
}
function ensureSafeParent(root, relativePath) {
  const normalizedRoot = normalizedAbsolute(root, "projectDirectory");
  if (!fs7.existsSync(normalizedRoot)) throw new Error(`PROJECT_DIRECTORY_MISSING:${normalizedRoot}`);
  const rootStat = fs7.lstatSync(normalizedRoot);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error(`PROJECT_DIRECTORY_UNSAFE:${normalizedRoot}`);
  const normalizedRelative = safeRelative2(relativePath, "artifactPath");
  const target = within2(normalizedRoot, path8.join(normalizedRoot, normalizedRelative), "PROJECT");
  let current = normalizedRoot;
  for (const segment of path8.dirname(normalizedRelative).split(path8.sep).filter((item) => item && item !== ".")) {
    current = path8.join(current, segment);
    if (fs7.existsSync(current)) {
      const stat = fs7.lstatSync(current);
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`DIRECTORY_COMPONENT_UNSAFE:${current}`);
    } else {
      fs7.mkdirSync(current, { mode: 448 });
    }
  }
  return target;
}
function writeOrAdoptJsonOnce(filePath, payload) {
  const bytes = `${canonicalJson(payload)}
`;
  fs7.mkdirSync(path8.dirname(filePath), { recursive: true });
  if (fs7.existsSync(filePath)) {
    const stat = fs7.lstatSync(filePath);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`CHECKPOINT_PATH_UNSAFE:${filePath}`);
    const existing = fs7.readFileSync(filePath, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(existing);
    } catch {
      throw new Error(`IMMUTABLE_FILE_CONFLICT:${filePath}`);
    }
    const completedAt = parsed.completedAt;
    if (typeof completedAt !== "string" || Number.isNaN(Date.parse(completedAt))) throw new Error(`IMMUTABLE_FILE_CONFLICT:${filePath}`);
    const replay = { ...payload, completedAt };
    if (existing !== `${canonicalJson(replay)}
`) throw new Error(`IMMUTABLE_FILE_CONFLICT:${filePath}`);
    return { payload: replay, fileSha256: sha256Bytes3(existing), adopted: true };
  }
  const temporary = `${filePath}.tmp-${process.pid}-${crypto8.randomUUID()}`;
  fs7.writeFileSync(temporary, bytes, { flag: "wx", mode: 384 });
  fs7.renameSync(temporary, filePath);
  return { payload, fileSha256: sha256Bytes3(bytes), adopted: false };
}
var FileStageExecutor = class {
  async execute(input) {
    const target = ensureSafeParent(input.projectDirectory, input.stage.artifactPath);
    const bytes = Buffer.from(input.stage.content, "utf8");
    if (fs7.existsSync(target)) {
      const stat = fs7.lstatSync(target);
      if (stat.isSymbolicLink() || !stat.isFile()) throw new LongTaskExecutionError(`ARTIFACT_PATH_UNSAFE:${target}`, "NONRETRYABLE", false);
      const existing = fs7.readFileSync(target);
      if (!existing.equals(bytes)) throw new LongTaskExecutionError(`ARTIFACT_CONFLICT:${input.stage.artifactPath}`, "NONRETRYABLE", false);
    } else {
      const temporary = `${target}.tmp-${process.pid}-${crypto8.randomUUID()}`;
      fs7.writeFileSync(temporary, bytes, { flag: "wx", mode: 384 });
      fs7.renameSync(temporary, target);
    }
    return {
      payload: {
        artifactPath: path8.normalize(input.stage.artifactPath),
        artifactSha256: sha256Bytes3(bytes),
        bytes: bytes.length
      },
      tokenUsage: input.stage.estimatedTokens,
      costMicros: input.stage.estimatedCostMicros
    };
  }
};
function operationData(operation) {
  if (operation.kind !== "OPERATION" || operation.data.action !== "LONG_TASK_RUN") throw new Error(`LONG_TASK_OPERATION_REQUIRED:${operation.id}`);
  return operation.data;
}
function leaseData(lease) {
  if (lease.kind !== "LEASE") throw new Error(`LEASE_OBJECT_REQUIRED:${lease.id}`);
  return lease.data;
}
function checkpointData(checkpoint) {
  if (checkpoint.kind !== "CHECKPOINT") throw new Error(`CHECKPOINT_OBJECT_REQUIRED:${checkpoint.id}`);
  return checkpoint.data;
}
function iso(milliseconds) {
  return new Date(milliseconds).toISOString();
}
function epoch(value) {
  return value ? Date.parse(value) : Number.NaN;
}
function classify(error) {
  if (error instanceof LongTaskExecutionError) return error;
  return new LongTaskExecutionError(error instanceof Error ? error.message : String(error), "NONRETRYABLE", false);
}
var LongTaskService = class {
  databasePath;
  projectsRoot;
  actor;
  clock;
  executor;
  constructor(options) {
    this.databasePath = normalizedAbsolute(options.databasePath, "databasePath");
    this.projectsRoot = normalizedAbsolute(options.projectsRoot, "projectsRoot");
    this.executor = options.executor ?? new FileStageExecutor();
    this.clock = options.clock ?? new SystemLongTaskClock();
    this.actor = options.actor ?? "codex-long-task";
  }
  projectDirectory(project) {
    if (project.kind !== "PROJECT") throw new Error(`PROJECT_REQUIRED:${project.id}`);
    if (typeof project.data.projectDirectory !== "string") throw new Error(`PROJECT_DIRECTORY_MISSING:${project.id}`);
    const directory = within2(this.projectsRoot, normalizedAbsolute(project.data.projectDirectory, "projectDirectory"), "PROJECTS_ROOT");
    if (!fs7.existsSync(directory) || fs7.lstatSync(directory).isSymbolicLink() || !fs7.lstatSync(directory).isDirectory()) throw new Error(`PROJECT_DIRECTORY_UNSAFE:${directory}`);
    return directory;
  }
  append(kernel, operationId, type, suffix, payload) {
    kernel.appendEvent({
      schemaVersion: SCHEMA_VERSION,
      eventId: stableUuidFromKey(`EVENT:P5:${operationId}:${suffix}`),
      idempotencyKey: `p5:${operationId}:${suffix}`,
      eventType: type,
      objectId: operationId,
      actor: this.actor,
      timestamp: iso(this.clock.now()),
      payload
    });
  }
  async create(input) {
    const parsed = longTaskCreateInputSchema.parse(input);
    const plan = longTaskPlanSchema.parse({ title: parsed.title, stages: parsed.stages, policy: parsed.policy ?? {} });
    const operationId = stableUuidFromKey(`LONG_TASK:${parsed.projectId}:${parsed.idempotencyKey}`);
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      const project = kernel.getObject(parsed.projectId);
      if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${parsed.projectId}`);
      if (project.state !== "ACTIVE") throw new Error(`PROJECT_NOT_ACTIVE:${project.state}`);
      if (parsed.taskId) {
        const task = kernel.getObject(parsed.taskId);
        if (!task || task.kind !== "TASK") throw new Error(`LONG_TASK_PARENT_TASK_NOT_FOUND:${parsed.taskId}`);
        if (task.data.projectId !== parsed.projectId) throw new Error("LONG_TASK_PARENT_TASK_PROJECT_MISMATCH");
      }
      const projectDirectory = this.projectDirectory(project);
      const planHash = sha256Json(plan);
      const existing = kernel.getObject(operationId);
      if (existing) {
        const data2 = operationData(existing);
        if (data2.projectId !== parsed.projectId || (data2.taskId ?? null) !== (parsed.taskId ?? null) || data2.planHash !== planHash) throw new Error(`IDEMPOTENCY_CONFLICT:${parsed.idempotencyKey}`);
        return this.snapshotFromKernel(kernel, existing);
      }
      const now = this.clock.now();
      const data = {
        action: "LONG_TASK_RUN",
        projectId: parsed.projectId,
        taskId: parsed.taskId ?? null,
        projectDirectory,
        plan,
        planHash,
        runStatus: "READY",
        terminalStatus: null,
        reasonCode: null,
        nextAction: "RUN_OR_RESUME",
        createdAt: iso(now),
        startedAt: iso(now),
        deadlineAt: iso(now + plan.policy.maxDurationMs),
        finishedAt: null,
        stageIndex: 0,
        attemptsByStage: {},
        totalAttempts: 0,
        usedTokens: 0,
        usedCostMicros: 0,
        lastProgressAt: iso(now),
        lastAttemptAt: null,
        nextAttemptAt: null,
        lastCheckpointId: null,
        currentLeaseId: null,
        leaseEpoch: 0,
        ownerId: null,
        stallCount: 0,
        lastFailure: null
      };
      const operation = kernel.createObject({ schemaVersion: SCHEMA_VERSION, id: operationId, kind: "OPERATION", state: "ACTIVE", title: plan.title, data }, `p5:create:${parsed.idempotencyKey}`);
      this.append(kernel, operation.id, "LONG_TASK_PLAN_FROZEN", "plan-frozen", { projectId: parsed.projectId, taskId: parsed.taskId ?? null, planHash, stages: plan.stages.length, policy: plan.policy });
      return this.snapshotFromKernel(kernel, operation);
    } finally {
      kernel.close();
    }
  }
  checkpointPath(data, checkpoint) {
    const relative = safeRelative2(String(checkpointData(checkpoint).relativePath), "checkpoint.relativePath");
    return within2(data.projectDirectory, path8.join(data.projectDirectory, relative), "PROJECT");
  }
  auditCheckpoints(kernel, operation) {
    const data = operationData(operation);
    const checkpoints = kernel.listObjects("CHECKPOINT").filter((item) => item.data.operationId === operation.id && item.state === "COMPLETED").sort((a, b) => Number(a.data.stageIndex) - Number(b.data.stageIndex) || a.createdAt.localeCompare(b.createdAt));
    const corruptIds = [];
    const valid = [];
    let expectedIndex = 0;
    let previousId = null;
    for (const checkpoint of checkpoints) {
      const item = checkpointData(checkpoint);
      let fileValid = false;
      try {
        const filePath = this.checkpointPath(data, checkpoint);
        const stat = fs7.lstatSync(filePath);
        if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("CHECKPOINT_PATH_UNSAFE");
        const bytes = fs7.readFileSync(filePath);
        const payload = JSON.parse(bytes.toString("utf8"));
        fileValid = sha256Bytes3(bytes) === item.fileSha256 && sha256Json(payload) === item.payloadSha256 && payload.operationId === operation.id && payload.stageIndex === item.stageIndex && payload.stageId === item.stageId && payload.previousCheckpointId === item.previousCheckpointId;
      } catch {
        fileValid = false;
      }
      if (!fileValid) {
        corruptIds.push(checkpoint.id);
        continue;
      }
      if (item.stageIndex === expectedIndex && item.previousCheckpointId === previousId) {
        valid.push(checkpoint);
        previousId = checkpoint.id;
        expectedIndex += 1;
      }
    }
    return { lastGood: valid.at(-1) ?? null, valid, corruptIds };
  }
  snapshotFromKernel(kernel, operation) {
    const data = operationData(operation);
    const audit = this.auditCheckpoints(kernel, operation);
    const stage = data.plan.stages[data.stageIndex] ?? null;
    return {
      operation,
      operationId: operation.id,
      projectId: data.projectId,
      taskId: data.taskId ?? null,
      projectDirectory: data.projectDirectory,
      runStatus: data.runStatus,
      terminalStatus: data.terminalStatus,
      reasonCode: data.reasonCode,
      nextAction: data.nextAction,
      stageIndex: data.stageIndex,
      stageCount: data.plan.stages.length,
      currentStageId: stage?.stageId ?? null,
      totalAttempts: data.totalAttempts,
      attemptsByStage: { ...data.attemptsByStage },
      usedTokens: data.usedTokens,
      maxTokens: data.plan.policy.maxTokens,
      usedCostMicros: data.usedCostMicros,
      maxCostMicros: data.plan.policy.maxCostMicros,
      deadlineAt: data.deadlineAt,
      nextAttemptAt: data.nextAttemptAt,
      currentLeaseId: data.currentLeaseId,
      leaseEpoch: data.leaseEpoch,
      lastGoodCheckpoint: audit.lastGood,
      corruptCheckpointIds: audit.corruptIds,
      eventCount: kernel.listEvents().filter((event) => event.objectId === operation.id || event.payload.operationId === operation.id).length
    };
  }
  async status(operationId) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "VIEWER", readOnly: true });
    try {
      const operation = kernel.getObject(operationId);
      if (!operation) throw new Error(`LONG_TASK_NOT_FOUND:${operationId}`);
      return this.snapshotFromKernel(kernel, operation);
    } finally {
      kernel.close();
    }
  }
  updateData(kernel, operation, data, suffix) {
    return kernel.updateObject(operation.id, { data }, operation.version, `p5:update:${operation.id}:${suffix}`);
  }
  archiveLease(kernel, leaseId, suffix) {
    if (!leaseId) return;
    const lease = kernel.getObject(leaseId);
    if (lease?.state === "ACTIVE") kernel.transitionObject(lease.id, "ARCHIVED", lease.version, `p5:lease-archive:${lease.id}:${suffix}`);
  }
  terminalize(kernel, operation, status, reasonCode, nextAction, suffix) {
    let current = operation;
    let data = operationData(current);
    if (data.terminalStatus === status && data.reasonCode === reasonCode) return current;
    data = { ...data, runStatus: status, terminalStatus: status, reasonCode, nextAction, nextAttemptAt: null, finishedAt: iso(this.clock.now()) };
    current = this.updateData(kernel, current, data, `terminal-data:${suffix}`);
    const target = status === "WAITING_USER" ? "WAITING" : status === "MANUAL_INTERVENTION" ? "MANUAL_INTERVENTION" : status === "FAILED" ? "FAILED" : "COMPLETED";
    if (target === "COMPLETED") {
      if (current.state === "ACTIVE") current = kernel.transitionObject(current.id, "VERIFYING", current.version, `p5:terminal:${current.id}:verifying:${suffix}`);
      if (current.state === "VERIFYING") current = kernel.transitionObject(current.id, "COMPLETED", current.version, `p5:terminal:${current.id}:completed:${suffix}`);
    } else if (current.state !== target) {
      if (current.state === "WAITING") current = kernel.transitionObject(current.id, "ACTIVE", current.version, `p5:terminal:${current.id}:reactivate:${suffix}`);
      current = kernel.transitionObject(current.id, target, current.version, `p5:terminal:${current.id}:${target}:${suffix}`);
    }
    this.archiveLease(kernel, data.currentLeaseId, `terminal:${suffix}`);
    this.append(kernel, current.id, "LONG_TASK_TERMINAL", `terminal:${suffix}`, { status, reasonCode, nextAction, stageIndex: data.stageIndex, totalAttempts: data.totalAttempts, usedTokens: data.usedTokens, usedCostMicros: data.usedCostMicros });
    return current;
  }
  acquireLease(kernel, operation, ownerId, suffix) {
    const now = this.clock.now();
    let current = operation;
    let data = operationData(current);
    const leases = kernel.listObjects("LEASE").filter((item) => item.data.operationId === current.id && item.state === "ACTIVE");
    let reusable = null;
    for (const lease2 of leases) {
      const details = leaseData(lease2);
      if (epoch(details.expiresAt) <= now) {
        kernel.transitionObject(lease2.id, "ARCHIVED", lease2.version, `p5:lease-expired:${lease2.id}:${lease2.version}`);
        this.append(kernel, current.id, "LONG_TASK_LEASE_EXPIRED", `lease-expired:${lease2.id}`, { leaseId: lease2.id, ownerId: details.ownerId, epoch: details.epoch, expiresAt: details.expiresAt });
      } else if (details.ownerId !== ownerId) {
        throw new Error(`LEASE_HELD:${details.ownerId}:${details.expiresAt}`);
      } else {
        reusable = lease2;
      }
    }
    if (reusable) {
      const details = leaseData(reusable);
      data = { ...data, currentLeaseId: reusable.id, ownerId, runStatus: data.runStatus === "BACKOFF" ? "BACKOFF" : "RUNNING" };
      current = this.updateData(kernel, current, data, `lease-reuse:${suffix}:${current.version}`);
      const renewed = kernel.updateObject(reusable.id, { data: { ...details, expiresAt: iso(this.clock.now() + data.plan.policy.leaseTtlMs) } }, reusable.version, `p5:lease-renew:${reusable.id}:${reusable.version}`);
      return { operation: current, lease: renewed };
    }
    const nextEpoch = Math.max(data.leaseEpoch, ...leases.map((item) => Number(item.data.epoch) || 0)) + 1;
    const leaseId = stableUuidFromKey(`LONG_TASK_LEASE:${current.id}:${nextEpoch}`);
    let lease = kernel.createObject({
      schemaVersion: SCHEMA_VERSION,
      id: leaseId,
      kind: "LEASE",
      state: "ACTIVE",
      title: `Long task lease ${nextEpoch}`,
      data: { operationId: current.id, ownerId, epoch: nextEpoch, acquiredAt: iso(now), expiresAt: iso(now + data.plan.policy.leaseTtlMs) }
    }, `p5:lease-create:${leaseId}`);
    data = { ...data, currentLeaseId: lease.id, leaseEpoch: nextEpoch, ownerId, runStatus: data.runStatus === "BACKOFF" ? "BACKOFF" : "RUNNING" };
    current = this.updateData(kernel, current, data, `lease-acquire:${suffix}:${nextEpoch}`);
    this.append(kernel, current.id, "LONG_TASK_LEASE_ACQUIRED", `lease-acquired:${nextEpoch}`, { leaseId: lease.id, ownerId, epoch: nextEpoch, expiresAt: lease.data.expiresAt });
    lease = kernel.updateObject(lease.id, { data: { ...leaseData(lease), expiresAt: iso(this.clock.now() + data.plan.policy.leaseTtlMs) } }, lease.version, `p5:lease-initial-renew:${lease.id}:${lease.version}`);
    return { operation: current, lease };
  }
  assertLease(kernel, operation, ownerId) {
    const data = operationData(operation);
    if (!data.currentLeaseId) throw new Error("LEASE_REQUIRED");
    const lease = kernel.getObject(data.currentLeaseId);
    if (!lease || lease.state !== "ACTIVE") throw new Error("LEASE_LOST");
    const details = leaseData(lease);
    if (details.ownerId !== ownerId || epoch(details.expiresAt) <= this.clock.now()) throw new Error("LEASE_LOST");
    return lease;
  }
  reconcile(kernel, operation, ownerId, suffix) {
    this.assertLease(kernel, operation, ownerId);
    const data = operationData(operation);
    const audit = this.auditCheckpoints(kernel, operation);
    for (const checkpointId of audit.corruptIds) {
      const corrupt = kernel.getObject(checkpointId);
      if (corrupt?.state === "COMPLETED") kernel.transitionObject(corrupt.id, "ARCHIVED", corrupt.version, `p5:checkpoint-corrupt-archive:${corrupt.id}`);
    }
    const expectedIndex = audit.valid.length;
    const expectedId = audit.lastGood?.id ?? null;
    if (data.stageIndex === expectedIndex && data.lastCheckpointId === expectedId && audit.corruptIds.length === 0) return operation;
    const next = {
      ...data,
      stageIndex: expectedIndex,
      lastCheckpointId: expectedId,
      runStatus: "RUNNING",
      terminalStatus: null,
      reasonCode: audit.corruptIds.length ? "CHECKPOINT_ROLLBACK" : data.reasonCode,
      nextAction: "RESUME_FROM_LAST_GOOD_CHECKPOINT",
      nextAttemptAt: null
    };
    const updated = this.updateData(kernel, operation, next, `checkpoint-reconcile:${suffix}:${operation.version}`);
    this.append(kernel, updated.id, "LONG_TASK_CHECKPOINT_RECONCILED", `checkpoint-reconciled:${suffix}:${updated.version}`, { priorStageIndex: data.stageIndex, stageIndex: expectedIndex, lastGoodCheckpointId: expectedId, corruptCheckpointIds: audit.corruptIds });
    return updated;
  }
  reserveAttempt(kernel, operation, ownerId) {
    this.assertLease(kernel, operation, ownerId);
    const data = operationData(operation);
    const stage = data.plan.stages[data.stageIndex];
    if (!stage) throw new Error("STAGE_NOT_FOUND");
    const now = this.clock.now();
    if (now >= epoch(data.deadlineAt)) throw new Error("TIME_BUDGET_EXHAUSTED");
    if (data.usedTokens + stage.estimatedTokens > data.plan.policy.maxTokens) throw new Error("TOKEN_BUDGET_PRECHECK");
    if (data.usedCostMicros + stage.estimatedCostMicros > data.plan.policy.maxCostMicros) throw new Error("COST_BUDGET_PRECHECK");
    const attempt = (data.attemptsByStage[stage.stageId] ?? 0) + 1;
    if (attempt > data.plan.policy.maxAttemptsPerStage) throw new Error("ATTEMPT_BUDGET_EXHAUSTED");
    const next = {
      ...data,
      runStatus: "RUNNING",
      reasonCode: null,
      nextAction: "EXECUTE_CURRENT_STAGE",
      attemptsByStage: { ...data.attemptsByStage, [stage.stageId]: attempt },
      totalAttempts: data.totalAttempts + 1,
      lastAttemptAt: iso(now),
      nextAttemptAt: null
    };
    const updated = this.updateData(kernel, operation, next, `attempt-reserve:${data.stageIndex}:${attempt}`);
    this.append(kernel, updated.id, "LONG_TASK_ATTEMPT_STARTED", `attempt-start:${data.stageIndex}:${attempt}`, { stageIndex: data.stageIndex, stageId: stage.stageId, attempt, leaseId: next.currentLeaseId });
    const prior = data.lastCheckpointId ? kernel.getObject(data.lastCheckpointId) : null;
    return { operation: updated, stage, attempt, previousCheckpoint: prior };
  }
  checkpointRelative(operationId, stageIndex, attempt) {
    return path8.join(".codex-work-platform", "long-tasks", operationId, "checkpoints", `${String(stageIndex).padStart(3, "0")}-attempt-${String(attempt).padStart(3, "0")}.json`);
  }
  recordSuccess(kernel, operation, ownerId, stage, attempt, result) {
    this.assertLease(kernel, operation, ownerId);
    let current = operation;
    let data = operationData(current);
    const existing = kernel.listObjects("CHECKPOINT").find((item) => item.data.operationId === current.id && item.data.stageIndex === data.stageIndex && item.state === "COMPLETED");
    let checkpoint = existing ?? null;
    if (!checkpoint) {
      const relativePath = this.checkpointRelative(current.id, data.stageIndex, attempt);
      const completedAt = iso(this.clock.now());
      const payload = {
        schemaVersion: 1,
        operationId: current.id,
        projectId: data.projectId,
        stageIndex: data.stageIndex,
        stageId: stage.stageId,
        attempt,
        previousCheckpointId: data.lastCheckpointId,
        result: result.payload,
        usage: { tokens: result.tokenUsage, costMicros: result.costMicros },
        completedAt
      };
      const filePath = ensureSafeParent(data.projectDirectory, relativePath);
      const persisted = writeOrAdoptJsonOnce(filePath, payload);
      const durablePayload = persisted.payload;
      const checkpointId = stableUuidFromKey(`LONG_TASK_CHECKPOINT:${current.id}:${data.stageIndex}:${attempt}`);
      const checkpointPayload = {
        operationId: current.id,
        projectId: data.projectId,
        stageIndex: data.stageIndex,
        stageId: stage.stageId,
        attempt,
        previousCheckpointId: data.lastCheckpointId,
        relativePath,
        fileSha256: persisted.fileSha256,
        payloadSha256: sha256Json(durablePayload),
        tokenUsage: result.tokenUsage,
        costMicros: result.costMicros,
        completedAt: String(durablePayload.completedAt)
      };
      checkpoint = kernel.createObject({ schemaVersion: SCHEMA_VERSION, id: checkpointId, kind: "CHECKPOINT", state: "COMPLETED", title: `${current.title}: ${stage.title}`, data: checkpointPayload }, `p5:checkpoint-create:${checkpointId}`);
      if (persisted.adopted) this.append(kernel, current.id, "LONG_TASK_ORPHAN_CHECKPOINT_ADOPTED", `checkpoint-adopted:${checkpointId}`, { checkpointId, stageIndex: data.stageIndex, stageId: stage.stageId, attempt, fileSha256: persisted.fileSha256 });
    }
    const checkpointInfo = checkpointData(checkpoint);
    const nextStageIndex = data.stageIndex + 1;
    data = {
      ...data,
      stageIndex: nextStageIndex,
      lastCheckpointId: checkpoint.id,
      usedTokens: data.usedTokens + checkpointInfo.tokenUsage,
      usedCostMicros: data.usedCostMicros + checkpointInfo.costMicros,
      lastProgressAt: iso(this.clock.now()),
      nextAttemptAt: null,
      runStatus: nextStageIndex >= data.plan.stages.length ? "RUNNING" : "READY",
      reasonCode: null,
      nextAction: nextStageIndex >= data.plan.stages.length ? "FINALIZE" : "EXECUTE_NEXT_STAGE",
      stallCount: 0,
      lastFailure: null
    };
    current = this.updateData(kernel, current, data, `stage-success:${checkpointInfo.stageIndex}:${checkpoint.id}`);
    this.append(kernel, current.id, "LONG_TASK_STAGE_SUCCEEDED", `stage-success:${checkpointInfo.stageIndex}:${checkpoint.id}`, { checkpointId: checkpoint.id, stageIndex: checkpointInfo.stageIndex, stageId: checkpointInfo.stageId, attempt, tokenUsage: checkpointInfo.tokenUsage, costMicros: checkpointInfo.costMicros });
    if (data.usedTokens > data.plan.policy.maxTokens) return this.terminalize(kernel, current, "WAITING_USER", "TOKEN_BUDGET_EXCEEDED_AFTER_STAGE", "REVIEW_USAGE_AND_CREATE_A_NEW_RUN_WITH_A_LARGER_BUDGET", `token-after:${nextStageIndex}`);
    if (data.usedCostMicros > data.plan.policy.maxCostMicros) return this.terminalize(kernel, current, "WAITING_USER", "COST_BUDGET_EXCEEDED_AFTER_STAGE", "REVIEW_COST_AND_CREATE_A_NEW_RUN_WITH_A_LARGER_BUDGET", `cost-after:${nextStageIndex}`);
    if (nextStageIndex >= data.plan.stages.length) return this.terminalize(kernel, current, "COMPLETED", "ALL_STAGES_VERIFIED", "VERIFY_BUSINESS_OUTPUT", `completed:${nextStageIndex}`);
    return current;
  }
  retryDelay(policy, category, attempt, explicit) {
    const base = category === "RATE_LIMIT" ? policy.backoff.rateLimitMs : category === "NETWORK" ? policy.backoff.networkMs : category === "PROCESS_EXIT" ? policy.backoff.processExitMs : policy.backoff.noProgressMs;
    return Math.min(policy.backoff.maxMs, Math.max(explicit, base * 2 ** Math.max(0, attempt - 1)));
  }
  recordFailure(kernel, operation, ownerId, stage, attempt, failure) {
    this.assertLease(kernel, operation, ownerId);
    let data = operationData(operation);
    data = { ...data, usedTokens: data.usedTokens + failure.tokenUsage, usedCostMicros: data.usedCostMicros + failure.costMicros };
    const now = this.clock.now();
    const delay = this.retryDelay(data.plan.policy, failure.category, attempt, failure.retryAfterMs);
    const nextAt = now + delay;
    const exhausted = attempt >= data.plan.policy.maxAttemptsPerStage;
    const timeExhausted = nextAt >= epoch(data.deadlineAt);
    const tokenExhausted = data.usedTokens > data.plan.policy.maxTokens;
    const costExhausted = data.usedCostMicros > data.plan.policy.maxCostMicros;
    const lastFailure = { category: failure.category, message: failure.message, retryable: failure.retryable, retryAfterMs: failure.retryAfterMs, attempt, at: iso(now) };
    data = { ...data, lastFailure };
    let current = this.updateData(kernel, operation, data, `failure-usage:${data.stageIndex}:${attempt}`);
    this.append(kernel, current.id, "LONG_TASK_ATTEMPT_FAILED", `attempt-failed:${data.stageIndex}:${attempt}`, { stageIndex: data.stageIndex, stageId: stage.stageId, ...lastFailure, usedTokens: data.usedTokens, usedCostMicros: data.usedCostMicros });
    if (tokenExhausted) return this.terminalize(kernel, current, "WAITING_USER", "TOKEN_BUDGET_EXHAUSTED", "REVIEW_USAGE_AND_CREATE_A_NEW_RUN_WITH_A_LARGER_BUDGET", `failure-token:${data.stageIndex}:${attempt}`);
    if (costExhausted) return this.terminalize(kernel, current, "WAITING_USER", "COST_BUDGET_EXHAUSTED", "REVIEW_COST_AND_CREATE_A_NEW_RUN_WITH_A_LARGER_BUDGET", `failure-cost:${data.stageIndex}:${attempt}`);
    if (!failure.retryable) return this.terminalize(kernel, current, "FAILED", `NONRETRYABLE_${failure.category}`, "INSPECT_FAILURE_AND_START_A_CORRECTED_RUN", `nonretryable:${data.stageIndex}:${attempt}`);
    if (exhausted || timeExhausted) {
      const status = failure.category === "RATE_LIMIT" || failure.category === "NETWORK" ? "WAITING_USER" : "FAILED";
      const reason = timeExhausted ? "TIME_BUDGET_EXHAUSTED" : `RETRY_EXHAUSTED_${failure.category}`;
      const action = status === "WAITING_USER" ? "REVIEW_EXTERNAL_AVAILABILITY_AND_EXPLICITLY_RESUME" : "INSPECT_REPEATED_FAILURE_AND_START_A_CORRECTED_RUN";
      return this.terminalize(kernel, current, status, reason, action, `retry-exhausted:${data.stageIndex}:${attempt}`);
    }
    data = operationData(current);
    data = { ...data, runStatus: "BACKOFF", reasonCode: `RETRY_${failure.category}`, nextAction: "RETRY_AFTER_BACKOFF", nextAttemptAt: iso(nextAt) };
    current = this.updateData(kernel, current, data, `backoff:${data.stageIndex}:${attempt}`);
    this.append(kernel, current.id, "LONG_TASK_RETRY_SCHEDULED", `retry:${data.stageIndex}:${attempt}`, { stageIndex: data.stageIndex, stageId: stage.stageId, attempt, category: failure.category, delayMs: delay, nextAttemptAt: data.nextAttemptAt });
    return current;
  }
  acknowledgeWaiting(kernel, operation, suffix) {
    const data = operationData(operation);
    if (operation.state !== "WAITING" || data.terminalStatus !== "WAITING_USER") return operation;
    let current = kernel.transitionObject(operation.id, "ACTIVE", operation.version, `p5:resume:${operation.id}:${suffix}`);
    const next = { ...data, runStatus: "READY", terminalStatus: null, reasonCode: null, nextAction: "RUN_OR_RESUME", finishedAt: null };
    current = this.updateData(kernel, current, next, `resume-data:${suffix}`);
    this.append(kernel, current.id, "LONG_TASK_USER_RESUMED", `user-resumed:${suffix}`, { priorReasonCode: data.reasonCode });
    return current;
  }
  async run(input) {
    const ownerId = input.ownerId.trim();
    const suffix = input.idempotencyKey.trim();
    if (!ownerId || ownerId.length > 160) throw new Error("OWNER_ID_INVALID");
    if (suffix.length < 8 || suffix.length > 120) throw new Error("IDEMPOTENCY_KEY_LENGTH_INVALID");
    let kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    let operation;
    let invocationStarted = this.clock.now();
    try {
      const found = kernel.getObject(input.operationId);
      if (!found) throw new Error(`LONG_TASK_NOT_FOUND:${input.operationId}`);
      operation = input.acknowledgeWaiting ? this.acknowledgeWaiting(kernel, found, suffix) : found;
      const data = operationData(operation);
      if (data.terminalStatus) return this.snapshotFromKernel(kernel, operation);
      ({ operation } = this.acquireLease(kernel, operation, ownerId, suffix));
    } finally {
      kernel.close();
    }
    const safetyBound = operationData(operation).plan.stages.length * (operationData(operation).plan.policy.maxAttemptsPerStage + 3) + 20;
    for (let turn = 0; turn < safetyBound; turn += 1) {
      kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      let reservation = null;
      try {
        const latest = kernel.getObject(input.operationId);
        if (!latest) throw new Error(`LONG_TASK_NOT_FOUND:${input.operationId}`);
        operation = latest;
        const before = operationData(operation);
        if (before.terminalStatus) return this.snapshotFromKernel(kernel, operation);
        ({ operation } = this.acquireLease(kernel, operation, ownerId, `${suffix}:loop:${turn}`));
        const leased = operationData(operation);
        if (this.clock.now() >= epoch(leased.deadlineAt)) {
          operation = this.terminalize(kernel, operation, "WAITING_USER", "TIME_BUDGET_EXHAUSTED", "REVIEW_DURATION_AND_START_OR_RESUME_WITH_EXPLICIT_AUTHORITY", `deadline:${suffix}`);
          return this.snapshotFromKernel(kernel, operation);
        }
        operation = this.reconcile(kernel, operation, ownerId, `${suffix}:${turn}`);
        let data = operationData(operation);
        const attemptInFlight = data.lastAttemptAt !== null && data.lastProgressAt <= data.lastAttemptAt && data.runStatus === "RUNNING";
        if (attemptInFlight && this.clock.now() - epoch(data.lastAttemptAt) >= data.plan.policy.stallTimeoutMs) {
          const stallCount = data.stallCount + 1;
          this.append(kernel, operation.id, "LONG_TASK_NO_PROGRESS_DETECTED", `stall:${data.stageIndex}:${stallCount}`, { stageIndex: data.stageIndex, lastAttemptAt: data.lastAttemptAt, stallTimeoutMs: data.plan.policy.stallTimeoutMs, stallCount });
          if (stallCount >= data.plan.policy.maxStalls) {
            operation = this.terminalize(kernel, operation, "MANUAL_INTERVENTION", "NO_PROGRESS_LIMIT_REACHED", "INSPECT_THE_STALLED_STAGE_AND_TAKE_OVER", `stall-terminal:${data.stageIndex}:${stallCount}`);
            return this.snapshotFromKernel(kernel, operation);
          }
          data = { ...data, stallCount, runStatus: "BACKOFF", reasonCode: "RETRY_NO_PROGRESS", nextAction: "RETRY_FROM_LAST_GOOD_CHECKPOINT", nextAttemptAt: iso(this.clock.now() + this.retryDelay(data.plan.policy, "NO_PROGRESS", stallCount, 0)) };
          operation = this.updateData(kernel, operation, data, `stall-backoff:${data.stageIndex}:${stallCount}`);
        }
        data = operationData(operation);
        if (data.nextAttemptAt && epoch(data.nextAttemptAt) > this.clock.now()) {
          const delay = epoch(data.nextAttemptAt) - this.clock.now();
          const remainingInvocation = data.plan.policy.maxInvocationWaitMs - (this.clock.now() - invocationStarted);
          if (delay > remainingInvocation) {
            operation = this.terminalize(kernel, operation, "WAITING_USER", "RETRY_DELAY_REQUIRES_RESUME", "RESUME_AFTER_NEXT_ATTEMPT_TIME", `wait-window:${data.stageIndex}:${data.totalAttempts}`);
            return this.snapshotFromKernel(kernel, operation);
          }
          kernel.close();
          kernel = null;
          await this.clock.sleep(delay);
          continue;
        }
        try {
          reservation = this.reserveAttempt(kernel, operation, ownerId);
          operation = reservation.operation;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (["TIME_BUDGET_EXHAUSTED", "TOKEN_BUDGET_PRECHECK", "COST_BUDGET_PRECHECK", "ATTEMPT_BUDGET_EXHAUSTED"].includes(message)) {
            const status = message === "ATTEMPT_BUDGET_EXHAUSTED" ? "FAILED" : "WAITING_USER";
            operation = this.terminalize(kernel, operation, status, message, status === "WAITING_USER" ? "REVIEW_BUDGET_AND_EXPLICITLY_RESUME" : "INSPECT_REPEATED_FAILURE_AND_START_A_CORRECTED_RUN", `precheck:${suffix}:${data.stageIndex}:${message}`);
            return this.snapshotFromKernel(kernel, operation);
          }
          throw error;
        }
      } finally {
        if (kernel) kernel.close();
      }
      if (!reservation) throw new Error("ATTEMPT_RESERVATION_MISSING");
      let result;
      try {
        result = await this.executor.execute({
          operationId: reservation.operation.id,
          projectId: operationData(reservation.operation).projectId,
          projectDirectory: operationData(reservation.operation).projectDirectory,
          stage: reservation.stage,
          stageIndex: operationData(reservation.operation).stageIndex,
          attempt: reservation.attempt,
          previousCheckpoint: reservation.previousCheckpoint
        });
      } catch (error) {
        if (error instanceof SimulatedHostExit) throw error;
        kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
        try {
          const latest = kernel.getObject(input.operationId);
          if (!latest) throw new Error(`LONG_TASK_NOT_FOUND:${input.operationId}`);
          ({ operation } = this.acquireLease(kernel, latest, ownerId, `${suffix}:failure:${turn}`));
          operation = this.recordFailure(kernel, operation, ownerId, reservation.stage, reservation.attempt, classify(error));
          if (operationData(operation).terminalStatus) return this.snapshotFromKernel(kernel, operation);
        } finally {
          kernel.close();
        }
        continue;
      }
      kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        const latest = kernel.getObject(input.operationId);
        if (!latest) throw new Error(`LONG_TASK_NOT_FOUND:${input.operationId}`);
        ({ operation } = this.acquireLease(kernel, latest, ownerId, `${suffix}:success:${turn}`));
        operation = this.recordSuccess(kernel, operation, ownerId, reservation.stage, reservation.attempt, result);
        if (operationData(operation).terminalStatus) return this.snapshotFromKernel(kernel, operation);
      } finally {
        kernel.close();
      }
    }
    kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      const latest = kernel.getObject(input.operationId);
      if (!latest) throw new Error(`LONG_TASK_NOT_FOUND:${input.operationId}`);
      operation = this.terminalize(kernel, latest, "MANUAL_INTERVENTION", "RUNNER_SAFETY_BOUND_REACHED", "INSPECT_EVENT_LEDGER_AND_TAKE_OVER", `safety-bound:${suffix}`);
      return this.snapshotFromKernel(kernel, operation);
    } finally {
      kernel.close();
    }
  }
  async manualTakeover(operationId, ownerId, reason, idempotencyKey2) {
    if (!ownerId.trim() || ownerId.trim().length > 160) throw new Error("OWNER_ID_INVALID");
    if (!reason.trim() || reason.trim().length > 1e3) throw new Error("TAKEOVER_REASON_INVALID");
    if (idempotencyKey2.trim().length < 8 || idempotencyKey2.trim().length > 120) throw new Error("IDEMPOTENCY_KEY_LENGTH_INVALID");
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
    try {
      let operation = kernel.getObject(operationId);
      if (!operation) throw new Error(`LONG_TASK_NOT_FOUND:${operationId}`);
      const data = operationData(operation);
      if (data.terminalStatus && data.terminalStatus !== "WAITING_USER") return this.snapshotFromKernel(kernel, operation);
      if (operation.state === "WAITING") operation = kernel.transitionObject(operation.id, "ACTIVE", operation.version, `p5:takeover-reactivate:${idempotencyKey2}`);
      this.append(kernel, operation.id, "LONG_TASK_MANUAL_TAKEOVER_REQUESTED", `takeover-request:${idempotencyKey2}`, { ownerId, reason });
      operation = this.terminalize(kernel, operation, "MANUAL_INTERVENTION", "OPERATOR_TAKEOVER", "CONTINUE_MANUALLY_FROM_LAST_GOOD_CHECKPOINT", `takeover:${idempotencyKey2}`);
      return this.snapshotFromKernel(kernel, operation);
    } finally {
      kernel.close();
    }
  }
};

// packages/search-knowledge/src/index.ts
import path9 from "node:path";
var sha2563 = external_exports.string().regex(/^[a-f0-9]{64}$/);
var domain = external_exports.string().trim().min(1).max(253).transform((value) => value.toLowerCase()).refine((value) => {
  if (value === "localhost" || value.includes(":") || value.includes("/") || value.startsWith(".") || value.endsWith(".")) return false;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(value);
}, "DOMAIN_INVALID");
var credentialReference = external_exports.string().regex(/^env:[A-Z][A-Z0-9_]{1,127}$/);
var searchPolicySchema = external_exports.object({
  enabled: external_exports.boolean(),
  providerId: external_exports.literal("WIKIMEDIA_OPENSEARCH"),
  maxQueries: external_exports.number().int().min(1).max(100),
  maxQueryCharacters: external_exports.number().int().min(1).max(2e3),
  maxResults: external_exports.number().int().min(1).max(50),
  maxCostMicros: external_exports.number().int().min(0).max(1e9),
  requestTimeoutMs: external_exports.number().int().min(250).max(6e4),
  allowedDomains: external_exports.array(domain).min(1).max(100).transform((items) => [...new Set(items)].sort()),
  allowedDataScopes: external_exports.array(external_exports.literal("PUBLIC_WEB")).length(1),
  credentialRef: credentialReference.nullable()
});
var searchRequestSchema = external_exports.object({
  projectId: external_exports.string().uuid(),
  query: external_exports.string().trim().min(1).max(2e3),
  dataScope: external_exports.literal("PUBLIC_WEB"),
  domains: external_exports.array(domain).min(1).max(25).transform((items) => [...new Set(items)].sort()),
  policy: searchPolicySchema,
  idempotencyKey: external_exports.string().trim().min(8).max(120)
});
function resultFrom(url, title, snippet) {
  if (typeof url !== "string" || typeof title !== "string" || typeof snippet !== "string") return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const cleanTitle = typeof title === "string" && title.trim() ? title.trim() : snippet.split(" - ")[0]?.trim() || parsed.hostname;
  const cleanSnippet = snippet.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || cleanTitle;
  const contentHash = sha256Json({ url: parsed.href, title: cleanTitle, snippet: cleanSnippet });
  return { url: parsed.href, title: cleanTitle.slice(0, 240), snippet: cleanSnippet.slice(0, 4e3), sourceVersion: contentHash };
}
var WikimediaOpenSearchProvider = class {
  id = "WIKIMEDIA_OPENSEARCH";
  async search(input) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs);
    try {
      if (!input.domains.some((item) => item === "wikipedia.org" || item.endsWith(".wikipedia.org"))) throw new Error("SEARCH_PROVIDER_DOMAIN_UNSUPPORTED");
      const endpoint = new URL("https://en.wikipedia.org/w/api.php");
      endpoint.searchParams.set("action", "opensearch");
      endpoint.searchParams.set("search", input.query);
      endpoint.searchParams.set("limit", String(input.maxResults));
      endpoint.searchParams.set("namespace", "0");
      endpoint.searchParams.set("format", "json");
      endpoint.searchParams.set("origin", "*");
      const response = await fetch(endpoint, { headers: { accept: "application/json", "user-agent": `codex-work-platform/${PRODUCT_VERSION}` }, redirect: "error", signal: controller.signal });
      if (!response.ok) throw new Error(`SEARCH_PROVIDER_HTTP_${response.status}`);
      const body = await response.json();
      if (!Array.isArray(body) || body.length < 4 || !Array.isArray(body[1]) || !Array.isArray(body[2]) || !Array.isArray(body[3])) throw new Error("SEARCH_PROVIDER_RESPONSE_INVALID");
      const titles = body[1];
      const descriptions = body[2];
      const urls = body[3];
      const candidates = [];
      for (let index = 0; index < Math.min(titles.length, descriptions.length, urls.length); index += 1) {
        const parsed = resultFrom(urls[index], titles[index], descriptions[index]);
        if (parsed) candidates.push(parsed);
      }
      const unique = /* @__PURE__ */ new Map();
      for (const candidate of candidates) {
        if (!unique.has(candidate.url)) unique.set(candidate.url, candidate);
        if (unique.size >= input.maxResults) break;
      }
      return {
        providerRequestId: sha256Json({ provider: this.id, query: input.query, resultCount: unique.size }),
        results: [...unique.values()],
        costMicros: 0
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") throw new Error("SEARCH_PROVIDER_TIMEOUT");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
};
var knowledgeCandidateBaseSchema = external_exports.object({
  projectId: external_exports.string().uuid(),
  topic: external_exports.string().trim().min(1).max(240),
  claim: external_exports.string().trim().min(1).max(12e3),
  evidenceIds: external_exports.array(external_exports.string().uuid()).min(1).max(100).transform((items) => [...new Set(items)].sort()),
  permission: external_exports.enum(["PUBLIC", "LICENSED_INTERNAL", "RESTRICTED_REVIEW_ONLY"]),
  confidence: external_exports.number().min(0).max(1),
  candidateVersion: external_exports.string().trim().min(1).max(120),
  validFrom: external_exports.string().datetime(),
  validUntil: external_exports.string().datetime().nullable(),
  downstreamObjectIds: external_exports.array(external_exports.string().uuid()).max(100).default([]).transform((items) => [...new Set(items)].sort()),
  idempotencyKey: external_exports.string().trim().min(8).max(120)
});
var knowledgeCandidateInputShape = knowledgeCandidateBaseSchema.shape;
var knowledgeCandidateInputSchema = knowledgeCandidateBaseSchema.superRefine((input, context) => {
  if (input.validUntil && Date.parse(input.validUntil) <= Date.parse(input.validFrom)) context.addIssue({ code: external_exports.ZodIssueCode.custom, message: "VALIDITY_WINDOW_INVALID" });
});
var evidenceRefreshSchema = external_exports.object({
  priorEvidenceId: external_exports.string().uuid(),
  sourceVersion: external_exports.string().trim().min(1).max(240),
  contentSha256: sha2563,
  observedAt: external_exports.string().datetime(),
  title: external_exports.string().trim().min(1).max(240),
  snippet: external_exports.string().trim().min(1).max(4e3),
  idempotencyKey: external_exports.string().trim().min(8).max(120)
});
var queues2 = /* @__PURE__ */ new Map();
async function exclusive2(key, operation) {
  const prior = queues2.get(key) ?? Promise.resolve();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const current = prior.then(() => gate);
  queues2.set(key, current);
  await prior;
  try {
    return await operation();
  } finally {
    release();
    if (queues2.get(key) === current) queues2.delete(key);
  }
}
function normalizedTopic(value) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}
function hostAllowed(url, domains) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) return false;
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  return domains.some((item) => host === item || host.endsWith(`.${item}`));
}
function candidateEvidenceIds(candidate) {
  const value = candidate.data.evidenceIds;
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
function candidateDownstreamIds(candidate) {
  const value = candidate.data.downstreamObjectIds;
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
function errorCode(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/[^A-Z0-9_:.-]/g, "_").slice(0, 240) || "SEARCH_PROVIDER_FAILED";
}
var SearchKnowledgeService = class {
  databasePath;
  actor;
  provider;
  constructor(options) {
    if (!path9.isAbsolute(options.databasePath)) throw new Error("ABSOLUTE_PATH_REQUIRED:databasePath");
    this.databasePath = path9.normalize(options.databasePath);
    this.provider = options.provider ?? new WikimediaOpenSearchProvider();
    this.actor = options.actor?.trim() || "codex-search-knowledge";
  }
  async search(input) {
    const parsed = searchRequestSchema.parse(input);
    if (!parsed.policy.enabled) throw new Error("SEARCH_DISABLED");
    if (!parsed.policy.allowedDataScopes.includes(parsed.dataScope)) throw new Error("SEARCH_DATA_SCOPE_DENIED");
    if (parsed.query.length > parsed.policy.maxQueryCharacters) throw new Error("SEARCH_QUERY_BUDGET_EXCEEDED");
    if (1 > parsed.policy.maxQueries) throw new Error("SEARCH_QUERY_COUNT_BUDGET_EXCEEDED");
    const disallowed = parsed.domains.filter((requested) => !parsed.policy.allowedDomains.some((allowed) => requested === allowed || requested.endsWith(`.${allowed}`)));
    if (disallowed.length) throw new Error(`SEARCH_DOMAIN_SCOPE_DENIED:${disallowed.join(",")}`);
    if (this.provider.id !== parsed.policy.providerId) throw new Error(`SEARCH_PROVIDER_MISMATCH:${this.provider.id}:${parsed.policy.providerId}`);
    return exclusive2(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      const operationId = stableUuidFromKey(`SEARCH_OPERATION:${parsed.idempotencyKey}`);
      const requestHash = sha256Json(parsed);
      try {
        const project = kernel.getObject(parsed.projectId);
        if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${parsed.projectId}`);
        const existing = kernel.getObject(operationId);
        if (existing) {
          if (existing.kind !== "OPERATION" || existing.data.operationType !== "SEARCH" || existing.data.requestHash !== requestHash) throw new Error(`IDEMPOTENCY_CONFLICT:${parsed.idempotencyKey}`);
          if (existing.state === "COMPLETED") {
            const ids = Array.isArray(existing.data.evidenceIds) ? existing.data.evidenceIds.filter((item) => typeof item === "string") : [];
            const evidence = ids.map((id) => kernel.getObject(id)).filter((item) => Boolean(item));
            return { operation: existing, evidence, providerRequestId: typeof existing.data.providerRequestId === "string" ? existing.data.providerRequestId : null, costMicros: Number(existing.data.costMicros ?? 0), deduplicated: true };
          }
          throw new Error(`SEARCH_OPERATION_NOT_REPLAYABLE:${existing.state}:${String(existing.data.failureCode ?? "UNKNOWN")}`);
        }
        let operation = kernel.createObject({
          schemaVersion: SCHEMA_VERSION,
          id: operationId,
          kind: "OPERATION",
          state: "DRAFT",
          title: `Search: ${parsed.query.slice(0, 200)}`,
          data: {
            operationType: "SEARCH",
            projectId: parsed.projectId,
            requestHash,
            providerId: parsed.policy.providerId,
            queryHash: sha256Json({ query: parsed.query }),
            dataScope: parsed.dataScope,
            domains: parsed.domains,
            policy: parsed.policy,
            queryCount: 0,
            resultCount: 0,
            costMicros: 0,
            evidenceIds: []
          }
        }, `search-create:${operationId}`);
        operation = kernel.transitionObject(operation.id, "ACTIVE", operation.version, `search-active:${operationId}`);
        try {
          const response = await this.provider.search({ query: parsed.query, domains: parsed.domains, maxResults: parsed.policy.maxResults, timeoutMs: parsed.policy.requestTimeoutMs, credentialRef: parsed.policy.credentialRef });
          if (!Number.isInteger(response.costMicros) || response.costMicros < 0) throw new Error("SEARCH_PROVIDER_COST_INVALID");
          if (response.results.length > parsed.policy.maxResults) throw new Error("SEARCH_RESULT_BUDGET_EXCEEDED");
          if (response.costMicros > parsed.policy.maxCostMicros) throw new Error("SEARCH_COST_BUDGET_EXCEEDED");
          const evidence = [];
          for (const result of response.results) {
            if (!hostAllowed(result.url, parsed.domains)) throw new Error(`SEARCH_RESULT_DOMAIN_DENIED:${result.url}`);
            if (!result.title.trim() || !result.snippet.trim() || !result.sourceVersion.trim()) throw new Error("SEARCH_RESULT_FIELDS_INVALID");
            const contentSha256 = sha256Json({ url: result.url, title: result.title, snippet: result.snippet });
            const evidenceId = stableUuidFromKey(`SEARCH_EVIDENCE:${parsed.projectId}:${parsed.policy.providerId}:${result.url}:${result.sourceVersion}`);
            const evidenceData = {
              artifactType: "SEARCH_EVIDENCE",
              projectId: parsed.projectId,
              providerId: parsed.policy.providerId,
              sourceUrl: result.url,
              sourceVersion: result.sourceVersion,
              contentSha256,
              title: result.title,
              snippet: result.snippet,
              publishedAt: result.publishedAt ?? null,
              observedAt: operation.createdAt,
              permission: "PUBLIC",
              sourceBacklink: result.url,
              searchOperationId: operation.id
            };
            const prior = kernel.getObject(evidenceId);
            if (prior && (prior.kind !== "ARTIFACT" || prior.data.contentSha256 !== contentSha256)) throw new Error(`EVIDENCE_VERSION_COLLISION:${evidenceId}`);
            evidence.push(prior ?? kernel.createObject({ schemaVersion: SCHEMA_VERSION, id: evidenceId, kind: "ARTIFACT", state: "COMPLETED", title: result.title, data: evidenceData }, `search-evidence:${evidenceId}`));
          }
          operation = kernel.updateObject(operation.id, { data: { ...operation.data, queryCount: 1, resultCount: evidence.length, costMicros: response.costMicros, providerRequestId: response.providerRequestId, evidenceIds: evidence.map((item) => item.id), completedAt: (/* @__PURE__ */ new Date()).toISOString() } }, operation.version, `search-result:${operation.id}`);
          operation = kernel.transitionObject(operation.id, "VERIFYING", operation.version, `search-verify:${operation.id}`);
          operation = kernel.transitionObject(operation.id, "COMPLETED", operation.version, `search-complete:${operation.id}`);
          return { operation, evidence, providerRequestId: response.providerRequestId, costMicros: response.costMicros, deduplicated: false };
        } catch (error) {
          const failureCode = errorCode(error);
          operation = kernel.updateObject(operation.id, { data: { ...operation.data, queryCount: 1, failureCode, failedAt: (/* @__PURE__ */ new Date()).toISOString() } }, operation.version, `search-failure:${operation.id}`);
          operation = kernel.transitionObject(operation.id, "FAILED", operation.version, `search-failed:${operation.id}`);
          throw new Error(failureCode);
        }
      } finally {
        kernel.close();
      }
    });
  }
  async submitCandidate(input) {
    const parsed = knowledgeCandidateInputSchema.parse(input);
    return exclusive2(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        const project = kernel.getObject(parsed.projectId);
        if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${parsed.projectId}`);
        const candidateId = stableUuidFromKey(`KNOWLEDGE_CANDIDATE:${parsed.idempotencyKey}`);
        const requestHash = sha256Json(parsed);
        const existing = kernel.getObject(candidateId);
        if (existing) {
          if (existing.kind !== "KNOWLEDGE_CANDIDATE" || existing.data.requestHash !== requestHash) throw new Error(`IDEMPOTENCY_CONFLICT:${parsed.idempotencyKey}`);
          return existing;
        }
        for (const evidenceId of parsed.evidenceIds) {
          const evidence = kernel.getObject(evidenceId);
          if (!evidence || evidence.kind !== "ARTIFACT" || evidence.data.artifactType !== "SEARCH_EVIDENCE") throw new Error(`SEARCH_EVIDENCE_NOT_FOUND:${evidenceId}`);
          if (evidence.data.projectId !== parsed.projectId) throw new Error(`SEARCH_EVIDENCE_PROJECT_MISMATCH:${evidenceId}`);
        }
        for (const downstreamId of parsed.downstreamObjectIds) {
          const downstream = kernel.getObject(downstreamId);
          if (!downstream) throw new Error(`DOWNSTREAM_OBJECT_NOT_FOUND:${downstreamId}`);
          if (downstream.data.projectId !== parsed.projectId && downstream.id !== parsed.projectId) throw new Error(`DOWNSTREAM_PROJECT_MISMATCH:${downstreamId}`);
        }
        const topicKey = normalizedTopic(parsed.topic);
        const claimHash = sha256Json({ claim: parsed.claim });
        const now = Date.now();
        const validity = Date.parse(parsed.validFrom) > now ? "NOT_YET_VALID" : parsed.validUntil && Date.parse(parsed.validUntil) <= now ? "EXPIRED" : "CURRENT";
        const conflicts = kernel.listObjects("KNOWLEDGE_CANDIDATE").filter((candidate) => candidate.data.projectId === parsed.projectId && candidate.data.topicKey === topicKey && candidate.data.claimHash !== claimHash && candidate.data.approvalStatus !== "REJECTED").map((candidate) => candidate.id).sort();
        const approvalStatus = conflicts.length ? "CONFLICT_REVIEW_REQUIRED" : "PENDING";
        return kernel.createObject({
          schemaVersion: SCHEMA_VERSION,
          id: candidateId,
          kind: "KNOWLEDGE_CANDIDATE",
          state: "DRAFT",
          title: parsed.topic,
          data: {
            projectId: parsed.projectId,
            requestHash,
            topic: parsed.topic,
            topicKey,
            claim: parsed.claim,
            claimHash,
            evidenceIds: parsed.evidenceIds,
            permission: parsed.permission,
            confidence: parsed.confidence,
            candidateVersion: parsed.candidateVersion,
            validFrom: parsed.validFrom,
            validUntil: parsed.validUntil,
            validity,
            conflicts,
            resolvedConflicts: [],
            approvalStatus,
            downstreamObjectIds: parsed.downstreamObjectIds,
            coreKnowledgeWritten: false
          }
        }, `knowledge-candidate:${candidateId}`);
      } finally {
        kernel.close();
      }
    });
  }
  async decideCandidate(candidateId, decision, idempotencyKey2, resolvedConflictIds = []) {
    if (!external_exports.string().uuid().safeParse(candidateId).success) throw new Error("KNOWLEDGE_CANDIDATE_ID_INVALID");
    if (!external_exports.string().trim().min(8).max(120).safeParse(idempotencyKey2).success) throw new Error("IDEMPOTENCY_KEY_LENGTH_INVALID");
    const resolved = [...new Set(resolvedConflictIds)].sort();
    return exclusive2(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        let candidate = kernel.getObject(candidateId);
        if (!candidate || candidate.kind !== "KNOWLEDGE_CANDIDATE") throw new Error(`KNOWLEDGE_CANDIDATE_NOT_FOUND:${candidateId}`);
        const priorDecision = candidate.data.decision;
        if (priorDecision) {
          if (priorDecision !== decision) throw new Error(`KNOWLEDGE_DECISION_CONFLICT:${String(priorDecision)}:${decision}`);
          const priorResolved = Array.isArray(candidate.data.resolvedConflicts) ? candidate.data.resolvedConflicts : [];
          if (sha256Json(priorResolved) !== sha256Json(resolved)) throw new Error(`IDEMPOTENCY_CONFLICT:${idempotencyKey2}`);
          return { candidate, decision, resolvedConflicts: resolved, coreKnowledgeWritten: false };
        }
        const conflicts = Array.isArray(candidate.data.conflicts) ? candidate.data.conflicts.filter((item) => typeof item === "string").sort() : [];
        if (decision === "APPROVE" && candidate.data.validity !== "CURRENT") throw new Error(`KNOWLEDGE_CANDIDATE_NOT_CURRENT:${String(candidate.data.validity)}`);
        if (decision === "APPROVE" && conflicts.some((id) => !resolved.includes(id))) throw new Error(`KNOWLEDGE_CONFLICT_UNRESOLVED:${conflicts.filter((id) => !resolved.includes(id)).join(",")}`);
        const approvalStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";
        candidate = kernel.updateObject(candidate.id, { data: { ...candidate.data, decision, approvalStatus, resolvedConflicts: resolved, decidedAt: (/* @__PURE__ */ new Date()).toISOString(), coreKnowledgeWritten: false } }, candidate.version, `${idempotencyKey2}:knowledge-decision`);
        if (decision === "REJECT") candidate = kernel.transitionObject(candidate.id, "FAILED", candidate.version, `${idempotencyKey2}:knowledge-rejected`);
        else {
          candidate = kernel.transitionObject(candidate.id, "ACTIVE", candidate.version, `${idempotencyKey2}:knowledge-active`);
          candidate = kernel.transitionObject(candidate.id, "VERIFYING", candidate.version, `${idempotencyKey2}:knowledge-verifying`);
          candidate = kernel.transitionObject(candidate.id, "COMPLETED", candidate.version, `${idempotencyKey2}:knowledge-approved`);
        }
        return { candidate, decision, resolvedConflicts: resolved, coreKnowledgeWritten: false };
      } finally {
        kernel.close();
      }
    });
  }
  async refreshEvidence(input) {
    const parsed = evidenceRefreshSchema.parse(input);
    return exclusive2(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        const prior = kernel.getObject(parsed.priorEvidenceId);
        if (!prior || prior.kind !== "ARTIFACT" || prior.data.artifactType !== "SEARCH_EVIDENCE") throw new Error(`SEARCH_EVIDENCE_NOT_FOUND:${parsed.priorEvidenceId}`);
        if (prior.data.sourceVersion === parsed.sourceVersion) {
          if (prior.data.contentSha256 !== parsed.contentSha256) throw new Error(`EVIDENCE_VERSION_COLLISION:${parsed.sourceVersion}`);
          return { evidence: prior, invalidatedCandidates: [], invalidatedDownstream: [], deduplicated: true };
        }
        const projectId = String(prior.data.projectId);
        const providerId = String(prior.data.providerId);
        const sourceUrl = String(prior.data.sourceUrl);
        const computedContentSha256 = sha256Json({ url: sourceUrl, title: parsed.title, snippet: parsed.snippet });
        if (computedContentSha256 !== parsed.contentSha256) throw new Error("EVIDENCE_CONTENT_HASH_MISMATCH");
        const evidenceId = stableUuidFromKey(`SEARCH_EVIDENCE:${projectId}:${providerId}:${sourceUrl}:${parsed.sourceVersion}`);
        const existing = kernel.getObject(evidenceId);
        if (existing && (existing.kind !== "ARTIFACT" || existing.data.contentSha256 !== parsed.contentSha256)) throw new Error(`EVIDENCE_VERSION_COLLISION:${evidenceId}`);
        const evidence = existing ?? kernel.createObject({
          schemaVersion: SCHEMA_VERSION,
          id: evidenceId,
          kind: "ARTIFACT",
          state: "COMPLETED",
          title: parsed.title,
          data: {
            ...prior.data,
            sourceVersion: parsed.sourceVersion,
            contentSha256: parsed.contentSha256,
            title: parsed.title,
            snippet: parsed.snippet,
            observedAt: parsed.observedAt,
            supersedesEvidenceId: prior.id,
            sourceBacklink: sourceUrl
          }
        }, `evidence-refresh:${evidenceId}`);
        const invalidatedCandidates = [];
        const downstreamIds = /* @__PURE__ */ new Set();
        for (const found of kernel.listObjects("KNOWLEDGE_CANDIDATE")) {
          if (!candidateEvidenceIds(found).includes(prior.id)) continue;
          const markers = Array.isArray(found.data.invalidatedByEvidenceIds) ? found.data.invalidatedByEvidenceIds.filter((item) => typeof item === "string") : [];
          let candidate = found;
          if (!markers.includes(evidence.id)) {
            candidate = kernel.updateObject(found.id, { data: { ...found.data, approvalStatus: "STALE", validity: "STALE", invalidatedAt: parsed.observedAt, invalidatedByEvidenceIds: [...markers, evidence.id].sort(), replacementEvidenceId: evidence.id } }, found.version, `${parsed.idempotencyKey}:candidate:${found.id}`);
            kernel.appendEvent({ schemaVersion: SCHEMA_VERSION, eventId: crypto.randomUUID(), idempotencyKey: `${parsed.idempotencyKey}:candidate-event:${found.id}`, eventType: "KNOWLEDGE_CANDIDATE_INVALIDATED", objectId: found.id, actor: this.actor, timestamp: parsed.observedAt, payload: { priorEvidenceId: prior.id, replacementEvidenceId: evidence.id, sourceVersion: parsed.sourceVersion } });
          }
          invalidatedCandidates.push(candidate);
          for (const downstreamId of candidateDownstreamIds(candidate)) downstreamIds.add(downstreamId);
        }
        const invalidatedDownstream = [];
        for (const downstreamId of [...downstreamIds].sort()) {
          const found = kernel.getObject(downstreamId);
          if (!found) throw new Error(`DOWNSTREAM_OBJECT_NOT_FOUND:${downstreamId}`);
          const records = Array.isArray(found.data.knowledgeInvalidations) ? found.data.knowledgeInvalidations.filter((item) => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];
          const already = records.some((item) => item.replacementEvidenceId === evidence.id);
          const updated = already ? found : kernel.updateObject(found.id, { data: { ...found.data, knowledgeValidity: "INVALIDATED", knowledgeInvalidations: [...records, { priorEvidenceId: prior.id, replacementEvidenceId: evidence.id, sourceVersion: parsed.sourceVersion, invalidatedAt: parsed.observedAt }] } }, found.version, `${parsed.idempotencyKey}:downstream:${found.id}`);
          if (!already) kernel.appendEvent({ schemaVersion: SCHEMA_VERSION, eventId: crypto.randomUUID(), idempotencyKey: `${parsed.idempotencyKey}:downstream-event:${found.id}`, eventType: "KNOWLEDGE_DEPENDENCY_INVALIDATED", objectId: found.id, actor: this.actor, timestamp: parsed.observedAt, payload: { priorEvidenceId: prior.id, replacementEvidenceId: evidence.id, sourceVersion: parsed.sourceVersion } });
          invalidatedDownstream.push(updated);
        }
        return { evidence, invalidatedCandidates, invalidatedDownstream, deduplicated: Boolean(existing) };
      } finally {
        kernel.close();
      }
    });
  }
  async projection(projectId) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: `${this.actor}-projection`, role: "VIEWER", readOnly: true });
    try {
      const inProject = (item) => !projectId || item.data.projectId === projectId;
      const all = kernel.listObjects();
      return {
        searchOperations: all.filter((item) => item.kind === "OPERATION" && item.data.operationType === "SEARCH" && inProject(item)),
        evidence: all.filter((item) => item.kind === "ARTIFACT" && item.data.artifactType === "SEARCH_EVIDENCE" && inProject(item)),
        candidates: all.filter((item) => item.kind === "KNOWLEDGE_CANDIDATE" && inProject(item)),
        invalidatedDownstream: all.filter((item) => item.data.knowledgeValidity === "INVALIDATED" && inProject(item))
      };
    } finally {
      kernel.close();
    }
  }
};

// packages/official-info/src/index.ts
import crypto9 from "node:crypto";
import fs8 from "node:fs";
import path10 from "node:path";
var officialSourceKinds = ["EMAIL_EXPORT", "ENTERPRISE_MESSAGE_EXPORT"];
var officialConsentScopes = ["HEADERS", "CONTENT"];
var officialConsentStatuses = ["ACTIVE", "REVOKED", "DELETED"];
var officialInformationDecisions = ["APPROVE", "REJECT"];
var idempotencyKey = external_exports.string().trim().min(8).max(120);
var scopeList = external_exports.array(external_exports.enum(officialConsentScopes)).min(1).max(2).transform((items) => [...new Set(items)].sort()).refine((items) => items.includes("HEADERS"), "HEADERS_SCOPE_REQUIRED");
var officialConsentCreateSchema = external_exports.object({
  projectId: external_exports.string().uuid(),
  sourceKind: external_exports.enum(officialSourceKinds),
  scopes: scopeList,
  idempotencyKey
});
var officialConsentRestrictSchema = external_exports.object({
  consentId: external_exports.string().uuid(),
  scopes: scopeList,
  expectedVersion: external_exports.number().int().positive(),
  idempotencyKey
});
var officialConsentCloseSchema = external_exports.object({
  consentId: external_exports.string().uuid(),
  action: external_exports.enum(["REVOKE", "DELETE"]),
  reason: external_exports.string().trim().min(1).max(1e3),
  expectedVersion: external_exports.number().int().positive(),
  idempotencyKey
});
var officialMessageSchema = external_exports.object({
  sourceMessageId: external_exports.string().trim().min(1).max(500),
  sourceThreadId: external_exports.string().trim().min(1).max(500).nullable().default(null),
  occurredAt: external_exports.string().datetime(),
  from: external_exports.string().trim().min(1).max(1e3),
  to: external_exports.array(external_exports.string().trim().min(1).max(1e3)).max(200).default([]),
  cc: external_exports.array(external_exports.string().trim().min(1).max(1e3)).max(200).default([]),
  subject: external_exports.string().max(4e3).default(""),
  body: external_exports.string().max(1e5).default(""),
  labels: external_exports.array(external_exports.string().trim().min(1).max(200)).max(100).default([])
}).strict();
var officialImportPackageSchema = external_exports.object({
  schemaVersion: external_exports.literal(1),
  sourceKind: external_exports.enum(officialSourceKinds),
  exportedAt: external_exports.string().datetime(),
  messages: external_exports.array(officialMessageSchema).min(1).max(100)
}).strict();
var importEnvelopeSchema = external_exports.object({
  consentId: external_exports.string().uuid(),
  package: external_exports.unknown(),
  idempotencyKey
});
var officialImportFileSchema = external_exports.object({
  consentId: external_exports.string().uuid(),
  filePath: external_exports.string().min(1),
  allowedImportRoot: external_exports.string().min(1),
  idempotencyKey
});
var OPTIONAL_CONNECTOR_STATUS = "BLOCKED_OPTIONAL_CONNECTOR_EXTERNAL_AUTHORIZATION_ABSENT";
var queues3 = /* @__PURE__ */ new Map();
async function exclusive3(key, operation) {
  const prior = queues3.get(key) ?? Promise.resolve();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const current = prior.then(() => gate);
  queues3.set(key, current);
  await prior;
  try {
    return await operation();
  } finally {
    release();
    if (queues3.get(key) === current) queues3.delete(key);
  }
}
function consentData(consent) {
  if (consent.kind !== "ARTIFACT" || consent.data.artifactType !== "OFFICIAL_IMPORT_CONSENT") throw new Error(`OFFICIAL_CONSENT_NOT_FOUND:${consent.id}`);
  const parsed = external_exports.object({
    projectId: external_exports.string().uuid(),
    sourceKind: external_exports.enum(officialSourceKinds),
    scopes: external_exports.array(external_exports.enum(officialConsentScopes)),
    consentStatus: external_exports.enum(officialConsentStatuses)
  }).parse(consent.data);
  return parsed;
}
function findAudit(kernel, key) {
  return kernel.listEvents().find((event) => event.idempotencyKey === key);
}
function appendAudit(kernel, input, actor) {
  return kernel.appendEvent({
    schemaVersion: SCHEMA_VERSION,
    eventId: crypto9.randomUUID(),
    idempotencyKey: input.key,
    eventType: input.type,
    objectId: input.objectId,
    actor,
    timestamp: input.timestamp ?? (/* @__PURE__ */ new Date()).toISOString(),
    payload: input.payload
  });
}
function redactText(value) {
  return value.replace(/\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{8,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{20,})\b/g, "[REDACTED_SECRET]").replace(/\bBearer\s+[A-Za-z0-9._~+\/-]{8,}/gi, "Bearer [REDACTED_SECRET]").replace(/\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret)\s*[:=]\s*[A-Za-z0-9._~+\/-]{8,}/gi, "[REDACTED_SECRET]").replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]").replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[REDACTED_PHONE]").replace(/\b\d{15,18}[0-9Xx]?\b/g, "[REDACTED_ID]");
}
function refusalCode(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.startsWith("OFFICIAL_IMPORT_")) return message.split(":", 1)[0];
  if (message.startsWith("MESSAGE_VERSION_CONFLICT")) return "MESSAGE_VERSION_CONFLICT";
  if (error instanceof SyntaxError) return "OFFICIAL_IMPORT_JSON_INVALID";
  return "OFFICIAL_IMPORT_FILE_READ_FAILED";
}
function safeRelative3(realRoot, realFile) {
  const relative = path10.relative(realRoot, realFile);
  return relative !== "" && !relative.startsWith(`..${path10.sep}`) && relative !== ".." && !path10.isAbsolute(relative);
}
var OfficialInformationService = class {
  databasePath;
  actor;
  constructor(options) {
    if (!path10.isAbsolute(options.databasePath)) throw new Error("ABSOLUTE_PATH_REQUIRED:databasePath");
    this.databasePath = path10.normalize(options.databasePath);
    this.actor = options.actor?.trim() || "codex-official-info";
  }
  async createConsent(input) {
    const parsed = officialConsentCreateSchema.parse(input);
    return exclusive3(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        const project = kernel.getObject(parsed.projectId);
        if (!project || project.kind !== "PROJECT") throw new Error(`PROJECT_NOT_FOUND:${parsed.projectId}`);
        const consentId = stableUuidFromKey(`OFFICIAL_IMPORT_CONSENT:${parsed.projectId}:${parsed.sourceKind}:${parsed.idempotencyKey}`);
        const consent = kernel.createObject({
          schemaVersion: SCHEMA_VERSION,
          id: consentId,
          kind: "ARTIFACT",
          state: "ACTIVE",
          title: `User-provided ${parsed.sourceKind} consent`,
          data: {
            artifactType: "OFFICIAL_IMPORT_CONSENT",
            projectId: parsed.projectId,
            sourceKind: parsed.sourceKind,
            scopes: parsed.scopes,
            consentStatus: "ACTIVE",
            authorizationMode: "USER_PROVIDED_EXPORT",
            credentialRef: null,
            connectorCalls: 0
          }
        }, `official-consent:${consentId}`);
        appendAudit(kernel, { key: `${parsed.idempotencyKey}:grant-audit`, type: "OFFICIAL_IMPORT_CONSENT_GRANTED", objectId: consent.id, payload: { projectId: parsed.projectId, sourceKind: parsed.sourceKind, scopes: parsed.scopes, authorizationMode: "USER_PROVIDED_EXPORT" } }, this.actor);
        return consent;
      } finally {
        kernel.close();
      }
    });
  }
  async restrictConsent(input) {
    const parsed = officialConsentRestrictSchema.parse(input);
    return exclusive3(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        let consent = kernel.getObject(parsed.consentId);
        if (!consent) throw new Error(`OFFICIAL_CONSENT_NOT_FOUND:${parsed.consentId}`);
        const data = consentData(consent);
        if (data.consentStatus !== "ACTIVE") throw new Error(`OFFICIAL_CONSENT_INACTIVE:${data.consentStatus}`);
        if (parsed.scopes.some((scope) => !data.scopes.includes(scope))) throw new Error("CONSENT_SCOPE_EXPANSION_DENIED");
        const auditKey = `${parsed.idempotencyKey}:restrict-audit`;
        const prior = findAudit(kernel, auditKey);
        if (prior) {
          if (prior.objectId !== consent.id || sha256Json(prior.payload.scopes) !== sha256Json(parsed.scopes)) throw new Error(`IDEMPOTENCY_CONFLICT:${parsed.idempotencyKey}`);
          return consent;
        }
        consent = kernel.updateObject(consent.id, { data: { ...consent.data, scopes: parsed.scopes, scopeReducedAt: (/* @__PURE__ */ new Date()).toISOString() } }, parsed.expectedVersion, `${parsed.idempotencyKey}:restrict`);
        appendAudit(kernel, { key: auditKey, type: "OFFICIAL_IMPORT_CONSENT_RESTRICTED", objectId: consent.id, payload: { scopes: parsed.scopes } }, this.actor);
        return consent;
      } finally {
        kernel.close();
      }
    });
  }
  async closeConsent(input) {
    const parsed = officialConsentCloseSchema.parse(input);
    return exclusive3(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        let consent = kernel.getObject(parsed.consentId);
        if (!consent) throw new Error(`OFFICIAL_CONSENT_NOT_FOUND:${parsed.consentId}`);
        const data = consentData(consent);
        const nextStatus = parsed.action === "REVOKE" ? "REVOKED" : "DELETED";
        if (data.consentStatus !== "ACTIVE") {
          if (data.consentStatus !== nextStatus) throw new Error(`OFFICIAL_CONSENT_ALREADY_CLOSED:${data.consentStatus}`);
          return consent;
        }
        const auditKey = `${parsed.idempotencyKey}:close-audit`;
        const prior = findAudit(kernel, auditKey);
        if (prior) return consent;
        consent = kernel.updateObject(consent.id, { data: { ...consent.data, consentStatus: nextStatus, closedAction: parsed.action, closedReason: redactText(parsed.reason), closedAt: (/* @__PURE__ */ new Date()).toISOString() } }, parsed.expectedVersion, `${parsed.idempotencyKey}:close`);
        appendAudit(kernel, { key: auditKey, type: `OFFICIAL_IMPORT_CONSENT_${nextStatus}`, objectId: consent.id, payload: { action: parsed.action, status: nextStatus } }, this.actor);
        return consent;
      } finally {
        kernel.close();
      }
    });
  }
  async importPackage(input) {
    const envelope = importEnvelopeSchema.parse(input);
    return exclusive3(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        return this.importLocked(kernel, envelope.consentId, envelope.package, envelope.idempotencyKey);
      } finally {
        kernel.close();
      }
    });
  }
  async importFile(input) {
    const parsed = officialImportFileSchema.parse(input);
    if (!path10.isAbsolute(parsed.filePath)) throw new Error("ABSOLUTE_PATH_REQUIRED:filePath");
    if (!path10.isAbsolute(parsed.allowedImportRoot)) throw new Error("ABSOLUTE_PATH_REQUIRED:allowedImportRoot");
    return exclusive3(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        this.assertConsentActive(kernel, parsed.consentId, parsed.idempotencyKey);
        let raw;
        try {
          const rootLstat = fs8.lstatSync(parsed.allowedImportRoot);
          const fileLstat = fs8.lstatSync(parsed.filePath);
          if (rootLstat.isSymbolicLink() || fileLstat.isSymbolicLink()) throw new Error("OFFICIAL_IMPORT_SYMLINK_FORBIDDEN");
          if (!rootLstat.isDirectory() || !fileLstat.isFile()) throw new Error("OFFICIAL_IMPORT_REGULAR_FILE_REQUIRED");
          const realRoot = fs8.realpathSync(parsed.allowedImportRoot);
          const realFile = fs8.realpathSync(parsed.filePath);
          if (!safeRelative3(realRoot, realFile)) throw new Error("OFFICIAL_IMPORT_PATH_OUTSIDE_ALLOWED_ROOT");
          if (fs8.statSync(realFile).size > 5e6) throw new Error("OFFICIAL_IMPORT_FILE_TOO_LARGE");
          raw = JSON.parse(fs8.readFileSync(realFile, "utf8"));
        } catch (error) {
          appendAudit(kernel, {
            key: `${parsed.idempotencyKey}:denied-file`,
            type: "OFFICIAL_IMPORT_DENIED",
            objectId: parsed.consentId,
            payload: { reason: refusalCode(error) }
          }, this.actor);
          throw error;
        }
        return this.importLocked(kernel, parsed.consentId, raw, parsed.idempotencyKey);
      } finally {
        kernel.close();
      }
    });
  }
  assertConsentActive(kernel, consentId, attemptKey) {
    const consent = kernel.getObject(consentId);
    if (!consent) throw new Error(`OFFICIAL_CONSENT_NOT_FOUND:${consentId}`);
    const data = consentData(consent);
    if (data.consentStatus !== "ACTIVE") {
      appendAudit(kernel, { key: `${attemptKey}:denied-inactive`, type: "OFFICIAL_IMPORT_DENIED", objectId: consent.id, payload: { reason: `CONSENT_${data.consentStatus}`, consentStatus: data.consentStatus } }, this.actor);
      throw new Error(`OFFICIAL_CONSENT_INACTIVE:${data.consentStatus}`);
    }
    return { consent, data };
  }
  importLocked(kernel, consentId, packageValue, attemptKey) {
    const { consent, data } = this.assertConsentActive(kernel, consentId, attemptKey);
    const parsed = officialImportPackageSchema.parse(packageValue);
    if (parsed.sourceKind !== data.sourceKind) {
      appendAudit(kernel, { key: `${attemptKey}:denied-source`, type: "OFFICIAL_IMPORT_DENIED", objectId: consent.id, payload: { reason: "SOURCE_KIND_MISMATCH" } }, this.actor);
      throw new Error(`OFFICIAL_IMPORT_SOURCE_MISMATCH:${data.sourceKind}:${parsed.sourceKind}`);
    }
    if (!data.scopes.includes("HEADERS")) throw new Error("OFFICIAL_IMPORT_SCOPE_DENIED:HEADERS");
    if (parsed.messages.some((message) => message.body.length > 0) && !data.scopes.includes("CONTENT")) {
      appendAudit(kernel, { key: `${attemptKey}:denied-content`, type: "OFFICIAL_IMPORT_DENIED", objectId: consent.id, payload: { reason: "CONTENT_SCOPE_DENIED" } }, this.actor);
      throw new Error("OFFICIAL_IMPORT_SCOPE_DENIED:CONTENT");
    }
    const packageSha256 = sha256Json(parsed);
    const prepared = parsed.messages.map((message) => {
      const sourceMessageIdHash = sha256Json({ sourceMessageId: message.sourceMessageId });
      const candidateId = stableUuidFromKey(`OFFICIAL_INFO_CANDIDATE:${data.projectId}:${data.sourceKind}:${sourceMessageIdHash}`);
      const rawContentSha256 = sha256Json(message);
      return { message, sourceMessageIdHash, candidateId, rawContentSha256 };
    });
    const candidateIds = prepared.map((item) => item.candidateId).sort();
    const importAuditKey = `${attemptKey}:import-audit`;
    const priorImport = findAudit(kernel, importAuditKey);
    if (priorImport) {
      if (priorImport.objectId !== consent.id || priorImport.payload.packageSha256 !== packageSha256 || sha256Json(priorImport.payload.candidateIds) !== sha256Json(candidateIds)) {
        throw new Error(`IDEMPOTENCY_CONFLICT:${attemptKey}`);
      }
      const priorCandidates = candidateIds.map((candidateId) => kernel.getObject(candidateId));
      if (priorCandidates.some((candidate) => !candidate || candidate.kind !== "OFFICIAL_INFO_CANDIDATE")) throw new Error(`OFFICIAL_IMPORT_REPLAY_STATE_MISSING:${attemptKey}`);
      return {
        consent,
        candidates: priorCandidates,
        candidateIds,
        packageSha256,
        deduplicated: true,
        optionalConnectorStatus: OPTIONAL_CONNECTOR_STATUS
      };
    }
    for (const item of prepared) {
      const existing = kernel.getObject(item.candidateId);
      if (existing && (existing.kind !== "OFFICIAL_INFO_CANDIDATE" || existing.data.rawContentSha256 !== item.rawContentSha256)) {
        appendAudit(kernel, {
          key: `${attemptKey}:denied-version`,
          type: "OFFICIAL_IMPORT_DENIED",
          objectId: consent.id,
          payload: { reason: "MESSAGE_VERSION_CONFLICT", sourceMessageIdHash: item.sourceMessageIdHash }
        }, this.actor);
        throw new Error(`MESSAGE_VERSION_CONFLICT:${item.sourceMessageIdHash}`);
      }
    }
    const candidates = [];
    let allExisting = true;
    for (const { message, sourceMessageIdHash, candidateId, rawContentSha256 } of prepared) {
      const existing = kernel.getObject(candidateId);
      if (existing) {
        candidates.push(existing);
        continue;
      }
      allExisting = false;
      const redactedSubject = redactText(message.subject).trim();
      const candidate = kernel.createObject({
        schemaVersion: SCHEMA_VERSION,
        id: candidateId,
        kind: "OFFICIAL_INFO_CANDIDATE",
        state: "DRAFT",
        title: (redactedSubject || "Imported official message").slice(0, 240),
        data: {
          projectId: data.projectId,
          sourceKind: data.sourceKind,
          sourceMessageIdHash,
          sourceThreadIdHash: message.sourceThreadId ? sha256Json({ sourceThreadId: message.sourceThreadId }) : null,
          packageSha256,
          rawContentSha256,
          occurredAt: message.occurredAt,
          exportedAt: parsed.exportedAt,
          from: redactText(message.from),
          to: message.to.map(redactText),
          cc: message.cc.map(redactText),
          subject: redactedSubject,
          body: redactText(message.body),
          labels: message.labels.map(redactText),
          approvalStatus: "PENDING",
          decision: null,
          taskWritten: false,
          todoWritten: false,
          knowledgeWritten: false,
          remoteSystemWritten: false
        }
      }, `official-message:${candidateId}`);
      candidates.push(candidate);
    }
    appendAudit(kernel, { key: importAuditKey, type: "OFFICIAL_INFORMATION_PACKAGE_IMPORTED", objectId: consent.id, timestamp: parsed.exportedAt, payload: { projectId: data.projectId, sourceKind: data.sourceKind, packageSha256, candidateIds, messageCount: parsed.messages.length, rawSensitiveValuesStored: false } }, this.actor);
    return { consent, candidates, candidateIds, packageSha256, deduplicated: allExisting, optionalConnectorStatus: OPTIONAL_CONNECTOR_STATUS };
  }
  async decideCandidate(candidateId, decision, idempotencyKeyValue) {
    if (!external_exports.string().uuid().safeParse(candidateId).success) throw new Error("OFFICIAL_INFO_CANDIDATE_ID_INVALID");
    const key = idempotencyKey.parse(idempotencyKeyValue);
    if (!officialInformationDecisions.includes(decision)) throw new Error(`OFFICIAL_INFO_DECISION_INVALID:${decision}`);
    return exclusive3(this.databasePath, async () => {
      const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: this.actor, role: "OPERATOR" });
      try {
        let candidate = kernel.getObject(candidateId);
        if (!candidate || candidate.kind !== "OFFICIAL_INFO_CANDIDATE") throw new Error(`OFFICIAL_INFO_CANDIDATE_NOT_FOUND:${candidateId}`);
        const priorDecision = candidate.data.decision;
        if (priorDecision && priorDecision !== decision) throw new Error(`OFFICIAL_INFO_DECISION_CONFLICT:${String(priorDecision)}:${decision}`);
        if (!priorDecision) {
          candidate = kernel.updateObject(candidate.id, { data: { ...candidate.data, decision, approvalStatus: decision === "APPROVE" ? "APPROVED" : "REJECTED", decidedAt: (/* @__PURE__ */ new Date()).toISOString(), taskWritten: false, todoWritten: false, knowledgeWritten: false, remoteSystemWritten: false } }, candidate.version, `${key}:decision`);
        }
        if (decision === "REJECT" && candidate.state === "DRAFT") candidate = kernel.transitionObject(candidate.id, "FAILED", candidate.version, `${key}:rejected`);
        if (decision === "APPROVE") {
          if (candidate.state === "DRAFT") candidate = kernel.transitionObject(candidate.id, "ACTIVE", candidate.version, `${key}:active`);
          if (candidate.state === "ACTIVE") candidate = kernel.transitionObject(candidate.id, "VERIFYING", candidate.version, `${key}:verifying`);
          if (candidate.state === "VERIFYING") candidate = kernel.transitionObject(candidate.id, "COMPLETED", candidate.version, `${key}:approved`);
        }
        appendAudit(kernel, { key: `${key}:decision-audit`, type: "OFFICIAL_INFO_CANDIDATE_DECIDED", objectId: candidate.id, payload: { decision, approvalStatus: candidate.data.approvalStatus, downstreamWrites: 0 } }, this.actor);
        return candidate;
      } finally {
        kernel.close();
      }
    });
  }
  async projection(projectId) {
    const kernel = await ControlKernel.open({ databasePath: this.databasePath, actor: `${this.actor}-projection`, role: "VIEWER", readOnly: true });
    try {
      const inProject = (item) => !projectId || item.data.projectId === projectId;
      const all = kernel.listObjects();
      const consents = all.filter((item) => item.kind === "ARTIFACT" && item.data.artifactType === "OFFICIAL_IMPORT_CONSENT" && inProject(item));
      const candidates = all.filter((item) => item.kind === "OFFICIAL_INFO_CANDIDATE" && inProject(item));
      const objectIds = new Set([...consents, ...candidates].map((item) => item.id));
      return {
        consents,
        candidates,
        auditEvents: kernel.listEvents().filter((event) => event.eventType.startsWith("OFFICIAL_") && (!projectId || event.objectId !== null && objectIds.has(event.objectId))),
        optionalConnectorStatus: OPTIONAL_CONNECTOR_STATUS
      };
    } finally {
      kernel.close();
    }
  }
};

// packages/cli/src/index.ts
var commands = [
  "init",
  "status",
  "projects",
  "events",
  "project-create",
  "project-transition",
  "project-bootstrap",
  "project-enter",
  "project-return",
  "project-complete",
  "project-archive",
  "project-restore",
  "operations",
  "candidates",
  "work-items",
  "candidate-submit",
  "candidate-decide",
  "project-brief-show",
  "project-brief-quote-show",
  "project-brief-record",
  "context-publish",
  "context-current",
  "project-recover-task",
  "project-backup",
  "project-restore-backup",
  "long-task-create",
  "long-task-run",
  "long-task-resume",
  "long-task-status",
  "long-task-takeover",
  "search-run",
  "knowledge-submit",
  "knowledge-decide",
  "evidence-refresh",
  "knowledge-projection",
  "official-consent-create",
  "official-consent-restrict",
  "official-consent-close",
  "official-import-file",
  "official-info-decide",
  "official-info-projection",
  "serve"
];
var usage = "init|status|projects|events|project-create|project-transition|project-bootstrap|project-enter|project-return|project-complete|project-delete|operations|candidates|work-items|candidate-submit|candidate-decide|project-brief-show|project-brief-quote-show|project-brief-record|context-publish|context-current|project-recover-task|project-backup|project-restore-backup|long-task-create|long-task-run|long-task-resume|long-task-status|long-task-takeover|search-run|knowledge-submit|knowledge-decide|evidence-refresh|knowledge-projection|official-consent-create|official-consent-restrict|official-consent-close|official-import-file|official-info-decide|official-info-projection|serve [--db <absolute-path>] [command options]";
function parseFlags(argv) {
  const [command, ...rest] = argv;
  const flags = /* @__PURE__ */ new Map();
  const positional = [];
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`FLAG_VALUE_REQUIRED:${token}`);
    if (flags.has(token)) throw new Error(`FLAG_DUPLICATE:${token}`);
    flags.set(token, value);
    index += 1;
  }
  return { command, flags, positional };
}
function flag(flags, name, required = false) {
  const value = flags.get(name)?.trim();
  if (required && !value) throw new Error(`FLAG_REQUIRED:${name}`);
  return value;
}
function databaseFrom(parsed, env) {
  const explicit = flag(parsed.flags, "--db") ?? (parsed.positional.length === 1 ? parsed.positional[0] : void 0);
  if (parsed.positional.length > 1) throw new Error("TOO_MANY_POSITIONAL_ARGUMENTS");
  if (explicit) {
    if (!path11.isAbsolute(explicit)) throw new Error("ABSOLUTE_PATH_REQUIRED:databasePath");
    return path11.normalize(explicit);
  }
  return resolveDatabasePath(env);
}
function absoluteFlag(parsed, env, flagName, envName, fallback) {
  const value = flag(parsed.flags, flagName) ?? env[envName]?.trim() ?? fallback;
  if (!value) throw new Error(`FLAG_OR_ENV_REQUIRED:${flagName}:${envName}`);
  if (!path11.isAbsolute(value)) throw new Error(`ABSOLUTE_PATH_REQUIRED:${flagName}`);
  return path11.normalize(value);
}
function lifecycleFrom(parsed, env, databasePath, options) {
  const projectsRoot = absoluteFlag(parsed, env, "--projects-root", "CODEX_WORK_PLATFORM_PROJECTS_ROOT", path11.join(path11.dirname(databasePath), "projects"));
  const taskPort = options.taskPort ?? (() => {
    const codexHome = absoluteFlag(parsed, env, "--codex-home", "CODEX_WORK_PLATFORM_TASK_CODEX_HOME", env.CODEX_HOME?.trim());
    const codexBin = flag(parsed.flags, "--codex-bin") ?? env.CODEX_WORK_PLATFORM_CODEX_BIN?.trim() ?? "codex";
    return new AppServerTaskAdapter({ codexHome, codexBin, allowActiveCodexHome: true });
  })();
  return new ProjectLifecycleService({ databasePath, projectsRoot, taskPort, actor: "codex-cli-lifecycle" });
}
function contextFrom(parsed, env, databasePath, options) {
  const projectsRoot = absoluteFlag(parsed, env, "--projects-root", "CODEX_WORK_PLATFORM_PROJECTS_ROOT", path11.join(path11.dirname(databasePath), "projects"));
  const taskPort = options.taskPort ?? (() => {
    const codexHome = absoluteFlag(parsed, env, "--codex-home", "CODEX_WORK_PLATFORM_TASK_CODEX_HOME", env.CODEX_HOME?.trim());
    const codexBin = flag(parsed.flags, "--codex-bin") ?? env.CODEX_WORK_PLATFORM_CODEX_BIN?.trim() ?? "codex";
    return new AppServerTaskAdapter({ codexHome, codexBin, allowActiveCodexHome: true });
  })();
  return new ContextPackService({ databasePath, projectsRoot, taskPort, actor: "codex-cli-context" });
}
function longTaskFrom(parsed, env, databasePath, options) {
  const projectsRoot = absoluteFlag(parsed, env, "--projects-root", "CODEX_WORK_PLATFORM_PROJECTS_ROOT", path11.join(path11.dirname(databasePath), "projects"));
  return new LongTaskService({ databasePath, projectsRoot, executor: options.longTaskExecutor, clock: options.longTaskClock, actor: "codex-cli-long-task" });
}
function searchKnowledgeFrom(databasePath, options) {
  return new SearchKnowledgeService({ databasePath, provider: options.searchProvider, actor: "codex-cli-search-knowledge" });
}
function officialInformationFrom(databasePath) {
  return new OfficialInformationService({ databasePath, actor: "codex-cli-official-info" });
}
function projectBriefFrom(databasePath) {
  return new ProjectBriefService({ databasePath, actor: "codex-cli-project-brief" });
}
function commaList(value, name) {
  const items = (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) throw new Error(`FLAG_REQUIRED:${name}`);
  return items;
}
function lifecycleSummary(snapshot) {
  return {
    operationId: snapshot.operation.id,
    operationState: snapshot.operation.state,
    project: snapshot.project,
    task: snapshot.task,
    binding: snapshot.binding,
    contextPack: snapshot.contextPack,
    projectDirectory: snapshot.projectDirectory,
    codexThreadId: snapshot.codexThreadId,
    codexDeepLink: snapshot.codexDeepLink,
    contextPackPath: snapshot.contextPackPath,
    bindingPath: snapshot.bindingPath
  };
}
async function runCli(argv, write = (text) => process.stdout.write(text), env = process.env, options = {}) {
  try {
    const parsed = parseFlags(argv);
    const command = parsed.command;
    if (!command || command === "help" || command === "--help") {
      write(`${JSON.stringify({ ok: Boolean(command), code: command ? "HELP" : "USAGE", usage })}
`);
      return command ? 0 : 2;
    }
    if (!commands.includes(command)) {
      write(`${JSON.stringify({ ok: false, code: "COMMAND_UNKNOWN", command, usage })}
`);
      return 2;
    }
    const databasePath = databaseFrom(parsed, env);
    if (command === "serve") {
      const requestedPort = Number(flag(parsed.flags, "--port") ?? "0");
      if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) throw new Error("PORT_INVALID");
      const init = await ControlKernel.open({ databasePath, actor: "codex-cli-serve-init", role: "OPERATOR" });
      init.close();
      const page = await startControlPage({ databasePath, host: "127.0.0.1", port: requestedPort });
      write(`${JSON.stringify({ ok: true, command, databasePath, url: page.url, host: page.host, port: page.port, readOnly: true })}
`);
      return 0;
    }
    if (command === "status" || command === "projects" || command === "events") {
      const kernel2 = await ControlKernel.open({ databasePath, actor: `codex-cli-${command}`, role: "VIEWER", readOnly: true });
      try {
        const objects = command === "status" ? kernel2.listObjects() : [];
        const output = command === "status" ? {
          ok: true,
          command,
          databasePath,
          schemaVersion: SCHEMA_VERSION,
          objectCount: objects.length,
          projectCount: objects.filter((item) => item.kind === "PROJECT").length,
          eventCount: kernel2.listEvents().length,
          readOnly: true
        } : command === "projects" ? { ok: true, command, projects: kernel2.listObjects("PROJECT") } : { ok: true, command, events: kernel2.listEvents() };
        write(`${JSON.stringify(output)}
`);
        return 0;
      } finally {
        kernel2.close();
      }
    }
    if (["candidates", "work-items", "candidate-submit", "candidate-decide"].includes(command)) {
      const sync = new TaskSyncService({ databasePath, actor: "codex-cli-task-sync" });
      if (command === "candidates" || command === "work-items") {
        const projection = await sync.projection(flag(parsed.flags, "--project-id"));
        const payload = command === "candidates" ? { ok: true, command, candidates: projection.candidates } : { ok: true, command, tasks: projection.tasks, todos: projection.todos };
        write(`${JSON.stringify(payload)}
`);
        return 0;
      }
      if (command === "candidate-submit") {
        const due = flag(parsed.flags, "--due-at");
        const baseVersion = flag(parsed.flags, "--base-version");
        const input = {
          projectId: flag(parsed.flags, "--project-id", true),
          sourceKind: flag(parsed.flags, "--source-kind", true),
          sourceStreamId: flag(parsed.flags, "--source-stream-id", true),
          sourceKey: flag(parsed.flags, "--source-key"),
          sourceEventId: flag(parsed.flags, "--source-event-id", true),
          sourceVersion: Number(flag(parsed.flags, "--source-version", true)),
          occurredAt: flag(parsed.flags, "--occurred-at", true),
          targetKind: flag(parsed.flags, "--target-kind", true),
          operation: flag(parsed.flags, "--operation", true),
          targetId: flag(parsed.flags, "--target-id"),
          baseVersion: baseVersion === void 0 ? void 0 : Number(baseVersion),
          title: flag(parsed.flags, "--title"),
          dueAt: due === void 0 ? void 0 : due === "null" ? null : due,
          objective: flag(parsed.flags, "--objective") ?? void 0,
          completionCriteria: flag(parsed.flags, "--completion-criteria") ?? void 0,
          parentTaskId: flag(parsed.flags, "--parent-task-id") ?? void 0,
          order: flag(parsed.flags, "--order") === void 0 ? void 0 : Number(flag(parsed.flags, "--order")),
          nextState: flag(parsed.flags, "--next-state"),
          filePath: flag(parsed.flags, "--file-path"),
          fileSha256: flag(parsed.flags, "--file-sha256")
        };
        write(`${JSON.stringify({ ok: true, command, candidate: await sync.submitCandidate(input) })}
`);
        return 0;
      }
      const result = await sync.decideCandidate(
        flag(parsed.flags, "--candidate-id", true),
        flag(parsed.flags, "--decision", true),
        flag(parsed.flags, "--idempotency-key", true)
      );
      write(`${JSON.stringify({ ok: true, command, ...result })}
`);
      return 0;
    }
    if (command === "project-brief-show" || command === "project-brief-quote-show" || command === "project-brief-record") {
      const service = projectBriefFrom(databasePath);
      if (command === "project-brief-show" || command === "project-brief-quote-show") {
        if (parsed.flags.has("--include-quotes")) throw new Error("PROJECT_BRIEF_QUOTE_FLAG_UNSUPPORTED");
        const projectId = flag(parsed.flags, "--project-id", true);
        const limit = flag(parsed.flags, "--limit");
        const taskLimit = flag(parsed.flags, "--task-limit");
        const recordLimit = flag(parsed.flags, "--record-limit");
        const readOptions = {
          limit: limit === void 0 ? void 0 : Number(limit),
          cursor: flag(parsed.flags, "--cursor"),
          taskLimit: taskLimit === void 0 ? void 0 : Number(taskLimit),
          taskCursor: flag(parsed.flags, "--task-cursor"),
          recordLimit: recordLimit === void 0 ? void 0 : Number(recordLimit)
        };
        const brief = command === "project-brief-quote-show" ? await service.issueQuoteCapability(projectId, "CLI").then((capability) => service.read(projectId, { ...readOptions, quoteCapability: capability.token, quoteAudience: "CLI" })) : await service.read(projectId, readOptions);
        write(`${JSON.stringify({ ok: true, command, brief })}
`);
        return 0;
      }
      const inputPath = absoluteFlag(parsed, env, "--input", "CODEX_WORK_PLATFORM_PROJECT_BRIEF_INPUT");
      const batch = briefRecordBatchSchema.parse(JSON.parse(fs9.readFileSync(inputPath, "utf8")));
      const records = await service.record(batch);
      write(`${JSON.stringify({ ok: true, command, records })}
`);
      return 0;
    }
    if (["project-bootstrap", "project-enter", "project-return", "project-complete", "project-delete", "operations"].includes(command)) {
      const lifecycle = lifecycleFrom(parsed, env, databasePath, options);
      if (command === "operations") {
        write(`${JSON.stringify({ ok: true, command, operations: await lifecycle.listActionableOperations() })}
`);
        return 0;
      }
      if (command === "project-bootstrap") {
        const snapshot2 = await lifecycle.bootstrap({
          title: flag(parsed.flags, "--title", true),
          objective: flag(parsed.flags, "--objective"),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, lifecycle: lifecycleSummary(snapshot2) })}
`);
        return 0;
      }
      const projectId = flag(parsed.flags, "--project-id", true);
      if (command === "project-enter" || command === "project-return") {
        const snapshot2 = command === "project-enter" ? await lifecycle.enter(projectId) : await lifecycle.returnToProject(projectId);
        write(`${JSON.stringify({ ok: true, command, lifecycle: lifecycleSummary(snapshot2) })}
`);
        return 0;
      }
      const idempotencyKey2 = flag(parsed.flags, "--idempotency-key", true);
      if (command === "project-delete") {
        const deleted = await writeProject(databasePath, "DELETE", projectId, { idempotencyKey: idempotencyKey2 });
        write(`${JSON.stringify({ ok: true, command, deleted })}
`);
        return 0;
      }
      const snapshot = command === "project-complete" ? await lifecycle.complete(projectId, idempotencyKey2) : await lifecycle.restore(projectId, idempotencyKey2);
      write(`${JSON.stringify({ ok: true, command, lifecycle: lifecycleSummary(snapshot) })}
`);
      return 0;
    }
    if (["context-publish", "context-current", "project-recover-task", "project-backup", "project-restore-backup"].includes(command)) {
      const context = contextFrom(parsed, env, databasePath, options);
      if (command === "context-current") {
        const current = await context.current(flag(parsed.flags, "--project-id", true));
        write(`${JSON.stringify({ ok: true, command, current })}
`);
        return 0;
      }
      if (command === "context-publish") {
        const inputPath = absoluteFlag(parsed, env, "--input", "CODEX_WORK_PLATFORM_CONTEXT_INPUT");
        const content = contextPackContentSchema.parse(JSON.parse(fs9.readFileSync(inputPath, "utf8")));
        const published = await context.publish({
          projectId: flag(parsed.flags, "--project-id", true),
          baseVersion: Number(flag(parsed.flags, "--base-version", true)),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true),
          ...content
        });
        write(`${JSON.stringify({ ok: true, command, published })}
`);
        return 0;
      }
      if (command === "project-recover-task") {
        const recovered = await context.createRecoveryTask({
          projectId: flag(parsed.flags, "--project-id", true),
          contextPackId: flag(parsed.flags, "--context-pack-id"),
          title: flag(parsed.flags, "--title", true),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, recovered })}
`);
        return 0;
      }
      if (command === "project-backup") {
        const backup = await context.backup({
          projectId: flag(parsed.flags, "--project-id", true),
          backupRoot: absoluteFlag(parsed, env, "--backup-root", "CODEX_WORK_PLATFORM_BACKUP_ROOT"),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, backup })}
`);
        return 0;
      }
      const restored = await context.restoreBackup({
        manifestPath: absoluteFlag(parsed, env, "--manifest", "CODEX_WORK_PLATFORM_BACKUP_MANIFEST"),
        targetDatabasePath: absoluteFlag(parsed, env, "--target-db", "CODEX_WORK_PLATFORM_RESTORE_DB"),
        targetProjectsRoot: absoluteFlag(parsed, env, "--target-projects-root", "CODEX_WORK_PLATFORM_RESTORE_PROJECTS_ROOT"),
        idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
      });
      write(`${JSON.stringify({ ok: true, command, restored })}
`);
      return 0;
    }
    if (["long-task-create", "long-task-run", "long-task-resume", "long-task-status", "long-task-takeover"].includes(command)) {
      const longTask = longTaskFrom(parsed, env, databasePath, options);
      if (command === "long-task-create") {
        const inputPath = absoluteFlag(parsed, env, "--input", "CODEX_WORK_PLATFORM_LONG_TASK_INPUT");
        const plan = longTaskPlanSchema.parse(JSON.parse(fs9.readFileSync(inputPath, "utf8")));
        const snapshot2 = await longTask.create({
          projectId: flag(parsed.flags, "--project-id", true),
          taskId: flag(parsed.flags, "--task-id"),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true),
          title: plan.title,
          stages: plan.stages,
          policy: plan.policy
        });
        write(`${JSON.stringify({ ok: true, command, longTask: snapshot2 })}
`);
        return 0;
      }
      const operationId = flag(parsed.flags, "--operation-id", true);
      if (command === "long-task-status") {
        write(`${JSON.stringify({ ok: true, command, longTask: await longTask.status(operationId) })}
`);
        return 0;
      }
      if (command === "long-task-takeover") {
        const snapshot2 = await longTask.manualTakeover(
          operationId,
          flag(parsed.flags, "--owner-id", true),
          flag(parsed.flags, "--reason", true),
          flag(parsed.flags, "--idempotency-key", true)
        );
        write(`${JSON.stringify({ ok: true, command, longTask: snapshot2 })}
`);
        return 0;
      }
      const snapshot = await longTask.run({
        operationId,
        ownerId: flag(parsed.flags, "--owner-id", true),
        idempotencyKey: flag(parsed.flags, "--idempotency-key", true),
        acknowledgeWaiting: command === "long-task-resume"
      });
      write(`${JSON.stringify({ ok: true, command, longTask: snapshot })}
`);
      return 0;
    }
    if (["search-run", "knowledge-submit", "knowledge-decide", "evidence-refresh", "knowledge-projection"].includes(command)) {
      const service = searchKnowledgeFrom(databasePath, options);
      if (command === "knowledge-projection") {
        write(`${JSON.stringify({ ok: true, command, ...await service.projection(flag(parsed.flags, "--project-id")) })}
`);
        return 0;
      }
      if (command === "search-run") {
        const inputPath2 = absoluteFlag(parsed, env, "--input", "CODEX_WORK_PLATFORM_SEARCH_INPUT");
        const value2 = searchRequestSchema.parse({
          ...JSON.parse(fs9.readFileSync(inputPath2, "utf8")),
          projectId: flag(parsed.flags, "--project-id", true),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, search: await service.search(value2) })}
`);
        return 0;
      }
      if (command === "knowledge-submit") {
        const inputPath2 = absoluteFlag(parsed, env, "--input", "CODEX_WORK_PLATFORM_KNOWLEDGE_INPUT");
        const value2 = knowledgeCandidateInputSchema.parse({
          ...JSON.parse(fs9.readFileSync(inputPath2, "utf8")),
          projectId: flag(parsed.flags, "--project-id", true),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, candidate: await service.submitCandidate(value2) })}
`);
        return 0;
      }
      if (command === "knowledge-decide") {
        const conflicts = (flag(parsed.flags, "--resolved-conflict-ids") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
        const decision = await service.decideCandidate(
          flag(parsed.flags, "--candidate-id", true),
          flag(parsed.flags, "--decision", true),
          flag(parsed.flags, "--idempotency-key", true),
          conflicts
        );
        write(`${JSON.stringify({ ok: true, command, ...decision })}
`);
        return 0;
      }
      const inputPath = absoluteFlag(parsed, env, "--input", "CODEX_WORK_PLATFORM_EVIDENCE_REFRESH_INPUT");
      const value = evidenceRefreshSchema.parse({
        ...JSON.parse(fs9.readFileSync(inputPath, "utf8")),
        idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
      });
      write(`${JSON.stringify({ ok: true, command, refresh: await service.refreshEvidence(value) })}
`);
      return 0;
    }
    if (["official-consent-create", "official-consent-restrict", "official-consent-close", "official-import-file", "official-info-decide", "official-info-projection"].includes(command)) {
      const service = officialInformationFrom(databasePath);
      if (command === "official-info-projection") {
        write(`${JSON.stringify({ ok: true, command, ...await service.projection(flag(parsed.flags, "--project-id")) })}
`);
        return 0;
      }
      if (command === "official-consent-create") {
        const sourceKind = flag(parsed.flags, "--source-kind", true);
        if (!officialSourceKinds.includes(sourceKind)) throw new Error(`OFFICIAL_SOURCE_KIND_INVALID:${sourceKind}`);
        const scopes = commaList(flag(parsed.flags, "--scopes"), "--scopes");
        if (scopes.some((scope) => !officialConsentScopes.includes(scope))) throw new Error("OFFICIAL_CONSENT_SCOPE_INVALID");
        const consent = await service.createConsent({
          projectId: flag(parsed.flags, "--project-id", true),
          sourceKind,
          scopes,
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, consent })}
`);
        return 0;
      }
      if (command === "official-consent-restrict") {
        const scopes = commaList(flag(parsed.flags, "--scopes"), "--scopes");
        if (scopes.some((scope) => !officialConsentScopes.includes(scope))) throw new Error("OFFICIAL_CONSENT_SCOPE_INVALID");
        const consent = await service.restrictConsent({
          consentId: flag(parsed.flags, "--consent-id", true),
          scopes,
          expectedVersion: Number(flag(parsed.flags, "--expected-version", true)),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, consent })}
`);
        return 0;
      }
      if (command === "official-consent-close") {
        const action = flag(parsed.flags, "--action", true);
        if (action !== "REVOKE" && action !== "DELETE") throw new Error(`OFFICIAL_CONSENT_CLOSE_ACTION_INVALID:${action}`);
        const consent = await service.closeConsent({
          consentId: flag(parsed.flags, "--consent-id", true),
          action,
          reason: flag(parsed.flags, "--reason", true),
          expectedVersion: Number(flag(parsed.flags, "--expected-version", true)),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, consent })}
`);
        return 0;
      }
      if (command === "official-import-file") {
        const imported = await service.importFile({
          consentId: flag(parsed.flags, "--consent-id", true),
          filePath: absoluteFlag(parsed, env, "--input", "CODEX_WORK_PLATFORM_OFFICIAL_IMPORT_FILE"),
          allowedImportRoot: absoluteFlag(parsed, env, "--allowed-import-root", "CODEX_WORK_PLATFORM_OFFICIAL_IMPORT_ROOT"),
          idempotencyKey: flag(parsed.flags, "--idempotency-key", true)
        });
        write(`${JSON.stringify({ ok: true, command, imported })}
`);
        return 0;
      }
      const decision = flag(parsed.flags, "--decision", true);
      if (!officialInformationDecisions.includes(decision)) throw new Error(`OFFICIAL_INFO_DECISION_INVALID:${decision}`);
      const candidate = await service.decideCandidate(
        flag(parsed.flags, "--candidate-id", true),
        decision,
        flag(parsed.flags, "--idempotency-key", true)
      );
      write(`${JSON.stringify({ ok: true, command, candidate })}
`);
      return 0;
    }
    const kernel = await ControlKernel.open({ databasePath, actor: `codex-cli-${command}`, role: "OPERATOR" });
    try {
      if (command === "init") {
        const objects = kernel.listObjects();
        write(`${JSON.stringify({ ok: true, command, databasePath, objectCount: objects.length, projectCount: objects.filter((item) => item.kind === "PROJECT").length, eventCount: kernel.listEvents().length })}
`);
        return 0;
      }
      if (command === "project-create") {
        const title = flag(parsed.flags, "--title", true);
        const idempotencyKey3 = flag(parsed.flags, "--idempotency-key", true);
        if (idempotencyKey3.length < 8 || idempotencyKey3.length > 200) throw new Error("IDEMPOTENCY_KEY_LENGTH_INVALID");
        const objective = flag(parsed.flags, "--objective");
        const codexThreadId = flag(parsed.flags, "--codex-thread-id");
        const id = stableUuidFromKey(`PROJECT:${idempotencyKey3}`);
        const project2 = kernel.createObject({ schemaVersion: SCHEMA_VERSION, id, kind: "PROJECT", state: "DRAFT", title, data: { objective: objective ?? null, codexThreadId: codexThreadId ?? null } }, idempotencyKey3);
        write(`${JSON.stringify({ ok: true, command, project: project2 })}
`);
        return 0;
      }
      const projectId = flag(parsed.flags, "--project-id", true);
      const to = flag(parsed.flags, "--to", true);
      const expectedVersion = Number(flag(parsed.flags, "--expected-version", true));
      const idempotencyKey2 = flag(parsed.flags, "--idempotency-key", true);
      if (!entityStates.includes(to)) throw new Error(`STATE_INVALID:${to}`);
      if (!Number.isInteger(expectedVersion) || expectedVersion < 1) throw new Error("EXPECTED_VERSION_INVALID");
      if (idempotencyKey2.length < 8 || idempotencyKey2.length > 200) throw new Error("IDEMPOTENCY_KEY_LENGTH_INVALID");
      const project = kernel.transitionObject(projectId, to, expectedVersion, idempotencyKey2);
      write(`${JSON.stringify({ ok: true, command, project })}
`);
      return 0;
    } finally {
      kernel.close();
    }
  } catch (error) {
    write(`${JSON.stringify({ ok: false, code: "CLI_ERROR", detail: error instanceof Error ? error.message : String(error) })}
`);
    return 3;
  }
}

// packages/cli/src/main.ts
runCli(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}).catch((error) => {
  process.stderr.write(`codex-work-platform CLI failed: ${error instanceof Error ? error.message : String(error)}
`);
  process.exitCode = 1;
});
