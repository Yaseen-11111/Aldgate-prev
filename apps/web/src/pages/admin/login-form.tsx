import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminLogin } from '@workspace/api-client-react';
import { Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginSchema, type LoginFormValues } from './schemas';

interface LoginFormProps {
  onLoggedIn: (token: string) => void;
}

/** Password-gated sign-in screen for the admin portal. */
export function LoginForm({ onLoggedIn }: LoginFormProps) {
  const loginMutation = useAdminLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        sessionStorage.setItem('adminToken', res.token);
        onLoggedIn(res.token);
      },
      onError: () => {
        form.setError('password', { message: 'Invalid password' });
      },
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-white border border-border p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-serif">Admin Portal</h1>
          <p className="text-sm text-muted-foreground mt-2">Restricted access.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" autoComplete="current-password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 transition-colors hover:bg-primary/90 disabled:opacity-70"
            >
              {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}
