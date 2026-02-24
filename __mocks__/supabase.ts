export const supabaseClient = jest.mock("@/lib/supabase/client", () => ({
    __esModule: true,
    default: () => ({
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { id: "alice", name: "Alice" },
                error: null,
            }),
        })),
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data: { user: { id: "alice", name: "Alice" } },
                error: null,
            }),
        },
    }),
}));

export const supabaseMiddlewares = jest.mock("@/lib/supabase/middlewares", () => ({
    updateSession: jest.fn(),
}));
