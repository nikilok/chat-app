import { render, screen } from "@testing-library/react";
import Chat from "./Chat";

describe("Chat component", () => {
	test("renders chat input and initial message", () => {
		render(<Chat />);
		expect(
			screen.getByPlaceholderText("Type a message..."),
		).toBeInTheDocument();
		expect(screen.getByText("hi there")).toBeInTheDocument();
	});
});
