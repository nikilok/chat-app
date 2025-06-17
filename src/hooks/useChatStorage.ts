import { useCallback, useRef } from "react";

type ChatMessage = {
    id: number;
    text: string;
    source: "you" | "other";
    timeStamp: string;
    isMessageInAppropriate?: boolean;
};

const DB_NAME = "ChatAppDB";
const DB_VERSION = 1;
const STORE_NAME = "messages";

export function useChatStorage() {
    const pendingMessagesRef = useRef<ChatMessage[]>([]);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isSyncingRef = useRef(false);

    const initDB = useCallback((): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: "id",
                    });
                    store.createIndex("timeStamp", "timeStamp", { unique: false });
                }
            };
        });
    }, []);

    const syncPendingMessages = useCallback(async (): Promise<void> => {
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
                store.put(message);
            }

            await new Promise((resolve, reject) => {
                transaction.oncomplete = () => {
                    pendingMessagesRef.current = pendingMessagesRef.current.slice(
                        messagesToSync.length,
                    );
                    resolve(void 0);
                };
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (error) {
            console.error("Failed to sync messages:", error);
        } finally {
            isSyncingRef.current = false;
        }
    }, [initDB]);

    const startBackgroundSync = useCallback(() => {
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
    }, [syncPendingMessages]);

    const stopBackgroundSync = useCallback(() => {
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
        }
    }, []);

    const queueMessage = useCallback(
        (message: ChatMessage): void => {
            pendingMessagesRef.current.push(message);

            if (pendingMessagesRef.current.length >= 10) {
                syncPendingMessages();
            }
        },
        [syncPendingMessages],
    );

    const loadMessages = useCallback(async (): Promise<ChatMessage[]> => {
        try {
            const db = await initDB();
            const transaction = db.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index("timeStamp");

            return new Promise((resolve, reject) => {
                const request = index.getAll();
                request.onsuccess = () => {
                    const messages = request.result;
                    resolve(messages);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Failed to load messages:", error);
            return [];
        }
    }, [initDB]);

    const clearMessages = useCallback(async (): Promise<void> => {
        try {
            pendingMessagesRef.current = [];

            const db = await initDB();
            const transaction = db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve(void 0);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Failed to clear messages:", error);
        }
    }, [initDB]);

    const bulkAddMessages = useCallback(
        async (messages: ChatMessage[]): Promise<void> => {
            try {
                const db = await initDB();
                const transaction = db.transaction([STORE_NAME], "readwrite");
                const store = transaction.objectStore(STORE_NAME);

                for (const message of messages) {
                    store.put(message);
                }

                await new Promise((resolve, reject) => {
                    transaction.oncomplete = () => resolve(void 0);
                    transaction.onerror = () => reject(transaction.error);
                });
            } catch (error) {
                console.error("Failed to bulk add messages:", error);
            }
        },
        [initDB],
    );

    const forceSync = useCallback(async (): Promise<void> => {
        await syncPendingMessages();
    }, [syncPendingMessages]);

    const getPendingCount = useCallback((): number => {
        return pendingMessagesRef.current.length;
    }, []);

    return {
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
