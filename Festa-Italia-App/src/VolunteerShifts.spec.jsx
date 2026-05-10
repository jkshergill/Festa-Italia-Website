import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VolunteerShifts from "./VolunteerShifts";

// ─── Supabase Mock (vi.hoisted to avoid hoisting ReferenceError) ──────────────

const { mockGetUser, mockFrom, mockSelect, mockEq, mockOrder } = vi.hoisted(() => {
  const mockOrder  = vi.fn();
  const mockEq     = vi.fn(() => ({ order: mockOrder }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom   = vi.fn(() => ({ select: mockSelect }));
  const mockGetUser = vi.fn();

  return { mockGetUser, mockFrom, mockSelect, mockEq, mockOrder };
});

vi.mock("./supabaseClient", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from:  mockFrom,
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_USER = { id: "user-abc" };

const makeShift = (overrides = {}) => ({
  id:        "shift-1",
  day:       "friday",
  timeframe: "morning",
  confirm:   true,
  booths:    { name: "Info Booth" },
  ...overrides,
});

function setupQuery(data, error = null) {
  mockOrder.mockResolvedValue({ data, error });
}

function setupAuth(user = MOCK_USER, userErr = null) {
  mockGetUser.mockResolvedValue({
    data:  { user },
    error: userErr,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("VolunteerShifts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-wire the chain after clearAllMocks resets all return values
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
  });

  // ─── Loading State ────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows the loading message while fetching", () => {
      mockGetUser.mockReturnValue(new Promise(() => {}));
      render(<VolunteerShifts />);
      expect(
        screen.getByText(/loading your volunteer shifts/i)
      ).toBeInTheDocument();
    });

    it("removes the loading message after fetch completes", async () => {
      setupAuth();
      setupQuery([]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(
          screen.queryByText(/loading your volunteer shifts/i)
        ).not.toBeInTheDocument()
      );
    });
  });

  // ─── Auth Error Handling ──────────────────────────────────────────────────

  describe("auth error handling", () => {
    it("displays the auth error message when getUser fails", async () => {
      setupAuth(null, { message: "Auth service unavailable" });
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(
          screen.getByText("Auth service unavailable")
        ).toBeInTheDocument()
      );
    });

    it("shows 'Not logged in.' when user is null", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText("Not logged in.")).toBeInTheDocument()
      );
    });

    it("shows 'Not logged in.' when userData.user is undefined", async () => {
      mockGetUser.mockResolvedValue({ data: {}, error: null });
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText("Not logged in.")).toBeInTheDocument()
      );
    });

    it("does not query volunteer_signups when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText("Not logged in.")).toBeInTheDocument()
      );
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  // ─── Query Error Handling ─────────────────────────────────────────────────

  describe("query error handling", () => {
    it("displays the query error message when the fetch fails", async () => {
      setupAuth();
      setupQuery(null, { message: "Relation does not exist" });
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(
          screen.getByText("Relation does not exist")
        ).toBeInTheDocument()
      );
    });

  });

  // ─── Supabase Query Construction ──────────────────────────────────────────

  describe("supabase query construction", () => {
    it("queries the 'volunteer_signups' table", async () => {
      setupAuth();
      setupQuery([]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(/volunteer shifts yet/i)).toBeInTheDocument()
      );
      expect(mockFrom).toHaveBeenCalledWith("volunteer_signups");
    });

    it("filters by the logged-in user's id", async () => {
      setupAuth();
      setupQuery([]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(/volunteer shifts yet/i)).toBeInTheDocument()
      );
      expect(mockEq).toHaveBeenCalledWith("user_id", MOCK_USER.id);
    });

    it("orders results by day ascending", async () => {
      setupAuth();
      setupQuery([]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(/volunteer shifts yet/i)).toBeInTheDocument()
      );
      expect(mockOrder).toHaveBeenCalledWith("day", { ascending: true });
    });

    it("selects id, day, timeframe, confirm, and booth name via FK", async () => {
      setupAuth();
      setupQuery([]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(/volunteer shifts yet/i)).toBeInTheDocument()
      );
      const selectArg = mockSelect.mock.calls[0][0];
      expect(selectArg).toMatch(/booths!volunteer_signups_booth_id_fkey/);
    });
  });

  // ─── Empty State ──────────────────────────────────────────────────────────

  describe("empty state", () => {
    it("shows the heading and empty message when there are no shifts", async () => {
      setupAuth();
      setupQuery([]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /my volunteer shifts/i })
        ).toBeInTheDocument();
        expect(
          screen.getByText(/volunteer shifts yet/i)
        ).toBeInTheDocument();
      });
    });

    it("treats a null data response as an empty list", async () => {
      setupAuth();
      setupQuery(null);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(
          screen.getByText(/volunteer shifts yet/i)
        ).toBeInTheDocument()
      );
    });
  });

  // ─── Shift Card Rendering ─────────────────────────────────────────────────

  describe("shift card rendering", () => {
    it("renders the booth name", async () => {
      setupAuth();
      setupQuery([makeShift()]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText("Info Booth")).toBeInTheDocument()
      );
    });

    it("falls back to 'Booth' when booths.name is missing", async () => {
      setupAuth();
      setupQuery([makeShift({ booths: null })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText("Booth")).toBeInTheDocument()
      );
    });

    it("capitalises the first letter of the day", async () => {
      setupAuth();
      setupQuery([makeShift({ day: "saturday" })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(/saturday/i)).toBeInTheDocument()
      );
    });

    it("renders multiple shift cards", async () => {
      setupAuth();
      setupQuery([
        makeShift({ id: "s1", booths: { name: "Food Booth" } }),
        makeShift({ id: "s2", booths: { name: "Games Booth" } }),
      ]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        expect(screen.getByText("Food Booth")).toBeInTheDocument();
        expect(screen.getByText("Games Booth")).toBeInTheDocument();
      });
    });

    it("renders the volunteer-card class on each card", async () => {
      setupAuth();
      setupQuery([makeShift()]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".volunteer-card");
        expect(cards).toHaveLength(1);
      });
    });
  });

  // ─── prettyTimeframe ─────────────────────────────────────────────────────

  describe("prettyTimeframe", () => {
    it.each([
      ["morning", "Morning"],
      ["evening", "Evening"],
      ["night",   "Night"],
      ["MORNING", "Morning"],
      ["EVENING", "Evening"],
      ["NIGHT",   "Night"],
    ])("renders '%s' as '%s'", async (input, expected) => {
      setupAuth();
      setupQuery([makeShift({ timeframe: input })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(new RegExp(expected))).toBeInTheDocument()
      );
    });

    it("renders 'Timeframe TBD' when timeframe is null", async () => {
      setupAuth();
      setupQuery([makeShift({ timeframe: null })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(/timeframe tbd/i)).toBeInTheDocument()
      );
    });

    it("renders 'Timeframe TBD' when timeframe is undefined", async () => {
      setupAuth();
      setupQuery([makeShift({ timeframe: undefined })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(/timeframe tbd/i)).toBeInTheDocument()
      );
    });

    it("renders unrecognised timeframe values as-is", async () => {
      setupAuth();
      setupQuery([makeShift({ timeframe: "Afternoon" })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText(/afternoon/i)).toBeInTheDocument()
      );
    });
  });

  // ─── Confirmation Status ──────────────────────────────────────────────────

  describe("confirmation status", () => {
    it("shows 'Confirmed' when confirm is true", async () => {
      setupAuth();
      setupQuery([makeShift({ confirm: true })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText("Confirmed")).toBeInTheDocument()
      );
    });

    it("shows 'Pending confirmation' when confirm is false", async () => {
      setupAuth();
      setupQuery([makeShift({ confirm: false })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText("Pending confirmation")).toBeInTheDocument()
      );
    });

    it("shows 'Pending confirmation' when confirm is null", async () => {
      setupAuth();
      setupQuery([makeShift({ confirm: null })]);
      render(<VolunteerShifts />);
      await waitFor(() =>
        expect(screen.getByText("Pending confirmation")).toBeInTheDocument()
      );
    });
  });

  // ─── Client-Side Sorting ──────────────────────────────────────────────────

  describe("client-side sorting", () => {
    it("sorts shifts by DAY_ORDER regardless of DB return order", async () => {
      setupAuth();
      setupQuery([
        makeShift({ id: "s1", day: "sunday",   booths: { name: "Sunday Booth"   } }),
        makeShift({ id: "s2", day: "friday",   booths: { name: "Friday Booth"   } }),
        makeShift({ id: "s3", day: "saturday", booths: { name: "Saturday Booth" } }),
      ]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".volunteer-card");
        expect(cards[0]).toHaveTextContent("Friday Booth");
        expect(cards[1]).toHaveTextContent("Saturday Booth");
        expect(cards[2]).toHaveTextContent("Sunday Booth");
      });
    });

    it("sorts shifts on the same day by TIMEFRAME_ORDER (morning → evening → night)", async () => {
      setupAuth();
      setupQuery([
        makeShift({ id: "s1", day: "friday", timeframe: "night",   booths: { name: "Night Shift"   } }),
        makeShift({ id: "s2", day: "friday", timeframe: "morning", booths: { name: "Morning Shift" } }),
        makeShift({ id: "s3", day: "friday", timeframe: "evening", booths: { name: "Evening Shift" } }),
      ]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".volunteer-card");
        expect(cards[0]).toHaveTextContent("Morning Shift");
        expect(cards[1]).toHaveTextContent("Evening Shift");
        expect(cards[2]).toHaveTextContent("Night Shift");
      });
    });

    it("places shifts with an unknown day at the end", async () => {
      setupAuth();
      setupQuery([
        makeShift({ id: "s1", day: "funday",  booths: { name: "Unknown Day"  } }),
        makeShift({ id: "s2", day: "friday",  booths: { name: "Friday Booth" } }),
      ]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".volunteer-card");
        expect(cards[0]).toHaveTextContent("Friday Booth");
        expect(cards[1]).toHaveTextContent("Unknown Day");
      });
    });

    it("places shifts with an unknown timeframe after known ones on the same day", async () => {
      setupAuth();
      setupQuery([
        makeShift({ id: "s1", day: "friday", timeframe: "brunch",  booths: { name: "Brunch Shift"  } }),
        makeShift({ id: "s2", day: "friday", timeframe: "morning", booths: { name: "Morning Shift" } }),
      ]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".volunteer-card");
        expect(cards[0]).toHaveTextContent("Morning Shift");
        expect(cards[1]).toHaveTextContent("Brunch Shift");
      });
    });

    it("handles null day values without throwing", async () => {
      setupAuth();
      setupQuery([
        makeShift({ id: "s1", day: null,     booths: { name: "No Day Booth"  } }),
        makeShift({ id: "s2", day: "friday", booths: { name: "Friday Booth"  } }),
      ]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".volunteer-card");
        expect(cards[0]).toHaveTextContent("Friday Booth");
        expect(cards[1]).toHaveTextContent("No Day Booth");
      });
    });

    it("handles null timeframe values without throwing", async () => {
      setupAuth();
      setupQuery([
        makeShift({ id: "s1", day: "friday", timeframe: null,      booths: { name: "No Time Booth"  } }),
        makeShift({ id: "s2", day: "friday", timeframe: "morning", booths: { name: "Morning Booth"  } }),
      ]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".volunteer-card");
        expect(cards[0]).toHaveTextContent("Morning Booth");
        expect(cards[1]).toHaveTextContent("No Time Booth");
      });
    });

    it("is case-insensitive when sorting days", async () => {
      setupAuth();
      setupQuery([
        makeShift({ id: "s1", day: "SUNDAY",   booths: { name: "Sunday Booth"   } }),
        makeShift({ id: "s2", day: "Friday",   booths: { name: "Friday Booth"   } }),
      ]);
      render(<VolunteerShifts />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".volunteer-card");
        expect(cards[0]).toHaveTextContent("Friday Booth");
        expect(cards[1]).toHaveTextContent("Sunday Booth");
      });
    });
  });
});