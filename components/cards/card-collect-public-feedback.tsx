import { ArrowRight, Bug } from "lucide-react";
import { Button } from "../ui/button";

const CardCollectPublicFeedback = () => {
  return (
    <div className="w-full md:max-w-64 max-h-72  bg-red-100 border border-destructive shadow-card rounded-xl p-6 flex flex-col items-center justify-between gap-4">
      <div className="flex flex-col gap-4 items-center justify-start">

      <Bug className="size-10 text-destructive" />
      <div className="flex flex-col gap-1 items-center justify-center">
        <h1 className="text-lg font-bold text-center text-card-foreground">
          Encontrou algum bug?
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Acaso encontrar algum bug ou tiver algum sugestão ou recomendação, por
          favor nos envie através do formulário abaixo!
        </p>
      </div>
      </div>
      <Button
        variant="ghost"
        className="text-card-foreground mt-2 underline"
        onClick={() =>
          window.open(
            "https://docs.google.com/forms/d/e/1FAIpQLScF0plht-TJTpp9G_9flJ2ABjpV_kHdHg9cf-dnAa7OBXA0Ug/viewform?usp=dialog"
          )
        }
      >
        Enviar sugestão ou bug
        <ArrowRight className="size-4 text-muted-foreground -rotate-12" />
      </Button>
    </div>
  );
};

export default CardCollectPublicFeedback;