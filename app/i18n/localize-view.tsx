import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import type { MessageCatalog } from "./catalogs";

function translate(value: string, messages: MessageCatalog) {
  const key = value.trim();
  const translated = messages[key];
  return translated ? value.replace(key, translated) : value;
}

export function localizeView(node: ReactNode, messages: MessageCatalog): ReactNode {
  if (typeof node === "string") return translate(node, messages);
  if (Array.isArray(node)) {
    return Children.map(node, (child) => localizeView(child, messages));
  }
  if (!isValidElement<Record<string, unknown>>(node)) return node;

  const props: Record<string, unknown> = {};
  for (const key of ["aria-label", "placeholder", "title", "alt"]) {
    const value = node.props[key];
    if (typeof value === "string") props[key] = translate(value, messages);
  }
  if (node.props.children !== undefined) {
    props.children = Children.map(node.props.children as ReactNode, (child) =>
      localizeView(child, messages),
    );
  }
  return cloneElement(node, props);
}