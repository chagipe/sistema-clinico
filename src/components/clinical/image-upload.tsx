"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";

interface MediaItem {
  id?: string;
  filename: string;
  mimeType: string;
  data: string;
  label?: string | null;
}

interface ImageUploadProps {
  consultationId: string;
  images: MediaItem[];
  onImagesChange: (images: MediaItem[]) => void;
}

export function ImageUpload({ consultationId, images, onImagesChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const base64 = await fileToBase64(file);
      const item: MediaItem = {
        filename: file.name,
        mimeType: file.type,
        data: base64,
        label: "",
      };

      if (consultationId && consultationId !== "new") {
        try {
          const response = await fetch("/api/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              consultationId,
              ...item,
            }),
          });
          if (response.ok) {
            const saved = await response.json();
            item.id = saved.id;
          }
        } catch (err) {
          console.error("Error saving image:", err);
        }
      }

      newImages.push(item);
    }

    onImagesChange([...images, ...newImages]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (index: number) => {
    const image = images[index];
    if (image.id && consultationId !== "new") {
      try {
        await fetch(`/api/media?id=${image.id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="clay-button flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#3d3530] hover:bg-white/50 transition-colors"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Subiendo..." : "Adjuntar imagen"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={image.id || index} className="relative group clay-inset p-2 rounded-xl">
              <div className="aspect-square rounded-lg overflow-hidden bg-[#e8e0d8] flex items-center justify-center">
                {image.data ? (
                  <img
                    src={image.data}
                    alt={image.filename}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-[#7a6b5d]" />
                )}
              </div>
              <div className="mt-1.5">
                <input
                  type="text"
                  value={image.label || ""}
                  onChange={(e) => {
                    const updated = [...images];
                    updated[index] = { ...updated[index], label: e.target.value };
                    onImagesChange(updated);
                  }}
                  placeholder="Agregar nota..."
                  className="clay-input w-full px-2 py-1 text-xs text-[#3d3530] placeholder:text-[#7a6b5d]/50"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-lg bg-[#c4625a] text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <p className="text-[10px] text-[#7a6b5d] mt-1 truncate">{image.filename}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
