import type React from "react";
import styles from "./ChatBubble.module.css";
import isEmoji from "./utils/isEmoji";

type ChatBubbleProps = {
	text: string;
	timeDifference: number;
	isSameSource: boolean;
	source: "you" | "other";
	isInAppropriate?: boolean;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
	text,
	timeDifference,
	isSameSource,
	source,
	isInAppropriate,
}) => {
	const marginTop =
		isSameSource && timeDifference <= 20000
			? source === "you"
				? "-15px"
				: "5px"
			: "20px";

	const renderAsEmoji = isEmoji(text.replaceAll(" ", ""));

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

	if (isInAppropriate) {
		return (
			<div className={styles.inappropriateContainer} style={{ marginTop }}>
				<div className={styles.chatBubbleInAppropriate}>{text}</div>
				<div className={styles.inappropriate}>
					The above message was not sent as it's inappropriate.
				</div>
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
