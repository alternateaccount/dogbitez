//Used http://bookmarklets.org/maker/ to make the bookmarklet
//http://www.ofx.org/downloads/OFX%202.2.pdf

(function () {
    var saveAs;
    init();
    process();


    function process() {
        var transactions = getTransactions();

        var template = getOfxTemplate();
        template.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.STMTTRN = transactions.transactions;
        template.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.DTSTART = transactions.start.format("yyyymmdd");
        template.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.DTEND = transactions.end.format("yyyymmdd");
        template.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.LEDGERBAL.DTASOF = new Date().format("yyyymmdd");

        var balance = - Number($("p:contains('Current Balance')").parent().find(".cent, .dollarAmt").text().replace(/[^\d.-]/g, ''));
        template.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.LEDGERBAL.BALAMT = balance;

        var x2js = new X2JS();
        var xmlBody = x2js.json2xml_str(template);
        var fileText = getHeader() + xmlBody;

        var file = new File([fileText], "statement.ofx", {
            type: "text/plain;charset=utf-8"
        });
        saveAs(file);
    }


    function getHeader() {
        var header = '<?xml version="1.0" encoding="UTF-8"?>\n<?OFX OFXHEADER="200" VERSION="220" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>\n';

        return header;
    }


    function getOfxTemplate() {
        var templateString = '<OFX><CREDITCARDMSGSRSV1><CCSTMTTRNRS><TRNUID>0</TRNUID><STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS><CCSTMTRS><CURDEF>USD</CURDEF><CCACCTFROM><ACCTID>999988</ACCTID></CCACCTFROM><BANKTRANLIST><DTSTART></DTSTART><DTEND></DTEND></BANKTRANLIST><LEDGERBAL><BALAMT>0</BALAMT><DTASOF></DTASOF></LEDGERBAL></CCSTMTRS></CCSTMTTRNRS></CREDITCARDMSGSRSV1></OFX>';

        var x2js = new X2JS();
        return x2js.xml_str2json(templateString);
    }

    function getTransactions() {
        var jsonString = document.getElementById("completedBillingActivityJSONArray").value;
        var transactions = eval(jsonString);

        var start;
        var end;
        var ofxTransactions = [];
        transactions.forEach(function (entry) {
            var postDate = new Date(entry.POST_DATE);
            var ofxDate = postDate.format("yyyymmdd");
            var description = "Amazon - " + cleanDescription(entry.TRANS_DESC);
            var amt = -parseFloat(entry.TRANS_AMOUNT);
            var ref = entry.REF_NUM ? entry.REF_NUM : description + ofxDate;
            ref = ref.trim();

            if (!start || start > postDate)
                start = postDate;

            if (!end || end < postDate)
                end = postDate;

            ofxTransactions.push(createTransaction(amt, ref, description, ofxDate));
        });

        var parsedTransactions = {};
        parsedTransactions.start = start;
        parsedTransactions.end = end;
        parsedTransactions.transactions = ofxTransactions;
        return parsedTransactions;
    }

    function cleanDescription(description) {
        description = description.trim().replace(/ +(?= )/g, '').replace(/<br\/>/gi, '; ');
        description = description.replace('AMAZON MARKETPLACE SEATTLE WA;', '');
        description = description.replace('AMAZON RETAIL SEATTLE WA;', '');
        description = description.replace('SHIPPING AND TAX', '');
        description = description.replace('AMAZON DIGITAL SEATTLE WA;', '');
        //description = description.replace('AMAZON RETAIL SEATTLE WA;', '');

        description = description.trim().replace(/ +(?= )/g, '');
        return description;
    }

    function createTransaction(amt, ref, description, ofxDate) {
        /*
        <STMTTRN>
          <TRNTYPE>INT</TRNTYPE>
          <DTPOSTED>20050811080000</DTPOSTED>
          <TRNAMT>-23.00</TRNAMT>
          <FITID>219867</FITID>
          <NAME>Interest Charge</NAME>
        </STMTTRN> */

        var tran = {};
        tran.TRNTYPE = amt >= 0 ? "CREDIT" : "DEBIT";
        tran.DTPOSTED = ofxDate;
        tran.TRNAMT = amt;
        tran.FITID = ref;
        tran.NAME = description;

        return tran;
    }


    function init() {
        //http://blog.stevenlevithan.com/archives/date-time-format
        var dateFormat = function () { var a = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, b = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, c = /[^-+\dA-Z]/g, d = function (a, b) { for (a = String(a), b = b || 2; a.length < b;)a = "0" + a; return a }; return function (e, f, g) { var h = dateFormat; if (1 != arguments.length || "[object String]" != Object.prototype.toString.call(e) || /\d/.test(e) || (f = e, e = void 0), e = e ? new Date(e) : new Date, isNaN(e)) throw SyntaxError("invalid date"); f = String(h.masks[f] || f || h.masks.default), "UTC:" == f.slice(0, 4) && (f = f.slice(4), g = !0); var i = g ? "getUTC" : "get", j = e[i + "Date"](), k = e[i + "Day"](), l = e[i + "Month"](), m = e[i + "FullYear"](), n = e[i + "Hours"](), o = e[i + "Minutes"](), p = e[i + "Seconds"](), q = e[i + "Milliseconds"](), r = g ? 0 : e.getTimezoneOffset(), s = { d: j, dd: d(j), ddd: h.i18n.dayNames[k], dddd: h.i18n.dayNames[k + 7], m: l + 1, mm: d(l + 1), mmm: h.i18n.monthNames[l], mmmm: h.i18n.monthNames[l + 12], yy: String(m).slice(2), yyyy: m, h: n % 12 || 12, hh: d(n % 12 || 12), H: n, HH: d(n), M: o, MM: d(o), s: p, ss: d(p), l: d(q, 3), L: d(q > 99 ? Math.round(q / 10) : q), t: n < 12 ? "a" : "p", tt: n < 12 ? "am" : "pm", T: n < 12 ? "A" : "P", TT: n < 12 ? "AM" : "PM", Z: g ? "UTC" : (String(e).match(b) || [""]).pop().replace(c, ""), o: (r > 0 ? "-" : "+") + d(100 * Math.floor(Math.abs(r) / 60) + Math.abs(r) % 60, 4), S: ["th", "st", "nd", "rd"][j % 10 > 3 ? 0 : (j % 100 - j % 10 != 10) * j % 10] }; return f.replace(a, function (a) { return a in s ? s[a] : a.slice(1, a.length - 1) }) } } (); dateFormat.masks = { default: "ddd mmm dd yyyy HH:MM:ss", shortDate: "m/d/yy", mediumDate: "mmm d, yyyy", longDate: "mmmm d, yyyy", fullDate: "dddd, mmmm d, yyyy", shortTime: "h:MM TT", mediumTime: "h:MM:ss TT", longTime: "h:MM:ss TT Z", isoDate: "yyyy-mm-dd", isoTime: "HH:MM:ss", isoDateTime: "yyyy-mm-dd'T'HH:MM:ss", isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'" }, dateFormat.i18n = { dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] }, Date.prototype.format = function (a, b) { return dateFormat(this, a, b) };

        /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
        saveAs = saveAs || function (e) { "use strict"; if (typeof e === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) { return } var t = e.document, n = function () { return e.URL || e.webkitURL || e }, r = t.createElementNS("http://www.w3.org/1999/xhtml", "a"), o = "download" in r, i = function (e) { var t = new MouseEvent("click"); e.dispatchEvent(t) }, a = /constructor/i.test(e.HTMLElement), f = /CriOS\/[\d]+/.test(navigator.userAgent), u = function (t) { (e.setImmediate || e.setTimeout)(function () { throw t }, 0) }, d = "application/octet-stream", s = 1e3 * 40, c = function (e) { var t = function () { if (typeof e === "string") { n().revokeObjectURL(e) } else { e.remove() } }; setTimeout(t, s) }, l = function (e, t, n) { t = [].concat(t); var r = t.length; while (r--) { var o = e["on" + t[r]]; if (typeof o === "function") { try { o.call(e, n || e) } catch (i) { u(i) } } } }, p = function (e) { if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)) { return new Blob([String.fromCharCode(65279), e], { type: e.type }) } return e }, v = function (t, u, s) { if (!s) { t = p(t) } var v = this, w = t.type, m = w === d, y, h = function () { l(v, "writestart progress write writeend".split(" ")) }, S = function () { if ((f || m && a) && e.FileReader) { var r = new FileReader; r.onloadend = function () { var t = f ? r.result : r.result.replace(/^data:[^;]*;/, "data:attachment/file;"); var n = e.open(t, "_blank"); if (!n) e.location.href = t; t = undefined; v.readyState = v.DONE; h() }; r.readAsDataURL(t); v.readyState = v.INIT; return } if (!y) { y = n().createObjectURL(t) } if (m) { e.location.href = y } else { var o = e.open(y, "_blank"); if (!o) { e.location.href = y } } v.readyState = v.DONE; h(); c(y) }; v.readyState = v.INIT; if (o) { y = n().createObjectURL(t); setTimeout(function () { r.href = y; r.download = u; i(r); h(); c(y); v.readyState = v.DONE }); return } S() }, w = v.prototype, m = function (e, t, n) { return new v(e, t || e.name || "download", n) }; if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) { return function (e, t, n) { t = t || e.name || "download"; if (!n) { e = p(e) } return navigator.msSaveOrOpenBlob(e, t) } } w.abort = function () { }; w.readyState = w.INIT = 0; w.WRITING = 1; w.DONE = 2; w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null; return m } (typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content); if (typeof module !== "undefined" && module.exports) { module.exports.saveAs = saveAs } else if (typeof define !== "undefined" && define !== null && define.amd !== null) { define([], function () { return saveAs }) }


        /* https://github.com/abdmob/x2js/blob/master/xml2json.min.js */
        (function (a, b) { if (typeof define === "function" && define.amd) { define([], b); } else { if (typeof exports === "object") { module.exports = b(); } else { a.X2JS = b(); } } } (this, function () { return function (z) { var t = "1.2.0"; z = z || {}; i(); u(); function i() { if (z.escapeMode === undefined) { z.escapeMode = true; } z.attributePrefix = z.attributePrefix || "_"; z.arrayAccessForm = z.arrayAccessForm || "none"; z.emptyNodeForm = z.emptyNodeForm || "text"; if (z.enableToStringFunc === undefined) { z.enableToStringFunc = true; } z.arrayAccessFormPaths = z.arrayAccessFormPaths || []; if (z.skipEmptyTextNodesForObj === undefined) { z.skipEmptyTextNodesForObj = true; } if (z.stripWhitespaces === undefined) { z.stripWhitespaces = true; } z.datetimeAccessFormPaths = z.datetimeAccessFormPaths || []; if (z.useDoubleQuotes === undefined) { z.useDoubleQuotes = false; } z.xmlElementsFilter = z.xmlElementsFilter || []; z.jsonPropertiesFilter = z.jsonPropertiesFilter || []; if (z.keepCData === undefined) { z.keepCData = false; } } var h = { ELEMENT_NODE: 1, TEXT_NODE: 3, CDATA_SECTION_NODE: 4, COMMENT_NODE: 8, DOCUMENT_NODE: 9 }; function u() { } function x(B) { var C = B.localName; if (C == null) { C = B.baseName; } if (C == null || C == "") { C = B.nodeName; } return C; } function r(B) { return B.prefix; } function s(B) { if (typeof (B) == "string") { return B.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); } else { return B; } } function k(B) { return B.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&"); } function w(C, F, D, E) { var B = 0; for (; B < C.length; B++) { var G = C[B]; if (typeof G === "string") { if (G == E) { break; } } else { if (G instanceof RegExp) { if (G.test(E)) { break; } } else { if (typeof G === "function") { if (G(F, D, E)) { break; } } } } } return B != C.length; } function n(D, B, C) { switch (z.arrayAccessForm) { case "property": if (!(D[B] instanceof Array)) { D[B + "_asArray"] = [D[B]]; } else { D[B + "_asArray"] = D[B]; } break; }if (!(D[B] instanceof Array) && z.arrayAccessFormPaths.length > 0) { if (w(z.arrayAccessFormPaths, D, B, C)) { D[B] = [D[B]]; } } } function a(G) { var E = G.split(/[-T:+Z]/g); var F = new Date(E[0], E[1] - 1, E[2]); var D = E[5].split("."); F.setHours(E[3], E[4], D[0]); if (D.length > 1) { F.setMilliseconds(D[1]); } if (E[6] && E[7]) { var C = E[6] * 60 + Number(E[7]); var B = /\d\d-\d\d:\d\d$/.test(G) ? "-" : "+"; C = 0 + (B == "-" ? -1 * C : C); F.setMinutes(F.getMinutes() - C - F.getTimezoneOffset()); } else { if (G.indexOf("Z", G.length - 1) !== -1) { F = new Date(Date.UTC(F.getFullYear(), F.getMonth(), F.getDate(), F.getHours(), F.getMinutes(), F.getSeconds(), F.getMilliseconds())); } } return F; } function q(D, B, C) { if (z.datetimeAccessFormPaths.length > 0) { var E = C.split(".#")[0]; if (w(z.datetimeAccessFormPaths, D, B, E)) { return a(D); } else { return D; } } else { return D; } } function b(E, C, B, D) { if (C == h.ELEMENT_NODE && z.xmlElementsFilter.length > 0) { return w(z.xmlElementsFilter, E, B, D); } else { return true; } } function A(D, J) { if (D.nodeType == h.DOCUMENT_NODE) { var K = new Object; var B = D.childNodes; for (var L = 0; L < B.length; L++) { var C = B.item(L); if (C.nodeType == h.ELEMENT_NODE) { var I = x(C); K[I] = A(C, I); } } return K; } else { if (D.nodeType == h.ELEMENT_NODE) { var K = new Object; K.__cnt = 0; var B = D.childNodes; for (var L = 0; L < B.length; L++) { var C = B.item(L); var I = x(C); if (C.nodeType != h.COMMENT_NODE) { var H = J + "." + I; if (b(K, C.nodeType, I, H)) { K.__cnt++; if (K[I] == null) { K[I] = A(C, H); n(K, I, H); } else { if (K[I] != null) { if (!(K[I] instanceof Array)) { K[I] = [K[I]]; n(K, I, H); } } (K[I])[K[I].length] = A(C, H); } } } } for (var E = 0; E < D.attributes.length; E++) { var F = D.attributes.item(E); K.__cnt++; K[z.attributePrefix + F.name] = F.value; } var G = r(D); if (G != null && G != "") { K.__cnt++; K.__prefix = G; } if (K["#text"] != null) { K.__text = K["#text"]; if (K.__text instanceof Array) { K.__text = K.__text.join("\n"); } if (z.stripWhitespaces) { K.__text = K.__text.trim(); } delete K["#text"]; if (z.arrayAccessForm == "property") { delete K["#text_asArray"]; } K.__text = q(K.__text, I, J + "." + I); } if (K["#cdata-section"] != null) { K.__cdata = K["#cdata-section"]; delete K["#cdata-section"]; if (z.arrayAccessForm == "property") { delete K["#cdata-section_asArray"]; } } if (K.__cnt == 0 && z.emptyNodeForm == "text") { K = ""; } else { if (K.__cnt == 1 && K.__text != null) { K = K.__text; } else { if (K.__cnt == 1 && K.__cdata != null && !z.keepCData) { K = K.__cdata; } else { if (K.__cnt > 1 && K.__text != null && z.skipEmptyTextNodesForObj) { if ((z.stripWhitespaces && K.__text == "") || (K.__text.trim() == "")) { delete K.__text; } } } } } delete K.__cnt; if (z.enableToStringFunc && (K.__text != null || K.__cdata != null)) { K.toString = function () { return (this.__text != null ? this.__text : "") + (this.__cdata != null ? this.__cdata : ""); }; } return K; } else { if (D.nodeType == h.TEXT_NODE || D.nodeType == h.CDATA_SECTION_NODE) { return D.nodeValue; } } } } function o(I, F, H, C) { var E = "<" + ((I != null && I.__prefix != null) ? (I.__prefix + ":") : "") + F; if (H != null) { for (var G = 0; G < H.length; G++) { var D = H[G]; var B = I[D]; if (z.escapeMode) { B = s(B); } E += " " + D.substr(z.attributePrefix.length) + "="; if (z.useDoubleQuotes) { E += '"' + B + '"'; } else { E += "'" + B + "'"; } } } if (!C) { E += ">"; } else { E += "/>"; } return E; } function j(C, B) { return "</" + (C.__prefix != null ? (C.__prefix + ":") : "") + B + ">"; } function v(C, B) { return C.indexOf(B, C.length - B.length) !== -1; } function y(C, B) { if ((z.arrayAccessForm == "property" && v(B.toString(), ("_asArray"))) || B.toString().indexOf(z.attributePrefix) == 0 || B.toString().indexOf("__") == 0 || (C[B] instanceof Function)) { return true; } else { return false; } } function m(D) { var C = 0; if (D instanceof Object) { for (var B in D) { if (y(D, B)) { continue; } C++; } } return C; } function l(D, B, C) { return z.jsonPropertiesFilter.length == 0 || C == "" || w(z.jsonPropertiesFilter, D, B, C); } function c(D) { var C = []; if (D instanceof Object) { for (var B in D) { if (B.toString().indexOf("__") == -1 && B.toString().indexOf(z.attributePrefix) == 0) { C.push(B); } } } return C; } function g(C) { var B = ""; if (C.__cdata != null) { B += "<![CDATA[" + C.__cdata + "]]>"; } if (C.__text != null) { if (z.escapeMode) { B += s(C.__text); } else { B += C.__text; } } return B; } function d(C) { var B = ""; if (C instanceof Object) { B += g(C); } else { if (C != null) { if (z.escapeMode) { B += s(C); } else { B += C; } } } return B; } function p(C, B) { if (C === "") { return B; } else { return C + "." + B; } } function f(D, G, F, E) { var B = ""; if (D.length == 0) { B += o(D, G, F, true); } else { for (var C = 0; C < D.length; C++) { B += o(D[C], G, c(D[C]), false); B += e(D[C], p(E, G)); B += j(D[C], G); } } return B; } function e(I, H) { var B = ""; var F = m(I); if (F > 0) { for (var E in I) { if (y(I, E) || (H != "" && !l(I, E, p(H, E)))) { continue; } var D = I[E]; var G = c(D); if (D == null || D == undefined) { B += o(D, E, G, true); } else { if (D instanceof Object) { if (D instanceof Array) { B += f(D, E, G, H); } else { if (D instanceof Date) { B += o(D, E, G, false); B += D.toISOString(); B += j(D, E); } else { var C = m(D); if (C > 0 || D.__text != null || D.__cdata != null) { B += o(D, E, G, false); B += e(D, p(H, E)); B += j(D, E); } else { B += o(D, E, G, true); } } } } else { B += o(D, E, G, false); B += d(D); B += j(D, E); } } } } B += d(I); return B; } this.parseXmlString = function (D) { var F = window.ActiveXObject || "ActiveXObject" in window; if (D === undefined) { return null; } var E; if (window.DOMParser) { var G = new window.DOMParser(); var B = null; if (!F) { try { B = G.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI; } catch (C) { B = null; } } try { E = G.parseFromString(D, "text/xml"); if (B != null && E.getElementsByTagNameNS(B, "parsererror").length > 0) { E = null; } } catch (C) { E = null; } } else { if (D.indexOf("<?") == 0) { D = D.substr(D.indexOf("?>") + 2); } E = new ActiveXObject("Microsoft.XMLDOM"); E.async = "false"; E.loadXML(D); } return E; }; this.asArray = function (B) { if (B === undefined || B == null) { return []; } else { if (B instanceof Array) { return B; } else { return [B]; } } }; this.toXmlDateTime = function (B) { if (B instanceof Date) { return B.toISOString(); } else { if (typeof (B) === "number") { return new Date(B).toISOString(); } else { return null; } } }; this.asDateTime = function (B) { if (typeof (B) == "string") { return a(B); } else { return B; } }; this.xml2json = function (B) { return A(B); }; this.xml_str2json = function (B) { var C = this.parseXmlString(B); if (C != null) { return this.xml2json(C); } else { return null; } }; this.json2xml_str = function (B) { return e(B, ""); }; this.json2xml = function (C) { var B = this.json2xml_str(C); return this.parseXmlString(B); }; this.getVersion = function () { return t; }; }; }));


    }
})()

