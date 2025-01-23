import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

type JobType = {
  title: string;
  company: string;
  link: string;
  icon: string;
};

const JobCard = (job: JobType) => {
  return (
    <div className="flex min-w-80 bg-card text-card-foreground rounded-md p-2 border justify-start gap-4 shadow-md">
      <div className="flex flex-col justify-between">
        <Avatar>
          <AvatarImage src={job.icon} />
          <AvatarFallback>in</AvatarFallback>
        </Avatar>
      </div>
      <div className="space-y-1 w-full">
        <h4 className="text-sm font-semibold truncate">{job.company}</h4>
        <p className="text-sm truncate">{job.title}</p>
        <div className="flex items-center !mt-6 gap-4">
          <Button
            variant={"default"}
            onClick={() => window.open(job.link)}
            className="w-full font-semibold truncate"
          >
            Candidatar
          </Button>
          <Button variant={"ghost"}>
            <Flag />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
