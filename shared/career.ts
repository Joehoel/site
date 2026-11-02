declare const careerDateBrand: unique symbol;
declare const asOfBrand: unique symbol;

export type CareerDate = string & { readonly [careerDateBrand]: true };
export type AsOf = CareerDate & { readonly [asOfBrand]: true };

export type Role = {
  readonly id: string;
  readonly employer: { readonly name: string; readonly url?: string };
  readonly title: string;
  readonly start: CareerDate;
  readonly end?: CareerDate;
  readonly summary?: string;
  readonly primary?: boolean;
};

export type Career = { readonly roles: readonly Role[] };
export type CurrentSelection =
  | { readonly kind: "none" }
  | { readonly kind: "selected"; readonly role: Role }
  | { readonly kind: "ambiguous"; readonly roles: readonly Role[] };

function object(input: unknown, path: string): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new TypeError(`${path}: expected an object`);
  }
  return input as Record<string, unknown>;
}

function text(input: unknown, path: string): string {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new TypeError(`${path}: expected a nonempty string`);
  }
  return input;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function parseDate(input: unknown, path: string): CareerDate {
  const value = text(input, path);
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
  if (!match || match[0] !== value) {
    throw new TypeError(`${path}: expected YYYY, YYYY-MM, or YYYY-MM-DD`);
  }
  const year = Number(match[1]);
  const month = match[2] === undefined ? 1 : Number(match[2]);
  const day = match[3] === undefined ? 1 : Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new TypeError(`${path}: invalid calendar date`);
  }
  return value as CareerDate;
}

function bounds(date: CareerDate): { first: number; last: number } {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const lastMonth = date.length === 4 ? 12 : month;
  const lastDay = date.length === 10 ? day : daysInMonth(year, lastMonth);
  return {
    first: year * 10000 + month * 100 + day,
    last: year * 10000 + lastMonth * 100 + lastDay,
  };
}

export function parseCareer(input: unknown): Career {
  const career = object(input, "career");
  if (!Array.isArray(career.roles)) {
    throw new TypeError("roles: expected an array");
  }
  const ids = new Set<string>();
  let primaryId: string | undefined;
  const roles = Array.from(career.roles, (input: unknown, index: number): Role => {
    const path = `roles[${index}]`;
    const role = object(input, path);
    const id = text(role.id, `${path}.id`);
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.exec(id)?.[0] !== id) {
      throw new TypeError(`${path}.id: expected a lowercase ASCII slug`);
    }
    if (ids.has(id)) {
      throw new TypeError(`${path}.id: duplicate role ID ${id}`);
    }
    ids.add(id);
    const employer = object(role.employer, `${path}.employer`);
    const name = text(employer.name, `${path}.employer.name`);
    const title = text(role.title, `${path}.title`);
    const start = parseDate(role.start, `${path}.start`);
    const end = role.end === undefined ? undefined : parseDate(role.end, `${path}.end`);
    if (end !== undefined && bounds(start).first > bounds(end).last) {
      throw new TypeError(`${path}.end: period ends before it starts`);
    }
    const summary = role.summary === undefined ? undefined : text(role.summary, `${path}.summary`);
    if (role.primary !== undefined && typeof role.primary !== "boolean") {
      throw new TypeError(`${path}.primary: expected a boolean`);
    }
    if (role.primary === true) {
      if (primaryId !== undefined) {
        throw new TypeError(`${path}.primary: only one primary role is allowed`);
      }
      primaryId = id;
    }
    let url: string | undefined;
    if (employer.url !== undefined) {
      url = text(employer.url, `${path}.employer.url`);
      if (!URL.canParse(url) || !["http:", "https:"].includes(new URL(url).protocol)) {
        throw new TypeError(`${path}.employer.url: expected an absolute HTTP or HTTPS URL`);
      }
    }
    return {
      id,
      employer: { name, ...(url === undefined ? {} : { url }) },
      title,
      start,
      ...(end === undefined ? {} : { end }),
      ...(summary === undefined ? {} : { summary }),
      ...(role.primary === undefined ? {} : { primary: role.primary }),
    };
  });
  return { roles };
}

export function parseAsOf(input: string): AsOf {
  const date = parseDate(input, "asOf");
  if (date.length !== 10) {
    throw new TypeError("asOf: expected a full YYYY-MM-DD calendar date");
  }
  return date as AsOf;
}

export function orderRoles(career: Career): readonly Role[] {
  return [...career.roles].sort((a, b) => {
    const startOrder = bounds(b.start).first - bounds(a.start).first;
    return startOrder || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  });
}

export function selectCurrent(career: Career, asOf: AsOf): CurrentSelection {
  const day = bounds(asOf).first;
  const active = orderRoles(career).filter(
    (role) =>
      bounds(role.start).first <= day && (role.end === undefined || day <= bounds(role.end).last),
  );
  if (active.length === 0) return { kind: "none" };
  const selected = active.length === 1 ? active[0] : active.find((role) => role.primary);
  return selected ? { kind: "selected", role: selected } : { kind: "ambiguous", roles: active };
}
