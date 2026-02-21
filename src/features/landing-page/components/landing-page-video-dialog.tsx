import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CirclePlay } from "lucide-react";

export const LandingPageVideoDialog = () => {
    return (
        <Dialog modal={true}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="w-full sm:w-max cursor-pointer gap-2 font-semibold">
                    <CirclePlay className="size-4" />
                    Assistir Vídeo
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full! max-w-[95vw]!  md:max-w-[70vw]!  overflow-hidden p-1" showCloseButton={false}>
                <DialogTitle className="sr-only">Conheça a Programadores do Amanhã</DialogTitle>
                <iframe
                    className="w-full aspect-video h-auto rounded-lg"
                    src="https://www.youtube.com/embed/I5FkKeaT-2c?si=OQMELJSjOe-x0M1k"
                    title="Conheça a Programadores do Amanhã"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            </DialogContent>
        </Dialog>
    );
};
