"use client";

import { useState } from 'react';
import { ToolType } from '@/app/types/medical';

interface ToolCallInfo {
  toolType: ToolType;
  params: any;
  result: any;
}

interface ToolCallDisplayProps {
  toolCall: ToolCallInfo;
}

export default function ToolCallDisplay({ toolCall }: ToolCallDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 获取工具类型的友好名称
  const getToolTypeName = (type: ToolType) => {
    switch (type) {
      case ToolType.HOSPITAL_QUERY:
        return "医院查询";
      case ToolType.DOCTOR_QUERY:
        return "医生查询";
      case ToolType.APPOINTMENT:
        return "预约服务";
      case ToolType.NAVIGATION:
        return "导航服务";
      case ToolType.SEARCH:
        return "网络搜索";
      default:
        return "未知工具";
    }
  };
  
  // 获取工具图标
  const getToolIcon = (type: ToolType) => {
    switch (type) {
      case ToolType.HOSPITAL_QUERY:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case ToolType.DOCTOR_QUERY:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case ToolType.APPOINTMENT:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case ToolType.NAVIGATION:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case ToolType.SEARCH:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };
  
  // 渲染参数
  const renderParams = (params: any) => {
    if (!params) return null;
    
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700">参数:</h4>
        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
    );
  };
  
  // 渲染结果
  const renderResult = (result: any, toolType: ToolType) => {
    if (!result) return null;
    
    switch (toolType) {
      case ToolType.HOSPITAL_QUERY:
        return renderHospitalResult(result);
      case ToolType.DOCTOR_QUERY:
        return renderDoctorResult(result);
      case ToolType.APPOINTMENT:
        return renderAppointmentResult(result);
      case ToolType.NAVIGATION:
        return renderNavigationResult(result);
      case ToolType.SEARCH:
        return renderSearchResult(result);
      default:
        return (
          <div className="mt-2">
            <h4 className="text-sm font-medium text-gray-700">结果:</h4>
            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        );
    }
  };
  
  // 渲染医院查询结果
  const renderHospitalResult = (result: any) => {
    if (!result) return null;
    
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700">查询结果:</h4>
        <div className="mt-1 space-y-2">
          {result.hospitals && result.hospitals.length > 0 ? (
            result.hospitals.map((hospital: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-medium text-gray-900">{hospital.name}</h5>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {hospital.rating} ★
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{hospital.address}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {hospital.specialties.map((specialty: string, i: number) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : result.hospital ? (
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <h5 className="text-sm font-medium text-gray-900">{result.hospital.name}</h5>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {result.hospital.rating} ★
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{result.hospital.address}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {result.hospital.specialties.map((specialty: string, i: number) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">未找到医院信息</p>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染医生查询结果
  const renderDoctorResult = (result: any) => {
    if (!result) return null;
    
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700">查询结果:</h4>
        <div className="mt-1 space-y-2">
          {result.doctors && result.doctors.length > 0 ? (
            result.doctors.map((doctor: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{doctor.name}</h5>
                    <p className="text-xs text-gray-500">{doctor.title} | {doctor.specialty}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {doctor.rating} ★
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{doctor.biography}</p>
              </div>
            ))
          ) : result.doctor ? (
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-sm font-medium text-gray-900">{result.doctor.name}</h5>
                  <p className="text-xs text-gray-500">{result.doctor.title} | {result.doctor.specialty}</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {result.doctor.rating} ★
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">{result.doctor.biography}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">未找到医生信息</p>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染预约结果
  const renderAppointmentResult = (result: any) => {
    if (!result || !result.success) return (
      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700">预约结果:</h4>
        <p className="text-sm text-red-500 mt-1">预约失败</p>
      </div>
    );
    
    const { appointment, doctor, hospital } = result;
    
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700">预约结果:</h4>
        <div className="mt-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-900">预约成功</h5>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              #{appointment.id}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <p><span className="text-gray-500">患者:</span> {appointment.patientName}</p>
            <p><span className="text-gray-500">医生:</span> {doctor.name} ({doctor.title})</p>
            <p><span className="text-gray-500">医院:</span> {hospital.name}</p>
            <p><span className="text-gray-500">时间:</span> {appointment.timeSlot.day} {appointment.timeSlot.startTime}-{appointment.timeSlot.endTime}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染导航结果
  const renderNavigationResult = (result: any) => {
    if (!result || !result.navigation || !result.hospital) return null;
    
    const { navigation, hospital } = result;
    
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700">导航信息:</h4>
        <div className="mt-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-900">{hospital.name}</h5>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {navigation.distance}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                {navigation.duration}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{hospital.address}</p>
          
          <h6 className="text-xs font-medium text-gray-700 mt-3 mb-1">路线指引:</h6>
          <ol className="space-y-2">
            {navigation.steps.map((step: any, index: number) => (
              <li key={index} className="text-xs flex items-start">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-700 mr-2 flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="text-gray-800">{step.instruction}</p>
                  <p className="text-gray-500 text-xs">{step.distance} · {step.duration}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  };
  
  // 渲染搜索结果
  const renderSearchResult = (result: any) => {
    if (!result || !result.results || result.results.length === 0) return null;
    
    return (
      <div className="mt-2">
        <h4 className="text-sm font-medium text-gray-700">搜索结果:</h4>
        <div className="mt-1 space-y-2">
          {result.results.map((item: any, index: number) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block truncate">
                {item.url}
              </a>
              {item.author && <p className="text-xs text-gray-500 mt-1">作者: {item.author}</p>}
              {item.publishedDate && <p className="text-xs text-gray-500">日期: {item.publishedDate}</p>}
              <p className="text-xs text-gray-600 mt-1 line-clamp-3">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="my-4 rounded-lg border border-gray-200 overflow-hidden">
      {/* 工具调用头部 */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
            {getToolIcon(toolCall.toolType)}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {getToolTypeName(toolCall.toolType)}
            </h3>
            <p className="text-xs text-gray-500">工具调用过程</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${
              isExpanded ? "rotate-0" : "-rotate-180"
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
        </button>
      </div>
      
      {/* 工具调用内容 */}
      {isExpanded && (
        <div className="p-4 bg-white">
          {/* 工具调用过程 */}
          <div className="space-y-4">
            {/* 参数 */}
            {renderParams(toolCall.params)}
            
            {/* 结果 */}
            {renderResult(toolCall.result, toolCall.toolType)}
          </div>
        </div>
      )}
    </div>
  );
}
