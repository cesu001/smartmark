"use client";

import SidebarInlineAddForm from "./SidebarInlineAddForm";

export default function SidebarAddTag() {
  return (
    <SidebarInlineAddForm
      endpoint="/api/dashboard/tag"
      placeholder="Tag Name"
      successMessage="Tag created"
      errorMessage="Failed to create tag"
    />
  );
}
