'use strict';

const defaultStringChars = ['"', '\'', '`'];
const defaultStringObj = {
  open: defaultStringChars,
  close: defaultStringChars
};
const Mates = {
  '(': ')',
  '[': ']',
  '<': '>',
  '{': '}',
  '"': '"',
  '\'': '\'',
  '/*': '*/',
  '<!--': '-->',
  '(*': '*)',
  '{-': '-}',
  '%{': '%}',
  '<#': '#>'
};
const regexChars = ['^', '$', '[', ']', '{', '}', '(', ')', '\\', '/', '.', ',', '?', '-', '+', '*', '|'];

function sortArrayByLength(a, b) {
  return b.length - a.length;
}
function getMate(str) {
  let keys, regex, match, count;
  // @ts-ignore
  if (str in Mates) return Mates[str];
  keys = Object.keys(Mates).sort(sortArrayByLength).map(toRegex);
  regex = new RegExp('(' + keys.join('|') + ')', 'g');
  match = str.match(regex);
  if (match) {
    count = str.length / match[0].length;
    // @ts-ignore
    if (count === match.length) return Mates[match[0]].repeat(count);
  }
  return reverse(str);
}
function reverse(str) {
  return str.split('').reverse().join('');
}
function toRegex(str) {
  return escapeChars(str, regexChars);
}
function escapeChars(str, arr) {
  const expression = arr.join('\\');
  const regex = new RegExp('[\\' + expression + ']', 'g');
  return str.replace(regex, '\\$&');
}
function popLast(arr) {
  return arr.splice(arr.length - 1, 1)[0];
}
function addEscape(str) {
  return '\\\\' + str;
}
function buildStringObj(arr) {
  const ret = {
    open: [],
    close: []
  };
  if (typeof arr === "string") {
    arr = [arr];
  } else if (!Array.isArray(arr)) return defaultStringObj;
  arr.forEach(function (el) {
    if (typeof el === "string") {
      ret.open.push(el);
      ret.close.push(getMate(el));
    } else if (Array.isArray(el) && typeof el[0] === "string") {
      if (typeof el[1] === "string") {
        ret.open.push(el[0]);
        ret.close.push(el[1]);
      } else {
        // @ts-ignore
        ret.open.push(el);
        // @ts-ignore
        ret.close.push(getMate(el));
      }
    }
  });
  return ret;
}
function buildRegex(open, close, stringChars) {
  const regexNormal = [open, close].concat(stringChars).sort(sortArrayByLength).map(toRegex),
    regexEscaped = regexNormal.map(addEscape),
    arr = regexEscaped.concat(regexNormal);
  return new RegExp('(' + arr.join('|') + ')', 'g');
}
function _nearString(value, index, match, offset = 15, offsetEnd = 80, maxLength = 80) {
  let s = Math.max(0, index - offset);
  let e = index + Math.min(((match === null || match === void 0 ? void 0 : match.length) || 0) + offsetEnd, maxLength > 0 ? maxLength : 80);
  return value.slice(s, e);
}
function infoNearExtractionError(infoline, self) {
  var _result$index, _result$simple;
  let result = (self === null || self === void 0 ? void 0 : self.result) || {};
  return _nearString(infoline, ((_result$index = result.index) === null || _result$index === void 0 ? void 0 : _result$index[0]) || 0, (_result$simple = result.simple) === null || _result$simple === void 0 ? void 0 : _result$simple[0]);
}
function _createExtractionError(self, msg) {
  const e = new SyntaxError(msg);
  e.self = self;
  return e;
}

