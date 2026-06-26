import type { Annotation } from '../types';
import type { ASTNode } from './hadithParser';

interface AnnotationNode {
  annotation: Annotation;
  index: number;
  children: AnnotationNode[];
}

/**
 * Recursively builds AST nodes for a substring segment of the clean text,
 * inserting element nodes for annotations and text nodes for raw text.
 */
function buildASTSegment(
  cleanText: string,
  startOffset: number,
  endOffset: number,
  childNodes: AnnotationNode[]
): ASTNode[] {
  const result: ASTNode[] = [];
  // Sort children by start position ascending
  const sortedChildren = [...childNodes].sort(
    (a, b) => a.annotation.start - b.annotation.start
  );

  let cursor = startOffset;

  for (const node of sortedChildren) {
    const ann = node.annotation;

    // Safety bounds check
    if (ann.start < cursor) {
      continue; // Skip overlapping/out-of-bounds annotations if any
    }

    // 1. Text segment before the annotation
    if (ann.start > cursor) {
      result.push({
        type: 'text',
        text: cleanText.slice(cursor, ann.start),
      });
    }

    // 2. Recursive segment inside the annotation
    const annotationEnd = Math.min(ann.start + ann.length, endOffset);
    const childAST = buildASTSegment(
      cleanText,
      ann.start,
      annotationEnd,
      node.children
    );

    // 3. Assemble the element node
    const attrs: Record<string, string> = {};
    if (ann.attrs) {
      Object.assign(attrs, ann.attrs);
    }
    if (ann.linkId !== null) {
      attrs['ربط'] = String(ann.linkId);
    }

    result.push({
      type: 'element',
      tag: ann.type,
      attrs,
      children: childAST,
    });

    cursor = annotationEnd;
  }

  // 4. Remaining text segment after all annotations
  if (cursor < endOffset) {
    result.push({
      type: 'text',
      text: cleanText.slice(cursor, endOffset),
    });
  }

  return result;
}

/**
 * Converts CleanContent and flat Annotations array into ASTNode[]
 */
export function buildASTFromAnnotations(
  cleanText: string,
  annotations: Annotation[] | null | undefined
): ASTNode[] {
  if (!cleanText) {
    return [];
  }
  if (!annotations || annotations.length === 0) {
    return [{ type: 'text', text: cleanText }];
  }

  // Wrap annotations in nodes
  const nodes: AnnotationNode[] = annotations.map((ann, index) => ({
    annotation: ann,
    index,
    children: [],
  }));

  const roots: AnnotationNode[] = [];

  // Build the hierarchy tree using parentIndex references
  nodes.forEach((node) => {
    const parentIdx = node.annotation.parentIndex;
    if (parentIdx === null || parentIdx === undefined || parentIdx < 0 || parentIdx >= nodes.length) {
      roots.push(node);
    } else {
      nodes[parentIdx].children.push(node);
    }
  });

  return buildASTSegment(cleanText, 0, cleanText.length, roots);
}
