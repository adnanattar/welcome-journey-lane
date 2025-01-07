import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  employeeName: string;
  onClose: () => void;
}

export const SuccessMessage = ({ employeeName, onClose }: SuccessMessageProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      <h2 className="text-2xl font-semibold">Employee Added Successfully!</h2>
      <p className="text-gray-600">
        {employeeName} has been added to the system. An email with login
        credentials has been sent to their email address.
      </p>
      <Button onClick={onClose} className="mt-4">
        Add Another Employee
      </Button>
    </div>
  );
};