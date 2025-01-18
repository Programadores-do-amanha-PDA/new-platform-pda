import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

type JobType = {
  id: string;
  title: string;
  company: string;
  link: string;
};

const JobCard = (job: JobType) => {
  return (
    <div className="flex w-80 bg-card text-card-foreground rounded-md p-2 justify-between space-x-4 shadow-md">
      <Avatar>
        <AvatarImage src="https://github.com/vercel.png" />
        <AvatarFallback>VC</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">{job.company}</h4>
        <p className="text-sm">{job.title}</p>
        <div className="flex items-center !mt-6 gap-4">
          <Button
            variant={"default"}
            onClick={() => window.open(job.link)}
            className="w-full font-semibold"
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
