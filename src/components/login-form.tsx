import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Logga in</CardTitle>
        <CardDescription>
          Logga in med ditt användarnamn och lösenord.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Användarnamn</Label>
            <Input
              id="username"
              type="text"
              placeholder="Användarnamn"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Lösenord</Label>
            </div>
            <Input id="password" type="password" placeholder="Lösenord" required />
          </div>
          <Button type="submit" className="w-full">
            Logga in
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
