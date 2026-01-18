import { LoginForm } from "@/components/auth/login-form";
import { GraduationCap, ArrowRight } from "lucide-react";
import Image from "next/image";
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Hero */}
      <div className="w-full lg:w-1/2 bg-background px-6 sm:px-12 py-12 sm:py-20 flex flex-col justify-center">
        <div className="max-w-md">
          {/* Icon */}
          <div className="mb-8 inline-flex items-center justify-center p-3 rounded-lg">
            <Image src="/jju-logo.png" alt="Logo" width={50} height={50} />
          </div>

          {/* Heading */}
          <h1 className="text-4xl text-blue-500 sm:text-5xl font-bold mb-6 leading-tight">
            Jigjiga University
          </h1>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Modern class management system for seamless academic administration and student engagement.
          </p>

          {/* Description */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Manage classes, assignments, and student progress efficiently
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time communication with students and faculty
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Comprehensive analytics and performance tracking
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <span>Get started below</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 bg-secondary px-6 sm:px-12 py-12 sm:py-20 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
