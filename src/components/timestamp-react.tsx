interface TimestampProps {
	date: string;
}

export function Timestamp({ date }: TimestampProps) {
	return <time dateTime={date}>{date}</time>;
}
