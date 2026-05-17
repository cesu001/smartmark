import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <h1>hello</h1>
      {session ? (
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      ) : (
        <>
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="bg-green-600/60">
            <Link href="/register">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  );
}
