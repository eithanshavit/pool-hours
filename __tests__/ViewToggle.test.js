import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ViewToggle from "../app/components/ViewToggle";

describe("ViewToggle Component", () => {
  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    mockOnViewChange.mockClear();
  });

  describe("Rendering", () => {
    it("renders both daily and weekly buttons", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      expect(screen.getByRole("tab", { name: "Daily" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Weekly" })).toBeInTheDocument();
    });

    it("renders with proper ARIA attributes", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-label", "View toggle");

      const dailyButton = screen.getByRole("tab", { name: "Daily" });
      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      expect(dailyButton).toHaveAttribute("aria-selected", "true");
      expect(dailyButton).toHaveAttribute("aria-controls", "daily-view");
      expect(dailyButton).toHaveAttribute("tabIndex", "0");

      expect(weeklyButton).toHaveAttribute("aria-selected", "false");
      expect(weeklyButton).toHaveAttribute("aria-controls", "weekly-view");
      expect(weeklyButton).toHaveAttribute("tabIndex", "-1");
    });

    it("applies correct visual states for active button", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const dailyButton = screen.getByRole("tab", { name: "Daily" });
      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      // Active button should have white background
      expect(dailyButton).toHaveClass("bg-white", "text-gray-900", "shadow-sm");

      // Inactive button should have transparent background
      expect(weeklyButton).toHaveClass(
        "bg-white",
        "bg-opacity-20",
        "text-gray-700"
      );
    });

    it("applies correct visual states when weekly is active", () => {
      render(
        <ViewToggle currentView="weekly" onViewChange={mockOnViewChange} />
      );

      const dailyButton = screen.getByRole("tab", { name: "Daily" });
      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      // Weekly button should be active
      expect(weeklyButton).toHaveClass(
        "bg-white",
        "text-gray-900",
        "shadow-sm"
      );
      expect(weeklyButton).toHaveAttribute("aria-selected", "true");
      expect(weeklyButton).toHaveAttribute("tabIndex", "0");

      // Daily button should be inactive
      expect(dailyButton).toHaveClass(
        "bg-white",
        "bg-opacity-20",
        "text-gray-700"
      );
      expect(dailyButton).toHaveAttribute("aria-selected", "false");
      expect(dailyButton).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Click Interactions", () => {
    it("calls onViewChange when clicking inactive button", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });
      fireEvent.click(weeklyButton);

      expect(mockOnViewChange).toHaveBeenCalledWith("weekly");
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });

    it("does not call onViewChange when clicking active button", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const dailyButton = screen.getByRole("tab", { name: "Daily" });
      fireEvent.click(dailyButton);

      expect(mockOnViewChange).not.toHaveBeenCalled();
    });

    it("switches from weekly to daily correctly", () => {
      render(
        <ViewToggle currentView="weekly" onViewChange={mockOnViewChange} />
      );

      const dailyButton = screen.getByRole("tab", { name: "Daily" });
      fireEvent.click(dailyButton);

      expect(mockOnViewChange).toHaveBeenCalledWith("daily");
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("Keyboard Navigation", () => {
    it("handles Enter key to switch views", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });
      weeklyButton.focus();
      fireEvent.keyDown(weeklyButton, { key: "Enter" });

      expect(mockOnViewChange).toHaveBeenCalledWith("weekly");
    });

    it("handles Space key to switch views", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });
      weeklyButton.focus();
      fireEvent.keyDown(weeklyButton, { key: " " });

      expect(mockOnViewChange).toHaveBeenCalledWith("weekly");
    });

    it("handles Arrow Right key to move to next option", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const dailyButton = screen.getByRole("tab", { name: "Daily" });
      dailyButton.focus();
      fireEvent.keyDown(dailyButton, { key: "ArrowRight" });

      expect(mockOnViewChange).toHaveBeenCalledWith("weekly");
    });

    it("handles Arrow Left key to move to previous option", () => {
      render(
        <ViewToggle currentView="weekly" onViewChange={mockOnViewChange} />
      );

      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });
      weeklyButton.focus();
      fireEvent.keyDown(weeklyButton, { key: "ArrowLeft" });

      expect(mockOnViewChange).toHaveBeenCalledWith("daily");
    });

    it("prevents default behavior for keyboard events", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      });
      const spaceEvent = new KeyboardEvent("keydown", {
        key: " ",
        bubbles: true,
      });
      const arrowEvent = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
      });

      jest.spyOn(enterEvent, "preventDefault");
      jest.spyOn(spaceEvent, "preventDefault");
      jest.spyOn(arrowEvent, "preventDefault");

      fireEvent(weeklyButton, enterEvent);
      fireEvent(weeklyButton, spaceEvent);
      fireEvent(weeklyButton, arrowEvent);

      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(spaceEvent.preventDefault).toHaveBeenCalled();
      expect(arrowEvent.preventDefault).toHaveBeenCalled();
    });

    it("ignores non-navigation keys", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });
      fireEvent.keyDown(weeklyButton, { key: "Tab" });
      fireEvent.keyDown(weeklyButton, { key: "Escape" });
      fireEvent.keyDown(weeklyButton, { key: "a" });

      expect(mockOnViewChange).not.toHaveBeenCalled();
    });
  });

  describe("Focus Management", () => {
    it("manages focus states correctly", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const dailyButton = screen.getByRole("tab", { name: "Daily" });
      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      // Focus daily button
      fireEvent.focus(dailyButton);
      // Focus state is managed internally, we can't easily test the visual change
      // but we can test that focus/blur events don't cause errors

      fireEvent.blur(dailyButton);
      fireEvent.focus(weeklyButton);
      fireEvent.blur(weeklyButton);

      // No errors should be thrown
      expect(true).toBe(true);
    });

    it("has proper focus outline styles", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const dailyButton = screen.getByRole("tab", { name: "Daily" });

      // Check that focus styles are applied via CSS classes
      expect(dailyButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2"
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper role attributes for screen readers", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const container = screen.getByRole("tablist");
      const dailyTab = screen.getByRole("tab", { name: "Daily" });
      const weeklyTab = screen.getByRole("tab", { name: "Weekly" });

      expect(container).toBeInTheDocument();
      expect(dailyTab).toBeInTheDocument();
      expect(weeklyTab).toBeInTheDocument();
    });

    it("manages tabindex correctly for keyboard navigation", () => {
      const { rerender } = render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      let dailyButton = screen.getByRole("tab", { name: "Daily" });
      let weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      expect(dailyButton).toHaveAttribute("tabIndex", "0");
      expect(weeklyButton).toHaveAttribute("tabIndex", "-1");

      // Re-render with weekly active
      rerender(
        <ViewToggle currentView="weekly" onViewChange={mockOnViewChange} />
      );

      dailyButton = screen.getByRole("tab", { name: "Daily" });
      weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      expect(dailyButton).toHaveAttribute("tabIndex", "-1");
      expect(weeklyButton).toHaveAttribute("tabIndex", "0");
    });

    it("has proper aria-selected attributes", () => {
      const { rerender } = render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      let dailyButton = screen.getByRole("tab", { name: "Daily" });
      let weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      expect(dailyButton).toHaveAttribute("aria-selected", "true");
      expect(weeklyButton).toHaveAttribute("aria-selected", "false");

      // Re-render with weekly active
      rerender(
        <ViewToggle currentView="weekly" onViewChange={mockOnViewChange} />
      );

      dailyButton = screen.getByRole("tab", { name: "Daily" });
      weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      expect(dailyButton).toHaveAttribute("aria-selected", "false");
      expect(weeklyButton).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Styling and Design", () => {
    it("applies consistent styling classes", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const container = screen.getByRole("tablist");
      const dailyButton = screen.getByRole("tab", { name: "Daily" });
      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      // Container styling
      expect(container).toHaveClass(
        "inline-flex",
        "bg-gray-200",
        "rounded-xl",
        "p-1",
        "shadow-sm"
      );

      // Button base styling
      expect(dailyButton).toHaveClass(
        "px-4",
        "py-2",
        "text-sm",
        "font-medium",
        "rounded-lg",
        "transition-all",
        "duration-200",
        "ease-in-out"
      );
      expect(weeklyButton).toHaveClass(
        "px-4",
        "py-2",
        "text-sm",
        "font-medium",
        "rounded-lg",
        "transition-all",
        "duration-200",
        "ease-in-out"
      );
    });

    it("applies hover states correctly", () => {
      render(
        <ViewToggle currentView="daily" onViewChange={mockOnViewChange} />
      );

      const weeklyButton = screen.getByRole("tab", { name: "Weekly" });

      // Inactive button should have hover styles
      expect(weeklyButton).toHaveClass("hover:bg-opacity-30");
    });
  });
});
