"use client";

import { FaGithub } from "react-icons/fa";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";

export default function SocialSignIn() {
  return (
    <Button variant="outline" onClick={() => signIn("github")}>
      <FaGithub /> Sign in with GitHub
    </Button>
  );
}
