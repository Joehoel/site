import { component, defineMarkdocConfig } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
	tags: {
		Timestamp: {
			render: component("./src/components/timestamp.astro"),
			attributes: {
				date: { type: String, required: true },
			},
		},
	},
});
