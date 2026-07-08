import { SidebarTrigger } from "../ui/sidebar";
import { ModeToggle } from "./ＭodeToggle";
import SearchBar from "./SearchBar";

const AppNavbar = () => {
  return (
    <nav className="p-2 flex items-center gap-2">
      <SidebarTrigger variant="outline" className="h-9 w-9 shrink-0" />
      <div className="flex-1 flex justify-center">
        <SearchBar />
      </div>
      <ModeToggle />
    </nav>
  );
};

export default AppNavbar;
