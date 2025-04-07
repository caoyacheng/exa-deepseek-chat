"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Article, Attachment } from "../types/article";
import { getMetadataFromOss, uploadFileToOss } from "../utils/ossService";

// 本地缓存键
const ARTICLES_CACHE_KEY = "medical_articles_cache";
const CACHE_EXPIRY_TIME = 1000 * 60 * 5; // 5分钟缓存过期时间

const MedicalBookPage: React.FC = () => {
  const router = useRouter();
  // 状态管理
  const [searchQuery, setSearchQuery] = useState("");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [coverImage, setCoverImage] = useState<string>("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [activeTag, setActiveTag] = useState<string>("为你推荐");

  // 预设标签选项
  const navTags = [
    "为你推荐",
    "关注",
    "精选",
    "人工智能",
    "医学研究",
    "医疗技术",
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // 从本地缓存或OSS获取文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
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
            ((await getMetadataFromOss(
              "articles/articles.json"
            )) as Article[]) || [];

          // 如果OSS中没有文章或发生错误，使用默认文章
          if (!Array.isArray(articles) || articles.length === 0) {
            // 模拟文章数据
            const defaultArticles: Article[] = [
              {
                id: "1",
                title: "最新医学研究：AI辅助诊断提高肺癌早期检测率达到95%",
                author: "张医生",
                authorImage: "/avatar1.png",
                publication: "医学前沿",
                content:
                  "最新研究表明，人工智能辅助诊断系统能够显著提高肺癌的早期检测率，为患者提供更好的治疗机会。",
                date: "2025年4月2日",
                readTime: "8分钟阅读",
                likes: 495,
                comments: 11,
                coverImage: "/medical-ai.jpg",
              },
              {
                id: "2",
                title: "新型冠状病毒变种：我们需要了解的关键信息",
                author: "李研究员",
                authorImage: "/avatar2.png",
                publication: "流行病学杂志",
                content:
                  "随着新型冠状病毒变种的出现，科学家们正在密切关注其传播特性和疫苗有效性。本文总结了最新中发现的结果。",
                date: "2025年3月27日",
                readTime: "12分钟阅读",
                likes: 2800,
                comments: 46,
                coverImage: "/virus-research.jpg",
              },
              {
                id: "3",
                title: "医疗数据安全：保护患者隐私的新方法",
                author: "王数据",
                authorImage: "/avatar3.png",
                publication: "医疗信息学",
                content:
                  "随着医疗数据数字化，患者隐私保护变得尤为重要。本文探讨了区块链和联邦学习等新技术在医疗数据安全中的应用。",
                date: "2025年3月15日",
                readTime: "10分钟阅读",
                likes: 320,
                comments: 8,
                coverImage: "/data-security.jpg",
              },
            ];

            articles = defaultArticles;
          }

          // 更新缓存
          if (Array.isArray(articles) && articles.length > 0) {
            localStorage.setItem(
              ARTICLES_CACHE_KEY,
              JSON.stringify({
                data: articles,
                timestamp: Date.now(),
              })
            );
          }
        }

        setArticles(articles);
        setFilteredArticles(articles);
      } catch (error) {
        console.error("获取文章列表失败:", error);
        // 出错时使用空数组
        setArticles([]);
      }
    };

    fetchArticles();
  }, []);

  // 根据选中的标签筛选文章
  useEffect(() => {
    if (activeTag === "为你推荐") {
      // 为你推荐标签显示所有文章
      setFilteredArticles(articles);
    } else {
      // 其他标签根据文章标签筛选
      const filtered = articles.filter(
        (article) => article.tags && article.tags.includes(activeTag)
      );
      setFilteredArticles(filtered);
    }
  }, [activeTag, articles]);

  // 处理标签点击
  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
  };

  // 处理文章点击，跳转到详情页
  const handleArticleClick = (articleId: string) => {
    router.push(`/medicalbook/${articleId}`);
  };

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("搜索:", searchQuery);
    // 这里可以添加搜索逻辑
  };

  // 处理写作按钮点击
  const handleWriteClick = () => {
    // 跳转到编辑页面
    window.location.href = "/medicalbook/edit";
  };

  // 关闭写作模态框
  const handleCloseModal = () => {
    setShowWriteModal(false);
    // 重置表单
    setArticleTitle("");
    setArticleContent("");
    setAttachments([]);
    setCoverImage("");
  };

  // 处理封面图片上传
  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        setIsUploading(true);
        setUploadProgress(10);

        // 上传到OSS
        const imageUrl = await uploadFileToOss(file, "covers");
        setUploadProgress(100);

        // 设置封面图片URL
        setCoverImage(imageUrl);

        setIsUploading(false);
        console.log("封面图片上传成功:", imageUrl);
      } catch (error) {
        console.error("封面图片上传失败:", error);
        setIsUploading(false);
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
        setIsUploading(true);

        // 创建新的附件数组
        const newAttachments: Attachment[] = [];

        // 遍历所有选择的文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress(Math.round((i / files.length) * 50));

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

        setUploadProgress(100);

        // 更新附件列表
        setAttachments([...attachments, ...newAttachments]);

        setIsUploading(false);
        console.log("附件上传成功:", newAttachments);
      } catch (error) {
        console.error("附件上传失败:", error);
        setIsUploading(false);
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

  // 文章列表页面不需要发布文章功能，已移至编辑页面

  return (
    <div className="bg-white min-h-screen">
      {/* 顶部导航栏 */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Medical Logo"
                  width={80}
                  height={40}
                  className="cursor-pointer"
                />
              </Link>
            </div>

            {/* 搜索框 */}
            <div className="flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center border rounded-full bg-gray-100 px-3 py-1">
                  <Image
                    src="/search.png"
                    alt="搜索"
                    width={20}
                    height={20}
                    className="text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="搜索"
                    className="w-full bg-transparent border-none focus:outline-none px-3 py-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center space-x-4">
              {/* 写作按钮 */}
              <button
                onClick={handleWriteClick}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>写作</span>
              </button>

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
              {/* 用户头像 */}
              <button className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                Y
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 主要内容区域 */}
        <div className="max-w-3xl mx-auto">
          {/* 导航菜单 */}
          <div className="border-b border-gray-200 mb-6 mt-8">
            <nav className="flex space-x-8 overflow-x-auto pb-2">
              {navTags.map((tag, index) => (
                <button
                  key={index}
                  className={`font-medium pb-2 border-b-2 ${
                    activeTag === tag
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-500 border-transparent hover:border-gray-300"
                  } ${tag === "精选" ? "relative" : ""}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                  {tag === "精选" && (
                    <span className="absolute -top-1 -right-2 bg-green-600 text-white text-xs px-1 rounded">
                      新
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* 文章列表 */}
          <div className="space-y-10">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="border-b border-gray-200 pb-8"
                >
                  <div className="flex items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{article.author}</span>
                        <span className="mx-1">·</span>
                        <span className="text-gray-500 text-sm">
                          {article.date}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {article.publication}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row">
                    <div className="md:flex-1 md:pr-6">
                      <h2
                        className="text-xl font-bold mb-2 cursor-pointer hover:text-blue-600"
                        onClick={() => handleArticleClick(article.id)}
                      >
                        {article.title}
                      </h2>
                      <p
                        className="text-gray-700 mb-4 cursor-pointer hover:text-gray-900"
                        onClick={() => handleArticleClick(article.id)}
                      >
                        {article.content.length > 300
                          ? article.content
                              .substring(0, 300)
                              .replace(/<[^>]*>/g, "") + "..."
                          : article.content.replace(/<[^>]*>/g, "")}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{article.readTime}</span>
                          <span className="mx-2">·</span>
                          <div className="flex flex-wrap gap-2">
                            {article.tags && article.tags.length > 0 ? (
                              article.tags.map((tag, index) => (
                                <button
                                  key={index}
                                  className="bg-gray-100 rounded-full px-3 py-1 hover:bg-gray-200"
                                >
                                  {tag}
                                </button>
                              ))
                            ) : (
                              <button className="bg-gray-100 rounded-full px-3 py-1 hover:bg-gray-200">
                                医学研究
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <button className="text-gray-400 hover:text-gray-600">
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
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          </button>

                          <button className="text-gray-400 hover:text-gray-600">
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
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      className="mt-4 md:mt-0 md:w-1/3 cursor-pointer"
                      onClick={() => handleArticleClick(article.id)}
                    >
                      {article.coverImage ? (
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-40 object-cover rounded"
                        />
                      ) : (
                        <div className="bg-gray-200 w-full h-40 rounded"></div>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-16">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  暂无相关文章
                </h3>
                <p className="text-gray-500 mb-6">
                  没有找到与"{activeTag}"相关的文章
                </p>
                <button
                  onClick={() => setActiveTag("为你推荐")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                >
                  查看全部文章
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 移除写作模态框，改为使用独立页面 */}
    </div>
  );
};

export default MedicalBookPage;
