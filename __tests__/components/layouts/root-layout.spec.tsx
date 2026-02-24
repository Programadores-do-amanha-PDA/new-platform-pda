
// Mock do Toaster
jest.mock("sileo", () => ({
    Toaster: () => null,
}));

// Mock das fontes
jest.mock("@/utils/fonts", () => ({
    IBMPlexSans: { variable: "font-ibm-sans" },
    IBMPlexMono: { variable: "font-ibm-mono" },
    delaGothicOne: { variable: "font-dela-gothic" },
}));

jest.mock("../../../__mocks__/supabase");

// Mock do logger
jest.mock("@/lib/logger", () => ({
    logger: {
        child: jest.fn(() => ({
            error: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
        })),
    },
}));

// Mock das ações
jest.mock("@/features/auth/shared/actions/utils", () => ({
    getSession: jest.fn(),
}));

// Mock das ações principais
jest.mock("@/features/auth/shared/actions", () => ({
    signOut: jest.fn(),
}));

// Mock das ações de usuário
jest.mock("@/features/auth/shared/actions/user", () => ({
    getCurrentUserAsync: jest.fn(),
}));

// Mock das ações de email
jest.mock("@/features/auth/shared/actions/emails", () => ({
    sendEmailAsync: jest.fn(),
}));

// Mock do store de perfil
jest.mock("@/features/users/profile/store", () => ({
    useUserProfileStore: {
        getState: jest.fn(() => ({
            setProfile: jest.fn(),
            reset: jest.fn(),
        })),
    },
}));

// Mock do store de role
jest.mock("@/features/auth/access-control/stores/user-role/user-role", () => ({
    useUserRoleStore: {
        getState: jest.fn(() => ({
            setUserRole: jest.fn(),
            reset: jest.fn(),
        })),
    },
}));

// Mock do store de enrollments
jest.mock("@/features/enrollments/stores", () => ({
    useUserEnrollmentsStore: {
        getState: jest.fn(() => ({
            setEnrollments: jest.fn(),
            reset: jest.fn(),
        })),
    },
}));

// Mock das ações de usuário
jest.mock("@/features/users/management/actions/full-user-data", () => ({
    getAllCurrentUserDataByIdAsync: jest.fn(),
}));

// Mock do hook de confirmação de auth
jest.mock("@/features/auth/shared/hooks/use-auth-confirmation", () => ({
    __esModule: true,
    default: () => null,
}));

// Mock do hook de PKCE flow
jest.mock("@/features/auth/shared/hooks/process-pkce-flow", () => ({
    processPKCEFlowAsync: jest.fn(),
}));

// Mock do store
jest.mock("@/features/auth/shared/store", () => ({
    useAuthStore: jest.fn(() => ({
        session: null,
        loading: false,
        fetchSession: jest.fn(),
    })),
}));

// Mock do AuthStoreProvider
jest.mock("@/features/auth/shared/provider", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock do index do auth/shared
jest.mock("@/features/auth/shared", () => ({
    AuthStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import RootLayout from "@/components/layouts/root-layout";
import { render } from "@testing-library/react";

describe("Classroom Default Layout", () => {

    it("should render the main", () => {
        const { getByRole } = render(<RootLayout> </RootLayout>);

        expect(getByRole("main")).toBeInTheDocument();
    });

    it("should render children", () => {
        const { getByRole } = render(
            <RootLayout>
                <article>Child Component</article>
            </RootLayout>,
        );

        expect(getByRole("article")).toBeInTheDocument();
    });
});
