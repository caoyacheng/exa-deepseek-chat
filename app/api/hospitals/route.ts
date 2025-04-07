import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllHospitals, 
  getHospitalById, 
  searchHospitalsByName, 
  filterHospitalsBySpecialty, 
  filterHospitalsByRating,
  getRecommendedHospitals
} from '@/app/data/hospitals';
import { getSpecialtyByName } from '@/app/data/specialties';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const name = url.searchParams.get('name');
    const specialty = url.searchParams.get('specialty');
    const specialtyName = url.searchParams.get('specialtyName');
    const minRating = url.searchParams.get('minRating');
    const recommended = url.searchParams.get('recommended');
    const limit = url.searchParams.get('limit');

    // 如果提供了ID，返回特定医院
    if (id) {
      const hospital = getHospitalById(id);
      if (hospital) {
        return NextResponse.json({ hospital });
      } else {
        return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
      }
    }

    // 如果提供了推荐参数，返回推荐医院
    if (recommended === 'true') {
      const count = limit ? parseInt(limit) : 5;
      const hospitals = getRecommendedHospitals(count);
      return NextResponse.json({ hospitals });
    }

    // 应用筛选条件
    let hospitals = getAllHospitals();

    // 按名称筛选
    if (name) {
      hospitals = searchHospitalsByName(name);
    }

    // 按专科ID筛选
    if (specialty) {
      hospitals = filterHospitalsBySpecialty(specialty);
    }

    // 按专科名称筛选
    if (specialtyName) {
      const specialtyInfo = getSpecialtyByName(specialtyName);
      if (specialtyInfo) {
        hospitals = filterHospitalsBySpecialty(specialtyInfo.id);
      }
    }

    // 按最低评分筛选
    if (minRating) {
      hospitals = filterHospitalsByRating(parseFloat(minRating));
    }

    // 应用限制
    if (limit) {
      hospitals = hospitals.slice(0, parseInt(limit));
    }

    return NextResponse.json({ hospitals });
  } catch (error) {
    console.error('Hospital API error:', error);
    return NextResponse.json(
      { error: `Failed to fetch hospitals | ${error}` }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, location, specialty, specialtyName, minRating, limit } = await req.json();
    
    console.log('Hospital API received params:', { 
      query, 
      location,
      specialty, 
      specialtyName, 
      minRating, 
      limit 
    });
    
    // 应用筛选条件
    let hospitals = getAllHospitals();

    // 按名称筛选
    if (query) {
      hospitals = searchHospitalsByName(query);
    }
    
    // 按位置筛选
    if (location) {
      // 更智能的位置筛选：检查医院名称和地址
      const lowerCaseLocation = location.toLowerCase();
      hospitals = hospitals.filter(hospital => 
        hospital.address.toLowerCase().includes(lowerCaseLocation) ||
        hospital.name.toLowerCase().includes(lowerCaseLocation)
      );
      
      // 如果没有找到任何医院，尝试使用推荐医院
      if (hospitals.length === 0) {
        console.log('No hospitals found by location, using recommended hospitals');
        hospitals = getRecommendedHospitals(5);
      }
    }

    // 按专科ID筛选
    if (specialty) {
      hospitals = filterHospitalsBySpecialty(specialty);
    }

    // 按专科名称筛选
    if (specialtyName) {
      const specialtyInfo = getSpecialtyByName(specialtyName);
      if (specialtyInfo) {
        hospitals = filterHospitalsBySpecialty(specialtyInfo.id);
      }
    }

    // 按最低评分筛选
    if (minRating) {
      hospitals = filterHospitalsByRating(parseFloat(minRating.toString()));
    }

    // 应用限制
    const limitNum = limit ? parseInt(limit.toString()) : undefined;
    if (limitNum) {
      hospitals = hospitals.slice(0, limitNum);
    }

    return NextResponse.json({ hospitals });
  } catch (error) {
    console.error('Hospital API error:', error);
    return NextResponse.json(
      { error: `Failed to search hospitals | ${error}` }, 
      { status: 500 }
    );
  }
}
