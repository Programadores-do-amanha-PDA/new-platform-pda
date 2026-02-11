import { KPIsTabs } from "./components";

export default function KPIsPage() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full h-full overflow-hidden">
                <KPIsTabs />
            </div>
        </div>
    );
}
