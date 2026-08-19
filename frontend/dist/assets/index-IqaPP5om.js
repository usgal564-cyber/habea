(function () {
  var Ob = (t) => {
    throw TypeError(t);
  };
  var zb = (t, s, r) => s.has(t) || Ob("Cannot " + r);
  var rn = (t, s, r) => (
      zb(t, s, "read from private field"), r ? r.call(t) : s.get(t)
    ),
    Bb = (t, s, r) =>
      s.has(t)
        ? Ob("Cannot add the same private member more than once")
        : s instanceof WeakSet
        ? s.add(t)
        : s.set(t, r),
    Mm = (t, s, r, o) => (
      zb(t, s, "write to private field"),
      o ? o.call(t, r) : s.set(t, r),
      r
    );
  function HT(t, s) {
    for (var r = 0; r < s.length; r++) {
      const o = s[r];
      if (typeof o != "string" && !Array.isArray(o)) {
        for (const c in o)
          if (c !== "default" && !(c in t)) {
            const u = Object.getOwnPropertyDescriptor(o, c);
            u &&
              Object.defineProperty(
                t,
                c,
                u.get ? u : { enumerable: !0, get: () => o[c] }
              );
          }
      }
    }
    return Object.freeze(
      Object.defineProperty(t, Symbol.toStringTag, { value: "Module" })
    );
  }
  (function () {
    const s = document.createElement("link").relList;
    if (s && s.supports && s.supports("modulepreload")) return;
    for (const c of document.querySelectorAll('link[rel="modulepreload"]'))
      o(c);
    new MutationObserver((c) => {
      for (const u of c)
        if (u.type === "childList")
          for (const d of u.addedNodes)
            d.tagName === "LINK" && d.rel === "modulepreload" && o(d);
    }).observe(document, { childList: !0, subtree: !0 });
    function r(c) {
      const u = {};
      return (
        c.integrity && (u.integrity = c.integrity),
        c.referrerPolicy && (u.referrerPolicy = c.referrerPolicy),
        c.crossOrigin === "use-credentials"
          ? (u.credentials = "include")
          : c.crossOrigin === "anonymous"
          ? (u.credentials = "omit")
          : (u.credentials = "same-origin"),
        u
      );
    }
    function o(c) {
      if (c.ep) return;
      c.ep = !0;
      const u = r(c);
      fetch(c.href, u);
    }
  })();
  function hj(t) {
    return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default")
      ? t.default
      : t;
  }
  var Rm = { exports: {} },
    al = {};
  var Lb;
  function qT() {
    if (Lb) return al;
    Lb = 1;
    var t = Symbol.for("react.transitional.element"),
      s = Symbol.for("react.fragment");
    function r(o, c, u) {
      var d = null;
      if (u !== void 0 && (d = "" + u), c.key !== void 0 && (d = "" + c.key), "key" in c) {
        u = {};
        for (var m in c) m !== "key" && (u[m] = c[m]);
      } else u = c;
      return (
        (c = u.ref),
        {
          $$typeof: t,
          type: o,
          key: d,
          ref: c !== void 0 ? c : null,
          props: u
        }
      );
    }
    return (al.Fragment = s), (al.jsx = r), (al.jsxs = r), al;
  }
  var Vb;
  function IT() {
    return Vb || ((Vb = 1), (Rm.exports = qT())), Rm.exports;
  }
  var a = IT(),
    _m = { exports: {} },
    ze = {};
  var Pb;
  function $T() {
    if (Pb) return ze;
    Pb = 1;
    var t = Symbol.for("react.transitional.element"),
      s = Symbol.for("react.portal"),
      r = Symbol.for("react.fragment"),
      o = Symbol.for("react.strict_mode"),
      c = Symbol.for("react.profiler"),
      u = Symbol.for("react.consumer"),
      d = Symbol.for("react.context"),
      m = Symbol.for("react.forward_ref"),
      x = Symbol.for("react.suspense"),
      p = Symbol.for("react.memo"),
      v = Symbol.for("react.lazy"),
      g = Symbol.for("react.activity"),
      y = Symbol.iterator;
    function N(z) {
      return z === null || typeof z != "object"
        ? null
        : ((z = (y && z[y]) || z["@@iterator"]), typeof z == "function" ? z : null);
    }
    var C = {
        isMounted: function () {
          return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {}
      },
      A = Object.assign,
      T = {};
    function S(z, X, F) {
      (this.props = z), (this.context = X), (this.refs = T), (this.updater = F || C);
    }
    (S.prototype.isReactComponent = {}),
      (S.prototype.setState = function (z, X) {
        if (typeof z != "object" && typeof z != "function" && z != null)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, z, X, "setState");
      }),
      (S.prototype.forceUpdate = function (z) {
        this.updater.enqueueForceUpdate(this, z, "forceUpdate");
      });
    function M() {}
    M.prototype = S.prototype;
    function E(z, X, F) {
      (this.props = z), (this.context = X), (this.refs = T), (this.updater = F || C);
    }
    var w = (E.prototype = new M());
    (w.constructor = E), A(w, S.prototype), (w.isPureReactComponent = !0);
    var R = Array.isArray;
    function k() {}
    var O = { H: null, A: null, T: null, S: null },
      B = Object.prototype.hasOwnProperty;
    function Y(z, X, F) {
      var le = F.ref;
      return {
        $$typeof: t,
        type: z,
        key: X,
        ref: le !== void 0 ? le : null,
        props: F
      };
    }
    function K(z, X) {
      return Y(z.type, X, z.props);
    }
    function ue(z) {
      return typeof z == "object" && z !== null && z.$$typeof === t;
    }
    function ne(z) {
      var X = { "=": "=0", ":": "=2" };
      return (
        "$" +
        z.replace(/[=:]/g, function (F) {
          return X[F];
        })
      );
    }
    var ce = /\/+/g;
    function ae(z, X) {
      return typeof z == "object" && z !== null && z.key != null
        ? ne("" + z.key)
        : X.toString(36);
    }
    function Q(z) {
      switch (z.status) {
        case "fulfilled":
          return z.value;
        case "rejected":
          throw z.reason;
        default:
          switch (
            (typeof z.status == "string"
              ? z.then(k, k)
              : ((z.status = "pending"),
                z.then(
                  function (X) {
                    z.status === "pending" && ((z.status = "fulfilled"), (z.value = X));
                  },
                  function (X) {
                    z.status === "pending" && ((z.status = "rejected"), (z.reason = X));
                  }
                )),
            z.status)
          ) {
            case "fulfilled":
              return z.value;
            case "rejected":
              throw z.reason;
          }
      }
      throw z;
    }
    function _(z, X, F, le, J) {
      var de = typeof z;
      (de === "undefined" || de === "boolean") && (z = null);
      var Ne = !1;
      if (z === null) Ne = !0;
      else
        switch (de) {
          case "bigint":
          case "string":
          case "number":
            Ne = !0;
            break;
          case "object":
            switch (z.$$typeof) {
              case t:
              case s:
                Ne = !0;
                break;
              case v:
                return (Ne = z._init), _(Ne(z._payload), X, F, le, J);
            }
        }
      if (Ne)
        return (
          (J = J(z)),
          (Ne = le === "" ? "." + ae(z, 0) : le),
          R(J)
            ? ((F = ""),
              Ne != null && (F = Ne.replace(ce, "$&/") + "/"),
              _(J, X, F, "", function (Xe) {
                return Xe;
              }))
            : J != null &&
              (ue(J) &&
                (J = K(
                  J,
                  F +
                    (J.key == null || (z && z.key === J.key)
                      ? ""
                      : ("" + J.key).replace(ce, "$&/") + "/") +
                    Ne
                )),
              X.push(J)),
          1
        );
      Ne = 0;
      var fe = le === "" ? "." : le + ":";
      if (R(z))
        for (var pe = 0; pe < z.length; pe++)
          (le = z[pe]), (de = fe + ae(le, pe)), (Ne += _(le, X, F, de, J));
      else if (((pe = N(z)), typeof pe == "function"))
        for (z = pe.call(z), pe = 0; !(le = z.next()).done; )
          (le = le.value), (de = fe + ae(le, pe++)), (Ne += _(le, X, F, de, J));
      else if (de === "object") {
        if (typeof z.then == "function") return _(Q(z), X, F, le, J);
        throw (
          ((X = String(z)),
          Error(
            "Objects are not valid as a React child (found: " +
              (X === "[object Object]"
                ? "object with keys {" + Object.keys(z).join(", ") + "}"
                : X) +
              "). If you meant to render a collection of children, use an array instead."
          ))
        );
      }
      return Ne;
    }
    function V(z, X, F) {
      if (z == null) return z;
      var le = [],
        J = 0;
      return (
        _(z, le, "", "", function (de) {
          return X.call(F, de, J++);
        }),
        le
      );
    }
    function q(z) {
      if (z._status === -1) {
        var X = z._result;
        (X = X()),
          X.then(
            function (F) {
              (z._status === 0 || z._status === -1) &&
                ((z._status = 1), (z._result = F));
            },
            function (F) {
              (z._status === 0 || z._status === -1) &&
                ((z._status = 2), (z._result = F));
            }
          ),
          z._status === -1 && ((z._status = 0), (z._result = X));
      }
      if (z._status === 1) return z._result.default;
      throw z._result;
    }
    var oe =
        typeof reportError == "function"
          ? reportError
          : function (z) {
              if (
                typeof window == "object" &&
                typeof window.ErrorEvent == "function"
              ) {
                var X = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof z == "object" && z !== null && typeof z.message == "string"
                      ? String(z.message)
                      : String(z),
                  error: z
                });
                if (!window.dispatchEvent(X)) return;
              } else if (
                typeof process == "object" &&
                typeof process.emit == "function"
              ) {
                process.emit("uncaughtException", z);
                return;
              }
              console.error(z);
            },
      W = {
        map: V,
        forEach: function (z, X, F) {
          V(
            z,
            function () {
              X.apply(this, arguments);
            },
            F
          );
        },
        count: function (z) {
          var X = 0;
          return (
            V(z, function () {
              X++;
            }),
            X
          );
        },
        toArray: function (z) {
          return (
            V(z, function (X) {
              return X;
            }) || []
          );
        },
        only: function (z) {
          if (!ue(z))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return z;
        }
      };
    return (
      (ze.Activity = g),
      (ze.Children = W),
      (ze.Component = S),
      (ze.Fragment = r),
      (ze.Profiler = c),
      (ze.PureComponent = E),
      (ze.StrictMode = o),
      (ze.Suspense = x),
      (ze.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = O),
      (ze.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function (z) {
          return O.H.useMemoCache(z);
        }
      }),
      (ze.cache = function (z) {
        return function () {
          return z.apply(null, arguments);
        };
      }),
      (ze.cacheSignal = function () {
        return null;
      }),
      (ze.cloneElement = function (z, X, F) {
        if (z == null)
          throw Error(
            "The argument must be a React element, but you passed " + z + "."
          );
        var le = A({}, z.props),
          J = z.key;
        if (X != null)
          for (de in (X.key !== void 0 && (J = "" + X.key), X))
            !B.call(X, de) ||
              de === "key" ||
              de === "__self" ||
              de === "__source" ||
              (de === "ref" && X.ref === void 0) ||
              (le[de] = X[de]);
        var de = arguments.length - 2;
        if (de === 1) le.children = F;
        else if (1 < de) {
          for (var Ne = Array(de), fe = 0; fe < de; fe++) Ne[fe] = arguments[fe + 2];
          le.children = Ne;
        }
        return Y(z.type, J, le);
      }),
      (ze.createContext = function (z) {
        return (
          (z = {
            $$typeof: d,
            _currentValue: z,
            _currentValue2: z,
            _threadCount: 0,
            Provider: null,
            Consumer: null
          }),
          (z.Provider = z),
          (z.Consumer = { $$typeof: u, _context: z }),
          z
        );
      }),
      (ze.createElement = function (z, X, F) {
        var le,
          J = {},
          de = null;
        if (X != null)
          for (le in (X.key !== void 0 && (de = "" + X.key), X))
            B.call(X, le) &&
              le !== "key" &&
              le !== "__self" &&
              le !== "__source" &&
              (J[le] = X[le]);
        var Ne = arguments.length - 2;
        if (Ne === 1) J.children = F;
        else if (1 < Ne) {
          for (var fe = Array(Ne), pe = 0; pe < Ne; pe++) fe[pe] = arguments[pe + 2];
          J.children = fe;
        }
        if (z && z.defaultProps)
          for (le in ((Ne = z.defaultProps), Ne))
            J[le] === void 0 && (J[le] = Ne[le]);
        return Y(z, de, J);
      }),
      (ze.createRef = function () {
        return { current: null };
      }),
      (ze.forwardRef = function (z) {
        return { $$typeof: m, render: z };
      }),
      (ze.isValidElement = ue),
      (ze.lazy = function (z) {
        return { $$typeof: v, _payload: { _status: -1, _result: z }, _init: q };
      }),
      (ze.memo = function (z, X) {
        return { $$typeof: p, type: z, compare: X === void 0 ? null : X };
      }),
      (ze.startTransition = function (z) {
        var X = O.T,
          F = {};
        O.T = F;
        try {
          var le = z(),
            J = O.S;
          J !== null && J(F, le),
            typeof le == "object" &&
              le !== null &&
              typeof le.then == "function" &&
              le.then(k, oe);
        } catch (de) {
          oe(de);
        } finally {
          X !== null && F.types !== null && (X.types = F.types), (O.T = X);
        }
      }),
      (ze.unstable_useCacheRefresh = function () {
        return O.H.useCacheRefresh();
      }),
      (ze.use = function (z) {
        return O.H.use(z);
      }),
      (ze.useActionState = function (z, X, F) {
        return O.H.useActionState(z, X, F);
      }),
      (ze.useCallback = function (z, X) {
        return O.H.useCallback(z, X);
      }),
      (ze.useContext = function (z) {
        return O.H.useContext(z);
      }),
      (ze.useDebugValue = function () {}),
      (ze.useDeferredValue = function (z, X) {
        return O.H.useDeferredValue(z, X);
      }),
      (ze.useEffect = function (z, X) {
        return O.H.useEffect(z, X);
      }),
      (ze.useEffectEvent = function (z) {
        return O.H.useEffectEvent(z);
      }),
      (ze.useId = function () {
        return O.H.useId();
      }),
      (ze.useImperativeHandle = function (z, X, F) {
        return O.H.useImperativeHandle(z, X, F);
      }),
      (ze.useInsertionEffect = function (z, X) {
        return O.H.useInsertionEffect(z, X);
      }),
      (ze.useLayoutEffect = function (z, X) {
        return O.H.useLayoutEffect(z, X);
      }),
      (ze.useMemo = function (z, X) {
        return O.H.useMemo(z, X);
      }),
      (ze.useOptimistic = function (z, X) {
        return O.H.useOptimistic(z, X);
      }),
      (ze.useReducer = function (z, X, F) {
        return O.H.useReducer(z, X, F);
      }),
      (ze.useRef = function (z) {
        return O.H.useRef(z);
      }),
      (ze.useState = function (z) {
        return O.H.useState(z);
      }),
      (ze.useSyncExternalStore = function (z, X, F) {
        return O.H.useSyncExternalStore(z, X, F);
      }),
      (ze.useTransition = function () {
        return O.H.useTransition();
      }),
      (ze.version = "19.2.8"),
      ze
    );
  }
  var Ub;
  function yp() {
    return Ub || ((Ub = 1), (_m.exports = $T())), _m.exports;
  }
  var b = yp();
  const me = hj(b),
    ao = HT({ __proto__: null, default: me }, [b]);
  var zm = {};
  var Hb;
  function FT() {
    return (
      Hb ||
        ((Hb = 1),
        (function (t) {
          function s(_, V) {
            var q = _.length;
            _.push(V);
            e: for (; 0 < q; ) {
              var oe = (q - 1) >>> 1,
                W = _[oe];
              if (0 < c(W, V)) (_[oe] = V), (_[q] = W), (q = oe);
              else break e;
            }
          }
          function r(_) {
            return _.length === 0 ? null : _[0];
          }
          function o(_) {
            if (_.length === 0) return null;
            var V = _[0],
              q = _.pop();
            if (q !== V) {
              _[0] = q;
              e: for (var oe = 0, W = _.length, z = W >>> 1; oe < z; ) {
                var X = 2 * (oe + 1) - 1,
                  F = _[X],
                  le = X + 1,
                  J = _[le];
                if (0 > c(F, q))
                  le < W && 0 > c(J, F)
                    ? ((_[oe] = J), (_[le] = q), (oe = le))
                    : ((_[oe] = F), (_[X] = q), (oe = X));
                else if (le < W && 0 > c(J, q)) (_[oe] = J), (_[le] = q), (oe = le);
                else break e;
              }
            }
            return V;
          }
          function c(_, V) {
            var q = _.sortIndex - V.sortIndex;
            return q !== 0 ? q : _.id - V.id;
          }
          t.unstable_now = void 0;
          if (
            typeof performance == "object" &&
            typeof performance.now == "function"
          ) {
            var u = performance;
            t.unstable_now = function () {
              return u.now();
            };
          } else {
            var d = Date,
              m = d.now();
            t.unstable_now = function () {
              return d.now() - m;
            };
          }
          var x = [],
            p = [],
            v = 1,
            g = null,
            y = 3,
            N = !1,
            C = !1,
            A = !1,
            T = !1,
            S = typeof setTimeout == "function" ? setTimeout : null,
            M = typeof clearTimeout == "function" ? clearTimeout : null,
            E = typeof setImmediate < "u" ? setImmediate : null;
          function w(_) {
            for (var V = r(p); V !== null; ) {
              if (V.callback === null) o(p);
              else if (V.startTime <= _) o(p), (V.sortIndex = V.expirationTime), s(x, V);
              else break;
              V = r(p);
            }
          }
          function R(_) {
            if (((A = !1), w(_), !C))
              if (r(x) !== null) (C = !0), k || ((k = !0), ne());
              else {
                var V = r(p);
                V !== null && Q(R, V.startTime - _);
              }
          }
          var k = !1,
            O = -1,
            B = 5,
            Y = -1;
          function K() {
            return T ? !0 : !(t.unstable_now() - Y < B);
          }
          function ue() {
            if (((T = !1), k)) {
              var _ = t.unstable_now();
              Y = _;
              var V = !0;
              try {
                e: {
                  (C = !1), A && ((A = !1), M(O), (O = -1)), (N = !0);
                  var q = y;
                  try {
                    t: {
                      for (w(_), g = r(x); g !== null && !(g.expirationTime > _ && K()); ) {
                        var oe = g.callback;
                        if (typeof oe == "function") {
                          (g.callback = null), (y = g.priorityLevel);
                          var W = oe(g.expirationTime <= _);
                          if (((_ = t.unstable_now()), typeof W == "function")) {
                            (g.callback = W), w(_), (V = !0);
                            break t;
                          }
                          g === r(x) && o(x), w(_);
                        } else o(x);
                        g = r(x);
                      }
                      if (g !== null) V = !0;
                      else {
                        var z = r(p);
                        z !== null && Q(R, z.startTime - _), (V = !1);
                      }
                    }
                    break e;
                  } finally {
                    (g = null), (y = q), (N = !1);
                  }
                  V = void 0;
                }
              } finally {
                V ? ne() : (k = !1);
              }
            }
          }
          var ne;
          if (typeof E == "function")
            ne = function () {
              E(ue);
            };
          else if (typeof MessageChannel < "u") {
            var ce = new MessageChannel(),
              ae = ce.port2;
            (ce.port1.onmessage = ue),
              (ne = function () {
                ae.postMessage(null);
              });
          } else
            ne = function () {
              S(ue, 0);
            };
          function Q(_, V) {
            O = S(function () {
              _(t.unstable_now());
            }, V);
          }
          (t.unstable_IdlePriority = 5),
            (t.unstable_ImmediatePriority = 1),
            (t.unstable_LowPriority = 4),
            (t.unstable_NormalPriority = 3),
            (t.unstable_Profiling = null),
            (t.unstable_UserBlockingPriority = 2),
            (t.unstable_cancelCallback = function (_) {
              _.callback = null;
            }),
            (t.unstable_forceFrameRate = function (_) {
              0 > _ || 125 < _
                ? console.error(
                    "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
                  )
                : (B = 0 < _ ? Math.floor(1e3 / _) : 5);
            }),
            (t.unstable_getCurrentPriorityLevel = function () {
              return y;
            }),
            (t.unstable_next = function (_) {
              switch (y) {
                case 1:
                case 2:
                case 3:
                  var V = 3;
                  break;
                default:
                  V = y;
              }
              var q = y;
              y = V;
              try {
                return _();
              } finally {
                y = q;
              }
            }),
            (t.unstable_requestPaint = function () {
              T = !0;
            }),
            (t.unstable_runWithPriority = function (_, V) {
              switch (_) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                  break;
                default:
                  _ = 3;
              }
              var q = y;
              y = _;
              try {
                return V();
              } finally {
                y = q;
              }
            }),
            (t.unstable_scheduleCallback = function (_, V, q) {
              var oe = t.unstable_now();
              switch (
                (typeof q == "object" && q !== null
                  ? ((q = q.delay), (q = typeof q == "number" && 0 < q ? oe + q : oe))
                  : (q = oe),
                _)
              ) {
                case 1:
                  var W = -1;
                  break;
                case 2:
                  W = 250;
                  break;
                case 5:
                  W = 1073741823;
                  break;
                case 4:
                  W = 1e4;
                  break;
                default:
                  W = 5e3;
              }
              return (
                (W = q + W),
                (_ = {
                  id: v++,
                  callback: V,
                  priorityLevel: _,
                  startTime: q,
                  expirationTime: W,
                  sortIndex: -1
                }),
                q > oe
                  ? ((_.sortIndex = q),
                    s(p, _),
                    r(x) === null &&
                      _ === r(p) &&
                      (A ? (M(O), (O = -1)) : (A = !0), Q(R, q - oe)))
                  : ((_.sortIndex = W),
                    s(x, _),
                    C || N || ((C = !0), k || ((k = !0), ne()))),
                _
              );
            }),
            (t.unstable_shouldYield = K),
            (t.unstable_wrapCallback = function (_) {
              var V = y;
              return function () {
                var q = y;
                y = V;
                try {
                  return _.apply(this, arguments);
                } finally {
                  y = q;
                }
              };
            });
        })(zm)),
      zm
    );
  }

  // React Reconciler Child Diffing алгоритмийн төгсгөл хэсгийг хаах засалт
  function ot(H, P, I, se) {
    if (typeof I == "string" && I !== "" || typeof I == "number" || typeof I == "bigint") {
      return I;
    }
    return null;
  }
})();