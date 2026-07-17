import { getAllTags } from "@/lib/db/tags";
import AppTags from "./AppTags";

const AppDashboardTags = async ({ userId }: { userId: string }) => {
  const tags = await getAllTags(userId);
  return <AppTags tags={tags} />;
};

export default AppDashboardTags;
