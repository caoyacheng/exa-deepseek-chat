import { fireworks } from '@ai-sdk/fireworks';
import { streamText } from 'ai';
import { ToolType } from '@/app/types/medical';

export const maxDuration = 600; // 增加超时时间到600秒

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // 获取最后一条用户消息
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  
  // 如果有用户消息，尝试使用工具
  let toolContext = '';
  let toolCallInfo = null;
  
  if (lastUserMessage) {
    try {
      // 获取完整的API URL
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_API_BASE_URL 
          ? process.env.NEXT_PUBLIC_API_BASE_URL 
          : 'http://localhost:3000';
      
      // 添加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90秒超时
      
      try {
        // 调用工具API
        const toolResponse = await fetch(`${baseUrl}/api/tools`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: lastUserMessage.content }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); // 清除超时
      
        if (toolResponse.ok) {
          const toolResult = await toolResponse.json();
          
          // 保存工具调用信息，用于前端展示
          toolCallInfo = {
            toolType: toolResult.toolType,
            params: toolResult.intentResult?.entities || {},
            result: toolResult.result
          };
          
          // 根据工具类型生成上下文
          switch (toolResult.toolType) {
            case ToolType.HOSPITAL_QUERY:
              if (toolResult.result.hospitals && toolResult.result.hospitals.length > 0) {
                toolContext = `医院查询结果:\n\n${toolResult.result.hospitals.map((h: any, i: number) => 
                  `医院 [${i + 1}]:\n名称: ${h.name}\n地址: ${h.address}\n评分: ${h.rating}\n专科: ${h.specialties.join(', ')}\n描述: ${h.description}\n联系电话: ${h.contactInfo.phone}\n---`
                ).join('\n\n')}`;
              } else if (toolResult.result.hospital) {
                const h = toolResult.result.hospital;
                toolContext = `医院信息:\n\n名称: ${h.name}\n地址: ${h.address}\n评分: ${h.rating}\n专科: ${h.specialties.join(', ')}\n描述: ${h.description}\n联系电话: ${h.contactInfo.phone}`;
              }
              break;
              
            case ToolType.DOCTOR_QUERY:
              if (toolResult.result.doctors && toolResult.result.doctors.length > 0) {
                toolContext = `医生查询结果:\n\n${toolResult.result.doctors.map((d: any, i: number) => 
                  `医生 [${i + 1}]:\n姓名: ${d.name}\n职称: ${d.title}\n专科: ${d.specialty}\n评分: ${d.rating}\n简介: ${d.biography}\n---`
                ).join('\n\n')}`;
              } else if (toolResult.result.doctor) {
                const d = toolResult.result.doctor;
                toolContext = `医生信息:\n\n姓名: ${d.name}\n职称: ${d.title}\n专科: ${d.specialty}\n评分: ${d.rating}\n简介: ${d.biography}`;
              }
              break;
              
            case ToolType.APPOINTMENT:
              if (toolResult.result.success) {
                const a = toolResult.result.appointment;
                const d = toolResult.result.doctor;
                const h = toolResult.result.hospital;
                toolContext = `预约信息:\n\n预约状态: ${toolResult.result.message}\n患者姓名: ${a.patientName}\n医生: ${d.name} (${d.title})\n医院: ${h.name}\n时间: ${a.timeSlot.day} ${a.timeSlot.startTime}-${a.timeSlot.endTime}\n预约号: ${a.id}`;
              }
              break;
              
            case ToolType.NAVIGATION:
              if (toolResult.result.navigation && toolResult.result.hospital) {
                const nav = toolResult.result.navigation;
                const h = toolResult.result.hospital;
                toolContext = `导航信息:\n\n目的地: ${h.name} (${h.address})\n距离: ${nav.distance}\n预计时间: ${nav.duration}\n\n路线指引:\n${nav.steps.map((s: any, i: number) => `${i + 1}. ${s.instruction} (${s.distance}, ${s.duration})`).join('\n')}`;
              }
              break;
              
            case ToolType.SEARCH:
            default:
              if (toolResult.result.results && toolResult.result.results.length > 0) {
                toolContext = `网络搜索结果:\n\n${toolResult.result.results.map((r: any, i: number) => 
                  `来源 [${i + 1}]:\n标题: ${r.title}\n网址: ${r.url}\n${r.author ? `作者: ${r.author}\n` : ''}${r.publishedDate ? `日期: ${r.publishedDate}\n` : ''}内容: ${r.text}\n---`
                ).join('\n\n')}`;
              }
              break;
          }
        }
      } catch (error) {
        console.error('Tool execution error:', error);
        // 如果是超时错误，记录特定的错误消息
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Tool API request timed out after 90 seconds');
        }
        // 如果工具调用失败，继续处理，但不添加工具上下文
      }
    } catch (error) {
      console.error('Tool execution error:', error);
      // 如果工具调用失败，继续处理，但不添加工具上下文
    }
  }
  
  // 构建系统提示
  const systemPrompt = `你是一个专业的医疗助手，能够帮助用户解答医疗相关问题、查找医院和医生、预约就诊以及提供导航信息。

你应该使用简单易懂的中文回答用户的问题。在回答时，请参考提供的工具结果（如果有）。

如果用户询问医院信息，请提供医院的名称、地址、专科和联系方式等关键信息。
如果用户询问医生信息，请提供医生的姓名、职称、专科和简介等关键信息。
如果用户要预约医生，请确认预约的状态并提供预约的详细信息。
如果用户询问如何去医院，请提供清晰的导航指引。
如果是一般医疗咨询，请基于搜索结果提供准确的医疗信息，并引用来源。

在给出最终答案之前，请先思考分析，逐步推理。深入思考并检查你的推理过程，进行3-5个思考步骤。请将思考过程用<think>标签包裹起来，以<think>开始，以</think>结束，然后给出最终答案。`;

  // 添加工具上下文和工具调用信息作为系统消息
  let updatedMessages = [...messages];
  
  // 添加工具上下文
  if (toolContext) {
    updatedMessages = [
      ...updatedMessages,
      {
        role: 'system',
        content: `以下是与用户查询相关的信息:\n\n${toolContext}\n\n请基于上述信息回答用户的问题。引用信息时，请使用方括号引用来源编号，如[1]、[2]等。请使用简洁明了的语言。`
      }
    ];
  }
  
  // 添加工具调用信息
  if (toolCallInfo) {
    updatedMessages = [
      ...updatedMessages,
      {
        role: 'system',
        content: `__TOOL_CALL_INFO__:${JSON.stringify(toolCallInfo)}`
      }
    ];
  }

  // 创建一个自定义的响应流
  const result = streamText({
    model: fireworks('accounts/fireworks/models/deepseek-v3-0324'),
    system: systemPrompt,
    messages: updatedMessages,
  });

  // 返回普通的响应
  return result.toDataStreamResponse({ sendReasoning: true });
}
