declare module "nuxt/schema" {
	interface AppConfigInput {
		site?: {
			title?: string;
			author?: string;
			description?: string;
			lang?: string;
			ogLocale?: string;
		};
		navigation?: Array<{
			label: string;
			url: string;
		}>;
		socials?: Array<{
			label: string;
			url: string;
			icon: string;
		}>;
		date?: {
			locale?: string;
			options?: Intl.DateTimeFormatOptions;
		};
	}
}

export {};
