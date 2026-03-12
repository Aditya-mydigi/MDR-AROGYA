"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email === "aditya.amparmar@gmail.com" && password === "Aditya@123") {
      router.push("/dashboard/users");
    } else {
      setError("Invalid email or password");
    }
    
    setLoading(false);
  };

  if (!isClient) return null;

  return (
    <div className="flex w-full h-screen overflow-hidden bg-white">
      {/* Left Illustration */}
      <div className="hidden lg:flex flex-1 justify-center items-center px-6 py-10 bg-white">
        <div className="w-full h-full flex justify-center items-center rounded-2xl overflow-hidden bg-[#e0fbfc]">
          <Image
            src="/left_illustration.png"
            alt="MDR App"
            width={600}
            height={800}
            className="object-cover rounded-2xl w-full h-full"
            priority
          />
        </div>
      </div>

      {/* Main Login */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 md:px-12 bg-white">
        <div className="mb-10">
          <Image
            src="/mdr_logo.png"
            alt="MDR Logo"
            width={160}
            height={60}
            priority
          />
        </div>

        <Card className="w-full max-w-sm border border-gray-200 shadow-sm rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-center text-gray-900">
              MDR Arogya Login
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Welcome back. Enter your details to continue.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#00C2D1] hover:bg-[#00A8B5] text-white"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
