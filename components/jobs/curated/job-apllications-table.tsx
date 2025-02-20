import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const JobApplicationsTable = ({
  jobApplicationStatistics,
}: {
  jobApplicationStatistics: {
    applied: number;
    accepted: number;
    rejected: number;
    total: number;
  };
}) => {
  return (
    <Table className="rounded-md truncate bg-primary/15">
      <TableBody>
        <TableRow className="">
          <TableCell className="font-bold text-start w-max border-r ">
            Aplicado
          </TableCell>
          <TableCell className="flex gap-1">
            {jobApplicationStatistics.applied}
          </TableCell>
        </TableRow>
        <TableRow className="">
          <TableCell className="font-bold text-start w-max border-r ">
            Aceito
          </TableCell>
          <TableCell>{jobApplicationStatistics.accepted}</TableCell>
        </TableRow>
        <TableRow className="">
          <TableCell className="font-bold text-start w-max border-r ">
            Rejeitado
          </TableCell>
          <TableCell>{jobApplicationStatistics.rejected}</TableCell>
        </TableRow>
        <TableRow className="!bg-primary/55">
          <TableCell className="font-bold text-start w-max border-r ">
            Total
          </TableCell>
          <TableCell className="flex gap-1">
            {jobApplicationStatistics.total}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default JobApplicationsTable;
