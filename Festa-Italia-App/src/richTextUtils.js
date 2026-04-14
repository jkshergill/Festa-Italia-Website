const ALLOWED_TAGS = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  'br',
  'p',
  'div',
  'ul',
  'ol',
  'li',
  'a'
]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hasHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
}

function plainTextToHtml(value) {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
}

function sanitizeHref(href) {
  const value = String(href || '').trim();
  if (!value) return '';

  if (
    value.startsWith('#') ||
    value.startsWith('/') ||
    /^https?:\/\//i.test(value) ||
    /^mailto:/i.test(value) ||
    /^tel:/i.test(value)
  ) {
    return value;
  }

  return '';
}

function sanitizeNode(node, doc) {
  if (!node) return null;

  if (node.nodeType === 3) {
    return doc.createTextNode(node.textContent || '');
  }

  if (node.nodeType !== 1) {
    return null;
  }

  const tag = node.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tag)) {
    const fragment = doc.createDocumentFragment();
    node.childNodes.forEach((child) => {
      const sanitizedChild = sanitizeNode(child, doc);
      if (sanitizedChild) {
        fragment.appendChild(sanitizedChild);
      }
    });
    return fragment;
  }

  const clean = doc.createElement(tag);

  if (tag === 'a') {
    const safeHref = sanitizeHref(node.getAttribute('href'));
    if (safeHref) {
      clean.setAttribute('href', safeHref);
      if (/^https?:\/\//i.test(safeHref)) {
        clean.setAttribute('target', '_blank');
        clean.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }

  node.childNodes.forEach((child) => {
    const sanitizedChild = sanitizeNode(child, doc);
    if (sanitizedChild) {
      clean.appendChild(sanitizedChild);
    }
  });

  return clean;
}

export function sanitizeRichText(value) {
  const input = String(value || '').trim();
  if (!input) return '';

  if (typeof DOMParser === 'undefined' || typeof document === 'undefined') {
    return plainTextToHtml(input);
  }

  try {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(`<div>${input}</div>`, 'text/html');
    const sourceRoot = parsed.body.firstElementChild;
    if (!sourceRoot) return '';

    const outputDoc = document.implementation.createHTMLDocument('clean');
    const outputRoot = outputDoc.createElement('div');

    sourceRoot.childNodes.forEach((node) => {
      const sanitizedNode = sanitizeNode(node, outputDoc);
      if (sanitizedNode) {
        outputRoot.appendChild(sanitizedNode);
      }
    });

    return outputRoot.innerHTML;
  } catch (error) {
    console.error('Failed to sanitize rich text:', error);
    return plainTextToHtml(input);
  }
}

export function formatRichTextForEditor(value) {
  const input = String(value || '');
  if (!input.trim()) return '';
  return hasHtml(input) ? sanitizeRichText(input) : plainTextToHtml(input);
}

export function formatRichTextForRender(value) {
  const input = String(value || '');
  if (!input.trim()) return '';
  return hasHtml(input) ? sanitizeRichText(input) : plainTextToHtml(input);
}
