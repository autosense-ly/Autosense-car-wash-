import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");
const TRANSLATIONS = path.resolve("src/lib/i18n/translations.ts");

const EXTENSIONS = new Set([".tsx", ".ts"]);
const IGNORE_DIRS = new Set(["node_modules", ".next"]);

const findings = [];
const ignored = {
  expressions: 0,
  technical: 0,
  brand: 0,
};

const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
    } else if (
      EXTENSIONS.has(path.extname(entry.name)) &&
      full !== TRANSLATIONS
    ) {
      files.push(full);
    }
  }
}

function isTranslationExpression(value) {
  const text = value.trim();

  return (
    text.startsWith("=") ||
    text.includes("&&") ||
    text.includes("||") ||
    text.includes("?.") ||
    text.includes("=>") ||
    text.includes("t.") ||
    text.includes("translations[") ||
    text.includes("className") ||
    text.includes("VariantProps")
  );
}

function isTechnical(value) {
  const text = value.trim();

  if (!text) return true;
  if (/^https?:\/\//i.test(text)) return true;
  if (/^#[0-9a-f]{3,8}$/i.test(text)) return true;

  if (
    /^[a-zA-Z0-9_./:@-]+$/.test(text) &&
    !text.includes(" ")
  ) {
    return true;
  }

  if (
    text.includes("{") ||
    text.includes("}") ||
    text.includes("<") ||
    text.includes(">") ||
    text.includes("=>")
  ) {
    return true;
  }

  return false;
}

function addFinding(file, line, value, reason) {
  const text = value.trim();

  if (!text || text.length < 2) return;

  if (isTranslationExpression(text)) {
    ignored.expressions++;
    return;
  }

  if (text === "AF Car Wash") {
    ignored.brand++;
    return;
  }

  if (isTechnical(text)) {
    ignored.technical++;
    return;
  }

  findings.push({
    file: path.relative(process.cwd(), file),
    line,
    text,
    reason,
  });
}

function auditFile(file) {
  const source = fs.readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);

  lines.forEach((lineText, index) => {
    const line = index + 1;

    const jsxRegex = />\s*([^<>{}\n]+?)\s*</g;

    let jsxMatch;
    while ((jsxMatch = jsxRegex.exec(lineText)) !== null) {
      addFinding(
        file,
        line,
        jsxMatch[1],
        "JSX text"
      );
    }

    const attrRegex =
      /\b(placeholder|title|aria-label|alt)\s*=\s*["']([^"']+)["']/g;

    let attrMatch;
    while ((attrMatch = attrRegex.exec(lineText)) !== null) {
      addFinding(
        file,
        line,
        attrMatch[2],
        `${attrMatch[1]} attribute`
      );
    }

    const messageRegex =
      /\b(?:toast|alert)\s*\(\s*["'`]([^"'`]+)["'`]/g;

    let messageMatch;
    while ((messageMatch = messageRegex.exec(lineText)) !== null) {
      addFinding(
        file,
        line,
        messageMatch[1],
        "message"
      );
    }
  });
}

function extractObject(source, objectName) {
  const startMatch = new RegExp(
    `\\b${objectName}\\s*:\\s*\\{`
  ).exec(source);

  if (!startMatch) return null;

  const start = startMatch.index + startMatch[0].length - 1;

  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === stringChar) {
        inString = false;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;

      if (depth === 0) {
        return source.slice(start + 1, i);
      }
    }
  }

  return null;
}

function extractSectionKeys(source) {
  const sections = new Map();

  const sectionRegex =
    /^\s{4}([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*\{/gm;

  let match;

  while ((match = sectionRegex.exec(source)) !== null) {
    const sectionName = match[1];
    const sectionStart = match.index + match[0].length - 1;

    let depth = 0;
    let inString = false;
    let stringChar = "";
    let escaped = false;

    for (let i = sectionStart; i < source.length; i++) {
      const char = source[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (char === stringChar) {
          inString = false;
        }

        continue;
      }

      if (char === '"' || char === "'" || char === "`") {
        inString = true;
        stringChar = char;
        continue;
      }

      if (char === "{") {
        depth++;
      } else if (char === "}") {
        depth--;

        if (depth === 0) {
          const body = source.slice(sectionStart + 1, i);

          const keys = new Set();

          const keyRegex =
            /^\s{6}([A-Za-z_$][A-Za-z0-9_$]*)\s*:/gm;

          let keyMatch;

          while ((keyMatch = keyRegex.exec(body)) !== null) {
            keys.add(keyMatch[1]);
          }

          sections.set(sectionName, keys);
          break;
        }
      }
    }
  }

  return sections;
}

function compareTranslations(source) {
  const english = extractObject(source, "en");
  const arabic = extractObject(source, "ar");

  if (!english || !arabic) {
    return {
      englishSections: new Map(),
      arabicSections: new Map(),
      missingArabic: [],
      missingEnglish: [],
      parseFailed: true,
    };
  }

  const englishSections = extractSectionKeys(english);
  const arabicSections = extractSectionKeys(arabic);

  const missingArabic = [];
  const missingEnglish = [];

  for (const [section, keys] of englishSections) {
    const arabicKeys = arabicSections.get(section) ?? new Set();

    for (const key of keys) {
      if (!arabicKeys.has(key)) {
        missingArabic.push(`${section}.${key}`);
      }
    }
  }

  for (const [section, keys] of arabicSections) {
    const englishKeys = englishSections.get(section) ?? new Set();

    for (const key of keys) {
      if (!englishKeys.has(key)) {
        missingEnglish.push(`${section}.${key}`);
      }
    }
  }

  return {
    englishSections,
    arabicSections,
    missingArabic,
    missingEnglish,
    parseFailed: false,
  };
}

walk(ROOT);

for (const file of files) {
  auditFile(file);
}

const grouped = new Map();

for (const finding of findings) {
  if (!grouped.has(finding.file)) {
    grouped.set(finding.file, []);
  }

  grouped.get(finding.file).push(finding);
}

const translationSource = fs.readFileSync(
  TRANSLATIONS,
  "utf8"
);

const coverage = compareTranslations(translationSource);

const englishSectionCount = coverage.englishSections.size;
const arabicSectionCount = coverage.arabicSections.size;

const englishKeyCount = [...coverage.englishSections.values()]
  .reduce((total, keys) => total + keys.size, 0);

const arabicKeyCount = [...coverage.arabicSections.values()]
  .reduce((total, keys) => total + keys.size, 0);

console.log("");
console.log("AF Car Wash — i18n Audit");
console.log("========================");
console.log("");

console.log(`Files scanned: ${files.length}`);
console.log(`Real UI candidates: ${findings.length}`);
console.log("");

console.log("Translation coverage");
console.log("--------------------");

if (coverage.parseFailed) {
  console.log("❌ Could not parse translations.ts");
} else {
  console.log(
    `English sections: ${englishSectionCount}`
  );
  console.log(
    `Arabic sections:  ${arabicSectionCount}`
  );
  console.log(
    `English keys:     ${englishKeyCount}`
  );
  console.log(
    `Arabic keys:      ${arabicKeyCount}`
  );
  console.log(
    `Missing Arabic:   ${coverage.missingArabic.length}`
  );
  console.log(
    `Missing English:  ${coverage.missingEnglish.length}`
  );

  if (coverage.missingArabic.length) {
    console.log("");
    console.log("⚠️ Missing Arabic keys:");

    for (const key of coverage.missingArabic) {
      console.log(`  - ${key}`);
    }
  }

  if (coverage.missingEnglish.length) {
    console.log("");
    console.log("⚠️ Missing English keys:");

    for (const key of coverage.missingEnglish) {
      console.log(`  - ${key}`);
    }
  }
}

console.log("");

if (findings.length) {
  for (const [file, items] of grouped) {
    console.log(`📄 ${file}`);

    for (const item of items) {
      console.log(
        `  ${item.line}: "${item.text}" [${item.reason}]`
      );
    }

    console.log("");
  }
}

console.log("Ignored / filtered:");
console.log(`  JSX/code expressions: ${ignored.expressions}`);
console.log(`  Technical values: ${ignored.technical}`);
console.log(`  Brand names: ${ignored.brand}`);
console.log("");

console.log(
  "⚠️ Findings are candidates for review, not automatic errors."
);
console.log("");
