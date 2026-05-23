"use client";

import { FaGithub } from "react-icons/fa";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";

export default function SocialSignIn() {
  const handleGitHubSignIn = async () => {
    await signIn("github", { callbackUrl: "/dashboard" });
  };
  return (
    <Button variant="outline" onClick={handleGitHubSignIn}>
      <FaGithub /> Sign in with GitHub
    </Button>
  );
}
