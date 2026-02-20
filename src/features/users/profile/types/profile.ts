export interface Profile {
    id: string;
    full_name: string;
    email: string;
    email_confirmed_at: Date | null;
    phone: string | null;
    bio?: string;
    avatar_url?: string | null;
    created_at?: Date;
    last_sign_in_at?: Date | null;
    updated_at?: Date;
}