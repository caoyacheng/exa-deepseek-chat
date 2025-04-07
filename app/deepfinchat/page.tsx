"use client";

import { Message, useChat } from "ai/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import ToolCallDisplay from "../components/ToolCallDisplay";
import { ToolType } from "../types/medical";

interface SearchResult {
  title: string;
  url: string;
  text: string;
  author?: string;
  publishedDate?: string;
  favicon?: string;
}

// 解析消息内容，提取思考过程和最终回答
const parseMessageContent = (content: string) => {
  // 如果找到完整的think标签
  if (content.includes("</think>")) {
    const [thinking, ...rest] = content.split("</think>");
    return {
      thinking: thinking.replace("<think>", "").trim(),
      finalResponse: rest.join("</think>").trim(),
      isComplete: true,
    };
  }
  // 如果只找到开始的think标签，则之后的内容都是思考过程
  if (content.includes("<think>")) {
    return {
      thinking: content.replace("<think>", "").trim(),
      finalResponse: "",
      isComplete: false,
    };
  }
  // 没有think标签，所有内容都是最终回答
  return {
    thinking: "",
    finalResponse: content,
    isComplete: true,
  };
};

// 工具调用信息接口
interface ToolCallInfo {
  toolType: ToolType;
  params: any;
  result: any;
}

