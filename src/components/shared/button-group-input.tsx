import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

const ButtonGroupInput = ({
  buttonGroupProps,
  inputProps,
  buttonProps,
}: {
  buttonGroupProps?: React.ComponentProps<typeof ButtonGroup>;
  inputProps?: React.ComponentProps<typeof Input>;
  buttonProps?: React.ComponentProps<typeof Button>;
}) => {
  return (
    <ButtonGroup {...buttonGroupProps}>
      <Input {...inputProps} />
      <Button {...buttonProps}>
        <SearchIcon />
      </Button>
    </ButtonGroup>
  );
};

export default ButtonGroupInput;
