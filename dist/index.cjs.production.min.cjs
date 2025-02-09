"use strict";

const t = [ '"', "'", "`" ], e = {
  open: t,
  close: t
}, r = {
  "(": ")",
  "[": "]",
  "<": ">",
  "{": "}",
  '"': '"',
  "'": "'",
  "/*": "*/",
  "\x3c!--": "--\x3e",
  "(*": "*)",
  "{-": "-}",
  "%{": "%}",
  "<#": "#>"
}, s = [ "^", "$", "[", "]", "{", "}", "(", ")", "\\", "/", ".", ",", "?", "-", "+", "*", "|" ];

function sortArrayByLength(t, e) {
  return e.length - t.length;
}

function getMate(t) {
  let e, s, n, i;
  return t in r ? r[t] : (e = Object.keys(r).sort(sortArrayByLength).map(toRegex), 
  s = new RegExp("(" + e.join("|") + ")", "g"), n = t.match(s), n && (i = t.length / n[0].length, 
  i === n.length) ? r[n[0]].repeat(i) : function reverse(t) {
    return t.split("").reverse().join("");
  }(t));
}

function toRegex(t) {
  return function escapeChars(t, e) {
    const r = e.join("\\"), s = new RegExp("[\\" + r + "]", "g");
    return t.replace(s, "\\$&");
  }(t, s);
}

function addEscape(t) {
  return "\\\\" + t;
}

function _nearString(t, e, r, s = 15, n = 80, i = 80) {
  let h = Math.max(0, e - s), o = e + Math.min(((null == r ? void 0 : r.length) || 0) + n, i > 0 ? i : 80);
  return t.slice(h, o);
}

function _createExtractionError(t, e) {
  const r = new SyntaxError(e);
  return r.self = t, r;
}

class Extraction {
  constructor(t, e, r, s) {
    this.matches = [], this.tree = [], this.escaped = !1, this.openChar = t, this.closeChar = e, 
    this.stringChars = r, this.regex = s, this.sameChar = t === e;
  }
  init(t, e) {
    const r = t.split(this.regex), s = r.length;
    this.count = e, this.index = 0;
    for (let t = 0; t < s && !this.handleStr(r[t]); t++) this.index += r[t].length;
    if (this.result) {
      if (this.escaped) throw _createExtractionError(this, "Unable to parse. Unclosed String detected");
      throw _createExtractionError(this, "Unable to parse. Unclosed Bracket detected");
    }
    return this.matches;
  }
  handleStr(t) {
    let e;
    return this.escaped ? (t === this.unescapeStr && (this.escaped = !1), this.add(t)) : t === this.openChar ? this.open() : t === this.closeChar ? this.close() : (e = this.stringChars.open.indexOf(t), 
    e > -1 && (this.escaped = !0, this.unescapeStr = this.stringChars.close[e]), this.add(t));
  }
  open() {
    const t = {
      nest: [],
      simple: [],
      hasNest: !1,
      str: "",
      index: [ this.index ]
    };
    if (this.result) {
      if (this.sameChar) return this.close();
      this.result.hasNest = !0, this.result.nest.push(t), this.result.simple.push(t.simple), 
      this.tree.push(this.result), this.tree.forEach((e => {
        t.index.push(this.index - e.index[0] - 1), e.str += this.openChar;
      }));
    } else this.matches.push(t);
    return this.result = t, !1;
  }
  add(t) {
    let e;
    return t && this.result && (e = this.result.nest, "string" == typeof e[e.length - 1] ? (e[e.length - 1] += t, 
    this.result.simple += t) : (e.push(t), this.result.simple.push(t)), this.result.str += t, 
    this.tree.forEach((e => {
      e.str += t;
    }))), !1;
  }
  close() {
    return this.tree.forEach((t => {
      t.str += this.closeChar;
    })), this.result = function popLast(t) {
      return t.splice(t.length - 1, 1)[0];
    }(this.tree), !this.result && this.matches.length === this.count;
  }
}

class Extractor {
  constructor(t, r, s) {
    if ("string" != typeof t) throw new TypeError("The 'open' argument must be a string");
    "string" != typeof r && (r = getMate(t)), this.openChar = t, this.closeChar = r, 
    this.stringChars = function buildStringObj(t) {
      const r = {
        open: [],
        close: []
      };
      if ("string" == typeof t) t = [ t ]; else if (!Array.isArray(t)) return e;
      return t.forEach((function(t) {
        "string" == typeof t ? (r.open.push(t), r.close.push(getMate(t))) : Array.isArray(t) && "string" == typeof t[0] && ("string" == typeof t[1] ? (r.open.push(t[0]), 
        r.close.push(t[1])) : (r.open.push(t), r.close.push(getMate(t))));
      })), r;
    }(s), this.regex = function buildRegex(t, e, r) {
      const s = [ t, e ].concat(r).sort(sortArrayByLength).map(toRegex), n = s.map(addEscape).concat(s);
      return new RegExp("(" + n.join("|") + ")", "g");
    }(t, r, this.stringChars.open), this.createExtraction = this.createExtraction.bind(this), 
    this.extract = this.extract.bind(this), this.extractSync = this.extractSync.bind(this), 
    this.extractAsync = this.extractAsync.bind(this);
  }
  createExtraction() {
    return new Extraction(this.openChar, this.closeChar, this.stringChars, this.regex);
  }
  extract(t, e) {
    return "number" != typeof e && (e = 0), this.createExtraction().init(t, e);
  }
  extractSync(t, e, r) {
    let s, n;
    if ("function" == typeof e && ([r, e] = [ e, void 0 ]), "function" != typeof r && !r) return this.extract(t, e);
    try {
      n = this.extract(t, e);
    } catch (t) {
      s = t;
    }
    return r(s, n);
  }
  async extractAsync(t, e) {
    return this.extract(t, e);
  }
}

Object.defineProperty(Extractor, "__esModule", {
  value: !0
}), Object.defineProperty(Extractor, "default", {
  value: Extractor
}), Object.defineProperty(Extractor, "Extraction", {
  value: Extraction
}), Object.defineProperty(Extractor, "Extractor", {
  value: Extractor
}), Object.defineProperty(Extractor, "_nearString", {
  value: _nearString
}), Object.defineProperty(Extractor, "infoNearExtractionError", {
  value: function infoNearExtractionError(t, e) {
    var r, s;
    let n = (null == e ? void 0 : e.result) || {};
    return _nearString(t, (null === (r = n.index) || void 0 === r ? void 0 : r[0]) || 0, null === (s = n.simple) || void 0 === s ? void 0 : s[0]);
  }
}), module.exports = Extractor;
//# sourceMappingURL=index.cjs.production.min.cjs.map
