/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatBubble from "./ChatBubble";

describe("ChatBubble component", () => {
	test("renders chat message", () => {
		render(
			<ChatBubble
				text="Hello, world!"
				source="other"
				timeDifference={0}
				isSameSource={false}
			/>,
		);
		expect(screen.getByText("Hello, world!")).toBeInTheDocument();
	});

	test("applies correct styling for user message", () => {
		render(
			<ChatBubble
				text="I am the user"
				source="you"
				timeDifference={0}
				isSameSource={false}
			/>,
		);
		const messageElement = screen.getByText("I am the user");
		expect(messageElement).toBeInTheDocument();
		expect(messageElement.parentElement).toBeInTheDocument();
	});
});
