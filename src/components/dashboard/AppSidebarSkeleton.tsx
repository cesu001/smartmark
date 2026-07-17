import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "../ui/skeleton";

function SidebarRowSkeleton({ badge = false }: { badge?: boolean }) {
  return (
    <SidebarMenuItem>
      <div className="flex h-8 items-center gap-2 rounded-md px-2">
        <Skeleton className="size-4 rounded-md shrink-0" />
        <Skeleton className="h-4 flex-1" />
        {badge && <Skeleton className="h-4 w-4 shrink-0 rounded" />}
      </div>
    </SidebarMenuItem>
  );
}

const AppSidebarSkeleton = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2.5 p-2">
              <span className="flex size-7.5 items-center justify-center rounded-sm bg-primary font-extrabold text-primary-foreground">
                S
              </span>
              <span className="font-bold">Smark</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="m-0" />
      <SidebarContent>
        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="font-bold text-sm text-muted-foreground">
              QUICK ACCESS
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 3 }).map((_, i) => (
                <SidebarRowSkeleton key={i} badge />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Collections */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="font-bold text-sm text-muted-foreground">
              Collections
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 5 }).map((_, i) => (
                <SidebarRowSkeleton key={i} badge />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Tags */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="font-bold text-sm text-muted-foreground">
              Tags
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 6 }).map((_, i) => (
                <SidebarRowSkeleton key={i} badge />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-2">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebarSkeleton;
