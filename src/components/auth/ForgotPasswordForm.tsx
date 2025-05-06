import { useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void;
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Check your email</h3>
            <p className="text-sm text-muted-foreground">We have sent a password reset link to {email}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
            Try another email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          {isSubmitted && (
            <p className="text-sm text-success">
              If an account exists with that email, we&apos;ve sent a password reset link.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
