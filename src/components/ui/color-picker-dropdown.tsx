"use client";
import React, { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerFormat,
} from "@/components/ui/shadcn-io/color-picker";
import Color, { ColorLike } from "color";

interface ColorPickerDropdownProps {
  color: string;
  onColorChange: (colorValue: ColorLike) => void;
  className?: string;
}

const ColorPickerDropdown = ({
  color,
  onColorChange,
  className = "",
}: ColorPickerDropdownProps) => {
  const [open, setOpen] = useState(false);

  const { backgroundColor, isValid } = React.useMemo(() => {
    try {
      return {
        backgroundColor: Color(color).hex(),
        isValid: true,
      };
    } catch {
      return {
        backgroundColor: "#f3f4f6",
        isValid: false,
      };
    }
  }, [color]);

  const handleColorChange = useCallback(
    (colorValue: ColorLike) => {
      onColorChange(colorValue);
    },
    [onColorChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          className={`w-full justify-between ${className}`}
          type="button"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ backgroundColor }}>
              {!isValid && <span className="text-xs text-gray-500">?</span>}
            </div>
            <span className="text-sm">{isValid ? color : "Cor inválida"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <ColorPicker onChange={handleColorChange} defaultValue={backgroundColor} className="max-w-sm h-60 rounded-md bg-background p-4 shadow-sm">
          <ColorPickerSelection  />
          <div className="flex items-center">
              <ColorPickerHue />
          </div>
          <div className="flex items-center">
            <ColorPickerFormat className="[&_input]:bg-muted!" />
          </div>
        </ColorPicker>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPickerDropdown;
