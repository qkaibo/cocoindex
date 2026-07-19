(function() {
	var Pe = (e, r) => () => (r || (e((r = { exports: {} }).exports, r), e = null), r.exports), er = Pe(((e) => {
		function r(s, f, m) {
			if (m === void 0 && (m = Array.prototype), s && typeof m.find == "function") return m.find.call(s, f);
			for (var d = 0; d < s.length; d++) if (Object.prototype.hasOwnProperty.call(s, d)) {
				var w = s[d];
				if (f.call(void 0, w, d, s)) return w;
			}
		}
		function t(s, f) {
			return f === void 0 && (f = Object), f && typeof f.freeze == "function" ? f.freeze(s) : s;
		}
		function n(s, f) {
			if (s === null || typeof s != "object") throw new TypeError("target is not an object");
			for (var m in f) Object.prototype.hasOwnProperty.call(f, m) && (s[m] = f[m]);
			return s;
		}
		var a = t({
			HTML: "text/html",
			isHTML: function(s) {
				return s === a.HTML;
			},
			XML_APPLICATION: "application/xml",
			XML_TEXT: "text/xml",
			XML_XHTML_APPLICATION: "application/xhtml+xml",
			XML_SVG_IMAGE: "image/svg+xml"
		}), l = t({
			HTML: "http://www.w3.org/1999/xhtml",
			isHTML: function(s) {
				return s === l.HTML;
			},
			SVG: "http://www.w3.org/2000/svg",
			XML: "http://www.w3.org/XML/1998/namespace",
			XMLNS: "http://www.w3.org/2000/xmlns/"
		});
		e.assign = n, e.find = r, e.freeze = t, e.MIME_TYPE = a, e.NAMESPACE = l;
	})), Fr = Pe(((e) => {
		var r = er(), t = r.find, n = r.NAMESPACE;
		function a(o) {
			return o !== "";
		}
		function l(o) {
			return o ? o.split(/[\t\n\f\r ]+/).filter(a) : [];
		}
		function s(o, i) {
			return o.hasOwnProperty(i) || (o[i] = !0), o;
		}
		function f(o) {
			if (!o) return [];
			var i = l(o);
			return Object.keys(i.reduce(s, {}));
		}
		function m(o) {
			return function(i) {
				return o && o.indexOf(i) !== -1;
			};
		}
		function d(o, i) {
			for (var u in o) Object.prototype.hasOwnProperty.call(o, u) && (i[u] = o[u]);
		}
		function w(o, i) {
			var u = o.prototype;
			if (!(u instanceof i)) {
				let b = function() {};
				b.prototype = i.prototype, b = new b(), d(u, b), o.prototype = u = b;
			}
			u.constructor != o && (typeof o != "function" && console.error("unknown Class:" + o), u.constructor = o);
		}
		var h = {}, T = h.ELEMENT_NODE = 1, C = h.ATTRIBUTE_NODE = 2, $ = h.TEXT_NODE = 3, H = h.CDATA_SECTION_NODE = 4, j = h.ENTITY_REFERENCE_NODE = 5, v = h.ENTITY_NODE = 6, L = h.PROCESSING_INSTRUCTION_NODE = 7, _ = h.COMMENT_NODE = 8, P = h.DOCUMENT_NODE = 9, F = h.DOCUMENT_TYPE_NODE = 10, k = h.DOCUMENT_FRAGMENT_NODE = 11, Z = h.NOTATION_NODE = 12, R = {}, q = {};
		R.INDEX_SIZE_ERR = (q[1] = "Index size error", 1), R.DOMSTRING_SIZE_ERR = (q[2] = "DOMString size error", 2);
		var c = R.HIERARCHY_REQUEST_ERR = (q[3] = "Hierarchy request error", 3);
		R.WRONG_DOCUMENT_ERR = (q[4] = "Wrong document", 4);
		var g = R.INVALID_CHARACTER_ERR = (q[5] = "Invalid character", 5);
		R.NO_DATA_ALLOWED_ERR = (q[6] = "No data allowed", 6), R.NO_MODIFICATION_ALLOWED_ERR = (q[7] = "No modification allowed", 7);
		var S = R.NOT_FOUND_ERR = (q[8] = "Not found", 8);
		R.NOT_SUPPORTED_ERR = (q[9] = "Not supported", 9);
		var O = R.INUSE_ATTRIBUTE_ERR = (q[10] = "Attribute in use", 10), N = R.INVALID_STATE_ERR = (q[11] = "Invalid state", 11);
		R.SYNTAX_ERR = (q[12] = "Syntax error", 12), R.INVALID_MODIFICATION_ERR = (q[13] = "Invalid modification", 13), R.NAMESPACE_ERR = (q[14] = "Invalid namespace", 14), R.INVALID_ACCESS_ERR = (q[15] = "Invalid access", 15);
		function E(o, i) {
			if (i instanceof Error) var u = i;
			else u = this, Error.call(this, q[o]), this.message = q[o], Error.captureStackTrace && Error.captureStackTrace(this, E);
			return u.code = o, i && (this.message = this.message + ": " + i), u;
		}
		E.prototype = Error.prototype, d(R, E);
		function x() {}
		x.prototype = {
			length: 0,
			item: function(o) {
				return o >= 0 && o < this.length ? this[o] : null;
			},
			toString: function(o, i, u) {
				for (var p = !!u && !!u.requireWellFormed, b = [], A = 0; A < this.length; A++) Ur(this[A], b, o, i, null, p);
				return b.join("");
			},
			filter: function(o) {
				return Array.prototype.filter.call(this, o);
			},
			indexOf: function(o) {
				return Array.prototype.indexOf.call(this, o);
			}
		};
		function U(o, i) {
			this._node = o, this._refresh = i, I(this);
		}
		function I(o) {
			var i = o._node._inc || o._node.ownerDocument._inc;
			if (o._inc !== i) {
				var u = o._refresh(o._node);
				if (Ft(o, "length", u.length), !o.$$length || u.length < o.$$length) for (var p = u.length; p in o; p++) Object.prototype.hasOwnProperty.call(o, p) && delete o[p];
				d(u, o), o._inc = i;
			}
		}
		U.prototype.item = function(o) {
			return I(this), this[o] || null;
		}, w(U, x);
		function D() {}
		function M(o, i) {
			for (var u = o.length; u--;) if (o[u] === i) return u;
		}
		function ee(o, i, u, p) {
			if (p ? i[M(i, p)] = u : i[i.length++] = u, o) {
				u.ownerElement = o;
				var b = o.ownerDocument;
				b && (p && se(b, o, p), re(b, o, u));
			}
		}
		function B(o, i, u) {
			var p = M(i, u);
			if (p >= 0) {
				for (var b = i.length - 1; p < b;) i[p] = i[++p];
				if (i.length = b, o) {
					var A = o.ownerDocument;
					A && (se(A, o, u), u.ownerElement = null);
				}
			} else throw new E(S, /* @__PURE__ */ new Error(o.tagName + "@" + u));
		}
		D.prototype = {
			length: 0,
			item: x.prototype.item,
			getNamedItem: function(o) {
				for (var i = this.length; i--;) {
					var u = this[i];
					if (u.nodeName == o) return u;
				}
			},
			setNamedItem: function(o) {
				var i = o.ownerElement;
				if (i && i != this._ownerElement) throw new E(O);
				var u = this.getNamedItem(o.nodeName);
				return ee(this._ownerElement, this, o, u), u;
			},
			setNamedItemNS: function(o) {
				var i = o.ownerElement, u;
				if (i && i != this._ownerElement) throw new E(O);
				return u = this.getNamedItemNS(o.namespaceURI, o.localName), ee(this._ownerElement, this, o, u), u;
			},
			removeNamedItem: function(o) {
				var i = this.getNamedItem(o);
				return B(this._ownerElement, this, i), i;
			},
			removeNamedItemNS: function(o, i) {
				var u = this.getNamedItemNS(o, i);
				return B(this._ownerElement, this, u), u;
			},
			getNamedItemNS: function(o, i) {
				for (var u = this.length; u--;) {
					var p = this[u];
					if (p.localName == i && p.namespaceURI == o) return p;
				}
				return null;
			}
		};
		function J() {}
		J.prototype = {
			hasFeature: function(o, i) {
				return !0;
			},
			createDocument: function(o, i, u) {
				var p = new he();
				if (p.implementation = this, p.childNodes = new x(), p.doctype = u || null, u && p.appendChild(u), i) {
					var b = p.createElementNS(o, i);
					p.appendChild(b);
				}
				return p;
			},
			createDocumentType: function(o, i, u) {
				var p = new pr();
				return p.name = o, p.nodeName = o, p.publicId = i || "", p.systemId = u || "", p;
			}
		};
		function V() {}
		V.prototype = {
			firstChild: null,
			lastChild: null,
			previousSibling: null,
			nextSibling: null,
			attributes: null,
			parentNode: null,
			childNodes: null,
			ownerDocument: null,
			nodeValue: null,
			namespaceURI: null,
			prefix: null,
			localName: null,
			insertBefore: function(o, i) {
				return Ve(this, o, i);
			},
			replaceChild: function(o, i) {
				Ve(this, o, i, ue), i && this.removeChild(i);
			},
			removeChild: function(o) {
				return Te(this, o);
			},
			appendChild: function(o) {
				return this.insertBefore(o, null);
			},
			hasChildNodes: function() {
				return this.firstChild != null;
			},
			cloneNode: function(o) {
				return Vt(this.ownerDocument || this, this, o);
			},
			normalize: function() {
				W(this, null, { enter: function(o) {
					for (var i = o.firstChild; i;) {
						var u = i.nextSibling;
						u !== null && u.nodeType === $ && i.nodeType === $ ? (o.removeChild(u), i.appendData(u.data)) : i = u;
					}
					return !0;
				} });
			},
			isSupported: function(o, i) {
				return this.ownerDocument.implementation.hasFeature(o, i);
			},
			hasAttributes: function() {
				return this.attributes.length > 0;
			},
			lookupPrefix: function(o) {
				for (var i = this; i;) {
					var u = i._nsMap;
					if (u) {
						for (var p in u) if (Object.prototype.hasOwnProperty.call(u, p) && u[p] === o) return p;
					}
					i = i.nodeType == C ? i.ownerDocument : i.parentNode;
				}
				return null;
			},
			lookupNamespaceURI: function(o) {
				for (var i = this; i;) {
					var u = i._nsMap;
					if (u && Object.prototype.hasOwnProperty.call(u, o)) return u[o];
					i = i.nodeType == C ? i.ownerDocument : i.parentNode;
				}
				return null;
			},
			isDefaultNamespace: function(o) {
				return this.lookupPrefix(o) == null;
			}
		};
		function Q(o) {
			return o == "<" && "&lt;" || o == ">" && "&gt;" || o == "&" && "&amp;" || o == "\"" && "&quot;" || "&#" + o.charCodeAt() + ";";
		}
		d(h, V), d(h, V.prototype);
		function X(o, i) {
			return W(o, null, { enter: function(u) {
				return i(u) ? W.STOP : !0;
			} }) === W.STOP;
		}
		function W(o, i, u) {
			for (var p = [{
				node: o,
				context: i,
				phase: W.ENTER
			}]; p.length > 0;) {
				var b = p.pop();
				if (b.phase === W.ENTER) {
					var A = u.enter(b.node, b.context);
					if (A === W.STOP) return W.STOP;
					if (p.push({
						node: b.node,
						context: A,
						phase: W.EXIT
					}), A == null) continue;
					for (var y = b.node.lastChild; y;) p.push({
						node: y,
						context: A,
						phase: W.ENTER
					}), y = y.previousSibling;
				} else u.exit && u.exit(b.node, b.context);
			}
		}
		W.STOP = Symbol("walkDOM.STOP"), W.ENTER = 0, W.EXIT = 1;
		function he() {
			this.ownerDocument = this;
		}
		function re(o, i, u) {
			o && o._inc++, u.namespaceURI === n.XMLNS && (i._nsMap[u.prefix ? u.localName : ""] = u.value);
		}
		function se(o, i, u, p) {
			o && o._inc++, u.namespaceURI === n.XMLNS && delete i._nsMap[u.prefix ? u.localName : ""];
		}
		function ye(o, i, u) {
			if (o && o._inc) {
				o._inc++;
				var p = i.childNodes;
				if (u) p[p.length++] = u;
				else {
					for (var b = i.firstChild, A = 0; b;) p[A++] = b, b = b.nextSibling;
					p.length = A, delete p[p.length];
				}
			}
		}
		function Te(o, i) {
			var u = i.previousSibling, p = i.nextSibling;
			return u ? u.nextSibling = p : o.firstChild = p, p ? p.previousSibling = u : o.lastChild = u, i.parentNode = null, i.previousSibling = null, i.nextSibling = null, ye(o.ownerDocument, o), i;
		}
		function _e(o) {
			return o && (o.nodeType === V.DOCUMENT_NODE || o.nodeType === V.DOCUMENT_FRAGMENT_NODE || o.nodeType === V.ELEMENT_NODE);
		}
		function ae(o) {
			return o && (z(o) || Ue(o) || ce(o) || o.nodeType === V.DOCUMENT_FRAGMENT_NODE || o.nodeType === V.COMMENT_NODE || o.nodeType === V.PROCESSING_INSTRUCTION_NODE);
		}
		function ce(o) {
			return o && o.nodeType === V.DOCUMENT_TYPE_NODE;
		}
		function z(o) {
			return o && o.nodeType === V.ELEMENT_NODE;
		}
		function Ue(o) {
			return o && o.nodeType === V.TEXT_NODE;
		}
		function lr(o, i) {
			var u = o.childNodes || [];
			if (t(u, z) || ce(i)) return !1;
			var p = t(u, ce);
			return !(i && p && u.indexOf(p) > u.indexOf(i));
		}
		function je(o, i) {
			var u = o.childNodes || [];
			function p(A) {
				return z(A) && A !== i;
			}
			if (t(u, p)) return !1;
			var b = t(u, ce);
			return !(i && b && u.indexOf(b) > u.indexOf(i));
		}
		function cr(o, i, u) {
			if (!_e(o)) throw new E(c, "Unexpected parent node type " + o.nodeType);
			if (u && u.parentNode !== o) throw new E(S, "child not in parent");
			if (!ae(i) || ce(i) && o.nodeType !== V.DOCUMENT_NODE) throw new E(c, "Unexpected node type " + i.nodeType + " for parent node type " + o.nodeType);
		}
		function Y(o, i, u) {
			var p = o.childNodes || [], b = i.childNodes || [];
			if (i.nodeType === V.DOCUMENT_FRAGMENT_NODE) {
				var A = b.filter(z);
				if (A.length > 1 || t(b, Ue)) throw new E(c, "More than one element or text in fragment");
				if (A.length === 1 && !lr(o, u)) throw new E(c, "Element in fragment can not be inserted before doctype");
			}
			if (z(i) && !lr(o, u)) throw new E(c, "Only one element can be added and only after doctype");
			if (ce(i)) {
				if (t(p, ce)) throw new E(c, "Only one doctype is allowed");
				var y = t(p, z);
				if (u && p.indexOf(y) < p.indexOf(u)) throw new E(c, "Doctype can only be inserted before an element");
				if (!u && y) throw new E(c, "Doctype can not be appended since element is present");
			}
		}
		function ue(o, i, u) {
			var p = o.childNodes || [], b = i.childNodes || [];
			if (i.nodeType === V.DOCUMENT_FRAGMENT_NODE) {
				var A = b.filter(z);
				if (A.length > 1 || t(b, Ue)) throw new E(c, "More than one element or text in fragment");
				if (A.length === 1 && !je(o, u)) throw new E(c, "Element in fragment can not be inserted before doctype");
			}
			if (z(i) && !je(o, u)) throw new E(c, "Only one element can be added and only after doctype");
			if (ce(i)) {
				let te = function(oe) {
					return ce(oe) && oe !== u;
				};
				if (t(p, te)) throw new E(c, "Only one doctype is allowed");
				var y = t(p, z);
				if (u && p.indexOf(y) < p.indexOf(u)) throw new E(c, "Doctype can only be inserted before an element");
			}
		}
		function Ve(o, i, u, p) {
			cr(o, i, u), o.nodeType === V.DOCUMENT_NODE && (p || Y)(o, i, u);
			var b = i.parentNode;
			if (b && b.removeChild(i), i.nodeType === k) {
				var A = i.firstChild;
				if (A == null) return i;
				var y = i.lastChild;
			} else A = y = i;
			var K = u ? u.previousSibling : o.lastChild;
			A.previousSibling = K, y.nextSibling = u, K ? K.nextSibling = A : o.firstChild = A, u == null ? o.lastChild = y : u.previousSibling = y;
			do {
				A.parentNode = o;
				var te = o.ownerDocument || o;
				Ye(A, te);
			} while (A !== y && (A = A.nextSibling));
			return ye(o.ownerDocument || o, o), i.nodeType == k && (i.firstChild = i.lastChild = null), i;
		}
		function Ye(o, i) {
			if (o.ownerDocument !== i) {
				if (o.ownerDocument = i, o.nodeType === T && o.attributes) for (var u = 0; u < o.attributes.length; u++) {
					var p = o.attributes.item(u);
					p && (p.ownerDocument = i);
				}
				for (var b = o.firstChild; b;) Ye(b, i), b = b.nextSibling;
			}
		}
		function wi(o, i) {
			return i.parentNode && i.parentNode.removeChild(i), i.parentNode = o, i.previousSibling = o.lastChild, i.nextSibling = null, i.previousSibling ? i.previousSibling.nextSibling = i : o.firstChild = i, o.lastChild = i, ye(o.ownerDocument, o, i), Ye(i, o.ownerDocument || o), i;
		}
		he.prototype = {
			nodeName: "#document",
			nodeType: P,
			doctype: null,
			documentElement: null,
			_inc: 1,
			insertBefore: function(o, i) {
				if (o.nodeType == k) {
					for (var u = o.firstChild; u;) {
						var p = u.nextSibling;
						this.insertBefore(u, i), u = p;
					}
					return o;
				}
				return Ve(this, o, i), Ye(o, this), this.documentElement === null && o.nodeType === T && (this.documentElement = o), o;
			},
			removeChild: function(o) {
				return this.documentElement == o && (this.documentElement = null), Te(this, o);
			},
			replaceChild: function(o, i) {
				Ve(this, o, i, ue), Ye(o, this), i && this.removeChild(i), z(o) && (this.documentElement = o);
			},
			importNode: function(o, i) {
				return Ei(this, o, i);
			},
			getElementById: function(o) {
				var i = null;
				return X(this.documentElement, function(u) {
					if (u.nodeType == T && u.getAttribute("id") == o) return i = u, !0;
				}), i;
			},
			getElementsByClassName: function(o) {
				var i = f(o);
				return new U(this, function(u) {
					var p = [];
					return i.length > 0 && X(u.documentElement, function(b) {
						if (b !== u && b.nodeType === T) {
							var A = b.getAttribute("class");
							if (A) {
								var y = o === A;
								if (!y) {
									var K = f(A);
									y = i.every(m(K));
								}
								y && p.push(b);
							}
						}
					}), p;
				});
			},
			createElement: function(o) {
				var i = new Ie();
				i.ownerDocument = this, i.nodeName = o, i.tagName = o, i.localName = o, i.childNodes = new x();
				var u = i.attributes = new D();
				return u._ownerElement = i, i;
			},
			createDocumentFragment: function() {
				var o = new mr();
				return o.ownerDocument = this, o.childNodes = new x(), o;
			},
			createTextNode: function(o) {
				var i = new Lr();
				return i.ownerDocument = this, i.appendData(o), i;
			},
			createComment: function(o) {
				var i = new Pr();
				return i.ownerDocument = this, i.appendData(o), i;
			},
			createCDATASection: function(o) {
				if (o.indexOf("]]>") !== -1) throw new E(g, "data contains \"]]>\"");
				var i = new Cr();
				return i.ownerDocument = this, i.appendData(o), i;
			},
			createProcessingInstruction: function(o, i) {
				var u = new Mr();
				return u.ownerDocument = this, u.tagName = u.nodeName = u.target = o, u.nodeValue = u.data = i, u;
			},
			createAttribute: function(o) {
				var i = new fr();
				return i.ownerDocument = this, i.name = o, i.nodeName = o, i.localName = o, i.specified = !0, i;
			},
			createEntityReference: function(o) {
				var i = new kr();
				return i.ownerDocument = this, i.nodeName = o, i;
			},
			createElementNS: function(o, i) {
				var u = new Ie(), p = i.split(":"), b = u.attributes = new D();
				return u.childNodes = new x(), u.ownerDocument = this, u.nodeName = i, u.tagName = i, u.namespaceURI = o, p.length == 2 ? (u.prefix = p[0], u.localName = p[1]) : u.localName = i, b._ownerElement = u, u;
			},
			createAttributeNS: function(o, i) {
				var u = new fr(), p = i.split(":");
				return u.ownerDocument = this, u.nodeName = i, u.name = i, u.namespaceURI = o, u.specified = !0, p.length == 2 ? (u.prefix = p[0], u.localName = p[1]) : u.localName = i, u;
			}
		}, w(he, V);
		function Ie() {
			this._nsMap = {};
		}
		Ie.prototype = {
			nodeType: T,
			hasAttribute: function(o) {
				return this.getAttributeNode(o) != null;
			},
			getAttribute: function(o) {
				var i = this.getAttributeNode(o);
				return i && i.value || "";
			},
			getAttributeNode: function(o) {
				return this.attributes.getNamedItem(o);
			},
			setAttribute: function(o, i) {
				var u = this.ownerDocument.createAttribute(o);
				u.value = u.nodeValue = "" + i, this.setAttributeNode(u);
			},
			removeAttribute: function(o) {
				var i = this.getAttributeNode(o);
				i && this.removeAttributeNode(i);
			},
			appendChild: function(o) {
				return o.nodeType === k ? this.insertBefore(o, null) : wi(this, o);
			},
			setAttributeNode: function(o) {
				return this.attributes.setNamedItem(o);
			},
			setAttributeNodeNS: function(o) {
				return this.attributes.setNamedItemNS(o);
			},
			removeAttributeNode: function(o) {
				return this.attributes.removeNamedItem(o.nodeName);
			},
			removeAttributeNS: function(o, i) {
				var u = this.getAttributeNodeNS(o, i);
				u && this.removeAttributeNode(u);
			},
			hasAttributeNS: function(o, i) {
				return this.getAttributeNodeNS(o, i) != null;
			},
			getAttributeNS: function(o, i) {
				var u = this.getAttributeNodeNS(o, i);
				return u && u.value || "";
			},
			setAttributeNS: function(o, i, u) {
				var p = this.ownerDocument.createAttributeNS(o, i);
				p.value = p.nodeValue = "" + u, this.setAttributeNode(p);
			},
			getAttributeNodeNS: function(o, i) {
				return this.attributes.getNamedItemNS(o, i);
			},
			getElementsByTagName: function(o) {
				return new U(this, function(i) {
					var u = [];
					return X(i, function(p) {
						p !== i && p.nodeType == T && (o === "*" || p.tagName == o) && u.push(p);
					}), u;
				});
			},
			getElementsByTagNameNS: function(o, i) {
				return new U(this, function(u) {
					var p = [];
					return X(u, function(b) {
						b !== u && b.nodeType === T && (o === "*" || b.namespaceURI === o) && (i === "*" || b.localName == i) && p.push(b);
					}), p;
				});
			}
		}, he.prototype.getElementsByTagName = Ie.prototype.getElementsByTagName, he.prototype.getElementsByTagNameNS = Ie.prototype.getElementsByTagNameNS, w(Ie, V);
		function fr() {}
		fr.prototype.nodeType = C, w(fr, V);
		function Ke() {}
		Ke.prototype = {
			data: "",
			substringData: function(o, i) {
				return this.data.substring(o, o + i);
			},
			appendData: function(o) {
				o = this.data + o, this.nodeValue = this.data = o, this.length = o.length;
			},
			insertData: function(o, i) {
				this.replaceData(o, 0, i);
			},
			appendChild: function(o) {
				throw new Error(q[c]);
			},
			deleteData: function(o, i) {
				this.replaceData(o, i, "");
			},
			replaceData: function(o, i, u) {
				var p = this.data.substring(0, o), b = this.data.substring(o + i);
				u = p + u + b, this.nodeValue = this.data = u, this.length = u.length;
			}
		}, w(Ke, V);
		function Lr() {}
		Lr.prototype = {
			nodeName: "#text",
			nodeType: $,
			splitText: function(o) {
				var i = this.data, u = i.substring(o);
				i = i.substring(0, o), this.data = this.nodeValue = i, this.length = i.length;
				var p = this.ownerDocument.createTextNode(u);
				return this.parentNode && this.parentNode.insertBefore(p, this.nextSibling), p;
			}
		}, w(Lr, Ke);
		function Pr() {}
		Pr.prototype = {
			nodeName: "#comment",
			nodeType: _
		}, w(Pr, Ke);
		function Cr() {}
		Cr.prototype = {
			nodeName: "#cdata-section",
			nodeType: H
		}, w(Cr, Ke);
		function pr() {}
		pr.prototype.nodeType = F, w(pr, V);
		function Ct() {}
		Ct.prototype.nodeType = Z, w(Ct, V);
		function kt() {}
		kt.prototype.nodeType = v, w(kt, V);
		function kr() {}
		kr.prototype.nodeType = j, w(kr, V);
		function mr() {}
		mr.prototype.nodeName = "#document-fragment", mr.prototype.nodeType = k, w(mr, V);
		function Mr() {}
		Mr.prototype.nodeType = L, w(Mr, V);
		function Mt() {}
		Mt.prototype.serializeToString = function(o, i, u, p) {
			return Ut.call(o, i, u, p);
		}, V.prototype.toString = Ut;
		function Ut(o, i, u) {
			var p = !!u && !!u.requireWellFormed, b = [], A = this.nodeType == 9 && this.documentElement || this, y = A.prefix, K = A.namespaceURI;
			if (K && y == null) {
				var y = A.lookupPrefix(K);
				if (y == null) var te = [{
					namespace: K,
					prefix: null
				}];
			}
			return Ur(this, b, o, i, te, p), b.join("");
		}
		function jt(o, i, u) {
			var p = o.prefix || "", b = o.namespaceURI;
			if (!b || p === "xml" && b === n.XML || b === n.XMLNS) return !1;
			for (var A = u.length; A--;) {
				var y = u[A];
				if (y.prefix === p) return y.namespace !== b;
			}
			return !0;
		}
		function hr(o, i, u) {
			o.push(" ", i, "=\"", u.replace(/[<>&"\t\n\r]/g, Q), "\"");
		}
		function Ur(o, i, u, p, b, A) {
			b || (b = []), W(o, {
				ns: b,
				isHTML: u
			}, {
				enter: function(y, K) {
					var te = K.ns, oe = K.isHTML;
					if (p) if (y = p(y), y) {
						if (typeof y == "string") return i.push(y), null;
					} else return null;
					switch (y.nodeType) {
						case T:
							var be = y.attributes, vr = be.length, Se = y.tagName;
							oe = n.isHTML(y.namespaceURI) || oe;
							var Ne = Se;
							if (!oe && !y.prefix && y.namespaceURI) {
								for (var gr, dr = 0; dr < be.length; dr++) if (be.item(dr).name === "xmlns") {
									gr = be.item(dr).value;
									break;
								}
								if (!gr) for (var xe = te.length - 1; xe >= 0; xe--) {
									var Re = te[xe];
									if (Re.prefix === "" && Re.namespace === y.namespaceURI) {
										gr = Re.namespace;
										break;
									}
								}
								if (gr !== y.namespaceURI) for (var xe = te.length - 1; xe >= 0; xe--) {
									var Re = te[xe];
									if (Re.namespace === y.namespaceURI) {
										Re.prefix && (Ne = Re.prefix + ":" + Se);
										break;
									}
								}
							}
							i.push("<", Ne);
							for (var Oe = te.slice(), qe = 0; qe < vr; qe++) {
								var ve = be.item(qe);
								ve.prefix == "xmlns" ? Oe.push({
									prefix: ve.localName,
									namespace: ve.value
								}) : ve.nodeName == "xmlns" && Oe.push({
									prefix: "",
									namespace: ve.value
								});
							}
							for (var qe = 0; qe < vr; qe++) {
								var ve = be.item(qe);
								if (jt(ve, oe, Oe)) {
									var jr = ve.prefix || "", Je = ve.namespaceURI;
									hr(i, jr ? "xmlns:" + jr : "xmlns", Je), Oe.push({
										prefix: jr,
										namespace: Je
									});
								}
								var Qe = p ? p(ve) : ve;
								Qe && (typeof Qe == "string" ? i.push(Qe) : hr(i, Qe.name, Qe.value));
							}
							if (Se === Ne && jt(y, oe, Oe)) {
								var Vr = y.prefix || "", Je = y.namespaceURI;
								hr(i, Vr ? "xmlns:" + Vr : "xmlns", Je), Oe.push({
									prefix: Vr,
									namespace: Je
								});
							}
							var Le = y.firstChild;
							if (Le || oe && !/^(?:meta|link|img|br|hr|input)$/i.test(Se)) {
								if (i.push(">"), oe && /^script$/i.test(Se)) {
									for (; Le;) Le.data ? i.push(Le.data) : Ur(Le, i, oe, p, Oe.slice(), A), Le = Le.nextSibling;
									return i.push("</", Se, ">"), null;
								}
								return {
									ns: Oe,
									isHTML: oe,
									tag: Ne
								};
							} else return i.push("/>"), null;
						case P:
						case k: return {
							ns: te.slice(),
							isHTML: oe,
							tag: null
						};
						case C: return hr(i, y.name, y.value), null;
						case $: return i.push(y.data.replace(/[<&>]/g, Q)), null;
						case H:
							if (A && y.data.indexOf("]]>") !== -1) throw new E(N, "The CDATASection data contains \"]]>\"");
							return i.push("<![CDATA[", y.data.replace(/]]>/g, "]]]]><![CDATA[>"), "]]>"), null;
						case _:
							if (A && y.data.indexOf("-->") !== -1) throw new E(N, "The comment node data contains \"-->\"");
							return i.push("<!--", y.data, "-->"), null;
						case F:
							if (A) {
								if (y.publicId && !/^("[\x20\r\na-zA-Z0-9\-()+,.\/:=?;!*#@$_%']*"|'[\x20\r\na-zA-Z0-9\-()+,.\/:=?;!*#@$_%'"]*')$/.test(y.publicId)) throw new E(N, "DocumentType publicId is not a valid PubidLiteral");
								if (y.systemId && !/^("[^"]*"|'[^']*')$/.test(y.systemId)) throw new E(N, "DocumentType systemId is not a valid SystemLiteral");
								if (y.internalSubset && y.internalSubset.indexOf("]>") !== -1) throw new E(N, "DocumentType internalSubset contains \"]>\"");
							}
							var $t = y.publicId, Fe = y.systemId;
							if (i.push("<!DOCTYPE ", y.name), $t) i.push(" PUBLIC ", $t), Fe && Fe != "." && i.push(" ", Fe), i.push(">");
							else if (Fe && Fe != ".") i.push(" SYSTEM ", Fe, ">");
							else {
								var Bt = y.internalSubset;
								Bt && i.push(" [", Bt, "]"), i.push(">");
							}
							return null;
						case L:
							if (A && y.data.indexOf("?>") !== -1) throw new E(N, "The ProcessingInstruction data contains \"?>\"");
							return i.push("<?", y.target, " ", y.data, "?>"), null;
						case j: return i.push("&", y.nodeName, ";"), null;
						default: return i.push("??", y.nodeName), null;
					}
				},
				exit: function(y, K) {
					K && K.tag && i.push("</", K.tag, ">");
				}
			});
		}
		function Ei(o, i, u) {
			var p;
			return W(i, null, { enter: function(b, A) {
				var y = b.cloneNode(!1);
				return y.ownerDocument = o, y.parentNode = null, A === null ? p = y : A.appendChild(y), b.nodeType === C || u ? y : null;
			} }), p;
		}
		function Vt(o, i, u) {
			var p;
			return W(i, null, { enter: function(b, A) {
				var y = new b.constructor();
				for (var K in b) if (Object.prototype.hasOwnProperty.call(b, K)) {
					var te = b[K];
					typeof te != "object" && te != y[K] && (y[K] = te);
				}
				b.childNodes && (y.childNodes = new x()), y.ownerDocument = o;
				var oe = u;
				switch (y.nodeType) {
					case T:
						var be = b.attributes, vr = y.attributes = new D(), Se = be.length;
						vr._ownerElement = y;
						for (var Ne = 0; Ne < Se; Ne++) y.setAttributeNode(Vt(o, be.item(Ne), !0));
						break;
					case C: oe = !0;
				}
				return A !== null ? A.appendChild(y) : p = y, oe ? y : null;
			} }), p;
		}
		function Ft(o, i, u) {
			o[i] = u;
		}
		try {
			Object.defineProperty && (Object.defineProperty(U.prototype, "length", { get: function() {
				return I(this), this.$$length;
			} }), Object.defineProperty(V.prototype, "textContent", {
				get: function() {
					if (this.nodeType === T || this.nodeType === k) {
						var o = [];
						return W(this, null, { enter: function(i) {
							if (i.nodeType === T || i.nodeType === k) return !0;
							if (i.nodeType === L || i.nodeType === _) return null;
							o.push(i.nodeValue);
						} }), o.join("");
					}
					return this.nodeValue;
				},
				set: function(o) {
					switch (this.nodeType) {
						case T:
						case k:
							for (; this.firstChild;) this.removeChild(this.firstChild);
							(o || String(o)) && this.appendChild(this.ownerDocument.createTextNode(o));
							break;
						default: this.data = o, this.value = o, this.nodeValue = o;
					}
				}
			}), Ft = function(o, i, u) {
				o["$$" + i] = u;
			});
		} catch {}
		e.DocumentType = pr, e.DOMException = E, e.DOMImplementation = J, e.Element = Ie, e.Node = V, e.NodeList = x, e.walkDOM = W, e.XMLSerializer = Mt;
	})), Ht = Pe(((e) => {
		var r = er().freeze;
		e.XML_ENTITIES = r({
			amp: "&",
			apos: "'",
			gt: ">",
			lt: "<",
			quot: "\""
		}), e.HTML_ENTITIES = r({
			Aacute: "Á",
			aacute: "á",
			Abreve: "Ă",
			abreve: "ă",
			ac: "∾",
			acd: "∿",
			acE: "∾̳",
			Acirc: "Â",
			acirc: "â",
			acute: "´",
			Acy: "А",
			acy: "а",
			AElig: "Æ",
			aelig: "æ",
			af: "⁡",
			Afr: "𝔄",
			afr: "𝔞",
			Agrave: "À",
			agrave: "à",
			alefsym: "ℵ",
			aleph: "ℵ",
			Alpha: "Α",
			alpha: "α",
			Amacr: "Ā",
			amacr: "ā",
			amalg: "⨿",
			AMP: "&",
			amp: "&",
			And: "⩓",
			and: "∧",
			andand: "⩕",
			andd: "⩜",
			andslope: "⩘",
			andv: "⩚",
			ang: "∠",
			ange: "⦤",
			angle: "∠",
			angmsd: "∡",
			angmsdaa: "⦨",
			angmsdab: "⦩",
			angmsdac: "⦪",
			angmsdad: "⦫",
			angmsdae: "⦬",
			angmsdaf: "⦭",
			angmsdag: "⦮",
			angmsdah: "⦯",
			angrt: "∟",
			angrtvb: "⊾",
			angrtvbd: "⦝",
			angsph: "∢",
			angst: "Å",
			angzarr: "⍼",
			Aogon: "Ą",
			aogon: "ą",
			Aopf: "𝔸",
			aopf: "𝕒",
			ap: "≈",
			apacir: "⩯",
			apE: "⩰",
			ape: "≊",
			apid: "≋",
			apos: "'",
			ApplyFunction: "⁡",
			approx: "≈",
			approxeq: "≊",
			Aring: "Å",
			aring: "å",
			Ascr: "𝒜",
			ascr: "𝒶",
			Assign: "≔",
			ast: "*",
			asymp: "≈",
			asympeq: "≍",
			Atilde: "Ã",
			atilde: "ã",
			Auml: "Ä",
			auml: "ä",
			awconint: "∳",
			awint: "⨑",
			backcong: "≌",
			backepsilon: "϶",
			backprime: "‵",
			backsim: "∽",
			backsimeq: "⋍",
			Backslash: "∖",
			Barv: "⫧",
			barvee: "⊽",
			Barwed: "⌆",
			barwed: "⌅",
			barwedge: "⌅",
			bbrk: "⎵",
			bbrktbrk: "⎶",
			bcong: "≌",
			Bcy: "Б",
			bcy: "б",
			bdquo: "„",
			becaus: "∵",
			Because: "∵",
			because: "∵",
			bemptyv: "⦰",
			bepsi: "϶",
			bernou: "ℬ",
			Bernoullis: "ℬ",
			Beta: "Β",
			beta: "β",
			beth: "ℶ",
			between: "≬",
			Bfr: "𝔅",
			bfr: "𝔟",
			bigcap: "⋂",
			bigcirc: "◯",
			bigcup: "⋃",
			bigodot: "⨀",
			bigoplus: "⨁",
			bigotimes: "⨂",
			bigsqcup: "⨆",
			bigstar: "★",
			bigtriangledown: "▽",
			bigtriangleup: "△",
			biguplus: "⨄",
			bigvee: "⋁",
			bigwedge: "⋀",
			bkarow: "⤍",
			blacklozenge: "⧫",
			blacksquare: "▪",
			blacktriangle: "▴",
			blacktriangledown: "▾",
			blacktriangleleft: "◂",
			blacktriangleright: "▸",
			blank: "␣",
			blk12: "▒",
			blk14: "░",
			blk34: "▓",
			block: "█",
			bne: "=⃥",
			bnequiv: "≡⃥",
			bNot: "⫭",
			bnot: "⌐",
			Bopf: "𝔹",
			bopf: "𝕓",
			bot: "⊥",
			bottom: "⊥",
			bowtie: "⋈",
			boxbox: "⧉",
			boxDL: "╗",
			boxDl: "╖",
			boxdL: "╕",
			boxdl: "┐",
			boxDR: "╔",
			boxDr: "╓",
			boxdR: "╒",
			boxdr: "┌",
			boxH: "═",
			boxh: "─",
			boxHD: "╦",
			boxHd: "╤",
			boxhD: "╥",
			boxhd: "┬",
			boxHU: "╩",
			boxHu: "╧",
			boxhU: "╨",
			boxhu: "┴",
			boxminus: "⊟",
			boxplus: "⊞",
			boxtimes: "⊠",
			boxUL: "╝",
			boxUl: "╜",
			boxuL: "╛",
			boxul: "┘",
			boxUR: "╚",
			boxUr: "╙",
			boxuR: "╘",
			boxur: "└",
			boxV: "║",
			boxv: "│",
			boxVH: "╬",
			boxVh: "╫",
			boxvH: "╪",
			boxvh: "┼",
			boxVL: "╣",
			boxVl: "╢",
			boxvL: "╡",
			boxvl: "┤",
			boxVR: "╠",
			boxVr: "╟",
			boxvR: "╞",
			boxvr: "├",
			bprime: "‵",
			Breve: "˘",
			breve: "˘",
			brvbar: "¦",
			Bscr: "ℬ",
			bscr: "𝒷",
			bsemi: "⁏",
			bsim: "∽",
			bsime: "⋍",
			bsol: "\\",
			bsolb: "⧅",
			bsolhsub: "⟈",
			bull: "•",
			bullet: "•",
			bump: "≎",
			bumpE: "⪮",
			bumpe: "≏",
			Bumpeq: "≎",
			bumpeq: "≏",
			Cacute: "Ć",
			cacute: "ć",
			Cap: "⋒",
			cap: "∩",
			capand: "⩄",
			capbrcup: "⩉",
			capcap: "⩋",
			capcup: "⩇",
			capdot: "⩀",
			CapitalDifferentialD: "ⅅ",
			caps: "∩︀",
			caret: "⁁",
			caron: "ˇ",
			Cayleys: "ℭ",
			ccaps: "⩍",
			Ccaron: "Č",
			ccaron: "č",
			Ccedil: "Ç",
			ccedil: "ç",
			Ccirc: "Ĉ",
			ccirc: "ĉ",
			Cconint: "∰",
			ccups: "⩌",
			ccupssm: "⩐",
			Cdot: "Ċ",
			cdot: "ċ",
			cedil: "¸",
			Cedilla: "¸",
			cemptyv: "⦲",
			cent: "¢",
			CenterDot: "·",
			centerdot: "·",
			Cfr: "ℭ",
			cfr: "𝔠",
			CHcy: "Ч",
			chcy: "ч",
			check: "✓",
			checkmark: "✓",
			Chi: "Χ",
			chi: "χ",
			cir: "○",
			circ: "ˆ",
			circeq: "≗",
			circlearrowleft: "↺",
			circlearrowright: "↻",
			circledast: "⊛",
			circledcirc: "⊚",
			circleddash: "⊝",
			CircleDot: "⊙",
			circledR: "®",
			circledS: "Ⓢ",
			CircleMinus: "⊖",
			CirclePlus: "⊕",
			CircleTimes: "⊗",
			cirE: "⧃",
			cire: "≗",
			cirfnint: "⨐",
			cirmid: "⫯",
			cirscir: "⧂",
			ClockwiseContourIntegral: "∲",
			CloseCurlyDoubleQuote: "”",
			CloseCurlyQuote: "’",
			clubs: "♣",
			clubsuit: "♣",
			Colon: "∷",
			colon: ":",
			Colone: "⩴",
			colone: "≔",
			coloneq: "≔",
			comma: ",",
			commat: "@",
			comp: "∁",
			compfn: "∘",
			complement: "∁",
			complexes: "ℂ",
			cong: "≅",
			congdot: "⩭",
			Congruent: "≡",
			Conint: "∯",
			conint: "∮",
			ContourIntegral: "∮",
			Copf: "ℂ",
			copf: "𝕔",
			coprod: "∐",
			Coproduct: "∐",
			COPY: "©",
			copy: "©",
			copysr: "℗",
			CounterClockwiseContourIntegral: "∳",
			crarr: "↵",
			Cross: "⨯",
			cross: "✗",
			Cscr: "𝒞",
			cscr: "𝒸",
			csub: "⫏",
			csube: "⫑",
			csup: "⫐",
			csupe: "⫒",
			ctdot: "⋯",
			cudarrl: "⤸",
			cudarrr: "⤵",
			cuepr: "⋞",
			cuesc: "⋟",
			cularr: "↶",
			cularrp: "⤽",
			Cup: "⋓",
			cup: "∪",
			cupbrcap: "⩈",
			CupCap: "≍",
			cupcap: "⩆",
			cupcup: "⩊",
			cupdot: "⊍",
			cupor: "⩅",
			cups: "∪︀",
			curarr: "↷",
			curarrm: "⤼",
			curlyeqprec: "⋞",
			curlyeqsucc: "⋟",
			curlyvee: "⋎",
			curlywedge: "⋏",
			curren: "¤",
			curvearrowleft: "↶",
			curvearrowright: "↷",
			cuvee: "⋎",
			cuwed: "⋏",
			cwconint: "∲",
			cwint: "∱",
			cylcty: "⌭",
			Dagger: "‡",
			dagger: "†",
			daleth: "ℸ",
			Darr: "↡",
			dArr: "⇓",
			darr: "↓",
			dash: "‐",
			Dashv: "⫤",
			dashv: "⊣",
			dbkarow: "⤏",
			dblac: "˝",
			Dcaron: "Ď",
			dcaron: "ď",
			Dcy: "Д",
			dcy: "д",
			DD: "ⅅ",
			dd: "ⅆ",
			ddagger: "‡",
			ddarr: "⇊",
			DDotrahd: "⤑",
			ddotseq: "⩷",
			deg: "°",
			Del: "∇",
			Delta: "Δ",
			delta: "δ",
			demptyv: "⦱",
			dfisht: "⥿",
			Dfr: "𝔇",
			dfr: "𝔡",
			dHar: "⥥",
			dharl: "⇃",
			dharr: "⇂",
			DiacriticalAcute: "´",
			DiacriticalDot: "˙",
			DiacriticalDoubleAcute: "˝",
			DiacriticalGrave: "`",
			DiacriticalTilde: "˜",
			diam: "⋄",
			Diamond: "⋄",
			diamond: "⋄",
			diamondsuit: "♦",
			diams: "♦",
			die: "¨",
			DifferentialD: "ⅆ",
			digamma: "ϝ",
			disin: "⋲",
			div: "÷",
			divide: "÷",
			divideontimes: "⋇",
			divonx: "⋇",
			DJcy: "Ђ",
			djcy: "ђ",
			dlcorn: "⌞",
			dlcrop: "⌍",
			dollar: "$",
			Dopf: "𝔻",
			dopf: "𝕕",
			Dot: "¨",
			dot: "˙",
			DotDot: "⃜",
			doteq: "≐",
			doteqdot: "≑",
			DotEqual: "≐",
			dotminus: "∸",
			dotplus: "∔",
			dotsquare: "⊡",
			doublebarwedge: "⌆",
			DoubleContourIntegral: "∯",
			DoubleDot: "¨",
			DoubleDownArrow: "⇓",
			DoubleLeftArrow: "⇐",
			DoubleLeftRightArrow: "⇔",
			DoubleLeftTee: "⫤",
			DoubleLongLeftArrow: "⟸",
			DoubleLongLeftRightArrow: "⟺",
			DoubleLongRightArrow: "⟹",
			DoubleRightArrow: "⇒",
			DoubleRightTee: "⊨",
			DoubleUpArrow: "⇑",
			DoubleUpDownArrow: "⇕",
			DoubleVerticalBar: "∥",
			DownArrow: "↓",
			Downarrow: "⇓",
			downarrow: "↓",
			DownArrowBar: "⤓",
			DownArrowUpArrow: "⇵",
			DownBreve: "̑",
			downdownarrows: "⇊",
			downharpoonleft: "⇃",
			downharpoonright: "⇂",
			DownLeftRightVector: "⥐",
			DownLeftTeeVector: "⥞",
			DownLeftVector: "↽",
			DownLeftVectorBar: "⥖",
			DownRightTeeVector: "⥟",
			DownRightVector: "⇁",
			DownRightVectorBar: "⥗",
			DownTee: "⊤",
			DownTeeArrow: "↧",
			drbkarow: "⤐",
			drcorn: "⌟",
			drcrop: "⌌",
			Dscr: "𝒟",
			dscr: "𝒹",
			DScy: "Ѕ",
			dscy: "ѕ",
			dsol: "⧶",
			Dstrok: "Đ",
			dstrok: "đ",
			dtdot: "⋱",
			dtri: "▿",
			dtrif: "▾",
			duarr: "⇵",
			duhar: "⥯",
			dwangle: "⦦",
			DZcy: "Џ",
			dzcy: "џ",
			dzigrarr: "⟿",
			Eacute: "É",
			eacute: "é",
			easter: "⩮",
			Ecaron: "Ě",
			ecaron: "ě",
			ecir: "≖",
			Ecirc: "Ê",
			ecirc: "ê",
			ecolon: "≕",
			Ecy: "Э",
			ecy: "э",
			eDDot: "⩷",
			Edot: "Ė",
			eDot: "≑",
			edot: "ė",
			ee: "ⅇ",
			efDot: "≒",
			Efr: "𝔈",
			efr: "𝔢",
			eg: "⪚",
			Egrave: "È",
			egrave: "è",
			egs: "⪖",
			egsdot: "⪘",
			el: "⪙",
			Element: "∈",
			elinters: "⏧",
			ell: "ℓ",
			els: "⪕",
			elsdot: "⪗",
			Emacr: "Ē",
			emacr: "ē",
			empty: "∅",
			emptyset: "∅",
			EmptySmallSquare: "◻",
			emptyv: "∅",
			EmptyVerySmallSquare: "▫",
			emsp: " ",
			emsp13: " ",
			emsp14: " ",
			ENG: "Ŋ",
			eng: "ŋ",
			ensp: " ",
			Eogon: "Ę",
			eogon: "ę",
			Eopf: "𝔼",
			eopf: "𝕖",
			epar: "⋕",
			eparsl: "⧣",
			eplus: "⩱",
			epsi: "ε",
			Epsilon: "Ε",
			epsilon: "ε",
			epsiv: "ϵ",
			eqcirc: "≖",
			eqcolon: "≕",
			eqsim: "≂",
			eqslantgtr: "⪖",
			eqslantless: "⪕",
			Equal: "⩵",
			equals: "=",
			EqualTilde: "≂",
			equest: "≟",
			Equilibrium: "⇌",
			equiv: "≡",
			equivDD: "⩸",
			eqvparsl: "⧥",
			erarr: "⥱",
			erDot: "≓",
			Escr: "ℰ",
			escr: "ℯ",
			esdot: "≐",
			Esim: "⩳",
			esim: "≂",
			Eta: "Η",
			eta: "η",
			ETH: "Ð",
			eth: "ð",
			Euml: "Ë",
			euml: "ë",
			euro: "€",
			excl: "!",
			exist: "∃",
			Exists: "∃",
			expectation: "ℰ",
			ExponentialE: "ⅇ",
			exponentiale: "ⅇ",
			fallingdotseq: "≒",
			Fcy: "Ф",
			fcy: "ф",
			female: "♀",
			ffilig: "ﬃ",
			fflig: "ﬀ",
			ffllig: "ﬄ",
			Ffr: "𝔉",
			ffr: "𝔣",
			filig: "ﬁ",
			FilledSmallSquare: "◼",
			FilledVerySmallSquare: "▪",
			fjlig: "fj",
			flat: "♭",
			fllig: "ﬂ",
			fltns: "▱",
			fnof: "ƒ",
			Fopf: "𝔽",
			fopf: "𝕗",
			ForAll: "∀",
			forall: "∀",
			fork: "⋔",
			forkv: "⫙",
			Fouriertrf: "ℱ",
			fpartint: "⨍",
			frac12: "½",
			frac13: "⅓",
			frac14: "¼",
			frac15: "⅕",
			frac16: "⅙",
			frac18: "⅛",
			frac23: "⅔",
			frac25: "⅖",
			frac34: "¾",
			frac35: "⅗",
			frac38: "⅜",
			frac45: "⅘",
			frac56: "⅚",
			frac58: "⅝",
			frac78: "⅞",
			frasl: "⁄",
			frown: "⌢",
			Fscr: "ℱ",
			fscr: "𝒻",
			gacute: "ǵ",
			Gamma: "Γ",
			gamma: "γ",
			Gammad: "Ϝ",
			gammad: "ϝ",
			gap: "⪆",
			Gbreve: "Ğ",
			gbreve: "ğ",
			Gcedil: "Ģ",
			Gcirc: "Ĝ",
			gcirc: "ĝ",
			Gcy: "Г",
			gcy: "г",
			Gdot: "Ġ",
			gdot: "ġ",
			gE: "≧",
			ge: "≥",
			gEl: "⪌",
			gel: "⋛",
			geq: "≥",
			geqq: "≧",
			geqslant: "⩾",
			ges: "⩾",
			gescc: "⪩",
			gesdot: "⪀",
			gesdoto: "⪂",
			gesdotol: "⪄",
			gesl: "⋛︀",
			gesles: "⪔",
			Gfr: "𝔊",
			gfr: "𝔤",
			Gg: "⋙",
			gg: "≫",
			ggg: "⋙",
			gimel: "ℷ",
			GJcy: "Ѓ",
			gjcy: "ѓ",
			gl: "≷",
			gla: "⪥",
			glE: "⪒",
			glj: "⪤",
			gnap: "⪊",
			gnapprox: "⪊",
			gnE: "≩",
			gne: "⪈",
			gneq: "⪈",
			gneqq: "≩",
			gnsim: "⋧",
			Gopf: "𝔾",
			gopf: "𝕘",
			grave: "`",
			GreaterEqual: "≥",
			GreaterEqualLess: "⋛",
			GreaterFullEqual: "≧",
			GreaterGreater: "⪢",
			GreaterLess: "≷",
			GreaterSlantEqual: "⩾",
			GreaterTilde: "≳",
			Gscr: "𝒢",
			gscr: "ℊ",
			gsim: "≳",
			gsime: "⪎",
			gsiml: "⪐",
			Gt: "≫",
			GT: ">",
			gt: ">",
			gtcc: "⪧",
			gtcir: "⩺",
			gtdot: "⋗",
			gtlPar: "⦕",
			gtquest: "⩼",
			gtrapprox: "⪆",
			gtrarr: "⥸",
			gtrdot: "⋗",
			gtreqless: "⋛",
			gtreqqless: "⪌",
			gtrless: "≷",
			gtrsim: "≳",
			gvertneqq: "≩︀",
			gvnE: "≩︀",
			Hacek: "ˇ",
			hairsp: " ",
			half: "½",
			hamilt: "ℋ",
			HARDcy: "Ъ",
			hardcy: "ъ",
			hArr: "⇔",
			harr: "↔",
			harrcir: "⥈",
			harrw: "↭",
			Hat: "^",
			hbar: "ℏ",
			Hcirc: "Ĥ",
			hcirc: "ĥ",
			hearts: "♥",
			heartsuit: "♥",
			hellip: "…",
			hercon: "⊹",
			Hfr: "ℌ",
			hfr: "𝔥",
			HilbertSpace: "ℋ",
			hksearow: "⤥",
			hkswarow: "⤦",
			hoarr: "⇿",
			homtht: "∻",
			hookleftarrow: "↩",
			hookrightarrow: "↪",
			Hopf: "ℍ",
			hopf: "𝕙",
			horbar: "―",
			HorizontalLine: "─",
			Hscr: "ℋ",
			hscr: "𝒽",
			hslash: "ℏ",
			Hstrok: "Ħ",
			hstrok: "ħ",
			HumpDownHump: "≎",
			HumpEqual: "≏",
			hybull: "⁃",
			hyphen: "‐",
			Iacute: "Í",
			iacute: "í",
			ic: "⁣",
			Icirc: "Î",
			icirc: "î",
			Icy: "И",
			icy: "и",
			Idot: "İ",
			IEcy: "Е",
			iecy: "е",
			iexcl: "¡",
			iff: "⇔",
			Ifr: "ℑ",
			ifr: "𝔦",
			Igrave: "Ì",
			igrave: "ì",
			ii: "ⅈ",
			iiiint: "⨌",
			iiint: "∭",
			iinfin: "⧜",
			iiota: "℩",
			IJlig: "Ĳ",
			ijlig: "ĳ",
			Im: "ℑ",
			Imacr: "Ī",
			imacr: "ī",
			image: "ℑ",
			ImaginaryI: "ⅈ",
			imagline: "ℐ",
			imagpart: "ℑ",
			imath: "ı",
			imof: "⊷",
			imped: "Ƶ",
			Implies: "⇒",
			in: "∈",
			incare: "℅",
			infin: "∞",
			infintie: "⧝",
			inodot: "ı",
			Int: "∬",
			int: "∫",
			intcal: "⊺",
			integers: "ℤ",
			Integral: "∫",
			intercal: "⊺",
			Intersection: "⋂",
			intlarhk: "⨗",
			intprod: "⨼",
			InvisibleComma: "⁣",
			InvisibleTimes: "⁢",
			IOcy: "Ё",
			iocy: "ё",
			Iogon: "Į",
			iogon: "į",
			Iopf: "𝕀",
			iopf: "𝕚",
			Iota: "Ι",
			iota: "ι",
			iprod: "⨼",
			iquest: "¿",
			Iscr: "ℐ",
			iscr: "𝒾",
			isin: "∈",
			isindot: "⋵",
			isinE: "⋹",
			isins: "⋴",
			isinsv: "⋳",
			isinv: "∈",
			it: "⁢",
			Itilde: "Ĩ",
			itilde: "ĩ",
			Iukcy: "І",
			iukcy: "і",
			Iuml: "Ï",
			iuml: "ï",
			Jcirc: "Ĵ",
			jcirc: "ĵ",
			Jcy: "Й",
			jcy: "й",
			Jfr: "𝔍",
			jfr: "𝔧",
			jmath: "ȷ",
			Jopf: "𝕁",
			jopf: "𝕛",
			Jscr: "𝒥",
			jscr: "𝒿",
			Jsercy: "Ј",
			jsercy: "ј",
			Jukcy: "Є",
			jukcy: "є",
			Kappa: "Κ",
			kappa: "κ",
			kappav: "ϰ",
			Kcedil: "Ķ",
			kcedil: "ķ",
			Kcy: "К",
			kcy: "к",
			Kfr: "𝔎",
			kfr: "𝔨",
			kgreen: "ĸ",
			KHcy: "Х",
			khcy: "х",
			KJcy: "Ќ",
			kjcy: "ќ",
			Kopf: "𝕂",
			kopf: "𝕜",
			Kscr: "𝒦",
			kscr: "𝓀",
			lAarr: "⇚",
			Lacute: "Ĺ",
			lacute: "ĺ",
			laemptyv: "⦴",
			lagran: "ℒ",
			Lambda: "Λ",
			lambda: "λ",
			Lang: "⟪",
			lang: "⟨",
			langd: "⦑",
			langle: "⟨",
			lap: "⪅",
			Laplacetrf: "ℒ",
			laquo: "«",
			Larr: "↞",
			lArr: "⇐",
			larr: "←",
			larrb: "⇤",
			larrbfs: "⤟",
			larrfs: "⤝",
			larrhk: "↩",
			larrlp: "↫",
			larrpl: "⤹",
			larrsim: "⥳",
			larrtl: "↢",
			lat: "⪫",
			lAtail: "⤛",
			latail: "⤙",
			late: "⪭",
			lates: "⪭︀",
			lBarr: "⤎",
			lbarr: "⤌",
			lbbrk: "❲",
			lbrace: "{",
			lbrack: "[",
			lbrke: "⦋",
			lbrksld: "⦏",
			lbrkslu: "⦍",
			Lcaron: "Ľ",
			lcaron: "ľ",
			Lcedil: "Ļ",
			lcedil: "ļ",
			lceil: "⌈",
			lcub: "{",
			Lcy: "Л",
			lcy: "л",
			ldca: "⤶",
			ldquo: "“",
			ldquor: "„",
			ldrdhar: "⥧",
			ldrushar: "⥋",
			ldsh: "↲",
			lE: "≦",
			le: "≤",
			LeftAngleBracket: "⟨",
			LeftArrow: "←",
			Leftarrow: "⇐",
			leftarrow: "←",
			LeftArrowBar: "⇤",
			LeftArrowRightArrow: "⇆",
			leftarrowtail: "↢",
			LeftCeiling: "⌈",
			LeftDoubleBracket: "⟦",
			LeftDownTeeVector: "⥡",
			LeftDownVector: "⇃",
			LeftDownVectorBar: "⥙",
			LeftFloor: "⌊",
			leftharpoondown: "↽",
			leftharpoonup: "↼",
			leftleftarrows: "⇇",
			LeftRightArrow: "↔",
			Leftrightarrow: "⇔",
			leftrightarrow: "↔",
			leftrightarrows: "⇆",
			leftrightharpoons: "⇋",
			leftrightsquigarrow: "↭",
			LeftRightVector: "⥎",
			LeftTee: "⊣",
			LeftTeeArrow: "↤",
			LeftTeeVector: "⥚",
			leftthreetimes: "⋋",
			LeftTriangle: "⊲",
			LeftTriangleBar: "⧏",
			LeftTriangleEqual: "⊴",
			LeftUpDownVector: "⥑",
			LeftUpTeeVector: "⥠",
			LeftUpVector: "↿",
			LeftUpVectorBar: "⥘",
			LeftVector: "↼",
			LeftVectorBar: "⥒",
			lEg: "⪋",
			leg: "⋚",
			leq: "≤",
			leqq: "≦",
			leqslant: "⩽",
			les: "⩽",
			lescc: "⪨",
			lesdot: "⩿",
			lesdoto: "⪁",
			lesdotor: "⪃",
			lesg: "⋚︀",
			lesges: "⪓",
			lessapprox: "⪅",
			lessdot: "⋖",
			lesseqgtr: "⋚",
			lesseqqgtr: "⪋",
			LessEqualGreater: "⋚",
			LessFullEqual: "≦",
			LessGreater: "≶",
			lessgtr: "≶",
			LessLess: "⪡",
			lesssim: "≲",
			LessSlantEqual: "⩽",
			LessTilde: "≲",
			lfisht: "⥼",
			lfloor: "⌊",
			Lfr: "𝔏",
			lfr: "𝔩",
			lg: "≶",
			lgE: "⪑",
			lHar: "⥢",
			lhard: "↽",
			lharu: "↼",
			lharul: "⥪",
			lhblk: "▄",
			LJcy: "Љ",
			ljcy: "љ",
			Ll: "⋘",
			ll: "≪",
			llarr: "⇇",
			llcorner: "⌞",
			Lleftarrow: "⇚",
			llhard: "⥫",
			lltri: "◺",
			Lmidot: "Ŀ",
			lmidot: "ŀ",
			lmoust: "⎰",
			lmoustache: "⎰",
			lnap: "⪉",
			lnapprox: "⪉",
			lnE: "≨",
			lne: "⪇",
			lneq: "⪇",
			lneqq: "≨",
			lnsim: "⋦",
			loang: "⟬",
			loarr: "⇽",
			lobrk: "⟦",
			LongLeftArrow: "⟵",
			Longleftarrow: "⟸",
			longleftarrow: "⟵",
			LongLeftRightArrow: "⟷",
			Longleftrightarrow: "⟺",
			longleftrightarrow: "⟷",
			longmapsto: "⟼",
			LongRightArrow: "⟶",
			Longrightarrow: "⟹",
			longrightarrow: "⟶",
			looparrowleft: "↫",
			looparrowright: "↬",
			lopar: "⦅",
			Lopf: "𝕃",
			lopf: "𝕝",
			loplus: "⨭",
			lotimes: "⨴",
			lowast: "∗",
			lowbar: "_",
			LowerLeftArrow: "↙",
			LowerRightArrow: "↘",
			loz: "◊",
			lozenge: "◊",
			lozf: "⧫",
			lpar: "(",
			lparlt: "⦓",
			lrarr: "⇆",
			lrcorner: "⌟",
			lrhar: "⇋",
			lrhard: "⥭",
			lrm: "‎",
			lrtri: "⊿",
			lsaquo: "‹",
			Lscr: "ℒ",
			lscr: "𝓁",
			Lsh: "↰",
			lsh: "↰",
			lsim: "≲",
			lsime: "⪍",
			lsimg: "⪏",
			lsqb: "[",
			lsquo: "‘",
			lsquor: "‚",
			Lstrok: "Ł",
			lstrok: "ł",
			Lt: "≪",
			LT: "<",
			lt: "<",
			ltcc: "⪦",
			ltcir: "⩹",
			ltdot: "⋖",
			lthree: "⋋",
			ltimes: "⋉",
			ltlarr: "⥶",
			ltquest: "⩻",
			ltri: "◃",
			ltrie: "⊴",
			ltrif: "◂",
			ltrPar: "⦖",
			lurdshar: "⥊",
			luruhar: "⥦",
			lvertneqq: "≨︀",
			lvnE: "≨︀",
			macr: "¯",
			male: "♂",
			malt: "✠",
			maltese: "✠",
			Map: "⤅",
			map: "↦",
			mapsto: "↦",
			mapstodown: "↧",
			mapstoleft: "↤",
			mapstoup: "↥",
			marker: "▮",
			mcomma: "⨩",
			Mcy: "М",
			mcy: "м",
			mdash: "—",
			mDDot: "∺",
			measuredangle: "∡",
			MediumSpace: " ",
			Mellintrf: "ℳ",
			Mfr: "𝔐",
			mfr: "𝔪",
			mho: "℧",
			micro: "µ",
			mid: "∣",
			midast: "*",
			midcir: "⫰",
			middot: "·",
			minus: "−",
			minusb: "⊟",
			minusd: "∸",
			minusdu: "⨪",
			MinusPlus: "∓",
			mlcp: "⫛",
			mldr: "…",
			mnplus: "∓",
			models: "⊧",
			Mopf: "𝕄",
			mopf: "𝕞",
			mp: "∓",
			Mscr: "ℳ",
			mscr: "𝓂",
			mstpos: "∾",
			Mu: "Μ",
			mu: "μ",
			multimap: "⊸",
			mumap: "⊸",
			nabla: "∇",
			Nacute: "Ń",
			nacute: "ń",
			nang: "∠⃒",
			nap: "≉",
			napE: "⩰̸",
			napid: "≋̸",
			napos: "ŉ",
			napprox: "≉",
			natur: "♮",
			natural: "♮",
			naturals: "ℕ",
			nbsp: "\xA0",
			nbump: "≎̸",
			nbumpe: "≏̸",
			ncap: "⩃",
			Ncaron: "Ň",
			ncaron: "ň",
			Ncedil: "Ņ",
			ncedil: "ņ",
			ncong: "≇",
			ncongdot: "⩭̸",
			ncup: "⩂",
			Ncy: "Н",
			ncy: "н",
			ndash: "–",
			ne: "≠",
			nearhk: "⤤",
			neArr: "⇗",
			nearr: "↗",
			nearrow: "↗",
			nedot: "≐̸",
			NegativeMediumSpace: "​",
			NegativeThickSpace: "​",
			NegativeThinSpace: "​",
			NegativeVeryThinSpace: "​",
			nequiv: "≢",
			nesear: "⤨",
			nesim: "≂̸",
			NestedGreaterGreater: "≫",
			NestedLessLess: "≪",
			NewLine: `
`,
			nexist: "∄",
			nexists: "∄",
			Nfr: "𝔑",
			nfr: "𝔫",
			ngE: "≧̸",
			nge: "≱",
			ngeq: "≱",
			ngeqq: "≧̸",
			ngeqslant: "⩾̸",
			nges: "⩾̸",
			nGg: "⋙̸",
			ngsim: "≵",
			nGt: "≫⃒",
			ngt: "≯",
			ngtr: "≯",
			nGtv: "≫̸",
			nhArr: "⇎",
			nharr: "↮",
			nhpar: "⫲",
			ni: "∋",
			nis: "⋼",
			nisd: "⋺",
			niv: "∋",
			NJcy: "Њ",
			njcy: "њ",
			nlArr: "⇍",
			nlarr: "↚",
			nldr: "‥",
			nlE: "≦̸",
			nle: "≰",
			nLeftarrow: "⇍",
			nleftarrow: "↚",
			nLeftrightarrow: "⇎",
			nleftrightarrow: "↮",
			nleq: "≰",
			nleqq: "≦̸",
			nleqslant: "⩽̸",
			nles: "⩽̸",
			nless: "≮",
			nLl: "⋘̸",
			nlsim: "≴",
			nLt: "≪⃒",
			nlt: "≮",
			nltri: "⋪",
			nltrie: "⋬",
			nLtv: "≪̸",
			nmid: "∤",
			NoBreak: "⁠",
			NonBreakingSpace: "\xA0",
			Nopf: "ℕ",
			nopf: "𝕟",
			Not: "⫬",
			not: "¬",
			NotCongruent: "≢",
			NotCupCap: "≭",
			NotDoubleVerticalBar: "∦",
			NotElement: "∉",
			NotEqual: "≠",
			NotEqualTilde: "≂̸",
			NotExists: "∄",
			NotGreater: "≯",
			NotGreaterEqual: "≱",
			NotGreaterFullEqual: "≧̸",
			NotGreaterGreater: "≫̸",
			NotGreaterLess: "≹",
			NotGreaterSlantEqual: "⩾̸",
			NotGreaterTilde: "≵",
			NotHumpDownHump: "≎̸",
			NotHumpEqual: "≏̸",
			notin: "∉",
			notindot: "⋵̸",
			notinE: "⋹̸",
			notinva: "∉",
			notinvb: "⋷",
			notinvc: "⋶",
			NotLeftTriangle: "⋪",
			NotLeftTriangleBar: "⧏̸",
			NotLeftTriangleEqual: "⋬",
			NotLess: "≮",
			NotLessEqual: "≰",
			NotLessGreater: "≸",
			NotLessLess: "≪̸",
			NotLessSlantEqual: "⩽̸",
			NotLessTilde: "≴",
			NotNestedGreaterGreater: "⪢̸",
			NotNestedLessLess: "⪡̸",
			notni: "∌",
			notniva: "∌",
			notnivb: "⋾",
			notnivc: "⋽",
			NotPrecedes: "⊀",
			NotPrecedesEqual: "⪯̸",
			NotPrecedesSlantEqual: "⋠",
			NotReverseElement: "∌",
			NotRightTriangle: "⋫",
			NotRightTriangleBar: "⧐̸",
			NotRightTriangleEqual: "⋭",
			NotSquareSubset: "⊏̸",
			NotSquareSubsetEqual: "⋢",
			NotSquareSuperset: "⊐̸",
			NotSquareSupersetEqual: "⋣",
			NotSubset: "⊂⃒",
			NotSubsetEqual: "⊈",
			NotSucceeds: "⊁",
			NotSucceedsEqual: "⪰̸",
			NotSucceedsSlantEqual: "⋡",
			NotSucceedsTilde: "≿̸",
			NotSuperset: "⊃⃒",
			NotSupersetEqual: "⊉",
			NotTilde: "≁",
			NotTildeEqual: "≄",
			NotTildeFullEqual: "≇",
			NotTildeTilde: "≉",
			NotVerticalBar: "∤",
			npar: "∦",
			nparallel: "∦",
			nparsl: "⫽⃥",
			npart: "∂̸",
			npolint: "⨔",
			npr: "⊀",
			nprcue: "⋠",
			npre: "⪯̸",
			nprec: "⊀",
			npreceq: "⪯̸",
			nrArr: "⇏",
			nrarr: "↛",
			nrarrc: "⤳̸",
			nrarrw: "↝̸",
			nRightarrow: "⇏",
			nrightarrow: "↛",
			nrtri: "⋫",
			nrtrie: "⋭",
			nsc: "⊁",
			nsccue: "⋡",
			nsce: "⪰̸",
			Nscr: "𝒩",
			nscr: "𝓃",
			nshortmid: "∤",
			nshortparallel: "∦",
			nsim: "≁",
			nsime: "≄",
			nsimeq: "≄",
			nsmid: "∤",
			nspar: "∦",
			nsqsube: "⋢",
			nsqsupe: "⋣",
			nsub: "⊄",
			nsubE: "⫅̸",
			nsube: "⊈",
			nsubset: "⊂⃒",
			nsubseteq: "⊈",
			nsubseteqq: "⫅̸",
			nsucc: "⊁",
			nsucceq: "⪰̸",
			nsup: "⊅",
			nsupE: "⫆̸",
			nsupe: "⊉",
			nsupset: "⊃⃒",
			nsupseteq: "⊉",
			nsupseteqq: "⫆̸",
			ntgl: "≹",
			Ntilde: "Ñ",
			ntilde: "ñ",
			ntlg: "≸",
			ntriangleleft: "⋪",
			ntrianglelefteq: "⋬",
			ntriangleright: "⋫",
			ntrianglerighteq: "⋭",
			Nu: "Ν",
			nu: "ν",
			num: "#",
			numero: "№",
			numsp: " ",
			nvap: "≍⃒",
			nVDash: "⊯",
			nVdash: "⊮",
			nvDash: "⊭",
			nvdash: "⊬",
			nvge: "≥⃒",
			nvgt: ">⃒",
			nvHarr: "⤄",
			nvinfin: "⧞",
			nvlArr: "⤂",
			nvle: "≤⃒",
			nvlt: "<⃒",
			nvltrie: "⊴⃒",
			nvrArr: "⤃",
			nvrtrie: "⊵⃒",
			nvsim: "∼⃒",
			nwarhk: "⤣",
			nwArr: "⇖",
			nwarr: "↖",
			nwarrow: "↖",
			nwnear: "⤧",
			Oacute: "Ó",
			oacute: "ó",
			oast: "⊛",
			ocir: "⊚",
			Ocirc: "Ô",
			ocirc: "ô",
			Ocy: "О",
			ocy: "о",
			odash: "⊝",
			Odblac: "Ő",
			odblac: "ő",
			odiv: "⨸",
			odot: "⊙",
			odsold: "⦼",
			OElig: "Œ",
			oelig: "œ",
			ofcir: "⦿",
			Ofr: "𝔒",
			ofr: "𝔬",
			ogon: "˛",
			Ograve: "Ò",
			ograve: "ò",
			ogt: "⧁",
			ohbar: "⦵",
			ohm: "Ω",
			oint: "∮",
			olarr: "↺",
			olcir: "⦾",
			olcross: "⦻",
			oline: "‾",
			olt: "⧀",
			Omacr: "Ō",
			omacr: "ō",
			Omega: "Ω",
			omega: "ω",
			Omicron: "Ο",
			omicron: "ο",
			omid: "⦶",
			ominus: "⊖",
			Oopf: "𝕆",
			oopf: "𝕠",
			opar: "⦷",
			OpenCurlyDoubleQuote: "“",
			OpenCurlyQuote: "‘",
			operp: "⦹",
			oplus: "⊕",
			Or: "⩔",
			or: "∨",
			orarr: "↻",
			ord: "⩝",
			order: "ℴ",
			orderof: "ℴ",
			ordf: "ª",
			ordm: "º",
			origof: "⊶",
			oror: "⩖",
			orslope: "⩗",
			orv: "⩛",
			oS: "Ⓢ",
			Oscr: "𝒪",
			oscr: "ℴ",
			Oslash: "Ø",
			oslash: "ø",
			osol: "⊘",
			Otilde: "Õ",
			otilde: "õ",
			Otimes: "⨷",
			otimes: "⊗",
			otimesas: "⨶",
			Ouml: "Ö",
			ouml: "ö",
			ovbar: "⌽",
			OverBar: "‾",
			OverBrace: "⏞",
			OverBracket: "⎴",
			OverParenthesis: "⏜",
			par: "∥",
			para: "¶",
			parallel: "∥",
			parsim: "⫳",
			parsl: "⫽",
			part: "∂",
			PartialD: "∂",
			Pcy: "П",
			pcy: "п",
			percnt: "%",
			period: ".",
			permil: "‰",
			perp: "⊥",
			pertenk: "‱",
			Pfr: "𝔓",
			pfr: "𝔭",
			Phi: "Φ",
			phi: "φ",
			phiv: "ϕ",
			phmmat: "ℳ",
			phone: "☎",
			Pi: "Π",
			pi: "π",
			pitchfork: "⋔",
			piv: "ϖ",
			planck: "ℏ",
			planckh: "ℎ",
			plankv: "ℏ",
			plus: "+",
			plusacir: "⨣",
			plusb: "⊞",
			pluscir: "⨢",
			plusdo: "∔",
			plusdu: "⨥",
			pluse: "⩲",
			PlusMinus: "±",
			plusmn: "±",
			plussim: "⨦",
			plustwo: "⨧",
			pm: "±",
			Poincareplane: "ℌ",
			pointint: "⨕",
			Popf: "ℙ",
			popf: "𝕡",
			pound: "£",
			Pr: "⪻",
			pr: "≺",
			prap: "⪷",
			prcue: "≼",
			prE: "⪳",
			pre: "⪯",
			prec: "≺",
			precapprox: "⪷",
			preccurlyeq: "≼",
			Precedes: "≺",
			PrecedesEqual: "⪯",
			PrecedesSlantEqual: "≼",
			PrecedesTilde: "≾",
			preceq: "⪯",
			precnapprox: "⪹",
			precneqq: "⪵",
			precnsim: "⋨",
			precsim: "≾",
			Prime: "″",
			prime: "′",
			primes: "ℙ",
			prnap: "⪹",
			prnE: "⪵",
			prnsim: "⋨",
			prod: "∏",
			Product: "∏",
			profalar: "⌮",
			profline: "⌒",
			profsurf: "⌓",
			prop: "∝",
			Proportion: "∷",
			Proportional: "∝",
			propto: "∝",
			prsim: "≾",
			prurel: "⊰",
			Pscr: "𝒫",
			pscr: "𝓅",
			Psi: "Ψ",
			psi: "ψ",
			puncsp: " ",
			Qfr: "𝔔",
			qfr: "𝔮",
			qint: "⨌",
			Qopf: "ℚ",
			qopf: "𝕢",
			qprime: "⁗",
			Qscr: "𝒬",
			qscr: "𝓆",
			quaternions: "ℍ",
			quatint: "⨖",
			quest: "?",
			questeq: "≟",
			QUOT: "\"",
			quot: "\"",
			rAarr: "⇛",
			race: "∽̱",
			Racute: "Ŕ",
			racute: "ŕ",
			radic: "√",
			raemptyv: "⦳",
			Rang: "⟫",
			rang: "⟩",
			rangd: "⦒",
			range: "⦥",
			rangle: "⟩",
			raquo: "»",
			Rarr: "↠",
			rArr: "⇒",
			rarr: "→",
			rarrap: "⥵",
			rarrb: "⇥",
			rarrbfs: "⤠",
			rarrc: "⤳",
			rarrfs: "⤞",
			rarrhk: "↪",
			rarrlp: "↬",
			rarrpl: "⥅",
			rarrsim: "⥴",
			Rarrtl: "⤖",
			rarrtl: "↣",
			rarrw: "↝",
			rAtail: "⤜",
			ratail: "⤚",
			ratio: "∶",
			rationals: "ℚ",
			RBarr: "⤐",
			rBarr: "⤏",
			rbarr: "⤍",
			rbbrk: "❳",
			rbrace: "}",
			rbrack: "]",
			rbrke: "⦌",
			rbrksld: "⦎",
			rbrkslu: "⦐",
			Rcaron: "Ř",
			rcaron: "ř",
			Rcedil: "Ŗ",
			rcedil: "ŗ",
			rceil: "⌉",
			rcub: "}",
			Rcy: "Р",
			rcy: "р",
			rdca: "⤷",
			rdldhar: "⥩",
			rdquo: "”",
			rdquor: "”",
			rdsh: "↳",
			Re: "ℜ",
			real: "ℜ",
			realine: "ℛ",
			realpart: "ℜ",
			reals: "ℝ",
			rect: "▭",
			REG: "®",
			reg: "®",
			ReverseElement: "∋",
			ReverseEquilibrium: "⇋",
			ReverseUpEquilibrium: "⥯",
			rfisht: "⥽",
			rfloor: "⌋",
			Rfr: "ℜ",
			rfr: "𝔯",
			rHar: "⥤",
			rhard: "⇁",
			rharu: "⇀",
			rharul: "⥬",
			Rho: "Ρ",
			rho: "ρ",
			rhov: "ϱ",
			RightAngleBracket: "⟩",
			RightArrow: "→",
			Rightarrow: "⇒",
			rightarrow: "→",
			RightArrowBar: "⇥",
			RightArrowLeftArrow: "⇄",
			rightarrowtail: "↣",
			RightCeiling: "⌉",
			RightDoubleBracket: "⟧",
			RightDownTeeVector: "⥝",
			RightDownVector: "⇂",
			RightDownVectorBar: "⥕",
			RightFloor: "⌋",
			rightharpoondown: "⇁",
			rightharpoonup: "⇀",
			rightleftarrows: "⇄",
			rightleftharpoons: "⇌",
			rightrightarrows: "⇉",
			rightsquigarrow: "↝",
			RightTee: "⊢",
			RightTeeArrow: "↦",
			RightTeeVector: "⥛",
			rightthreetimes: "⋌",
			RightTriangle: "⊳",
			RightTriangleBar: "⧐",
			RightTriangleEqual: "⊵",
			RightUpDownVector: "⥏",
			RightUpTeeVector: "⥜",
			RightUpVector: "↾",
			RightUpVectorBar: "⥔",
			RightVector: "⇀",
			RightVectorBar: "⥓",
			ring: "˚",
			risingdotseq: "≓",
			rlarr: "⇄",
			rlhar: "⇌",
			rlm: "‏",
			rmoust: "⎱",
			rmoustache: "⎱",
			rnmid: "⫮",
			roang: "⟭",
			roarr: "⇾",
			robrk: "⟧",
			ropar: "⦆",
			Ropf: "ℝ",
			ropf: "𝕣",
			roplus: "⨮",
			rotimes: "⨵",
			RoundImplies: "⥰",
			rpar: ")",
			rpargt: "⦔",
			rppolint: "⨒",
			rrarr: "⇉",
			Rrightarrow: "⇛",
			rsaquo: "›",
			Rscr: "ℛ",
			rscr: "𝓇",
			Rsh: "↱",
			rsh: "↱",
			rsqb: "]",
			rsquo: "’",
			rsquor: "’",
			rthree: "⋌",
			rtimes: "⋊",
			rtri: "▹",
			rtrie: "⊵",
			rtrif: "▸",
			rtriltri: "⧎",
			RuleDelayed: "⧴",
			ruluhar: "⥨",
			rx: "℞",
			Sacute: "Ś",
			sacute: "ś",
			sbquo: "‚",
			Sc: "⪼",
			sc: "≻",
			scap: "⪸",
			Scaron: "Š",
			scaron: "š",
			sccue: "≽",
			scE: "⪴",
			sce: "⪰",
			Scedil: "Ş",
			scedil: "ş",
			Scirc: "Ŝ",
			scirc: "ŝ",
			scnap: "⪺",
			scnE: "⪶",
			scnsim: "⋩",
			scpolint: "⨓",
			scsim: "≿",
			Scy: "С",
			scy: "с",
			sdot: "⋅",
			sdotb: "⊡",
			sdote: "⩦",
			searhk: "⤥",
			seArr: "⇘",
			searr: "↘",
			searrow: "↘",
			sect: "§",
			semi: ";",
			seswar: "⤩",
			setminus: "∖",
			setmn: "∖",
			sext: "✶",
			Sfr: "𝔖",
			sfr: "𝔰",
			sfrown: "⌢",
			sharp: "♯",
			SHCHcy: "Щ",
			shchcy: "щ",
			SHcy: "Ш",
			shcy: "ш",
			ShortDownArrow: "↓",
			ShortLeftArrow: "←",
			shortmid: "∣",
			shortparallel: "∥",
			ShortRightArrow: "→",
			ShortUpArrow: "↑",
			shy: "­",
			Sigma: "Σ",
			sigma: "σ",
			sigmaf: "ς",
			sigmav: "ς",
			sim: "∼",
			simdot: "⩪",
			sime: "≃",
			simeq: "≃",
			simg: "⪞",
			simgE: "⪠",
			siml: "⪝",
			simlE: "⪟",
			simne: "≆",
			simplus: "⨤",
			simrarr: "⥲",
			slarr: "←",
			SmallCircle: "∘",
			smallsetminus: "∖",
			smashp: "⨳",
			smeparsl: "⧤",
			smid: "∣",
			smile: "⌣",
			smt: "⪪",
			smte: "⪬",
			smtes: "⪬︀",
			SOFTcy: "Ь",
			softcy: "ь",
			sol: "/",
			solb: "⧄",
			solbar: "⌿",
			Sopf: "𝕊",
			sopf: "𝕤",
			spades: "♠",
			spadesuit: "♠",
			spar: "∥",
			sqcap: "⊓",
			sqcaps: "⊓︀",
			sqcup: "⊔",
			sqcups: "⊔︀",
			Sqrt: "√",
			sqsub: "⊏",
			sqsube: "⊑",
			sqsubset: "⊏",
			sqsubseteq: "⊑",
			sqsup: "⊐",
			sqsupe: "⊒",
			sqsupset: "⊐",
			sqsupseteq: "⊒",
			squ: "□",
			Square: "□",
			square: "□",
			SquareIntersection: "⊓",
			SquareSubset: "⊏",
			SquareSubsetEqual: "⊑",
			SquareSuperset: "⊐",
			SquareSupersetEqual: "⊒",
			SquareUnion: "⊔",
			squarf: "▪",
			squf: "▪",
			srarr: "→",
			Sscr: "𝒮",
			sscr: "𝓈",
			ssetmn: "∖",
			ssmile: "⌣",
			sstarf: "⋆",
			Star: "⋆",
			star: "☆",
			starf: "★",
			straightepsilon: "ϵ",
			straightphi: "ϕ",
			strns: "¯",
			Sub: "⋐",
			sub: "⊂",
			subdot: "⪽",
			subE: "⫅",
			sube: "⊆",
			subedot: "⫃",
			submult: "⫁",
			subnE: "⫋",
			subne: "⊊",
			subplus: "⪿",
			subrarr: "⥹",
			Subset: "⋐",
			subset: "⊂",
			subseteq: "⊆",
			subseteqq: "⫅",
			SubsetEqual: "⊆",
			subsetneq: "⊊",
			subsetneqq: "⫋",
			subsim: "⫇",
			subsub: "⫕",
			subsup: "⫓",
			succ: "≻",
			succapprox: "⪸",
			succcurlyeq: "≽",
			Succeeds: "≻",
			SucceedsEqual: "⪰",
			SucceedsSlantEqual: "≽",
			SucceedsTilde: "≿",
			succeq: "⪰",
			succnapprox: "⪺",
			succneqq: "⪶",
			succnsim: "⋩",
			succsim: "≿",
			SuchThat: "∋",
			Sum: "∑",
			sum: "∑",
			sung: "♪",
			Sup: "⋑",
			sup: "⊃",
			sup1: "¹",
			sup2: "²",
			sup3: "³",
			supdot: "⪾",
			supdsub: "⫘",
			supE: "⫆",
			supe: "⊇",
			supedot: "⫄",
			Superset: "⊃",
			SupersetEqual: "⊇",
			suphsol: "⟉",
			suphsub: "⫗",
			suplarr: "⥻",
			supmult: "⫂",
			supnE: "⫌",
			supne: "⊋",
			supplus: "⫀",
			Supset: "⋑",
			supset: "⊃",
			supseteq: "⊇",
			supseteqq: "⫆",
			supsetneq: "⊋",
			supsetneqq: "⫌",
			supsim: "⫈",
			supsub: "⫔",
			supsup: "⫖",
			swarhk: "⤦",
			swArr: "⇙",
			swarr: "↙",
			swarrow: "↙",
			swnwar: "⤪",
			szlig: "ß",
			Tab: "	",
			target: "⌖",
			Tau: "Τ",
			tau: "τ",
			tbrk: "⎴",
			Tcaron: "Ť",
			tcaron: "ť",
			Tcedil: "Ţ",
			tcedil: "ţ",
			Tcy: "Т",
			tcy: "т",
			tdot: "⃛",
			telrec: "⌕",
			Tfr: "𝔗",
			tfr: "𝔱",
			there4: "∴",
			Therefore: "∴",
			therefore: "∴",
			Theta: "Θ",
			theta: "θ",
			thetasym: "ϑ",
			thetav: "ϑ",
			thickapprox: "≈",
			thicksim: "∼",
			ThickSpace: "  ",
			thinsp: " ",
			ThinSpace: " ",
			thkap: "≈",
			thksim: "∼",
			THORN: "Þ",
			thorn: "þ",
			Tilde: "∼",
			tilde: "˜",
			TildeEqual: "≃",
			TildeFullEqual: "≅",
			TildeTilde: "≈",
			times: "×",
			timesb: "⊠",
			timesbar: "⨱",
			timesd: "⨰",
			tint: "∭",
			toea: "⤨",
			top: "⊤",
			topbot: "⌶",
			topcir: "⫱",
			Topf: "𝕋",
			topf: "𝕥",
			topfork: "⫚",
			tosa: "⤩",
			tprime: "‴",
			TRADE: "™",
			trade: "™",
			triangle: "▵",
			triangledown: "▿",
			triangleleft: "◃",
			trianglelefteq: "⊴",
			triangleq: "≜",
			triangleright: "▹",
			trianglerighteq: "⊵",
			tridot: "◬",
			trie: "≜",
			triminus: "⨺",
			TripleDot: "⃛",
			triplus: "⨹",
			trisb: "⧍",
			tritime: "⨻",
			trpezium: "⏢",
			Tscr: "𝒯",
			tscr: "𝓉",
			TScy: "Ц",
			tscy: "ц",
			TSHcy: "Ћ",
			tshcy: "ћ",
			Tstrok: "Ŧ",
			tstrok: "ŧ",
			twixt: "≬",
			twoheadleftarrow: "↞",
			twoheadrightarrow: "↠",
			Uacute: "Ú",
			uacute: "ú",
			Uarr: "↟",
			uArr: "⇑",
			uarr: "↑",
			Uarrocir: "⥉",
			Ubrcy: "Ў",
			ubrcy: "ў",
			Ubreve: "Ŭ",
			ubreve: "ŭ",
			Ucirc: "Û",
			ucirc: "û",
			Ucy: "У",
			ucy: "у",
			udarr: "⇅",
			Udblac: "Ű",
			udblac: "ű",
			udhar: "⥮",
			ufisht: "⥾",
			Ufr: "𝔘",
			ufr: "𝔲",
			Ugrave: "Ù",
			ugrave: "ù",
			uHar: "⥣",
			uharl: "↿",
			uharr: "↾",
			uhblk: "▀",
			ulcorn: "⌜",
			ulcorner: "⌜",
			ulcrop: "⌏",
			ultri: "◸",
			Umacr: "Ū",
			umacr: "ū",
			uml: "¨",
			UnderBar: "_",
			UnderBrace: "⏟",
			UnderBracket: "⎵",
			UnderParenthesis: "⏝",
			Union: "⋃",
			UnionPlus: "⊎",
			Uogon: "Ų",
			uogon: "ų",
			Uopf: "𝕌",
			uopf: "𝕦",
			UpArrow: "↑",
			Uparrow: "⇑",
			uparrow: "↑",
			UpArrowBar: "⤒",
			UpArrowDownArrow: "⇅",
			UpDownArrow: "↕",
			Updownarrow: "⇕",
			updownarrow: "↕",
			UpEquilibrium: "⥮",
			upharpoonleft: "↿",
			upharpoonright: "↾",
			uplus: "⊎",
			UpperLeftArrow: "↖",
			UpperRightArrow: "↗",
			Upsi: "ϒ",
			upsi: "υ",
			upsih: "ϒ",
			Upsilon: "Υ",
			upsilon: "υ",
			UpTee: "⊥",
			UpTeeArrow: "↥",
			upuparrows: "⇈",
			urcorn: "⌝",
			urcorner: "⌝",
			urcrop: "⌎",
			Uring: "Ů",
			uring: "ů",
			urtri: "◹",
			Uscr: "𝒰",
			uscr: "𝓊",
			utdot: "⋰",
			Utilde: "Ũ",
			utilde: "ũ",
			utri: "▵",
			utrif: "▴",
			uuarr: "⇈",
			Uuml: "Ü",
			uuml: "ü",
			uwangle: "⦧",
			vangrt: "⦜",
			varepsilon: "ϵ",
			varkappa: "ϰ",
			varnothing: "∅",
			varphi: "ϕ",
			varpi: "ϖ",
			varpropto: "∝",
			vArr: "⇕",
			varr: "↕",
			varrho: "ϱ",
			varsigma: "ς",
			varsubsetneq: "⊊︀",
			varsubsetneqq: "⫋︀",
			varsupsetneq: "⊋︀",
			varsupsetneqq: "⫌︀",
			vartheta: "ϑ",
			vartriangleleft: "⊲",
			vartriangleright: "⊳",
			Vbar: "⫫",
			vBar: "⫨",
			vBarv: "⫩",
			Vcy: "В",
			vcy: "в",
			VDash: "⊫",
			Vdash: "⊩",
			vDash: "⊨",
			vdash: "⊢",
			Vdashl: "⫦",
			Vee: "⋁",
			vee: "∨",
			veebar: "⊻",
			veeeq: "≚",
			vellip: "⋮",
			Verbar: "‖",
			verbar: "|",
			Vert: "‖",
			vert: "|",
			VerticalBar: "∣",
			VerticalLine: "|",
			VerticalSeparator: "❘",
			VerticalTilde: "≀",
			VeryThinSpace: " ",
			Vfr: "𝔙",
			vfr: "𝔳",
			vltri: "⊲",
			vnsub: "⊂⃒",
			vnsup: "⊃⃒",
			Vopf: "𝕍",
			vopf: "𝕧",
			vprop: "∝",
			vrtri: "⊳",
			Vscr: "𝒱",
			vscr: "𝓋",
			vsubnE: "⫋︀",
			vsubne: "⊊︀",
			vsupnE: "⫌︀",
			vsupne: "⊋︀",
			Vvdash: "⊪",
			vzigzag: "⦚",
			Wcirc: "Ŵ",
			wcirc: "ŵ",
			wedbar: "⩟",
			Wedge: "⋀",
			wedge: "∧",
			wedgeq: "≙",
			weierp: "℘",
			Wfr: "𝔚",
			wfr: "𝔴",
			Wopf: "𝕎",
			wopf: "𝕨",
			wp: "℘",
			wr: "≀",
			wreath: "≀",
			Wscr: "𝒲",
			wscr: "𝓌",
			xcap: "⋂",
			xcirc: "◯",
			xcup: "⋃",
			xdtri: "▽",
			Xfr: "𝔛",
			xfr: "𝔵",
			xhArr: "⟺",
			xharr: "⟷",
			Xi: "Ξ",
			xi: "ξ",
			xlArr: "⟸",
			xlarr: "⟵",
			xmap: "⟼",
			xnis: "⋻",
			xodot: "⨀",
			Xopf: "𝕏",
			xopf: "𝕩",
			xoplus: "⨁",
			xotime: "⨂",
			xrArr: "⟹",
			xrarr: "⟶",
			Xscr: "𝒳",
			xscr: "𝓍",
			xsqcup: "⨆",
			xuplus: "⨄",
			xutri: "△",
			xvee: "⋁",
			xwedge: "⋀",
			Yacute: "Ý",
			yacute: "ý",
			YAcy: "Я",
			yacy: "я",
			Ycirc: "Ŷ",
			ycirc: "ŷ",
			Ycy: "Ы",
			ycy: "ы",
			yen: "¥",
			Yfr: "𝔜",
			yfr: "𝔶",
			YIcy: "Ї",
			yicy: "ї",
			Yopf: "𝕐",
			yopf: "𝕪",
			Yscr: "𝒴",
			yscr: "𝓎",
			YUcy: "Ю",
			yucy: "ю",
			Yuml: "Ÿ",
			yuml: "ÿ",
			Zacute: "Ź",
			zacute: "ź",
			Zcaron: "Ž",
			zcaron: "ž",
			Zcy: "З",
			zcy: "з",
			Zdot: "Ż",
			zdot: "ż",
			zeetrf: "ℨ",
			ZeroWidthSpace: "​",
			Zeta: "Ζ",
			zeta: "ζ",
			Zfr: "ℨ",
			zfr: "𝔷",
			ZHcy: "Ж",
			zhcy: "ж",
			zigrarr: "⇝",
			Zopf: "ℤ",
			zopf: "𝕫",
			Zscr: "𝒵",
			zscr: "𝓏",
			zwj: "‍",
			zwnj: "‌"
		}), e.entityMap = e.HTML_ENTITIES;
	})), zt = Pe(((e) => {
		var r = er().NAMESPACE, t = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, n = new RegExp("[\\-\\.0-9" + t.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]"), a = new RegExp("^" + t.source + n.source + "*(?::" + t.source + n.source + "*)?$"), l = 0, s = 1, f = 2, m = 3, d = 4, w = 5, h = 6, T = 7;
		function C(c, g) {
			this.message = c, this.locator = g, Error.captureStackTrace && Error.captureStackTrace(this, C);
		}
		C.prototype = /* @__PURE__ */ new Error(), C.prototype.name = C.name;
		function $() {}
		$.prototype = { parse: function(c, g, S) {
			var O = this.domBuilder;
			O.startDocument(), F(g, g = {}), H(c, g, S, O, this.errorHandler), O.endDocument();
		} };
		function H(c, g, S, O, N) {
			function E(Y) {
				if (Y > 65535) {
					Y -= 65536;
					var ue = 55296 + (Y >> 10), Ve = 56320 + (Y & 1023);
					return String.fromCharCode(ue, Ve);
				} else return String.fromCharCode(Y);
			}
			function x(Y) {
				var ue = Y.slice(1, -1);
				return Object.hasOwnProperty.call(S, ue) ? S[ue] : ue.charAt(0) === "#" ? E(parseInt(ue.substr(1).replace("x", "0x"))) : (N.error("entity not found:" + Y), Y);
			}
			function U(Y) {
				if (Y > Q) {
					var ue = c.substring(Q, Y).replace(/&#?\w+;/g, x);
					B && I(Q), O.characters(ue, 0, Y - Q), Q = Y;
				}
			}
			function I(Y, ue) {
				for (; Y >= M && (ue = ee.exec(c));) D = ue.index, M = D + ue[0].length, B.lineNumber++;
				B.columnNumber = Y - D + 1;
			}
			for (var D = 0, M = 0, ee = /.*(?:\r\n?|\n)|.*$/g, B = O.locator, J = [{ currentNSMap: g }], V = {}, Q = 0;;) {
				try {
					var X = c.indexOf("<", Q);
					if (X < 0) {
						if (!c.substr(Q).match(/^\s*$/)) {
							var W = O.doc, he = W.createTextNode(c.substr(Q));
							W.appendChild(he), O.currentElement = he;
						}
						return;
					}
					switch (X > Q && U(X), c.charAt(X + 1)) {
						case "/":
							var z = c.indexOf(">", X + 3), re = c.substring(X + 2, z).replace(/[ \t\n\r]+$/g, ""), se = J.pop();
							z < 0 ? (re = c.substring(X + 2).replace(/[\s<].*/, ""), N.error("end tag name: " + re + " is not complete:" + se.tagName), z = X + 1 + re.length) : re.match(/\s</) && (re = re.replace(/[\s<].*/, ""), N.error("end tag name: " + re + " maybe not complete"), z = X + 1 + re.length);
							var ye = se.localNSMap, Te = se.tagName == re;
							if (Te || se.tagName && se.tagName.toLowerCase() == re.toLowerCase()) {
								if (O.endElement(se.uri, se.localName, re), ye) for (var _e in ye) Object.prototype.hasOwnProperty.call(ye, _e) && O.endPrefixMapping(_e);
								Te || N.fatalError("end tag name: " + re + " is not match the current start tagName:" + se.tagName);
							} else J.push(se);
							z++;
							break;
						case "?":
							B && I(X), z = Z(c, X, O);
							break;
						case "!":
							B && I(X), z = k(c, X, O, N);
							break;
						default:
							B && I(X);
							var ae = new R(), ce = J[J.length - 1].currentNSMap, z = v(c, X, ae, ce, x, N), Ue = ae.length;
							if (!ae.closed && P(c, z, ae.tagName, V) && (ae.closed = !0, S.nbsp || N.warning("unclosed xml attribute")), B && Ue) {
								for (var lr = j(B, {}), je = 0; je < Ue; je++) {
									var cr = ae[je];
									I(cr.offset), cr.locator = j(B, {});
								}
								O.locator = lr, L(ae, O, ce) && J.push(ae), O.locator = B;
							} else L(ae, O, ce) && J.push(ae);
							r.isHTML(ae.uri) && !ae.closed ? z = _(c, z, ae.tagName, x, O) : z++;
					}
				} catch (Y) {
					if (Y instanceof C) throw Y;
					N.error("element parse error: " + Y), z = -1;
				}
				z > Q ? Q = z : U(Math.max(X, Q) + 1);
			}
		}
		function j(c, g) {
			return g.lineNumber = c.lineNumber, g.columnNumber = c.columnNumber, g;
		}
		function v(c, g, S, O, N, E) {
			function x(B, J, V) {
				S.attributeNames.hasOwnProperty(B) && E.fatalError("Attribute " + B + " redefined"), S.addValue(B, J.replace(/[\t\n\r]/g, " ").replace(/&#?\w+;/g, N), V);
			}
			for (var U, I, D = ++g, M = l;;) {
				var ee = c.charAt(D);
				switch (ee) {
					case "=":
						if (M === s) U = c.slice(g, D), M = m;
						else if (M === f) M = m;
						else throw new Error("attribute equal must after attrName");
						break;
					case "'":
					case "\"":
						if (M === m || M === s) if (M === s && (E.warning("attribute value must after \"=\""), U = c.slice(g, D)), g = D + 1, D = c.indexOf(ee, g), D > 0) I = c.slice(g, D), x(U, I, g - 1), M = w;
						else throw new Error("attribute value no end '" + ee + "' match");
						else if (M == d) I = c.slice(g, D), x(U, I, g), E.warning("attribute \"" + U + "\" missed start quot(" + ee + ")!!"), g = D + 1, M = w;
						else throw new Error("attribute value must after \"=\"");
						break;
					case "/":
						switch (M) {
							case l: S.setTagName(c.slice(g, D));
							case w:
							case h:
							case T: M = T, S.closed = !0;
							case d:
							case s: break;
							case f:
								S.closed = !0;
								break;
							default: throw new Error("attribute invalid close char('/')");
						}
						break;
					case "": return E.error("unexpected end of input"), M == l && S.setTagName(c.slice(g, D)), D;
					case ">":
						switch (M) {
							case l: S.setTagName(c.slice(g, D));
							case w:
							case h:
							case T: break;
							case d:
							case s: I = c.slice(g, D), I.slice(-1) === "/" && (S.closed = !0, I = I.slice(0, -1));
							case f:
								M === f && (I = U), M == d ? (E.warning("attribute \"" + I + "\" missed quot(\")!"), x(U, I, g)) : ((!r.isHTML(O[""]) || !I.match(/^(?:disabled|checked|selected)$/i)) && E.warning("attribute \"" + I + "\" missed value!! \"" + I + "\" instead!!"), x(I, I, g));
								break;
							case m: throw new Error("attribute value missed!!");
						}
						return D;
					case "": ee = " ";
					default: if (ee <= " ") switch (M) {
						case l:
							S.setTagName(c.slice(g, D)), M = h;
							break;
						case s:
							U = c.slice(g, D), M = f;
							break;
						case d:
							var I = c.slice(g, D);
							E.warning("attribute \"" + I + "\" missed quot(\")!!"), x(U, I, g);
						case w:
							M = h;
							break;
					}
					else switch (M) {
						case f:
							S.tagName, (!r.isHTML(O[""]) || !U.match(/^(?:disabled|checked|selected)$/i)) && E.warning("attribute \"" + U + "\" missed value!! \"" + U + "\" instead2!!"), x(U, U, g), g = D, M = s;
							break;
						case w: E.warning("attribute space is required\"" + U + "\"!!");
						case h:
							M = s, g = D;
							break;
						case m:
							M = d, g = D;
							break;
						case T: throw new Error("elements closed character '/' and '>' must be connected to");
					}
				}
				D++;
			}
		}
		function L(c, g, S) {
			for (var O = c.tagName, N = null, ee = c.length; ee--;) {
				var E = c[ee], x = E.qName, U = E.value, B = x.indexOf(":");
				if (B > 0) var I = E.prefix = x.slice(0, B), D = x.slice(B + 1), M = I === "xmlns" && D;
				else D = x, I = null, M = x === "xmlns" && "";
				E.localName = D, M !== !1 && (N == null && (N = {}, F(S, S = {})), S[M] = N[M] = U, E.uri = r.XMLNS, g.startPrefixMapping(M, U));
			}
			for (var ee = c.length; ee--;) {
				E = c[ee];
				var I = E.prefix;
				I && (I === "xml" && (E.uri = r.XML), I !== "xmlns" && (E.uri = S[I || ""]));
			}
			var B = O.indexOf(":");
			B > 0 ? (I = c.prefix = O.slice(0, B), D = c.localName = O.slice(B + 1)) : (I = null, D = c.localName = O);
			var J = c.uri = S[I || ""];
			if (g.startElement(J, D, O, c), c.closed) {
				if (g.endElement(J, D, O), N) for (I in N) Object.prototype.hasOwnProperty.call(N, I) && g.endPrefixMapping(I);
			} else return c.currentNSMap = S, c.localNSMap = N, !0;
		}
		function _(c, g, S, O, N) {
			if (/^(?:script|textarea)$/i.test(S)) {
				var E = c.indexOf("</" + S + ">", g), x = c.substring(g + 1, E);
				if (/[&<]/.test(x)) return /^script$/i.test(S) ? (N.characters(x, 0, x.length), E) : (x = x.replace(/&#?\w+;/g, O), N.characters(x, 0, x.length), E);
			}
			return g + 1;
		}
		function P(c, g, S, O) {
			var N = O[S];
			return N == null && (N = c.lastIndexOf("</" + S + ">"), N < g && (N = c.lastIndexOf("</" + S)), O[S] = N), N < g;
		}
		function F(c, g) {
			for (var S in c) Object.prototype.hasOwnProperty.call(c, S) && (g[S] = c[S]);
		}
		function k(c, g, S, O) {
			switch (c.charAt(g + 2)) {
				case "-": if (c.charAt(g + 3) === "-") {
					var N = c.indexOf("-->", g + 4);
					return N > g ? (S.comment(c, g + 4, N - g - 4), N + 3) : (O.error("Unclosed comment"), -1);
				} else return -1;
				default:
					if (c.substr(g + 3, 6) == "CDATA[") {
						var N = c.indexOf("]]>", g + 9);
						return S.startCDATA(), S.characters(c, g + 9, N - g - 9), S.endCDATA(), N + 3;
					}
					var E = q(c, g), x = E.length;
					if (x > 1 && /!doctype/i.test(E[0][0])) {
						var U = E[1][0], I = !1, D = !1;
						x > 3 && (/^public$/i.test(E[2][0]) ? (I = E[3][0], D = x > 4 && E[4][0]) : /^system$/i.test(E[2][0]) && (D = E[3][0]));
						var M = E[x - 1];
						return S.startDTD(U, I, D), S.endDTD(), M.index + M[0].length;
					}
			}
			return -1;
		}
		function Z(c, g, S) {
			var O = c.indexOf("?>", g);
			if (O) {
				var N = c.substring(g, O).match(/^<\?(\S*)\s*([\s\S]*?)$/);
				return N ? (N[0].length, S.processingInstruction(N[1], N[2]), O + 2) : -1;
			}
			return -1;
		}
		function R() {
			this.attributeNames = {};
		}
		R.prototype = {
			setTagName: function(c) {
				if (!a.test(c)) throw new Error("invalid tagName:" + c);
				this.tagName = c;
			},
			addValue: function(c, g, S) {
				if (!a.test(c)) throw new Error("invalid attribute:" + c);
				this.attributeNames[c] = this.length, this[this.length++] = {
					qName: c,
					value: g,
					offset: S
				};
			},
			length: 0,
			getLocalName: function(c) {
				return this[c].localName;
			},
			getLocator: function(c) {
				return this[c].locator;
			},
			getQName: function(c) {
				return this[c].qName;
			},
			getURI: function(c) {
				return this[c].uri;
			},
			getValue: function(c) {
				return this[c].value;
			}
		};
		function q(c, g) {
			var S, O = [], N = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
			for (N.lastIndex = g, N.exec(c); S = N.exec(c);) if (O.push(S), S[1]) return O;
		}
		e.XMLReader = $, e.ParseError = C;
	})), Gt = Pe(((e) => {
		var r = er(), t = Fr(), n = Ht(), a = zt(), l = t.DOMImplementation, s = r.NAMESPACE, f = a.ParseError, m = a.XMLReader;
		function d(v) {
			return v.replace(/\r[\n\u0085]/g, `
`).replace(/[\r\u0085\u2028]/g, `
`);
		}
		function w(v) {
			this.options = v || { locator: {} };
		}
		w.prototype.parseFromString = function(v, L) {
			var _ = this.options, P = new m(), F = _.domBuilder || new T(), k = _.errorHandler, Z = _.locator, R = _.xmlns || {}, q = /\/x?html?$/.test(L), c = q ? n.HTML_ENTITIES : n.XML_ENTITIES;
			Z && F.setDocumentLocator(Z), P.errorHandler = h(k, F, Z), P.domBuilder = _.domBuilder || F, q && (R[""] = s.HTML), R.xml = R.xml || s.XML;
			var g = _.normalizeLineEndings || d;
			return v && typeof v == "string" ? P.parse(g(v), R, c) : P.errorHandler.error("invalid doc source"), F.doc;
		};
		function h(v, L, _) {
			if (!v) {
				if (L instanceof T) return L;
				v = L;
			}
			var P = {}, F = v instanceof Function;
			_ = _ || {};
			function k(Z) {
				var R = v[Z];
				!R && F && (R = v.length == 2 ? function(q) {
					v(Z, q);
				} : v), P[Z] = R && function(q) {
					R("[xmldom " + Z + "]	" + q + $(_));
				} || function() {};
			}
			return k("warning"), k("error"), k("fatalError"), P;
		}
		function T() {
			this.cdata = !1;
		}
		function C(v, L) {
			L.lineNumber = v.lineNumber, L.columnNumber = v.columnNumber;
		}
		T.prototype = {
			startDocument: function() {
				this.doc = new l().createDocument(null, null, null), this.locator && (this.doc.documentURI = this.locator.systemId);
			},
			startElement: function(v, L, _, P) {
				var F = this.doc, k = F.createElementNS(v, _ || L), Z = P.length;
				j(this, k), this.currentElement = k, this.locator && C(this.locator, k);
				for (var R = 0; R < Z; R++) {
					var v = P.getURI(R), q = P.getValue(R), _ = P.getQName(R), c = F.createAttributeNS(v, _);
					this.locator && C(P.getLocator(R), c), c.value = c.nodeValue = q, k.setAttributeNode(c);
				}
			},
			endElement: function(v, L, _) {
				var P = this.currentElement;
				P.tagName, this.currentElement = P.parentNode;
			},
			startPrefixMapping: function(v, L) {},
			endPrefixMapping: function(v) {},
			processingInstruction: function(v, L) {
				var _ = this.doc.createProcessingInstruction(v, L);
				this.locator && C(this.locator, _), j(this, _);
			},
			ignorableWhitespace: function(v, L, _) {},
			characters: function(v, L, _) {
				if (v = H.apply(this, arguments), v) {
					if (this.cdata) var P = this.doc.createCDATASection(v);
					else var P = this.doc.createTextNode(v);
					this.currentElement ? this.currentElement.appendChild(P) : /^\s*$/.test(v) && this.doc.appendChild(P), this.locator && C(this.locator, P);
				}
			},
			skippedEntity: function(v) {},
			endDocument: function() {
				this.doc.normalize();
			},
			setDocumentLocator: function(v) {
				(this.locator = v) && (v.lineNumber = 0);
			},
			comment: function(v, L, _) {
				v = H.apply(this, arguments);
				var P = this.doc.createComment(v);
				this.locator && C(this.locator, P), j(this, P);
			},
			startCDATA: function() {
				this.cdata = !0;
			},
			endCDATA: function() {
				this.cdata = !1;
			},
			startDTD: function(v, L, _) {
				var P = this.doc.implementation;
				if (P && P.createDocumentType) {
					var F = P.createDocumentType(v, L, _);
					this.locator && C(this.locator, F), j(this, F), this.doc.doctype = F;
				}
			},
			warning: function(v) {
				console.warn("[xmldom warning]	" + v, $(this.locator));
			},
			error: function(v) {
				console.error("[xmldom error]	" + v, $(this.locator));
			},
			fatalError: function(v) {
				throw new f(v, this.locator);
			}
		};
		function $(v) {
			if (v) return `
@` + (v.systemId || "") + "#[line:" + v.lineNumber + ",col:" + v.columnNumber + "]";
		}
		function H(v, L, _) {
			return typeof v == "string" ? v.substr(L, _) : v.length >= L + _ || L ? new java.lang.String(v, L, _) + "" : v;
		}
		"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(v) {
			T.prototype[v] = function() {
				return null;
			};
		});
		function j(v, L) {
			v.currentElement ? v.currentElement.appendChild(L) : v.doc.appendChild(L);
		}
		e.__DOMHandler = T, e.normalizeLineEndings = d, e.DOMParser = w;
	})), Wt = Pe(((e) => {
		var r = Fr();
		e.DOMImplementation = r.DOMImplementation, e.XMLSerializer = r.XMLSerializer, e.DOMParser = Gt().DOMParser;
	}))(), Zt = { createDocument: function(r) {
		return new Wt.DOMParser().parseFromString(r);
	} }, $r = {}, Yt = (function(e, r, t, n, a) {
		var l = new Worker($r[r] || ($r[r] = URL.createObjectURL(new Blob([e + ";addEventListener(\"error\",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})"], { type: "text/javascript" }))));
		return l.onmessage = function(s) {
			var f = s.data, m = f.$e$;
			if (m) {
				var d = new Error(m[0]);
				d.code = m[1], d.stack = m[2], a(d, null);
			} else a(null, f);
		}, l.postMessage(t, n), l;
	}), ie = Uint8Array, Ae = Uint16Array, Br = Int32Array, yr = new ie([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		2,
		2,
		2,
		2,
		3,
		3,
		3,
		3,
		4,
		4,
		4,
		4,
		5,
		5,
		5,
		5,
		0,
		0,
		0,
		0
	]), br = new ie([
		0,
		0,
		0,
		0,
		1,
		1,
		2,
		2,
		3,
		3,
		4,
		4,
		5,
		5,
		6,
		6,
		7,
		7,
		8,
		8,
		9,
		9,
		10,
		10,
		11,
		11,
		12,
		12,
		13,
		13,
		0,
		0
	]), Hr = new ie([
		16,
		17,
		18,
		0,
		8,
		7,
		9,
		6,
		10,
		5,
		11,
		4,
		12,
		3,
		13,
		2,
		14,
		1,
		15
	]), zr = function(e, r) {
		for (var t = new Ae(31), n = 0; n < 31; ++n) t[n] = r += 1 << e[n - 1];
		for (var a = new Br(t[30]), n = 1; n < 30; ++n) for (var l = t[n]; l < t[n + 1]; ++l) a[l] = l - t[n] << 5 | n;
		return {
			b: t,
			r: a
		};
	}, Gr = zr(yr, 2), wr = Gr.b, Kt = Gr.r;
	wr[28] = 258, Kt[258] = 28;
	for (var Xr = zr(br, 0), Wr = Xr.b, Ti = Xr.r, rr = new Ae(32768), G = 0; G < 32768; ++G) {
		var we = (G & 43690) >> 1 | (G & 21845) << 1;
		we = (we & 52428) >> 2 | (we & 13107) << 2, we = (we & 61680) >> 4 | (we & 3855) << 4, rr[G] = ((we & 65280) >> 8 | (we & 255) << 8) >> 1;
	}
	for (var Ee = (function(e, r, t) {
		for (var n = e.length, a = 0, l = new Ae(r); a < n; ++a) e[a] && ++l[e[a] - 1];
		var s = new Ae(r);
		for (a = 1; a < r; ++a) s[a] = s[a - 1] + l[a - 1] << 1;
		var f;
		if (t) {
			f = new Ae(1 << r);
			var m = 15 - r;
			for (a = 0; a < n; ++a) if (e[a]) for (var d = a << 4 | e[a], w = r - e[a], h = s[e[a] - 1]++ << w, T = h | (1 << w) - 1; h <= T; ++h) f[rr[h] >> m] = d;
		} else for (f = new Ae(n), a = 0; a < n; ++a) e[a] && (f[a] = rr[s[e[a] - 1]++] >> 15 - e[a]);
		return f;
	}), Ce = new ie(288), G = 0; G < 144; ++G) Ce[G] = 8;
	for (var G = 144; G < 256; ++G) Ce[G] = 9;
	for (var G = 256; G < 280; ++G) Ce[G] = 7;
	for (var G = 280; G < 288; ++G) Ce[G] = 8;
	for (var Er = new ie(32), G = 0; G < 32; ++G) Er[G] = 5;
	Ee(Ce, 9, 0);
	var Zr = Ee(Ce, 9, 1);
	Ee(Er, 5, 0);
	var Yr = Ee(Er, 5, 1), tr = function(e) {
		for (var r = e[0], t = 1; t < e.length; ++t) e[t] > r && (r = e[t]);
		return r;
	}, fe = function(e, r, t) {
		var n = r / 8 | 0;
		return (e[n] | e[n + 1] << 8) >> (r & 7) & t;
	}, nr = function(e, r) {
		var t = r / 8 | 0;
		return (e[t] | e[t + 1] << 8 | e[t + 2] << 16) >> (r & 7);
	}, Kr = function(e) {
		return (e + 7) / 8 | 0;
	}, or = function(e, r, t) {
		return (r == null || r < 0) && (r = 0), (t == null || t > e.length) && (t = e.length), new ie(e.subarray(r, t));
	}, Jr = [
		"unexpected EOF",
		"invalid block type",
		"invalid length/literal",
		"invalid distance",
		"stream finished",
		"no stream handler",
		,
		"no callback",
		"invalid UTF-8 data",
		"extra field too long",
		"date not in range 1980-2099",
		"filename too long",
		"stream finishing",
		"invalid zip data"
	], ne = function(e, r, t) {
		var n = new Error(r || Jr[e]);
		if (n.code = e, Error.captureStackTrace && Error.captureStackTrace(n, ne), !t) throw n;
		return n;
	}, Qr = function(e, r, t, n) {
		var a = e.length, l = n ? n.length : 0;
		if (!a || r.f && !r.l) return t || new ie(0);
		var s = !t, f = s || r.i != 2, m = r.i;
		s && (t = new ie(a * 3));
		var d = function(ye) {
			var Te = t.length;
			if (ye > Te) {
				var _e = new ie(Math.max(Te * 2, ye));
				_e.set(t), t = _e;
			}
		}, w = r.f || 0, h = r.p || 0, T = r.b || 0, C = r.l, $ = r.d, H = r.m, j = r.n, v = a * 8;
		do {
			if (!C) {
				w = fe(e, h, 1);
				var L = fe(e, h + 1, 3);
				if (h += 3, L) if (L == 1) C = Zr, $ = Yr, H = 9, j = 5;
				else if (L == 2) {
					var k = fe(e, h, 31) + 257, Z = fe(e, h + 10, 15) + 4, R = k + fe(e, h + 5, 31) + 1;
					h += 14;
					for (var q = new ie(R), c = new ie(19), g = 0; g < Z; ++g) c[Hr[g]] = fe(e, h + g * 3, 7);
					h += Z * 3;
					for (var S = tr(c), O = (1 << S) - 1, N = Ee(c, S, 1), g = 0; g < R;) {
						var E = N[fe(e, h, O)];
						h += E & 15;
						var _ = E >> 4;
						if (_ < 16) q[g++] = _;
						else {
							var x = 0, U = 0;
							for (_ == 16 ? (U = 3 + fe(e, h, 3), h += 2, x = q[g - 1]) : _ == 17 ? (U = 3 + fe(e, h, 7), h += 3) : _ == 18 && (U = 11 + fe(e, h, 127), h += 7); U--;) q[g++] = x;
						}
					}
					var I = q.subarray(0, k), D = q.subarray(k);
					H = tr(I), j = tr(D), C = Ee(I, H, 1), $ = Ee(D, j, 1);
				} else ne(1);
				else {
					var _ = Kr(h) + 4, P = e[_ - 4] | e[_ - 3] << 8, F = _ + P;
					if (F > a) {
						m && ne(0);
						break;
					}
					f && d(T + P), t.set(e.subarray(_, F), T), r.b = T += P, r.p = h = F * 8, r.f = w;
					continue;
				}
				if (h > v) {
					m && ne(0);
					break;
				}
			}
			f && d(T + 131072);
			for (var M = (1 << H) - 1, ee = (1 << j) - 1, B = h;; B = h) {
				var x = C[nr(e, h) & M], J = x >> 4;
				if (h += x & 15, h > v) {
					m && ne(0);
					break;
				}
				if (x || ne(2), J < 256) t[T++] = J;
				else if (J == 256) {
					B = h, C = null;
					break;
				} else {
					var V = J - 254;
					if (J > 264) {
						var g = J - 257, Q = yr[g];
						V = fe(e, h, (1 << Q) - 1) + wr[g], h += Q;
					}
					var X = $[nr(e, h) & ee], W = X >> 4;
					X || ne(3), h += X & 15;
					var D = Wr[W];
					if (W > 3) {
						var Q = br[W];
						D += nr(e, h) & (1 << Q) - 1, h += Q;
					}
					if (h > v) {
						m && ne(0);
						break;
					}
					f && d(T + 131072);
					var he = T + V;
					if (T < D) {
						var re = l - D, se = Math.min(D, he);
						for (re + T < 0 && ne(3); T < se; ++T) t[T] = n[re + T];
					}
					for (; T < he; ++T) t[T] = t[T - D];
				}
			}
			r.l = C, r.p = B, r.b = T, r.f = w, C && (w = 1, r.m = H, r.d = $, r.n = j);
		} while (!w);
		return T != t.length && s ? or(t, 0, T) : t.subarray(0, T);
	}, Jt = new ie(0), Qt = function(e, r) {
		var t = {};
		for (var n in e) t[n] = e[n];
		for (var n in r) t[n] = r[n];
		return t;
	}, et = function(e, r, t) {
		for (var n = e(), a = e.toString(), l = a.slice(a.indexOf("[") + 1, a.lastIndexOf("]")).replace(/\s+/g, "").split(","), s = 0; s < n.length; ++s) {
			var f = n[s], m = l[s];
			if (typeof f == "function") {
				r += ";" + m + "=";
				var d = f.toString();
				if (f.prototype) if (d.indexOf("[native code]") != -1) {
					var w = d.indexOf(" ", 8) + 1;
					r += d.slice(w, d.indexOf("(", w));
				} else {
					r += d;
					for (var h in f.prototype) r += ";" + m + ".prototype." + h + "=" + f.prototype[h].toString();
				}
				else r += d;
			} else t[m] = f;
		}
		return r;
	}, ir = [], en = function(e) {
		var r = [];
		for (var t in e) e[t].buffer && r.push((e[t] = new e[t].constructor(e[t])).buffer);
		return r;
	}, rn = function(e, r, t, n) {
		if (!ir[t]) {
			for (var a = "", l = {}, s = e.length - 1, f = 0; f < s; ++f) a = et(e[f], a, l);
			ir[t] = {
				c: et(e[s], a, l),
				e: l
			};
		}
		var m = Qt({}, ir[t].e);
		return Yt(ir[t].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + r.toString() + "}", t, m, en(m), n);
	}, tn = function() {
		return [
			ie,
			Ae,
			Br,
			yr,
			br,
			Hr,
			wr,
			Wr,
			Zr,
			Yr,
			rr,
			Jr,
			Ee,
			tr,
			fe,
			nr,
			Kr,
			or,
			ne,
			Qr,
			Sr,
			rt,
			tt
		];
	}, rt = function(e) {
		return postMessage(e, [e.buffer]);
	}, tt = function(e) {
		return e && {
			out: e.size && new ie(e.size),
			dictionary: e.dictionary
		};
	}, nn = function(e, r, t, n, a, l) {
		var s = rn(t, n, a, function(f, m) {
			s.terminate(), l(f, m);
		});
		return s.postMessage([e, r], r.consume ? [e.buffer] : []), function() {
			s.terminate();
		};
	}, ge = function(e, r) {
		return e[r] | e[r + 1] << 8;
	}, pe = function(e, r) {
		return (e[r] | e[r + 1] << 8 | e[r + 2] << 16 | e[r + 3] << 24) >>> 0;
	}, Tr = function(e, r) {
		return pe(e, r) + pe(e, r + 4) * 4294967296;
	};
	function on(e, r, t) {
		return t || (t = r, r = {}), typeof t != "function" && ne(7), nn(e, r, [tn], function(n) {
			return rt(Sr(n.data[0], tt(n.data[1])));
		}, 1, t);
	}
	function Sr(e, r) {
		return Qr(e, { i: 2 }, r && r.out, r && r.dictionary);
	}
	var Nr = typeof TextDecoder < "u" && new TextDecoder();
	try {
		Nr.decode(Jt, { stream: !0 });
	} catch {}
	var un = function(e) {
		for (var r = "", t = 0;;) {
			var n = e[t++], a = (n > 127) + (n > 223) + (n > 239);
			if (t + a > e.length) return {
				s: r,
				r: or(e, t - 1)
			};
			a ? a == 3 ? (n = ((n & 15) << 18 | (e[t++] & 63) << 12 | (e[t++] & 63) << 6 | e[t++] & 63) - 65536, r += String.fromCharCode(55296 | n >> 10, 56320 | n & 1023)) : a & 1 ? r += String.fromCharCode((n & 31) << 6 | e[t++] & 63) : r += String.fromCharCode((n & 15) << 12 | (e[t++] & 63) << 6 | e[t++] & 63) : r += String.fromCharCode(n);
		}
	};
	function nt(e, r) {
		if (r) {
			for (var t = "", n = 0; n < e.length; n += 16384) t += String.fromCharCode.apply(null, e.subarray(n, n + 16384));
			return t;
		} else {
			if (Nr) return Nr.decode(e);
			var a = un(e), l = a.s, t = a.r;
			return t.length && ne(8), l;
		}
	}
	var sn = function(e, r) {
		return r + 30 + ge(e, r + 26) + ge(e, r + 28);
	}, ln = function(e, r, t) {
		var n = ge(e, r + 28), a = ge(e, r + 30), l = nt(e.subarray(r + 46, r + 46 + n), !(ge(e, r + 8) & 2048)), s = r + 46 + n, f = cn(e, s, a, t, pe(e, r + 20), pe(e, r + 24), pe(e, r + 42)), m = f[0], d = f[1], w = f[2];
		return [
			ge(e, r + 10),
			m,
			d,
			l,
			s + a + ge(e, r + 32),
			w
		];
	}, cn = function(e, r, t, n, a, l, s) {
		var f = a == 4294967295, m = l == 4294967295, d = s == 4294967295, w = r + t, h = f + m + d;
		if (n && h) {
			for (; r + 4 < w; r += 4 + ge(e, r + 2)) if (ge(e, r) == 1) return [
				f ? Tr(e, r + 4 + 8 * m) : a,
				m ? Tr(e, r + 4) : l,
				d ? Tr(e, r + 4 + 8 * (m + f)) : s,
				1
			];
			n < 2 && ne(13);
		}
		return [
			a,
			l,
			s,
			0
		];
	}, ot = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(e) {
		e();
	};
	function fn(e, r, t) {
		t || (t = r, r = {}), typeof t != "function" && ne(7);
		var n = [], a = function() {
			for (var j = 0; j < n.length; ++j) n[j]();
		}, l = {}, s = function(j, v) {
			ot(function() {
				t(j, v);
			});
		};
		ot(function() {
			s = t;
		});
		for (var f = e.length - 22; pe(e, f) != 101010256; --f) if (!f || e.length - f > 65558) return s(ne(13, 0, 1), null), a;
		var m = ge(e, f + 8);
		if (m) {
			var d = m, w = pe(e, f + 16), h = pe(e, f - 20) == 117853008;
			if (h) {
				var T = pe(e, f - 12);
				h = pe(e, T) == 101075792, h && (d = m = pe(e, T + 32), w = pe(e, T + 48));
			}
			for (var C = r && r.filter, $ = function(j) {
				var v = ln(e, w, h), L = v[0], _ = v[1], P = v[2], F = v[3], k = v[4], Z = v[5], R = sn(e, Z);
				w = k;
				var q = function(g, S) {
					g ? (a(), s(g, null)) : (S && (l[F] = S), --m || s(null, l));
				};
				if (!C || C({
					name: F,
					size: _,
					originalSize: P,
					compression: L
				})) if (!L) q(null, or(e, R, R + _));
				else if (L == 8) {
					var c = e.subarray(R, R + _);
					if (P < 524288 || _ > .8 * P) try {
						q(null, Sr(c, { out: new ie(P) }));
					} catch (g) {
						q(g, null);
					}
					else n.push(on(c, { size: P }, q));
				} else q(ne(14, "unknown compression type " + L, 1), null);
				else q(null, null);
			}, H = 0; H < d; ++H) $(H);
		} else s(null, {});
		return a;
	}
	function pn(e, r) {
		return mn(e, r, hn, !0);
	}
	function mn(e) {
		var r = (arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}).filter, t = arguments.length > 2 ? arguments[2] : void 0;
		return arguments.length > 3 && arguments[3], t(new Uint8Array(e), { filter: function(a) {
			return r ? r({ path: a.name }) : !0;
		} });
	}
	function hn(e) {
		return new Promise(function(r, t) {
			fn(e, function(n, a) {
				n ? t(n) : r(a);
			});
		});
	}
	function vn(e) {
		for (var r = {}, t = 0, n = Object.keys(e); t < n.length; t++) {
			var a = n[t];
			r[a] = nt(e[a]);
		}
		return r;
	}
	function gn(e) {
		var r = e.path;
		return r.endsWith(".xml") || r.endsWith(".xml.rels");
	}
	function dn(e) {
		return e instanceof File || e instanceof Blob ? e.arrayBuffer().then(it) : Promise.resolve(e).then(it);
	}
	function it(e) {
		return pn(e, { filter: gn }).then(vn);
	}
	function de(e, r) {
		for (var t = 0; t < e.childNodes.length;) {
			var n = e.childNodes[t];
			if (n.nodeType === 1 && De(n) === r) return n;
			t++;
		}
	}
	function $e(e, r) {
		for (var t = [], n = 0; n < e.childNodes.length;) {
			var a = e.childNodes[n];
			a.nodeType === 1 && De(a) === r && t.push(a), n++;
		}
		return t;
	}
	function ar(e, r, t) {
		for (var n = 0; n < e.childNodes.length;) {
			var a = e.childNodes[n];
			r ? a.nodeType === 1 && De(a) === r && t(a, n) : t(a, n), n++;
		}
	}
	function yn(e, r, t) {
		var n = [];
		return ar(e, r, function(a, l) {
			n.push(t(a, l));
		}), n;
	}
	var bn = /.+\:/;
	function De(e) {
		return e.tagName.replace(bn, "");
	}
	function wn(e) {
		return e.nodeType === 1;
	}
	function at(e) {
		for (var r = 0; r < e.childNodes.length;) {
			if (wn(e.childNodes[r])) return e.childNodes[r];
			r++;
		}
	}
	function ut(e) {
		if (e.nodeType !== 1) return e.textContent;
		for (var r = "<" + De(e), t = 0; t < e.attributes.length;) r += " " + e.attributes[t].name + "=\"" + e.attributes[t].value + "\"", t++;
		r += ">";
		for (var n = 0; n < e.childNodes.length;) r += ut(e.childNodes[n]), n++;
		return r += "</" + De(e) + ">", r;
	}
	function En(e) {
		var r = e.documentElement, t = de(r, "sheetData"), n = [];
		return ar(t, "row", function(a) {
			ar(a, "c", function(l) {
				n.push(l);
			});
		}), n;
	}
	function Tn(e, r) {
		return de(r, "v");
	}
	function Sn(e, r) {
		var t = at(r);
		if (t && De(t) === "is") {
			var n = at(t);
			if (n && De(n) === "t") return n.textContent;
		}
	}
	function Nn(e) {
		var r = e.documentElement, t = de(r, "dimension");
		if (t) return t.getAttribute("ref");
	}
	function On(e) {
		var r = e.documentElement, t = de(r, "cellStyleXfs");
		return t ? $e(t, "xf") : [];
	}
	function An(e) {
		var r = e.documentElement, t = de(r, "cellXfs");
		return t ? $e(t, "xf") : [];
	}
	function Dn(e) {
		var r = e.documentElement, t = de(r, "numFmts");
		return t ? $e(t, "numFmt") : [];
	}
	function _n(e) {
		var r = e.documentElement;
		return yn(r, "si", function(t) {
			var n = de(t, "t");
			if (n) return n.textContent;
			var a = "";
			return ar(t, "r", function(l) {
				a += de(l, "t").textContent;
			}), a;
		});
	}
	function In(e) {
		var r = e.documentElement;
		return de(r, "workbookPr");
	}
	function xn(e) {
		var r = e.documentElement;
		return $e(r, "Relationship");
	}
	function Rn(e) {
		var r = e.documentElement;
		return $e(de(r, "sheets"), "sheet");
	}
	function qn(e, r) {
		var t = r.createDocument(e), n = {}, a = In(t);
		return a && a.getAttribute("date1904") === "1" && (n.epoch1904 = !0), n.sheets = [], Rn(t).forEach(function(s) {
			s.getAttribute("name") && n.sheets.push({
				id: s.getAttribute("sheetId"),
				name: s.getAttribute("name"),
				relationId: s.getAttribute("r:id")
			});
		}), n;
	}
	function Ln(e, r) {
		var t = r.createDocument(e), n = {
			sheets: {},
			sharedStrings: void 0,
			styles: void 0
		};
		return xn(t).forEach(function(l) {
			var s = l.getAttribute("Target");
			switch (l.getAttribute("Type")) {
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles":
					n.styles = Or(s);
					break;
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings":
					n.sharedStrings = Or(s);
					break;
				case "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet":
					n.sheets[l.getAttribute("Id")] = Or(s);
					break;
			}
		}), n;
	}
	function Or(e) {
		return e[0] === "/" ? e.slice(1) : "xl/" + e;
	}
	function Be(e) {
		"@babel/helpers - typeof";
		return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
			return typeof r;
		} : function(r) {
			return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
		}, Be(e);
	}
	function st(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			r && (n = n.filter(function(a) {
				return Object.getOwnPropertyDescriptor(e, a).enumerable;
			})), t.push.apply(t, n);
		}
		return t;
	}
	function lt(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = arguments[r] != null ? arguments[r] : {};
			r % 2 ? st(Object(t), !0).forEach(function(n) {
				Pn(e, n, t[n]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : st(Object(t)).forEach(function(n) {
				Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
			});
		}
		return e;
	}
	function Pn(e, r, t) {
		return r = Cn(r), r in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	function Cn(e) {
		var r = kn(e, "string");
		return Be(r) === "symbol" ? r : String(r);
	}
	function kn(e, r) {
		if (Be(e) !== "object" || e === null) return e;
		var t = e[Symbol.toPrimitive];
		if (t !== void 0) {
			var n = t.call(e, r || "default");
			if (Be(n) !== "object") return n;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (r === "string" ? String : Number)(e);
	}
	function Mn(e, r) {
		if (!e) return {};
		var t = r.createDocument(e), n = On(t).map(Ar), a = Dn(t).map(Un).reduce(function(l, s) {
			return l[s.id] = s, l;
		}, []);
		return An(t).map(function(s) {
			return s.hasAttribute("xfId") ? lt(lt({}, n[s.xfId]), Ar(s, a)) : Ar(s, a);
		});
	}
	function Un(e) {
		return {
			id: e.getAttribute("numFmtId"),
			template: e.getAttribute("formatCode")
		};
	}
	function Ar(e, r) {
		var t = {};
		if (e.hasAttribute("numFmtId")) {
			var n = e.getAttribute("numFmtId");
			r[n] ? t.numberFormat = r[n] : t.numberFormat = { id: n };
		}
		return t;
	}
	function jn(e, r) {
		return e ? _n(r.createDocument(e)) : [];
	}
	function ct(e, r) {
		return r && r.epoch1904 && (e += 1462), new Date(Math.round((e - 25569) * 24 * (3600 * 1e3)));
	}
	function Vn(e, r) {
		var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t) return (t = t.call(e)).next.bind(t);
		if (Array.isArray(e) || (t = Fn(e)) || r && e && typeof e.length == "number") {
			t && (e = t);
			var n = 0;
			return function() {
				return n >= e.length ? { done: !0 } : {
					done: !1,
					value: e[n++]
				};
			};
		}
		throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function Fn(e, r) {
		if (e) {
			if (typeof e == "string") return ft(e, r);
			var t = Object.prototype.toString.call(e).slice(8, -1);
			if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set") return Array.from(e);
			if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return ft(e, r);
		}
	}
	function ft(e, r) {
		(r == null || r > e.length) && (r = e.length);
		for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
		return n;
	}
	function $n(e, r, t) {
		if (e) {
			var n = r[e];
			if (!n) throw new Error("Cell style not found: ".concat(e));
			if (!n.numberFormat) return !1;
			if (Bn.indexOf(Number(n.numberFormat.id)) >= 0 || t.dateFormat && n.numberFormat.template === t.dateFormat || t.smartDateParser !== !1 && n.numberFormat.template && Gn(n.numberFormat.template)) return !0;
		}
	}
	var Bn = [
		14,
		15,
		16,
		17,
		18,
		19,
		20,
		21,
		22,
		27,
		30,
		36,
		45,
		46,
		47,
		50,
		57
	], Hn = /^\[\$-414\]/, zn = /;@$/;
	function Gn(e) {
		e = e.toLowerCase(), e = e.replace(Hn, ""), e = e.replace(zn, "");
		for (var r = Vn(e.split(/\W+/)), t; !(t = r()).done;) {
			var n = t.value;
			if (Xn.indexOf(n) < 0) return !1;
		}
		return !0;
	}
	var Xn = [
		"ss",
		"mm",
		"h",
		"hh",
		"am",
		"pm",
		"d",
		"dd",
		"m",
		"mm",
		"mmm",
		"mmmm",
		"yy",
		"yyyy",
		"e"
	];
	function Wn(e, r, t) {
		var n = t.getInlineStringValue, a = t.getInlineStringXml, l = t.getStyleId, s = t.styles, f = t.values, m = t.properties, d = t.options;
		switch (r || (r = "n"), r) {
			case "str":
				e = Dr(e, d);
				break;
			case "inlineStr":
				if (e = n(), e === void 0) throw new Error("Unsupported \"inline string\" cell value structure: ".concat(a()));
				e = Dr(e, d);
				break;
			case "s":
				var w = Number(e);
				if (isNaN(w)) throw new Error("Invalid \"shared\" string index: ".concat(e));
				if (w >= f.length) throw new Error("An out-of-bounds \"shared\" string index: ".concat(e));
				e = f[w], e = Dr(e, d);
				break;
			case "b":
				if (e === "1") e = !0;
				else if (e === "0") e = !1;
				else throw new Error("Unsupported \"boolean\" cell value: ".concat(e));
				break;
			case "z":
				e = void 0;
				break;
			case "e":
				e = Zn(e);
				break;
			case "d":
				if (e === void 0) break;
				var h = new Date(e);
				if (isNaN(h.valueOf())) throw new Error("Unsupported \"date\" cell value: ".concat(e));
				e = h;
				break;
			case "n":
				if (e === void 0) break;
				$n(l(), s, d) ? (e = pt(e), e = ct(e, m)) : e = (d.parseNumber || pt)(e);
				break;
			default: throw new TypeError("Cell type not supported: ".concat(r));
		}
		return e === void 0 && (e = null), e;
	}
	function Zn(e) {
		switch (e) {
			case 0: return "#NULL!";
			case 7: return "#DIV/0!";
			case 15: return "#VALUE!";
			case 23: return "#REF!";
			case 29: return "#NAME?";
			case 36: return "#NUM!";
			case 42: return "#N/A";
			case 43: return "#GETTING_DATA";
			default: return "#ERROR_".concat(e);
		}
	}
	function Dr(e, r) {
		return r.trim !== !1 && (e = e.trim()), e === "" && (e = void 0), e;
	}
	function pt(e) {
		var r = Number(e);
		if (isNaN(r)) throw new Error("Invalid \"numeric\" cell value: ".concat(e));
		return r;
	}
	var Yn = [
		"",
		"A",
		"B",
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
		"V",
		"W",
		"X",
		"Y",
		"Z"
	];
	function Kn(e) {
		var r = function(d, w) {
			return d - w;
		}, t = e.map(function(m) {
			return m.row;
		}).sort(r), n = e.map(function(m) {
			return m.column;
		}).sort(r), a = t[0], l = t[t.length - 1], s = n[0], f = n[n.length - 1];
		return [{
			row: a,
			column: s
		}, {
			row: l,
			column: f
		}];
	}
	function Jn(e) {
		for (var r = 0, t = 0; t < e.length;) r *= 26, r += Yn.indexOf(e[t]), t++;
		return r;
	}
	function mt(e) {
		return e = e.split(/(\d+)/), [parseInt(e[1]), Jn(e[0].trim())];
	}
	function Qn(e, r, t, n, a, l, s) {
		var f = mt(e.getAttribute("r")), m = Tn(r, e), d = m && m.textContent, w;
		return e.hasAttribute("t") && (w = e.getAttribute("t")), {
			row: f[0],
			column: f[1],
			value: Wn(d, w, {
				getInlineStringValue: function() {
					return Sn(r, e);
				},
				getInlineStringXml: function() {
					return ut(e);
				},
				getStyleId: function() {
					return e.getAttribute("s");
				},
				styles: a,
				values: n,
				properties: l,
				options: s
			})
		};
	}
	function eo(e, r, t, n, a, l) {
		var s = En(e);
		return s.length === 0 ? [] : s.map(function(f) {
			return Qn(f, e, r, t, n, a, l);
		});
	}
	function ro(e, r) {
		return io(e) || oo(e, r) || no(e, r) || to();
	}
	function to() {
		throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function no(e, r) {
		if (e) {
			if (typeof e == "string") return ht(e, r);
			var t = Object.prototype.toString.call(e).slice(8, -1);
			if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set") return Array.from(e);
			if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return ht(e, r);
		}
	}
	function ht(e, r) {
		(r == null || r > e.length) && (r = e.length);
		for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
		return n;
	}
	function oo(e, r) {
		var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t != null) {
			var n, a, l, s, f = [], m = !0, d = !1;
			try {
				if (l = (t = t.call(e)).next, r === 0) {
					if (Object(t) !== t) return;
					m = !1;
				} else for (; !(m = (n = l.call(t)).done) && (f.push(n.value), f.length !== r); m = !0);
			} catch (w) {
				d = !0, a = w;
			} finally {
				try {
					if (!m && t.return != null && (s = t.return(), Object(s) !== s)) return;
				} finally {
					if (d) throw a;
				}
			}
			return f;
		}
	}
	function io(e) {
		if (Array.isArray(e)) return e;
	}
	function ao(e) {
		var r = Nn(e);
		if (r) return r = r.split(":").map(mt).map(function(t) {
			var n = ro(t, 2);
			return {
				row: n[0],
				column: n[1]
			};
		}), r.length === 1 && (r = [r[0], r[0]]), r;
	}
	function uo(e, r, t, n, a, l) {
		var s = r.createDocument(e), f = eo(s, r, t, n, a, l);
		return {
			cells: f,
			dimensions: ao(s) || Kn(f)
		};
	}
	function so(e, r) {
		var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t) return (t = t.call(e)).next.bind(t);
		if (Array.isArray(e) || (t = lo(e)) || r && e && typeof e.length == "number") {
			t && (e = t);
			var n = 0;
			return function() {
				return n >= e.length ? { done: !0 } : {
					done: !1,
					value: e[n++]
				};
			};
		}
		throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function lo(e, r) {
		if (e) {
			if (typeof e == "string") return vt(e, r);
			var t = Object.prototype.toString.call(e).slice(8, -1);
			if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set") return Array.from(e);
			if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return vt(e, r);
		}
	}
	function vt(e, r) {
		(r == null || r > e.length) && (r = e.length);
		for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
		return n;
	}
	function co(e) {
		for (var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t = r.rowIndexSourceMap, n = r.accessor, a = n === void 0 ? function(h) {
			return h;
		} : n, l = r.onlyTrimAtTheEnd, s = e.length - 1; s >= 0;) {
			for (var f = !0, m = so(e[s]), d; !(d = m()).done;) {
				var w = d.value;
				if (a(w) !== null) {
					f = !1;
					break;
				}
			}
			if (f) e.splice(s, 1), t && t.splice(s, 1);
			else if (l) break;
			s--;
		}
		return e;
	}
	function fo(e, r) {
		var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t) return (t = t.call(e)).next.bind(t);
		if (Array.isArray(e) || (t = po(e)) || r && e && typeof e.length == "number") {
			t && (e = t);
			var n = 0;
			return function() {
				return n >= e.length ? { done: !0 } : {
					done: !1,
					value: e[n++]
				};
			};
		}
		throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function po(e, r) {
		if (e) {
			if (typeof e == "string") return gt(e, r);
			var t = Object.prototype.toString.call(e).slice(8, -1);
			if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set") return Array.from(e);
			if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return gt(e, r);
		}
	}
	function gt(e, r) {
		(r == null || r > e.length) && (r = e.length);
		for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
		return n;
	}
	function mo(e) {
		for (var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t = r.accessor, n = t === void 0 ? function(h) {
			return h;
		} : t, a = r.onlyTrimAtTheEnd, l = e[0].length - 1; l >= 0;) {
			for (var s = !0, f = fo(e), m; !(m = f()).done;) {
				var d = m.value;
				if (n(d[l]) !== null) {
					s = !1;
					break;
				}
			}
			if (s) for (var w = 0; w < e.length;) e[w].splice(l, 1), w++;
			else if (a) break;
			l--;
		}
		return e;
	}
	function ho(e, r) {
		var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t) return (t = t.call(e)).next.bind(t);
		if (Array.isArray(e) || (t = dt(e)) || r && e && typeof e.length == "number") {
			t && (e = t);
			var n = 0;
			return function() {
				return n >= e.length ? { done: !0 } : {
					done: !1,
					value: e[n++]
				};
			};
		}
		throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function vo(e, r) {
		return bo(e) || yo(e, r) || dt(e, r) || go();
	}
	function go() {
		throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function dt(e, r) {
		if (e) {
			if (typeof e == "string") return yt(e, r);
			var t = Object.prototype.toString.call(e).slice(8, -1);
			if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set") return Array.from(e);
			if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return yt(e, r);
		}
	}
	function yt(e, r) {
		(r == null || r > e.length) && (r = e.length);
		for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
		return n;
	}
	function yo(e, r) {
		var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t != null) {
			var n, a, l, s, f = [], m = !0, d = !1;
			try {
				if (l = (t = t.call(e)).next, r === 0) {
					if (Object(t) !== t) return;
					m = !1;
				} else for (; !(m = (n = l.call(t)).done) && (f.push(n.value), f.length !== r); m = !0);
			} catch (w) {
				d = !0, a = w;
			} finally {
				try {
					if (!m && t.return != null && (s = t.return(), Object(s) !== s)) return;
				} finally {
					if (d) throw a;
				}
			}
			return f;
		}
	}
	function bo(e) {
		if (Array.isArray(e)) return e;
	}
	function wo(e, r) {
		var t = e.dimensions, n = e.cells;
		if (n.length === 0) return [];
		var a = vo(t, 2);
		a[0];
		for (var l = a[1], s = l.column, f = l.row, m = new Array(f), d = 0; d < f;) {
			m[d] = new Array(s);
			for (var w = 0; w < s;) m[d][w] = null, w++;
			d++;
		}
		for (var h = ho(n), T; !(T = h()).done;) {
			var C = T.value, $ = C.row - 1, H = C.column - 1;
			H < s && $ < f && (m[$][H] = C.value);
		}
		var j = r.rowIndexSourceMap;
		if (j) for (var v = 0; v < m.length;) j[v] = v, v++;
		return m = co(mo(m, { onlyTrimAtTheEnd: !0 }), {
			onlyTrimAtTheEnd: !0,
			rowIndexSourceMap: j
		}), r.transformData && (m = r.transformData(m)), m;
	}
	function He(e) {
		"@babel/helpers - typeof";
		return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
			return typeof r;
		} : function(r) {
			return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
		}, He(e);
	}
	function Eo(e, r) {
		var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t) return (t = t.call(e)).next.bind(t);
		if (Array.isArray(e) || (t = To(e)) || r && e && typeof e.length == "number") {
			t && (e = t);
			var n = 0;
			return function() {
				return n >= e.length ? { done: !0 } : {
					done: !1,
					value: e[n++]
				};
			};
		}
		throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function To(e, r) {
		if (e) {
			if (typeof e == "string") return bt(e, r);
			var t = Object.prototype.toString.call(e).slice(8, -1);
			if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set") return Array.from(e);
			if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return bt(e, r);
		}
	}
	function bt(e, r) {
		(r == null || r > e.length) && (r = e.length);
		for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
		return n;
	}
	function wt(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			r && (n = n.filter(function(a) {
				return Object.getOwnPropertyDescriptor(e, a).enumerable;
			})), t.push.apply(t, n);
		}
		return t;
	}
	function Et(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = arguments[r] != null ? arguments[r] : {};
			r % 2 ? wt(Object(t), !0).forEach(function(n) {
				So(e, n, t[n]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : wt(Object(t)).forEach(function(n) {
				Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
			});
		}
		return e;
	}
	function So(e, r, t) {
		return r = No(r), r in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	function No(e) {
		var r = Oo(e, "string");
		return He(r) === "symbol" ? r : String(r);
	}
	function Oo(e, r) {
		if (He(e) !== "object" || e === null) return e;
		var t = e[Symbol.toPrimitive];
		if (t !== void 0) {
			var n = t.call(e, r || "default");
			if (He(n) !== "object") return n;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (r === "string" ? String : Number)(e);
	}
	function Ao(e, r) {
		var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
		t.sheet || (t = Et({ sheet: 1 }, t));
		var n = function(T) {
			if (!e[T]) throw new Error("\"".concat(T, "\" file not found inside the *.xlsx file zip archive"));
			return e[T];
		}, a = Ln(n("xl/_rels/workbook.xml.rels"), r), l = a.sharedStrings ? jn(n(a.sharedStrings), r) : [], s = a.styles ? Mn(n(a.styles), r) : {}, f = qn(n("xl/workbook.xml"), r);
		if (t.getSheets) return f.sheets.map(function(h) {
			return { name: h.name };
		});
		var m = Do(t.sheet, f.sheets);
		if (!m || !a.sheets[m]) throw _o(t.sheet, f.sheets);
		var d = uo(n(a.sheets[m]), r, l, s, f, t);
		t = Et({ rowIndexSourceMap: [] }, t);
		var w = wo(d, t);
		return t.properties ? {
			data: w,
			properties: f
		} : w;
	}
	function Do(e, r) {
		if (typeof e == "number") {
			var t = r[e - 1];
			return t && t.relationId;
		}
		for (var n = Eo(r), a; !(a = n()).done;) {
			var l = a.value;
			if (l.name === e) return l.relationId;
		}
	}
	function _o(e, r) {
		var t = r && r.map(function(n, a) {
			return "\"".concat(n.name, "\" (#").concat(a + 1, ")");
		}).join(", ");
		return new Error("Sheet ".concat(typeof e == "number" ? "#" + e : "\"" + e + "\"", " not found in the *.xlsx file.").concat(r ? " Available sheets: " + t + "." : ""));
	}
	function ke(e) {
		"@babel/helpers - typeof";
		return ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
			return typeof r;
		} : function(r) {
			return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
		}, ke(e);
	}
	function Tt(e, r) {
		for (var t = 0; t < r.length; t++) {
			var n = r[t];
			n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, xo(n.key), n);
		}
	}
	function Io(e, r, t) {
		return r && Tt(e.prototype, r), t && Tt(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
	}
	function xo(e) {
		var r = Ro(e, "string");
		return ke(r) === "symbol" ? r : String(r);
	}
	function Ro(e, r) {
		if (ke(e) !== "object" || e === null) return e;
		var t = e[Symbol.toPrimitive];
		if (t !== void 0) {
			var n = t.call(e, r || "default");
			if (ke(n) !== "object") return n;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (r === "string" ? String : Number)(e);
	}
	function qo(e, r) {
		if (!(e instanceof r)) throw new TypeError("Cannot call a class as a function");
	}
	function Lo(e, r) {
		if (typeof r != "function" && r !== null) throw new TypeError("Super expression must either be null or a function");
		e.prototype = Object.create(r && r.prototype, { constructor: {
			value: e,
			writable: !0,
			configurable: !0
		} }), Object.defineProperty(e, "prototype", { writable: !1 }), r && ze(e, r);
	}
	function Po(e) {
		var r = St();
		return function() {
			var n = Ge(e), a;
			if (r) {
				var l = Ge(this).constructor;
				a = Reflect.construct(n, arguments, l);
			} else a = n.apply(this, arguments);
			return Co(this, a);
		};
	}
	function Co(e, r) {
		if (r && (ke(r) === "object" || typeof r == "function")) return r;
		if (r !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
		return ko(e);
	}
	function ko(e) {
		if (e === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		return e;
	}
	function _r(e) {
		var r = typeof Map == "function" ? /* @__PURE__ */ new Map() : void 0;
		return _r = function(n) {
			if (n === null || !Mo(n)) return n;
			if (typeof n != "function") throw new TypeError("Super expression must either be null or a function");
			if (typeof r < "u") {
				if (r.has(n)) return r.get(n);
				r.set(n, a);
			}
			function a() {
				return ur(n, arguments, Ge(this).constructor);
			}
			return a.prototype = Object.create(n.prototype, { constructor: {
				value: a,
				enumerable: !1,
				writable: !0,
				configurable: !0
			} }), ze(a, n);
		}, _r(e);
	}
	function ur(e, r, t) {
		return St() ? ur = Reflect.construct.bind() : ur = function(a, l, s) {
			var f = [null];
			f.push.apply(f, l);
			var m = new (Function.bind.apply(a, f))();
			return s && ze(m, s.prototype), m;
		}, ur.apply(null, arguments);
	}
	function St() {
		if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham) return !1;
		if (typeof Proxy == "function") return !0;
		try {
			return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), !0;
		} catch {
			return !1;
		}
	}
	function Mo(e) {
		return Function.toString.call(e).indexOf("[native code]") !== -1;
	}
	function ze(e, r) {
		return ze = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(n, a) {
			return n.__proto__ = a, n;
		}, ze(e, r);
	}
	function Ge(e) {
		return Ge = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
			return t.__proto__ || Object.getPrototypeOf(t);
		}, Ge(e);
	}
	var le = (function(e) {
		Lo(t, e);
		var r = Po(t);
		function t(n) {
			var a;
			return qo(this, t), a = r.call(this, "invalid"), a.reason = n, a;
		}
		return Io(t);
	})(_r(Error));
	function Uo(e) {
		if (typeof e == "string") {
			var r = e;
			if (e = Number(e), String(e) !== r) throw new le("not_a_number");
		}
		if (typeof e != "number") throw new le("not_a_number");
		if (isNaN(e)) throw new le("invalid_number");
		if (!isFinite(e)) throw new le("out_of_bounds");
		return e;
	}
	function jo(e) {
		if (typeof e == "string") return e;
		if (typeof e == "number") {
			if (isNaN(e)) throw new le("invalid_number");
			if (!isFinite(e)) throw new le("out_of_bounds");
			return String(e);
		}
		throw new le("not_a_string");
	}
	function Vo(e) {
		if (typeof e == "boolean") return e;
		throw new le("not_a_boolean");
	}
	function Fo(e, r) {
		var t = r.properties;
		if (e instanceof Date) {
			if (isNaN(e.valueOf())) throw new le("out_of_bounds");
			return e;
		}
		if (typeof e == "number") {
			if (isNaN(e)) throw new le("invalid_number");
			if (!isFinite(e)) throw new le("out_of_bounds");
			var n = ct(e, t);
			if (isNaN(n.valueOf())) throw new le("out_of_bounds");
			return n;
		}
		throw new le("not_a_date");
	}
	var $o = [
		"isColumnOriented",
		"ignoreEmptyRows",
		"rowIndexSourceMap"
	];
	function Me(e) {
		"@babel/helpers - typeof";
		return Me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
			return typeof r;
		} : function(r) {
			return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
		}, Me(e);
	}
	function Bo(e, r) {
		return Go(e) || zo(e, r) || Nt(e, r) || Ho();
	}
	function Ho() {
		throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function zo(e, r) {
		var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t != null) {
			var n, a, l, s, f = [], m = !0, d = !1;
			try {
				if (l = (t = t.call(e)).next, r === 0) {
					if (Object(t) !== t) return;
					m = !1;
				} else for (; !(m = (n = l.call(t)).done) && (f.push(n.value), f.length !== r); m = !0);
			} catch (w) {
				d = !0, a = w;
			} finally {
				try {
					if (!m && t.return != null && (s = t.return(), Object(s) !== s)) return;
				} finally {
					if (d) throw a;
				}
			}
			return f;
		}
	}
	function Go(e) {
		if (Array.isArray(e)) return e;
	}
	function Xo(e, r) {
		var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
		if (t) return (t = t.call(e)).next.bind(t);
		if (Array.isArray(e) || (t = Nt(e)) || r && e && typeof e.length == "number") {
			t && (e = t);
			var n = 0;
			return function() {
				return n >= e.length ? { done: !0 } : {
					done: !1,
					value: e[n++]
				};
			};
		}
		throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	function Nt(e, r) {
		if (e) {
			if (typeof e == "string") return Ot(e, r);
			var t = Object.prototype.toString.call(e).slice(8, -1);
			if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set") return Array.from(e);
			if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) return Ot(e, r);
		}
	}
	function Ot(e, r) {
		(r == null || r > e.length) && (r = e.length);
		for (var t = 0, n = new Array(r); t < r; t++) n[t] = e[t];
		return n;
	}
	function Wo(e, r) {
		if (e == null) return {};
		var t = Zo(e, r), n, a;
		if (Object.getOwnPropertySymbols) {
			var l = Object.getOwnPropertySymbols(e);
			for (a = 0; a < l.length; a++) n = l[a], !(r.indexOf(n) >= 0) && Object.prototype.propertyIsEnumerable.call(e, n) && (t[n] = e[n]);
		}
		return t;
	}
	function Zo(e, r) {
		if (e == null) return {};
		var t = {}, n = Object.keys(e), a, l;
		for (l = 0; l < n.length; l++) a = n[l], !(r.indexOf(a) >= 0) && (t[a] = e[a]);
		return t;
	}
	function At(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			r && (n = n.filter(function(a) {
				return Object.getOwnPropertyDescriptor(e, a).enumerable;
			})), t.push.apply(t, n);
		}
		return t;
	}
	function Dt(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = arguments[r] != null ? arguments[r] : {};
			r % 2 ? At(Object(t), !0).forEach(function(n) {
				Yo(e, n, t[n]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : At(Object(t)).forEach(function(n) {
				Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
			});
		}
		return e;
	}
	function Yo(e, r, t) {
		return r = Ko(r), r in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	function Ko(e) {
		var r = Jo(e, "string");
		return Me(r) === "symbol" ? r : String(r);
	}
	function Jo(e, r) {
		if (Me(e) !== "object" || e === null) return e;
		var t = e[Symbol.toPrimitive];
		if (t !== void 0) {
			var n = t.call(e, r || "default");
			if (Me(n) !== "object") return n;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (r === "string" ? String : Number)(e);
	}
	var _t = {
		schemaPropertyValueForMissingColumn: void 0,
		schemaPropertyValueForMissingValue: null,
		schemaPropertyShouldSkipRequiredValidationForMissingColumn: function() {
			return !1;
		},
		getEmptyObjectValue: function() {
			return null;
		},
		getEmptyArrayValue: function() {
			return null;
		},
		isColumnOriented: !1,
		ignoreEmptyRows: !0,
		arrayValueSeparator: ","
	};
	function Qo(e, r, t) {
		t ? t = Dt(Dt({}, _t), t) : t = _t;
		var n = t, a = n.isColumnOriented, l = n.ignoreEmptyRows, s = n.rowIndexSourceMap, f = Wo(n, $o), m = s && s.slice();
		ni(r), a && (e = ti(e)), l && (e = e.filter(function(v, L) {
			return v.every(function(_) {
				return _ === null;
			}) ? (m && m.splice(L, 1), !1) : !0;
		}));
		for (var d = e[0], w = [], h = [], T = 1; T < e.length; T++) {
			var C = It(r, e[T], T, void 0, d, h, f);
			w.push(C);
		}
		if (m) for (var $ = Xo(h), H; !(H = $()).done;) {
			var j = H.value;
			j.row = m[j.row - 1] + 1;
		}
		return {
			rows: w,
			errors: h
		};
	}
	function It(e, r, t, n, a, l, s) {
		for (var f = {}, m = !0, d = function(F) {
			var k = F.schemaEntry, Z = F.value, R = F.error, q = F.reason, c = {
				error: R,
				row: t + 1,
				column: k.column,
				value: Z
			};
			return q && (c.reason = q), k.type && (c.type = k.type), c;
		}, w = [], h = function() {
			var F = C[T], k = e[F], Z = F, R = k.column, q = "".concat(n || "", ".").concat(Z), c, g = a.indexOf(R), S = g < 0;
			S || (c = r[g]);
			var O, N, E;
			if (k.schema) O = It(k.schema, r, t, q, a, l, s);
			else if (S) "schemaPropertyValueForMissingColumn" in s && (O = s.schemaPropertyValueForMissingColumn);
			else if (c === void 0) "schemaPropertyValueForMissingValue" in s && (O = s.schemaPropertyValueForMissingValue);
			else if (c === null) "schemaPropertyValueForMissingValue" in s && (O = s.schemaPropertyValueForMissingValue);
			else if (Array.isArray(k.type)) {
				var x = ri(c, s.arrayValueSeparator).map(function(I) {
					if (!N) {
						var D = xt(I, k, s);
						return D.error && (O = I, N = D.error, E = D.reason), D.value;
					}
				});
				N || (O = x.every(Ir) ? s.getEmptyArrayValue(x, { path: q }) : x);
			} else {
				var U = xt(c, k, s);
				N = U.error, E = U.reason, O = N ? c : U.value;
			}
			!N && Ir(O) && k.required && w.push({
				schemaEntry: k,
				value: O,
				isMissingColumn: S
			}), N ? l.push(d({
				schemaEntry: k,
				value: O,
				error: N,
				reason: E
			})) : (m && !Ir(O) && (m = !1), O !== void 0 && (f[Z] = O));
		}, T = 0, C = Object.keys(e); T < C.length; T++) h();
		if (m) return s.getEmptyObjectValue(f, { path: n });
		for (var $ = 0, H = w; $ < H.length; $++) {
			var j = H[$], v = j.schemaEntry, L = j.value;
			if (!(j.isMissingColumn && s.schemaPropertyShouldSkipRequiredValidationForMissingColumn(v.column, { object: f }))) {
				var _ = v.required;
				(typeof _ == "boolean" ? _ : _(f)) && l.push(d({
					schemaEntry: v,
					value: L,
					error: "required"
				}));
			}
		}
		return f;
	}
	function xt(e, r, t) {
		if (e === null) return { value: null };
		var n;
		if (r.parse) throw new Error("`schemaEntry.parse` property was renamed to `schemaEntry.type`");
		if (r.type ? n = ei(e, Array.isArray(r.type) ? r.type[0] : r.type, t) : n = { value: e }, n.error) return n;
		if (n.value !== null) {
			if (r.oneOf && r.oneOf.indexOf(n.value) < 0) return {
				error: "invalid",
				reason: "unknown"
			};
			if (r.validate) try {
				r.validate(n.value);
			} catch (a) {
				return { error: a.message };
			}
		}
		return n;
	}
	function Xe(e, r) {
		try {
			var t = r(e);
			return t === void 0 ? { value: null } : { value: t };
		} catch (a) {
			var n = { error: a.message };
			return a.reason && (n.reason = a.reason), n;
		}
	}
	function ei(e, r, t) {
		switch (r) {
			case String: return Xe(e, jo);
			case Number: return Xe(e, Uo);
			case Date: return Xe(e, function(n) {
				return Fo(n, { properties: t.properties });
			});
			case Boolean: return Xe(e, Vo);
			default:
				if (typeof r == "function") return Xe(e, r);
				throw new Error("Unsupported schema type: ".concat(r && r.name || r));
		}
	}
	function Rt(e, r, t) {
		for (var n = 0, a = ""; t + n < e.length;) {
			var l = e[t + n];
			if (l === r) return [a, n];
			if (l === "\"") {
				var s = Rt(e, "\"", t + n + 1);
				a += s[0], n += 1 + s[1] + 1;
			} else a += l, n++;
		}
		return [a, n];
	}
	function ri(e, r) {
		for (var t = [], n = 0; n < e.length;) {
			var a = Bo(Rt(e, r, n), 2), l = a[0], s = a[1];
			n += s + r.length, t.push(l.trim());
		}
		return t;
	}
	var ti = function(r) {
		return r[0].map(function(t, n) {
			return r.map(function(a) {
				return a[n];
			});
		});
	};
	function ni(e) {
		for (var r = 0, t = Object.keys(e); r < t.length; r++) {
			var n = t[r], a = e[n];
			if (Me(a.type) === "object" && !Array.isArray(a.type)) throw new Error("When defining a nested schema, use a `schema` property instead of a `type` property");
			if (!a.schema && !a.column) throw new Error("\"column\" not defined for schema entry \"".concat(n, "\"."));
		}
	}
	function Ir(e) {
		return e == null;
	}
	function We(e) {
		"@babel/helpers - typeof";
		return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
			return typeof r;
		} : function(r) {
			return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
		}, We(e);
	}
	var oi = ["schema"];
	function qt(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var n = Object.getOwnPropertySymbols(e);
			r && (n = n.filter(function(a) {
				return Object.getOwnPropertyDescriptor(e, a).enumerable;
			})), t.push.apply(t, n);
		}
		return t;
	}
	function sr(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = arguments[r] != null ? arguments[r] : {};
			r % 2 ? qt(Object(t), !0).forEach(function(n) {
				ii(e, n, t[n]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : qt(Object(t)).forEach(function(n) {
				Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
			});
		}
		return e;
	}
	function ii(e, r, t) {
		return r = ai(r), r in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	function ai(e) {
		var r = ui(e, "string");
		return We(r) === "symbol" ? r : String(r);
	}
	function ui(e, r) {
		if (We(e) !== "object" || e === null) return e;
		var t = e[Symbol.toPrimitive];
		if (t !== void 0) {
			var n = t.call(e, r || "default");
			if (We(n) !== "object") return n;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (r === "string" ? String : Number)(e);
	}
	function si(e, r) {
		if (e == null) return {};
		var t = li(e, r), n, a;
		if (Object.getOwnPropertySymbols) {
			var l = Object.getOwnPropertySymbols(e);
			for (a = 0; a < l.length; a++) n = l[a], !(r.indexOf(n) >= 0) && Object.prototype.propertyIsEnumerable.call(e, n) && (t[n] = e[n]);
		}
		return t;
	}
	function li(e, r) {
		if (e == null) return {};
		var t = {}, n = Object.keys(e), a, l;
		for (l = 0; l < n.length; l++) a = n[l], !(r.indexOf(a) >= 0) && (t[a] = e[a]);
		return t;
	}
	function ci(e, r, t) {
		var n = t.schema, a = si(t, oi);
		if (a.map) throw new Error("`map` option was removed. Pass a `schema` option instead.");
		var l = Ao(e, r, sr(sr({}, a), {}, { properties: n || a.properties }));
		return n ? Qo(l.data, n, sr(sr({}, a), {}, { properties: l.properties })) : l;
	}
	function xr(e) {
		var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
		return dn(e).then(function(t) {
			return ci(t, Zt, r);
		});
	}
	function fi(e) {
		return xr(e, { getSheets: !0 }).then(function(r) {
			return r.map(function(t) {
				return t.name;
			});
		});
	}
	const Lt = 1e3, pi = 2e4, mi = 1e4;
	function Pt(e) {
		const r = [];
		let t = 0, n = e.length > Lt;
		for (const a of e.slice(0, Lt)) {
			if (t >= 2e4) {
				n = !0;
				break;
			}
			a.length > 100 && (n = !0);
			const l = a.slice(0, Math.min(100, pi - t)).map((s) => {
				const f = s instanceof Date ? s.toISOString() : s == null ? "" : typeof s == "object" ? JSON.stringify(s) : String(s);
				return f.length > 1e4 ? (n = !0, `${f.slice(0, mi)}…`) : f;
			});
			t += l.length, r.push(l);
		}
		return {
			rows: r,
			truncated: n
		};
	}
	const hi = {
		maxEntries: 1e4,
		maxEntryUncompressedBytes: 64 * 1024 * 1024,
		maxTotalUncompressedBytes: 128 * 1024 * 1024
	}, vi = 101010256, gi = 33639248, Rr = 22, di = 65535;
	function me(e) {
		return /* @__PURE__ */ new Error(`Office archive is not safe to preview: ${e}`);
	}
	function yi(e) {
		const r = e.byteLength - Rr, t = Math.max(0, r - di);
		for (let n = r; n >= t; n -= 1) if (e.getUint32(n, !0) === vi) return n;
		throw me("ZIP directory is missing");
	}
	function bi(e, r = hi) {
		if (e.byteLength < Rr) throw me("file is truncated");
		const t = new DataView(e), n = yi(t), a = t.getUint16(n + 4, !0), l = t.getUint16(n + 6, !0), s = t.getUint16(n + 8, !0), f = t.getUint16(n + 10, !0), m = t.getUint32(n + 12, !0), d = t.getUint32(n + 16, !0), w = t.getUint16(n + 20, !0);
		if (n + Rr + w > t.byteLength) throw me("ZIP comment is truncated");
		if (a !== 0 || l !== 0 || s !== f) throw me("multi-disk ZIP files are unsupported");
		if (f === 65535 || m === 4294967295 || d === 4294967295) throw me("ZIP64 files are unsupported");
		if (f > r.maxEntries) throw me("too many archive entries");
		if (d + m > n) throw me("ZIP directory is invalid");
		let h = d, T = 0;
		for (let C = 0; C < f; C += 1) {
			if (h + 46 > n || t.getUint32(h, !0) !== gi) throw me("ZIP entry metadata is invalid");
			const $ = t.getUint32(h + 24, !0);
			if ($ === 4294967295) throw me("ZIP64 entries are unsupported");
			if ($ > r.maxEntryUncompressedBytes) throw me("an archive entry is too large");
			if (T += $, T > r.maxTotalUncompressedBytes) throw me("expanded archive is too large");
			const H = t.getUint16(h + 28, !0), j = t.getUint16(h + 30, !0), v = t.getUint16(h + 32, !0);
			h += 46 + H + j + v;
		}
		if (h > d + m) throw me("ZIP directory size is invalid");
	}
	let Ze = null, qr = [];
	self.onmessage = async (e) => {
		try {
			if (e.data.type === "open") {
				if (!e.data.data) throw new Error("Workbook data is missing");
				bi(e.data.data), Ze = new Blob([e.data.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), qr = await fi(Ze);
				const t = qr.slice(0, 50);
				if (!t.length) throw new Error("Workbook does not contain worksheets");
				const n = await xr(Ze, { sheet: t[0] });
				self.postMessage({
					type: "loaded",
					sheetNames: t,
					activeSheet: t[0],
					...Pt(n)
				});
				return;
			}
			if (!Ze || !e.data.sheet || !qr.includes(e.data.sheet)) throw new Error("Workbook is not loaded");
			const r = await xr(Ze, { sheet: e.data.sheet });
			self.postMessage({
				type: "sheet",
				activeSheet: e.data.sheet,
				...Pt(r)
			});
		} catch (r) {
			self.postMessage({
				type: "error",
				error: r instanceof Error ? r.message : String(r)
			});
		}
	};
})();
