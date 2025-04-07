import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Load the ABCDiatype font (Regular and Bold only)
const abcdDiatype = localFont({
  src: [
    { path: "./fonts/ABCDiatype-Regular.otf", weight: "400" },
    { path: "./fonts/ABCDiatype-Bold.otf", weight: "700" },
  ],
  variable: "--font-abcd-diatype",
});

// Load the Reckless font (Regular and Medium only)
const reckless = localFont({
  src: [
    { path: "./fonts/RecklessTRIAL-Regular.woff2", weight: "400" },
    { path: "./fonts/RecklessTRIAL-Medium.woff2", weight: "500" },
  ],
  variable: "--font-reckless",
});

export const metadata: Metadata = {
  title: "AI医疗智能平台 - 专业医疗咨询服务",
  description:
    "AI医疗智能平台提供专业的医疗咨询服务，利用先进的人工智能技术，为您解答健康问题，提供医疗建议。",
  openGraph: {
    title: "AI医疗智能平台 - 专业医疗咨询服务",
    description:
      "AI医疗智能平台提供专业的医疗咨询服务，利用先进的人工智能技术，为您解答健康问题，提供医疗建议。",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "https://demo.exa.ai/deepfinchat/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI医疗智能平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI医疗智能平台 - 专业医疗咨询服务",
    description:
      "AI医疗智能平台提供专业的医疗咨询服务，利用先进的人工智能技术，为您解答健康问题，提供医疗建议。",
    images: ["https://demo.exa.ai/deepfinchat/opengraph-image.jpg"],
  },
  metadataBase: new URL("https://demo.exa.ai/deepfinchat"),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${abcdDiatype.variable} ${reckless.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
