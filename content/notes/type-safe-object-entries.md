---
title: Typesafe Object.entries()
draft: false
description: Simple utility function to have typesafe values for Object.entries()
publishDate: 2025-01-30T23:17:00Z
---

```ts
export function objectEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}
```
