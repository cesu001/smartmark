import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Bookmark,
  ChevronDown,
  CircleUser,
  Folder,
  Heart,
  Notebook,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import LogoutMenuItem from "./LogOutButton";
import { requireUser } from "@/lib/auth-utils";

const quickAccessItems = [
  {
    title: "All Notes",
    url: "/dashboard/allnotes",
    icon: Notebook,
    key: "all",
  },
  {
    title: "Favorites",
    url: "/dashboard/favorites",
    icon: Heart,
    key: "favorite",
  },
  { title: "Pinned", url: "/dashboard/pinned", icon: Bookmark, key: "pinned" },
];
const AppSidebar = async () => {
  const {
    id: userId,
    name: userName,
    email: userEmail,
    image: userImage,
  } = await requireUser();
  const [allCount, favCount, pinnedCount, collections, tags] =
    await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.note.count({ where: { userId, isFavorite: true } }),
      prisma.note.count({ where: { userId, isPinned: true } }),
      prisma.collection.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          isFavorite: true,
          _count: {
            select: { notes: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              notes: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

  const counts: Record<string, number> = {
    all: allCount,
    favorite: favCount,
    pinned: pinnedCount,
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <span>SmartMark</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="m-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="font-bold text-sm text-muted-foreground">
              QUICK ACCESS
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickAccessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span className="text-muted-foreground">
                        {item.title}
                      </span>
                      <SidebarMenuBadge>{counts[item.key]}</SidebarMenuBadge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Collections */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                <span className="font-bold text-sm text-muted-foreground">
                  Collections
                </span>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {collections.map((col) => (
                    <SidebarMenuItem key={col.id}>
                      <SidebarMenuButton asChild>
                        <Link href={`/dashboard/collection/${col.id}`}>
                          <Folder
                            className={`${col.isFavorite && "text-green-600"}`}
                          />
                          <span className="text-sm text-muted-foreground">
                            {col.name}
                          </span>
                          <SidebarMenuBadge>
                            {col._count.notes}
                          </SidebarMenuBadge>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                <SidebarMenuButton className="justify-center transition-all duration-300 ease-in-out hover:text-green-400 hover:scale-105">
                  <Plus className="w-6 h-6" />
                </SidebarMenuButton>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        {/* tags */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                <span className="font-bold text-sm text-muted-foreground">
                  Tags
                </span>
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tags.map((tag) => (
                    <SidebarMenuItem key={tag.id}>
                      <SidebarMenuButton asChild>
                        <Link href={`/dashboard/tag/${tag.id}`}>
                          <Bookmark />
                          <span className="text-sm text-muted-foreground">
                            {tag.name}
                          </span>
                          <SidebarMenuBadge>
                            {tag._count.notes}
                          </SidebarMenuBadge>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                <SidebarMenuButton className="justify-center transition-all duration-300 ease-in-out hover:text-green-400 hover:scale-105">
                  <Plus className="w-6 h-6" />
                </SidebarMenuButton>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar>
                    <AvatarImage
                      src={
                        userImage ? userImage : "https://github.com/shadcn.png"
                      }
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                    <span className="font-medium whitespace-nowrap">
                      {userName}
                    </span>
                    <span className="text-muted-foreground text-xs truncate shrink-0">
                      {`(${userEmail})`}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <CircleUser />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  <span>Setting</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutMenuItem />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
