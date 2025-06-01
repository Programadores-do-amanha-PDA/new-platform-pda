import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { JobT } from "@/types/jobs";
import { BookOpenText, Cpu, MapPin } from "lucide-react";
import { ReactElement } from "react";

const JobCard = ({
  job,
  cardFooter,
}: {
  job: JobT;
  cardFooter: ReactElement;
}) => {
  return (
    <div className="flex flex-col box-border w-full md:w-80 h-max bg-card text-card-foreground rounded-md p-4 border justify-start gap-4 shadow-md">
      <div
        className="group w-full h-max min-h-10 flex items-center justify-start cursor-pointer overflow-hidden space-x-2 mb-2"
        onClick={() => window.open(job.link, "_blank")}
      >
        <div className="size-10 h-max flex flex-col justify-between">
          <Avatar className="size-10">
            <AvatarImage src="/assets/linkedin.png" />
            <AvatarFallback>in</AvatarFallback>
          </Avatar>
        </div>

        <div className="grow-0! truncate">
          <h4 className="font-semibold group-hover:underline truncate">
            {job.title}
          </h4>
          <p className="text-sm flex gap-2 truncate">{job.company}</p>
        </div>
      </div>

      <div className="w-full h-full flex flex-col space-y-3 pl-1">
        <div className="w-full max-h-16 h-16 flex items-start space-x-2">
          <div className="w-7 max-w-7 min-w-7 h-full bg-blue-100 rounded-full flex items-start py-2 justify-center">
            <BookOpenText className="size-5" />
          </div>

          <p className="text-sm w-2/3 md:w-full h-max">
            {job?.description
              ? job?.description.substring(0, 100) + "..."
              : job?.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-7 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-sm truncate">
              {job.details?.locale[0].split(", ")[0]}
            </p>
            <p className="text-sm">{job.details?.workplace_type.join(", ")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="size-7 bg-blue-100 rounded-full flex items-center justify-center">
            <Cpu className="size-5" />
          </div>
          <ul className="flex flex-row gap-2 flex-wrap">
            {job.details?.languages?.map((language, i) => (
              <Badge variant="outline" className="font-normal" key={i}>
                {language}
              </Badge>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2! gap-4 pt-2">
        {cardFooter}
      </div>
    </div>
  );
};

export default JobCard;
