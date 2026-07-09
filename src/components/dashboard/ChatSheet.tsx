"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ChatPanel from "@/components/dashboard/ChatPanel";

const ChatSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
          <MessageCircle className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open AI Chatbot</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0 gap-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle>AI Chatbot</SheetTitle>
        </SheetHeader>
        <ChatPanel />
      </SheetContent>
    </Sheet>
  );
};

export default ChatSheet;
