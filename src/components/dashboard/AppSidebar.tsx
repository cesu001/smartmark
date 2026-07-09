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
  ChevronDown,
  CircleUser,
  Heart,
  Notebook,
  Pin,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getNoteCounts } from "@/lib/db/notes";
import { getAllCollectionsWithCounts } from "@/lib/db/collections";
import { getAllTags } from "@/lib/db/tags";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import LogoutMenuItem from "./LogOutButton";
import { requireUser } from "@/lib/auth-utils";
import SidebarAddCollection from "./SidebarAddCollection";
import SidebarAddTag from "./SidebarAddTag";
import SidebarHoverMenuItem from "./SidebarHoverMenuItem";

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
  { title: "Pinned", url: "/dashboard/pinned", icon: Pin, key: "pinned" },
];
const AppSidebar = async () => {
  const { id: userId, email: userEmail } = await requireUser();
  const [noteCounts, collections, tags, dbUser] = await Promise.all([
    getNoteCounts(userId),
    getAllCollectionsWithCounts(userId),
    getAllTags(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    }),
  ]);

  const userName = dbUser?.name;
  const userImage = dbUser?.image;
  const userInitials = getInitials(userName, userEmail);
  const favoriteCollections = collections.filter((c) => c.isFavorite).length;
  const favoriteTags = tags.filter((t) => t.isFavorite).length;
  const counts: Record<string, number> = {
    all: noteCounts.total,
    favorite: noteCounts.favorites + favoriteCollections + favoriteTags,
    pinned: noteCounts.pinned,
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <span>Smark</span>
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
                    <SidebarHoverMenuItem
                      key={col.id}
                      type="collection"
                      id={col.id}
                      name={col.name}
                      noteCount={col._count.notes}
                      isFavorite={col.isFavorite}
                    />
                  ))}
                </SidebarMenu>
                <SidebarAddCollection />
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
                    <SidebarHoverMenuItem
                      key={tag.id}
                      type="tag"
                      id={tag.id}
                      name={tag.name}
                      noteCount={tag.noteCount}
                      isFavorite={tag.isFavorite}
                    />
                  ))}
                </SidebarMenu>
                <SidebarAddTag />
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
                    <AvatarImage src={userImage ?? undefined} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
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
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <CircleUser />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                {/* Settings entry hidden for now
                <DropdownMenuItem>
                  <Settings />
                  <span>Setting</span>
                </DropdownMenuItem>
                */}
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
