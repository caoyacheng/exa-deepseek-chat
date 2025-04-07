"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getAssetPath } from "./utils";

export default function HomePage() {
  const networkRef = useRef<HTMLCanvasElement>(null);

  // 网络动画效果
  useEffect(() => {
    const canvas = networkRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸为父元素的尺寸
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    // 初始化时调整大小
    resizeCanvas();
    // 窗口大小变化时调整大小
    window.addEventListener("resize", resizeCanvas);

    // 节点类
    class Node {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      type: string;

      constructor(
        x: number,
        y: number,
        radius: number,
        color: string,
        type: string
      ) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.type = type; // 'normal', 'medical', 'data'
      }

      // 更新节点位置
      update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        // 边界检测
        if (this.x < this.radius || this.x > width - this.radius) {
          this.vx = -this.vx;
        }
        if (this.y < this.radius || this.y > height - this.radius) {
          this.vy = -this.vy;
        }
      }

      // 绘制节点
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // 如果是医疗节点，绘制十字图标
        if (this.type === "medical") {
          ctx.beginPath();
          ctx.moveTo(this.x - this.radius * 0.5, this.y);
          ctx.lineTo(this.x + this.radius * 0.5, this.y);
          ctx.moveTo(this.x, this.y - this.radius * 0.5);
          ctx.lineTo(this.x, this.y + this.radius * 0.5);
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // 如果是数据节点，绘制数据图标
        if (this.type === "data") {
          ctx.beginPath();
          ctx.moveTo(this.x - this.radius * 0.5, this.y - this.radius * 0.3);
          ctx.lineTo(this.x + this.radius * 0.5, this.y - this.radius * 0.3);
          ctx.moveTo(this.x - this.radius * 0.5, this.y);
          ctx.lineTo(this.x + this.radius * 0.5, this.y);
          ctx.moveTo(this.x - this.radius * 0.5, this.y + this.radius * 0.3);
          ctx.lineTo(this.x + this.radius * 0.5, this.y + this.radius * 0.3);
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    // 创建节点
    const nodes: Node[] = [];
    const nodeCount = 80;
    const width = canvas.width;
    const height = canvas.height;

    for (let i = 0; i < nodeCount; i++) {
      const radius = Math.random() * 2 + 1;
      const x = Math.random() * (width - radius * 2) + radius;
      const y = Math.random() * (height - radius * 2) + radius;

      // 随机选择节点类型和颜色
      let type = "normal";
      let color = "rgba(100, 150, 255, 0.7)"; // 默认蓝色

      if (i % 15 === 0) {
        type = "medical";
        color = "rgba(255, 100, 100, 0.8)"; // 医疗节点为红色
      } else if (i % 10 === 0) {
        type = "data";
        color = "rgba(100, 255, 150, 0.8)"; // 数据节点为绿色
      }

      nodes.push(new Node(x, y, radius, color, type));
    }

    // 绘制函数
    const draw = () => {
      // 清除画布
      ctx.clearRect(0, 0, width, height);

      // 绘制连接线
      ctx.lineWidth = 0.8;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // 只连接一定距离内的节点
          if (distance < 120) {
            // 距离越近，线条越不透明
            const opacity = 1 - distance / 120;

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);

            // 增强线条颜色，确保包含蓝色和绿色
            if (nodes[i].type === "medical" || nodes[j].type === "medical") {
              ctx.strokeStyle = `rgba(255, 100, 100, ${opacity * 0.5})`;
            } else if (nodes[i].type === "data" || nodes[j].type === "data") {
              ctx.strokeStyle = `rgba(50, 205, 100, ${opacity * 0.5})`; // 更鲜艳的绿色
            } else {
              // 随机选择蓝色或浅蓝色
              const blueVariant =
                Math.random() > 0.5
                  ? `rgba(70, 130, 255, ${opacity * 0.5})` // 蓝色
                  : `rgba(0, 180, 255, ${opacity * 0.5})`; // 浅蓝色
              ctx.strokeStyle = blueVariant;
            }

            ctx.stroke();
          }
        }
      }

      // 更新并绘制节点
      for (const node of nodes) {
        node.update(width, height);
        node.draw(ctx);
      }

      // 循环动画
      requestAnimationFrame(draw);
    };

    // 开始动画
    draw();

    // 清理函数
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 页头 */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src={getAssetPath("/Logo.png")}
              alt="Logo"
              width={80}
              height={40}
              className="mr-2"
            />
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="/"
                  className="text-[var(--brand-default)] font-medium hover:text-[var(--brand-muted)]"
                >
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/deepfinchat"
                  className="text-gray-600 font-medium hover:text-[var(--brand-default)]"
                >
                  智能问诊
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 font-medium hover:text-[var(--brand-default)]"
                >
                  关于我们
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-6 text-center text-[var(--gray-800)]">
            智能医疗服务平台
          </h1>
          <p className="text-center text-[var(--gray-600)] max-w-3xl mx-auto mb-8">
            利用先进的人工智能技术，为您提供专业的医疗咨询服务和疾病诊断，让医疗更加便捷、高效。
          </p>
        </section>

        {/* 主要卡片区域 - 只保留医疗智能体和医生副驾驶两个卡片 */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* 医疗智能体卡片 */}
            <Link
              href="/deepfinchat"
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[var(--brand-fainter)] rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-[var(--brand-default)]"
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
                </div>
                <h2 className="text-xl font-bold mb-2 text-[var(--gray-800)]">
                  医疗智能体
                </h2>
                <p className="text-[var(--gray-600)] mb-4 text-sm">
                  基于先进AI技术的医疗智能助手，可以回答您的健康问题，提供专业医疗建议。
                </p>
                <div className="mt-auto">
                  <button className="bg-[var(--brand-default)] text-white py-2 px-4 rounded-full text-sm flex items-center hover:bg-[var(--brand-muted)] transition-colors">
                    <span>立即咨询</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>

            {/* 医生副驾驶卡片 */}
            <Link
              href="/medicalbook"
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
            >
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[var(--accent-skyblue-light)] rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-[var(--accent-skyblue-dark)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2 text-[var(--gray-800)]">
                  医学杂志
                </h2>
                <p className="text-[var(--gray-600)] mb-4 text-sm">
                  基于先进AI提供权威的医学新闻、前沿的医学研究资讯和提供专业的医学洞见。
                </p>
                <div className="mt-auto">
                  <button className="bg-[var(--accent-skyblue-dark)] text-white py-2 px-4 rounded-full text-sm flex items-center hover:opacity-90 transition-opacity">
                    <span>立即阅读</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 网络医疗健康动画 - 铺满底部屏幕，降低高度 */}
        <div className="mt-12 w-full">
          <div className="relative w-full h-64 md:h-[320px] bg-transparent overflow-hidden">
            {/* 渐变边缘效果 - 透明背景 */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent z-10"></div>

            {/* 网络动画 Canvas */}
            <canvas
              ref={networkRef}
              className="absolute inset-0 w-full h-full"
            ></canvas>

            {/* 医疗和健康图标 - 固定位置 */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {/* 心电图图标 */}
              <div className="absolute left-[15%] top-[20%] bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.5 12h2l2-8 2 16 2-8h2"
                  />
                </svg>
              </div>

              {/* DNA图标 */}
              <div className="absolute right-[20%] top-[30%] bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 5v14M5 12h14M5 5l14 14M19 5L5 19"
                  />
                </svg>
              </div>

              {/* 医院图标 */}
              <div className="absolute left-[25%] bottom-[30%] bg-red-100 w-14 h-14 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              {/* 药丸图标 */}
              <div className="absolute right-[30%] bottom-[40%] bg-green-100 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              {/* 大脑图标 */}
              <div className="absolute left-[40%] top-[15%] bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* 心脏图标 */}
              <div className="absolute right-[15%] top-[60%] bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>

            {/* 文字说明 */}
            <div className="absolute bottom-8 left-0 right-0 text-center z-20">
              <p className="text-[var(--gray-800)] font-medium text-xl">
                全球医疗健康服务
              </p>
              <p className="text-[var(--gray-600)] text-base mt-2">
                连接世界各地的医疗资源，为您提供全方位的健康保障
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-[var(--gray-800)] text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">医疗智能平台</h3>
              <p className="text-gray-300 text-sm">
                致力于通过人工智能技术，提供高质量的医疗服务和健康管理解决方案。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">快速链接</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white">
                    首页
                  </Link>
                </li>
                <li>
                  <Link
                    href="/deepfinchat"
                    className="text-gray-300 hover:text-white"
                  >
                    智能问诊
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">联系方式</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>contact@medicalai.com</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>400-123-4567</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} 医疗智能平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
