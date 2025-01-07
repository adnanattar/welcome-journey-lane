import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { EmployeeForm, EmployeeData } from "@/components/EmployeeForm";
import { SuccessMessage } from "@/components/SuccessMessage";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [addedEmployee, setAddedEmployee] = useState<string>("");
  const { toast } = useToast();

  const handleAddEmployee = (data: EmployeeData) => {
    // In a real app, this would make an API call
    console.log("Adding employee:", data);
    toast({
      title: "Processing...",
      description: "Adding new employee to the system",
    });

    // Simulate API delay
    setTimeout(() => {
      setAddedEmployee(data.name);
      setCurrentStep(2);
      console.log("Employee added successfully");
    }, 1500);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setAddedEmployee("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Employee Onboarding
          </h1>

          <StepIndicator currentStep={currentStep} totalSteps={2} />

          {currentStep === 1 ? (
            <EmployeeForm onSubmit={handleAddEmployee} />
          ) : (
            <SuccessMessage
              employeeName={addedEmployee}
              onClose={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;