import type React from "react";
import styles from "./ChatBubble.module.css";
import isEmoji from "./utils/isEmoji";

type ChatBubbleProps = {
	text: string;
	timeDifference: number;
	isSameSource: boolean;
	source: "you" | "other";
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
	text,
	timeDifference,
	isSameSource,
	source,
}) => {
	const marginTop =
		isSameSource && timeDifference <= 20000
			? source === "you"
				? "-15px"
				: "5px"
			: "20px";

	const renderAsEmoji = isEmoji(text);

	if (renderAsEmoji) {
		return (
			<div
				className={
					source === "you" ? styles.emojiBubble : styles.emojiBubbleOther
				}
				style={{ marginTop }}
			>
				{text}
			</div>
		);
	}

	return (
		<div
			className={source === "you" ? styles.chatBubble : styles.chatBubbleOther}
			style={{ marginTop }}
		>
			{text}
		</div>
	);
};

export default ChatBubble;
