import Markdoc, { type RenderableTreeNodes } from "@markdoc/markdoc";
import React from "react";
import { Timestamp } from "./timestamp-react";

interface Props {
	content: RenderableTreeNodes;
}

const components = {
	Timestamp,
};

export function MarkdocRenderer({ content }: Props) {
	return <>{Markdoc.renderers.react(content, React, { components })}</>;
}
