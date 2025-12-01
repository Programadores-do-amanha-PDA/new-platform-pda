import { KPIsTabs } from "./components";

export default function KPIsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">KPIs</h1>
            <div>
                <KPIsTabs />
            </div>
        </div>
    );
}
