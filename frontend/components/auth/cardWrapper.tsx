"use client"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/backButton";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonOnHref: string;
  showSocial?: boolean;
}

export const CardWrapper = ({ 
    children,
    headerLabel,
    backButtonLabel,
    backButtonOnHref,
    showSocial
}: CardWrapperProps) => {
  return (
    <Card className="w-full max-w-md p-8 shadow-lg">
        <CardHeader className="mb-6 text-center">
            <Header title={headerLabel || "Welcome"} />
        </CardHeader>
        <CardContent className="space-y-6">
            {children}
        </CardContent>
        { showSocial && 
          <CardFooter className="flex flex-col gap-4">
            <Social />
          </CardFooter>
        }
         
        { (backButtonLabel && backButtonOnHref) && 
          <CardFooter className="justify-center">
            <BackButton label={backButtonLabel} href={backButtonOnHref} />
          </CardFooter>
        }
    </Card>
  )
}