import { z } from "zod";
import type { FieldDef, SubCriterionFormDef } from "./types";

function fieldZod(f: FieldDef): z.ZodTypeAny {
  const req = f.required !== false;
  switch (f.type) {
    case "text":
    case "select":
    case "radio":
    case "year":
    case "date":
      return req ? z.string().min(1) : z.string().optional();
    case "textarea":
      return req ? z.string().min(1) : z.string().optional();
    case "number":
      return req ? z.coerce.number() : z.coerce.number().optional();
    case "decimal":
      return req ? z.coerce.number() : z.coerce.number().optional();
    case "multiselect": {
      const arr = z.array(z.string());
      return req ? arr.min(1) : arr.optional();
    }
    default:
      return z.string().optional();
  }
}

export function buildRowSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) shape[f.key] = fieldZod(f);
  return z.object(shape).strict();
}

export function buildItemsSchema(def: SubCriterionFormDef) {
  const row = buildRowSchema(def.fields);
  if (def.allowMultiple) {
    return z.object({ items: z.array(row).min(1) });
  }
  return z.object({ items: z.array(row).min(1).max(1) });
}

export function parseSubmission(def: SubCriterionFormDef, body: unknown) {
  return buildItemsSchema(def).safeParse(body);
}
