import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('flex h-full w-full flex-col items-center justify-center gap-6', className)}
      {...props}
    >
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Logga in</CardTitle>
          <CardDescription>
            Logga in med ditt tresiffriga lägenhetsnummer och lösenord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="server">Server</Label>
              <Input id="server" type="text" placeholder="" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Lägenhetsnummer</Label>
              <Input id="username" type="text" placeholder="001" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Lösenord</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
