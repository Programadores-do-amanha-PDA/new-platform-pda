import { ChatInput } from "./components/chat-input";
import { ProjectsPanel } from "./components/projects-panel";

export default function ResumeCorrectionPage() {
    return (
        <main className="w-full h-full flex flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col">
                <div className="w-full h-full flex flex-1 flex-col items-center p-8 gap-10">
                    <div className="w-full max-w-2xl text-center">
                        <h1 className="mb-3 text-4xl font-bold tracking-tight">Bem vindo ao PdA Labs</h1>
                        <p className="text-muted-foreground">
                            Explore as funcionalidades de IA para otimizar seus processos de recrutamento e seleção.
                        </p>
                    </div>
                    <ChatInput />
                </div>
            </div>

            {/* <ProjectsPanel /> */}
        </main>
    );
}
