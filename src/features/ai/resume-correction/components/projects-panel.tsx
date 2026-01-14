import { MoreHorizontal } from "lucide-react";

const projects = [
    { title: "New Project", description: "...", color: "bg-gray-200" },
    {
        title: "Learning From 100 Years o...",
        description: "For athletes, high altitude prod...",
        color: "bg-orange-200",
    },
    {
        title: "Research officiants",
        description: "Maxwell's equations—the foun...",
        color: "bg-yellow-200",
    },
    {
        title: "What does a senior lead de...",
        description: "Physiological respiration involv...",
        color: "bg-green-200",
    },
    {
        title: "Write a sweet note to your...",
        description: "In the eighteenth century the G...",
        color: "bg-blue-200",
    },
    {
        title: "Meet with cake bakers",
        description: "Physical space is often conceiv...",
        color: "bg-purple-200",
    },
    {
        title: "Meet with cake bakers",
        description: "Physical space is often conceiv...",
        color: "bg-pink-200",
    },
];

export function ProjectsPanel() {
    return (
        <aside className="flex h-full w-72 flex-col border-l border-border bg-muted/30">
            <div className="flex items-center justify-between p-4">
                <h2 className="text-sm font-medium">
                    Projects <span className="text-muted-foreground">(7)</span>
                </h2>
                <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="size-5" />
                </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg bg-background p-3 transition-colors hover:bg-muted/50"
                    >
                        <div className={`mt-1 size-2 shrink-0 rounded-full ${project.color}`} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{project.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{project.description}</p>
                        </div>
                        <div className="size-5 shrink-0 rounded border border-border" />
                    </div>
                ))}
            </div>
        </aside>
    );
}
