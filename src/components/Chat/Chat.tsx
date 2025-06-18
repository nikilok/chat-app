import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import styles from "./Chat.module.css";
import ChatBubble from "./ChatBubble";
import ExperimentalAiFilter from "./ExperimentalAiFilter";
import SendIcon from "../../assets/send.svg?react";
import ClockIcon from "../../assets/clock.svg?react";
import { useIsInAppropriate } from "../../hooks/useIsInAppropriate";
import { useChatStorage } from "../../hooks/useChatStorage";
import * as emoji from "node-emoji";

type ChatMessage = {
	id: number;
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
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isAiFilteringEnabled, setIsAiFilteringEnabled] = useState(false);
	const { isLoading: isAiLoading, isInAppropriate } = useIsInAppropriate();
	const {
		isLoading,
		createMessage,
		queueMessage,
		loadMessages,
		bulkAddMessages,
		startBackgroundSync,
		stopBackgroundSync,
	} = useChatStorage();

	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Start background sync
	useEffect(() => {
		const cleanup = startBackgroundSync();
		return () => {
			stopBackgroundSync();
			cleanup?.();
		};
	}, [startBackgroundSync, stopBackgroundSync]);

	// Load saved messages from Indexed DB on start
	// biome-ignore lint/correctness/useExhaustiveDependencies: <loadMessages, createMessage, bulkAddMessages are memoized functions from the hook >
	useEffect(() => {
		const initializeMessages = async () => {
			try {
				const savedMessages = await loadMessages();
				if (savedMessages.length > 0) {
					setMessages(savedMessages);
				} else {
					// TODO: This is only for demonstration, and must be cleared later.
					const defaultMessages = [
						createMessage("hi there", "other"),
						createMessage("💕", "other"),
					];
					setMessages(defaultMessages);
					await bulkAddMessages(defaultMessages);
				}
			} catch (error) {
				console.error("Failed to initialize messages:", error);
			}
		};

		initializeMessages();
	}, []);

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
		if (isAiLoading) {
			return;
		}
		const target = e.target as HTMLFormElement & {
			elements: HTMLFormControlsCollection & {
				messageInput: HTMLInputElement;
			};
		};
		const message = target.elements.messageInput.value;

		if (message.trim()) {
			let isMessageInAppropriate = false;

			if (isAiFilteringEnabled) {
				isMessageInAppropriate = await isInAppropriate(message);
			}

			const newMessage = createMessage(
				emoji.emojify(message),
				"you",
				isMessageInAppropriate,
			);

			setMessages((s) => [...s, newMessage]);

			queueMessage(newMessage);

			(e.target as HTMLFormElement).reset();
		}
	};

	if (isLoading) {
		return (
			<div className={styles.loadingContainer}>
				<div className={styles.loadingIconWrapper}>
					<ClockIcon width={40} height={40} />
				</div>
			</div>
		);
	}

	return (
		<main className={styles.chatMain}>
			<div ref={chatContainerRef} className={styles.chatContainer}>
				{/* Filler div so the app starts with content near the bottom. */}
				<div style={{ flex: 1, minHeight: 0 }} />
				<div className={styles.filterContainer}>
					<ExperimentalAiFilter
						isEnabled={isAiFilteringEnabled}
						onToggle={setIsAiFilteringEnabled}
					/>
				</div>
				<div
					className={styles.virtualListContainer}
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
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
									className={styles.virtualItem}
									style={{
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
									className={styles.virtualItem}
									style={{
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
						style={{
							display: "flex",
							alignItems: "center",
							height: "100%",
							width: "100%",
						}}
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
							{!isAiLoading ? (
								<SendIcon width={20} height={20} color="white" />
							) : (
								<ClockIcon width={20} height={20} color="white" />
							)}
						</button>
					</form>
				</div>
			</div>
		</main>
	);
}
