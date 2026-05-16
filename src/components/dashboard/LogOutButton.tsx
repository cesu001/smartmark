"use client";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { LogOut } from "lucide-react";

const LogoutMenuItem = () => {
  return (
    <DropdownMenuItem
      variant="destructive"
      className="cursor-pointer"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut />
      <span>Sign out</span>
    </DropdownMenuItem>
  );
};

export default LogoutMenuItem;
