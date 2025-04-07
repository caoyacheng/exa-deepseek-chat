import { ToolType } from '@/app/types/medical';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 增加超时时间到300秒

// 意图类型
export enum IntentType {
  HOSPITAL_SEARCH = 'hospital_search',
  DOCTOR_SEARCH = 'doctor_search',
  APPOINTMENT = 'appointment',
  NAVIGATION = 'navigation',
  GENERAL_MEDICAL = 'general_medical',
  UNKNOWN = 'unknown'
}

// 意图识别结果接口
export interface IntentRecognitionResult {
  intent: IntentType;
  confidence: number;
  entities: {
    [key: string]: string;
  };
  toolType: ToolType;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 使用DeepSeek进行意图识别
    const systemPrompt = `你是一个医疗助手的意图识别组件。你的任务是分析用户的查询，识别其意图和相关实体。
    
可能的意图类型包括：
1. hospital_search: 用户想要查找医院
2. doctor_search: 用户想要查找医生
3. appointment: 用户想要预约医生
4. navigation: 用户想要获取去医院的路线
5. general_medical: 用户有一般医疗咨询
6. unknown: 无法确定用户意图

可能的实体包括：
- specialty: 医疗专科，如"心脏科"、"神经科"等
- hospital_name: 医院名称
- doctor_name: 医生姓名
- location: 地点信息
- symptom: 症状描述

请以JSON格式返回分析结果，包括：
- intent: 意图类型（上述6种之一）
- confidence: 置信度（0-1之间的小数）
- entities: 识别到的实体（键值对）
- toolType: 应该使用的工具类型，可选值为：
  * search: 一般搜索
  * hospital_query: 医院查询
  * doctor_query: 医生查询
  * appointment: 预约
  * navigation: 导航

注意：
1. 当用户查询包含医生姓名时，请确保在entities中包含doctor_name字段，并将医生姓名作为其值。
2. 当用户查询包含医院名称时，请确保在entities中包含hospital_name字段，并将医院名称作为其值。
3. 当用户查询包含专科名称时，请确保在entities中包含specialty字段，并将专科名称作为其值。
4. 当用户查询是关于预约医生时，请将toolType设置为appointment。
5. 当用户查询是关于如何去医院时，请将toolType设置为navigation。
6. 当用户查询是关于某个医院的医生时，请将intent设置为doctor_search，toolType设置为doctor_query，并在entities中包含hospital_name字段。
7. 请特别注意识别查询中的医院名称，例如"北京协和医院有哪些医生"中，"北京协和医院"应被识别为hospital_name。

只返回JSON格式的结果，不要有其他文字。`;

    // 直接使用Fireworks API
    const fireworksApiKey = process.env.FIREWORKS_API_KEY;
    if (!fireworksApiKey) {
      throw new Error('FIREWORKS_API_KEY is not defined');
    }

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
    
    try {
      const fireworksResponse = await fetch('https://api.fireworks.ai/inference/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fireworksApiKey}`
        },
        body: JSON.stringify({
          model: 'accounts/fireworks/models/deepseek-v3-0324',
          prompt: `<system>${systemPrompt}</system>\n\n<user>用户查询: "${query}"</user>\n\n<assistant>`,
          temperature: 0.1,
          max_tokens: 500,
          stop: ["</assistant>"]
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // 清除超时

      if (!fireworksResponse.ok) {
        throw new Error(`Fireworks API error: ${fireworksResponse.statusText}`);
      }

      const fireworksData = await fireworksResponse.json();
      const fullResponse = fireworksData.choices[0].text;

      // 解析DeepSeek的响应
      let result: IntentRecognitionResult;
      try {
      // 尝试直接解析JSON
      const parsedResult = JSON.parse(fullResponse);
      
      // 验证并修正toolType
      let toolType: ToolType;
      switch (parsedResult.toolType) {
        case 'hospital_query':
          toolType = ToolType.HOSPITAL_QUERY;
          break;
        case 'doctor_query':
          toolType = ToolType.DOCTOR_QUERY;
          break;
        case 'appointment':
          toolType = ToolType.APPOINTMENT;
          break;
        case 'navigation':
          toolType = ToolType.NAVIGATION;
          break;
        case 'search':
        default:
          toolType = ToolType.SEARCH;
          break;
      }
      
      // 构建结果对象
      result = {
        intent: parsedResult.intent || IntentType.GENERAL_MEDICAL,
        confidence: parsedResult.confidence || 0.5,
        entities: parsedResult.entities || {},
        toolType: toolType
      };
    } catch (e) {
      // 如果直接解析失败，尝试从文本中提取JSON
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const parsedResult = JSON.parse(jsonMatch[0]);
          
          // 验证并修正toolType
          let toolType: ToolType;
          switch (parsedResult.toolType) {
            case 'hospital_query':
              toolType = ToolType.HOSPITAL_QUERY;
              break;
            case 'doctor_query':
              toolType = ToolType.DOCTOR_QUERY;
              break;
            case 'appointment':
              toolType = ToolType.APPOINTMENT;
              break;
            case 'navigation':
              toolType = ToolType.NAVIGATION;
              break;
            case 'search':
            default:
              toolType = ToolType.SEARCH;
              break;
          }
          
          // 构建结果对象
          result = {
            intent: parsedResult.intent || IntentType.GENERAL_MEDICAL,
            confidence: parsedResult.confidence || 0.5,
            entities: parsedResult.entities || {},
            toolType: toolType
          };
        } catch (e) {
          // 如果解析提取的JSON失败，返回默认结果
          result = {
            intent: IntentType.GENERAL_MEDICAL,
            confidence: 0.5,
            entities: {},
            toolType: ToolType.SEARCH
          };
        }
      } else {
        // 如果无法提取JSON，返回默认结果
        result = {
          intent: IntentType.GENERAL_MEDICAL,
          confidence: 0.5,
          entities: {},
          toolType: ToolType.SEARCH
        };
      }
    }

      return NextResponse.json(result);
    } catch (abortError) {
      // 处理超时错误
      console.error('Fireworks API timeout:', abortError);
      
      // 返回默认结果
      return NextResponse.json({
        intent: IntentType.GENERAL_MEDICAL,
        confidence: 0.5,
        entities: {},
        toolType: ToolType.SEARCH
      });
    }
  } catch (error) {
    console.error('Intent recognition error:', error);
    return NextResponse.json(
      { error: `Failed to recognize intent | ${error}` }, 
      { status: 500 }
    );
  }
}
