"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Article } from "../../types/article";
import { getMetadataFromOss } from "../../utils/ossService";

// 本地缓存键
const ARTICLES_CACHE_KEY = "medical_articles_cache";
const CACHE_EXPIRY_TIME = 1000 * 60 * 5; // 5分钟缓存过期时间

const ArticleDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const articleId = params.id as string;

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
            }
          } catch (e) {
            console.error("解析缓存数据失败:", e);
          }
        }

        // 如果缓存无效或过期，从OSS获取数据
        if (!cacheValid) {
          articles =
            ((await getMetadataFromOss(
              "articles/articles.json"
            )) as Article[]) || [];

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

        // 查找指定ID的文章
        const foundArticle = Array.isArray(articles)
          ? articles.find((a) => a.id === articleId)
          : null;

        if (foundArticle) {
          setArticle(foundArticle);
        } else {
          setError("未找到文章");
        }
      } catch (err) {
        console.error("获取文章详情失败:", err);
        setError("获取文章详情失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  // 处理返回按钮点击
  const handleBackClick = () => {
    router.push("/medicalbook");
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "未找到文章"}
          </h2>
          <p className="text-gray-600 mb-6">抱歉，我们无法找到您请求的文章。</p>
          <button
            onClick={handleBackClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
          >
            返回文章列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 顶部导航栏 */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
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

            {/* 返回按钮 */}
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>返回</span>
            </button>
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 文章头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
            <div>
              <div className="font-medium">{article.author}</div>
              <div className="text-sm text-gray-500 flex items-center">
                <span>{article.date}</span>
                <span className="mx-2">·</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>

          {/* 文章标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 封面图片 */}
          {article.coverImage && (
            <div className="mb-8">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-auto max-h-96 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* 文章正文 */}
        <div className="prose prose-lg max-w-none">
          {/* 始终使用普通文本渲染，移除HTML标签 */}
          <p>{article.content.replace(/<[^>]*>/g, "")}</p>
        </div>

        {/* 附件列表 */}
        {article.attachments && article.attachments.length > 0 && (
          <div className="mt-10 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">附件</h3>
            <div className="space-y-3">
              {article.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
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
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 文章底部操作栏 */}
        <div className="mt-10 border-t border-gray-200 pt-6 flex justify-between">
          <div className="flex space-x-4">
            <button className="flex items-center text-gray-500 hover:text-gray-700">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{article.likes || 0}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-gray-700">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{article.comments || 0}</span>
            </button>
          </div>
          <div className="flex space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            <button className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArticleDetailPage;
