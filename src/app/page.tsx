"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [ghibliImage, setGhibliImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          setOriginalImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        handleImageTransform(file);
      }
    },
  });

  const handleImageTransform = async (file: File) => {
    setIsLoading(true);
    setGhibliImage(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/transform", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("转换失败");
      }

      const data = await response.json();
      setGhibliImage(data.url);
    } catch (error) {
      toast.error("图片转换失败，请重试");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FDF6E3] to-[#EDE7D9] py-8 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#2C3E50] to-transparent opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#2C3E50_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.015]" />
      
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="flex items-center justify-center mb-12">
          <div className="relative">
            <div className="w-48 h-48 rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/luxun-quote.jpg"
                alt="鲁迅"
                width={192}
                height={192}
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-center mb-4 text-[#2C3E50] relative">
          <span className="relative inline-block">
          Ghibli风格转换器
            <div className="absolute -top-6 -right-6 w-12 h-12 opacity-70">
              🍃
            </div>
          </span>
        </h1>
        
        <p className="text-center text-gray-600 mb-12 text-lg italic">
          "无穷的远方，无数的人们，都和bsc有关。" —— 鲁迅
        </p>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF9A8B] via-[#FF6B95] to-[#FF99AC]" />
          <div
            {...getRootProps()}
            className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
              ${isDragActive 
                ? "border-[#FF6B95] bg-pink-50" 
                : "border-gray-300 hover:border-[#FF6B95] hover:bg-pink-50"
              }`}
          >
            <input {...getInputProps()} />
            <div className="mb-4">
              <img
                src="/upload-icon.svg"
                alt="上传图标"
                className="w-16 h-16 mx-auto"
              />
            </div>
            <p className="text-xl text-gray-600 mb-2">
              {isDragActive
                ? "放开以上传图片"
                : "拖拽图片到这里，或点击选择图片"}
            </p>
            <p className="text-sm text-gray-500">
              支持 PNG, JPG, JPEG, WebP 格式
            </p>
          </div>
        </div>

        {(originalImage || ghibliImage) && (
          <div className="grid md:grid-cols-2 gap-8">
            {originalImage && (
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
                <h2 className="text-2xl font-bold mb-4 text-[#2C3E50] flex items-center">
                  <span className="w-2 h-8 bg-[#FF6B95] rounded-full mr-3" />
                  原始图片
                </h2>
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
              <h2 className="text-2xl font-bold mb-4 text-[#2C3E50] flex items-center">
                <span className="w-2 h-8 bg-[#FF6B95] rounded-full mr-3" />
                Ghibli风格
              </h2>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-16 h-16 animate-bounce">
                    🎨
                  </div>
                  <p className="mt-4 text-gray-600">正在转换中...</p>
                </div>
              ) : ghibliImage ? (
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={ghibliImage}
                    alt="Ghibli Style"
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">转换后的图片将显示在这里</p>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>灵感来自鲁迅先生的艺术追求与Ghibli的动画美学</p>
        </footer>
      </div>
    </main>
  );
}
