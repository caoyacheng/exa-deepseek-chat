import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllDoctors, 
  getDoctorById, 
  getDoctorsByHospital, 
  getDoctorsBySpecialty, 
  searchDoctorsByName, 
  filterDoctorsByRating,
  getRecommendedDoctors,
  getAvailableDoctors
} from '@/app/data/doctors';
import { getSpecialtyByName } from '@/app/data/specialties';
import { getHospitalById, searchHospitalsByName } from '@/app/data/hospitals';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const name = url.searchParams.get('name');
    const hospitalId = url.searchParams.get('hospitalId');
    const hospitalName = url.searchParams.get('hospitalName');
    const specialty = url.searchParams.get('specialty');
    const specialtyName = url.searchParams.get('specialtyName');
    const minRating = url.searchParams.get('minRating');
    const recommended = url.searchParams.get('recommended');
    const available = url.searchParams.get('available');
    const limit = url.searchParams.get('limit');

    // 如果提供了ID，返回特定医生
    if (id) {
      const doctor = getDoctorById(id);
      if (doctor) {
        return NextResponse.json({ doctor });
      } else {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }
    }

    // 如果提供了推荐参数，返回推荐医生
    if (recommended === 'true') {
      const count = limit ? parseInt(limit) : 5;
      const doctors = getRecommendedDoctors(count);
      return NextResponse.json({ doctors });
    }

    // 如果提供了可预约参数，返回可预约医生
    if (available === 'true') {
      const doctors = getAvailableDoctors();
      return NextResponse.json({ doctors });
    }

    // 应用筛选条件
    let doctors = getAllDoctors();

    // 按名称筛选
    if (name) {
      doctors = searchDoctorsByName(name);
    }

    // 按医院ID筛选
    if (hospitalId) {
      doctors = getDoctorsByHospital(hospitalId);
    }

    // 按医院名称筛选
    if (hospitalName) {
      // 查找医院ID
      const hospital = searchHospitalsByName(hospitalName)[0];
      if (hospital) {
        doctors = getDoctorsByHospital(hospital.id);
      } else {
        doctors = [];
      }
    }

    // 按专科ID筛选
    if (specialty) {
      doctors = getDoctorsBySpecialty(specialty);
    }

    // 按专科名称筛选
    if (specialtyName) {
      const specialtyInfo = getSpecialtyByName(specialtyName);
      if (specialtyInfo) {
        doctors = getDoctorsBySpecialty(specialtyInfo.id);
      }
    }

    // 按最低评分筛选
    if (minRating) {
      doctors = filterDoctorsByRating(parseFloat(minRating));
    }

    // 应用限制
    if (limit) {
      doctors = doctors.slice(0, parseInt(limit));
    }

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error('Doctor API error:', error);
    return NextResponse.json(
      { error: `Failed to fetch doctors | ${error}` }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      query, 
      doctor_name,
      hospitalId, 
      hospitalName, 
      specialty, 
      specialtyName, 
      minRating, 
      available,
      limit 
    } = await req.json();
    
    console.log('Doctor API received params:', { 
      query, 
      doctor_name,
      hospitalId, 
      hospitalName, 
      specialty, 
      specialtyName, 
      minRating, 
      available,
      limit 
    });
    
    // 应用筛选条件
    let doctors = getAllDoctors();

    // 按名称筛选
    if (doctor_name) {
      doctors = searchDoctorsByName(doctor_name);
    } else if (query) {
      doctors = searchDoctorsByName(query);
    }

    // 按医院ID筛选
    if (hospitalId) {
      doctors = getDoctorsByHospital(hospitalId);
    }

    // 按医院名称筛选
    if (hospitalName) {
      // 查找医院ID
      const hospital = searchHospitalsByName(hospitalName)[0];
      if (hospital) {
        doctors = getDoctorsByHospital(hospital.id);
      } else {
        doctors = [];
      }
    }

    // 按专科ID筛选
    if (specialty) {
      doctors = getDoctorsBySpecialty(specialty);
    }

    // 按专科名称筛选
    if (specialtyName) {
      const specialtyInfo = getSpecialtyByName(specialtyName);
      if (specialtyInfo) {
        doctors = getDoctorsBySpecialty(specialtyInfo.id);
      }
    }

    // 按最低评分筛选
    if (minRating) {
      doctors = filterDoctorsByRating(parseFloat(minRating.toString()));
    }

    // 筛选可预约医生
    if (available === true) {
      doctors = getAvailableDoctors();
    }

    // 应用限制
    const limitNum = limit ? parseInt(limit.toString()) : undefined;
    if (limitNum) {
      doctors = doctors.slice(0, limitNum);
    }

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error('Doctor API error:', error);
    return NextResponse.json(
      { error: `Failed to search doctors | ${error}` }, 
      { status: 500 }
    );
  }
}

// 预约API
export async function PUT(req: NextRequest) {
  try {
    const { 
      doctorId, 
      patientName, 
      patientPhone, 
      timeSlot, 
      reason 
    } = await req.json();
    
    // 验证必要参数
    if (!doctorId || !patientName || !patientPhone || !timeSlot) {
      return NextResponse.json(
        { error: 'Missing required parameters' }, 
        { status: 400 }
      );
    }

    // 获取医生信息
    const doctor = getDoctorById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' }, 
        { status: 404 }
      );
    }

    // 获取医院信息
    const hospital = getHospitalById(doctor.hospitalId);
    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' }, 
        { status: 404 }
      );
    }

    // 检查时间段是否可用
    // 在实际应用中，这里应该检查数据库中的预约情况
    // 由于是静态数据，我们这里简化处理

    // 创建预约
    const appointment = {
      id: `a${Date.now()}`, // 生成唯一ID
      patientName,
      patientPhone,
      doctorId,
      hospitalId: doctor.hospitalId,
      timeSlot,
      reason: reason || '',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // 在实际应用中，这里应该将预约保存到数据库
    // 由于是静态数据，我们这里简化处理

    return NextResponse.json({ 
      success: true, 
      message: '预约成功',
      appointment,
      doctor,
      hospital
    });
  } catch (error) {
    console.error('Appointment API error:', error);
    return NextResponse.json(
      { error: `Failed to create appointment | ${error}` }, 
      { status: 500 }
    );
  }
}
