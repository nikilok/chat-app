import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import styles from "./Chat.module.css";
import ChatBubble from "./ChatBubble";
import SendIcon from "../../assets/send.svg";
import ClockIcon from "../../assets/clock.svg";
import { useIsInAppropriate } from "./utils/useIsInAppropriate";
import * as emoji from "node-emoji";

type ChatMessage = {
	text: string;
	source: "you" | "other";
	timeStamp: string;
	isMessageInAppropriate?: boolean;
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
		{
			text: "hi there",
			source: "other",
			timeStamp: (Date.now() - 1000).toString(),
		},
		{ text: "💕", source: "other", timeStamp: Date.now().toString() },
	]);
	const { isLoading, isInAppropriate } = useIsInAppropriate();

	const chatContainerRef = useRef<HTMLDivElement>(null);

	const groupedMessages = useMemo(() => groupMessages(messages), [messages]);

	const rowVirtualizer = useVirtualizer({
		count: groupedMessages.length,
		getScrollElement: () => chatContainerRef.current,
		estimateSize: (index) => {
			const message = groupedMessages[index];
			if ("type" in message && message.type === "timestamp") {
				return 40;
			}
			const messageText = "text" in message ? message.text : "";
			const baseHeight = 60;
			const estimatedTextLines = Math.ceil(messageText.length / 40);
			return Math.max(baseHeight, baseHeight + (estimatedTextLines - 1) * 20);
		},
		overscan: 5,
	});

	const scrollToBottom = useCallback(() => {
		if (chatContainerRef.current && groupedMessages.length > 0) {
			chatContainerRef.current.scrollTo({
				top: chatContainerRef.current.scrollHeight,
				behavior: "auto",
			});

			rowVirtualizer.scrollToIndex(groupedMessages.length - 1, {
				align: "end",
				behavior: "auto",
			});

			setTimeout(() => {
				if (chatContainerRef.current) {
					chatContainerRef.current.scrollTo({
						top: chatContainerRef.current.scrollHeight,
						behavior: "smooth",
					});
				}
			}, 100);
		}
	}, [rowVirtualizer, groupedMessages.length]);

	useEffect(() => {
		if (groupedMessages.length > 0) {
			scrollToBottom();
		}
	}, [groupedMessages.length, scrollToBottom]);

	const submitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isLoading) {
			return;
		}
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
					text: emoji.emojify(message),
					source: "you",
					timeStamp: Date.now().toString(),
					isMessageInAppropriate,
				},
			]);
			(e.target as HTMLFormElement).reset();
		}
	};

	return (
		<main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			{/* Virtual Chat Container */}
			<div ref={chatContainerRef} className={styles.chatContainer}>
				<div style={{ flex: 1 }} />
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualItem) => {
						const message = groupedMessages[virtualItem.index];

						// Render timestamp
						if ("type" in message && message.type === "timestamp") {
							return (
								<div
									key={virtualItem.key}
									data-index={virtualItem.index}
									ref={rowVirtualizer.measureElement}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										transform: `translateY(${virtualItem.start}px)`,
									}}
								>
									<div className={styles.timestamp}>{message.value}</div>
								</div>
							);
						}

						// Render chat bubble
						if (
							"source" in message &&
							(message.source === "you" || message.source === "other")
						) {
							const currentIndex = virtualItem.index;
							const previousMessage =
								currentIndex > 0 ? groupedMessages[currentIndex - 1] : null;

							const isSameSource =
								previousMessage &&
								"source" in previousMessage &&
								previousMessage.source === message.source;

							const timeDifference =
								previousMessage && "timeStamp" in previousMessage
									? Number.parseInt(message.timeStamp) -
										Number.parseInt(previousMessage.timeStamp)
									: Number.MAX_SAFE_INTEGER;

							return (
								<div
									key={virtualItem.key}
									data-index={virtualItem.index}
									ref={rowVirtualizer.measureElement}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										transform: `translateY(${virtualItem.start}px)`,
										display: "flex",
										flexDirection: "column",
									}}
								>
									<ChatBubble
										text={message.text}
										timeDifference={timeDifference}
										isSameSource={!!isSameSource}
										source={message.source}
										isInAppropriate={message.isMessageInAppropriate}
									/>
								</div>
							);
						}

						return null;
					})}
				</div>
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
									alt="Loading Icon"
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
