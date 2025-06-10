import { useState } from "react";
import styles from "./Chat.module.css";

type ChatMessage = {
	text: string;
	source: "you" | "other" | "system";
	timeStamp: string;
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

	return (
		<main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			{/* Chat Container */}
			<div className={styles.chatContainer}>
				{/* <div>Today, 1:06PM</div>
				<div className={styles.chatBubble}>
					Hey did you go someplace today Hey did you go someplace today ?
				</div>
				<div className={styles.chatBubbleOther}>
					Yes I went to Oxford, how about you ?
				</div>
				<div className={styles.chatBubble}>Was at home mostly</div> */}
				{messages.map((m) => {
					if (m.source === "you") {
						return <div className={styles.chatBubble}>{m.text}</div>;
					}
					if (m.source === "other") {
						return <div className={styles.chatBubbleOther}>{m.text}</div>;
					}
					if (m.source === "system") {
						return <div>{m.text}</div>;
					}
				})}
			</div>
			{/* Chat toolbar */}
			<div className={styles.chatToolbar}>
				<div className={styles.chatInputContainer}>
					<form
						// biome-ignore lint/a11y/noAutofocus: <explanation>
						autoFocus
						onSubmit={submitMessage}
						style={{ display: "flex", alignItems: "center", height: "100%" }}
					>
						<input
							name="messageInput"
							// biome-ignore lint/a11y/noAutofocus: <explanation>
							autoFocus
							className={styles.chatInput}
							placeholder="Type a message..."
						/>
					</form>
				</div>
			</div>
		</main>
	);
}