class Extraction {
  constructor(open, close, stringChars, regex) {
    this.matches = [];
    this.tree = [];
    this.escaped = false;
    this.openChar = open;
    this.closeChar = close;
    this.stringChars = stringChars;
    this.regex = regex;
    this.sameChar = open === close;
  }
  init(str, count) {
    const arr = str.split(this.regex);
    const l = arr.length;
    this.count = count;
    this.index = 0;
    for (let i = 0; i < l; i++) {
      if (this.handleStr(arr[i])) break;
      this.index += arr[i].length;
    }
    if (this.result) {
      if (this.escaped) throw _createExtractionError(this, "Unable to parse. Unclosed String detected");
      throw _createExtractionError(this, "Unable to parse. Unclosed Bracket detected");
    }
    return this.matches;
  }
  handleStr(str) {
    let index;
    if (this.escaped) {
      if (str === this.unescapeStr) this.escaped = false;
      return this.add(str);
    }
    if (str === this.openChar) return this.open();
    if (str === this.closeChar) return this.close();
    index = this.stringChars.open.indexOf(str);
    if (index > -1) {
      this.escaped = true;
      this.unescapeStr = this.stringChars.close[index];
    }
    return this.add(str);
  }
  open() {
    const obj = {
      nest: [],
      simple: [],
      hasNest: false,
      str: '',
      index: [this.index]
    };
    if (this.result) {
      if (this.sameChar) return this.close();
      this.result.hasNest = true;
      this.result.nest.push(obj);
      this.result.simple.push(obj.simple);
      this.tree.push(this.result);
      this.tree.forEach(branch => {
        obj.index.push(this.index - branch.index[0] - 1);
        branch.str += this.openChar;
      });
    } else {
      this.matches.push(obj);
    }
    this.result = obj;
    return false;
  }
  add(str) {
    let nest;
    if (str && this.result) {
      nest = this.result.nest;
      if (typeof nest[nest.length - 1] === "string") {
        // @ts-ignore
        nest[nest.length - 1] += str;
        // @ts-ignore
        this.result.simple += str;
      } else {
        // @ts-ignore
        nest.push(str);
        this.result.simple.push(str);
      }
      this.result.str += str;
      this.tree.forEach(obj => {
        obj.str += str;
      });
    }
    return false;
  }
  close() {
    this.tree.forEach(branch => {
      branch.str += this.closeChar;
    });
    this.result = popLast(this.tree);
    return !this.result && this.matches.length === this.count;
  }
}

class Extractor {
  constructor(open, close, stringChars) {
    if (typeof open !== 'string') throw new TypeError('The \'open\' argument must be a string');
    if (typeof close !== 'string') close = getMate(open);
    this.openChar = open;
    this.closeChar = close;
    this.stringChars = buildStringObj(stringChars);
    this.regex = buildRegex(open, close, this.stringChars.open);
    this.createExtraction = this.createExtraction.bind(this);
    this.extract = this.extract.bind(this);
    this.extractSync = this.extractSync.bind(this);
    this.extractAsync = this.extractAsync.bind(this);
  }
  createExtraction() {
    return new Extraction(this.openChar, this.closeChar, this.stringChars, this.regex);
  }
  extract(str, count) {
    if (typeof count !== "number") count = 0;
    return this.createExtraction().init(str, count);
  }
  /**
   * Synchronously extracts content from a string based on specified brackets.
   * This method can be used with or without a callback.
   *
   * @template T - The type of the extraction result, defaults to IExtractionResult[]
   * @param {string} str - The input string to extract content from
   * @param {number | IExtractionCallback<T>} [count] - The number of extractions to perform or a callback function
   * @param {IExtractionCallback<T>} [cb] - Optional callback function to handle the extraction result
   * @returns {T | void} - Returns the extraction result if no callback is provided, otherwise void
   * @throws {IExtractionError} - Throws an error if extraction fails and no callback is provided
   *
   * @example
   * ```typescript
   * const ExtractParents = new Extractor('{', '}');
   *
   * ExtractParents.extractSync(infoline, (e, result) => {
   *
   * 	console.error(e);
   *
   * 	console.dir(e ? infoNearExtractionError(infoline, e.self) : result, {
   * 		depth: null,
   * 	})
   *
   * })
   * ```
   */
  extractSync(str, count, cb) {
    let err;
    let result;
    if (typeof count === 'function') {
      [cb, count] = [count, void 0];
    }
    if (typeof cb === 'function' || cb) {
      try {
        // @ts-ignore
        result = this.extract(str, count);
      } catch (e) {
        // @ts-ignore
        err = e;
      }
    } else {
      // @ts-ignore
      return this.extract(str, count);
    }
    return cb(err, result);
  }
  async extractAsync(str, count) {
    return this.extract(str, count);
  }
}

// @ts-ignore
{
  Object.defineProperty(Extractor, "__esModule", {
    value: true
  });
  Object.defineProperty(Extractor, 'default', {
    value: Extractor
  });
  Object.defineProperty(Extractor, 'Extraction', {
    value: Extraction
  });
  Object.defineProperty(Extractor, 'Extractor', {
    value: Extractor
  });
  Object.defineProperty(Extractor, '_nearString', {
    value: _nearString
  });
  Object.defineProperty(Extractor, 'infoNearExtractionError', {
    value: infoNearExtractionError
  });
}

// @ts-ignore
module.exports = Extractor;
//# sourceMappingURL=index.cjs.development.cjs.map
