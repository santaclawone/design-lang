/**
 * Design Lang — PEG Grammar
 * =========================
 * A declarative design language that compiles to CSS + JS runtime.
 */

/* ────── TOP LEVEL ────── */

DesignLang
  = _ elements:Element+ _ { return { type: "Document", elements: elements }; }

Element
  = _ "element" _ name:Identifier _ "{" _ body:ElementBody _ "}" _
    { return { type: "Element", name: name, properties: body.properties, hooks: body.hooks, children: body.children }; }

ElementBody
  = _ parts:(Property / LifecycleHook / NestedElement)* _ { 
      let props = [], hooks = [], children = [];
      for (let p of parts) {
        if (p.type === "Property") props.push(p);
        else if (p.type === "LifecycleHook") hooks.push(p);
        else if (p.type === "NestedElement") children.push(p);
      }
      return { properties: props, hooks: hooks, children: children };
    }

NestedElement
  = _ name:Identifier _ "{" _ body:ElementBody _ "}" _
    { return { type: "NestedElement", name: name, properties: body.properties, hooks: body.hooks, children: body.children }; }

/* ────── PROPERTIES ────── */

Property
  = _ key:Identifier _ ":" _ value:PropertyValue _ ";"?
    { return { type: "Property", key: key, value: value }; }

PropertyValue
  = FunctionCall / ObjectLiteral / ArrayLiteral / ValueLiteral / StringLiteral

/* ────── LIFECYCLE HOOKS ────── */

LifecycleHook
  = _ "@" name:Identifier _ ":" _ value:PropertyValue _ ";"?
    { return { type: "LifecycleHook", hook: name, value: value }; }

/* ────── VALUES ────── */

FunctionCall
  = name:Identifier _ "(" _ params:FunctionParams _ ")"
    { return { type: "FunctionCall", name: name, params: params }; }

FunctionParams
  = head:FunctionArg tail:(_ "," _ FunctionArg)* _ 
    {
      let result = [head];
      for (let t of tail) {
        if (t && t[3]) result.push(t[3]);
      }
      return result;
    }
  / "" { return []; }

FunctionArg
  = NamedArg / PositionalArg

NamedArg
  = key:Identifier _ ":" _ value:FunctionParamValue
    { return { type: "Param", key: key, value: value }; }

PositionalArg
  = value:FunctionParamValue
    { return { type: "Arg", value: value }; }

FunctionParamValue
  = FunctionCall / ObjectLiteral / ArrayLiteral / ValueLiteral / StringLiteral

ObjectLiteral
  = "{" _ pairs:ObjectPairList? _ "}"
    { return { type: "Object", pairs: pairs || [] }; }

ObjectPairList
  = head:ObjectPair tail:(_ "," _ ObjectPair)*
    {
      let result = [head];
      for (let t of tail) {
        if (t && t[3]) result.push(t[3]);
      }
      return result;
    }

ObjectPair
  = key:Identifier _ ":" _ value:PropertyValue
    { return { type: "Pair", key: key, value: value }; }

ArrayLiteral
  = "[" _ items:ArrayItemList? _ "]"
    { return { type: "Array", items: items || [] }; }

ArrayItemList
  = head:PropertyValue tail:(_ "," _ PropertyValue)*
    {
      let result = [head];
      for (let t of tail) {
        if (t && t[3]) result.push(t[3]);
      }
      return result;
    }

/* ────── PRIMITIVE LITERALS ────── */

ValueLiteral
  = UnitValue / NumberLiteral / ColorLiteral / KeywordLiteral

Unit
  = [a-zA-Z%][a-zA-Z0-9%]* { return text(); }

UnitValue
  = value:Number _ unit:Unit
    { return { type: "UnitValue", value: value, unit: unit }; }

NumberLiteral
  = value:Number
    { return { type: "Number", value: value }; }

Number
  = _ sign:("-" / "+")? integer:Digits rest:("." Digits)? _
    {
      let intStr = integer.join('') || '0';
      let fracStr = '';
      if (rest) {
        fracStr = '.' + rest[1].join('');
      }
      return parseFloat((sign || '') + intStr + fracStr);
    }

Digits
  = chars:[0-9]+ { return chars; }

ColorLiteral
  = value:("#" [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F] [0-9a-fA-F]? [0-9a-fA-F]?)
    { return { type: "Color", value: value.join('') }; }

KeywordLiteral
  = value:(Identifier)
    { return { type: "Keyword", value: value }; }

StringLiteral
  = _ "\"" chars:StringChars* "\"" _
    { return { type: "String", value: chars.join('') }; }
  / _ "'" chars:StringChars* "'" _
    { return { type: "String", value: chars.join('') }; }

StringChars
  = "\\" . { return "\\" + this.$1[0]; }
  / [^"'\n\r\\]

/* ────── IDENTIFIER ────── */

Identifier
  = _ first:[a-zA-Z_$] rest:[a-zA-Z0-9_$\-.]* _
    { return first + rest.join(''); }

/* ────── WHITESPACE / SKIP ────── */

_ "whitespace"
  = (WhiteSpace / LineTerminator / Comment)*

Comment
  = "//" [^\n\r]* (LineTerminator / EOF)
  / "/*" (!"*/" .)* "*/"

WhiteSpace
  = [ \t\v\f]

LineTerminator
  = [\n\r\u2028\u2029]

EOF
  = !.
