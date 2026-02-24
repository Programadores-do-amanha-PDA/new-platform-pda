import { sileo, SileoOptions, SileoPosition, SileoStyles } from "sileo";

interface SileoPromiseOptions<T = unknown> {
    loading: Pick<SileoOptions, "title" | "icon">;
    success: SileoOptions | ((data: T) => SileoOptions);
    error: SileoOptions | ((err: unknown) => SileoOptions);
    action?: SileoOptions | ((data: T) => SileoOptions);
    position?: SileoPosition;
}

export const toast = {
    success: ({ title, description }: SileoStyles) => {
        sileo.success({
            title: title,
            description: description,
            position: "top-right",
        });
    },
    error: ({ title, description }: SileoStyles) => {
        sileo.error({
            title: title,
            description: description,
            position: "top-left",
        });
    },
    info: ({ title, description }: SileoStyles) => {
        sileo.info({
            title: title,
            description: description,
            position: "top-center",
        });
    },
    promise: async <T>(promise: Promise<T> | (() => Promise<T>), { loading, success, error }: SileoPromiseOptions<T>) => {
        return sileo.promise(promise, {
            loading: { ...loading },
            success: { ...success },
            error: { ...error },
            position: loading ? "top-center" : success ? "top-right" : "top-right",
        });
    },
    dismiss: (id: string) => {
        sileo.dismiss(id);
    },
    clear: () => {
        sileo.clear();
    },
};
