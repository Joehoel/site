import { NOW, column, defineDb, defineTable } from "astro:db";

const Guestbook = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		message: column.text(),
		createdAt: column.date({ default: NOW }),
	},
});

export default defineDb({
	tables: {
		Guestbook,
	},
});
