/**
 * Design Lang — Compiler
 * AST → CSS + JS Runtime + HTML
 */
'use strict';

class DesignLangCompiler {
  constructor(options = {}) {
    this.options = {
      prefix: 'dl',
      indent: '  ',
      includeRuntime: true,
      prettify: true,
      ...options
    };
    this.runtime = null; // Will be loaded on first use
  }

  /**
   * Main compile entry point
   * @param {object} ast - Parsed Design Lang AST
   * @returns {{ css: string, js: string, html: string }}
   */
  compile(ast) {
    if (ast.type !== 'Document') throw new Error('Expected Document node');

    const cssParts = [];
    const htmlParts = [];
    const runtimeCalls = [];

    for (const element of ast.elements) {
      const result = this.compileElement(element);
      if (result.css) cssParts.push(result.css);
      if (result.html) htmlParts.push(result.html);
      if (result.runtime) runtimeCalls.push(result.runtime);
    }

    const css = [
      '/* ─── Design Lang Compiled CSS ─── */',
      '',
      cssParts.join('\n\n')
    ].join('\n');

    let js = '';
    if (this.options.includeRuntime && runtimeCalls.length > 0) {
      js = [
        '/* ─── Design Lang Runtime ─── */',
        this.getRuntimeSource(),
        '',
        '/* ─── Component Initialization ─── */',
        runtimeCalls.join('\n\n'),
        ''
      ].join('\n');
    }

    return {
      css: css.trim(),
      js: js.trim(),
      html: htmlParts.join('\n')
    };
  }

  /**
   * Compile a single element
   */
  compileElement(element) {
    const className = `${this.options.prefix}-${element.name}`;
    const selector = `.${className}`;
    const rules = [];
    const pseudoRules = [];
    const keyframes = [];
    const runtimeCalls = [];

    for (const prop of element.properties) {
      const result = this.compileProperty(prop, className, selector);
      if (result.rules) rules.push(...result.rules);
      if (result.pseudo) pseudoRules.push(...result.pseudo);
      if (result.keyframes) keyframes.push(...result.keyframes);
      if (result.runtime) runtimeCalls.push(result.runtime);
    }

    for (const hook of element.hooks) {
      const result = this.compileHook(hook, className, selector);
      if (result.rules) rules.push(...result.rules);
      if (result.pseudo) pseudoRules.push(...result.pseudo);
      if (result.keyframes) keyframes.push(...result.keyframes);
      if (result.runtime) runtimeCalls.push(result.runtime);
    }

    // Build CSS output
    const cssParts = [];

    if (keyframes.length > 0) {
      cssParts.push(keyframes.join('\n\n'));
    }

    if (rules.length > 0) {
      const mainBlock = this.formatRuleSet(selector, rules);
      cssParts.push(mainBlock);
    }

    if (pseudoRules.length > 0) {
      for (const [pseudo, prules] of pseudoRules) {
        cssParts.push(this.formatRuleSet(`${selector}${pseudo}`, prules));
      }
    }

    // Build HTML output
    const html = `<div class="${className}"></div>`;

    return {
      css: cssParts.join('\n\n'),
      html,
      runtime: runtimeCalls.join('\n')
    };
  }

  /**
   * Compile a property
   */
  compileProperty(prop, className, selector) {
    const key = prop.key;
    const value = prop.value;
    const rules = [];
    const pseudo = [];
    const keyframes = [];
    const runtime = [];

    switch (key) {
      case 'surface':
        this.compileSurface(value, rules, keyframes, className);
        break;
      case 'physics':
        this.compilePhysics(value, rules, keyframes, pseudo, className, runtime);
        break;
      case 'typography':
        this.compileTypography(value, rules, pseudo);
        break;
      case 'layout':
        this.compileLayout(value, rules);
        break;
      case 'touch_targets':
        this.compileTouchTargets(value, rules);
        break;
      case 'haptic':
        this.compileHaptic(value, className, runtime);
        break;
      case 'audio':
        this.compileAudio(value, className, pseudo, runtime);
        break;
      case 'light':
        this.compileLight(value, rules, pseudo);
        break;
      case 'morph':
        this.compileMorph(value, rules, pseudo, keyframes);
        break;
      case 'contrast':
        this.compileContrast(value, rules);
        break;
      case 'focus':
        this.compileFocus(value, rules);
        break;
      case 'motion':
        this.compileMotionPreference(value, rules);
        break;
      case 'density':
        this.compileDensity(value, rules);
        break;
      case 'grid':
        this.compileGrid(value, rules);
        break;

      case 'cursor':
        this.compileCursor(value, className, runtime);
        break;
      case 'tooltip':
        this.compileTooltip(value, rules, pseudo, runtime, className);
        break;
      case 'accent':
        this.compileAccent(value, rules, pseudo);
        break;
      default:
        // Unknown property — emit as-is
        if (value.type === 'UnitValue' || value.type === 'Number' || value.type === 'Keyword') {
          rules.push({ prop: `--${key}`, value: this.valueToString(value) });
        }
    }

    return { rules, pseudo, keyframes, runtime };
  }

