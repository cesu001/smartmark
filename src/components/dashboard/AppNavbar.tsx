import { SidebarTrigger } from "../ui/sidebar";
import { ModeToggle } from "./ＭodeToggle";

const AppNavbar = () => {
  return (
    <nav className="p-2 flex justify-between items-center">
      <SidebarTrigger variant="outline" className="h-9 w-9" />
      <ModeToggle />
    </nav>
  );
};

export default AppNavbar;
