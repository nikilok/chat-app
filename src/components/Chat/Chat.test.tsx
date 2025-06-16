import { render, screen } from "@testing-library/react";
import Chat from "./Chat";

// Mock IntersectionObserver
(global as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
	class {
		disconnect() {}
		observe() {}
		unobserve() {}
	};

// Mock ResizeObserver
(global as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
	disconnect() {}
	observe() {}
	unobserve() {}
};

// Mock Element.prototype methods that virtual scrolling needs
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
	configurable: true,
	value: 100,
});

Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
	configurable: true,
	value: 300,
});

Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
	configurable: true,
	value: 1000,
});

Object.defineProperty(HTMLElement.prototype, "scrollTop", {
	configurable: true,
	value: 0,
	writable: true,
});

describe("Chat component", () => {
	test("renders chat input and initial message", () => {
		render(<Chat />);
		expect(
			screen.getByPlaceholderText("Type a message..."),
		).toBeInTheDocument();
		expect(screen.getByText("hi there")).toBeInTheDocument();
	});
});
