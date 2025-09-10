import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
 
interface FormErrorProps {
  message?: string
}

export const FormError = ({ message }: FormErrorProps) => {

    if (!message) return null;

  return (
   
    <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-700">
      <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
    
  )
}
  