export default function DeepFinChatPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previousQueries, setPreviousQueries] = useState<string[]>([]);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [loadingDots, setLoadingDots] = useState("");
  const [showModelNotice, setShowModelNotice] = useState(true);
  const [toolCallInfo, setToolCallInfo] = useState<ToolCallInfo | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 4;
        setLoadingDots(".".repeat(count));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    setMessages,
  } = useChat({
    api: "/api/chat",
  });

  // 从系统消息中获取工具调用信息
  useEffect(() => {
    // 查找包含工具调用信息的系统消息
    const toolCallInfoMessage = messages.find(
      (m) => m.role === "system" && m.content.startsWith("__TOOL_CALL_INFO__:")
    );

    if (toolCallInfoMessage) {
      try {
        // 提取工具调用信息
        const toolCallInfoJson = toolCallInfoMessage.content.replace(
          "__TOOL_CALL_INFO__:",
          ""
        );
        const toolCallInfo = JSON.parse(toolCallInfoJson);
        setToolCallInfo(toolCallInfo);

        // 从消息列表中移除工具调用信息消息
        setMessages(messages.filter((m) => m !== toolCallInfoMessage));
      } catch (error) {
        console.error("Failed to parse tool call info:", error);
      }
    }
  }, [messages, setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 重置状态
    setIsSearching(true);
    setIsLLMLoading(false);
    setSearchResults([]);
    setSearchError(null);

    try {
      // 首先获取网络搜索结果
      const searchResponse = await fetch("/api/exawebsearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          previousQueries: previousQueries.slice(-3),
        }),
      });

      if (!searchResponse.ok) {
        throw new Error("搜索失败");
      }

      const { results } = await searchResponse.json();
      setSearchResults(results);
      // 当搜索结果出现时隐藏提示
      setShowModelNotice(false);
      setIsSearching(false);
      setIsLLMLoading(true);

      // 格式化搜索上下文
      const searchContext =
        results.length > 0
          ? `Web Search Results:\n\n${results
              .map(
                (r: SearchResult, i: number) =>
                  `Source [${i + 1}]:\nTitle: ${r.title}\nURL: ${r.url}\n${
                    r.author ? `Author: ${r.author}\n` : ""
                  }${
                    r.publishedDate ? `Date: ${r.publishedDate}\n` : ""
                  }Content: ${r.text}\n---`
              )
              .join(
                "\n\n"
              )}\n\n指令：请根据上述搜索结果，回答用户的问题。引用信息时，请使用方括号引用来源编号，如[1]、[2]等。请使用简洁明了的语言。最重要的是：在给出最终答案之前，请先思考分析，逐步推理。深入思考并检查你的推理过程，进行3-5个思考步骤。请将思考过程用<think>标签包裹起来，以<think>开始，以</think>结束，然后给出最终答案。请确保分析全面，逻辑清晰，并将相关信息整合成连贯的回答，以便用户能够充分理解问题的解答过程和最终结论。`
          : "";

      // 在一个请求中发送系统上下文和用户消息
      if (searchContext) {
        // 首先，用两条消息更新messages状态
        const newMessages: Message[] = [
          ...messages,
          {
            id: Date.now().toString(),
            role: "system",
            content: searchContext,
          },
        ];
        setMessages(newMessages);
      }

      // 然后触发API调用
      handleChatSubmit(e);

      // 成功搜索后更新之前的查询
      setPreviousQueries((prev) => [...prev, input].slice(-3));
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "搜索失败");
      console.error("错误:", err);
      setIsLLMLoading(false);
    } finally {
      setIsSearching(false);
    }
  };

  // 添加效果以监视完整响应
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      const { isComplete } = parseMessageContent(lastMessage.content);
      if (isComplete) {
        setIsLLMLoading(false);
      }
    }
  }, [messages]);

  return (
    <>
      {/* 页头 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
        <div className="md:max-w-4xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={40}
                className="mr-2"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="md:max-w-4xl mx-auto p-6 pt-20 pb-24 space-y-6 bg-[var(--secondary-default)]">
        {/* 标题 */}
        <p className="text-4xl text-center text-gray-600 mt-36">
          AI DOCTOR
          <br />
        </p>
        <div className="space-y-6">
          {messages
            .filter((m) => m.role !== "system")
            .map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded py-3 max-w-[85%] ${
                      message.role === "user"
                        ? "bg-[var(--secondary-darker)] text-black px-4"
                        : "text-gray-900"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <>
                        {(() => {
                          const { thinking, finalResponse, isComplete } =
                            parseMessageContent(message.content);
                          return (
                            <>
                              {(thinking || !isComplete) && (
                                <div className="mb-10 space-y-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        setIsThinkingExpanded(
                                          !isThinkingExpanded
                                        )
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <svg
                                        className={`w-5 h-5 transform hover:text-[var(--brand-default)] transition-colors transition-transform ${
                                          isThinkingExpanded
                                            ? "rotate-0"
                                            : "-rotate-180"
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 15l7-7 7 7"
                                        />
                                      </svg>
                                      <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                        />
                                      </svg>
                                      <h3 className="text-md font-medium">
                                        认真思考中
                                      </h3>
                                    </button>
                                  </div>
                                  {isThinkingExpanded && (
                                    <div className="pl-4 relative">
                                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                      <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {thinking}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {isComplete && finalResponse && (
                                <div className="prose prose-base max-w-none px-4 text-gray-800 text-base">
                                  <ReactMarkdown>{finalResponse}</ReactMarkdown>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="whitespace-pre-wrap text-[15px]">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>

                {/* 在用户消息后显示工具调用信息 */}
                {message.role === "user" && toolCallInfo && (
                  <div className="my-4">
                    <ToolCallDisplay toolCall={toolCallInfo} />
                  </div>
                )}

                {/* 在用户消息后显示搜索结果 */}
                {message.role === "user" &&
                  !isSearching &&
                  searchResults.length > 0 && (
                    <div className="my-10 space-y-4">
                      {/* 带有logo的标题 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setIsSourcesExpanded(!isSourcesExpanded)
                          }
                          className="flex items-center gap-2"
                        >
                          <svg
                            className={`w-5 h-5 transform hover:text-[var(--brand-default)] transition-colors transition-transform ${
                              isSourcesExpanded ? "rotate-0" : "-rotate-180"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          <Image
                            src="/search.png"
                            alt="Exa"
                            width={25}
                            height={25}
                          />
                          <h3 className="text-md font-medium">搜索结果</h3>
                        </button>
                      </div>

                      {/* 带有垂直线的结果 */}
                      {isSourcesExpanded && (
                        <div className="pl-4 relative">
                          {/* 垂直线 */}
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                          {/* 内容 */}
                          <div className="space-y-2">
                            {searchResults.map((result, idx) => (
                              <div key={idx} className="text-sm group relative">
                                <a
                                  href={result.url}
                                  target="_blank"
                                  className="text-gray-600 hover:text-[var(--brand-default)] flex items-center gap-2"
                                >
                                  [{idx + 1}] {result.title}
                                  {result.favicon && (
                                    <img
                                      src={result.favicon}
                                      alt=""
                                      className="w-4 h-4 object-contain"
                                    />
                                  )}
                                </a>
                                {/* URL提示 */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 -bottom-6 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                                  {result.url}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isLLMLoading && (
                        <div className="pt-6 flex items-center gap-2 text-gray-500">
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <Image
                            src="/logo.png"
                            alt="Exa"
                            width={80}
                            height={40}
                          />
                          <span className="text-sm">思考中</span>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))}
        </div>

        {searchError && (
          <div className="p-4 bg-red-50 rounded border border-red-100">
            <p className="text-sm text-red-800">⚠️ {searchError}</p>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div
        className={`${
          messages.filter((m) => m.role !== "system").length === 0
            ? "fixed inset-0 flex items-center justify-center bg-transparent"
            : "fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t"
        } z-40 transition-all duration-300`}
      >
        <div
          className={`${
            messages.filter((m) => m.role !== "system").length === 0
              ? "w-full max-w-2xl mx-auto px-6"
              : "w-full max-w-4xl mx-auto px-6 py-4"
          }`}
        >
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="flex gap-2 w-full max-w-4xl">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="请输入您的健康问题..."
                autoFocus
                className={`flex-1 p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-default)] text-base`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSearching}
                className="px-5 py-3 bg-[var(--brand-default)] text-white rounded-md hover:bg-[var(--brand-muted)] font-medium w-[120px]"
              >
                {isSearching ? (
                  <span className="inline-flex justify-center items-center">
                    <span>搜索中</span>
                    <span className="w-[24px] text-left">{loadingDots}</span>
                  </span>
                ) : (
                  "咨询"
                )}
              </button>
            </div>

            {/* 添加提示文本 */}
            {showModelNotice && (
              <p className="text-xs md:text-sm text-gray-600 mt-8">
                医疗智能体由AI驱动，提供专业的医疗咨询服务。
                <br />
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
