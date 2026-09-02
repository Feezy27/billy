var QRFacture = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // qr-entree.js
  var qr_entree_exports = {};
  __export(qr_entree_exports, {
    SwissQRBill: () => SwissQRBill
  });

  // node_modules/svg-engine/lib/browser/esm/browser/utils/createElement.js
  function createElement(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  // node_modules/svg-engine/lib/browser/esm/shared/utils/functions.js
  function convertNamedNodeMapToObject(atts) {
    const obj = {};
    for (const key of Object.keys(atts)) {
      obj[atts[key].name] = atts[key];
    }
    return obj;
  }

  // node_modules/svg-engine/lib/browser/esm/browser/instance/SVGInstance.js
  var SVGInstance = class {
    constructor(tagName, _parent) {
      this.childInstances = [];
      this.element = createElement(tagName);
      this._parent = _parent;
    }
    get parent() {
      return this._parent;
    }
    get root() {
      let parent = this._parent;
      while ((parent === null || parent === void 0 ? void 0 : parent.parent) !== void 0) {
        parent = parent.parent;
      }
      return parent;
    }
    appendInstance(instance) {
      this.childInstances.push(instance);
      this.element.appendChild(instance.element);
      return this;
    }
    id(id) {
      if (typeof id === "string") {
        this.element.id = id;
        return this;
      }
      return this.element.id;
    }
    get innerHTML() {
      return this.element.innerHTML;
    }
    get outerHTML() {
      return this.element.outerHTML;
    }
    empty() {
      this.childInstances = [];
      this.element.innerHTML = "";
      return this;
    }
    addClass(classNameOrClassNames) {
      if (typeof classNameOrClassNames === "string") {
        this.element.classList.add(classNameOrClassNames);
      } else if (Array.isArray(classNameOrClassNames)) {
        this.element.classList.add(...classNameOrClassNames);
      }
      return this;
    }
    removeClass(classNameOrClassNames) {
      if (typeof classNameOrClassNames === "string") {
        this.element.classList.remove(classNameOrClassNames);
      } else if (Array.isArray(classNameOrClassNames)) {
        this.element.classList.remove(...classNameOrClassNames);
      }
      return this;
    }
    hasClass(className) {
      return this.element.classList.contains(className);
    }
    attr(attributeNameOrAttributeObjectOrUndefined, valueOrUndefined) {
      var _a;
      const attributes = Object.entries(convertNamedNodeMapToObject(this.element.attributes)).reduce((previous, [key, value]) => Object.assign(Object.assign({}, previous), { [key]: isNaN(+value.value) ? value.value : +value.value }), {});
      if (typeof attributeNameOrAttributeObjectOrUndefined === "undefined") {
        return attributes;
      } else if (typeof attributeNameOrAttributeObjectOrUndefined === "object") {
        if (Array.isArray(attributeNameOrAttributeObjectOrUndefined)) {
          return Object.fromEntries(Object.entries(attributes).filter(([key, value]) => attributeNameOrAttributeObjectOrUndefined.includes(key)));
        } else {
          Object.keys(attributeNameOrAttributeObjectOrUndefined).forEach((key) => {
            this.element.setAttribute(key, attributeNameOrAttributeObjectOrUndefined[key] + "");
          });
          return this;
        }
      } else if (typeof attributeNameOrAttributeObjectOrUndefined === "string") {
        if (typeof valueOrUndefined === "undefined") {
          return (_a = attributes[attributeNameOrAttributeObjectOrUndefined]) !== null && _a !== void 0 ? _a : null;
        } else {
          this.element.setAttribute(attributeNameOrAttributeObjectOrUndefined, valueOrUndefined + "");
          return this;
        }
      }
      return null;
    }
    removeAttr(attributeName) {
      this.element.removeAttribute(attributeName);
      return this;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/index.js
  function applyMixins(derivedCtor, constructors) {
    constructors.forEach((baseCtor) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
        Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) || /* @__PURE__ */ Object.create(null));
      });
    });
  }

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/presentation-attributes/color.js
  var Color = class extends SVGInstance {
    color(color) {
      if (typeof color === "undefined") {
        const color2 = this.attr("color");
        return typeof color2 === "string" ? color2 : null;
      } else if (typeof color === "string") {
        this.attr("color", color);
        return this;
      }
      return null;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/presentation-attributes/display.js
  var Display = class extends SVGInstance {
    display(display) {
      if (typeof display === "undefined") {
        const display2 = this.attr("display");
        return typeof display2 === "string" ? display2 : null;
      } else if (typeof display === "string") {
        this.attr("display", display);
        return this;
      }
      return null;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/presentation-attributes/fill.js
  var Fill = class extends SVGInstance {
    fill(fill) {
      if (typeof fill === "undefined") {
        const fill2 = this.attr("fill");
        return typeof fill2 === "string" ? fill2 : null;
      } else if (typeof fill === "string") {
        this.attr("fill", fill);
        return this;
      }
      return null;
    }
    fillOpacity(fillOpacity) {
      if (typeof fillOpacity === "undefined") {
        const fillOpacity2 = this.attr("fill-opacity");
        return typeof fillOpacity2 === "number" ? fillOpacity2 : null;
      } else if (typeof fillOpacity === "number") {
        this.attr("fill-opacity", fillOpacity);
        return this;
      }
      return null;
    }
    fillRule(fillRule) {
      if (typeof fillRule === "undefined") {
        const fillRule2 = this.attr("fill-rule");
        return typeof fillRule2 === "string" ? fillRule2 : null;
      } else if (typeof fillRule === "string") {
        this.attr("fill-rule", fillRule);
        return this;
      }
      return null;
    }
    fillLinearGradient(gradient, rotation) {
      var _a, _b, _c;
      const defs = (_b = (_a = this.root) === null || _a === void 0 ? void 0 : _a.childInstances.find((instance) => instance.element.tagName === "defs")) !== null && _b !== void 0 ? _b : (_c = this.root) === null || _c === void 0 ? void 0 : _c.addDefs();
      const linearGradient = defs === null || defs === void 0 ? void 0 : defs.addLinearGradient();
      const id = defs.element.childNodes.length;
      linearGradient.attr("id", "gradient-" + id);
      if (typeof rotation === "number") {
        linearGradient.attr("gradientTransform", "rotate(" + rotation + ")");
      }
      for (const stop of gradient) {
        linearGradient.addStop(stop.position, stop.color);
      }
      this.attr("fill", "url(#gradient-" + id + ")");
      return this;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/presentation-attributes/opacity.js
  var Opacity = class extends SVGInstance {
    opacity(opacity) {
      if (typeof opacity === "undefined") {
        const opacity2 = this.attr("opacity");
        return typeof opacity2 === "number" ? opacity2 : null;
      } else if (typeof opacity === "number") {
        this.attr("opacity", opacity);
        return this;
      }
      return null;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/presentation-attributes/stroke.js
  var Stroke = class extends SVGInstance {
    stroke(width = 1, style = "solid", color = "currentColor") {
      this.strokeWidth(width);
      this.strokeColor(color);
      if (style === "dashed") {
        this.strokeDasharray(3);
      }
      return this;
    }
    strokeColor(color) {
      if (typeof color === "undefined") {
        const color2 = this.attr("stroke");
        return typeof color2 === "string" ? color2 : null;
      } else if (typeof color === "string") {
        this.attr("stroke", color);
        return this;
      }
      return null;
    }
    strokeLinearGradient(gradient, rotation) {
      var _a, _b, _c;
      const defs = (_b = (_a = this.root) === null || _a === void 0 ? void 0 : _a.childInstances.find((instance) => instance.element.tagName === "defs")) !== null && _b !== void 0 ? _b : (_c = this.root) === null || _c === void 0 ? void 0 : _c.addDefs();
      const linearGradient = defs === null || defs === void 0 ? void 0 : defs.addLinearGradient();
      const id = defs.element.childNodes.length;
      linearGradient.attr("id", "gradient-" + id);
      if (typeof rotation === "number") {
        linearGradient.attr("gradientTransform", "rotate(" + rotation + ")");
      }
      for (const stop of gradient) {
        linearGradient.addStop(stop.position, stop.color);
      }
      this.attr("stroke", "url(#gradient-" + id + ")");
      return this;
    }
    dash(dash = 3, color = "currentColor") {
      this.strokeDasharray(dash);
      this.strokeColor(color);
      return this;
    }
    strokeDasharray(dashGapArrayOrUndefined, gap) {
      if (typeof dashGapArrayOrUndefined === "undefined") {
        const dashGapString = this.attr("stroke-dasharray");
        if (typeof dashGapString === "number") {
          return dashGapString;
        } else if (typeof dashGapString === "string") {
          const dashGapArray = dashGapString.split(" ");
          if (dashGapArray.length === 1) {
            return isNaN(+dashGapArray[0]) ? dashGapArray[0] : +dashGapArray[0];
          } else {
            return dashGapArray.map((value) => isNaN(+value) ? value : +value);
          }
        }
      } else if (typeof dashGapArrayOrUndefined === "string" || typeof dashGapArrayOrUndefined === "number") {
        this.attr("stroke-dasharray", dashGapArrayOrUndefined);
        return this;
      } else if (Array.isArray(dashGapArrayOrUndefined)) {
        this.attr("stroke-dasharray", dashGapArrayOrUndefined.join(" "));
        return this;
      }
      return null;
    }
    strokeDashoffset(offset) {
      if (typeof offset === "string" || typeof offset === "number") {
        this.attr("stroke-dashoffset", offset);
        return this;
      }
      return this.attr("stroke-dashoffset");
    }
    strokeLinecap(cap) {
      if (typeof cap === "undefined") {
        const cap2 = this.attr("stroke-linecap");
        return typeof cap2 === "string" ? cap2 : null;
      } else if (typeof cap === "string") {
        this.attr("stroke-linecap", cap);
        return this;
      }
      return null;
    }
    strokeLinejoin(join) {
      if (typeof join === "undefined") {
        const join2 = this.attr("stroke-linejoin");
        return typeof join2 === "string" ? join2 : null;
      } else if (typeof join === "string") {
        this.attr("stroke-linejoin", join);
        return this;
      }
      return null;
    }
    strokeMiterlimit(limit) {
      if (typeof limit === "undefined") {
        const limit2 = this.attr("stroke-miterlimit");
        return typeof limit2 === "number" ? limit2 : null;
      } else if (typeof limit === "number") {
        this.attr("stroke-miterlimit", limit);
        return this;
      }
      return null;
    }
    strokeOpacity(opacity) {
      if (typeof opacity === "string" || typeof opacity === "number") {
        this.attr("stroke-opacity", opacity);
        return this;
      }
      return this.attr("stroke-opacity");
    }
    strokeWidth(width) {
      if (typeof width === "string" || typeof width === "number") {
        this.attr("stroke-width", width);
        return this;
      }
      return this.attr("stroke-width");
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/presentation-attributes/vectorEffect.js
  var VectorEffect = class extends SVGInstance {
    vectorEffect(vectorEffect) {
      if (typeof vectorEffect === "undefined") {
        const vectorEffect2 = this.attr("vector-effect");
        return typeof vectorEffect2 === "string" ? vectorEffect2 : null;
      } else if (typeof vectorEffect === "string") {
        this.attr("vector-effect", vectorEffect);
        return this;
      }
      return null;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/presentation-attributes/visibility.js
  var Visibility = class extends SVGInstance {
    visibility(visibility) {
      if (typeof visibility === "undefined") {
        const visibility2 = this.attr("visibility");
        return typeof visibility2 === "string" ? visibility2 : null;
      } else if (typeof visibility === "string") {
        this.attr("visibility", visibility);
        return this;
      }
      return null;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/attributes/xyPositioning.js
  var XYPositioning = class extends SVGInstance {
    moveTo(x, y) {
      this.attr("x", x);
      this.attr("y", y);
      return this;
    }
    moveBy(dx, dy) {
      var _a, _b;
      const x = (_a = this.attr("x")) !== null && _a !== void 0 ? _a : 0 + dx;
      const y = (_b = this.attr("y")) !== null && _b !== void 0 ? _b : 0 + dy;
      return this.moveTo(x, y);
    }
    x(x) {
      if (typeof x === "string" || typeof x === "number") {
        this.attr("x", x);
        return this;
      }
      return this.attr("x");
    }
    y(y) {
      if (typeof y === "string" || typeof y === "number") {
        this.attr("y", y);
        return this;
      }
      return this.attr("y");
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/attributes/widthHeight.js
  var WidthHeight = class extends SVGInstance {
    width(width) {
      if (typeof width === "string" || typeof width === "number") {
        this.attr("width", width + "");
        return this;
      }
      return this.attr("width");
    }
    height(height) {
      if (typeof height === "string" || typeof height === "number") {
        this.attr("height", height + "");
        return this;
      }
      return this.attr("height");
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGRectInstance.js
  var SVGRectInstance = class extends SVGInstance {
    constructor(_parent) {
      super("rect", _parent);
    }
    borderRadius(radius) {
      if (typeof radius === "string" || typeof radius === "number") {
        this.attr("rx", radius);
        this.attr("ry", radius);
        return this;
      }
      return this.attr("rx");
    }
  };
  applyMixins(SVGRectInstance, [
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility,
    XYPositioning,
    WidthHeight
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/attributes/cxcyPositioning.js
  var CXCYPositioning = class extends SVGInstance {
    cx(cx) {
      if (typeof cx === "string" || typeof cx === "number") {
        this.attr("cx", cx);
        return this;
      }
      return this.attr("cx");
    }
    cy(cy) {
      if (typeof cy === "string" || typeof cy === "number") {
        this.attr("cy", cy);
        return this;
      }
      return this.attr("cy");
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGCircleInstance.js
  var SVGCircleInstance = class extends SVGInstance {
    constructor(_parent) {
      super("circle", _parent);
    }
    radius(radius) {
      if (typeof radius === "string" || typeof radius === "number") {
        this.attr("r", radius);
        return this;
      }
      return this.attr("r");
    }
  };
  applyMixins(SVGCircleInstance, [
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility,
    CXCYPositioning
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGLineInstance.js
  var SVGLineInstance = class extends SVGInstance {
    constructor(_parent) {
      super("line", _parent);
    }
    x1(x1) {
      if (typeof x1 === "string" || typeof x1 === "number") {
        this.attr("x1", x1);
        return this;
      }
      return this.attr("x1");
    }
    y1(y1) {
      if (typeof y1 === "string" || typeof y1 === "number") {
        this.attr("y1", y1);
        return this;
      }
      return this.attr("y1");
    }
    x2(x2) {
      if (typeof x2 === "string" || typeof x2 === "number") {
        this.attr("x2", x2);
        return this;
      }
      return this.attr("x2");
    }
    y2(y2) {
      if (typeof y2 === "string" || typeof y2 === "number") {
        this.attr("y2", y2);
        return this;
      }
      return this.attr("y2");
    }
  };
  applyMixins(SVGLineInstance, [
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGPathInstance.js
  var SVGPathInstance = class extends SVGInstance {
    constructor(_parent) {
      super("path", _parent);
    }
    lineTo(x, y, relative = false) {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += relative === false ? " L " : " l ";
      d += ` ${x}, ${y} `;
      this.attr("d", d);
      return this;
    }
    moveTo(x, y, relative = false) {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += relative === false ? " M " : " m ";
      d += ` ${x}, ${y} `;
      this.attr("d", d);
      return this;
    }
    cubicBezierCurveTo(p1x, p1y, p2x, p2y, x, y, relative = false) {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += relative === false ? " C " : " c ";
      d += ` ${p1x} ${p1y}, ${p2x} ${p2y}, ${x} ${y} `;
      this.attr("d", d);
      return this;
    }
    smoothBezierCurveTo(x2, y2, x, y, relative = false) {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += relative === false ? " S " : " s ";
      d += ` ${x2}, ${y2} ${x}, ${y} `;
      this.attr("d", d);
      return this;
    }
    quadraticBezierCurveTo(p1x, p1y, x, y, relative = false) {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += relative === false ? " Q " : " q ";
      d += ` ${p1x} ${p1y}, ${x} ${y} `;
      this.attr("d", d);
      return this;
    }
    smoothQuadraticBezierCurveTo(x, y, relative = false) {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += relative === false ? " T " : " t ";
      d += ` ${x}, ${y} `;
      this.attr("d", d);
      return this;
    }
    ellipticalArcCurveTo(rx, ry, xRot, largeArc, sweep, x, y, relative = false) {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += relative === false ? " A " : " a ";
      d += ` ${rx}, ${ry} ${xRot} ${largeArc ? 1 : 0} ${sweep ? 1 : 0} ${x} ${y} `;
      this.attr("d", d);
      return this;
    }
    curveTo(x, y, x1, y1, relative = false) {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += relative === false ? " S " : " s ";
      d += ` ${x}, ${y} ${x1}, ${y1} `;
      this.attr("d", d);
      return this;
    }
    close() {
      var _a;
      let d = (_a = this.attr("d")) !== null && _a !== void 0 ? _a : "";
      d += " Z";
      this.attr("d", d);
      return this;
    }
  };
  applyMixins(SVGPathInstance, [
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/attributes/text.js
  var TextAttributes = class extends SVGInstance {
    text(text) {
      if (typeof text === "string") {
        this.element.innerHTML = text;
        return this;
      }
      return this.element.innerHTML;
    }
    textAlign(position) {
      var _a;
      if (position === "left") {
        return this.textAnchor("start");
      } else if (position === "center") {
        return this.textAnchor("middle");
      } else if (position === "right") {
        return this.textAnchor("end");
      } else {
        return (_a = this.textAnchor()) !== null && _a !== void 0 ? _a : "left";
      }
    }
    textAnchor(textAnchor) {
      if (typeof textAnchor === "undefined") {
        const textAnchor2 = this.attr("text-anchor");
        return typeof textAnchor2 === "string" ? textAnchor2 : null;
      } else if (typeof textAnchor === "string") {
        this.attr("text-anchor", textAnchor);
        return this;
      }
      return null;
    }
    dx(dx) {
      if (typeof dx === "string" || typeof dx === "number") {
        this.attr("dx", dx);
        return this;
      }
      return this.attr("dx");
    }
    dy(dy) {
      if (typeof dy === "string" || typeof dy === "number") {
        this.attr("dy", dy);
        return this;
      }
      return this.attr("dy");
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/style-attributes/font.js
  var Font = class extends SVGInstance {
    fontFamily(fontFamily) {
      if (typeof fontFamily === "undefined") {
        const fontFamily2 = this.attr("font-family");
        return typeof fontFamily2 === "string" ? fontFamily2 : null;
      } else if (typeof fontFamily === "string") {
        this.attr("font-family", fontFamily);
        return this;
      }
      return null;
    }
    fontSize(fontSize) {
      if (typeof fontSize === "string" || typeof fontSize === "number") {
        this.attr("font-size", fontSize);
        return this;
      }
      return this.attr("font-size");
    }
    fontStyle(fontStyle) {
      if (typeof fontStyle === "undefined") {
        const fontStyle2 = this.attr("font-style");
        return typeof fontStyle2 === "string" ? fontStyle2 : null;
      } else if (typeof fontStyle === "string") {
        this.attr("font-style", fontStyle);
        return this;
      }
      return null;
    }
    fontWeight(fontWeight) {
      if (typeof fontWeight === "string" || typeof fontWeight === "number") {
        this.attr("font-weight", fontWeight);
        return this;
      }
      return this.attr("font-weight");
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGTSpanInstance.js
  var SVGTSpanInstance = class _SVGTSpanInstance extends SVGInstance {
    constructor(_parent) {
      super("tspan", _parent);
    }
    addTSpan(xOrTextOrUndefined, yOrUndefined, textOrUndefined) {
      const text = new _SVGTSpanInstance(this);
      if (typeof xOrTextOrUndefined === "string" && typeof yOrUndefined === "undefined") {
        text.text(xOrTextOrUndefined);
      } else if ((typeof xOrTextOrUndefined === "string" || typeof xOrTextOrUndefined === "number") && (typeof yOrUndefined === "string" || typeof yOrUndefined === "number")) {
        text.attr("x", xOrTextOrUndefined);
        text.attr("y", yOrUndefined);
        if (typeof textOrUndefined === "string") {
          text.text(textOrUndefined);
        }
      }
      this.appendInstance(text);
      return text;
    }
  };
  applyMixins(SVGTSpanInstance, [
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility,
    XYPositioning,
    WidthHeight,
    TextAttributes,
    Font
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGTextInstance.js
  var SVGTextInstance = class extends SVGInstance {
    constructor(_parent) {
      super("text", _parent);
    }
    addTSpan(xOrTextOrUndefined, yOrUndefined, textOrUndefined) {
      const text = new SVGTSpanInstance(this);
      if (typeof xOrTextOrUndefined === "string" && typeof yOrUndefined === "undefined") {
        text.text(xOrTextOrUndefined);
      } else if ((typeof xOrTextOrUndefined === "string" || typeof xOrTextOrUndefined === "number") && (typeof yOrUndefined === "string" || typeof yOrUndefined === "number")) {
        text.attr("x", xOrTextOrUndefined);
        text.attr("y", yOrUndefined);
        if (typeof textOrUndefined === "string") {
          text.text(textOrUndefined);
        }
      }
      this.appendInstance(text);
      return text;
    }
  };
  applyMixins(SVGTextInstance, [
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility,
    XYPositioning,
    WidthHeight,
    TextAttributes,
    Font
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/permitted-content/shapeInstances.js
  var ShapeInstances = class extends SVGInstance {
    addRect(xOrUndefined, yOrUndefined, widthOrUndefined, heightOrUndefined) {
      const rect = new SVGRectInstance(this);
      if (xOrUndefined !== void 0) {
        rect.attr("x", xOrUndefined + "");
      }
      if (yOrUndefined !== void 0) {
        rect.attr("y", yOrUndefined + "");
      }
      if (widthOrUndefined !== void 0) {
        rect.attr("width", widthOrUndefined + "");
      }
      if (heightOrUndefined !== void 0) {
        rect.attr("height", heightOrUndefined + "");
      }
      this.appendInstance(rect);
      return rect;
    }
    addCircle(cxOrUndefined, cyOrUndefined, radiusOrUndefined) {
      const circle = new SVGCircleInstance(this);
      if (cxOrUndefined !== void 0) {
        circle.attr("cx", cxOrUndefined + "");
      }
      if (cyOrUndefined !== void 0) {
        circle.attr("cy", cyOrUndefined + "");
      }
      if (radiusOrUndefined !== void 0) {
        circle.attr("r", radiusOrUndefined + "");
      }
      this.appendInstance(circle);
      return circle;
    }
    addLine(x1OrUndefined, y1OrUndefined, x2OrUndefined, y2OrUndefined) {
      const line = new SVGLineInstance(this);
      if (x1OrUndefined !== void 0) {
        line.attr("x1", x1OrUndefined + "");
      }
      if (y1OrUndefined !== void 0) {
        line.attr("y1", y1OrUndefined + "");
      }
      if (x2OrUndefined !== void 0) {
        line.attr("x2", x2OrUndefined + "");
      }
      if (y2OrUndefined !== void 0) {
        line.attr("y2", y2OrUndefined + "");
      }
      this.appendInstance(line);
      return line;
    }
    addPath(dOrUndefined) {
      const path = new SVGPathInstance(this);
      if (dOrUndefined !== void 0) {
        path.attr("d", dOrUndefined + "");
      }
      this.appendInstance(path);
      return path;
    }
    addText(xOrTextOrUndefined, yOrUndefined, textOrUndefined) {
      const text = new SVGTextInstance(this);
      if (typeof xOrTextOrUndefined === "string" && typeof yOrUndefined === "undefined") {
        text.text(xOrTextOrUndefined);
      } else if ((typeof xOrTextOrUndefined === "string" || typeof xOrTextOrUndefined === "number") && (typeof yOrUndefined === "string" || typeof yOrUndefined === "number")) {
        text.attr("x", xOrTextOrUndefined);
        text.attr("y", yOrUndefined);
        if (typeof textOrUndefined === "string") {
          text.text(textOrUndefined);
        }
      }
      this.appendInstance(text);
      return text;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGGroupInstance.js
  var SVGGroupInstance = class _SVGGroupInstance extends SVGInstance {
    constructor(_parent) {
      super("g", _parent);
    }
    addGroup() {
      const group = new _SVGGroupInstance(this);
      this.appendInstance(group);
      return group;
    }
    addSVG(width, height) {
      if (typeof width !== "undefined" && typeof height !== "undefined") {
        const svg = new SVGSVGInstance(width, height);
        this.appendInstance(svg);
        return svg;
      } else {
        const svg = new SVGSVGInstance();
        this.appendInstance(svg);
        return svg;
      }
    }
  };
  applyMixins(SVGGroupInstance, [
    ShapeInstances,
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/permitted-content/structuralInstances.js
  var StructuralInstances = class extends SVGInstance {
    addGroup() {
      const group = new SVGGroupInstance(this);
      this.appendInstance(group);
      return group;
    }
    addSVG(width, height) {
      if (typeof width !== "undefined" && typeof height !== "undefined") {
        const svg = new SVGSVGInstance(width, height);
        this.appendInstance(svg);
        return svg;
      } else {
        const svg = new SVGSVGInstance();
        this.appendInstance(svg);
        return svg;
      }
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGStopInstance.js
  var SVGStopInstance = class extends SVGInstance {
    constructor(_parent) {
      super("stop", _parent);
    }
  };
  applyMixins(SVGStopInstance, [
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/permitted-content/gradientStopInstances.js
  var GradientStopInstances = class extends SVGInstance {
    addStop(position, color) {
      const stop = new SVGStopInstance(this);
      stop.attr("offset", position);
      stop.attr("stop-color", color);
      this.appendInstance(stop);
      return stop;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGLinearGradientInstance.js
  var SVGLinearGradientInstance = class extends SVGInstance {
    constructor(_parent) {
      super("linearGradient", _parent);
    }
  };
  applyMixins(SVGLinearGradientInstance, [
    GradientStopInstances,
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/permitted-content/gradientInstances.js
  var GradientInstances = class extends SVGInstance {
    addLinearGradient() {
      const linearGradient = new SVGLinearGradientInstance(this);
      this.appendInstance(linearGradient);
      return linearGradient;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGDefsInstance.js
  var SVGDefsInstance = class extends SVGInstance {
    constructor(_parent) {
      super("defs", _parent);
    }
  };
  applyMixins(SVGDefsInstance, [
    ShapeInstances,
    StructuralInstances,
    GradientInstances,
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/permitted-content/descriptiveInstances.js
  var DescriptiveInstances = class extends SVGInstance {
    addDefs() {
      const defs = new SVGDefsInstance(this);
      this.appendInstance(defs);
      return defs;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/mixins/attributes/preserveAspectRatio.js
  var PreserveAspectRatio = class extends SVGInstance {
    preserveAspectRatio(align, meetOrSlice) {
      if (typeof align === "undefined" && typeof meetOrSlice === "undefined") {
        const preserveAspectRatio = this.attr("preserveAspectRatio");
        if (typeof preserveAspectRatio === "string") {
          const [align2, meetOrSlice2] = preserveAspectRatio.split(" ");
          return { align: align2, meetOrSlice: meetOrSlice2 };
        }
      } else if (typeof align === "string" && typeof meetOrSlice === "string") {
        this.attr("preserveAspectRatio", `${align} ${meetOrSlice}`);
        return this;
      } else if (typeof align === "string" && typeof meetOrSlice === "undefined") {
        this.attr("preserveAspectRatio", align);
        return this;
      }
      return null;
    }
  };

  // node_modules/svg-engine/lib/browser/esm/shared/instances/SVGSVGInstance.js
  var SVGSVGInstance = class _SVGSVGInstance extends SVGInstance {
    constructor(widthOrParent, height, _parent) {
      super("svg");
      if (typeof widthOrParent === "string" || typeof widthOrParent === "number") {
        this.width(widthOrParent);
      }
      if (typeof height === "string" || typeof height === "number") {
        this.height(height);
      }
    }
    addGroup() {
      const group = new SVGGroupInstance(this);
      this.appendInstance(group);
      return group;
    }
    addSVG(width, height) {
      if (typeof width !== "undefined" && typeof height !== "undefined") {
        const svg = new _SVGSVGInstance(width, height);
        this.appendInstance(svg);
        return svg;
      } else {
        const svg = new _SVGSVGInstance();
        this.appendInstance(svg);
        return svg;
      }
    }
    viewBox(x, y, width, height) {
      if (typeof x === "undefined") {
        const viewBox = this.attr("viewBox");
        if (typeof viewBox === "string") {
          const [x2, y2, width2, height2] = viewBox.split(" ");
          return {
            x: isNaN(+x2) ? x2 : +x2,
            y: isNaN(+y2) ? y2 : +y2,
            width: isNaN(+width2) ? width2 : +width2,
            height: isNaN(+height2) ? height2 : +height2
          };
        }
        return null;
      } else if ((typeof x === "string" || typeof x === "number") && (typeof y === "string" || typeof y === "number") && (typeof width === "string" || typeof width === "number") && (typeof height === "string" || typeof height === "number")) {
        this.attr("viewBox", `${x} ${y} ${width} ${height}`);
        return this;
      }
      return null;
    }
  };
  applyMixins(SVGSVGInstance, [
    ShapeInstances,
    StructuralInstances,
    DescriptiveInstances,
    Color,
    Display,
    Fill,
    Opacity,
    Stroke,
    VectorEffect,
    Visibility,
    PreserveAspectRatio,
    XYPositioning,
    WidthHeight
  ]);

  // node_modules/svg-engine/lib/browser/esm/shared/exports/svg.js
  var SVG = class extends SVGSVGInstance {
    constructor() {
      super();
      this.attr("xmlns", "http://www.w3.org/2000/svg");
    }
  };

  // node_modules/swissqrbill/lib/esm/shared/cleaner.js
  function cleanData(data) {
    const _cleanObject = (object) => {
      return Object.fromEntries(
        Object.entries(object).map(([key, value]) => {
          if (typeof value === "object") {
            return [key, _cleanObject(value)];
          }
          if (typeof value === "string") {
            if (key === "account") {
              return [key, removeLineBreaks(removeSpaces(value))];
            }
            if (key === "reference") {
              return [key, removeLineBreaks(removeSpaces(value))];
            }
            if (key === "country") {
              return [key, removeLineBreaks(removeSpaces(value).toUpperCase())];
            }
            return [key, removeLineBreaks(value)];
          }
          return [key, value];
        })
      );
    };
    return _cleanObject(data);
  }
  function removeSpaces(text) {
    return text.replace(/ /g, "");
  }
  function removeLineBreaks(text) {
    return text.replace(/\n/g, "").replace(/\r/g, "");
  }

  // node_modules/swissqrbill/lib/esm/shared/translations.js
  var translations = {
    DE: {
      acceptancePoint: "Annahmestelle",
      account: "Konto / Zahlbar an",
      additionalInformation: "Zus\xE4tzliche Informationen",
      amount: "Betrag",
      currency: "W\xE4hrung",
      inFavourOf: "Zugunsten",
      payableBy: "Zahlbar durch",
      payableByName: "Zahlbar durch (Name/Adresse)",
      paymentPart: "Zahlteil",
      receipt: "Empfangsschein",
      reference: "Referenz",
      separate: "Vor der Einzahlung abzutrennen"
    },
    EN: {
      acceptancePoint: "Acceptance point",
      account: "Account / Payable to",
      additionalInformation: "Additional information",
      amount: "Amount",
      currency: "Currency",
      inFavourOf: "In favour of",
      payableBy: "Payable by",
      payableByName: "Payable by (name/address)",
      paymentPart: "Payment part",
      receipt: "Receipt",
      reference: "Reference",
      separate: "Separate before paying in"
    },
    FR: {
      acceptancePoint: "Point de d\xE9p\xF4t",
      account: "Compte / Payable \xE0",
      additionalInformation: "Informations suppl\xE9mentaires",
      amount: "Montant",
      currency: "Monnaie",
      inFavourOf: "En faveur de",
      payableBy: "Payable par",
      payableByName: "Payable par (nom/adresse)",
      paymentPart: "Section paiement",
      receipt: "R\xE9c\xE9piss\xE9",
      reference: "R\xE9f\xE9rence",
      separate: "A d\xE9tacher avant le versement"
    },
    IT: {
      acceptancePoint: "Punto di accettazione",
      account: "Conto / Pagabile a",
      additionalInformation: "Informazioni supplementari",
      amount: "Importo",
      currency: "Valuta",
      inFavourOf: "A favore di",
      payableBy: "Pagabile da",
      payableByName: "Pagabile da (nome/indirizzo)",
      paymentPart: "Sezione pagamento",
      receipt: "Ricevuta",
      reference: "Riferimento",
      separate: "Da staccare prima del versamento"
    },
    RM: {
      acceptancePoint: "Post da recepziun",
      account: "Conto / Da pajar a",
      additionalInformation: "Infurmaziuns supplementaras",
      amount: "Import",
      currency: "Valuta",
      inFavourOf: "A favur da",
      payableBy: "Da pajar da",
      payableByName: "Da pajar da (num/adressa)",
      paymentPart: "Part da pajament",
      receipt: "Quittanza",
      reference: "Referenza",
      separate: "Da distatgar avant che pajar"
    }
  };

  // node_modules/swissqrbill/lib/esm/shared/errors.js
  var ValidationError = class extends Error {
    /** @internal */
    constructor(message, params) {
      const messageWithParams = params ? resolveMessageParams(message, params) : message;
      super(messageWithParams);
      this.name = "ValidationError";
      this.code = getErrorCodeByMessage(message);
    }
  };
  function getErrorCodeByMessage(message) {
    const errorCodes = Object.keys(ValidationErrors);
    const errorCode = errorCodes.find((key) => ValidationErrors[key] === message);
    return errorCode;
  }
  function resolveMessageParams(message, params) {
    return Object.entries(params).reduce((message2, [key, value]) => {
      return message2.replace(`{${key}}`, value);
    }, message);
  }
  var ValidationErrors = /* @__PURE__ */ ((ValidationErrors2) => {
    ValidationErrors2["ACCOUNT_IS_QR_IBAN_BUT_REFERENCE_IS_MISSING"] = "If there is no reference, a conventional IBAN must be used.";
    ValidationErrors2["ACCOUNT_IS_QR_IBAN_BUT_REFERENCE_IS_REGULAR"] = "QR-IBAN requires the use of a QR-Reference.";
    ValidationErrors2["ACCOUNT_IS_REGULAR_IBAN_BUT_REFERENCE_IS_QR"] = "QR-Reference requires the use of a QR-IBAN.";
    ValidationErrors2["ACCOUNT_LENGTH_IS_INVALID"] = "The provided IBAN number '{iban}' is either too long or too short.";
    ValidationErrors2["ADDITIONAL_INFORMATION_LENGTH_IS_INVALID"] = "Additional information must be a maximum of 140 characters.";
    ValidationErrors2["ADDITIONAL_INFORMATION_TYPE_IS_INVALID"] = "Additional information must be a string.";
    ValidationErrors2["ALTERNATIVE_SCHEME_LENGTH_IS_INVALID"] = "{scheme} must be a maximum of 100 characters.";
    ValidationErrors2["ALTERNATIVE_SCHEME_TYPE_IS_INVALID"] = "{scheme} must be a string.";
    ValidationErrors2["AMOUNT_LENGTH_IS_INVALID"] = "Amount must be a maximum of 12 digits.";
    ValidationErrors2["AMOUNT_TYPE_IS_INVALID"] = "Amount must be a number.";
    ValidationErrors2["CREDITOR_ACCOUNT_COUNTRY_IS_INVALID"] = "Only CH and LI IBAN numbers are allowed.";
    ValidationErrors2["CREDITOR_ACCOUNT_IS_INVALID"] = "The provided IBAN number '{iban}' is not valid.";
    ValidationErrors2["CREDITOR_ACCOUNT_IS_UNDEFINED"] = "Creditor account cannot be undefined.";
    ValidationErrors2["CREDITOR_ADDRESS_IS_UNDEFINED"] = "Creditor address cannot be undefined.";
    ValidationErrors2["CREDITOR_ADDRESS_LENGTH_IS_INVALID"] = "Creditor address must be a maximum of 70 characters.";
    ValidationErrors2["CREDITOR_ADDRESS_TYPE_IS_INVALID"] = "Creditor address TYPE must be a string.";
    ValidationErrors2["CREDITOR_BUILDING_NUMBER_LENGTH_IS_INVALID"] = "Creditor buildingNumber must be a maximum of 16 characters.";
    ValidationErrors2["CREDITOR_BUILDING_NUMBER_TYPE_IS_INVALID"] = "Creditor buildingNumber must be either a string or a number.";
    ValidationErrors2["CREDITOR_CITY_IS_UNDEFINED"] = "Creditor city cannot be undefined.";
    ValidationErrors2["CREDITOR_CITY_LENGTH_IS_INVALID"] = "Creditor city must be a maximum of 35 characters.";
    ValidationErrors2["CREDITOR_CITY_TYPE_IS_INVALID"] = "Creditor city must be a string.";
    ValidationErrors2["CREDITOR_COUNTRY_IS_UNDEFINED"] = "Creditor country cannot be undefined.";
    ValidationErrors2["CREDITOR_COUNTRY_LENGTH_IS_INVALID"] = "Creditor country must be 2 characters.";
    ValidationErrors2["CREDITOR_COUNTRY_TYPE_IS_INVALID"] = "Creditor country must be a string.";
    ValidationErrors2["CREDITOR_IS_UNDEFINED"] = "Creditor cannot be undefined.";
    ValidationErrors2["CREDITOR_NAME_IS_UNDEFINED"] = "Creditor name cannot be undefined.";
    ValidationErrors2["CREDITOR_NAME_LENGTH_IS_INVALID"] = "Creditor name must be a maximum of 70 characters.";
    ValidationErrors2["CREDITOR_NAME_TYPE_IS_INVALID"] = "Creditor name must be a string.";
    ValidationErrors2["CREDITOR_ZIP_IS_UNDEFINED"] = "Creditor zip cannot be undefined.";
    ValidationErrors2["CREDITOR_ZIP_LENGTH_IS_INVALID"] = "Creditor zip must be a maximum of 16 characters.";
    ValidationErrors2["CREDITOR_ZIP_TYPE_IS_INVALID"] = "Creditor zip must be either a string or a number.";
    ValidationErrors2["CURRENCY_IS_UNDEFINED"] = "Currency cannot be undefined.";
    ValidationErrors2["CURRENCY_LENGTH_IS_INVALID"] = "Currency must be a length of 3 characters.";
    ValidationErrors2["CURRENCY_STRING_IS_INVALID"] = "Currency must be either 'CHF' or 'EUR'";
    ValidationErrors2["CURRENCY_TYPE_IS_INVALID"] = "Currency must be a string.";
    ValidationErrors2["DEBTOR_ADDRESS_IS_UNDEFINED"] = "Debtor address cannot be undefined.";
    ValidationErrors2["DEBTOR_ADDRESS_LENGTH_IS_INVALID"] = "Debtor address must be a maximum of 70 characters.";
    ValidationErrors2["DEBTOR_ADDRESS_TYPE_IS_INVALID"] = "Debtor address TYPE must be a string.";
    ValidationErrors2["DEBTOR_BUILDING_NUMBER_LENGTH_IS_INVALID"] = "Debtor buildingNumber must be a maximum of 16 characters.";
    ValidationErrors2["DEBTOR_BUILDING_NUMBER_TYPE_IS_INVALID"] = "Debtor buildingNumber must be either a string or a number.";
    ValidationErrors2["DEBTOR_CITY_IS_UNDEFINED"] = "Debtor city cannot be undefined.";
    ValidationErrors2["DEBTOR_CITY_LENGTH_IS_INVALID"] = "Debtor city must be a maximum of 35 characters.";
    ValidationErrors2["DEBTOR_CITY_TYPE_IS_INVALID"] = "Debtor city must be a string.";
    ValidationErrors2["DEBTOR_COUNTRY_IS_UNDEFINED"] = "Debtor country cannot be undefined.";
    ValidationErrors2["DEBTOR_COUNTRY_LENGTH_IS_INVALID"] = "Debtor country must be 2 characters.";
    ValidationErrors2["DEBTOR_COUNTRY_TYPE_IS_INVALID"] = "Debtor country must be a string.";
    ValidationErrors2["DEBTOR_IS_UNDEFINED"] = "Debtor cannot be undefined.";
    ValidationErrors2["DEBTOR_NAME_IS_UNDEFINED"] = "Debtor name cannot be undefined.";
    ValidationErrors2["DEBTOR_NAME_LENGTH_IS_INVALID"] = "Debtor name must be a maximum of 70 characters.";
    ValidationErrors2["DEBTOR_NAME_TYPE_IS_INVALID"] = "Debtor name must be a string.";
    ValidationErrors2["DEBTOR_ZIP_IS_UNDEFINED"] = "Debtor zip cannot be undefined.";
    ValidationErrors2["DEBTOR_ZIP_LENGTH_IS_INVALID"] = "Debtor zip must be a maximum of 16 characters.";
    ValidationErrors2["DEBTOR_ZIP_TYPE_IS_INVALID"] = "Debtor zip must be either a string or a number.";
    ValidationErrors2["MESSAGE_AND_ADDITIONAL_INFORMATION_LENGTH_IS_INVALID"] = "Message and additionalInformation combined must be a maximum of 140 characters.";
    ValidationErrors2["MESSAGE_LENGTH_IS_INVALID"] = "Message must be a maximum of 140 characters.";
    ValidationErrors2["MESSAGE_TYPE_IS_INVALID"] = "Message must be a string.";
    ValidationErrors2["QR_REFERENCE_IS_INVALID"] = "The provided QR-Reference '{reference}' is not valid.";
    ValidationErrors2["QR_REFERENCE_LENGTH_IS_INVALID"] = "QR-Reference must be a must be exactly 27 characters.";
    ValidationErrors2["REFERENCE_TYPE_IS_INVALID"] = "Reference must be a string.";
    ValidationErrors2["REGULAR_REFERENCE_LENGTH_IS_INVALID"] = "Creditor reference must be a maximum of 25 characters.";
    return ValidationErrors2;
  })(ValidationErrors || {});

  // node_modules/swissqrbill/lib/esm/shared/utils.js
  function isQRIBAN(iban) {
    iban = iban.replace(/ /g, "");
    const QRIID = iban.substring(4, 9);
    return +QRIID >= 3e4 && +QRIID <= 31999;
  }
  function isIBANValid(iban) {
    iban = iban.replace(/ /g, "").toUpperCase();
    iban = iban.substring(4) + iban.substring(0, 4);
    return mod97(iban) === 1;
  }
  function formatIBAN(iban) {
    var _a;
    const ibanArray = iban.replace(/ /g, "").match(/.{1,4}/g);
    return (_a = ibanArray == null ? void 0 : ibanArray.join(" ")) != null ? _a : iban;
  }
  function isQRReference(reference) {
    reference = reference.replace(/ /g, "");
    if (reference.length !== 27) {
      return false;
    }
    if (!/^\d+$/.test(reference)) {
      return false;
    }
    return true;
  }
  function isQRReferenceValid(reference) {
    reference = reference.replace(/ /g, "");
    if (!isQRReference(reference)) {
      return false;
    }
    const ref = reference.substring(0, 26);
    const checksum = reference.substring(26, 27);
    const calculatedChecksum = calculateQRReferenceChecksum(ref);
    return calculatedChecksum === checksum;
  }
  function calculateQRReferenceChecksum(reference) {
    return mod10(reference);
  }
  function formatQRReference(reference) {
    const trimmedReference = reference.replace(/ /g, "");
    const match = trimmedReference.substring(2).match(/.{1,5}/g);
    return match ? `${trimmedReference.substring(0, 2)} ${match.join(" ")}` : reference;
  }
  function formatSCORReference(reference) {
    var _a;
    const trimmedReference = reference.replace(/ /g, "");
    const match = trimmedReference.match(/.{1,4}/g);
    return (_a = match == null ? void 0 : match.join(" ")) != null ? _a : reference;
  }
  function formatReference(reference) {
    const referenceType = getReferenceType(reference);
    if (referenceType === "QRR") {
      return formatQRReference(reference);
    } else if (referenceType === "SCOR") {
      return formatSCORReference(reference);
    }
    return reference;
  }
  function formatAmount(amount) {
    const amountString = amount.toFixed(2);
    const amountArray = amountString.split(".");
    let formattedAmountWithoutDecimals = "";
    for (let x = amountArray[0].length - 1, i = 1; x >= 0; x--, i++) {
      formattedAmountWithoutDecimals = amountArray[0][x] + formattedAmountWithoutDecimals;
      if (i === 3) {
        formattedAmountWithoutDecimals = ` ${formattedAmountWithoutDecimals}`;
        i = 0;
      }
    }
    return `${formattedAmountWithoutDecimals.trim()}.${amountArray[1]}`;
  }
  function mm2pt(millimeters) {
    return millimeters * 2.83465;
  }
  function pt2mm(points) {
    return points / 2.83465;
  }
  function mm2px(millimeters) {
    return millimeters * 960 / 254;
  }
  function getReferenceType(reference) {
    if (typeof reference === "undefined") {
      return "NON";
    } else if (isQRReference(reference)) {
      return "QRR";
    } else {
      return "SCOR";
    }
  }
  function mod97(input) {
    const charCodeOfLetterA = "A".charCodeAt(0);
    const inputArr = input.split("");
    for (let i = 0; i < inputArr.length; i++) {
      const charCode = inputArr[i].charCodeAt(0);
      if (charCode >= charCodeOfLetterA) {
        inputArr[i] = `${charCode - charCodeOfLetterA + 10}`;
      }
    }
    input = inputArr.join("");
    let remainder = 0;
    for (let i = 0; i < input.length; i++) {
      const digit = +input[i];
      remainder = (10 * remainder + digit) % 97;
    }
    return remainder;
  }
  function mod10(input) {
    const trimmedInput = input.replace(/ /g, "");
    const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
    let carry = 0;
    for (let i = 0; i < trimmedInput.length; i++) {
      carry = table[(carry + parseInt(trimmedInput.substring(i, i + 1), 10)) % 10];
    }
    return ((10 - carry) % 10).toString();
  }

  // node_modules/swissqrbill/lib/esm/shared/validator.js
  function validateData(data) {
    if (data.reference !== void 0) {
      if (typeof data.reference !== "string") {
        throw new ValidationError(ValidationErrors.REFERENCE_TYPE_IS_INVALID);
      }
    }
    if (data.message !== void 0) {
      if (typeof data.message !== "string") {
        throw new ValidationError(ValidationErrors.MESSAGE_TYPE_IS_INVALID);
      }
      if (data.message.length > 140) {
        throw new ValidationError(ValidationErrors.MESSAGE_LENGTH_IS_INVALID);
      }
    }
    if (data.additionalInformation !== void 0) {
      if (typeof data.additionalInformation !== "string") {
        throw new ValidationError(ValidationErrors.ADDITIONAL_INFORMATION_TYPE_IS_INVALID);
      }
      if (data.additionalInformation.length > 140) {
        throw new ValidationError(ValidationErrors.ADDITIONAL_INFORMATION_LENGTH_IS_INVALID);
      }
    }
    if (data.message !== void 0 && data.additionalInformation !== void 0) {
      if (data.additionalInformation.length + data.message.length > 140) {
        throw new ValidationError(ValidationErrors.MESSAGE_AND_ADDITIONAL_INFORMATION_LENGTH_IS_INVALID);
      }
    }
    if (data.av1 !== void 0) {
      if (typeof data.av1 !== "string") {
        throw new ValidationError(ValidationErrors.ALTERNATIVE_SCHEME_TYPE_IS_INVALID, { scheme: "AV1" });
      }
      if (data.av1.length > 100) {
        throw new ValidationError(ValidationErrors.ALTERNATIVE_SCHEME_LENGTH_IS_INVALID, { scheme: "AV1" });
      }
    }
    if (data.av2 !== void 0) {
      if (typeof data.av2 !== "string") {
        throw new ValidationError(ValidationErrors.ALTERNATIVE_SCHEME_TYPE_IS_INVALID, { scheme: "AV2" });
      }
      if (data.av2.length > 100) {
        throw new ValidationError(ValidationErrors.ALTERNATIVE_SCHEME_LENGTH_IS_INVALID, { scheme: "AV2" });
      }
    }
    if (data.creditor === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_IS_UNDEFINED);
    }
    if (data.creditor.account === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_ACCOUNT_IS_UNDEFINED);
    }
    if (!data.creditor.account.startsWith("CH") && !data.creditor.account.startsWith("LI")) {
      throw new ValidationError(ValidationErrors.CREDITOR_ACCOUNT_COUNTRY_IS_INVALID);
    }
    if (data.creditor.account.length !== 21) {
      throw new ValidationError(ValidationErrors.ACCOUNT_LENGTH_IS_INVALID, { iban: data.creditor.account });
    }
    if (data.creditor.name === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_NAME_IS_UNDEFINED);
    }
    if (typeof data.creditor.name !== "string") {
      throw new ValidationError(ValidationErrors.CREDITOR_NAME_TYPE_IS_INVALID);
    }
    if (data.creditor.name.length > 70) {
      throw new ValidationError(ValidationErrors.CREDITOR_NAME_LENGTH_IS_INVALID);
    }
    if (data.creditor.address === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_ADDRESS_IS_UNDEFINED);
    }
    if (typeof data.creditor.address !== "string") {
      throw new ValidationError(ValidationErrors.CREDITOR_ADDRESS_TYPE_IS_INVALID);
    }
    if (data.creditor.address.length > 70) {
      throw new ValidationError(ValidationErrors.CREDITOR_ADDRESS_LENGTH_IS_INVALID);
    }
    if (data.creditor.buildingNumber !== void 0) {
      if (typeof data.creditor.buildingNumber !== "string" && typeof data.creditor.buildingNumber !== "number") {
        throw new ValidationError(ValidationErrors.CREDITOR_BUILDING_NUMBER_TYPE_IS_INVALID);
      }
      if (data.creditor.buildingNumber.toString().length > 16) {
        throw new ValidationError(ValidationErrors.CREDITOR_BUILDING_NUMBER_LENGTH_IS_INVALID);
      }
    }
    if (data.creditor.zip === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_ZIP_IS_UNDEFINED);
    }
    if (typeof data.creditor.zip !== "string" && typeof data.creditor.zip !== "number") {
      throw new ValidationError(ValidationErrors.CREDITOR_ZIP_TYPE_IS_INVALID);
    }
    if (data.creditor.zip.toString().length > 16) {
      throw new ValidationError(ValidationErrors.CREDITOR_ZIP_LENGTH_IS_INVALID);
    }
    if (data.creditor.city === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_CITY_IS_UNDEFINED);
    }
    if (typeof data.creditor.city !== "string") {
      throw new ValidationError(ValidationErrors.CREDITOR_CITY_TYPE_IS_INVALID);
    }
    if (data.creditor.city.length > 35) {
      throw new ValidationError(ValidationErrors.CREDITOR_CITY_LENGTH_IS_INVALID);
    }
    if (data.creditor.country === void 0) {
      throw new ValidationError(ValidationErrors.CREDITOR_COUNTRY_IS_UNDEFINED);
    }
    if (typeof data.creditor.country !== "string") {
      throw new ValidationError(ValidationErrors.CREDITOR_COUNTRY_TYPE_IS_INVALID);
    }
    if (data.creditor.country.length !== 2) {
      throw new ValidationError(ValidationErrors.CREDITOR_COUNTRY_LENGTH_IS_INVALID);
    }
    if (data.amount !== void 0) {
      if (typeof data.amount !== "number") {
        throw new ValidationError(ValidationErrors.AMOUNT_TYPE_IS_INVALID);
      }
      if (data.amount.toFixed(2).toString().length > 12) {
        throw new ValidationError(ValidationErrors.AMOUNT_LENGTH_IS_INVALID);
      }
    }
    if (data.currency === void 0) {
      throw new ValidationError(ValidationErrors.CURRENCY_IS_UNDEFINED);
    }
    if (typeof data.currency !== "string") {
      throw new ValidationError(ValidationErrors.CURRENCY_TYPE_IS_INVALID);
    }
    if (data.currency.length !== 3) {
      throw new ValidationError(ValidationErrors.CURRENCY_LENGTH_IS_INVALID);
    }
    if (data.currency !== "CHF" && data.currency !== "EUR") {
      throw new ValidationError(ValidationErrors.CURRENCY_STRING_IS_INVALID);
    }
    if (data.debtor !== void 0) {
      if (data.debtor.name === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_NAME_IS_UNDEFINED);
      }
      if (typeof data.debtor.name !== "string") {
        throw new ValidationError(ValidationErrors.DEBTOR_NAME_TYPE_IS_INVALID);
      }
      if (data.debtor.name.length > 70) {
        throw new ValidationError(ValidationErrors.DEBTOR_NAME_LENGTH_IS_INVALID);
      }
      if (data.debtor.address === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_ADDRESS_IS_UNDEFINED);
      }
      if (typeof data.debtor.address !== "string") {
        throw new ValidationError(ValidationErrors.DEBTOR_ADDRESS_TYPE_IS_INVALID);
      }
      if (data.debtor.address.length > 70) {
        throw new ValidationError(ValidationErrors.DEBTOR_ADDRESS_LENGTH_IS_INVALID);
      }
      if (data.debtor.buildingNumber !== void 0) {
        if (typeof data.debtor.buildingNumber !== "string" && typeof data.debtor.buildingNumber !== "number") {
          throw new ValidationError(ValidationErrors.DEBTOR_BUILDING_NUMBER_TYPE_IS_INVALID);
        }
        if (data.debtor.buildingNumber.toString().length > 16) {
          throw new ValidationError(ValidationErrors.DEBTOR_BUILDING_NUMBER_LENGTH_IS_INVALID);
        }
      }
      if (data.debtor.zip === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_ZIP_IS_UNDEFINED);
      }
      if (typeof data.debtor.zip !== "string" && typeof data.debtor.zip !== "number") {
        throw new ValidationError(ValidationErrors.DEBTOR_ZIP_TYPE_IS_INVALID);
      }
      if (data.debtor.zip.toString().length > 16) {
        throw new ValidationError(ValidationErrors.DEBTOR_ZIP_LENGTH_IS_INVALID);
      }
      if (data.debtor.city === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_CITY_IS_UNDEFINED);
      }
      if (typeof data.debtor.city !== "string") {
        throw new ValidationError(ValidationErrors.DEBTOR_CITY_TYPE_IS_INVALID);
      }
      if (data.debtor.city.length > 35) {
        throw new ValidationError(ValidationErrors.DEBTOR_CITY_LENGTH_IS_INVALID);
      }
      if (data.debtor.country === void 0) {
        throw new ValidationError(ValidationErrors.DEBTOR_COUNTRY_IS_UNDEFINED);
      }
      if (typeof data.debtor.country !== "string") {
        throw new ValidationError(ValidationErrors.DEBTOR_COUNTRY_TYPE_IS_INVALID);
      }
      if (data.debtor.country.length !== 2) {
        throw new ValidationError(ValidationErrors.DEBTOR_COUNTRY_LENGTH_IS_INVALID);
      }
    }
    if (isIBANValid(data.creditor.account) === false) {
      throw new ValidationError(ValidationErrors.CREDITOR_ACCOUNT_IS_INVALID, { iban: data.creditor.account });
    }
    if (isQRIBAN(data.creditor.account)) {
      if (data.reference === void 0) {
        throw new ValidationError(ValidationErrors.ACCOUNT_IS_QR_IBAN_BUT_REFERENCE_IS_MISSING);
      }
      if (data.reference.length !== 27) {
        throw new ValidationError(ValidationErrors.QR_REFERENCE_LENGTH_IS_INVALID);
      }
      if (isQRReference(data.reference)) {
        if (!isQRReferenceValid(data.reference)) {
          throw new ValidationError(ValidationErrors.QR_REFERENCE_IS_INVALID, { reference: data.reference });
        }
      } else {
        throw new ValidationError(ValidationErrors.ACCOUNT_IS_QR_IBAN_BUT_REFERENCE_IS_REGULAR);
      }
    } else {
      if (data.reference !== void 0) {
        if (isQRReference(data.reference)) {
          throw new ValidationError(ValidationErrors.ACCOUNT_IS_REGULAR_IBAN_BUT_REFERENCE_IS_QR);
        }
        if (data.reference.length > 25) {
          throw new ValidationError(ValidationErrors.REGULAR_REFERENCE_LENGTH_IS_INVALID);
        }
      }
    }
  }

  // node_modules/swissqrbill/lib/esm/shared/qr-code-generator.js
  var qrcodegen;
  ((qrcodegen2) => {
    const _QrCode = class _QrCode2 {
      /*-- Constructor (low level) and fields --*/
      // Creates a new QR Code with the given version number,
      // error correction level, data codeword bytes, and mask number.
      // This is a low-level API that most users should not use directly.
      // A mid-level API is the encodeSegments() function.
      constructor(version, errorCorrectionLevel, dataCodewords, msk) {
        this.version = version;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.modules = [];
        this.isFunction = [];
        if (version < _QrCode2.MIN_VERSION || version > _QrCode2.MAX_VERSION)
          throw "Version value out of range";
        if (msk < -1 || msk > 7)
          throw "Mask value out of range";
        this.size = version * 4 + 17;
        const row = [];
        for (let i = 0; i < this.size; i++)
          row.push(false);
        for (let i = 0; i < this.size; i++) {
          this.modules.push(row.slice());
          this.isFunction.push(row.slice());
        }
        this.drawFunctionPatterns();
        const allCodewords = this.addEccAndInterleave(dataCodewords);
        this.drawCodewords(allCodewords);
        if (msk == -1) {
          let minPenalty = 1e9;
          for (let i = 0; i < 8; i++) {
            this.applyMask(i);
            this.drawFormatBits(i);
            const penalty = this.getPenaltyScore();
            if (penalty < minPenalty) {
              msk = i;
              minPenalty = penalty;
            }
            this.applyMask(i);
          }
        }
        assert(0 <= msk && msk <= 7);
        this.mask = msk;
        this.applyMask(msk);
        this.drawFormatBits(msk);
        this.isFunction = [];
      }
      /*-- Static factory functions (high level) --*/
      // Returns a QR Code representing the given Unicode text string at the given error correction level.
      // As a conservative upper bound, this function is guaranteed to succeed for strings that have 738 or fewer
      // Unicode code points (not UTF-16 code units) if the low error correction level is used. The smallest possible
      // QR Code version is automatically chosen for the output. The ECC level of the result may be higher than the
      // ecl argument if it can be done without increasing the version.
      static encodeText(text, ecl) {
        const segs = qrcodegen2.QrSegment.makeSegments(text);
        return _QrCode2.encodeSegments(segs, ecl);
      }
      // Returns a QR Code representing the given binary data at the given error correction level.
      // This function always encodes using the binary segment mode, not any text mode. The maximum number of
      // bytes allowed is 2953. The smallest possible QR Code version is automatically chosen for the output.
      // The ECC level of the result may be higher than the ecl argument if it can be done without increasing the version.
      static encodeBinary(data, ecl) {
        const seg = qrcodegen2.QrSegment.makeBytes(data);
        return _QrCode2.encodeSegments([seg], ecl);
      }
      /*-- Static factory functions (mid level) --*/
      // Returns a QR Code representing the given segments with the given encoding parameters.
      // The smallest possible QR Code version within the given range is automatically
      // chosen for the output. Iff boostEcl is true, then the ECC level of the result
      // may be higher than the ecl argument if it can be done without increasing the
      // version. The mask number is either between 0 to 7 (inclusive) to force that
      // mask, or -1 to automatically choose an appropriate mask (which may be slow).
      // This function allows the user to create a custom sequence of segments that switches
      // between modes (such as alphanumeric and byte) to encode text in less space.
      // This is a mid-level API; the high-level API is encodeText() and encodeBinary().
      static encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
        if (!(_QrCode2.MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= _QrCode2.MAX_VERSION) || mask < -1 || mask > 7)
          throw "Invalid value";
        let version;
        let dataUsedBits;
        for (version = minVersion; ; version++) {
          const dataCapacityBits2 = _QrCode2.getNumDataCodewords(version, ecl) * 8;
          const usedBits = QrSegment.getTotalBits(segs, version);
          if (usedBits <= dataCapacityBits2) {
            dataUsedBits = usedBits;
            break;
          }
          if (version >= maxVersion)
            throw "Data too long";
        }
        for (const newEcl of [_QrCode2.Ecc.MEDIUM, _QrCode2.Ecc.QUARTILE, _QrCode2.Ecc.HIGH]) {
          if (boostEcl && dataUsedBits <= _QrCode2.getNumDataCodewords(version, newEcl) * 8)
            ecl = newEcl;
        }
        const bb = [];
        for (const seg of segs) {
          appendBits(seg.mode.modeBits, 4, bb);
          appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
          for (const b of seg.getData())
            bb.push(b);
        }
        assert(bb.length == dataUsedBits);
        const dataCapacityBits = _QrCode2.getNumDataCodewords(version, ecl) * 8;
        assert(bb.length <= dataCapacityBits);
        appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
        appendBits(0, (8 - bb.length % 8) % 8, bb);
        assert(bb.length % 8 == 0);
        for (let padByte = 236; bb.length < dataCapacityBits; padByte ^= 236 ^ 17)
          appendBits(padByte, 8, bb);
        const dataCodewords = [];
        while (dataCodewords.length * 8 < bb.length)
          dataCodewords.push(0);
        bb.forEach((b, i) => dataCodewords[i >>> 3] |= b << 7 - (i & 7));
        return new _QrCode2(version, ecl, dataCodewords, mask);
      }
      /*-- Accessor methods --*/
      // Returns the color of the module (pixel) at the given coordinates, which is false
      // for light or true for dark. The top left corner has the coordinates (x=0, y=0).
      // If the given coordinates are out of bounds, then false (light) is returned.
      getModule(x, y) {
        return 0 <= x && x < this.size && 0 <= y && y < this.size && this.modules[y][x];
      }
      /*-- Private helper methods for constructor: Drawing function modules --*/
      // Reads this object's version field, and draws and marks all function modules.
      drawFunctionPatterns() {
        for (let i = 0; i < this.size; i++) {
          this.setFunctionModule(6, i, i % 2 == 0);
          this.setFunctionModule(i, 6, i % 2 == 0);
        }
        this.drawFinderPattern(3, 3);
        this.drawFinderPattern(this.size - 4, 3);
        this.drawFinderPattern(3, this.size - 4);
        const alignPatPos = this.getAlignmentPatternPositions();
        const numAlign = alignPatPos.length;
        for (let i = 0; i < numAlign; i++) {
          for (let j = 0; j < numAlign; j++) {
            if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
              this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
          }
        }
        this.drawFormatBits(0);
        this.drawVersion();
      }
      // Draws two copies of the format bits (with its own error correction code)
      // based on the given mask and this object's error correction level field.
      drawFormatBits(mask) {
        const data = this.errorCorrectionLevel.formatBits << 3 | mask;
        let rem = data;
        for (let i = 0; i < 10; i++)
          rem = rem << 1 ^ (rem >>> 9) * 1335;
        const bits = (data << 10 | rem) ^ 21522;
        assert(bits >>> 15 == 0);
        for (let i = 0; i <= 5; i++)
          this.setFunctionModule(8, i, getBit(bits, i));
        this.setFunctionModule(8, 7, getBit(bits, 6));
        this.setFunctionModule(8, 8, getBit(bits, 7));
        this.setFunctionModule(7, 8, getBit(bits, 8));
        for (let i = 9; i < 15; i++)
          this.setFunctionModule(14 - i, 8, getBit(bits, i));
        for (let i = 0; i < 8; i++)
          this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
        for (let i = 8; i < 15; i++)
          this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
        this.setFunctionModule(8, this.size - 8, true);
      }
      // Draws two copies of the version bits (with its own error correction code),
      // based on this object's version field, iff 7 <= version <= 40.
      drawVersion() {
        if (this.version < 7)
          return;
        let rem = this.version;
        for (let i = 0; i < 12; i++)
          rem = rem << 1 ^ (rem >>> 11) * 7973;
        const bits = this.version << 12 | rem;
        assert(bits >>> 18 == 0);
        for (let i = 0; i < 18; i++) {
          const color = getBit(bits, i);
          const a = this.size - 11 + i % 3;
          const b = Math.floor(i / 3);
          this.setFunctionModule(a, b, color);
          this.setFunctionModule(b, a, color);
        }
      }
      // Draws a 9*9 finder pattern including the border separator,
      // with the center module at (x, y). Modules can be out of bounds.
      drawFinderPattern(x, y) {
        for (let dy = -4; dy <= 4; dy++) {
          for (let dx = -4; dx <= 4; dx++) {
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            const xx = x + dx;
            const yy = y + dy;
            if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size)
              this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
          }
        }
      }
      // Draws a 5*5 alignment pattern, with the center module
      // at (x, y). All modules must be in bounds.
      drawAlignmentPattern(x, y) {
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++)
            this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
        }
      }
      // Sets the color of a module and marks it as a function module.
      // Only used by the constructor. Coordinates must be in bounds.
      setFunctionModule(x, y, isDark) {
        this.modules[y][x] = isDark;
        this.isFunction[y][x] = true;
      }
      /*-- Private helper methods for constructor: Codewords and masking --*/
      // Returns a new byte string representing the given data with the appropriate error correction
      // codewords appended to it, based on this object's version and error correction level.
      addEccAndInterleave(data) {
        const ver = this.version;
        const ecl = this.errorCorrectionLevel;
        if (data.length != _QrCode2.getNumDataCodewords(ver, ecl))
          throw "Invalid argument";
        const numBlocks = _QrCode2.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
        const blockEccLen = _QrCode2.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
        const rawCodewords = Math.floor(_QrCode2.getNumRawDataModules(ver) / 8);
        const numShortBlocks = numBlocks - rawCodewords % numBlocks;
        const shortBlockLen = Math.floor(rawCodewords / numBlocks);
        const blocks = [];
        const rsDiv = _QrCode2.reedSolomonComputeDivisor(blockEccLen);
        for (let i = 0, k = 0; i < numBlocks; i++) {
          const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
          k += dat.length;
          const ecc = _QrCode2.reedSolomonComputeRemainder(dat, rsDiv);
          if (i < numShortBlocks)
            dat.push(0);
          blocks.push(dat.concat(ecc));
        }
        const result = [];
        for (let i = 0; i < blocks[0].length; i++) {
          blocks.forEach((block, j) => {
            if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
              result.push(block[i]);
          });
        }
        assert(result.length == rawCodewords);
        return result;
      }
      // Draws the given sequence of 8-bit codewords (data and error correction) onto the entire
      // data area of this QR Code. Function modules need to be marked off before this is called.
      drawCodewords(data) {
        if (data.length != Math.floor(_QrCode2.getNumRawDataModules(this.version) / 8))
          throw "Invalid argument";
        let i = 0;
        for (let right = this.size - 1; right >= 1; right -= 2) {
          if (right == 6)
            right = 5;
          for (let vert = 0; vert < this.size; vert++) {
            for (let j = 0; j < 2; j++) {
              const x = right - j;
              const upward = (right + 1 & 2) == 0;
              const y = upward ? this.size - 1 - vert : vert;
              if (!this.isFunction[y][x] && i < data.length * 8) {
                this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
                i++;
              }
            }
          }
        }
        assert(i == data.length * 8);
      }
      // XORs the codeword modules in this QR Code with the given mask pattern.
      // The function modules must be marked and the codeword bits must be drawn
      // before masking. Due to the arithmetic of XOR, calling applyMask() with
      // the same mask value a second time will undo the mask. A final well-formed
      // QR Code needs exactly one (not zero, two, etc.) mask applied.
      applyMask(mask) {
        if (mask < 0 || mask > 7)
          throw "Mask value out of range";
        for (let y = 0; y < this.size; y++) {
          for (let x = 0; x < this.size; x++) {
            let invert;
            switch (mask) {
              case 0:
                invert = (x + y) % 2 == 0;
                break;
              case 1:
                invert = y % 2 == 0;
                break;
              case 2:
                invert = x % 3 == 0;
                break;
              case 3:
                invert = (x + y) % 3 == 0;
                break;
              case 4:
                invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
                break;
              case 5:
                invert = x * y % 2 + x * y % 3 == 0;
                break;
              case 6:
                invert = (x * y % 2 + x * y % 3) % 2 == 0;
                break;
              case 7:
                invert = ((x + y) % 2 + x * y % 3) % 2 == 0;
                break;
              default:
                throw "Unreachable";
            }
            if (!this.isFunction[y][x] && invert)
              this.modules[y][x] = !this.modules[y][x];
          }
        }
      }
      // Calculates and returns the penalty score based on state of this QR Code's current modules.
      // This is used by the automatic mask choice algorithm to find the mask pattern that yields the lowest score.
      getPenaltyScore() {
        let result = 0;
        for (let y = 0; y < this.size; y++) {
          let runColor = false;
          let runX = 0;
          const runHistory = [0, 0, 0, 0, 0, 0, 0];
          for (let x = 0; x < this.size; x++) {
            if (this.modules[y][x] == runColor) {
              runX++;
              if (runX == 5)
                result += _QrCode2.PENALTY_N1;
              else if (runX > 5)
                result++;
            } else {
              this.finderPenaltyAddHistory(runX, runHistory);
              if (!runColor)
                result += this.finderPenaltyCountPatterns(runHistory) * _QrCode2.PENALTY_N3;
              runColor = this.modules[y][x];
              runX = 1;
            }
          }
          result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * _QrCode2.PENALTY_N3;
        }
        for (let x = 0; x < this.size; x++) {
          let runColor = false;
          let runY = 0;
          const runHistory = [0, 0, 0, 0, 0, 0, 0];
          for (let y = 0; y < this.size; y++) {
            if (this.modules[y][x] == runColor) {
              runY++;
              if (runY == 5)
                result += _QrCode2.PENALTY_N1;
              else if (runY > 5)
                result++;
            } else {
              this.finderPenaltyAddHistory(runY, runHistory);
              if (!runColor)
                result += this.finderPenaltyCountPatterns(runHistory) * _QrCode2.PENALTY_N3;
              runColor = this.modules[y][x];
              runY = 1;
            }
          }
          result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * _QrCode2.PENALTY_N3;
        }
        for (let y = 0; y < this.size - 1; y++) {
          for (let x = 0; x < this.size - 1; x++) {
            const color = this.modules[y][x];
            if (color == this.modules[y][x + 1] && color == this.modules[y + 1][x] && color == this.modules[y + 1][x + 1])
              result += _QrCode2.PENALTY_N2;
          }
        }
        let dark = 0;
        for (const row of this.modules)
          dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
        const total = this.size * this.size;
        const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
        assert(0 <= k && k <= 9);
        result += k * _QrCode2.PENALTY_N4;
        assert(0 <= result && result <= 2568888);
        return result;
      }
      /*-- Private helper functions --*/
      // Returns an ascending list of positions of alignment patterns for this version number.
      // Each position is in the range [0,177), and are used on both the x and y axes.
      // This could be implemented as lookup table of 40 variable-length lists of integers.
      getAlignmentPatternPositions() {
        if (this.version == 1)
          return [];
        else {
          const numAlign = Math.floor(this.version / 7) + 2;
          const step = this.version == 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
          const result = [6];
          for (let pos = this.size - 7; result.length < numAlign; pos -= step)
            result.splice(1, 0, pos);
          return result;
        }
      }
      // Returns the number of data bits that can be stored in a QR Code of the given version number, after
      // all function modules are excluded. This includes remainder bits, so it might not be a multiple of 8.
      // The result is in the range [208, 29648]. This could be implemented as a 40-entry lookup table.
      static getNumRawDataModules(ver) {
        if (ver < _QrCode2.MIN_VERSION || ver > _QrCode2.MAX_VERSION)
          throw "Version number out of range";
        let result = (16 * ver + 128) * ver + 64;
        if (ver >= 2) {
          const numAlign = Math.floor(ver / 7) + 2;
          result -= (25 * numAlign - 10) * numAlign - 55;
          if (ver >= 7)
            result -= 36;
        }
        assert(208 <= result && result <= 29648);
        return result;
      }
      // Returns the number of 8-bit data (i.e. not error correction) codewords contained in any
      // QR Code of the given version number and error correction level, with remainder bits discarded.
      // This stateless pure function could be implemented as a (40*4)-cell lookup table.
      static getNumDataCodewords(ver, ecl) {
        return Math.floor(_QrCode2.getNumRawDataModules(ver) / 8) - _QrCode2.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * _QrCode2.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
      }
      // Returns a Reed-Solomon ECC generator polynomial for the given degree. This could be
      // implemented as a lookup table over all possible parameter values, instead of as an algorithm.
      static reedSolomonComputeDivisor(degree) {
        if (degree < 1 || degree > 255)
          throw "Degree out of range";
        const result = [];
        for (let i = 0; i < degree - 1; i++)
          result.push(0);
        result.push(1);
        let root = 1;
        for (let i = 0; i < degree; i++) {
          for (let j = 0; j < result.length; j++) {
            result[j] = _QrCode2.reedSolomonMultiply(result[j], root);
            if (j + 1 < result.length)
              result[j] ^= result[j + 1];
          }
          root = _QrCode2.reedSolomonMultiply(root, 2);
        }
        return result;
      }
      // Returns the Reed-Solomon error correction codeword for the given data and divisor polynomials.
      static reedSolomonComputeRemainder(data, divisor) {
        const result = divisor.map((_) => 0);
        for (const b of data) {
          const factor = b ^ result.shift();
          result.push(0);
          divisor.forEach((coef, i) => result[i] ^= _QrCode2.reedSolomonMultiply(coef, factor));
        }
        return result;
      }
      // Returns the product of the two given field elements modulo GF(2^8/0x11D). The arguments and result
      // are unsigned 8-bit integers. This could be implemented as a lookup table of 256*256 entries of uint8.
      static reedSolomonMultiply(x, y) {
        if (x >>> 8 != 0 || y >>> 8 != 0)
          throw "Byte out of range";
        let z = 0;
        for (let i = 7; i >= 0; i--) {
          z = z << 1 ^ (z >>> 7) * 285;
          z ^= (y >>> i & 1) * x;
        }
        assert(z >>> 8 == 0);
        return z;
      }
      // Can only be called immediately after a light run is added, and
      // returns either 0, 1, or 2. A helper function for getPenaltyScore().
      finderPenaltyCountPatterns(runHistory) {
        const n = runHistory[1];
        assert(n <= this.size * 3);
        const core = n > 0 && runHistory[2] == n && runHistory[3] == n * 3 && runHistory[4] == n && runHistory[5] == n;
        return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
      }
      // Must be called at the end of a line (row or column) of modules. A helper function for getPenaltyScore().
      finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
        if (currentRunColor) {
          this.finderPenaltyAddHistory(currentRunLength, runHistory);
          currentRunLength = 0;
        }
        currentRunLength += this.size;
        this.finderPenaltyAddHistory(currentRunLength, runHistory);
        return this.finderPenaltyCountPatterns(runHistory);
      }
      // Pushes the given value to the front and drops the last value. A helper function for getPenaltyScore().
      finderPenaltyAddHistory(currentRunLength, runHistory) {
        if (runHistory[0] == 0)
          currentRunLength += this.size;
        runHistory.pop();
        runHistory.unshift(currentRunLength);
      }
    };
    _QrCode.MIN_VERSION = 1;
    _QrCode.MAX_VERSION = 40;
    _QrCode.PENALTY_N1 = 3;
    _QrCode.PENALTY_N2 = 3;
    _QrCode.PENALTY_N3 = 40;
    _QrCode.PENALTY_N4 = 10;
    _QrCode.ECC_CODEWORDS_PER_BLOCK = [
      // Version: (note that index 0 is for padding, and is set to an illegal value)
      //0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
      [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
      // Low
      [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
      // Medium
      [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
      // Quartile
      [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
      // High
    ];
    _QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
      // Version: (note that index 0 is for padding, and is set to an illegal value)
      //0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
      [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
      // Low
      [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
      // Medium
      [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
      // Quartile
      [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
      // High
    ];
    let QrCode = _QrCode;
    qrcodegen2.QrCode = QrCode;
    function appendBits(val, len, bb) {
      if (len < 0 || len > 31 || val >>> len != 0)
        throw "Value out of range";
      for (let i = len - 1; i >= 0; i--)
        bb.push(val >>> i & 1);
    }
    function getBit(x, i) {
      return (x >>> i & 1) != 0;
    }
    function assert(cond) {
      if (!cond)
        throw "Assertion error";
    }
    const _QrSegment = class _QrSegment2 {
      /*-- Constructor (low level) and fields --*/
      // Creates a new QR Code segment with the given attributes and data.
      // The character count (numChars) must agree with the mode and the bit buffer length,
      // but the constraint isn't checked. The given bit buffer is cloned and stored.
      constructor(mode, numChars, bitData) {
        this.mode = mode;
        this.numChars = numChars;
        this.bitData = bitData;
        if (numChars < 0)
          throw "Invalid argument";
        this.bitData = bitData.slice();
      }
      /*-- Static factory functions (mid level) --*/
      // Returns a segment representing the given binary data encoded in
      // byte mode. All input byte arrays are acceptable. Any text string
      // can be converted to UTF-8 bytes and encoded as a byte mode segment.
      static makeBytes(data) {
        const bb = [];
        for (const b of data)
          appendBits(b, 8, bb);
        return new _QrSegment2(_QrSegment2.Mode.BYTE, data.length, bb);
      }
      // Returns a segment representing the given string of decimal digits encoded in numeric mode.
      static makeNumeric(digits) {
        if (!_QrSegment2.isNumeric(digits))
          throw "String contains non-numeric characters";
        const bb = [];
        for (let i = 0; i < digits.length; ) {
          const n = Math.min(digits.length - i, 3);
          appendBits(parseInt(digits.substr(i, n), 10), n * 3 + 1, bb);
          i += n;
        }
        return new _QrSegment2(_QrSegment2.Mode.NUMERIC, digits.length, bb);
      }
      // Returns a segment representing the given text string encoded in alphanumeric mode.
      // The characters allowed are: 0 to 9, A to Z (uppercase only), space,
      // dollar, percent, asterisk, plus, hyphen, period, slash, colon.
      static makeAlphanumeric(text) {
        if (!_QrSegment2.isAlphanumeric(text))
          throw "String contains unencodable characters in alphanumeric mode";
        const bb = [];
        let i;
        for (i = 0; i + 2 <= text.length; i += 2) {
          let temp = _QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
          temp += _QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
          appendBits(temp, 11, bb);
        }
        if (i < text.length)
          appendBits(_QrSegment2.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
        return new _QrSegment2(_QrSegment2.Mode.ALPHANUMERIC, text.length, bb);
      }
      // Returns a new mutable list of zero or more segments to represent the given Unicode text string.
      // The result may use various segment modes and switch modes to optimize the length of the bit stream.
      static makeSegments(text) {
        if (text == "")
          return [];
        else if (_QrSegment2.isNumeric(text))
          return [_QrSegment2.makeNumeric(text)];
        else if (_QrSegment2.isAlphanumeric(text))
          return [_QrSegment2.makeAlphanumeric(text)];
        else
          return [_QrSegment2.makeBytes(_QrSegment2.toUtf8ByteArray(text))];
      }
      // Returns a segment representing an Extended Channel Interpretation
      // (ECI) designator with the given assignment value.
      static makeEci(assignVal) {
        const bb = [];
        if (assignVal < 0)
          throw "ECI assignment value out of range";
        else if (assignVal < 1 << 7)
          appendBits(assignVal, 8, bb);
        else if (assignVal < 1 << 14) {
          appendBits(2, 2, bb);
          appendBits(assignVal, 14, bb);
        } else if (assignVal < 1e6) {
          appendBits(6, 3, bb);
          appendBits(assignVal, 21, bb);
        } else
          throw "ECI assignment value out of range";
        return new _QrSegment2(_QrSegment2.Mode.ECI, 0, bb);
      }
      // Tests whether the given string can be encoded as a segment in numeric mode.
      // A string is encodable iff each character is in the range 0 to 9.
      static isNumeric(text) {
        return _QrSegment2.NUMERIC_REGEX.test(text);
      }
      // Tests whether the given string can be encoded as a segment in alphanumeric mode.
      // A string is encodable iff each character is in the following set: 0 to 9, A to Z
      // (uppercase only), space, dollar, percent, asterisk, plus, hyphen, period, slash, colon.
      static isAlphanumeric(text) {
        return _QrSegment2.ALPHANUMERIC_REGEX.test(text);
      }
      /*-- Methods --*/
      // Returns a new copy of the data bits of this segment.
      getData() {
        return this.bitData.slice();
      }
      // (Package-private) Calculates and returns the number of bits needed to encode the given segments at
      // the given version. The result is infinity if a segment has too many characters to fit its length field.
      static getTotalBits(segs, version) {
        let result = 0;
        for (const seg of segs) {
          const ccbits = seg.mode.numCharCountBits(version);
          if (seg.numChars >= 1 << ccbits)
            return Infinity;
          result += 4 + ccbits + seg.bitData.length;
        }
        return result;
      }
      // Returns a new array of bytes representing the given string encoded in UTF-8.
      static toUtf8ByteArray(str) {
        str = encodeURI(str);
        const result = [];
        for (let i = 0; i < str.length; i++) {
          if (str.charAt(i) != "%")
            result.push(str.charCodeAt(i));
          else {
            result.push(parseInt(str.substr(i + 1, 2), 16));
            i += 2;
          }
        }
        return result;
      }
    };
    _QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
    _QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
    _QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
    let QrSegment = _QrSegment;
    qrcodegen2.QrSegment = QrSegment;
  })(qrcodegen || (qrcodegen = {}));
  ((qrcodegen2) => {
    ((QrCode2) => {
      const _Ecc = class _Ecc {
        // The QR Code can tolerate about 30% erroneous codewords
        /*-- Constructor and fields --*/
        constructor(ordinal, formatBits) {
          this.ordinal = ordinal;
          this.formatBits = formatBits;
        }
      };
      _Ecc.LOW = new _Ecc(0, 1);
      _Ecc.MEDIUM = new _Ecc(1, 0);
      _Ecc.QUARTILE = new _Ecc(2, 3);
      _Ecc.HIGH = new _Ecc(3, 2);
      let Ecc = _Ecc;
      QrCode2.Ecc = Ecc;
    })(qrcodegen2.QrCode || (qrcodegen2.QrCode = {}));
  })(qrcodegen || (qrcodegen = {}));
  ((qrcodegen2) => {
    ((QrSegment2) => {
      const _Mode = class _Mode {
        /*-- Constructor and fields --*/
        constructor(modeBits, numBitsCharCount) {
          this.modeBits = modeBits;
          this.numBitsCharCount = numBitsCharCount;
        }
        /*-- Method --*/
        // (Package-private) Returns the bit width of the character count field for a segment in
        // this mode in a QR Code at the given version number. The result is in the range [0, 16].
        numCharCountBits(ver) {
          return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
        }
      };
      _Mode.NUMERIC = new _Mode(1, [10, 12, 14]);
      _Mode.ALPHANUMERIC = new _Mode(2, [9, 11, 13]);
      _Mode.BYTE = new _Mode(4, [8, 16, 16]);
      _Mode.KANJI = new _Mode(8, [8, 10, 12]);
      _Mode.ECI = new _Mode(7, [0, 0, 0]);
      let Mode = _Mode;
      QrSegment2.Mode = Mode;
    })(qrcodegen2.QrSegment || (qrcodegen2.QrSegment = {}));
  })(qrcodegen || (qrcodegen = {}));

  // node_modules/swissqrbill/lib/esm/shared/qr-code.js
  function generateQRData(data) {
    var _a, _b, _c, _d, _e, _f;
    const cleanedData = cleanData(data);
    validateData(cleanedData);
    const amount = (_a = cleanedData.amount) == null ? void 0 : _a.toFixed(2);
    const reference = getReferenceType(cleanedData.reference);
    const qrData = [
      "SPC",
      // Swiss Payments Code
      "0200",
      // Version
      "1",
      // Coding Type UTF-8
      (_b = cleanedData.creditor.account) != null ? _b : "",
      // IBAN
      "S",
      // Address Type
      cleanedData.creditor.name,
      // Name
      cleanedData.creditor.address,
      // Address
      cleanedData.creditor.buildingNumber ? `${cleanedData.creditor.buildingNumber}` : "",
      `${cleanedData.creditor.zip}`,
      // Zip
      cleanedData.creditor.city,
      // City
      cleanedData.creditor.country,
      // Country
      "",
      // 1x Empty
      "",
      // 2x Empty
      "",
      // 3x Empty
      "",
      // 4x Empty
      "",
      // 5x Empty
      "",
      // 6x Empty
      "",
      // 7x Empty
      amount != null ? amount : "",
      // Amount
      cleanedData.currency,
      // Currency
      ...cleanedData.debtor ? [
        "S",
        // Address Type
        cleanedData.debtor.name,
        // Name
        cleanedData.debtor.address,
        // Address
        cleanedData.debtor.buildingNumber ? `${cleanedData.debtor.buildingNumber}` : "",
        `${cleanedData.debtor.zip}`,
        // Zip
        cleanedData.debtor.city,
        // City
        (_c = cleanedData.debtor.country) != null ? _c : ""
        // Country
      ] : [
        "",
        // Empty address type
        "",
        // Empty name
        "",
        // Empty address
        "",
        // Empty building number
        "",
        // Empty zip field
        "",
        // Empty city field
        ""
        // Empty country
      ],
      reference,
      // Reference type
      (_d = cleanedData.reference) != null ? _d : "",
      // Reference
      (_e = cleanedData.message) != null ? _e : "",
      // Unstructured message
      "EPD",
      // End of payment data
      (_f = cleanedData.additionalInformation) != null ? _f : "",
      // Additional information
      ...cleanedData.av1 ? [
        cleanedData.av1
      ] : [],
      ...cleanedData.av2 ? [
        cleanedData.av2
      ] : []
    ];
    return qrData.join("\n");
  }
  function renderQRCode(data, size, renderBlockFunction) {
    const qrData = generateQRData(data);
    const eci = qrcodegen.QrSegment.makeEci(26);
    const segments = qrcodegen.QrSegment.makeSegments(qrData);
    const qrCode = qrcodegen.QrCode.encodeSegments([eci, ...segments], qrcodegen.QrCode.Ecc.MEDIUM, 10, 25);
    const blockSize = size / qrCode.size;
    for (let x = 0; x < qrCode.size; x++) {
      const xPos = x * blockSize;
      for (let y = 0; y < qrCode.size; y++) {
        const yPos = y * blockSize;
        if (qrCode.getModule(x, y)) {
          renderBlockFunction(xPos, yPos, blockSize);
        }
      }
    }
  }
  function renderSwissCross(size, renderRectFunction) {
    const scale = size / mm2pt(46);
    const swissCrossWhiteBackgroundSize = mm2pt(7) * scale;
    const swissCrossBlackBackgroundSize = mm2pt(6) * scale;
    const swissCrossThickness = mm2pt(1.17) * scale;
    const swissCrossLength = mm2pt(3.89) * scale;
    renderRectFunction(
      size / 2 - swissCrossWhiteBackgroundSize / 2,
      size / 2 - swissCrossWhiteBackgroundSize / 2,
      swissCrossWhiteBackgroundSize,
      swissCrossWhiteBackgroundSize,
      "white"
    );
    renderRectFunction(
      size / 2 - swissCrossBlackBackgroundSize / 2,
      size / 2 - swissCrossBlackBackgroundSize / 2,
      swissCrossBlackBackgroundSize,
      swissCrossBlackBackgroundSize,
      "black"
    );
    renderRectFunction(
      size / 2 - swissCrossLength / 2,
      size / 2 - swissCrossThickness / 2,
      swissCrossLength,
      swissCrossThickness,
      "white"
    );
    renderRectFunction(
      size / 2 - swissCrossThickness / 2,
      size / 2 - swissCrossLength / 2,
      swissCrossThickness,
      swissCrossLength,
      "white"
    );
  }

  // node_modules/swissqrbill/lib/esm/svg/swissqrcode.js
  var SwissQRCode = class {
    /**
     * Creates a Swiss QR Code.
     *
     * @param data The data to be encoded in the QR code.
     * @param size The size of the QR code in mm.
     * @throws { ValidationError } Throws an error if the data is invalid.
     */
    constructor(data, size = 46) {
      this.instance = new SVG();
      this.instance.width(`${size}mm`);
      this.instance.height(`${size}mm`);
      renderQRCode(data, size, (xPos, yPos, blockSize) => {
        this.instance.addRect(
          `${xPos}mm`,
          `${yPos}mm`,
          `${blockSize}mm`,
          `${blockSize}mm`
        ).fill("black");
      });
      renderSwissCross(size, (xPos, yPos, width, height, fillColor) => {
        this.instance.addRect(
          `${xPos}mm`,
          `${yPos}mm`,
          `${width}mm`,
          `${height}mm`
        ).fill(fillColor);
      });
    }
    /**
     * Outputs the SVG as a string.
     *
     * @returns The outerHTML of the SVG element.
     */
    toString() {
      return this.instance.outerHTML;
    }
    /**
     * Returns the SVG element.
     *
     * @returns The SVG element.
     */
    get element() {
      return this.instance.element;
    }
  };

  // node_modules/swissqrbill/lib/esm/svg/character-width.js
  var arial8pt = {
    100: 6.11767578125,
    101: 6.11767578125,
    102: 3.05615234375,
    103: 6.11767578125,
    104: 6.11767578125,
    105: 2.44384765625,
    106: 2.44384765625,
    107: 5.5,
    108: 2.44384765625,
    109: 9.1630859375,
    110: 6.11767578125,
    111: 6.11767578125,
    112: 6.11767578125,
    113: 6.11767578125,
    114: 3.6630859375,
    115: 5.5,
    116: 3.05615234375,
    117: 6.11767578125,
    118: 5.5,
    119: 7.94384765625,
    120: 5.5,
    121: 5.5,
    122: 5.5,
    123: 3.673828125,
    124: 2.857421875,
    125: 3.673828125,
    126: 6.423828125,
    160: 3.05615234375,
    161: 3.6630859375,
    162: 6.11767578125,
    163: 6.11767578125,
    164: 6.11767578125,
    165: 6.11767578125,
    166: 2.857421875,
    167: 6.11767578125,
    168: 3.6630859375,
    169: 8.10498046875,
    170: 4.0712890625,
    171: 6.11767578125,
    172: 6.423828125,
    173: 0,
    174: 8.10498046875,
    175: 6.07470703125,
    176: 4.39892578125,
    177: 6.037109375,
    178: 3.6630859375,
    179: 3.6630859375,
    180: 3.6630859375,
    181: 6.337890625,
    182: 5.908203125,
    183: 3.6630859375,
    184: 3.6630859375,
    185: 3.6630859375,
    186: 4.017578125,
    187: 6.11767578125,
    188: 9.173828125,
    189: 9.173828125,
    190: 9.173828125,
    191: 6.71923828125,
    192: 7.3369140625,
    193: 7.3369140625,
    194: 7.3369140625,
    195: 7.3369140625,
    196: 7.3369140625,
    197: 7.3369140625,
    198: 11,
    199: 7.94384765625,
    200: 7.3369140625,
    201: 7.3369140625,
    202: 7.3369140625,
    203: 7.3369140625,
    204: 3.05615234375,
    205: 3.05615234375,
    206: 3.05615234375,
    207: 3.05615234375,
    208: 7.94384765625,
    209: 7.94384765625,
    210: 8.55615234375,
    211: 8.55615234375,
    212: 8.55615234375,
    213: 8.55615234375,
    214: 8.55615234375,
    215: 6.423828125,
    216: 8.55615234375,
    217: 7.94384765625,
    218: 7.94384765625,
    219: 7.94384765625,
    220: 7.94384765625,
    221: 7.3369140625,
    222: 7.3369140625,
    223: 6.71923828125,
    224: 6.11767578125,
    225: 6.11767578125,
    226: 6.11767578125,
    227: 6.11767578125,
    228: 6.11767578125,
    229: 6.11767578125,
    230: 9.78076171875,
    231: 5.5,
    232: 6.11767578125,
    233: 6.11767578125,
    234: 6.11767578125,
    235: 6.11767578125,
    236: 3.05615234375,
    237: 3.05615234375,
    238: 3.05615234375,
    239: 3.05615234375,
    240: 6.11767578125,
    241: 6.11767578125,
    242: 6.11767578125,
    243: 6.11767578125,
    244: 6.11767578125,
    245: 6.11767578125,
    246: 6.11767578125,
    247: 6.037109375,
    248: 6.71923828125,
    249: 6.11767578125,
    250: 6.11767578125,
    251: 6.11767578125,
    252: 6.11767578125,
    253: 5.5,
    254: 6.11767578125,
    32: 3.05615234375,
    33: 3.05615234375,
    34: 3.90478515625,
    35: 6.11767578125,
    36: 6.11767578125,
    37: 9.78076171875,
    38: 7.3369140625,
    39: 2.10009765625,
    40: 3.6630859375,
    41: 3.6630859375,
    42: 4.28076171875,
    43: 6.423828125,
    44: 3.05615234375,
    45: 3.6630859375,
    46: 3.05615234375,
    47: 3.05615234375,
    48: 6.11767578125,
    49: 6.11767578125,
    50: 6.11767578125,
    51: 6.11767578125,
    52: 6.11767578125,
    53: 6.11767578125,
    54: 6.11767578125,
    55: 6.11767578125,
    56: 6.11767578125,
    57: 6.11767578125,
    58: 3.05615234375,
    59: 3.05615234375,
    60: 6.423828125,
    61: 6.423828125,
    62: 6.423828125,
    63: 6.11767578125,
    64: 11.16650390625,
    65: 7.3369140625,
    66: 7.3369140625,
    67: 7.94384765625,
    68: 7.94384765625,
    69: 7.3369140625,
    70: 6.71923828125,
    71: 8.55615234375,
    72: 7.94384765625,
    73: 3.05615234375,
    74: 5.5,
    75: 7.3369140625,
    76: 6.11767578125,
    77: 9.1630859375,
    78: 7.94384765625,
    79: 8.55615234375,
    80: 7.3369140625,
    81: 8.55615234375,
    82: 7.94384765625,
    83: 7.3369140625,
    84: 6.71923828125,
    85: 7.94384765625,
    86: 7.3369140625,
    87: 10.38232421875,
    88: 7.3369140625,
    89: 7.3369140625,
    90: 6.71923828125,
    91: 3.05615234375,
    92: 3.05615234375,
    93: 3.05615234375,
    94: 5.16162109375,
    95: 6.11767578125,
    96: 3.6630859375,
    97: 6.11767578125,
    98: 6.11767578125,
    99: 5.5
  };
  var arial10pt = {
    100: 7.22998046875,
    101: 7.22998046875,
    102: 3.61181640625,
    103: 7.22998046875,
    104: 7.22998046875,
    105: 2.88818359375,
    106: 2.88818359375,
    107: 6.5,
    108: 2.88818359375,
    109: 10.8291015625,
    110: 7.22998046875,
    111: 7.22998046875,
    112: 7.22998046875,
    113: 7.22998046875,
    114: 4.3291015625,
    115: 6.5,
    116: 3.61181640625,
    117: 7.22998046875,
    118: 6.5,
    119: 9.38818359375,
    120: 6.5,
    121: 6.5,
    122: 6.5,
    123: 4.341796875,
    124: 3.376953125,
    125: 4.341796875,
    126: 7.591796875,
    160: 3.61181640625,
    161: 4.3291015625,
    162: 7.22998046875,
    163: 7.22998046875,
    164: 7.22998046875,
    165: 7.22998046875,
    166: 3.376953125,
    167: 7.22998046875,
    168: 4.3291015625,
    169: 9.57861328125,
    170: 4.8115234375,
    171: 7.22998046875,
    172: 7.591796875,
    173: 0,
    174: 9.57861328125,
    175: 7.17919921875,
    176: 5.19873046875,
    177: 7.134765625,
    178: 4.3291015625,
    179: 4.3291015625,
    180: 4.3291015625,
    181: 7.490234375,
    182: 6.982421875,
    183: 4.3291015625,
    184: 4.3291015625,
    185: 4.3291015625,
    186: 4.748046875,
    187: 7.22998046875,
    188: 10.841796875,
    189: 10.841796875,
    190: 10.841796875,
    191: 7.94091796875,
    192: 8.6708984375,
    193: 8.6708984375,
    194: 8.6708984375,
    195: 8.6708984375,
    196: 8.6708984375,
    197: 8.6708984375,
    198: 13,
    199: 9.38818359375,
    200: 8.6708984375,
    201: 8.6708984375,
    202: 8.6708984375,
    203: 8.6708984375,
    204: 3.61181640625,
    205: 3.61181640625,
    206: 3.61181640625,
    207: 3.61181640625,
    208: 9.38818359375,
    209: 9.38818359375,
    210: 10.11181640625,
    211: 10.11181640625,
    212: 10.11181640625,
    213: 10.11181640625,
    214: 10.11181640625,
    215: 7.591796875,
    216: 10.11181640625,
    217: 9.38818359375,
    218: 9.38818359375,
    219: 9.38818359375,
    220: 9.38818359375,
    221: 8.6708984375,
    222: 8.6708984375,
    223: 7.94091796875,
    224: 7.22998046875,
    225: 7.22998046875,
    226: 7.22998046875,
    227: 7.22998046875,
    228: 7.22998046875,
    229: 7.22998046875,
    230: 11.55908203125,
    231: 6.5,
    232: 7.22998046875,
    233: 7.22998046875,
    234: 7.22998046875,
    235: 7.22998046875,
    236: 3.61181640625,
    237: 3.61181640625,
    238: 3.61181640625,
    239: 3.61181640625,
    240: 7.22998046875,
    241: 7.22998046875,
    242: 7.22998046875,
    243: 7.22998046875,
    244: 7.22998046875,
    245: 7.22998046875,
    246: 7.22998046875,
    247: 7.134765625,
    248: 7.94091796875,
    249: 7.22998046875,
    250: 7.22998046875,
    251: 7.22998046875,
    252: 7.22998046875,
    253: 6.5,
    254: 7.22998046875,
    32: 3.61181640625,
    33: 3.61181640625,
    34: 4.61474609375,
    35: 7.22998046875,
    36: 7.22998046875,
    37: 11.55908203125,
    38: 8.6708984375,
    39: 2.48193359375,
    40: 4.3291015625,
    41: 4.3291015625,
    42: 5.05908203125,
    43: 7.591796875,
    44: 3.61181640625,
    45: 4.3291015625,
    46: 3.61181640625,
    47: 3.61181640625,
    48: 7.22998046875,
    49: 7.22998046875,
    50: 7.22998046875,
    51: 7.22998046875,
    52: 7.22998046875,
    53: 7.22998046875,
    54: 7.22998046875,
    55: 7.22998046875,
    56: 7.22998046875,
    57: 7.22998046875,
    58: 3.61181640625,
    59: 3.61181640625,
    60: 7.591796875,
    61: 7.591796875,
    62: 7.591796875,
    63: 7.22998046875,
    64: 13.19677734375,
    65: 8.6708984375,
    66: 8.6708984375,
    67: 9.38818359375,
    68: 9.38818359375,
    69: 8.6708984375,
    70: 7.94091796875,
    71: 10.11181640625,
    72: 9.38818359375,
    73: 3.61181640625,
    74: 6.5,
    75: 8.6708984375,
    76: 7.22998046875,
    77: 10.8291015625,
    78: 9.38818359375,
    79: 10.11181640625,
    80: 8.6708984375,
    81: 10.11181640625,
    82: 9.38818359375,
    83: 8.6708984375,
    84: 7.94091796875,
    85: 9.38818359375,
    86: 8.6708984375,
    87: 12.27001953125,
    88: 8.6708984375,
    89: 8.6708984375,
    90: 7.94091796875,
    91: 3.61181640625,
    92: 3.61181640625,
    93: 3.61181640625,
    94: 6.10009765625,
    95: 7.22998046875,
    96: 4.3291015625,
    97: 7.22998046875,
    98: 7.22998046875,
    99: 6.5
  };
  function calculateTextWidth(text, size) {
    let width = 0;
    if (size === "8pt") {
      for (let c = 0; c < text.length; c++) {
        width += arial8pt[text.charCodeAt(c)];
      }
    } else if (size === "10pt") {
      for (let c = 0; c < text.length; c++) {
        width += arial10pt[text.charCodeAt(c)];
      }
    }
    return width;
  }

  // node_modules/swissqrbill/lib/esm/svg/swissqrbill.js
  var SwissQRBill = class {
    constructor(data, options) {
      this.scissors = true;
      this.outlines = true;
      this.language = "DE";
      this.font = "Arial";
      this.renderAdditionalInformation = true;
      this.data = data;
      this.data = cleanData(this.data);
      validateData(this.data);
      this.language = (options == null ? void 0 : options.language) !== void 0 ? options.language : this.language;
      this.outlines = (options == null ? void 0 : options.outlines) !== void 0 ? options.outlines : this.outlines;
      this.font = (options == null ? void 0 : options.fontName) !== void 0 ? options.fontName : this.font;
      this.scissors = (options == null ? void 0 : options.scissors) !== void 0 ? options.scissors : this.scissors;
      this.renderAdditionalInformation = (options == null ? void 0 : options.renderAdditionalInformation) !== void 0 ? options.renderAdditionalInformation : this.renderAdditionalInformation;
      this.instance = new SVG();
      this.instance.width("210mm");
      this.instance.height("105mm");
      this._render();
    }
    /**
     * Outputs the SVG as a string.
     *
     * @returns The outerHTML of the SVG.
     */
    toString() {
      return this.instance.outerHTML;
    }
    /**
     * Returns the SVG element.
     *
     * @returns The SVG element.
     */
    get element() {
      return this.instance.element;
    }
    _render() {
      const formattedCreditorAddress = this._formatAddress(this.data.creditor);
      let receiptLineCount = 0;
      let paymentPartLineCount = 0;
      this.instance.addRect(0, 0, "100%", "100%").fill("#fff");
      if (this.outlines) {
        this.instance.addLine("62mm", "0mm", "62mm", "105mm").stroke(1, "dashed", "black");
      }
      if (this.scissors) {
        const scissorsCenter = "M8.55299 18.3969C9.54465 17.5748 9.51074 16.0915 9.08357 14.9829L6.47473 8.02261C7.58167 5.9986 7.26467 3.99833 7.80373 3.99833C8.22582 3.99833 8.13259 4.38482 9.23105 4.32719C10.2854 4.27125 11.0652 3.1711 10.9957 2.13197C11.0025 1.09115 10.2041 0.0130391 9.1056 0.00456339C7.99867 -0.0734135 6.96972 0.858918 6.89683 1.95907C6.70527 3.24907 7.48674 5.53413 5.56613 6.60547C4.09305 5.80705 4.08797 4.38991 4.16255 3.10838C4.22358 2.04552 3.91845 0.76738 2.87424 0.260531C1.87241 -0.229367 0.446794 0.25036 0.139972 1.37594C-0.277034 2.51168 0.250156 4.07122 1.55541 4.34244C2.56233 4.55095 3.03528 3.83729 3.40143 4.1119C3.67774 4.31871 3.5167 5.62906 4.566 7.96667L1.908 15.5033C1.64356 16.456 1.65204 17.6206 2.58776 18.463L5.5424 10.6484L8.55299 18.3969ZM10.1634 2.87953C9.55143 3.97629 7.88849 3.88645 7.56641 2.74731C7.20704 1.71666 8.20887 0.397838 9.32767 0.726697C10.2447 0.919943 10.5821 2.12858 10.1634 2.87953ZM3.36753 2.927C2.94544 4.07122 1.00789 3.87797 0.746835 2.71341C0.479001 1.94042 0.8638 0.836881 1.77409 0.758904C2.88102 0.608036 3.87946 1.90821 3.36753 2.927Z";
        const scissorsSVG = this.instance.addSVG("11px", "19px").x(mm2px(62) - 5.25).y("30pt");
        scissorsSVG.addPath(scissorsCenter).fill("black");
      }
      const receiptContainer = this.instance.addSVG().x("5mm").y("5mm");
      const receiptTextContainer = receiptContainer.addText();
      receiptTextContainer.addTSpan(translations[this.language].receipt).x(0).y(0).dy("11pt").fontFamily(this.font).fontWeight("bold").fontSize("11pt");
      receiptTextContainer.addTSpan(translations[this.language].account).x(0).y("7mm").dy("9pt").fontFamily(this.font).fontWeight("bold").fontSize("6pt");
      receiptTextContainer.addTSpan(formatIBAN(this.data.creditor.account)).x(0).dy("9pt").fontFamily(this.font).fontWeight("normal").fontSize("8pt");
      receiptLineCount++;
      let receiptCreditorAddressLines = [];
      for (const line of formattedCreditorAddress) {
        const messageLines = this._fitTextToWidth(line, mm2px(52), 2, "8pt");
        receiptCreditorAddressLines = [...receiptCreditorAddressLines, ...messageLines];
      }
      for (const line of receiptCreditorAddressLines) {
        receiptLineCount++;
        receiptTextContainer.addTSpan(line).x(0).dy("9pt").fontFamily(this.font).fontWeight("normal").fontSize("8pt");
      }
      if (this.data.reference !== void 0) {
        receiptTextContainer.addTSpan(translations[this.language].reference).x(0).dy("18pt").fontFamily(this.font).fontWeight("bold").fontSize("6pt");
        receiptTextContainer.addTSpan(formatReference(this.data.reference)).x(0).dy("9pt").fontFamily(this.font).fontWeight("normal").fontSize("8pt");
        receiptLineCount++;
      }
      if (this.data.debtor !== void 0) {
        const formattedDebtorAddress = this._formatAddress(this.data.debtor);
        receiptTextContainer.addTSpan(translations[this.language].payableBy).x(0).dy("18pt").fontFamily(this.font).fontWeight("bold").fontSize("6pt");
        let receiptDebtorAddressLines = [];
        for (const line of formattedDebtorAddress) {
          const messageLines = this._fitTextToWidth(line, mm2px(52), 2, "8pt");
          receiptDebtorAddressLines = [...receiptDebtorAddressLines, ...messageLines];
        }
        for (const line of receiptDebtorAddressLines) {
          receiptTextContainer.addTSpan(line).x(0).dy("9pt").fontFamily(this.font).fontWeight("normal").fontSize("8pt");
        }
      } else {
        receiptTextContainer.addTSpan(translations[this.language].payableByName).x(0).dy("18pt").fontFamily(this.font).fontWeight("bold").fontSize("6pt");
        const referenceHeight = this.data.reference !== void 0 ? pt2mm(18) : 0;
        this._addRectangle(
          5,
          12 + pt2mm(9) + receiptLineCount * pt2mm(9) + pt2mm(referenceHeight) + pt2mm(18) + 1,
          52,
          20
        );
      }
      const amountContainer = receiptContainer.addText().y("63mm");
      amountContainer.addTSpan(translations[this.language].currency).x(0).dy("6pt").fontFamily(this.font).fontWeight("bold").fontSize("6pt");
      const amountXPosition = this.data.amount === void 0 ? 13 : 22;
      amountContainer.addTSpan(translations[this.language].amount).x(`${amountXPosition}mm`).fontFamily(this.font).fontWeight("bold").fontSize("6pt");
      amountContainer.addTSpan(this.data.currency).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("8pt");
      if (this.data.amount !== void 0) {
        amountContainer.addTSpan(formatAmount(this.data.amount)).x(`${amountXPosition}mm`).fontFamily(this.font).fontWeight("normal").fontSize("8pt");
      } else {
        this._addRectangle(27, 68, 30, 10);
      }
      amountContainer.addTSpan(translations[this.language].acceptancePoint).x("52mm").y("82mm").textAlign("right").fontFamily(this.font).fontWeight("bold").fontSize("6pt");
      const paymentPartContainer = this.instance.addSVG().x("67mm").y("5mm");
      paymentPartContainer.addText(translations[this.language].paymentPart).x(0).y(0).dy("11pt").fontFamily(this.font).fontWeight("bold").fontSize("11pt");
      this._renderQRCode();
      const paymentPartMiddleTextContainer = paymentPartContainer.addText().y("63mm");
      paymentPartMiddleTextContainer.addTSpan(translations[this.language].currency).x(0).dy("8pt").fontFamily(this.font).fontWeight("bold").fontSize("8pt");
      paymentPartMiddleTextContainer.addTSpan(translations[this.language].amount).x("22mm").fontFamily(this.font).fontWeight("bold").fontSize("8pt");
      paymentPartMiddleTextContainer.addTSpan(this.data.currency).x(0).dy("13pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
      if (this.data.amount !== void 0) {
        paymentPartMiddleTextContainer.addTSpan(formatAmount(this.data.amount)).x("22mm").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
      } else {
        this._addRectangle(
          78,
          68 + pt2mm(8) + pt2mm(5),
          40,
          15
        );
      }
      const alternativeSchemeContainer = paymentPartContainer.addText().x(0).y("90mm");
      if (this.data.av1 !== void 0) {
        const [scheme, data] = this.data.av1.split(/(\/.+)/);
        alternativeSchemeContainer.addTSpan(scheme).x(0).fontFamily(this.font).fontWeight("bold").fontSize("7pt");
        alternativeSchemeContainer.addTSpan(this.data.av1.length > 90 ? `${data.substr(0, 87)}...` : data).fontFamily(this.font).fontWeight("normal").fontSize("7pt");
      }
      if (this.data.av2 !== void 0) {
        const [scheme, data] = this.data.av2.split(/(\/.+)/);
        alternativeSchemeContainer.addTSpan(scheme).x(0).dy("8pt").fontFamily(this.font).fontWeight("bold").fontSize("7pt");
        alternativeSchemeContainer.addTSpan(this.data.av2.length > 90 ? `${data.substr(0, 87)}...` : data).fontFamily(this.font).fontWeight("normal").fontSize("7pt");
      }
      const paymentPartDebtorContainer = this.instance.addSVG().x("118mm").y("5mm");
      const paymentPartRightTextContainer = paymentPartDebtorContainer.addText();
      paymentPartRightTextContainer.addTSpan(translations[this.language].account).x(0).y(0).dy("11pt").fontFamily(this.font).fontWeight("bold").fontSize("8pt");
      paymentPartRightTextContainer.addTSpan(formatIBAN(this.data.creditor.account)).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
      paymentPartLineCount++;
      let paymentPartCreditorAddressLines = [];
      for (const line of formattedCreditorAddress) {
        const messageLines = this._fitTextToWidth(line, mm2px(52), 2, "8pt");
        paymentPartCreditorAddressLines = [...paymentPartCreditorAddressLines, ...messageLines];
      }
      for (const line of paymentPartCreditorAddressLines) {
        paymentPartRightTextContainer.addTSpan(line).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
        paymentPartLineCount++;
      }
      if (this.data.reference !== void 0) {
        paymentPartRightTextContainer.addTSpan(translations[this.language].reference).x(0).dy("22pt").fontFamily(this.font).fontWeight("bold").fontSize("8pt");
        paymentPartRightTextContainer.addTSpan(formatReference(this.data.reference)).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
        paymentPartLineCount++;
      }
      const shouldRenderAdditionalInformation = this.renderAdditionalInformation && this.data.additionalInformation !== void 0;
      const shouldRenderMessageSection = this.data.message !== void 0 || shouldRenderAdditionalInformation;
      if (shouldRenderMessageSection) {
        paymentPartRightTextContainer.addTSpan(translations[this.language].additionalInformation).x(0).dy("22pt").fontFamily(this.font).fontWeight("bold").fontSize("8pt");
        const referenceType = getReferenceType(this.data.reference);
        const maxLines = referenceType === "QRR" || referenceType === "SCOR" ? 3 : 4;
        const lengthInPixel = mm2px(87);
        this._getLineCountOfText(this.data.message, lengthInPixel, "10pt");
        const linesOfAdditionalInformation = this._getLineCountOfText(shouldRenderAdditionalInformation ? this.data.additionalInformation : void 0, lengthInPixel, "10pt");
        if (shouldRenderAdditionalInformation) {
          if (referenceType === "QRR" || referenceType === "SCOR") {
            if (this.data.message !== void 0) {
              paymentPartRightTextContainer.addTSpan(this._ellipsis(this.data.message, lengthInPixel, "10pt")).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
              paymentPartLineCount++;
            }
          } else {
            if (this.data.message !== void 0) {
              const maxLinesOfMessage = maxLines - linesOfAdditionalInformation;
              const messageLines = this._fitTextToWidth(this.data.message, lengthInPixel, maxLinesOfMessage, "10pt");
              for (let i = 0; i < maxLinesOfMessage; i++) {
                paymentPartRightTextContainer.addTSpan(messageLines[i]).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
                paymentPartLineCount++;
              }
            }
          }
          const additionalInformationLines = this._fitTextToWidth(this.data.additionalInformation, lengthInPixel, linesOfAdditionalInformation, "10pt");
          for (let i = 0; i < linesOfAdditionalInformation; i++) {
            paymentPartRightTextContainer.addTSpan(additionalInformationLines[i]).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
            paymentPartLineCount++;
          }
        } else if (this.data.message !== void 0) {
          const messageLines = this._fitTextToWidth(this.data.message, lengthInPixel, maxLines, "10pt");
          for (let i = 0; i < maxLines; i++) {
            paymentPartRightTextContainer.addTSpan(messageLines[i]).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
            paymentPartLineCount++;
          }
        }
      }
      if (this.data.debtor !== void 0) {
        const formattedDebtorAddress = this._formatAddress(this.data.debtor);
        paymentPartRightTextContainer.addTSpan(translations[this.language].payableBy).x(0).dy("22pt").fontFamily(this.font).fontWeight("bold").fontSize("8pt");
        let paymentPartDebtorAddressLines = [];
        for (const line of formattedDebtorAddress) {
          const messageLines = this._fitTextToWidth(line, mm2px(52), 2, "8pt");
          paymentPartDebtorAddressLines = [...paymentPartDebtorAddressLines, ...messageLines];
        }
        for (const line of paymentPartDebtorAddressLines) {
          paymentPartRightTextContainer.addTSpan(line).x(0).dy("11pt").fontFamily(this.font).fontWeight("normal").fontSize("10pt");
        }
      } else {
        paymentPartRightTextContainer.addTSpan(translations[this.language].payableByName).x(0).dy("22pt").fontFamily(this.font).fontWeight("bold").fontSize("8pt");
        const referenceHeight = this.data.reference !== void 0 ? pt2mm(22) : 0;
        const shouldRenderAdditionalInformation2 = this.renderAdditionalInformation && this.data.additionalInformation !== void 0;
        const additionalInformationHeight = this.data.message !== void 0 || shouldRenderAdditionalInformation2 ? pt2mm(22) : 0;
        this._addRectangle(
          118,
          5 + pt2mm(11) + paymentPartLineCount * pt2mm(11) + referenceHeight + additionalInformationHeight + pt2mm(22) + 1,
          65,
          25
        );
      }
    }
    _renderQRCode() {
      const qrCode = new SwissQRCode(this.data);
      qrCode.instance.x("67mm").y("17mm");
      this.instance.appendInstance(qrCode.instance);
    }
    _formatAddress(data) {
      const countryPrefix = data.country !== "CH" ? `${data.country} - ` : "";
      if (data.buildingNumber !== void 0) {
        return [data.name, `${data.address} ${data.buildingNumber}`, `${countryPrefix}${data.zip} ${data.city}`];
      } else {
        return [data.name, data.address, `${countryPrefix}${data.zip} ${data.city}`];
      }
    }
    _getLineCountOfText(text, lengthInPixel, size) {
      if (text === void 0) {
        return 0;
      } else {
        let lines = 0;
        let remainder = calculateTextWidth(text, size);
        while (remainder > 1) {
          lines++;
          remainder -= lengthInPixel;
        }
        return lines;
      }
    }
    _fitTextToWidth(text, lengthInPixel, maxLines, size) {
      var _a;
      const remainder = text.split(/([ |-])/g);
      let lines = [];
      let currentLine = "";
      const checkCurrentLine = (currentLine2) => {
        const lines2 = [];
        let leftover = "";
        if (calculateTextWidth(currentLine2, size) > lengthInPixel) {
          const currentWordRemainder = currentLine2.split("");
          let currentWord = "";
          while (currentWordRemainder.length > 0) {
            if (calculateTextWidth(currentWord, size) <= lengthInPixel) {
              currentWord += currentWordRemainder.shift();
            } else {
              lines2.push(currentWord);
              currentWord = "";
            }
          }
          if (currentWord !== "") {
            leftover = currentWord;
          }
        } else {
          lines2.push(currentLine2);
        }
        return { leftover, lines: lines2 };
      };
      while (remainder.length > 0) {
        const nextWord = remainder.shift();
        const separator = (_a = remainder.shift()) != null ? _a : "";
        if (calculateTextWidth(currentLine + nextWord + separator, size) <= lengthInPixel) {
          currentLine += nextWord + separator;
        } else {
          if (currentLine !== "") {
            const { leftover, lines: newLines } = checkCurrentLine(currentLine);
            lines.push(...newLines);
            currentLine = leftover + nextWord + separator;
          } else {
            currentLine = nextWord + separator;
          }
        }
      }
      if (currentLine !== "" && currentLine !== " ") {
        const { leftover, lines: newLines } = checkCurrentLine(currentLine);
        lines.push(...newLines);
        if (leftover !== "") {
          lines.push(leftover);
        }
      }
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        lines[lines.length - 1] = this._ellipsis(lines[lines.length - 1], lengthInPixel, size);
      }
      return lines;
    }
    _ellipsis(text, lengthInPixel, size) {
      let result = "";
      if (calculateTextWidth(text, size) > lengthInPixel) {
        for (let c = 0; c < text.length; c++) {
          if (calculateTextWidth(`${result}${text[c]}...`, size) <= lengthInPixel) {
            result += text[c];
          } else {
            break;
          }
        }
      } else {
        return text;
      }
      if (result.substr(-1) === " ") {
        result = result.slice(0, -1);
      }
      return `${result}...`;
    }
    _addRectangle(x, y, width, height) {
      const container = this.instance.addSVG(`${width}mm`, `${height}mm`);
      container.x(`${x}mm`).y(`${y}mm`);
      const length = 3;
      container.addLine("0mm", "0mm", `${length}mm`, "0mm").stroke(".75pt", "solid", "black");
      container.addLine(`${width - length}mm`, "0mm", `${width}mm`, "0mm").stroke(".75pt", "solid", "black");
      container.addLine(`${width}mm`, "0mm", `${width}mm`, `${length}mm`).stroke(".75pt", "solid", "black");
      container.addLine(`${width}mm`, `${height - length}mm`, `${width}mm`, `${height}mm`).stroke(".75pt", "solid", "black");
      container.addLine(`${width - length}mm`, `${height}mm`, `${width}mm`, `${height}mm`).stroke(".75pt", "solid", "black");
      container.addLine("0mm", `${height}mm`, `${length}mm`, `${height}mm`).stroke(".75pt", "solid", "black");
      container.addLine("0mm", `${height - length}mm`, "0mm", `${height}mm`).stroke(".75pt", "solid", "black");
      container.addLine("0mm", "0mm", "0mm", `${length}mm`).stroke(".75pt", "solid", "black");
      return container;
    }
  };
  return __toCommonJS(qr_entree_exports);
})();
if(typeof globalThis!=="undefined"){globalThis.SwissQRBill=QRFacture.SwissQRBill;}
