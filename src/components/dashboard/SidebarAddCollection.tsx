"use client";

import SidebarInlineAddForm from "./SidebarInlineAddForm";

export default function SidebarAddCollection() {
  return (
    <SidebarInlineAddForm
      endpoint="/api/dashboard/collection"
      placeholder="Collection Name"
      successMessage="Collection created"
      errorMessage="Failed to create collection"
    />
  );
}
