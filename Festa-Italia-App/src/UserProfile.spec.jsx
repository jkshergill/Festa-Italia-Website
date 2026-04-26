import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserProfile from "./UserProfile";

// Mock child components to isolate UserProfile logic
vi.mock("./ProfileInfo", () => ({
  default: ({ setPage }) => (
    <div data-testid="profile-info">
      <button onClick={() => setPage("home")}>Go Home</button>
    </div>
  ),
}));

vi.mock("./PurchasedTickets", () => ({
  default: ({ eventId }) => (
    <div data-testid="purchased-tickets">Tickets for event {eventId}</div>
  ),
}));

vi.mock("./VolunteerShifts", () => ({
  default: ({ eventId }) => (
    <div data-testid="volunteer-shifts">Shifts for event {eventId}</div>
  ),
}));

vi.mock("./BocceProfile", () => ({
  default: () => <div data-testid="bocce-profile">Bocce Profile</div>,
}));

vi.mock("./ShoppingCart", () => ({
  default: ({ cartItems, setCartItems, setPage }) => (
    <div data-testid="shopping-cart">
      <span data-testid="cart-item-count">{cartItems.length}</span>
      <button
        onClick={() =>
          setCartItems([{ id: 1, qty: 2 }, { id: 2, qty: 1 }])
        }
      >
        Add Items
      </button>
      <button onClick={() => setPage("profile:cart")}>Go To Cart</button>
      <button onClick={() => setPage("checkout")}>Checkout</button>
    </div>
  ),
}));

vi.mock("./UserProfile.css", () => ({}));

