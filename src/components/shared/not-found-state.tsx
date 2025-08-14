import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NotFoundStateProps {
  title: string;
  subtitle: string;
  href: string;
  buttonText: string;
}

export function NotFoundState({ title, subtitle, href, buttonText }: NotFoundStateProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4 py-6 overflow-hidden">
      <h2 className="font-bold text-2xl text-foreground">
        {title}
      </h2>
      <p className="text-muted-foreground">
        {subtitle}
      </p>
      <Button variant="outline" asChild>
        <Link
          href={href}
          className="hover:underline font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4 rotate-2" />
          {buttonText}
        </Link>
      </Button>
    </div>
  );
}