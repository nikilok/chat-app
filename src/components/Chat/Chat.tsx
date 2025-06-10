import { useState } from "react";
import styles from "./Chat.module.css";
import ChatBubble from "./ChatBubble";

type ChatMessage = {
	text: string;
	source: "you" | "other";
	timeStamp: string;
};

type GroupedMessage = ChatMessage | { type: "timestamp"; value: string };

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

export default function Chat() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ text: "hi there", source: "other", timeStamp: Date.now().toString() },
	]);

	const submitMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const target = e.target as HTMLFormElement & {
			elements: HTMLFormControlsCollection & {
				messageInput: HTMLInputElement;
			};
		};
		const message = target.elements.messageInput.value;
		if (message) {
			setMessages((s) => [
				...s,
				{
					text: message,
					source: "you",
					timeStamp: Date.now().toString(),
				},
			]);
			(e.target as HTMLFormElement).reset();
		}
	};

	const groupedMessages = groupMessages(messages);

	return (
		<main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			{/* Chat Container */}
			<div className={styles.chatContainer}>
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
					</form>
				</div>
			</div>
		</main>
	);
}