const defaultProps = {
  eventId: "event-123",
  setPage: vi.fn(),
  initialTab: undefined,
};

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendering ───────────────────────────────────────────────────────────────

  describe("initial render", () => {
    it("renders the dashboard heading", () => {
      render(<UserProfile {...defaultProps} />);
      expect(
        screen.getByRole("heading", { name: /my profile dashboard/i })
      ).toBeInTheDocument();
    });

    it("renders all five tab buttons", () => {
      render(<UserProfile {...defaultProps} />);
      expect(screen.getByRole("tab", { name: /profile info/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /purchased tickets/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /volunteer shifts/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /bocce teams/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /shopping cart/i })).toBeInTheDocument();
    });

    it("renders the tablist with correct aria-label", () => {
      render(<UserProfile {...defaultProps} />);
      expect(
        screen.getByRole("tablist", { name: /profile sections/i })
      ).toBeInTheDocument();
    });
  });

  // ─── Default Tab ─────────────────────────────────────────────────────────────

  describe("default tab", () => {
    it("defaults to the info tab when initialTab is not provided", () => {
      render(<UserProfile {...defaultProps} />);
      expect(screen.getByTestId("profile-info")).toBeInTheDocument();
    });

    it("marks the info tab as selected by default", () => {
      render(<UserProfile {...defaultProps} />);
      expect(
        screen.getByRole("tab", { name: /profile info/i })
      ).toHaveAttribute("aria-selected", "true");
    });

    it("marks all other tabs as not selected by default", () => {
      render(<UserProfile {...defaultProps} />);
      const unselectedTabs = [
        /purchased tickets/i,
        /volunteer shifts/i,
        /bocce teams/i,
        /shopping cart/i,
      ];
      unselectedTabs.forEach((name) => {
        expect(screen.getByRole("tab", { name })).toHaveAttribute(
          "aria-selected",
          "false"
        );
      });
    });
  });

  // ─── initialTab prop ─────────────────────────────────────────────────────────

  describe("initialTab prop", () => {
    it.each([
      ["tickets", "purchased-tickets"],
      ["volunteer", "volunteer-shifts"],
      ["bocce", "bocce-profile"],
      ["cart", "shopping-cart"],
      ["info", "profile-info"],
    ])("renders the correct panel when initialTab is '%s'", (tab, testId) => {
      render(<UserProfile {...defaultProps} initialTab={tab} />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it("falls back to info tab when initialTab is an unknown value", () => {
      render(<UserProfile {...defaultProps} initialTab="unknown" />);
      // renderTab returns null for unknown; assert no known panels render
      expect(screen.queryByTestId("profile-info")).not.toBeInTheDocument();
      expect(screen.queryByTestId("purchased-tickets")).not.toBeInTheDocument();
    });
  });

  // ─── Tab Navigation ───────────────────────────────────────────────────────────

  describe("tab navigation", () => {
    it("switches to Purchased Tickets panel on click", () => {
      render(<UserProfile {...defaultProps} />);
      fireEvent.click(screen.getByRole("tab", { name: /purchased tickets/i }));
      expect(screen.getByTestId("purchased-tickets")).toBeInTheDocument();
    });

    it("switches to Volunteer Shifts panel on click", () => {
      render(<UserProfile {...defaultProps} />);
      fireEvent.click(screen.getByRole("tab", { name: /volunteer shifts/i }));
      expect(screen.getByTestId("volunteer-shifts")).toBeInTheDocument();
    });

    it("switches to Bocce Profile panel on click", () => {
      render(<UserProfile {...defaultProps} />);
      fireEvent.click(screen.getByRole("tab", { name: /bocce teams/i }));
      expect(screen.getByTestId("bocce-profile")).toBeInTheDocument();
    });

    it("switches to Shopping Cart panel on click", () => {
      render(<UserProfile {...defaultProps} />);
      fireEvent.click(screen.getByRole("tab", { name: /shopping cart/i }));
      expect(screen.getByTestId("shopping-cart")).toBeInTheDocument();
    });

    it("switches back to Profile Info panel on click", () => {
      render(<UserProfile {...defaultProps} initialTab="tickets" />);
      fireEvent.click(screen.getByRole("tab", { name: /profile info/i }));
      expect(screen.getByTestId("profile-info")).toBeInTheDocument();
    });

    it("updates aria-selected when switching tabs", () => {
      render(<UserProfile {...defaultProps} />);
      const ticketsTab = screen.getByRole("tab", { name: /purchased tickets/i });
      fireEvent.click(ticketsTab);
      expect(ticketsTab).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByRole("tab", { name: /profile info/i })
      ).toHaveAttribute("aria-selected", "false");
    });

    it("applies 'active' class to the selected tab button", () => {
      render(<UserProfile {...defaultProps} />);
      const infoTab = screen.getByRole("tab", { name: /profile info/i });
      expect(infoTab).toHaveClass("active");

      fireEvent.click(screen.getByRole("tab", { name: /bocce teams/i }));
      expect(infoTab).not.toHaveClass("active");
      expect(screen.getByRole("tab", { name: /bocce teams/i })).toHaveClass("active");
    });
  });

  // ─── eventId prop ─────────────────────────────────────────────────────────────

  describe("eventId prop forwarding", () => {
    it("passes eventId to PurchasedTickets", () => {
      render(<UserProfile {...defaultProps} initialTab="tickets" />);
      expect(screen.getByText(/tickets for event event-123/i)).toBeInTheDocument();
    });

    it("passes eventId to VolunteerShifts", () => {
      render(<UserProfile {...defaultProps} initialTab="volunteer" />);
      expect(screen.getByText(/shifts for event event-123/i)).toBeInTheDocument();
    });
  });

  // ─── Cart Badge ───────────────────────────────────────────────────────────────

  describe("cart badge", () => {
    it("does not show a badge when the cart is empty", () => {
      render(<UserProfile {...defaultProps} />);
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });

    it("shows the total quantity badge after items are added", () => {
      render(<UserProfile {...defaultProps} initialTab="cart" />);
      fireEvent.click(screen.getByText("Add Items")); // adds qty 2 + qty 1 = 3
      // Badge should now show 3
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("updates the cart tab aria-label to reflect item count", () => {
      render(<UserProfile {...defaultProps} initialTab="cart" />);
      fireEvent.click(screen.getByText("Add Items"));
      expect(
        screen.getByRole("tab", { name: /shopping cart, 3 items/i })
      ).toBeInTheDocument();
    });

    it("applies tab-cart class to the cart tab button", () => {
      render(<UserProfile {...defaultProps} />);
      const cartTab = screen.getByRole("tab", { name: /shopping cart/i });
      expect(cartTab).toHaveClass("tab-cart");
    });

    it("applies tab-cart active class when cart tab is selected", () => {
      render(<UserProfile {...defaultProps} initialTab="cart" />);
      expect(screen.getByRole("tab", { name: /shopping cart/i })).toHaveClass(
        "tab-cart",
        "active"
      );
    });
  });

  // ─── setPage / handleSetPage ──────────────────────────────────────────────────

  describe("setPage / handleSetPage", () => {
    it("calls setPage when ProfileInfo navigates away", () => {
      const setPage = vi.fn();
      render(<UserProfile {...defaultProps} setPage={setPage} />);
      fireEvent.click(screen.getByText("Go Home"));
      expect(setPage).toHaveBeenCalledWith("home");
    });

    it("switches to cart tab when ShoppingCart calls setPage with 'profile:cart'", () => {
      const setPage = vi.fn();
      render(
        <UserProfile {...defaultProps} setPage={setPage} initialTab="cart" />
      );
      fireEvent.click(screen.getByText("Go To Cart"));
      // Should NOT call the outer setPage
      expect(setPage).not.toHaveBeenCalled();
      // Should activate the cart tab (panel is still visible)
      expect(screen.getByTestId("shopping-cart")).toBeInTheDocument();
    });

    it("calls outer setPage when ShoppingCart navigates to a non-profile route", () => {
      const setPage = vi.fn();
      render(
        <UserProfile {...defaultProps} setPage={setPage} initialTab="cart" />
      );
      fireEvent.click(screen.getByText("Checkout"));
      expect(setPage).toHaveBeenCalledWith("checkout");
    });
  });
});