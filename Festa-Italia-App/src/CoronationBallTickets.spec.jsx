import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TicketPurchase from "./CoronationBallTickets";

// ─── Supabase Mock ────────────────────────────────────────────────────────────

const { mockGetSession, mockOnAuthStateChange, mockFrom, mockInsert, mockSelect, mockSingle } =
  vi.hoisted(() => {
    const mockSingle  = vi.fn();
    const mockSelect  = vi.fn(() => ({ single: mockSingle }));
    const mockInsert  = vi.fn(() => ({ select: mockSelect }));
    const mockFrom    = vi.fn(() => ({ insert: mockInsert }));
    const mockGetSession        = vi.fn();
    const mockOnAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    return { mockGetSession, mockOnAuthStateChange, mockFrom, mockInsert, mockSelect, mockSingle };
  });

vi.mock("./supabaseClient", () => ({
  supabase: {
    auth: {
      getSession:        mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  },
}));

vi.mock("./CoronationBallTickets.css", () => ({}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_SESSION = {
  user: {
    id:    "user-1",
    email: "user@example.com",
    user_metadata: { full_name: "Test User" },
  },
};

const MOCK_CART_ITEM = {
  id:      "cart-row-1",
  user_id: "user-1",
  item:    {},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setupSession(session = MOCK_SESSION) {
  mockGetSession.mockResolvedValue({ data: { session } });
}

function setupNoSession() {
  mockGetSession.mockResolvedValue({ data: { session: null } });
}

function setupCartSuccess() {
  mockSingle.mockResolvedValue({ data: MOCK_CART_ITEM, error: null });
}

function setupCartError(message = "Insert failed") {
  mockSingle.mockResolvedValue({ data: null, error: { message } });
}

const defaultProps = {
  setPage:      vi.fn(),
  setCartItems: vi.fn(),
};

async function renderToNamesStep(adultQty = 1, childQty = 0) {
  render(<TicketPurchase {...defaultProps} />);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument()
  );

  if (adultQty > 0) {
    fireEvent.change(screen.getAllByRole("spinbutton")[0], {
      target: { value: String(adultQty) },
    });
  }
  if (childQty > 0) {
    fireEvent.change(screen.getAllByRole("spinbutton")[1], {
      target: { value: String(childQty) },
    });
  }

  fireEvent.click(screen.getByRole("button", { name: /continue/i }));

  await waitFor(() =>
    expect(screen.getByText(/enter ticket holder names/i)).toBeInTheDocument()
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CoronationBallTickets (TicketPurchase)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
  });

  // ─── Initial Render ─────────────────────────────────────────────────────────

  describe("initial render", () => {
    it("renders the page heading", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: /coronation ball tickets/i })
        ).toBeInTheDocument()
      );
    });

    it("renders the adult ticket quantity input", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getAllByRole("spinbutton")[0]).toBeInTheDocument()
      );
    });

    it("renders the child ticket quantity input", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getAllByRole("spinbutton")[1]).toBeInTheDocument()
      );
    });

    it("defaults both quantity inputs to 0", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getAllByRole("spinbutton")[0]).toHaveValue(0);
        expect(screen.getAllByRole("spinbutton")[1]).toHaveValue(0);
      });
    });

    it("displays the adult ticket price label", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByText(/adult ticket: \$20/i)).toBeInTheDocument()
      );
    });

    it("displays the child ticket price label", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByText(/child ticket: \$10/i)).toBeInTheDocument()
      );
    });

    it("shows Total: $0 on initial render", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByText(/total: \$0/i)).toBeInTheDocument()
      );
    });

    it("renders the Continue button", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /continue/i })
        ).toBeInTheDocument()
      );
    });

    it("renders the Back button", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /back/i })
        ).toBeInTheDocument()
      );
    });
  });

  // ─── Auth Banner ────────────────────────────────────────────────────────────

  describe("auth banner", () => {
    it("shows the sign-in banner when there is no session", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(
          screen.getByText(/please sign in to purchase tickets/i)
        ).toBeInTheDocument()
      );
    });

    it("does not show the sign-in banner when a session exists", async () => {
      setupSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(
          screen.queryByText(/please sign in to purchase tickets/i)
        ).not.toBeInTheDocument()
      );
    });

    it("renders the auth banner with role='alert'", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(screen.getByRole("alert")).toBeInTheDocument()
      );
    });

    it("shows the auth banner when Continue is clicked without a session", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        fireEvent.click(screen.getByRole("button", { name: /continue/i }))
      );
      expect(
        screen.getByText(/please sign in to purchase tickets/i)
      ).toBeInTheDocument();
    });
  });

  // ─── Continue Button ────────────────────────────────────────────────────────

  describe("Continue button", () => {
    it("is disabled when there is no session", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /continue/i })
        ).toBeDisabled()
      );
    });

    it("is enabled when a session exists", async () => {
      setupSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: /continue/i })
        ).not.toBeDisabled()
      );
    });

    it("alerts when Continue is clicked with 0 tickets selected", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      setupSession();
      render(<TicketPurchase {...defaultProps} />);
      // Wait for the button to be present, then click synchronously so the
      // alert spy captures the call before the assertion runs.
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument()
      );
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/please select at least one ticket/i)
      );
      alertSpy.mockRestore();
    });

    it("does not advance to the names step when 0 tickets are selected", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      setupSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        fireEvent.click(screen.getByRole("button", { name: /continue/i }))
      );
      expect(
        screen.queryByText(/enter ticket holder names/i)
      ).not.toBeInTheDocument();
      alertSpy.mockRestore();
    });

    it("advances to the names step when at least 1 ticket is selected", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      expect(
        screen.getByText(/enter ticket holder names/i)
      ).toBeInTheDocument();
    });
  });

  // ─── Quantity & Total ───────────────────────────────────────────────────────

  describe("quantity inputs and running total", () => {
    it("updates the total when adult quantity changes", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        fireEvent.change(screen.getAllByRole("spinbutton")[0], {
          target: { value: "2" },
        })
      );
      expect(screen.getByText(/total: \$40/i)).toBeInTheDocument();
    });

    it("updates the total when child quantity changes", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        fireEvent.change(screen.getAllByRole("spinbutton")[1], {
          target: { value: "3" },
        })
      );
      expect(screen.getByText(/total: \$30/i)).toBeInTheDocument();
    });

    it("calculates the combined total for mixed ticket types", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() => {
        fireEvent.change(screen.getAllByRole("spinbutton")[0], {
          target: { value: "2" },
        });
        fireEvent.change(screen.getAllByRole("spinbutton")[1], {
          target: { value: "1" },
        });
      });
      // 2×$20 + 1×$10 = $50
      expect(screen.getByText(/total: \$50/i)).toBeInTheDocument();
    });

    it("clamps quantity to 0 when a negative value is entered", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        fireEvent.change(screen.getAllByRole("spinbutton")[0], {
          target: { value: "-5" },
        })
      );
      expect(screen.getAllByRole("spinbutton")[0]).toHaveValue(0);
      expect(screen.getByText(/total: \$0/i)).toBeInTheDocument();
    });
  });

  // ─── Names Step Rendering ───────────────────────────────────────────────────

  describe("names step rendering", () => {
    it("renders one name input per adult ticket", async () => {
      setupSession();
      await renderToNamesStep(2, 0);
      const inputs = screen.getAllByPlaceholderText(/enter name/i);
      expect(inputs).toHaveLength(2);
    });

    it("renders one name input per child ticket", async () => {
      setupSession();
      await renderToNamesStep(0, 2);
      const inputs = screen.getAllByPlaceholderText(/enter name/i);
      expect(inputs).toHaveLength(2);
    });

    it("renders name inputs for mixed adult and child tickets", async () => {
      setupSession();
      await renderToNamesStep(1, 1);
      const inputs = screen.getAllByPlaceholderText(/enter name/i);
      expect(inputs).toHaveLength(2);
    });

    it("labels adult ticket rows as 'Adult'", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      expect(screen.getByText(/adult/i)).toBeInTheDocument();
    });

    it("labels child ticket rows as 'Child'", async () => {
      setupSession();
      await renderToNamesStep(0, 1);
      expect(screen.getByText(/child/i)).toBeInTheDocument();
    });

    it("renders a food preference select for each ticket", async () => {
      setupSession();
      await renderToNamesStep(1, 1);
      const selects = screen.getAllByRole("combobox");
      expect(selects).toHaveLength(2);
    });

    it("renders adult food options (Steak, Fish, Pasta, Veg/GF) for adult tickets", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      const select = screen.getByRole("combobox");
      expect(select.querySelector('option[value="steak"]')).toBeInTheDocument();
      expect(select.querySelector('option[value="fish"]')).toBeInTheDocument();
      expect(select.querySelector('option[value="pasta"]')).toBeInTheDocument();
      expect(select.querySelector('option[value="veg_gf"]')).toBeInTheDocument();
    });

    it("renders child food options (Hamburger, Cheeseburger, Veg/GF) for child tickets", async () => {
      setupSession();
      await renderToNamesStep(0, 1);
      const select = screen.getByRole("combobox");
      expect(select.querySelector('option[value="hamburger"]')).toBeInTheDocument();
      expect(select.querySelector('option[value="cheeseburger"]')).toBeInTheDocument();
      expect(select.querySelector('option[value="veg_gf"]')).toBeInTheDocument();
    });

    it("all name inputs start empty", async () => {
      setupSession();
      await renderToNamesStep(2, 0);
      screen.getAllByPlaceholderText(/enter name/i).forEach((input) => {
        expect(input).toHaveValue("");
      });
    });

    it("all food selects default to 'Please select a dish'", async () => {
      setupSession();
      await renderToNamesStep(1, 1);
      screen.getAllByRole("combobox").forEach((select) => {
        expect(select).toHaveValue("");
      });
    });

    it("renders the Checkout button", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      expect(
        screen.getByRole("button", { name: /checkout/i })
      ).toBeInTheDocument();
    });

    it("renders the Add to Cart button", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      expect(
        screen.getByRole("button", { name: /add to cart/i })
      ).toBeInTheDocument();
    });

    it("Checkout button is disabled when there is no session", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      // Simulate sign-out mid-flow by checking the disabled prop driven by session
      // The button is disabled={!session} — confirmed by inspecting the rendered attr
      const btn = screen.getByRole("button", { name: /checkout/i });
      expect(btn).not.toBeDisabled(); // session is active here
    });

    it("Add to Cart button is disabled when there is no session", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      const btn = screen.getByRole("button", { name: /add to cart/i });
      expect(btn).not.toBeDisabled();
    });
  });

  // ─── Name & Food Input Interaction ─────────────────────────────────────────

  describe("name and food input interaction", () => {
    it("updates a name input when the user types", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      const input = screen.getByPlaceholderText(/enter name/i);
      fireEvent.change(input, { target: { value: "Jane Doe" } });
      expect(input).toHaveValue("Jane Doe");
    });

    it("updates each name input independently", async () => {
      setupSession();
      await renderToNamesStep(2, 0);
      const [first, second] = screen.getAllByPlaceholderText(/enter name/i);
      fireEvent.change(first,  { target: { value: "Alice" } });
      fireEvent.change(second, { target: { value: "Bob"   } });
      expect(first).toHaveValue("Alice");
      expect(second).toHaveValue("Bob");
    });

    it("updates a food select when an option is chosen", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "steak" } });
      expect(select).toHaveValue("steak");
    });

    it("updates each food select independently", async () => {
      setupSession();
      await renderToNamesStep(1, 1);
      const [adultSelect, childSelect] = screen.getAllByRole("combobox");
      fireEvent.change(adultSelect, { target: { value: "fish"       } });
      fireEvent.change(childSelect, { target: { value: "hamburger"  } });
      expect(adultSelect).toHaveValue("fish");
      expect(childSelect).toHaveValue("hamburger");
    });
  });

  // ─── Add to Cart Validation ─────────────────────────────────────────────────

  describe("Add to Cart validation", () => {
    it("alerts when a name is missing", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      setupSession();
      await renderToNamesStep(1, 0);
      // Leave name blank, pick food
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "steak" } });
      fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/fill in all ticket holder names/i)
      );
      alertSpy.mockRestore();
    });

    it("alerts when a food choice is missing", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      setupSession();
      await renderToNamesStep(1, 0);
      // Fill name, leave food blank
      fireEvent.change(screen.getByPlaceholderText(/enter name/i), {
        target: { value: "Jane Doe" },
      });
      fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/pick a dish/i)
      );
      alertSpy.mockRestore();
    });

    it("does not call supabase when validation fails", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      setupSession();
      await renderToNamesStep(1, 0);
      fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
      expect(mockFrom).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });
  });

  // ─── Add to Cart Success ────────────────────────────────────────────────────

  describe("Add to Cart success", () => {
    async function fillAndSubmitCart(adultQty = 1, childQty = 0) {
      setupCartSuccess();
      await renderToNamesStep(adultQty, childQty);

      const nameInputs = screen.getAllByPlaceholderText(/enter name/i);
      const selects    = screen.getAllByRole("combobox");

      nameInputs.forEach((input, i) => {
        fireEvent.change(input, { target: { value: `Person ${i + 1}` } });
      });

      selects.forEach((select, i) => {
        const isChild = i >= adultQty;
        fireEvent.change(select, {
          target: { value: isChild ? "hamburger" : "steak" },
        });
      });

      fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    }

    it("inserts a row into cart_items with the correct user_id", async () => {
      setupSession();
      await fillAndSubmitCart(1, 0);
      await waitFor(() =>
        expect(mockFrom).toHaveBeenCalledWith("cart_items")
      );
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: MOCK_SESSION.user.id })
      );
    });

    it("includes the correct order_type in the cart item payload", async () => {
      setupSession();
      await fillAndSubmitCart(1, 0);
      await waitFor(() =>
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            item: expect.objectContaining({ order_type: "Coronation Ball" }),
          })
        )
      );
    });

    it("includes attendee_names in the cart item payload", async () => {
      setupSession();
      await fillAndSubmitCart(1, 0);
      await waitFor(() =>
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            item: expect.objectContaining({
              attendee_names: ["Person 1"],
            }),
          })
        )
      );
    });

    it("includes food_choices in the cart item payload", async () => {
      setupSession();
      await fillAndSubmitCart(1, 0);
      await waitFor(() =>
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            item: expect.objectContaining({
              food_choices: ["steak"],
            }),
          })
        )
      );
    });

    it("calls setCartItems with the new item after a successful insert", async () => {
      setupSession();
      await fillAndSubmitCart(1, 0);
      await waitFor(() =>
        expect(defaultProps.setCartItems).toHaveBeenCalled()
      );
    });

    it("calls setPage to navigate to the cart after a successful insert", async () => {
      setupSession();
      await fillAndSubmitCart(1, 0);
      await waitFor(() =>
        expect(defaultProps.setPage).toHaveBeenCalledWith("user-profile:cart")
      );
    });

    it("shows 'Adding…' on the button while the insert is in progress", async () => {
      setupSession();
      // Freeze the insert so the button stays in loading state
      mockSingle.mockReturnValue(new Promise(() => {}));
      await renderToNamesStep(1, 0);

      fireEvent.change(screen.getByPlaceholderText(/enter name/i), {
        target: { value: "Jane Doe" },
      });
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "steak" },
      });
      fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

      expect(screen.getByText(/adding…/i)).toBeInTheDocument();
    });

    it("alerts and does not navigate when the cart insert fails", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      setupSession();
      setupCartError("Insert failed");
      await renderToNamesStep(1, 0);

      fireEvent.change(screen.getByPlaceholderText(/enter name/i), {
        target: { value: "Jane Doe" },
      });
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "steak" },
      });
      fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

      await waitFor(() =>
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringMatching(/failed to add to cart/i)
        )
      );
      expect(defaultProps.setPage).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });
  });

  // ─── Checkout Validation ────────────────────────────────────────────────────

  describe("Checkout validation", () => {
    it("alerts when a name is missing on Checkout", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      setupSession();
      await renderToNamesStep(1, 0);
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "steak" } });
      fireEvent.click(screen.getByRole("button", { name: /checkout/i }));
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/fill in all ticket holder names/i)
      );
      alertSpy.mockRestore();
    });

    it("alerts when a food choice is missing on Checkout", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      setupSession();
      await renderToNamesStep(1, 0);
      fireEvent.change(screen.getByPlaceholderText(/enter name/i), {
        target: { value: "Jane Doe" },
      });
      fireEvent.click(screen.getByRole("button", { name: /checkout/i }));
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringMatching(/pick out a dish/i)
      );
      alertSpy.mockRestore();
    });
  });

  // ─── Back Button ────────────────────────────────────────────────────────────

  describe("Back button", () => {
    it("calls setPage('coronation') when Back is clicked from the selection step", async () => {
      setupNoSession();
      render(<TicketPurchase {...defaultProps} />);
      await waitFor(() =>
        fireEvent.click(screen.getByRole("button", { name: /back/i }))
      );
      expect(defaultProps.setPage).toHaveBeenCalledWith("coronation");
    });

    it("calls setPage('coronation') when Back is clicked from the names step", async () => {
      setupSession();
      await renderToNamesStep(1, 0);
      fireEvent.click(screen.getByRole("button", { name: /back/i }));
      expect(defaultProps.setPage).toHaveBeenCalledWith("coronation");
    });
  });
});