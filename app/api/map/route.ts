import { NextRequest, NextResponse } from 'next/server';
import { NavigationInfo, NavigationStep, GeoLocation } from '@/app/types/medical';
import { getHospitalById, searchHospitalsByName, getRecommendedHospitals } from '@/app/data/hospitals';

// 模拟用户当前位置（北京市中心）
const DEFAULT_USER_LOCATION: GeoLocation = {
  latitude: 39.9042,
  longitude: 116.4074
};

// 计算两点之间的距离（公里）
const calculateDistance = (point1: GeoLocation, point2: GeoLocation): number => {
  const R = 6371; // 地球半径（公里）
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// 生成模拟导航步骤
const generateNavigationSteps = (distance: number): NavigationStep[] => {
  const steps: NavigationStep[] = [];
  
  // 步骤1：起点
  steps.push({
    instruction: "从当前位置出发",
    distance: "0公里",
    duration: "0分钟"
  });
  
  // 步骤2：主要道路
  const mainRoadDistance = distance * 0.4;
  steps.push({
    instruction: "沿主干道直行",
    distance: `${mainRoadDistance.toFixed(1)}公里`,
    duration: `${Math.ceil(mainRoadDistance * 3)}分钟`
  });
  
  // 步骤3：转弯
  steps.push({
    instruction: "在下一个路口右转",
    distance: "0.1公里",
    duration: "1分钟"
  });
  
  // 步骤4：次要道路
  const secondaryRoadDistance = distance * 0.3;
  steps.push({
    instruction: "沿次干道直行",
    distance: `${secondaryRoadDistance.toFixed(1)}公里`,
    duration: `${Math.ceil(secondaryRoadDistance * 4)}分钟`
  });
  
  // 步骤5：转弯
  steps.push({
    instruction: "在十字路口左转",
    distance: "0.1公里",
    duration: "1分钟"
  });
  
  // 步骤6：最后一段路
  const finalDistance = distance * 0.2;
  steps.push({
    instruction: "继续直行",
    distance: `${finalDistance.toFixed(1)}公里`,
    duration: `${Math.ceil(finalDistance * 3)}分钟`
  });
  
  // 步骤7：到达目的地
  steps.push({
    instruction: "到达目的地",
    distance: "0公里",
    duration: "0分钟"
  });
  
  return steps;
};

// 生成导航信息
const generateNavigationInfo = (origin: GeoLocation, destination: GeoLocation): NavigationInfo => {
  const distance = calculateDistance(origin, destination);
  const roundedDistance = Math.round(distance * 10) / 10;
  
  // 估算时间（假设平均速度为20公里/小时）
  const durationMinutes = Math.ceil(distance * 3); // 每公里3分钟
  
  return {
    origin,
    destination,
    distance: `${roundedDistance.toFixed(1)}公里`,
    duration: `${durationMinutes}分钟`,
    steps: generateNavigationSteps(distance)
  };
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const hospitalId = url.searchParams.get('hospitalId');
    const originLat = url.searchParams.get('originLat');
    const originLng = url.searchParams.get('originLng');
    
    if (!hospitalId) {
      return NextResponse.json(
        { error: 'Hospital ID is required' }, 
        { status: 400 }
      );
    }
    
    // 获取医院信息
    const hospital = getHospitalById(hospitalId);
    if (!hospital) {
      return NextResponse.json(
        { 
          error: 'Hospital not found',
          message: `未找到ID为"${hospitalId}"的医院，请检查医院ID是否正确，或尝试搜索其他医院。`,
          suggestedHospitals: getRecommendedHospitals(3).map(h => h.name)
        }, 
        { status: 404 }
      );
    }
    
    // 确定起点位置
    let origin: GeoLocation;
    if (originLat && originLng) {
      origin = {
        latitude: parseFloat(originLat),
        longitude: parseFloat(originLng)
      };
    } else {
      origin = DEFAULT_USER_LOCATION;
    }
    
    // 生成导航信息
    const navigationInfo = generateNavigationInfo(origin, hospital.location);
    
    return NextResponse.json({ 
      navigation: navigationInfo,
      hospital
    });
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { error: `Failed to generate navigation | ${error}` }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { hospitalId, hospitalName, hospital_name, origin } = await req.json();
    
    // 记录接收到的参数
    console.log('Navigation API received params:', { hospitalId, hospitalName, hospital_name, origin });
    
    // 验证必要参数
    const effectiveHospitalName = hospitalName || hospital_name;
    if (!hospitalId && !effectiveHospitalName) {
      return NextResponse.json(
        { error: 'Either hospital ID or name is required' }, 
        { status: 400 }
      );
    }
    
    // 获取医院信息
    let hospital = null;
    if (hospitalId) {
      hospital = getHospitalById(hospitalId);
    } else if (effectiveHospitalName) {
      // 通过名称查找医院
      const hospitals = searchHospitalsByName(effectiveHospitalName);
      if (hospitals.length > 0) {
        hospital = hospitals[0]; // 使用第一个匹配的医院
      }
    }
    
    if (!hospital) {
      // 改进错误处理，返回更友好的错误信息
      return NextResponse.json(
        { 
          error: 'Hospital not found',
          message: `未找到医院"${effectiveHospitalName}"，请检查医院名称是否正确，或尝试搜索其他医院。`,
          suggestedHospitals: getRecommendedHospitals(3).map(h => h.name) // 返回推荐的医院列表
        }, 
        { status: 404 }
      );
    }
    
    // 确定起点位置
    let originLocation: GeoLocation;
    if (origin && typeof origin === 'object' && 'latitude' in origin && 'longitude' in origin) {
      originLocation = origin as GeoLocation;
    } else {
      originLocation = DEFAULT_USER_LOCATION;
    }
    
    // 生成导航信息
    const navigationInfo = generateNavigationInfo(originLocation, hospital.location);
    
    return NextResponse.json({ 
      navigation: navigationInfo,
      hospital
    });
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json(
      { error: `Failed to generate navigation | ${error}` }, 
      { status: 500 }
    );
  }
}
