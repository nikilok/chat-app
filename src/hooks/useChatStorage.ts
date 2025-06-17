import { useCallback, useRef, useState } from "react";

const DB_NAME = import.meta.env.VITE_DB_NAME || "ChatAppDB";
const DB_VERSION = Number.parseInt(import.meta.env.VITE_DB_VERSION || "1", 10);
const STORE_NAME = import.meta.env.VITE_STORE_NAME || "messages";

type ChatMessage = {
	id: number;
	text: string;
	source: "you" | "other";
	timeStamp: string;
	isMessageInAppropriate?: boolean;
};

// Compressed version for storage - uses short property names and numeric values to save space
type CompressedChatMessage = {
	i: number; // id
	t: string; // text
	s: 0 | 1; // source: 0="you", 1="other"
	ts: string; // timeStamp
	ia?: 0 | 1; // isMessageInAppropriate: 0=false, 1=true
};

// Compression/decompression utilities
const compressMessage = (message: ChatMessage): CompressedChatMessage => ({
	i: message.id,
	t: message.text,
	s: message.source === "you" ? 0 : 1,
	ts: message.timeStamp,
	...(message.isMessageInAppropriate !== undefined && {
		ia: message.isMessageInAppropriate ? 1 : 0,
	}),
});

const decompressMessage = (compressed: CompressedChatMessage): ChatMessage => ({
	id: compressed.i,
	text: compressed.t,
	source: compressed.s === 0 ? "you" : "other",
	timeStamp: compressed.ts,
	...(compressed.ia !== undefined && {
		isMessageInAppropriate: compressed.ia === 1,
	}),
});

export function useChatStorage() {
	const pendingMessagesRef = useRef<ChatMessage[]>([]);
	const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const isSyncingRef = useRef(false);
	const nextIdRef = useRef(1);

	const [isLoading, setIsLoading] = useState(false);

	const initDB = useCallback((): Promise<IDBDatabase> => {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					const store = db.createObjectStore(STORE_NAME, {
						keyPath: "i",
					});
					store.createIndex("ts", "ts", { unique: false });
				}
			};
		});
	}, []);

	const syncPendingMessages = async (): Promise<void> => {
		if (isSyncingRef.current || pendingMessagesRef.current.length === 0) {
			return;
		}

		isSyncingRef.current = true;
		const messagesToSync = [...pendingMessagesRef.current];

		try {
			const db = await initDB();
			const transaction = db.transaction([STORE_NAME], "readwrite");
			const store = transaction.objectStore(STORE_NAME);

			for (const message of messagesToSync) {
				store.put(compressMessage(message));
			}

			await new Promise((resolve, reject) => {
				transaction.oncomplete = () => {
					pendingMessagesRef.current = pendingMessagesRef.current.slice(
						messagesToSync.length,
					);
					resolve(undefined);
				};
				transaction.onerror = () => reject(transaction.error);
			});
		} catch (error) {
			console.error("Failed to sync messages:", error);
		} finally {
			isSyncingRef.current = false;
		}
	};

	const startBackgroundSync = () => {
		if (syncIntervalRef.current) return;

		syncIntervalRef.current = setInterval(syncPendingMessages, 2000);

		const handleVisibilityChange = () => {
			if (!document.hidden) {
				syncPendingMessages();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);

		const handleBeforeUnload = () => {
			if (pendingMessagesRef.current.length > 0) {
				syncPendingMessages();
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	};

	const stopBackgroundSync = (): void => {
		if (syncIntervalRef.current) {
			clearInterval(syncIntervalRef.current);
			syncIntervalRef.current = null;
		}
	};

	const generateId = useCallback(() => {
		const id = nextIdRef.current;
		nextIdRef.current += 1;
		return id;
	}, []);

	const initializeNextId = useCallback((maxId: number): void => {
		nextIdRef.current = maxId + 1;
	}, []);

	const createMessage = useCallback(
		(
			text: string,
			source: "you" | "other",
			isMessageInAppropriate?: boolean,
		): ChatMessage => {
			return {
				id: generateId(),
				text,
				source,
				timeStamp: Date.now().toString(),
				isMessageInAppropriate,
			};
		},
		[generateId],
	);

	const queueMessage = (message: ChatMessage): void => {
		pendingMessagesRef.current.push(message);

		if (pendingMessagesRef.current.length >= 10) {
			syncPendingMessages();
		}
	};

	const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
		setIsLoading(true);

		try {
			const db = await initDB();
			const transaction = db.transaction([STORE_NAME], "readonly");
			const store = transaction.objectStore(STORE_NAME);
			const index = store.index("ts");

			return new Promise((resolve, reject) => {
				const request = index.getAll();
				request.onsuccess = () => {
					const compressedMessages = request.result as CompressedChatMessage[];
					const messages = compressedMessages.map(decompressMessage);

					if (messages.length > 0) {
						const maxId = Math.max(...messages.map((m) => m.id));
						initializeNextId(maxId);
					}

					resolve(messages);
				};
				request.onerror = () => reject(request.error);
			});
		} catch (error) {
			console.error("Failed to load messages:", error);
			return [];
		} finally {
			setIsLoading(false);
		}
	}, [initDB, initializeNextId]);

	const clearMessages = async (): Promise<void> => {
		try {
			pendingMessagesRef.current = [];
			nextIdRef.current = 1;

			const db = await initDB();
			const transaction = db.transaction([STORE_NAME], "readwrite");
			const store = transaction.objectStore(STORE_NAME);

			await new Promise((resolve, reject) => {
				const request = store.clear();
				request.onsuccess = () => resolve(undefined);
				request.onerror = () => reject(request.error);
			});
		} catch (error) {
			console.error("Failed to clear messages:", error);
		}
	};

	const bulkAddMessages = useCallback(
		async (messages: ChatMessage[]): Promise<void> => {
			try {
				const db = await initDB();
				const transaction = db.transaction([STORE_NAME], "readwrite");
				const store = transaction.objectStore(STORE_NAME);

				for (const message of messages) {
					store.put(compressMessage(message));
				}

				await new Promise((resolve, reject) => {
					transaction.oncomplete = () => resolve(undefined);
					transaction.onerror = () => reject(transaction.error);
				});
			} catch (error) {
				console.error("Failed to bulk add messages:", error);
			}
		},
		[initDB],
	);

	const forceSync = async (): Promise<void> => {
		await syncPendingMessages();
	};

	const getPendingCount = (): number => {
		return pendingMessagesRef.current.length;
	};

	return {
		isLoading,
		createMessage,
		queueMessage,
		loadMessages,
		clearMessages,
		bulkAddMessages,
		startBackgroundSync,
		stopBackgroundSync,
		forceSync,
		getPendingCount,
	};
}
