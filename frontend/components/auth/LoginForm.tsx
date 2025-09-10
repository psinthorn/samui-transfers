"use client";

import * as z from "zod";
import { loginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
    Form,
    FormControl,
    FormLabel,
    FormItem,
    FormField,
    FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { loginAction } from '@/actions/login'
import { useState, useTransition } from "react";
import { FormError } from "@/components/formError";
import { FormSuccess } from "@/components/formSuccess";

export const LoginForm = () => {
    const [ isPending, startTransition ] = useTransition();
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

const [success, setSuccess] = useState<string | undefined>("");
const [error, setError] = useState<string | undefined>("");

    const onSubmit = (data: z.infer<typeof loginSchema>) => {
        setSuccess(undefined);
        setError(undefined);
        
        startTransition(() => {
            loginAction(data.email, data.password).then(response => {
                if (response.success) {
                    setSuccess(response.message);
                } else {
                    setError(response.message);
                }
            });
        });
    }

  return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={isPending}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    placeholder="Email"
                                    type="email"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={isPending}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    placeholder="Password"
                                    type="password"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormError message={error} />
                <FormSuccess message={success} />
                <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isPending}
                >
                    Login
                </Button>
            </form>
        </Form>
  )
}