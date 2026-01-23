import type { Config } from "@markdoc/markdoc";

export const markdocConfig: Config = {
	tags: {
		Timestamp: {
			render: "Timestamp",
			attributes: {
				date: { type: String, required: true },
			},
		},
	},
};
