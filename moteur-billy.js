"use strict";
var Billy = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/swiss/dist/src/money.js
  var require_money = __commonJS({
    "packages/swiss/dist/src/money.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.toFrancs = exports.chf = void 0;
      exports.roundTo5Rappen = roundTo5Rappen;
      exports.formatChf = formatChf;
      var chf = (francs) => Math.round(francs * 100);
      exports.chf = chf;
      var toFrancs = (rappen) => rappen / 100;
      exports.toFrancs = toFrancs;
      function roundTo5Rappen(amount) {
        if (!Number.isInteger(amount)) {
          throw new Error(`roundTo5Rappen attend des centimes entiers, re\xE7u ${amount}`);
        }
        return Math.round(amount / 5) * 5;
      }
      function formatChf(rappen) {
        const sign = rappen < 0 ? "\u2212" : "";
        const abs = Math.abs(rappen);
        const francs = Math.trunc(abs / 100);
        const cents = String(abs % 100).padStart(2, "0");
        const grouped = francs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
        return `${sign}${grouped}.${cents}`;
      }
    }
  });

  // packages/swiss/dist/src/iban.js
  var require_iban = __commonJS({
    "packages/swiss/dist/src/iban.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.normalizeIban = normalizeIban;
      exports.isValidIban = isValidIban;
      exports.isSwissIban = isSwissIban;
      exports.isQrIban = isQrIban;
      function normalizeIban(input) {
        return input.replace(/\s+/g, "").toUpperCase();
      }
      function isValidIban(input) {
        const iban = normalizeIban(input);
        if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban))
          return false;
        const rearranged = iban.slice(4) + iban.slice(0, 4);
        let remainder = 0;
        for (const ch of rearranged) {
          const value = ch >= "0" && ch <= "9" ? ch : String(ch.charCodeAt(0) - 55);
          for (const digit of value) {
            remainder = (remainder * 10 + (digit.charCodeAt(0) - 48)) % 97;
          }
        }
        return remainder === 1;
      }
      function isSwissIban(input) {
        const iban = normalizeIban(input);
        return isValidIban(iban) && (iban.startsWith("CH") || iban.startsWith("LI"));
      }
      function isQrIban(input) {
        const iban = normalizeIban(input);
        if (!isSwissIban(iban))
          return false;
        const iid = Number(iban.slice(4, 9));
        return iid >= 3e4 && iid <= 31999;
      }
    }
  });

  // packages/swiss/dist/src/qrr.js
  var require_qrr = __commonJS({
    "packages/swiss/dist/src/qrr.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.mod10Recursive = mod10Recursive;
      exports.buildQrReference = buildQrReference;
      exports.isValidQrReference = isValidQrReference;
      exports.invoiceQrReference = invoiceQrReference;
      var CARRY_TABLE = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
      function mod10Recursive(digits) {
        if (!/^\d*$/.test(digits)) {
          throw new Error("mod10Recursive : chiffres uniquement");
        }
        let carry = 0;
        for (const ch of digits) {
          carry = CARRY_TABLE[(carry + (ch.charCodeAt(0) - 48)) % 10];
        }
        return (10 - carry) % 10;
      }
      function buildQrReference(base) {
        if (!/^\d{1,26}$/.test(base)) {
          throw new Error("buildQrReference : base de 1 \xE0 26 chiffres attendue");
        }
        const padded = base.padStart(26, "0");
        return padded + String(mod10Recursive(padded));
      }
      function isValidQrReference(ref) {
        return /^\d{27}$/.test(ref) && mod10Recursive(ref.slice(0, 26)) === Number(ref[26]);
      }
      function invoiceQrReference(opts) {
        const prefix = (opts.prefix ?? "").replace(/\D/g, "");
        if (!Number.isInteger(opts.seq) || opts.seq < 1 || opts.seq > 999999) {
          throw new Error("invoiceQrReference : s\xE9quence entre 1 et 999999");
        }
        const body = `${prefix}${opts.year}${String(opts.seq).padStart(6, "0")}`;
        if (body.length > 26) {
          throw new Error("invoiceQrReference : pr\xE9fixe trop long (max 26 chiffres au total)");
        }
        return buildQrReference(body);
      }
    }
  });

  // packages/swiss/dist/src/geocodage.js
  var require_geocodage = __commonJS({
    "packages/swiss/dist/src/geocodage.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.choisirLieuSuisse = choisirLieuSuisse;
      var RANG = ["address", "zipcode", "gg25", "district", "kantone"];
      var ORIGINES_LOCALITE = /* @__PURE__ */ new Set(["address", "zipcode", "gg25"]);
      function partieEnGras(label) {
        const m = label.match(/<b>([^]*?)<\/b>/);
        return (m ? m[1] : label).replace(/<[^>]*>/g, "").trim();
      }
      function extraireCanton(detail, label) {
        const mots = detail.trim().split(/\s+/);
        const dernier = mots[mots.length - 1] ?? "";
        if (/^[a-z]{2}$/i.test(dernier) && dernier.toLowerCase() !== "ch") {
          return dernier.toUpperCase();
        }
        const parentheses = label.match(/\(([A-Z]{2})\)/);
        return parentheses ? parentheses[1] : null;
      }
      function choisirLieuSuisse(resultats) {
        const valides = (resultats ?? []).filter((a) => typeof a?.lat === "number" && typeof a?.lon === "number");
        if (valides.length === 0)
          return null;
        const choisi = valides.slice().sort((a, b) => {
          const ra = RANG.indexOf(String(a.origin ?? ""));
          const rb = RANG.indexOf(String(b.origin ?? ""));
          return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb);
        })[0];
        const label = String(choisi.label ?? "");
        const detail = String(choisi.detail ?? "");
        const origine = String(choisi.origin ?? "") || null;
        const gras = partieEnGras(label);
        const avecNpa = gras.match(/^(\d{4})\s+(.+)$/);
        const nomBrut = avecNpa ? avecNpa[2] : gras;
        const nom = nomBrut.replace(/\s*\([A-Z]{2}\)\s*$/, "").trim();
        return {
          lat: Number(choisi.lat),
          lng: Number(choisi.lon),
          canton: extraireCanton(detail, label),
          npa: avecNpa ? avecNpa[1] : null,
          localite: origine && ORIGINES_LOCALITE.has(origine) && nom ? nom : null,
          origine
        };
      }
    }
  });

  // packages/swiss/dist/src/index.js
  var require_src = __commonJS({
    "packages/swiss/dist/src/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_money(), exports);
      __exportStar(require_iban(), exports);
      __exportStar(require_qrr(), exports);
      __exportStar(require_geocodage(), exports);
    }
  });

  // packages/domain/dist/src/pricing/types.js
  var require_types = __commonJS({
    "packages/domain/dist/src/pricing/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.MissingTariffError = void 0;
      var MissingTariffError = class extends Error {
        insectId;
        customerType;
        constructor(insectId, customerType) {
          super(`Aucun tarif de base pour l'insecte \xAB ${insectId} \xBB et le type de client \xAB ${customerType} \xBB \u2014 \xE0 r\xE9gler dans Param\xE8tres \u203A Tarifs`);
          this.insectId = insectId;
          this.customerType = customerType;
          this.name = "MissingTariffError";
        }
      };
      exports.MissingTariffError = MissingTariffError;
    }
  });

  // packages/domain/dist/src/pricing/engine.js
  var require_engine = __commonJS({
    "packages/domain/dist/src/pricing/engine.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.priceIntervention = priceIntervention;
      exports.computeTotals = computeTotals;
      var swiss_1 = require_src();
      var types_1 = require_types();
      function priceIntervention(ctx, baseTariffs, modifiers, insectLabels = {}) {
        const lines = [];
        let positiveSubtotal = 0;
        let totalNests = 0;
        for (const nest of ctx.nests) {
          const tariff = baseTariffs.find((t) => t.insectId === nest.insectId && t.customerType === ctx.customerType);
          if (!tariff)
            throw new types_1.MissingTariffError(nest.insectId, ctx.customerType);
          const qty = Math.max(1, Math.trunc(nest.quantity));
          totalNests += qty;
          const extra = tariff.extraNest ?? tariff.firstNest;
          const baseAmount = tariff.firstNest + extra * (qty - 1);
          const insect = insectLabels[nest.insectId] ?? nest.insectId;
          lines.push({
            kind: "prestation",
            label: `Destruction nid \u2014 ${insect} \xD7 ${qty}`,
            quantity: qty,
            unitPrice: tariff.firstNest,
            amount: baseAmount
          });
          let groupSubtotal = baseAmount;
          const targets = new Set([nest.locationId, nest.heightId].filter((x) => !!x));
          const applicable = modifiers.filter((m) => m.isActive !== false && targets.has(m.listItemId) && (m.insectId == null || m.insectId === nest.insectId) && (m.customerType == null || m.customerType === ctx.customerType));
          const candidates = [];
          for (const m of applicable) {
            if (m.kind === "montant") {
              const quantity = m.per === "nid" ? qty : 1;
              const amount = m.value * quantity;
              candidates.push({
                amount,
                line: { kind: "majoration", label: m.label, quantity, unitPrice: m.value, amount }
              });
            } else {
              const amount = Math.round(baseAmount * m.value / 100);
              candidates.push({
                amount,
                line: {
                  kind: "majoration",
                  label: `${m.label} (+${m.value} %)`,
                  quantity: 1,
                  unitPrice: amount,
                  amount
                }
              });
            }
          }
          const selected = (ctx.modifierCombination ?? "plus_elevee") === "plus_elevee" && candidates.length > 1 ? [candidates.reduce((best, c) => c.amount > best.amount ? c : best)] : candidates;
          for (const s of selected) {
            lines.push(s.line);
            groupSubtotal += s.amount;
          }
          if (tariff.minimum != null && groupSubtotal < tariff.minimum) {
            const diff = tariff.minimum - groupSubtotal;
            lines.push({
              kind: "prestation",
              label: "Compl\xE9ment forfait minimum",
              quantity: 1,
              unitPrice: diff,
              amount: diff
            });
            groupSubtotal = tariff.minimum;
          }
          positiveSubtotal += groupSubtotal;
        }
        if (ctx.travelFee != null && ctx.travelFee > 0) {
          lines.push({
            kind: "deplacement",
            label: ctx.travelFeeLabel ? `Frais de d\xE9placement \u2014 ${ctx.travelFeeLabel}` : "Frais de d\xE9placement",
            quantity: 1,
            unitPrice: ctx.travelFee,
            amount: ctx.travelFee
          });
          positiveSubtotal += ctx.travelFee;
        }
        if (ctx.municipalitySubsidyPerNest != null && ctx.municipalitySubsidyPerNest > 0) {
          const raw = ctx.municipalitySubsidyPerNest * totalNests;
          const capped = Math.min(raw, positiveSubtotal);
          if (capped > 0) {
            lines.push({
              kind: "aide_communale",
              label: `Aide communale (${totalNests} nid${totalNests > 1 ? "s" : ""})`,
              quantity: totalNests,
              unitPrice: -ctx.municipalitySubsidyPerNest,
              amount: -capped
            });
          }
        }
        return lines;
      }
      function computeTotals(lines, vatRatePct, opts = {}) {
        const mode = opts.mode ?? "exclus";
        const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
        let vat;
        let beforeRounding;
        if (opts.exempt) {
          vat = 0;
          beforeRounding = subtotal;
        } else if (mode === "inclus") {
          vat = Math.round(subtotal * vatRatePct / (100 + vatRatePct));
          beforeRounding = subtotal;
        } else {
          vat = Math.round(subtotal * vatRatePct / 100);
          beforeRounding = subtotal + vat;
        }
        const total = (0, swiss_1.roundTo5Rappen)(beforeRounding);
        return { subtotal, vat, beforeRounding, rounding: total - beforeRounding, total, mode };
      }
    }
  });

  // packages/domain/dist/src/pricing/rules.js
  var require_rules = __commonJS({
    "packages/domain/dist/src/pricing/rules.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.NoMatchingRuleError = void 0;
      exports.isRangeCondition = isRangeCondition;
      exports.ruleMatches = ruleMatches;
      exports.rulesOfRole = rulesOfRole;
      exports.detectRulesInatteignables = detectRulesInatteignables;
      exports.rangerParPrecision = rangerParPrecision;
      exports.aUnFiletDeSecurite = aUnFiletDeSecurite;
      exports.tarifsCandidats = tarifsCandidats;
      exports.fourchetteTarifs = fourchetteTarifs;
      exports.fourchetteIntervention = fourchetteIntervention;
      function isRangeCondition(c) {
        return c.critere === "duree" || c.critere === "distance" || c.critere === "quantite";
      }
      function factForRange(c, f) {
        if (c === "quantite")
          return f.quantite;
        if (c === "duree")
          return f.dureeMin;
        return f.distanceKm;
      }
      function factForList(c, f) {
        switch (c) {
          case "insecte":
            return f.insectId;
          case "localisation":
            return f.locationId;
          case "hauteur":
            return f.heightId;
          case "type_client":
            return f.customerType;
        }
      }
      function conditionMatches(cond, facts) {
        if (isRangeCondition(cond)) {
          if (cond.min == null && cond.max == null)
            return true;
          const v2 = factForRange(cond.critere, facts);
          if (v2 == null)
            return false;
          if (cond.min != null && v2 < cond.min)
            return false;
          if (cond.max != null && v2 > cond.max)
            return false;
          return true;
        }
        if (cond.valeurs.length === 0)
          return true;
        const v = factForList(cond.critere, facts);
        return v != null && cond.valeurs.includes(v);
      }
      function ruleMatches(rule, facts) {
        if (rule.isActive === false)
          return false;
        return rule.conditions.every((c) => conditionMatches(c, facts));
      }
      function rulesOfRole(rules, role) {
        return rules.filter((r) => r.role === role && r.isActive !== false).sort((a, b) => a.sort - b.sort);
      }
      function conditionCovers(large, precise) {
        const same = precise.find((p) => p.critere === large.critere);
        if (!same)
          return false;
        if (isRangeCondition(large)) {
          if (!isRangeCondition(same))
            return false;
          const minOk = large.min == null || same.min != null && same.min >= large.min;
          const maxOk = large.max == null || same.max != null && same.max <= large.max;
          return minOk && maxOk;
        }
        if (isRangeCondition(same))
          return false;
        if (large.valeurs.length === 0)
          return true;
        if (same.valeurs.length === 0)
          return false;
        return same.valeurs.every((v) => large.valeurs.includes(v));
      }
      function detectRulesInatteignables(rules) {
        const base = rulesOfRole(rules, "base");
        const out = [];
        for (let i = 0; i < base.length; i++) {
          for (let j = 0; j < i; j++) {
            const large = base[j];
            if (large.conditions.every((c) => conditionCovers(c, base[i].conditions))) {
              out.push({ rule: base[i], masqueePar: large });
              break;
            }
          }
        }
        return out;
      }
      function rangerParPrecision(rules) {
        const base = rulesOfRole(rules, "base");
        const autres = rules.filter((r) => !base.includes(r));
        const trie = [...base].sort((a, b) => {
          const d = b.conditions.length - a.conditions.length;
          return d !== 0 ? d : a.sort - b.sort;
        });
        return [...trie.map((r, i) => ({ ...r, sort: i })), ...autres];
      }
      function conditionNeutre(c) {
        return isRangeCondition(c) ? c.min == null && c.max == null : c.valeurs.length === 0;
      }
      function aUnFiletDeSecurite(rules) {
        return rulesOfRole(rules, "base").some((r) => r.conditions.every(conditionNeutre));
      }
      function contreditParFaitsConnus(cond, facts, incertains) {
        if (incertains.includes(cond.critere))
          return false;
        if (isRangeCondition(cond)) {
          const v2 = factForRange(cond.critere, facts);
          if (v2 == null)
            return false;
          if (cond.min != null && v2 < cond.min)
            return true;
          if (cond.max != null && v2 > cond.max)
            return true;
          return false;
        }
        if (cond.valeurs.length === 0)
          return false;
        const v = factForList(cond.critere, facts);
        if (v == null)
          return false;
        return !cond.valeurs.includes(v);
      }
      function tarifsCandidats(rules, facts, incertains = ["hauteur", "localisation"]) {
        const complet = {
          customerType: facts.customerType,
          insectId: facts.insectId,
          locationId: facts.locationId,
          heightId: facts.heightId,
          quantite: facts.quantite ?? 1,
          dureeMin: facts.dureeMin,
          distanceKm: facts.distanceKm
        };
        const out = [];
        for (const rule of rulesOfRole(rules, "base")) {
          if (rule.conditions.some((c) => contreditParFaitsConnus(c, facts, incertains))) {
            continue;
          }
          out.push({
            rule,
            probable: ruleMatches(rule, complet),
            conditionsIncertaines: rule.conditions.filter((c) => incertains.includes(c.critere))
          });
        }
        return out;
      }
      function fourchetteTarifs(rules, facts, incertains) {
        const prix = tarifsCandidats(rules, facts, incertains).filter((c) => c.rule.calc === "fixe").map((c) => c.rule.value);
        if (prix.length === 0)
          return null;
        const min = Math.min(...prix);
        const max = Math.max(...prix);
        return { min, max, unique: min === max };
      }
      function fourchetteIntervention(rules, customerType, nids, incertains) {
        if (nids.length === 0)
          return null;
        let min = 0;
        let max = 0;
        for (const nid of nids) {
          const f = fourchetteTarifs(rules, { ...nid, customerType }, incertains);
          if (!f)
            return null;
          const qty = Math.max(1, nid.quantite ?? 1);
          min += f.min * qty;
          max += f.max * qty;
        }
        return { min, max, unique: min === max };
      }
      var NoMatchingRuleError = class extends Error {
        facts;
        constructor(facts) {
          super("Aucune r\xE8gle de tarification ne correspond \xE0 cette intervention. Ajoutez une r\xE8gle sans condition en bas de votre grille : elle servira de filet de s\xE9curit\xE9 \u2014 Param\xE8tres \u203A Tarifs.");
          this.facts = facts;
          this.name = "NoMatchingRuleError";
        }
      };
      exports.NoMatchingRuleError = NoMatchingRuleError;
    }
  });

  // packages/domain/dist/src/pricing/engine-rules.js
  var require_engine_rules = __commonJS({
    "packages/domain/dist/src/pricing/engine-rules.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.priceInterventionFromRules = priceInterventionFromRules;
      exports.simuler = simuler;
      var rules_1 = require_rules();
      function tranches(valeur, taille) {
        if (taille <= 0)
          return 1;
        return Math.max(1, Math.ceil(valeur / taille));
      }
      function grandeur(rule, facts) {
        switch (rule.mesure) {
          case "duree":
            return facts.dureeMin ?? 0;
          case "distance":
            return facts.distanceKm ?? 0;
          default:
            return facts.quantite;
        }
      }
      function montantDeLaRegle(rule, facts, base) {
        if (rule.calc === "pourcent") {
          const amount2 = Math.round(base * rule.value / 100);
          return { amount: amount2, quantity: 1, unitPrice: amount2, suffixe: ` (+${rule.value} %)` };
        }
        if (rule.calc === "par_tranche") {
          const n = tranches(grandeur(rule, facts), rule.tailleTranche ?? 1);
          return { amount: rule.value * n, quantity: n, unitPrice: rule.value, suffixe: "" };
        }
        if (rule.per === "intervention") {
          return { amount: rule.value, quantity: 1, unitPrice: rule.value, suffixe: "" };
        }
        const qty = facts.quantite;
        const suivants = rule.valueSuivants ?? rule.value;
        const amount = rule.value + suivants * (qty - 1);
        return { amount, quantity: qty, unitPrice: rule.value, suffixe: "" };
      }
      function priceInterventionFromRules(ctx, rules) {
        const lines = [];
        const base = (0, rules_1.rulesOfRole)(rules, "base");
        const supplements = (0, rules_1.rulesOfRole)(rules, "supplement");
        let positiveSubtotal = 0;
        let totalNests = 0;
        const prixUnitaires = [];
        for (const nest of ctx.nests) {
          const qty = Math.max(1, Math.trunc(nest.quantity));
          totalNests += qty;
          const facts = {
            customerType: ctx.customerType,
            insectId: nest.insectId,
            locationId: nest.locationId,
            heightId: nest.heightId,
            quantite: qty,
            dureeMin: ctx.dureeMin,
            distanceKm: ctx.distanceKm
          };
          const regle = nest.chosenRuleId && base.find((r) => r.id === nest.chosenRuleId) || base.find((r) => (0, rules_1.ruleMatches)(r, facts));
          if (!regle)
            throw new rules_1.NoMatchingRuleError(facts);
          const b = montantDeLaRegle(regle, facts, 0);
          lines.push({
            kind: "prestation",
            label: nest.detail?.trim() ? `${regle.label} \u2014 ${nest.detail.trim()}` : regle.label,
            quantity: b.quantity,
            unitPrice: b.unitPrice,
            amount: b.amount
          });
          let groupSubtotal = b.amount;
          const candidates = supplements.filter((r) => (0, rules_1.ruleMatches)(r, facts)).map((r) => {
            const m = montantDeLaRegle(r, facts, b.amount);
            return {
              amount: m.amount,
              line: {
                kind: "majoration",
                label: `${r.label}${m.suffixe}`,
                quantity: m.quantity,
                unitPrice: m.unitPrice,
                amount: m.amount
              }
            };
          });
          const retenus = (ctx.modifierCombination ?? "plus_elevee") === "plus_elevee" && candidates.length > 1 ? [candidates.reduce((meilleur, c) => c.amount > meilleur.amount ? c : meilleur)] : candidates;
          for (const s of retenus) {
            lines.push(s.line);
            groupSubtotal += s.amount;
          }
          if (regle.minimum != null && groupSubtotal < regle.minimum) {
            const diff = regle.minimum - groupSubtotal;
            lines.push({
              kind: "prestation",
              label: "Compl\xE9ment forfait minimum",
              quantity: 1,
              unitPrice: diff,
              amount: diff
            });
            groupSubtotal = regle.minimum;
          }
          for (let k = 0; k < b.quantity; k++) {
            prixUnitaires.push(k === 0 ? b.unitPrice : regle.valueSuivants ?? b.unitPrice);
          }
          positiveSubtotal += groupSubtotal;
        }
        if (ctx.degressivite && prixUnitaires.length > 1) {
          const d = ctx.degressivite;
          const rang = Math.max(2, d.aPartirDu ?? 2);
          const tries = [...prixUnitaires].sort((a, z) => z - a);
          const concernes = tries.slice(rang - 1);
          let remise = 0;
          for (const prix of concernes) {
            const r = d.type === "pourcent" ? Math.round(prix * d.valeur / 100) : d.valeur;
            remise += Math.min(r, prix);
          }
          if (remise > 0) {
            const suffixe = d.type === "pourcent" ? ` (\u2212${d.valeur} %)` : "";
            lines.push({
              kind: "majoration",
              label: `${d.label ?? "Remise nids suppl\xE9mentaires"}${suffixe}`,
              quantity: concernes.length,
              unitPrice: -Math.round(remise / concernes.length),
              amount: -remise
            });
            positiveSubtotal -= remise;
          }
        }
        if (ctx.prixConvenu) {
          const ecart = ctx.prixConvenu.total - positiveSubtotal;
          if (ecart !== 0) {
            lines.push({
              kind: "prestation",
              label: ctx.prixConvenu.motif?.trim() ? `Prix convenu \u2014 ${ctx.prixConvenu.motif.trim()}` : "Prix convenu",
              quantity: 1,
              unitPrice: ecart,
              amount: ecart
            });
            positiveSubtotal = ctx.prixConvenu.total;
          }
        }
        for (const sup of ctx.supplementsPonctuels ?? []) {
          if (!sup.amount)
            continue;
          lines.push({
            kind: "prestation",
            label: sup.label,
            quantity: 1,
            unitPrice: sup.amount,
            amount: sup.amount
          });
          positiveSubtotal += sup.amount;
        }
        if (ctx.travelFee != null && ctx.travelFee > 0) {
          lines.push({
            kind: "deplacement",
            label: ctx.travelFeeLabel ? `Frais de d\xE9placement \u2014 ${ctx.travelFeeLabel}` : "Frais de d\xE9placement",
            quantity: 1,
            unitPrice: ctx.travelFee,
            amount: ctx.travelFee
          });
          positiveSubtotal += ctx.travelFee;
        }
        if (ctx.municipalitySubsidyPerNest != null && ctx.municipalitySubsidyPerNest > 0) {
          const brut = ctx.municipalitySubsidyPerNest * totalNests;
          const plafonne = Math.min(brut, positiveSubtotal);
          if (plafonne > 0) {
            lines.push({
              kind: "aide_communale",
              label: `Aide communale (${totalNests} nid${totalNests > 1 ? "s" : ""})`,
              quantity: totalNests,
              unitPrice: -ctx.municipalitySubsidyPerNest,
              amount: -plafonne
            });
          }
        }
        return lines;
      }
      function simuler(ctx, rules) {
        try {
          const lines = priceInterventionFromRules(ctx, rules);
          return {
            lines,
            total: lines.reduce((s, l) => s + l.amount, 0),
            regleRetenue: lines.find((l) => l.kind === "prestation")?.label
          };
        } catch (e) {
          return { lines: [], total: 0, erreur: e.message };
        }
      }
    }
  });

  // packages/domain/dist/src/pricing/travel.js
  var require_travel = __commonJS({
    "packages/domain/dist/src/pricing/travel.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.computeTravelFee = computeTravelFee;
      var swiss_1 = require_src();
      function computeTravelFee(config, distanceKm, forcedZoneId, canton) {
        const zones = [...config.zones ?? []].sort((a, b) => (b.fromKm ?? 0) - (a.fromKm ?? 0));
        if (forcedZoneId) {
          const forced = zones.find((z) => z.id === forcedZoneId);
          if (forced) {
            return {
              amount: (0, swiss_1.chf)(forced.amount),
              label: forced.label,
              zoneId: forced.id
            };
          }
        }
        switch (config.mode) {
          case "par_km": {
            const rate = config.chfKm ?? 0;
            if (!rate || distanceKm == null) {
              return fallbackFixed(config);
            }
            const franchise = config.franchiseKm ?? 0;
            const billableOneWay = Math.max(distanceKm - franchise, 0);
            const billable = config.allerRetour ? billableOneWay * 2 : billableOneWay;
            if (billable <= 0)
              return null;
            const rounded = Math.round(billable * 10) / 10;
            const trip = config.allerRetour ? "aller-retour" : "aller simple";
            return {
              amount: (0, swiss_1.chf)(rounded * rate),
              label: `${rounded} km ${trip} \xD7 ${rate.toFixed(2)} CHF/km`
            };
          }
          case "zones": {
            if (distanceKm == null)
              return fallbackFixed(config);
            const zone = zones.find((z) => distanceKm >= (z.fromKm ?? 0));
            if (!zone)
              return fallbackFixed(config);
            return {
              amount: (0, swiss_1.chf)(zone.amount),
              label: `${zone.label} (${distanceKm} km)`,
              zoneId: zone.id
            };
          }
          case "cantons": {
            const cible = (canton ?? "").trim().toUpperCase();
            const trouve = (config.cantons ?? []).find((x) => x.canton.trim().toUpperCase() === cible);
            if (!trouve)
              return fallbackFixed(config);
            if (!trouve.amount)
              return null;
            return {
              amount: (0, swiss_1.chf)(trouve.amount),
              label: `Deplacement canton ${trouve.canton}`
            };
          }
          case "fixe":
          default:
            return fallbackFixed(config);
        }
      }
      function fallbackFixed(config) {
        const montant = config.montant ?? 0;
        if (!montant)
          return null;
        return { amount: (0, swiss_1.chf)(montant), label: "" };
      }
    }
  });

  // packages/domain/dist/src/pricing/subsidies.js
  var require_subsidies = __commonJS({
    "packages/domain/dist/src/pricing/subsidies.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.computeSubsidies = computeSubsidies;
      var swiss_1 = require_src();
      function matches(rule, ctx) {
        if (rule.alwaysApplies) {
          if (rule.insectIds.length > 0) {
            return ctx.nests.some((n) => rule.insectIds.includes(n.insectId));
          }
          return true;
        }
        if (rule.npaCodes.length > 0) {
          if (!ctx.npa || !rule.npaCodes.includes(ctx.npa))
            return false;
        }
        if (rule.canton) {
          if (!ctx.canton || ctx.canton.toUpperCase() !== rule.canton.toUpperCase()) {
            return false;
          }
        }
        if (rule.npaCodes.length === 0 && !rule.canton)
          return false;
        if (rule.insectIds.length > 0) {
          const concerned = ctx.nests.some((n) => rule.insectIds.includes(n.insectId));
          if (!concerned)
            return false;
        }
        return true;
      }
      function nestsFor(rule, ctx) {
        const eligible = rule.insectIds.length === 0 ? ctx.nests : ctx.nests.filter((n) => rule.insectIds.includes(n.insectId));
        return eligible.reduce((sum, n) => sum + n.quantity, 0);
      }
      function rawAmount(rule, ctx, nests) {
        switch (rule.amountType) {
          case "par_nid":
            return (0, swiss_1.chf)(rule.amount) * nests;
          case "par_intervention":
            return (0, swiss_1.chf)(rule.amount);
          case "pourcent":
            return Math.round(ctx.subtotal * rule.amount / 100);
        }
      }
      function computeSubsidies(rules, ctx) {
        const applicable = [];
        for (const rule of rules) {
          if (!matches(rule, ctx))
            continue;
          const nests = nestsFor(rule, ctx);
          if (nests === 0 && rule.amountType === "par_nid")
            continue;
          let amount = rawAmount(rule, ctx, nests);
          if (rule.maxAmount != null) {
            amount = Math.min(amount, (0, swiss_1.chf)(rule.maxAmount));
          }
          if (amount > 0)
            applicable.push({ rule, amount, nests });
        }
        const cumulatives = applicable.filter((a) => a.rule.cumulative);
        const exclusives = applicable.filter((a) => !a.rule.cumulative);
        const bestExclusive = exclusives.length ? [exclusives.reduce((best, a) => a.amount > best.amount ? a : best)] : [];
        const retained = [...cumulatives, ...bestExclusive];
        const deducted = [];
        const informational = [];
        let remaining = ctx.subtotal;
        for (const a of retained) {
          if (a.rule.mode === "remboursee") {
            informational.push(a);
            continue;
          }
          const capped = Math.min(a.amount, remaining);
          if (capped > 0) {
            deducted.push({ ...a, amount: capped });
            remaining -= capped;
          }
        }
        return { deducted, informational };
      }
    }
  });

  // packages/domain/dist/src/ids.js
  var require_ids = __commonJS({
    "packages/domain/dist/src/ids.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.uuidv7 = uuidv7;
      function randomBytes16() {
        const bytes = new Uint8Array(16);
        const g = globalThis;
        if (g.crypto?.getRandomValues) {
          g.crypto.getRandomValues(bytes);
          return bytes;
        }
        for (let i = 0; i < 16; i++)
          bytes[i] = Math.floor(Math.random() * 256);
        return bytes;
      }
      function uuidv7(at = Date.now()) {
        const bytes = randomBytes16();
        let ts = BigInt(at);
        for (let i = 5; i >= 0; i--) {
          bytes[i] = Number(ts & 0xffn);
          ts >>= 8n;
        }
        bytes[6] = bytes[6] & 15 | 112;
        bytes[8] = bytes[8] & 63 | 128;
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }
    }
  });

  // packages/domain/dist/src/index.js
  var require_src2 = __commonJS({
    "packages/domain/dist/src/index.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_types(), exports);
      __exportStar(require_engine(), exports);
      __exportStar(require_rules(), exports);
      __exportStar(require_engine_rules(), exports);
      __exportStar(require_travel(), exports);
      __exportStar(require_subsidies(), exports);
      __exportStar(require_ids(), exports);
    }
  });

  // packages/domain/entree-navigateur.ts
  var entree_navigateur_exports = {};
  __reExport(entree_navigateur_exports, __toESM(require_src()));
  __reExport(entree_navigateur_exports, __toESM(require_src2()));
  return __toCommonJS(entree_navigateur_exports);
})();
if(typeof globalThis!=="undefined"){globalThis.Billy=Billy;}
