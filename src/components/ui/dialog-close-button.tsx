import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
interface DialogCloseButtonProps {
  className?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}
const DialogCloseButton: React.FC<DialogCloseButtonProps> = ({
  className,
  onClose,
  children
}) => {
  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };
  return <DialogClose asChild>
      
    </DialogClose>;
};
export default DialogCloseButton;