---
title: Zod filtered array schema
draft: false
publishDate: 2025-04-08T08:38:00Z
---

```ts
/**
 * Creates a Zod schema for an array that filters out invalid elements during preprocessing.
 *
 * @template T - Type extending ZodSchema
 * @param {T} schema - The Zod schema to validate individual array elements
 * @returns {ZodEffects<ZodArray<T>>} A new Zod schema that:
 * 1. Converts non-array inputs into single-element arrays
 * 2. Filters out elements that don't match the provided schema
 * 3. Validates the resulting array against the schema
 *
 * @example
 * const numberSchema = makeFilteredArraySchema(z.number());
 * numberSchema.parse(['1', 2, '3', 4]); // Returns [2, 4]
 */
function makeFilteredArraySchema<T extends ZodSchema>(schema: T) {
  return z.preprocess((val) => {
    const array = Array.isArray(val) ? val : [val];
    return array.filter((item: unknown) => schema.safeParse(item).success);
  }, z.array(schema));
}
```
