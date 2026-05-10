import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BocceProfile from "./BocceProfile";

// ─── Supabase Mock (vi.hoisted to avoid hoisting ReferenceError) ──────────────

const { mockGetUser, mockFrom, mockOrder, mockLimit, mockOr } = vi.hoisted(() => {
  const mockLimit   = vi.fn();
  const mockOrder   = vi.fn(() => ({ limit: mockLimit }));
  const mockOr      = vi.fn();
  const mockGetUser = vi.fn();
  // mockFrom is implemented per-test via setupQueries — defined here so
  // vi.mock below can close over it at hoist time.
  const mockFrom    = vi.fn();

  return { mockGetUser, mockFrom, mockOrder, mockLimit, mockOr };
});

vi.mock("./supabaseClient", () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from:  mockFrom,
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeUser = (metadataOverrides = {}) => ({
  id: "user-abc",
  user_metadata: {
    first_name: "Jane",
    last_name:  "Doe",
    ...metadataOverrides,
  },
});

const makeTeam = (overrides = {}) => ({
  id:           "team-1",
  team_name:    "The Rollers",
  sponsor_name: "Acme Corp",
  player1:      "Jane Doe",
  player2:      "John Smith",
  player3:      null,
  player4:      null,
  confirm:      true,
  ...overrides,
});

// ─── Setup Helpers ────────────────────────────────────────────────────────────

function setupAuth(user = makeUser(), userErr = null) {
  mockGetUser.mockResolvedValue({ data: { user }, error: userErr });
}

// The component makes two supabase.from("bocce_teams") calls:
//   Call 1 (sample): .select() → .order() → .limit()
//   Call 2 (main):   .select() → .or()
//
// Rather than using mockReturnValueOnce (which bleeds across tests when
// clearAllMocks is called), mockFrom itself tracks call count and returns
// the correct chain each time. This is reset fresh on every call to setupQueries.
function setupQueries({
  sampleData = [],
  sampleErr  = null,
  teamsData  = [],
  teamsErr   = null,
} = {}) {
  mockLimit.mockResolvedValue({ data: sampleData, error: sampleErr });
  mockOr.mockResolvedValue({ data: teamsData, error: teamsErr });

  let callCount = 0;
  mockFrom.mockImplementation(() => {
    callCount += 1;
    if (callCount === 1) {
      // Sample query chain: select → order → limit
      return { select: vi.fn(() => ({ order: mockOrder })) };
    }
    // Main query chain: select → or
    return { select: vi.fn(() => ({ or: mockOr })) };
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("BocceProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  // ─── Loading State ──────────────────────────────────────────────────────────

  describe("loading state", () => {
    it("shows the loading message while fetching", () => {
      mockGetUser.mockReturnValue(new Promise(() => {}));
      render(<BocceProfile />);
      expect(screen.getByText(/loading bocce team info/i)).toBeInTheDocument();
    });

    it("removes the loading message after fetch completes", async () => {
      setupAuth();
      setupQueries();
      render(<BocceProfile />);
      await waitFor(() =>
        expect(
          screen.queryByText(/loading bocce team info/i)
        ).not.toBeInTheDocument()
      );
    });
  });

  // ─── Auth Error Handling ──────────────────────────────────────────────────

  describe("auth error handling", () => {
    it("displays the auth error message when getUser fails", async () => {
      setupAuth(null, { message: "Session expired" });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("Session expired")).toBeInTheDocument()
      );
    });

    it("falls back to a default message when the auth error has no message", async () => {
      setupAuth(null, { message: "" });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(
          screen.getByText(/failed to get current user/i)
        ).toBeInTheDocument()
      );
    });

    it("does not query bocce_teams when getUser returns an error", async () => {
      setupAuth(null, { message: "Auth error" });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("Auth error")).toBeInTheDocument()
      );
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("shows no teams and no error when user is null (unauthenticated)", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText(/no bocce team found/i)).toBeInTheDocument()
      );
    });

    it("does not query bocce_teams when user is null", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText(/no bocce team found/i)).toBeInTheDocument()
      );
      expect(mockFrom).not.toHaveBeenCalled();
    });
  });

  // ─── Name Derivation ─────────────────────────────────────────────────────

  describe("name derivation from user_metadata", () => {
    it("derives full name from first_name / last_name", async () => {
      setupAuth(makeUser({ first_name: "Jane", last_name: "Doe" }));
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("The Rollers")).toBeInTheDocument()
      );
      expect(mockOr).toHaveBeenCalledWith(expect.stringContaining("Jane Doe"));
    });

    it("derives full name from firstName / lastName (camelCase)", async () => {
      setupAuth(
        makeUser({
          first_name: undefined,
          last_name:  undefined,
          firstName:  "Jane",
          lastName:   "Doe",
        })
      );
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("The Rollers")).toBeInTheDocument()
      );
      expect(mockOr).toHaveBeenCalledWith(expect.stringContaining("Jane Doe"));
    });

    it("derives full name from given_name / family_name", async () => {
      setupAuth(
        makeUser({
          first_name:  undefined,
          last_name:   undefined,
          given_name:  "Jane",
          family_name: "Doe",
        })
      );
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("The Rollers")).toBeInTheDocument()
      );
      expect(mockOr).toHaveBeenCalledWith(expect.stringContaining("Jane Doe"));
    });

    it("shows an error and skips main query when no name metadata exists", async () => {
      setupAuth(makeUser({ first_name: undefined, last_name: undefined }));
      setupQueries();
      render(<BocceProfile />);
      await waitFor(() =>
        expect(
          screen.getByText(/could not derive first\/last name/i)
        ).toBeInTheDocument()
      );
      expect(mockOr).not.toHaveBeenCalled();
    });

    it("normalises extra whitespace in the derived full name", async () => {
      setupAuth(makeUser({ first_name: "  Jane  ", last_name: "  Doe  " }));
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("The Rollers")).toBeInTheDocument()
      );
      expect(mockOr).toHaveBeenCalledWith(expect.stringContaining("%Jane Doe%"));
    });
  });

  // ─── Supabase Query Construction ─────────────────────────────────────────

  describe("supabase query construction", () => {
    it("queries bocce_teams twice — once for sample, once for main", async () => {
      setupAuth();
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("The Rollers")).toBeInTheDocument()
      );
      expect(mockFrom).toHaveBeenCalledWith("bocce_teams");
      expect(mockFrom).toHaveBeenCalledTimes(2);
    });

    it("limits the sample query to 3 rows ordered by team_name ascending", async () => {
      setupAuth();
      setupQueries();
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText(/no bocce team found/i)).toBeInTheDocument()
      );
      expect(mockOrder).toHaveBeenCalledWith("team_name", { ascending: true });
      expect(mockLimit).toHaveBeenCalledWith(3);
    });

    it("searches all four player columns with an ilike OR pattern", async () => {
      setupAuth(makeUser({ first_name: "Jane", last_name: "Doe" }));
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("The Rollers")).toBeInTheDocument()
      );
      const orArg = mockOr.mock.calls[0][0];
      expect(orArg).toMatch(/player1\.ilike\./);
      expect(orArg).toMatch(/player2\.ilike\./);
      expect(orArg).toMatch(/player3\.ilike\./);
      expect(orArg).toMatch(/player4\.ilike\./);
    });

    it("wraps the full name in % wildcards for the ilike pattern", async () => {
      setupAuth(makeUser({ first_name: "Jane", last_name: "Doe" }));
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("The Rollers")).toBeInTheDocument()
      );
      expect(mockOr).toHaveBeenCalledWith(expect.stringContaining("%Jane Doe%"));
    });
  });

  // ─── Teams Query Error Handling ───────────────────────────────────────────

  describe("teams query error handling", () => {
    it("displays the teams error message when the main query fails", async () => {
      setupAuth();
      setupQueries({ teamsErr: { message: "Permission denied" } });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("Permission denied")).toBeInTheDocument()
      );
    });

    it("falls back to a default message when the teams error has no message", async () => {
      setupAuth();
      setupQueries({ teamsErr: { message: "" } });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(
          screen.getByText(/failed to load bocce teams/i)
        ).toBeInTheDocument()
      );
    });

    it("shows no heading when the main query fails", async () => {
      setupAuth();
      setupQueries({ teamsErr: { message: "DB error" } });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.queryByRole("heading", { name: /my bocce teams/i })).not.toBeInTheDocument()
      );
    });
  });

  // ─── Empty State ──────────────────────────────────────────────────────────

  describe("empty state", () => {
    it("shows the no-team message when the query returns an empty array", async () => {
      setupAuth();
      setupQueries({ teamsData: [] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(
          screen.getByText(/no bocce team found for your profile name/i)
        ).toBeInTheDocument()
      );
    });

    it("shows the no-team message when query data is null", async () => {
      setupAuth();
      setupQueries({ teamsData: null });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(
          screen.getByText(/no bocce team found for your profile name/i)
        ).toBeInTheDocument()
      );
    });
  });

  // ─── Team Card Rendering ──────────────────────────────────────────────────

  describe("team card rendering", () => {
    it("renders the heading when teams are found", async () => {
      setupAuth();
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: /my bocce teams/i })
        ).toBeInTheDocument()
      );
    });

    it("renders the team name", async () => {
      setupAuth();
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("The Rollers")).toBeInTheDocument()
      );
    });

    it("renders the sponsor name", async () => {
      setupAuth();
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText("Acme Corp")).toBeInTheDocument()
      );
    });

    it("falls back to '—' when sponsor_name is null", async () => {
      setupAuth();
      setupQueries({ teamsData: [makeTeam({ sponsor_name: null })] });
      render(<BocceProfile />);
      await waitFor(() => {
        const sponsorRow = screen.getByText(/sponsored by:/i).closest("div");
        expect(sponsorRow).toHaveTextContent("—");
      });
    });

    it("renders 'Yes' when confirm is true", async () => {
      setupAuth();
      setupQueries({ teamsData: [makeTeam({ confirm: true })] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText(/yes/i)).toBeInTheDocument()
      );
    });

    it("renders 'No' when confirm is false", async () => {
      setupAuth();
      setupQueries({ teamsData: [makeTeam({ confirm: false })] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(screen.getByText(/no/i)).toBeInTheDocument()
      );
    });

    it("renders all four player names when all are populated", async () => {
      setupAuth();
      setupQueries({
        teamsData: [
          makeTeam({
            player1: "Alice",
            player2: "Bob",
            player3: "Carol",
            player4: "Dave",
          }),
        ],
      });
      render(<BocceProfile />);
      await waitFor(() => {
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.getByText("Carol")).toBeInTheDocument();
        expect(screen.getByText("Dave")).toBeInTheDocument();
      });
    });

    it("falls back to '—' for null player slots", async () => {
      setupAuth();
      setupQueries({
        teamsData: [makeTeam({ player3: null, player4: null })],
      });
      render(<BocceProfile />);
      await waitFor(() => {
        const dashes = screen.getAllByText("—");
        expect(dashes.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("renders multiple team cards", async () => {
      setupAuth();
      setupQueries({
        teamsData: [
          makeTeam({ id: "t1", team_name: "The Rollers" }),
          makeTeam({ id: "t2", team_name: "The Throwers" }),
        ],
      });
      render(<BocceProfile />);
      await waitFor(() => {
        expect(screen.getByText("The Rollers")).toBeInTheDocument();
        expect(screen.getByText("The Throwers")).toBeInTheDocument();
      });
    });

    it("applies the bocce-team-card class to each card", async () => {
      setupAuth();
      setupQueries({
        teamsData: [
          makeTeam({ id: "t1" }),
          makeTeam({ id: "t2", team_name: "Team 2" }),
        ],
      });
      render(<BocceProfile />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".bocce-team-card");
        expect(cards).toHaveLength(2);
      });
    });
  });

  // ─── normalizeSpaces ──────────────────────────────────────────────────────

  describe("normalizeSpaces (via name derivation)", () => {
    it("collapses multiple internal spaces into one", async () => {
      setupAuth(makeUser({ first_name: "Jane", last_name: "Doe" }));
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(mockOr).toHaveBeenCalledWith(expect.stringContaining("%Jane Doe%"))
      );
    });

    it("trims leading and trailing whitespace from name parts", async () => {
      setupAuth(makeUser({ first_name: "  Jane  ", last_name: "  Doe  " }));
      setupQueries({ teamsData: [makeTeam()] });
      render(<BocceProfile />);
      await waitFor(() =>
        expect(mockOr).toHaveBeenCalledWith(expect.stringContaining("%Jane Doe%"))
      );
    });
  });
});