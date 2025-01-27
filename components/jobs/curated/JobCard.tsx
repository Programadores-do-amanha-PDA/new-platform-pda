import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { JobType } from "@/types/jobs";
import { Cpu, MapPin } from "lucide-react";
import { ReactElement } from "react";

const JobCard = ({
  job,
  cardFooter,
}: {
  job: JobType;
  cardFooter: ReactElement;
}) => {
  return (
    <div className="flex flex-col min-w-80 bg-card text-card-foreground rounded-md p-2 px-4 border justify-start gap-4 shadow-md">
      <div className="space-y-1 w-full flex gap-2 pb-2 !mb-2  items-center justify-start border-b">
        <div className="flex flex-col justify-between">
          <Avatar>
            <AvatarImage src="/assets/linkedin.png" />
            <AvatarFallback>in</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h4 className="font-semibold truncate">{job.title}</h4>
          <p className="text-sm truncate flex gap-2">{job.company}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="size-10 bg-purple-50 rounded-full flex items-center justify-center">
          <MapPin className="size-5" />
        </div>
        <div>
          <p className="text-sm truncate font-semibold">
            {job.details?.locale[0].split(", ")[0]}
          </p>
          <p className="text-sm">{job.details?.workplace_type.join(", ")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="size-10 bg-purple-50 rounded-full flex items-center justify-center">
          <Cpu className="size-5" />
        </div>
        <ul className="flex flex-row gap-2 flex-wrap">
          {job.details?.languages?.map((language, i) => (
            <Badge variant="outline" key={i}>
              {language}
            </Badge>
          ))}
        </ul>
      </div>

      <div className="flex items-center !mt-2 gap-4 pt-2 border-t">{cardFooter}</div>
    </div>
  );
};

export default JobCard;
