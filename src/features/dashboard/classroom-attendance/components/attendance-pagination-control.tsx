"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MeetingsPaginationControlProps {
  totalMeetings: number;
  displayedCount: number;
  onCountChange: (count: number) => void;
}

export default function AttendancePaginationControl({
  totalMeetings,
  displayedCount,
  onCountChange,
}: MeetingsPaginationControlProps) {
  const [inputValue, setInputValue] = React.useState(displayedCount.toString());

  React.useEffect(() => {
    setInputValue(displayedCount.toString());
  }, [displayedCount]);

  const handleDecrease = () => {
    const newValue = Math.max(1, displayedCount - 1);
    onCountChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(totalMeetings, displayedCount + 1);
    onCountChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= totalMeetings) {
      onCountChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 1) {
      onCountChange(1);
    } else if (numValue > totalMeetings) {
      onCountChange(totalMeetings);
    }
  };

  if (totalMeetings === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Aulas:</span>
      <div className="flex items-center border rounded-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDecrease}
          disabled={displayedCount <= 1}
          className="h-8 w-8 p-0 rounded-r-none border-r"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="h-8 w-16 text-center text-primary-foreground font-semibold border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleIncrease}
          disabled={displayedCount >= totalMeetings}
          className="h-8 w-8 p-0 rounded-l-none border-l"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-sm text-muted-foreground">de {totalMeetings}</span>
    </div>
  );
}