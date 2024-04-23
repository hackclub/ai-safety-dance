(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.HTMLDOMParser = factory());
})(this, (function () { 'use strict';

    // constants
    var HTML = 'html';
    var HEAD = 'head';
    var BODY = 'body';
    var FIRST_TAG_REGEX = /<([a-zA-Z]+[0-9]?)/; // e.g., <h1>
    // match-all-characters in case of newlines (DOTALL)
    var HEAD_TAG_REGEX = /<head[^]*>/i;
    var BODY_TAG_REGEX = /<body[^]*>/i;
    // falls back to `parseFromString` if `createHTMLDocument` cannot be used
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var parseFromDocument = function (html, tagName) {
        /* istanbul ignore next */
        throw new Error('This browser does not support `document.implementation.createHTMLDocument`');
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var parseFromString = function (html, tagName) {
        /* istanbul ignore next */
        throw new Error('This browser does not support `DOMParser.prototype.parseFromString`');
    };
    var DOMParser = typeof window === 'object' && window.DOMParser;
    /**
     * DOMParser (performance: slow).
     *
     * @see https://developer.mozilla.org/docs/Web/API/DOMParser#Parsing_an_SVG_or_HTML_document
     */
    if (typeof DOMParser === 'function') {
        var domParser_1 = new DOMParser();
        var mimeType_1 = 'text/html';
        /**
         * Creates an HTML document using `DOMParser.parseFromString`.
         *
         * @param html - The HTML string.
         * @param tagName - The element to render the HTML (with 'body' as fallback).
         * @returns - Document.
         */
        parseFromString = function (html, tagName) {
            if (tagName) {
                /* istanbul ignore next */
                html = "<".concat(tagName, ">").concat(html, "</").concat(tagName, ">");
            }
            return domParser_1.parseFromString(html, mimeType_1);
        };
        parseFromDocument = parseFromString;
    }
    /**
     * DOMImplementation (performance: fair).
     *
     * @see https://developer.mozilla.org/docs/Web/API/DOMImplementation/createHTMLDocument
     */
    if (typeof document === 'object' && document.implementation) {
        var htmlDocument_1 = document.implementation.createHTMLDocument();
        /**
         * Use HTML document created by `document.implementation.createHTMLDocument`.
         *
         * @param html - The HTML string.
         * @param tagName - The element to render the HTML (with 'body' as fallback).
         * @returns - Document
         */
        parseFromDocument = function (html, tagName) {
            if (tagName) {
                var element = htmlDocument_1.documentElement.querySelector(tagName);
                if (element) {
                    element.innerHTML = html;
                }
                return htmlDocument_1;
            }
            htmlDocument_1.documentElement.innerHTML = html;
            return htmlDocument_1;
        };
    }
    /**
     * Template (performance: fast).
     *
     * @see https://developer.mozilla.org/docs/Web/HTML/Element/template
     */
    var template = typeof document === 'object' && document.createElement('template');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var parseFromTemplate;
    if (template && template.content) {
        /**
         * Uses a template element (content fragment) to parse HTML.
         *
         * @param html - HTML string.
         * @returns - Nodes.
         */
        parseFromTemplate = function (html) {
            template.innerHTML = html;
            return template.content.childNodes;
        };
    }
    /**
     * Parses HTML string to DOM nodes.
     *
     * @param html - HTML markup.
     * @returns - DOM nodes.
     */
    function domparser(html) {
        var _a, _b;
        var match = html.match(FIRST_TAG_REGEX);
        var firstTagName = match && match[1] ? match[1].toLowerCase() : '';
        switch (firstTagName) {
            case HTML: {
                var doc = parseFromString(html);
                // the created document may come with filler head/body elements,
                // so make sure to remove them if they don't actually exist
                if (!HEAD_TAG_REGEX.test(html)) {
                    var element = doc.querySelector(HEAD);
                    (_a = element === null || element === void 0 ? void 0 : element.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(element);
                }
                if (!BODY_TAG_REGEX.test(html)) {
                    var element = doc.querySelector(BODY);
                    (_b = element === null || element === void 0 ? void 0 : element.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(element);
                }
                return doc.querySelectorAll(HTML);
            }
            case HEAD:
            case BODY: {
                var elements = parseFromDocument(html).querySelectorAll(firstTagName);
                // if there's a sibling element, then return both elements
                if (BODY_TAG_REGEX.test(html) && HEAD_TAG_REGEX.test(html)) {
                    return elements[0].parentNode.childNodes;
                }
                return elements;
            }
            // low-level tag or text
            default: {
                if (parseFromTemplate) {
                    return parseFromTemplate(html);
                }
                var element = parseFromDocument(html, BODY).querySelector(BODY);
                return element.childNodes;
            }
        }
    }

    /** Types of elements found in htmlparser2's DOM */
    var ElementType;
    (function (ElementType) {
        /** Type for the root element of a document */
        ElementType["Root"] = "root";
        /** Type for Text */
        ElementType["Text"] = "text";
        /** Type for <? ... ?> */
        ElementType["Directive"] = "directive";
        /** Type for <!-- ... --> */
        ElementType["Comment"] = "comment";
        /** Type for <script> tags */
        ElementType["Script"] = "script";
        /** Type for <style> tags */
        ElementType["Style"] = "style";
        /** Type for Any tag */
        ElementType["Tag"] = "tag";
        /** Type for <![CDATA[ ... ]]> */
        ElementType["CDATA"] = "cdata";
        /** Type for <!doctype ...> */
        ElementType["Doctype"] = "doctype";
    })(ElementType || (ElementType = {}));
    /**
     * Tests whether an element is a tag or not.
     *
     * @param elem Element to test
     */
    function isTag$1(elem) {
        return (elem.type === ElementType.Tag ||
            elem.type === ElementType.Script ||
            elem.type === ElementType.Style);
    }
    // Exports for backwards compatibility
    /** Type for the root element of a document */
    ElementType.Root;
    /** Type for Text */
    ElementType.Text;
    /** Type for <? ... ?> */
    ElementType.Directive;
    /** Type for <!-- ... --> */
    ElementType.Comment;
    /** Type for <script> tags */
    ElementType.Script;
    /** Type for <style> tags */
    ElementType.Style;
    /** Type for Any tag */
    ElementType.Tag;
    /** Type for <![CDATA[ ... ]]> */
    ElementType.CDATA;
    /** Type for <!doctype ...> */
    ElementType.Doctype;

    /**
     * This object will be used as the prototype for Nodes when creating a
     * DOM-Level-1-compliant structure.
     */
    class Node {
        constructor() {
            /** Parent of the node */
            this.parent = null;
            /** Previous sibling */
            this.prev = null;
            /** Next sibling */
            this.next = null;
            /** The start index of the node. Requires `withStartIndices` on the handler to be `true. */
            this.startIndex = null;
            /** The end index of the node. Requires `withEndIndices` on the handler to be `true. */
            this.endIndex = null;
        }
        // Read-write aliases for properties
        /**
         * Same as {@link parent}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */
        get parentNode() {
            return this.parent;
        }
        set parentNode(parent) {
            this.parent = parent;
        }
        /**
         * Same as {@link prev}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */
        get previousSibling() {
            return this.prev;
        }
        set previousSibling(prev) {
            this.prev = prev;
        }
        /**
         * Same as {@link next}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */
        get nextSibling() {
            return this.next;
        }
        set nextSibling(next) {
            this.next = next;
        }
        /**
         * Clone this node, and optionally its children.
         *
         * @param recursive Clone child nodes as well.
         * @returns A clone of the node.
         */
        cloneNode(recursive = false) {
            return cloneNode(this, recursive);
        }
    }
    /**
     * A node that contains some data.
     */
    class DataNode extends Node {
        /**
         * @param data The content of the data node
         */
        constructor(data) {
            super();
            this.data = data;
        }
        /**
         * Same as {@link data}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */
        get nodeValue() {
            return this.data;
        }
        set nodeValue(data) {
            this.data = data;
        }
    }
    /**
     * Text within the document.
     */
    class Text extends DataNode {
        constructor() {
            super(...arguments);
            this.type = ElementType.Text;
        }
        get nodeType() {
            return 3;
        }
    }
    /**
     * Comments within the document.
     */
    class Comment extends DataNode {
        constructor() {
            super(...arguments);
            this.type = ElementType.Comment;
        }
        get nodeType() {
            return 8;
        }
    }
    /**
     * Processing instructions, including doc types.
     */
    class ProcessingInstruction extends DataNode {
        constructor(name, data) {
            super(data);
            this.name = name;
            this.type = ElementType.Directive;
        }
        get nodeType() {
            return 1;
        }
    }
    /**
     * A `Node` that can have children.
     */
    class NodeWithChildren extends Node {
        /**
         * @param children Children of the node. Only certain node types can have children.
         */
        constructor(children) {
            super();
            this.children = children;
        }
        // Aliases
        /** First child of the node. */
        get firstChild() {
            var _a;
            return (_a = this.children[0]) !== null && _a !== void 0 ? _a : null;
        }
        /** Last child of the node. */
        get lastChild() {
            return this.children.length > 0
                ? this.children[this.children.length - 1]
                : null;
        }
        /**
         * Same as {@link children}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */
        get childNodes() {
            return this.children;
        }
        set childNodes(children) {
            this.children = children;
        }
    }
    class CDATA extends NodeWithChildren {
        constructor() {
            super(...arguments);
            this.type = ElementType.CDATA;
        }
        get nodeType() {
            return 4;
        }
    }
    /**
     * The root node of the document.
     */
    class Document extends NodeWithChildren {
        constructor() {
            super(...arguments);
            this.type = ElementType.Root;
        }
        get nodeType() {
            return 9;
        }
    }
    /**
     * An element within the DOM.
     */
    class Element extends NodeWithChildren {
        /**
         * @param name Name of the tag, eg. `div`, `span`.
         * @param attribs Object mapping attribute names to attribute values.
         * @param children Children of the node.
         */
        constructor(name, attribs, children = [], type = name === "script"
            ? ElementType.Script
            : name === "style"
                ? ElementType.Style
                : ElementType.Tag) {
            super(children);
            this.name = name;
            this.attribs = attribs;
            this.type = type;
        }
        get nodeType() {
            return 1;
        }
        // DOM Level 1 aliases
        /**
         * Same as {@link name}.
         * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
         */
        get tagName() {
            return this.name;
        }
        set tagName(name) {
            this.name = name;
        }
        get attributes() {
            return Object.keys(this.attribs).map((name) => {
                var _a, _b;
                return ({
                    name,
                    value: this.attribs[name],
                    namespace: (_a = this["x-attribsNamespace"]) === null || _a === void 0 ? void 0 : _a[name],
                    prefix: (_b = this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name],
                });
            });
        }
    }
    /**
     * @param node Node to check.
     * @returns `true` if the node is a `Element`, `false` otherwise.
     */
    function isTag(node) {
        return isTag$1(node);
    }
    /**
     * @param node Node to check.
     * @returns `true` if the node has the type `CDATA`, `false` otherwise.
     */
    function isCDATA(node) {
        return node.type === ElementType.CDATA;
    }
    /**
     * @param node Node to check.
     * @returns `true` if the node has the type `Text`, `false` otherwise.
     */
    function isText(node) {
        return node.type === ElementType.Text;
    }
    /**
     * @param node Node to check.
     * @returns `true` if the node has the type `Comment`, `false` otherwise.
     */
    function isComment(node) {
        return node.type === ElementType.Comment;
    }
    /**
     * @param node Node to check.
     * @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
     */
    function isDirective(node) {
        return node.type === ElementType.Directive;
    }
    /**
     * @param node Node to check.
     * @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
     */
    function isDocument(node) {
        return node.type === ElementType.Root;
    }
    /**
     * Clone a node, and optionally its children.
     *
     * @param recursive Clone child nodes as well.
     * @returns A clone of the node.
     */
    function cloneNode(node, recursive = false) {
        let result;
        if (isText(node)) {
            result = new Text(node.data);
        }
        else if (isComment(node)) {
            result = new Comment(node.data);
        }
        else if (isTag(node)) {
            const children = recursive ? cloneChildren(node.children) : [];
            const clone = new Element(node.name, { ...node.attribs }, children);
            children.forEach((child) => (child.parent = clone));
            if (node.namespace != null) {
                clone.namespace = node.namespace;
            }
            if (node["x-attribsNamespace"]) {
                clone["x-attribsNamespace"] = { ...node["x-attribsNamespace"] };
            }
            if (node["x-attribsPrefix"]) {
                clone["x-attribsPrefix"] = { ...node["x-attribsPrefix"] };
            }
            result = clone;
        }
        else if (isCDATA(node)) {
            const children = recursive ? cloneChildren(node.children) : [];
            const clone = new CDATA(children);
            children.forEach((child) => (child.parent = clone));
            result = clone;
        }
        else if (isDocument(node)) {
            const children = recursive ? cloneChildren(node.children) : [];
            const clone = new Document(children);
            children.forEach((child) => (child.parent = clone));
            if (node["x-mode"]) {
                clone["x-mode"] = node["x-mode"];
            }
            result = clone;
        }
        else if (isDirective(node)) {
            const instruction = new ProcessingInstruction(node.name, node.data);
            if (node["x-name"] != null) {
                instruction["x-name"] = node["x-name"];
                instruction["x-publicId"] = node["x-publicId"];
                instruction["x-systemId"] = node["x-systemId"];
            }
            result = instruction;
        }
        else {
            throw new Error(`Not implemented yet: ${node.type}`);
        }
        result.startIndex = node.startIndex;
        result.endIndex = node.endIndex;
        if (node.sourceCodeLocation != null) {
            result.sourceCodeLocation = node.sourceCodeLocation;
        }
        return result;
    }
    function cloneChildren(childs) {
        const children = childs.map((child) => cloneNode(child, true));
        for (let i = 1; i < children.length; i++) {
            children[i].prev = children[i - 1];
            children[i - 1].next = children[i];
        }
        return children;
    }

    /**
     * SVG elements are case-sensitive.
     *
     * @see https://developer.mozilla.org/docs/Web/SVG/Element#svg_elements_a_to_z
     */
    var CASE_SENSITIVE_TAG_NAMES = [
        'animateMotion',
        'animateTransform',
        'clipPath',
        'feBlend',
        'feColorMatrix',
        'feComponentTransfer',
        'feComposite',
        'feConvolveMatrix',
        'feDiffuseLighting',
        'feDisplacementMap',
        'feDropShadow',
        'feFlood',
        'feFuncA',
        'feFuncB',
        'feFuncG',
        'feFuncR',
        'feGaussianBlur',
        'feImage',
        'feMerge',
        'feMergeNode',
        'feMorphology',
        'feOffset',
        'fePointLight',
        'feSpecularLighting',
        'feSpotLight',
        'feTile',
        'feTurbulence',
        'foreignObject',
        'linearGradient',
        'radialGradient',
        'textPath',
    ];
    var CASE_SENSITIVE_TAG_NAMES_MAP = CASE_SENSITIVE_TAG_NAMES.reduce(function (accumulator, tagName) {
        accumulator[tagName.toLowerCase()] = tagName;
        return accumulator;
    }, {});

    /**
     * Gets case-sensitive tag name.
     *
     * @param tagName - Tag name in lowercase.
     * @returns - Case-sensitive tag name.
     */
    function getCaseSensitiveTagName(tagName) {
        return CASE_SENSITIVE_TAG_NAMES_MAP[tagName];
    }
    /**
     * Formats DOM attributes to a hash map.
     *
     * @param attributes - List of attributes.
     * @returns - Map of attribute name to value.
     */
    function formatAttributes(attributes) {
        var map = {};
        var index = 0;
        var attributesLength = attributes.length;
        // `NamedNodeMap` is array-like
        for (; index < attributesLength; index++) {
            var attribute = attributes[index];
            map[attribute.name] = attribute.value;
        }
        return map;
    }
    /**
     * Corrects the tag name if it is case-sensitive (SVG).
     * Otherwise, returns the lowercase tag name (HTML).
     *
     * @param tagName - Lowercase tag name.
     * @returns - Formatted tag name.
     */
    function formatTagName(tagName) {
        tagName = tagName.toLowerCase();
        var caseSensitiveTagName = getCaseSensitiveTagName(tagName);
        if (caseSensitiveTagName) {
            return caseSensitiveTagName;
        }
        return tagName;
    }
    /**
     * Transforms DOM nodes to `domhandler` nodes.
     *
     * @param nodes - DOM nodes.
     * @param parent - Parent node.
     * @param directive - Directive.
     * @returns - Nodes.
     */
    function formatDOM(nodes, parent, directive) {
        if (parent === void 0) { parent = null; }
        var domNodes = [];
        var current;
        var index = 0;
        var nodesLength = nodes.length;
        for (; index < nodesLength; index++) {
            var node = nodes[index];
            // set the node data given the type
            switch (node.nodeType) {
                case 1: {
                    var tagName = formatTagName(node.nodeName);
                    // script, style, or tag
                    current = new Element(tagName, formatAttributes(node.attributes));
                    current.children = formatDOM(
                    // template children are on content
                    tagName === 'template'
                        ? node.content.childNodes
                        : node.childNodes, current);
                    break;
                }
                case 3:
                    current = new Text(node.nodeValue);
                    break;
                case 8:
                    current = new Comment(node.nodeValue);
                    break;
                default:
                    continue;
            }
            // set previous node next
            var prev = domNodes[index - 1] || null;
            if (prev) {
                prev.next = current;
            }
            // set properties for current node
            current.parent = parent;
            current.prev = prev;
            current.next = null;
            domNodes.push(current);
        }
        if (directive) {
            current = new ProcessingInstruction(directive.substring(0, directive.indexOf(' ')).toLowerCase(), directive);
            current.next = domNodes[0] || null;
            current.parent = parent;
            domNodes.unshift(current);
            if (domNodes[1]) {
                domNodes[1].prev = domNodes[0];
            }
        }
        return domNodes;
    }

    var DIRECTIVE_REGEX = /<(![a-zA-Z\s]+)>/; // e.g., <!doctype html>
    /**
     * Parses HTML string to DOM nodes in browser.
     *
     * @param html - HTML markup.
     * @returns - DOM elements.
     */
    function HTMLDOMParser(html) {
        if (typeof html !== 'string') {
            throw new TypeError('First argument must be a string');
        }
        if (!html) {
            return [];
        }
        // match directive
        var match = html.match(DIRECTIVE_REGEX);
        var directive = match ? match[1] : undefined;
        return formatDOM(domparser(html), null, directive);
    }

    return HTMLDOMParser;

}));
//# sourceMappingURL=html-dom-parser.js.map
