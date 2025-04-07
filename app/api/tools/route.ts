import { NextRequest, NextResponse } from 'next/server';
import { ToolType } from '@/app/types/medical';
import { analyzeQueryAndSelectTool } from '@/app/utils/toolSelection';
import { IntentType } from '../intent/route';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
      // 分析查询并选择合适的工具
      const { toolType, params, intentResult } = await analyzeQueryAndSelectTool(query);
      console.log('Selected tool:', toolType);
      console.log('Params:', JSON.stringify(params));
      
      // 获取完整的API URL
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_API_BASE_URL 
          ? process.env.NEXT_PUBLIC_API_BASE_URL 
          : 'http://localhost:3000';
      
      // 根据工具类型调用相应的API
      let toolResponse;
      let apiUrl = '';
      let apiMethod = 'POST';
      let apiBody = {};
      
      // 打印意图识别结果
      console.log('Intent recognition result:', JSON.stringify(intentResult));
      
      switch (toolType) {
        case ToolType.HOSPITAL_QUERY:
          // 调用医院查询API
          apiUrl = `${baseUrl}/api/hospitals`;
          apiMethod = 'POST';
          apiBody = params;
          break;
          
        case ToolType.DOCTOR_QUERY:
          // 调用医生查询API
          apiUrl = `${baseUrl}/api/doctors`;
          apiMethod = 'POST';
          // 参数名称映射和清理
          apiBody = {
            ...params,
            hospitalName: params.hospital_name, // 将hospital_name映射到hospitalName
            specialty: params.specialty === "专业" ? undefined : params.specialty // 如果specialty是"专业"，则设置为undefined
          };
          break;
          
        case ToolType.APPOINTMENT:
          // 调用预约API
          apiUrl = `${baseUrl}/api/doctors`;
          apiMethod = 'PUT';
          
          // 如果只提供了医生姓名，需要先查找医生ID
          if (params.doctor_name && !params.doctorId) {
            try {
              console.log('Looking up doctor ID for:', params.doctor_name);
              const doctorSearchResponse = await fetch(`${baseUrl}/api/doctors`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ doctor_name: params.doctor_name }),
              });
              
              if (!doctorSearchResponse.ok) {
                throw new Error(`Doctor search failed: ${doctorSearchResponse.statusText}`);
              }
              
              const doctorSearchResult = await doctorSearchResponse.json();
              console.log('Doctor search result:', JSON.stringify(doctorSearchResult).substring(0, 200) + '...');
              
              if (doctorSearchResult.doctors && doctorSearchResult.doctors.length > 0) {
                // 使用找到的第一个医生的ID
                params.doctorId = doctorSearchResult.doctors[0].id;
                console.log('Found doctor ID:', params.doctorId);
              } else {
                throw new Error(`No doctor found with name: ${params.doctor_name}`);
              }
            } catch (error: any) {
              console.error('Doctor lookup error:', error);
              throw new Error(`Failed to find doctor: ${error.message || error}`);
            }
          }
          
          // 提供默认参数
          apiBody = {
            doctorId: params.doctorId,
            patientName: params.patientName || '默认患者',
            patientPhone: params.patientPhone || '13800138000',
            timeSlot: params.timeSlot || {
              day: '周一',
              startTime: '09:00',
              endTime: '10:00'
            },
            reason: params.reason || '常规就诊'
          };
          
          console.log('Appointment API body:', JSON.stringify(apiBody));
          break;
          
        case ToolType.NAVIGATION:
          // 调用导航API
          apiUrl = `${baseUrl}/api/map`;
          apiMethod = 'POST';
          apiBody = params;
          break;
          
        case ToolType.SEARCH:
        default:
          // 调用网络搜索API
          apiUrl = `${baseUrl}/api/exawebsearch`;
          apiMethod = 'POST';
          apiBody = { query };
          break;
      }
      
      console.log('API URL:', apiUrl);
      console.log('API Method:', apiMethod);
      console.log('API Body:', JSON.stringify(apiBody));
      
      // 添加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
      
      try {
        // 调用API
        toolResponse = await fetch(apiUrl, {
          method: apiMethod,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); // 清除超时
      
        if (!toolResponse.ok) {
          const errorText = await toolResponse.text();
          console.error('Tool API error response:', errorText);
          
          // 尝试解析错误响应
          let errorJson;
          try {
            errorJson = JSON.parse(errorText);
          } catch (e) {
            // 如果不是JSON格式，继续使用原始错误文本
            errorJson = { error: errorText };
          }
          
          // 特殊处理医院未找到的错误
          if (toolType === ToolType.NAVIGATION && 
              toolResponse.status === 404 && 
              errorJson.error === 'Hospital not found') {
            
            // 直接返回友好的错误信息，而不是抛出异常
            return NextResponse.json({
              toolType,
              intentResult,
              result: {
                error: true,
                message: errorJson.message || `未找到医院"${(apiBody as any).hospital_name || (apiBody as any).hospitalName || '未知医院'}"，请检查医院名称是否正确。`,
                suggestedHospitals: errorJson.suggestedHospitals || []
              }
            });
          }
          
          throw new Error(`Tool API error: ${toolResponse.statusText} - ${errorText}`);
        }
        
        const toolResult = await toolResponse.json();
        console.log('Tool result:', JSON.stringify(toolResult).substring(0, 200) + '...');
      
        return NextResponse.json({
          toolType,
          intentResult,
          result: toolResult
        });
      } catch (error) {
        console.error('API call error:', error);
        // 如果是超时错误，记录特定的错误消息
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('API request timed out after 60 seconds');
        }
        throw error; // 重新抛出错误，让外层错误处理捕获
      }
    } catch (error: any) {
      console.error('Tool API error:', error);
      
      // 如果工具调用失败，默认使用搜索工具
      try {
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NEXT_PUBLIC_API_BASE_URL 
            ? process.env.NEXT_PUBLIC_API_BASE_URL 
            : 'http://localhost:3000';
            
        console.log('Falling back to search tool');
        const searchResponse = await fetch(`${baseUrl}/api/exawebsearch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        
        if (!searchResponse.ok) {
          throw new Error(`Search API error: ${searchResponse.statusText}`);
        }
        
        const searchResult = await searchResponse.json();
        
        return NextResponse.json({
          toolType: ToolType.SEARCH,
          intentResult: {
            intent: IntentType.GENERAL_MEDICAL,
            confidence: 0.5,
            entities: {},
            toolType: ToolType.SEARCH
          },
          result: searchResult
        });
      } catch (searchError: any) {
        console.error('Search fallback error:', searchError);
        return NextResponse.json(
          { error: `Failed to execute tool and fallback search | ${error.message || error}` }, 
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Initial error:', error);
    return NextResponse.json(
      { error: `Failed to process request | ${error}` }, 
      { status: 500 }
    );
  }
}
