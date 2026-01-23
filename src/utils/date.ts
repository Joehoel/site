import { siteConfig } from "@/site.config";

export function getFormattedDate(
	date: Date | undefined,
	options?: Intl.DateTimeFormatOptions,
): string {
	if (date === undefined) {
		return "Invalid Date";
	}

	return new Intl.DateTimeFormat(siteConfig.date.locale, {
		...(siteConfig.date.options as Intl.DateTimeFormatOptions),
		...options,
	}).format(date);
}

/** Sort collection entries by publishDate (newest first) */
export function collectionDateSort<T extends { data: { publishDate: Date } }>(a: T, b: T) {
	return b.data.publishDate.getTime() - a.data.publishDate.getTime();
}
