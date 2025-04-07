import { IntentType } from "../api/intent/route";
import { ToolType } from "../types/medical";

/**
 * 分析用户查询并选择合适的工具
 * @param query 用户查询
 * @returns 工具类型和参数的Promise
 */
export const analyzeQueryAndSelectTool = async (query: string) => {
  try {
    // 获取完整的API URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_API_BASE_URL 
        ? process.env.NEXT_PUBLIC_API_BASE_URL 
        : 'http://localhost:3000';
    
    // 调用意图识别API
    const response = await fetch(`${baseUrl}/api/intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Intent recognition failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      toolType: result.toolType,
      params: {
        query,
        ...result.entities
      },
      intentResult: result
    };
  } catch (error) {
    console.error('Tool selection error:', error);
    
    // 如果意图识别失败，默认使用搜索工具
    return {
      toolType: ToolType.SEARCH,
      params: {
        query
      },
      intentResult: {
        intent: IntentType.GENERAL_MEDICAL,
        confidence: 0.5,
        entities: {},
        toolType: ToolType.SEARCH
      }
    };
  }
};

/**
 * 获取工具的描述
 * @param toolType 工具类型
 * @returns 工具描述
 */
export const getToolDescription = (toolType: ToolType): string => {
  switch (toolType) {
    case ToolType.HOSPITAL_QUERY:
      return "医院查询工具";
    
    case ToolType.DOCTOR_QUERY:
      return "医生查询工具";
    
    case ToolType.APPOINTMENT:
      return "预约工具";
    
    case ToolType.NAVIGATION:
      return "导航工具";
    
    case ToolType.SEARCH:
    default:
      return "网络搜索工具";
  }
};

/**
 * 获取意图的描述
 * @param intent 意图类型
 * @returns 意图描述
 */
export const getIntentDescription = (intent: IntentType): string => {
  switch (intent) {
    case IntentType.HOSPITAL_SEARCH:
      return "查找医院";
    
    case IntentType.DOCTOR_SEARCH:
      return "查找医生";
    
    case IntentType.APPOINTMENT:
      return "预约医生";
    
    case IntentType.NAVIGATION:
      return "获取导航信息";
    
    case IntentType.GENERAL_MEDICAL:
      return "一般医疗咨询";
    
    case IntentType.UNKNOWN:
    default:
      return "未知意图";
  }
};
