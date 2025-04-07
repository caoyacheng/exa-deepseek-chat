"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";
import { Article, Attachment } from "../../types/article";
import {
  getMetadataFromOss,
  saveMetadataToOss,
  uploadFileToOss,
} from "../../utils/ossService";

// 本地缓存键
const ARTICLES_CACHE_KEY = "medical_articles_cache";
const CACHE_EXPIRY_TIME = 1000 * 60 * 5; // 5分钟缓存过期时间

// 动态导入React-Quill，避免SSR问题
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const EditPage: React.FC = () => {
  const router = useRouter();

  // 状态管理
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [isAttachmentUploading, setIsAttachmentUploading] = useState(false);
  const [attachmentUploadProgress, setAttachmentUploadProgress] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");

  // 预设标签选项
  const tagOptions = [
    "医学研究",
    "人工智能",
    "医疗技术",
    "流行病学",
    "医疗数据",
    "临床试验",
    "医学前沿",
  ];

  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Quill编辑器配置
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image", "video", "formula"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "script",
    "indent",
    "direction",
    "color",
    "background",
    "font",
    "align",
    "link",
    "image",
    "video",
    "formula",
  ];

  // 处理封面图片上传
  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        setIsCoverUploading(true);
        setCoverUploadProgress(10);

        // 上传到OSS
        const imageUrl = await uploadFileToOss(file, "covers");
        setCoverUploadProgress(100);

        // 设置封面图片URL
        setCoverImage(imageUrl);

        setIsCoverUploading(false);
        console.log("封面图片上传成功:", imageUrl);
      } catch (error) {
        console.error("封面图片上传失败:", error);
        setIsCoverUploading(false);
      }
    }
  };

  // 处理附件上传
  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        setIsAttachmentUploading(true);

        // 创建新的附件数组
        const newAttachments: Attachment[] = [];

        // 遍历所有选择的文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setAttachmentUploadProgress(Math.round((i / files.length) * 50));

          // 上传到OSS
          const fileUrl = await uploadFileToOss(file, "attachments");

          // 添加到附件列表
          newAttachments.push({
            id: `attachment-${Date.now()}-${i}`,
            name: file.name,
            url: fileUrl,
            type: file.type,
            size: file.size,
          });
        }

        setAttachmentUploadProgress(100);

        // 更新附件列表
        setAttachments([...attachments, ...newAttachments]);

        setIsAttachmentUploading(false);
        console.log("附件上传成功:", newAttachments);
      } catch (error) {
        console.error("附件上传失败:", error);
        setIsAttachmentUploading(false);
      }
    }
  };

  // 删除附件
  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  // 触发文件选择对话框
  const triggerCoverImageUpload = () => {
    if (coverImageInputRef.current) {
      coverImageInputRef.current.click();
    }
  };

  // 触发附件选择对话框
  const triggerAttachmentUpload = () => {
    if (attachmentInputRef.current) {
      attachmentInputRef.current.click();
    }
  };

  // 发布文章
  const handlePublishArticle = async () => {
    if (!articleTitle.trim()) {
      alert("请输入文章标题");
      return;
    }

    if (!articleContent.trim()) {
      alert("请输入文章内容");
      return;
    }

    try {
      // 创建新文章对象
      const newArticle = {
        id: `article-${Date.now()}`,
        title: articleTitle,
        content: articleContent,
        author: "当前用户", // 这里应该使用实际的用户信息
        date: new Date().toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        coverImage: coverImage,
        attachments: attachments,
        tags: selectedTags,
        readTime: `${Math.max(
          1,
          Math.round(articleContent.length / 500)
        )}分钟阅读`,
        likes: 0,
        comments: 0,
      };

      // 尝试从本地缓存获取文章数据
      const cachedData = localStorage.getItem(ARTICLES_CACHE_KEY);
      let articles: Article[] = [];
      let cacheValid = false;

      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          // 检查缓存是否过期
          if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
            articles = data;
            cacheValid = true;
            console.log("使用本地缓存的文章数据");
          }
        } catch (e) {
          console.error("解析缓存数据失败:", e);
        }
      }

      // 如果缓存无效或过期，从OSS获取数据
      if (!cacheValid) {
        console.log("从OSS获取文章数据");
        articles =
          ((await getMetadataFromOss("articles/articles.json")) as Article[]) ||
          [];

        // 如果是首次保存，初始化为空数组
        if (!Array.isArray(articles)) {
          articles = [];
        }
      }

      // 将新文章添加到文章列表的开头
      articles = [newArticle, ...articles];

      // 保存更新后的文章列表到OSS和本地缓存
      await saveMetadataToOss(articles, "articles/articles.json");

      // 更新本地缓存
      localStorage.setItem(
        ARTICLES_CACHE_KEY,
        JSON.stringify({
          data: articles,
          timestamp: Date.now(),
        })
      );

      console.log("文章发布成功:", newArticle);

      // 发布成功后返回列表页
      router.push("/medicalbook");
    } catch (error) {
      console.error("文章发布失败:", error);
      alert("文章发布失败，请重试");
    }
  };

  // 取消编辑
  const handleCancel = () => {
    router.push("/medicalbook");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 顶部导航栏 */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/medicalbook">
                <Image
                  src="/logo.png"
                  alt="Medical Logo"
                  width={80}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center space-x-4">
              {/* 隐藏的文件输入 */}
              <input
                type="file"
                ref={coverImageInputRef}
                onChange={handleCoverImageUpload}
                accept="image/*"
                className="hidden"
              />

              <input
                type="file"
                ref={attachmentInputRef}
                onChange={handleAttachmentUpload}
                multiple
                className="hidden"
              />

              {/* 发布按钮 */}
              <button
                onClick={handlePublishArticle}
                className="bg-[var(--brand-default)] text-white px-5 py-2 rounded-md hover:bg-[var(--brand-default)]/90 disabled:opacity-50 font-medium transition-colors"
                disabled={
                  isCoverUploading ||
                  isAttachmentUploading ||
                  !articleTitle.trim() ||
                  !articleContent.trim()
                }
              >
                发布文章
              </button>

              {/* 取消按钮 */}
              <button
                onClick={handleCancel}
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* 左侧编辑区域 */}
          <div className="lg:w-3/4 bg-white rounded-lg shadow-md p-6 mb-8 lg:mb-0">
            {/* 文章标题 */}
            <div className="mb-6 border-b border-gray-100 pb-4">
              <input
                type="text"
                placeholder="文章标题"
                className="w-full border-none text-3xl font-bold focus:outline-none focus:ring-0 py-2"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
              />
            </div>

            {/* 富文本编辑器 */}
            <div className="mb-6">
              <ReactQuill
                theme="snow"
                value={articleContent}
                onChange={setArticleContent}
                modules={modules}
                formats={formats}
                placeholder="开始撰写您的文章..."
                className="h-[500px]"
              />
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="lg:w-1/4">
            <div className="space-y-6">
              {/* 封面图片上传区域 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-800">
                    封面图片
                  </h3>
                </div>
                <div className="p-5">
                  <div
                    className={`border-2 border-dashed border-gray-200 rounded-lg p-6 text-center h-[200px] ${
                      !isCoverUploading && "cursor-pointer hover:bg-gray-50"
                    } transition-colors relative`}
                    onClick={
                      !isCoverUploading ? triggerCoverImageUpload : undefined
                    }
                  >
                    {isCoverUploading && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10">
                        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <div className="text-sm text-gray-600">
                          上传中 {coverUploadProgress}%
                        </div>
                        <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${coverUploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {coverImage ? (
                      <div className="relative h-full flex items-center justify-center">
                        <img
                          src={coverImage}
                          alt="封面图片"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImage("");
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          点击上传封面图片
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 标签选择区域 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-800">
                    文章标签
                  </h3>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map((tag, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center transition-colors"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() =>
                            setSelectedTags(
                              selectedTags.filter((t) => t !== tag)
                            )
                          }
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      value=""
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !selectedTags.includes(e.target.value)
                        ) {
                          setSelectedTags([...selectedTags, e.target.value]);
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="" disabled>
                        选择标签
                      </option>
                      {tagOptions
                        .filter((tag) => !selectedTags.includes(tag))
                        .map((tag, index) => (
                          <option key={index} value={tag}>
                            {tag}
                          </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 附件上传区域 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-800">附件</h3>
                  <button
                    onClick={triggerAttachmentUpload}
                    className={`flex items-center text-sm transition-colors ${
                      isAttachmentUploading
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                    disabled={isAttachmentUploading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 mr-1 ${
                        isAttachmentUploading
                          ? "text-gray-400"
                          : "text-green-700"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span
                      className={
                        isAttachmentUploading
                          ? "text-gray-400"
                          : "text-green-700"
                      }
                    >
                      {isAttachmentUploading ? "上传中..." : "添加附件"}
                    </span>
                  </button>
                </div>
                <div className="p-5 relative">
                  {/* 上传加载动画 */}
                  {isAttachmentUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10">
                      <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <div className="text-sm text-gray-600">
                        上传中 {attachmentUploadProgress}%
                      </div>
                      <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${attachmentUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {/* 附件列表 */}
                  {attachments.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-500 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div>
                              <div className="text-sm font-medium">
                                {attachment.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(2)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveAttachment(attachment.id)
                            }
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-300 mx-auto mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <p className="text-gray-500">暂无附件</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditPage;
