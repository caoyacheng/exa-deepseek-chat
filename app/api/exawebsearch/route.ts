// app/api/exawebsearch/route.ts
import Exa from "exa-js";
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 增加超时时间到300秒

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { query, previousQueries = [] } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Format previous queries as context
    let contextualQuery = query;
    if (previousQueries.length > 0) {
      const context = previousQueries
        .map((q: string) => `Previous question: ${q}`)
        .join('\n');
      contextualQuery = `${context}\n\nNow answer the question: ${query}`;
    }

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
    
    try {
      // Use Exa to search for content related to the claim
      const result = await Promise.race([
        exa.searchAndContents(
          contextualQuery,
          {
            type: "auto",
            text: true,
            numResults: 25,
            // livecrawl: "always",
          }
        ),
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Search operation timed out after 60 seconds'));
          });
        })
      ]) as any;
      
      clearTimeout(timeoutId); // 清除超时

      return NextResponse.json({ results: result.results });
    } catch (error) {
      console.error('Exa search error:', error);
      // 如果是超时错误，返回空结果而不是错误
      if (error instanceof Error && error.message.includes('timed out')) {
        return NextResponse.json({ results: [] });
      }
      throw error; // 重新抛出其他类型的错误
    }
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}
