#!/usr/bin/env node
/**
 * Design Lang — CLI
 * Usage: dl compile <input.dl> [options]
 *        dl watch <input.dl>   (watch mode, coming soon)
 *        dl init               (scaffold a new project)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const parser = require('./src/parser');
const DesignLangCompiler = require('./src/compiler');

const pkg = require('./package.json');

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log(`Design Lang v${pkg.version}`);
    return;
  }

  if (command === 'compile' || command === 'c') {
    const inputFile = args[1];
    if (!inputFile) {
      console.error('❌ Usage: dl compile <input.dl>');
      process.exit(1);
    }
    compileFile(inputFile, args.slice(2));
    return;
  }

  if (command === 'init') {
    initProject();
    return;
  }

  console.error(`❌ Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

function compileFile(inputFile, options) {
  const inputPath = path.resolve(inputFile);
  const baseName = path.basename(inputFile, path.extname(inputFile));
  const outputDir = path.dirname(inputPath);

  // Parse options
  const opts = {
    output: null,
    watch: false,
    minify: false
  };

  for (let i = 0; i < options.length; i++) {
    if (options[i] === '--output' || options[i] === '-o') {
      opts.output = options[++i];
    }
    if (options[i] === '--watch' || options[i] === '-w') {
      opts.watch = true;
    }
    if (options[i] === '--minify' || options[i] === '-m') {
      opts.minify = true;
    }
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }

  const source = fs.readFileSync(inputPath, 'utf8');

  try {
    const ast = parser.parse(source);
    const compiler = new DesignLangCompiler({ prettify: !opts.minify });
    const result = compiler.compile(ast);

    const outBase = opts.output || path.join(outputDir, baseName);

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(outBase), { recursive: true });

    // Write CSS
    fs.writeFileSync(`${outBase}.css`, result.css, 'utf8');
    console.log(`  ✅ ${outBase}.css`);

    // Write JS if not empty
    if (result.js) {
      fs.writeFileSync(`${outBase}.runtime.js`, result.js, 'utf8');
      console.log(`  ✅ ${outBase}.runtime.js`);
    }

    // Write HTML preview
    const html = buildPreviewPage(ast, result);
    fs.writeFileSync(`${outBase}.html`, html, 'utf8');
    console.log(`  ✅ ${outBase}.html (preview)`);

    console.log(`\n✨ Compiled ${inputFile} → ${outBase}.{css,runtime.js,html}`);

    // Print stats
    const elementCount = ast.elements.length;
    const propCount = ast.elements.reduce((sum, el) => sum + el.properties.length, 0);
    console.log(`   ${elementCount} element(s), ${propCount} properties`);

  } catch (err) {
    console.error(`\n❌ Compilation failed:`);
    console.error(`   ${err.message}`);
    if (err.location) {
      const loc = err.location.start;
      console.error(`   At line ${loc.line}, column ${loc.column}`);
      // Print context
      const lines = source.split('\n');
      for (let i = Math.max(0, loc.line - 2); i < Math.min(lines.length, loc.line + 1); i++) {
        const marker = i === loc.line - 1 ? '→ ' : '  ';
        console.error(`   ${marker}${lines[i]}`);
      }
    }
    process.exit(1);
  }
}

function buildPreviewPage(ast, compiled) {
  const elementNames = ast.elements.map(e => e.name).join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Design Lang — Compiled Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=JetBrains+Mono:wght@400..700&family=Space+Grotesk:wght@400..700&display=swap" rel="stylesheet">
<style>
  /* Design System */
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',system-ui,sans-serif;background:#05080e;color:#f1f5f9;padding:40px;display:flex;flex-direction:column;align-items:center;gap:40px;min-height:100vh}
  h1{font-family:'Space Grotesk',sans-serif;font-size:1.8rem;font-weight:600;letter-spacing:-0.02em}
  .sub{color:#64748b;font-size:0.9rem}
  .preview-grid{display:flex;flex-wrap:wrap;gap:32px;justify-content:center;align-items:center;max-width:1200px;width:100%}
  .component-slot{display:flex;flex-direction:column;align-items:center;gap:8px}
  .component-slot .label{font-size:0.7rem;color:#64748b;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:0.06em}
  dl,ol,ul,p,pre{max-width:800px}
  pre{background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;font-family:'JetBrains Mono',monospace;font-size:0.8rem;line-height:1.6;overflow-x:auto;color:#94a3b8;width:100%}
  pre .kw{color:#06b6d4}
  pre .fn{color:#c084fc}
  pre .str{color:#34d399}
  pre .num{color:#fbbf24}
  pre .cm{color:#475569;font-style:italic}
  pre .pr{color:#f472b6}
  hr{border:none;height:1px;background:linear-gradient(90deg,transparent,rgba(6,182,212,0.2),transparent);width:100%;max-width:400px;margin:20px 0}

  /* Compiled CSS */
${compiled.css.split('\n').filter(l => !l.startsWith('/*')).join('\n')}
</style>
</head>
<body>
  <h1>Design Lang ✦ Compiled Preview</h1>
  <p class="sub">Elements: ${elementNames}</p>
  <hr>
  <div class="preview-grid">
    ${ast.elements.map(el => `<div class="component-slot"><div class="dl-${el.name}"></div><span class="label">${el.name}</span></div>`).join('\n    ')}
  </div>
  <hr>
  <pre>${escapeHtml(compiled.css)}</pre>

${compiled.js ? `<script>${compiled.js}</script>` : ''}
</body>
</html>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function initProject() {
  const dir = process.cwd();
  const files = {
    'design-lang.json': JSON.stringify({
      name: 'my-design-lang-project',
      version: '0.1.0',
      compiler: {
        output: 'dist',
        minify: false,
        watch: false
      }
    }, null, 2),
    'src/components/button.dl': `// Button component
element primary-button {
  surface: glass(blur: 12px)
  physics: spring(stiffness: 180, damping: 20, mass: 12g)
  touch_targets: 48px

  @hover: scale(amount: 1.04)
  @press: scale(amount: 0.95)
}`,
    'src/components/card.dl': `// Stats card
element revenue-card {
  layout: adaptive(priority: "importance")
  surface: glass(blur: 16px)
  content: [
    { value: "$128.9M", label: "Revenue" },
    { value: "94.2%", label: "Uptime" }
  ]
}`
  };

  for (const [filepath, content] of Object.entries(files)) {
    const fullPath = path.join(dir, filepath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  📄 ${filepath}`);
  }

  console.log(`\n✨ Design Lang project scaffolded in ${dir}`);
  console.log(`   Run: dl compile src/components/button.dl`);
}

function printHelp() {
  console.log(`
Design Lang v${pkg.version} — Beyond CSS

Usage:
  dl compile <input.dl>      Compile a .dl file to CSS + JS + HTML
  dl init                     Scaffold a new Design Lang project
  dl --version, -v            Show version
  dl --help, -h               Show this help

Options:
  --output, -o <path>        Output file path (without extension)
  --minify, -m               Minify output
  --watch, -w                Watch for changes (coming soon)

Examples:
  dl compile button.dl
  dl compile src/components/card.dl -o dist/card
  dl init
`);
}

if (require.main === module) {
  main();
}

module.exports = { compileFile };
