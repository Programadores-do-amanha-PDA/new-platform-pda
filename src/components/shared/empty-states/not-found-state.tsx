import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface NotFoundStateProps {
  title: string;
  description: string;
  href: string;
  buttonText: string;
  icon?: React.ReactNode;
}

export function NotFoundState({
  title,
  description,
  href,
  buttonText,
  icon,
}: NotFoundStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" asChild>
          <Link href={href} className="hover:underline font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4 rotate-2" />
            {buttonText}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
