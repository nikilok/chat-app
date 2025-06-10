import styles from "./Chat.module.css";

export default function Chat() {
	return (
		<main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			{/* Chat Container */}
			<div className={styles.chatContainer}>
				<div>Today, 1:06PM</div>
				<div className={styles.chatBubble}>
					Hey did you go someplace today Hey did you go someplace today ?
				</div>
				<div className={styles.chatBubbleOther}>
					Yes I went to Oxford, how about you ?
				</div>
				<div className={styles.chatBubble}>Was at home mostly</div>
			</div>
			{/* Chat toolbar */}
			<div className={styles.chatToolbar}>
				<div className={styles.chatInputContainer}>
					<form
						style={{ display: "flex", alignItems: "center", height: "100%" }}
					>
						<input
							// biome-ignore lint/a11y/noAutofocus: we like to autofocus as this is a chat app
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
