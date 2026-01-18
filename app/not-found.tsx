import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-blue-500">
      <div className="text-center space-y-6 max-w-md p-6">
        <h1 className="text-9xl font-extrabold text-gray-200">404</h1>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-6">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