  /**
   * Compile a lifecycle hook
   */
  compileHook(hook, className, selector) {
    const hookName = hook.hook;
    const value = hook.value;
    const rules = [];
    const pseudo = [];
    const keyframes = [];
    const runtime = [];

    switch (hookName) {
      case 'birth':
        this.compileBirth(value, rules, keyframes, className);
        break;
      case 'hover':
        this.compileCustomHover(value, pseudo);
        break;
      case 'press':
        this.compilePress(value, pseudo);
        break;
      default:
        // Custom hook
        break;
    }

    return { rules, pseudo, keyframes, runtime };
  }

  // ─── SURFACE COMPILERS ───

  compileSurface(value, rules, keyframes, className) {
    if (value.type === 'Keyword') {
      switch (value.value) {
        case 'glass':
          rules.push(
            { prop: 'background', value: 'rgba(15, 23, 42, 0.7)' },
            { prop: 'backdrop-filter', value: 'blur(16px)' },
            { prop: '-webkit-backdrop-filter', value: 'blur(16px)' },
            { prop: 'border', value: '1px solid rgba(255, 255, 255, 0.06)' },
            { prop: 'border-radius', value: '16px' }
          );
          break;
        case 'ceramic':
          rules.push(
            { prop: 'background', value: 'linear-gradient(145deg, #FFF5E6 0%, #F5E6D3 50%, #EDE0D4 100%)' },
            { prop: 'border-radius', value: '16px' },
            { prop: 'box-shadow', value: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)' }
          );
          break;
        case 'metal':
          rules.push(
            { prop: 'background', value: 'conic-gradient(from 45deg, #1a1a2e, #2a2a3e, #1a1a2e, #3a3a4e, #1a1a2e)' },
            { prop: 'border-radius', value: '12px' },
            { prop: 'box-shadow', value: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' }
          );
          break;
        case 'textile':
          rules.push(
            { prop: 'background', value: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' },
            { prop: 'border-radius', value: '12px' },
            { prop: 'background-color', value: '#0f172a' }
          );
          break;
        case 'clay':
          rules.push(
            { prop: 'background', value: 'linear-gradient(145deg, #1e293b, #0f172a)' },
            { prop: 'border-radius', value: '20px' },
            { prop: 'box-shadow', value: '12px 12px 24px rgba(0,0,0,0.3), -8px -8px 16px rgba(255,255,255,0.03), inset 2px 2px 4px rgba(255,255,255,0.05)' }
          );
          break;
        case 'grain':
          rules.push(
            { prop: 'background-image', value: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E")' },
            { prop: 'background-repeat', value: 'repeat' },
            { prop: 'background-size', value: '256px 256px' }
          );
          break;
      }
    } else if (value.type === 'FunctionCall') {
      switch (value.name) {
        case 'glass':
          rules.push(
            { prop: 'background', value: 'rgba(15, 23, 42, 0.7)' },
            { prop: 'backdrop-filter', value: `blur(${this.getParam(value, 'blur', '16px')})` },
            { prop: '-webkit-backdrop-filter', value: `blur(${this.getParam(value, 'blur', '16px')})` },
            { prop: 'border', value: '1px solid rgba(255, 255, 255, 0.06)' },
            { prop: 'border-radius', value: '16px' }
          );
          break;
        case 'grain':
          rules.push(
            { prop: 'background-image', value: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E")' },
            { prop: 'background-size', value: this.getParam(value, 'scale', '256px') }
          );
          break;
        case 'ceramic':
          this.compileCeramic(value, rules);
          break;
        case 'metal':
          this.compileMetal(value, rules);
          break;
        case 'textile':
          this.compileTextile(value, rules);
          break;
        case 'clay':
          this.compileClay(value, rules);
          break;
      }
    }
  }

  compileCeramic(value, rules) {
    const glaze = this.valueToNumber(this.getParam(value, 'glaze', '0.85'));
    const warmth = this.valueToNumber(this.getParam(value, 'warmth', '0.5'));
    const warmOffset = Math.round((warmth - 0.5) * 40);
    const brightOffset = Math.round(glaze * 20);
    rules.push(
      { prop: '--dl-surface-bg', value: `linear-gradient(145deg, #FFE${warmOffset + 5}E6 0%, #F5E${warmOffset + 4}D3 50%, #EDE${warmOffset + 3}D0 100%)` },
      { prop: 'border-radius', value: '16px' },
      { prop: 'box-shadow', value: `0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,${0.2 + glaze * 0.2})` }
    );
  }

  compileMetal(value, rules) {
    const finish = this.getParam(value, 'finish', 'brushed');
    const anisotropy = this.valueToNumber(this.getParam(value, 'anisotropy', '0.7'));
    if (finish === 'brushed') {
      rules.push(
        { prop: '--dl-surface-bg', value: `conic-gradient(from 45deg, #1a1a2e, #2a2a3e, #1a1a2e, #3a3a4e, #1a1a2e)` },
        { prop: 'border-radius', value: '12px' },
        { prop: 'box-shadow', value: `0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,${anisotropy * 0.15})` }
      );
    }
  }

  compileTextile(value, rules) {
    const weave = this.getParam(value, 'weave', 'twill');
    const density = this.valueToNumber(this.getParam(value, 'density', '0.4'));
    const size = Math.round(4 / density);
    rules.push(
      { prop: '--dl-surface-bg', value: `repeating-linear-gradient(0deg, transparent, transparent ${size}px, rgba(255,255,255,0.03) ${size}px, rgba(255,255,255,0.03) ${size * 2}px), repeating-linear-gradient(90deg, transparent, transparent ${size}px, rgba(255,255,255,0.03) ${size}px, rgba(255,255,255,0.03) ${size * 2}px)` },
      { prop: '--dl-surface-bg-color', value: weave === 'twill' ? '#0f172a' : '#1a1a2e' },
      { prop: 'border-radius', value: '12px' }
    );
  }

  compileClay(value, rules) {
    const softness = this.valueToNumber(this.getParam(value, 'softness', '0.3'));
    const light = this.getParam(value, 'light', 'top-left');
    const blur = Math.round(softness * 40);
    rules.push(
      { prop: '--dl-surface-bg', value: 'linear-gradient(145deg, #1e293b, #0f172a)' },
      { prop: 'border-radius', value: `${16 + softness * 12}px` },
      { prop: 'box-shadow', value: `${blur}px ${blur}px ${blur * 2}px rgba(0,0,0,0.3), ${-blur / 2}px ${-blur / 2}px ${blur}px rgba(255,255,255,0.03), inset 2px 2px 4px rgba(255,255,255,0.05)` }
    );
  }

  // ─── PHYSICS COMPILER ───

  compilePhysics(value, rules, keyframes, pseudo, className, runtime) {
    if (value.type !== 'FunctionCall' || value.name !== 'spring') return;

    const stiffness = this.valueToNumber(this.getParam(value, 'stiffness', '180'));
    const damping = this.valueToNumber(this.getParam(value, 'damping', '20'));
    const mass = this.valueToNumber(this.getParam(value, 'mass', '12'));

    // Emit CSS custom properties for JS runtime
    rules.push(
      { prop: '--dl-stiffness', value: String(stiffness) },
      { prop: '--dl-damping', value: String(damping) },
      { prop: '--dl-mass', value: String(mass) },
      { prop: 'transition', value: 'transform 0.15s ease' },
      { prop: 'will-change', value: 'transform' },
      { prop: 'user-select', value: 'none' },
      { prop: '-webkit-user-select', value: 'none' }
    );

    // Pseudo-states for hover/press with identity
    pseudo.push([':hover', [
      { prop: '--dl-physics-hover', value: '1' }
    ]]);

    // Runtime: spring solver
    runtime.push(
      `DesignLang.spring('.${className}', { stiffness: ${stiffness}, damping: ${damping}, mass: ${mass / 1000} });`
    );
  }

  // ─── TYPOGRAPHY COMPILER ───

  compileTypography(value, rules, pseudo) {
    if (value.type === 'FunctionCall' && value.name === 'gradient') {
      const params = value.params || [];
      const direction = params[0]?.type === 'Arg' ? params[0].value.value : 'linear';
      const colors = params[1]?.type === 'Arg' ? params[1].value.items : [];
      const colorStr = colors.map(c => this.valueToString(c)).join(', ');

      rules.push(
        { prop: 'background', value: `linear-gradient(135deg, ${colorStr})` },
        { prop: '-webkit-background-clip', value: 'text' },
        { prop: 'background-clip', value: 'text' },
        { prop: '-webkit-text-fill-color', value: 'transparent' },
        { prop: 'color', value: 'transparent' }
      );
    } else if (value.type === 'FunctionCall' && value.name === 'volumetric') {
      // Handle volumetric typography
      const valWeight = this.getParam(value, 'value', '900');
      rules.push(
        { prop: 'font-weight', value: valWeight },
        { prop: 'font-variation-settings', value: `'wght' ${valWeight}` }
      );
    }
  }

  // ─── LAYOUT COMPILER ───

  compileLayout(value, rules) {
    if (value.type === 'FunctionCall' && value.name === 'adaptive') {
      const priority = this.getParam(value, 'priority', 'importance');
      rules.push(
        { prop: 'display', value: 'grid' },
        { prop: 'grid-template-columns', value: 'repeat(auto-fit, minmax(200px, 1fr))' },
        { prop: 'gap', value: '16px' },
        { prop: 'container-type', value: 'inline-size' }
      );
    } else if (value.type === 'FunctionCall' && value.name === 'container-relative') {
      const gapVal = this.getParam(value, 'gap', '16px');
      let gapStr = gapVal;
      // Handle responsive() function — converts to clamp()
      if (typeof gapVal === 'object' && gapVal.type === 'FunctionCall' && gapVal.name === 'responsive') {
        const min = this.valueToString(gapVal.params[0]?.value || '8px');
        const max = this.valueToString(gapVal.params[1]?.value || '24px');
        gapStr = `clamp(${min}, 2vw, ${max})`;
      }
      rules.push(
        { prop: 'container-type', value: 'inline-size' },
        { prop: 'gap', value: gapStr }
      );
    } else if (value.type === 'FunctionCall' && value.name === 'reflow') {
      const priority = this.getParam(value, 'priority', '');
      rules.push(
        { prop: 'display', value: 'flex' },
        { prop: 'flex-wrap', value: 'wrap' },
        { prop: 'gap', value: '8px' },
        { prop: 'align-items', value: 'center' }
      );
    }
  }

  // ─── TOUCH TARGETS ───

  compileTouchTargets(value, rules) {
    const size = this.valueToString(value);
    rules.push(
      { prop: 'min-width', value: size },
      { prop: 'min-height', value: size },
      { prop: 'cursor', value: 'pointer' }
    );
  }

  // ─── HAPTIC ───

  compileHaptic(value, className, runtime) {
    if (value.type !== 'Object') return;
    const interact = value.pairs.find(p => p.key === 'on_interact');
    if (interact && interact.value.type === 'FunctionCall' && interact.value.name === 'click') {
      const force = this.valueToNumber(this.getParam(interact.value, 'force', '25'));
      runtime.push(
        `DesignLang.haptic('.${className}', { force: ${force} });`
      );
    }
  }

  // ─── AUDIO ───

  compileAudio(value, className, pseudo, runtime) {
    if (value.type !== 'Object') return;
    const onHover = value.pairs.find(p => p.key === 'on_hover');
    if (onHover && onHover.value.type === 'FunctionCall' && onHover.value.name === 'chime') {
      const freq = this.valueToNumber(this.getParam(onHover.value, 'freq', '880'));
      runtime.push(
        `DesignLang.audio('.${className}', { hover: ${freq} });`
      );
    }
  }

  // ─── LIGHT ───

  compileLight(value, rules, pseudo) {
    if (value.type === 'FunctionCall' && value.name === 'spotlight') {
      const radius = this.getParam(value, 'radius', '200px');
      const intensity = this.valueToNumber(this.getParam(value, 'intensity', '0.15'));
      rules.push(
        { prop: 'position', value: 'relative' },
        { prop: 'overflow', value: 'hidden' }
      );
      pseudo.push(['::before', [
        { prop: 'content', value: "''" },
        { prop: 'position', value: 'absolute' },
        { prop: 'top', value: '-50%' },
        { prop: 'left', value: '-50%' },
        { prop: 'width', value: '200%' },
        { prop: 'height', value: '200%' },
        { prop: 'background', value: `radial-gradient(circle at 50% 50%, rgba(6,182,212,${intensity}) 0%, transparent ${radius})` },
        { prop: 'pointer-events', value: 'none' },
        { prop: 'mix-blend-mode', value: 'overlay' },
        { prop: 'z-index', value: '1' }
      ]]);
    } else if (value.type === 'FunctionCall' && value.name === 'glow') {
      const color = this.getParam(value, 'color', 'cyan');
      const spread = this.getParam(value, 'spread', '20px');
      const animated = this.getParam(value, 'animated', 'false');
      const colorMap = { cyan: 'rgba(6,182,212,0.3)', purple: 'rgba(139,92,246,0.3)', amber: 'rgba(245,158,11,0.3)' };
      const glowColor = colorMap[color] || color;
      rules.push(
        { prop: 'box-shadow', value: `0 0 ${spread} ${glowColor}` }
      );
      if (animated === 'true') {
        rules.push(
          { prop: 'animation', value: 'dl-glow-pulse 2s ease-in-out infinite alternate' }
        );
      }
    }
  }

  // ─── MORPH ───

  compileMorph(value, rules, pseudo, keyframes) {
    if (value.type !== 'FunctionCall' || value.name !== 'rounded') return;
    const radius = this.getParam(value, 'radius', '12px');
    const activeRadius = this.getParam(value, 'active', '50%');
    rules.push(
      { prop: 'border-radius', value: radius },
      { prop: 'transition', value: 'border-radius 0.3s ease' }
    );
    pseudo.push([':hover', [
      { prop: 'border-radius', value: activeRadius }
    ]]);
  }

  // ─── CONTRAST ───

  compileContrast(value, rules) {
    if (value.type === 'FunctionCall' && value.name === 'auto') {
      const base = this.getParam(value, 'base', 'WCAG.AAA');
      rules.push(
        { prop: 'color-scheme', value: 'light dark' },
        { prop: '--dl-contrast', value: base === 'WCAG.AAA' ? '7:1' : '4.5:1' }
      );
    }
  }

  // ─── FOCUS ───

  compileFocus(value, rules) {
    if (value.type === 'FunctionCall' && value.name === 'auto') {
      const style = this.getParam(value, 'style', 'glow');
      const width = this.getParam(value, 'width', '2px');
      rules.push(
        { prop: 'outline', value: 'none' },
        { prop: 'transition', value: 'box-shadow 0.2s ease' }
      );
    }
  }

  // ─── MOTION PREFERENCE ───

  compileMotionPreference(value, rules) {
    if (value.type === 'FunctionCall' && value.name === 'respect') {
      const pref = this.getParam(value, '', 'user.preference');
      rules.push(
        { prop: '@media (prefers-reduced-motion: reduce)', value: null, isMedia: true, children: [
          { prop: 'animation', value: 'none' },
          { prop: 'transition', value: 'none' }
        ]}
      );
    }
  }

  // ─── DENSITY ───

  compileDensity(value, rules) {
    const val = value.type === 'Keyword' ? value.value : 'auto';
    switch (val) {
      case 'compact':
        rules.push(
          { prop: 'padding', value: '8px' },
          { prop: 'gap', value: '4px' },
          { prop: 'font-size', value: '0.8rem' }
        );
        break;
      case 'cozy':
        rules.push(
          { prop: 'padding', value: '12px' },
          { prop: 'gap', value: '8px' }
        );
        break;
      case 'spacious':
        rules.push(
          { prop: 'padding', value: '24px' },
          { prop: 'gap', value: '16px' },
          { prop: 'font-size', value: '1.1rem' }
        );
        break;
      case 'auto':
        rules.push(
          { prop: 'padding', value: 'clamp(8px, 2vw, 24px)' },
          { prop: 'gap', value: 'clamp(4px, 1vw, 16px)' }
        );
        break;
    }
  }

  // ─── GRID ───

  compileGrid(value, rules) {
    if (value.type !== 'FunctionCall' || value.name !== 'auto-fill') return;
    const minVal = this.getParam(value, 'min', '200px');
    const maxVal = this.getParam(value, 'max', '1fr');
    rules.push(
      { prop: 'display', value: 'grid' },
      { prop: 'grid-template-columns', value: `repeat(auto-fill, minmax(${minVal}, ${maxVal}))` },
      { prop: 'gap', value: '16px' }
    );
  }

  // ─── CONTENT ───



  // ─── CURSOR ───

  compileCursor(value, className, runtime) {
    if (value.type !== 'FunctionCall' || value.name !== 'custom') return;
    runtime.push(
      `DesignLang.cursor('.${className}');`
    );
  }

  // ─── TOOLTIP ───

  compileTooltip(value, rules, pseudo, runtime, className) {
    if (value.type !== 'FunctionCall' || value.name !== 'proximity') return;
    runtime.push(
      `DesignLang.tooltip('.${className}');`
    );
  }

  // ─── ACCENT ───

  compileAccent(value, rules, pseudo) {
    if (value.type !== 'FunctionCall' || value.name !== 'brutal') return;
    const color = this.getParam(value, 'color', '#FF2D78');
    const weight = this.getParam(value, 'weight', '3px');
    const offset = this.getParam(value, 'offset', '4px');
    rules.push(
      { prop: 'border', value: `${weight} solid ${color}` },
      { prop: 'box-shadow', value: `${offset} ${offset} 0 ${color}` },
      { prop: 'border-radius', value: '0' }
    );
  }

  // ─── LIFECYCLE HOOKS ───

  compileBirth(value, rules, keyframes, className) {
    if (value.type === 'FunctionCall') {
      switch (value.name) {
        case 'fade-in':
          this.addKeyframe(keyframes, 'dl-fade-in', [
            { offset: '0%', props: { opacity: '0', transform: 'translateY(10px)' } },
            { offset: '100%', props: { opacity: '1', transform: 'translateY(0)' } }
          ]);
          rules.push(
            { prop: 'animation', value: `dl-fade-in ${this.getParam(value, 'duration', '0.5s')} ease-out both` }
          );
          break;
      }
    }
  }

  compileCustomHover(value, pseudo) {
    if (value.type === 'FunctionCall' && value.name === 'scale') {
      const amount = this.getParam(value, 'amount', '1.04');
      pseudo.push([':hover', [
        { prop: 'transform', value: `scale(${amount})` }
      ]]);
    }
  }

  compilePress(value, pseudo) {
    if (value.type === 'FunctionCall' && value.name === 'scale') {
      const amount = this.getParam(value, 'amount', '0.95');
      pseudo.push([':active', [
        { prop: 'transform', value: `scale(${amount})` }
      ]]);
    }
  }

  // ─── UTILITIES ───

  formatRuleSet(selector, rules) {
    // Deduplicate rules — last value wins per property
    const seen = new Map();
    const mediaRules = [];
    const regularRules = [];
    
    for (const rule of rules) {
      if (rule.isMedia) {
        mediaRules.push(rule);
      } else {
        // Only keep the last rule for each property
        seen.set(rule.prop, rule);
      }
    }
    
    const lines = [`${selector} {`];
    for (const [prop, rule] of seen) {
      lines.push(`  ${rule.prop}: ${rule.value};`);
    }
    lines.push('}');
    
    // Media queries as separate top-level rules
    for (const mq of mediaRules) {
      lines.push(`\n${mq.prop} {`);
      lines.push(`  ${selector} {`);
      for (const child of mq.children) {
        lines.push(`    ${child.prop}: ${child.value};`);
      }
      lines.push(`  }`);
      lines.push('}');
    }
    
    return lines.join('\n');
  }

  addKeyframe(keyframes, name, steps) {
    const exists = keyframes.some(k => typeof k === 'string' && k.includes("@keyframes " + name));
    if (exists) return;
    const lines = [`@keyframes ${name} {`];
    for (const step of steps) {
      lines.push(`  ${step.offset} {`);
      for (const [prop, val] of Object.entries(step.props)) {
        lines.push(`    ${prop}: ${val};`);
      }
      lines.push(`  }`);
    }
    lines.push('}');
    keyframes.push(lines.join('\n'));
  }

  getParam(funcCall, name, defaultValue) {
    if (!funcCall.params) return defaultValue;
    const named = funcCall.params.find(p => p.type === 'Param' && p.key === name);
    if (named) return this.valueToString(named.value);
    // Positional args
    const positional = funcCall.params.filter(p => p.type === 'Arg');
    if (positional.length > 0) return this.valueToString(positional[0].value);
    return defaultValue;
  }

  getPairValue(obj, key, defaultValue) {
    if (!obj.pairs) return defaultValue;
    const pair = obj.pairs.find(p => p.key === key);
    if (pair) return this.valueToString(pair.value);
    return defaultValue;
  }

  valueToNumber(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val) || 0;
    if (val && typeof val === 'object') {
      if (val.type === 'Number') return val.value;
      if (val.type === 'UnitValue') return val.value;
    }
    return parseFloat(String(val)) || 0;
  }

  valueToString(val, { css = false } = {}) {
    if (!val) return '';
    switch (val.type) {
      case 'String': return css ? `"${val.value}"` : val.value;
      case 'Number': return String(val.value);
      case 'UnitValue': return `${val.value}${val.unit}`;
      case 'Keyword': return val.value;
      case 'Color': return val.value;
      default: return String(val.value || '');
    }
  }

  // ─── RUNTIME SOURCE ───

  getRuntimeSource() {
    return `
if (typeof DesignLang === 'undefined') {
  window.DesignLang = {};

  // Spring physics solver
  DesignLang.spring = function(selector, params) {
    const el = document.querySelector(selector);
    if (!el) return;
    const { stiffness = 180, damping = 20, mass = 0.012 } = params;
    let vx = 0;
    let target = 1;
    let current = 1;

    el.addEventListener('mouseenter', () => { target = 1.04; });
    el.addEventListener('mouseleave', () => { target = 1; });
    el.addEventListener('mousedown', () => { target = 0.95; });
    el.addEventListener('mouseup', () => { target = 1.04; });

    function tick() {
      const force = stiffness * (target - current);
      const damp = damping * vx;
      const accel = (force - damp) / mass;
      vx += accel * 0.016;
      current += vx * 0.016;
      el.style.transform = 'scale(' + current + ')';
      if (Math.abs(target - current) > 0.001 || Math.abs(vx) > 0.001) {
        requestAnimationFrame(tick);
      }
    }

    el.addEventListener('mouseenter', () => requestAnimationFrame(tick));
    el.addEventListener('mousedown', () => requestAnimationFrame(tick));
  };

  // Haptic feedback
  DesignLang.haptic = function(selector, params) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(params.force || 25);
    });
  };

  // Audio feedback
  DesignLang.audio = function(selector, params) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.addEventListener('mouseenter', () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = params.hover || 880;
        osc.type = 'sine';
        gain.gain.value = 0.05;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } catch(e) {}
    });
  };

  // Cursor glow
  DesignLang.cursor = function(selector) {
    // Implemented in the compiled CSS/HTML setup
  };

  // Tooltip
  DesignLang.tooltip = function(selector) {
    // Implemented in the compiled CSS/HTML setup
  };
}
`;
  }
}

module.exports = DesignLangCompiler;
