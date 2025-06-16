import { useState, useRef } from "react";
import styles from "./Chat.module.css";
import ChatBubble from "./ChatBubble";
import SendIcon from "../../assets/send.svg";
import ClockIcon from "../../assets/clock.svg";
import { useIsInAppropriate } from "./utils/useIsInAppropriate";

type ChatMessage = {
	text: string;
	source: "you" | "other";
	timeStamp: string;
	isMessageInAppropriate?: boolean;
};

type GroupedMessage = ChatMessage | { type: "timestamp"; value: string };

export default function Chat() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			text: "hi there",
			source: "other",
			timeStamp: (Date.now() - 1000).toString(),
		},
		{ text: "💕", source: "other", timeStamp: Date.now().toString() },
	]);
	const { isLoading, isInAppropriate } = useIsInAppropriate();
	console.log("🚀 ~ Chat ~ isLoading:", isLoading);

	const chatContainerRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	};

	const groupMessages = (messages: ChatMessage[]): GroupedMessage[] => {
		const groupedMessages: GroupedMessage[] = [];
		let lastMessageTime = 0;

		messages.forEach((message, index) => {
			const currentTime = new Date(Number.parseInt(message.timeStamp));
			if (
				index === 0 ||
				currentTime.getTime() - lastMessageTime > 3600000 // More than an hour
			) {
				groupedMessages.push({
					type: "timestamp",
					value: currentTime.toLocaleString("en-US", {
						weekday: "short",
						hour: "2-digit",
						minute: "2-digit",
					}),
				});
			}
			groupedMessages.push(message);
			lastMessageTime = currentTime.getTime();
		});

		return groupedMessages;
	};

	const submitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const target = e.target as HTMLFormElement & {
			elements: HTMLFormControlsCollection & {
				messageInput: HTMLInputElement;
			};
		};
		const message = target.elements.messageInput.value;

		if (message.trim()) {
			const isMessageInAppropriate = await isInAppropriate(message);
			setMessages((s) => [
				...s,
				{
					text: message,
					source: "you",
					timeStamp: Date.now().toString(),
					isMessageInAppropriate,
				},
			]);
			(e.target as HTMLFormElement).reset();
			setTimeout(() => scrollToBottom(), 0);
		}
	};

	const groupedMessages = groupMessages(messages);

	return (
		<main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			{/* Chat Container */}
			<div ref={chatContainerRef} className={styles.chatContainer}>
				<div style={{ flex: 1 }} />
				{groupedMessages.map((m, index) => {
					if ("type" in m && m.type === "timestamp") {
						return (
							<div key={`timestamp-${m.value}`} className={styles.timestamp}>
								{m.value}
							</div>
						);
					}
					if ("source" in m && (m.source === "you" || m.source === "other")) {
						const isSameSource =
							index > 0 &&
							"source" in groupedMessages[index - 1] &&
							(groupedMessages[index - 1] as ChatMessage).source === m.source;
						const timeDifference =
							index > 0
								? Number.parseInt(m.timeStamp) -
									Number.parseInt(
										(groupedMessages[index - 1] as ChatMessage).timeStamp,
									)
								: Number.MAX_SAFE_INTEGER;
						return (
							<ChatBubble
								key={`${m.source}-${m.timeStamp}`}
								text={m.text}
								timeDifference={timeDifference}
								isSameSource={isSameSource}
								source={m.source}
								isInAppropriate={m.isMessageInAppropriate}
							/>
						);
					}
				})}
			</div>
			{/* Chat toolbar */}
			<div className={styles.chatToolbar}>
				<div className={styles.chatInputContainer}>
					<form
						onSubmit={submitMessage}
						style={{ display: "flex", alignItems: "center", height: "100%" }}
					>
						<input
							name="messageInput"
							// biome-ignore lint/a11y/noAutofocus: <explanation>
							autoFocus
							autoComplete="off"
							className={styles.chatInput}
							placeholder="Type a message..."
						/>
						<button
							type="submit"
							aria-label="Send Message"
							className={styles.sendButton}
						>
							{!isLoading ? (
								<img
									src={SendIcon}
									alt="Send Message Icon"
									width="20"
									height="20"
								/>
							) : (
								<img
									src={ClockIcon}
									alt="Send Message Icon"
									width="30"
									height="30"
								/>
							)}
						</button>
					</form>
				</div>
			</div>
		</main>
	);
}
