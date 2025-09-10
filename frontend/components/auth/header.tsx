import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
}

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <div className="w-full max-w-md gap-y-4 text-center items-center justify-center">
      <h1 className={cn(
        "space-y-6 text-3xl font-bold text-gray-800 mb-4 drop-shadow-md",
        font.className
      )}>
        Authentication
      </h1>
      <p className="text-sm text-foreground-muted">
        {title}
      </p>
      {description && (
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      )}
    </div>
  );
}