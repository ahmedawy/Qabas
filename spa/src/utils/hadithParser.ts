export type ASTNode =
  | { type: 'text'; text: string }
  | { type: 'element'; tag: string; attrs: Record<string, string>; children: ASTNode[] };

const astCache = new Map<string, ASTNode[]>();

function parseDomNodeList(nodes: NodeListOf<ChildNode> | Node[]): ASTNode[] {
  const result: ASTNode[] = [];
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result.push({ type: 'text', text: node.textContent || '' });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const attrs: Record<string, string> = {};
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attrs[attr.name] = attr.value;
      }
      
      let tagName = element.tagName.toLowerCase();
      // Strip 'h-' prefix if it was added during preprocessing to handle Arabic tags
      if (tagName.startsWith('h-')) {
        tagName = tagName.slice(2);
      }

      result.push({
        type: 'element',
        tag: tagName,
        attrs,
        children: parseDomNodeList(element.childNodes),
      });
    }
  });
  return result;
}

function preprocessHtml(html: string): string {
  // 1. Expand self-closing Arabic XML tags (e.g. <نه/>) to explicit opening/closing pairs (<نه></نه>)
  // so the HTML5 parser does not treat them as unclosed and nest subsequent content inside them.
  let processed = html.replace(/<([\u0600-\u06FF_a-zA-Z0-9]+)([^>]*)\/>/g, '<$1$2></$1>');

  // 2. Prefix custom Arabic tags with 'h-' so DOMParser (HTML mode) parses them as valid custom elements
  // instead of treating them as plain text.
  processed = processed.replace(/<(\/?)({?[\u0600-\u06FF_a-zA-Z0-9]+}?)([^>]*)>/g, (match, slash, tagName, attrs) => {
    if (/[\u0600-\u06FF]/.test(tagName)) {
      return `<${slash}h-${tagName}${attrs}>`;
    }
    return match;
  });

  return processed;
}

function parseHtmlToAST(html: string): ASTNode[] {
  if (typeof DOMParser === 'undefined') {
    return [{ type: 'text', text: html }];
  }
  try {
    const preprocessed = preprocessHtml(html);
    const parser = new DOMParser();
    // Wrap inside root div to ensure valid single root element parsing
    const doc = parser.parseFromString(`<div>${preprocessed}</div>`, 'text/html');
    const rootDiv = doc.body.firstChild || doc.createElement('div');
    return parseDomNodeList(rootDiv.childNodes);
  } catch (err) {
    console.error('Failed to parse Hadith markup string into AST', err);
    // Fallback simple tag stripping
    const plain = html.replace(/<[^>]*>/g, '');
    return [{ type: 'text', text: plain }];
  }
}

/**
 * Parses Hadith content text containing legacy Arabic XML tags into an AST.
 * Caches results globally by content string to prevent repeated parsing.
 */
export function getHadithAST(content: string): ASTNode[] {
  let cached = astCache.get(content);
  if (!cached) {
    cached = parseHtmlToAST(content);
    astCache.set(content, cached);
  }
  return cached;
}
