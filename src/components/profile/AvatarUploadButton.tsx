"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { validateAvatarFile } from "@/lib/avatar";

interface AvatarUploadButtonProps {
  image: string | null;
  initials: string;
}

export default function AvatarUploadButton({ image, initials }: AvatarUploadButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(image);
  const [progress, setProgress] = useState<number | null>(null);

  function handleUpload(file: File) {
    const validation = validateAvatarFile(file.name, file.size, file.type);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/dashboard/user/avatar");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(null);
      URL.revokeObjectURL(objectUrl);
      if (xhr.status >= 200 && xhr.status < 300) {
        const { image: uploadedImage } = JSON.parse(xhr.responseText);
        setPreview(uploadedImage);
        toast.success("Avatar updated");
        router.refresh();
      } else {
        setPreview(image);
        const { error } = JSON.parse(xhr.responseText || "{}");
        toast.error(error || "Failed to upload avatar");
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      URL.revokeObjectURL(objectUrl);
      setPreview(image);
      toast.error("Failed to upload avatar");
    };

    xhr.send(formData);
  }

  return (
    <div className="relative shrink-0">
      <Avatar className="h-20 w-20 text-2xl">
        <AvatarImage src={preview ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={progress !== null}
        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100 disabled:opacity-100"
      >
        {progress !== null ? (
          <Progress value={progress} className="h-1.5 w-12" />
        ) : (
          <Camera className="h-6 w-6" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp,.svg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
