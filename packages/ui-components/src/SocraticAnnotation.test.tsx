
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SocraticAnnotation } from "./SocraticAnnotation.js";

describe("SocraticAnnotation", () => {
  it("renders the message", () => {
    render(<SocraticAnnotation message="Hello, this is a test message." />);
    expect(screen.getByText("Hello, this is a test message.")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<SocraticAnnotation title="Custom Title" message="Message" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders suggestions and handles clicks", () => {
    const handleSuggestionClick = vi.fn();
    render(
      <SocraticAnnotation
        message="Message"
        suggestions={["Suggestion 1", "Suggestion 2"]}
        onSuggestionClick={handleSuggestionClick}
      />
    );

    const suggestion1 = screen.getByText("Suggestion 1");
    const suggestion2 = screen.getByText("Suggestion 2");

    expect(suggestion1).toBeInTheDocument();
    expect(suggestion2).toBeInTheDocument();

    fireEvent.click(suggestion1);
    expect(handleSuggestionClick).toHaveBeenCalledWith("Suggestion 1");
  });

  it("handles form submission", () => {
    const handleSubmit = vi.fn();
    render(<SocraticAnnotation message="Message" onSubmit={handleSubmit} />);

    const input = screen.getByPlaceholderText("Ask a follow-up question...");
    const submitButton = screen.getByRole("button", { name: "Send" });

    // Initially submit button might be disabled if it's tied to input state
    expect(submitButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "How does this work?" } });
    
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith("How does this work?");
    // Input should be cleared
    expect(input).toHaveValue("");
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(<SocraticAnnotation message="Message" onClose={handleClose} />);

    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
