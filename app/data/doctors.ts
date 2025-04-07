import { Doctor } from "../types/medical";

// 医生静态数据
export const doctors: Doctor[] = [
  // 北京协和医院医生
  {
    id: "d001",
    name: "亚承",
    hospitalId: "h001", // 北京协和医院
    specialty: "cardiology", // 心脏科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周三", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周五", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.9,
    education: ["北京医科大学医学博士", "哈佛大学访问学者"],
    experience: 25,
    biography: "亚承医生是心脏病领域的知名专家，拥有25年临床经验，专注于冠心病和心力衰竭的诊断与治疗。",
    imageUrl: "https://example.com/images/doctors/zhangwei.jpg"
  },
  {
    id: "d002",
    name: "李娜",
    hospitalId: "h001", // 北京协和医院
    specialty: "neurology", // 神经科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周四", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周六", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.8,
    education: ["北京协和医学院神经病学博士"],
    experience: 18,
    biography: "李娜医生专注于神经系统疾病的诊断和治疗，尤其在帕金森病和阿尔茨海默病方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/lina.jpg"
  },
  
  // 上海瑞金医院医生
  {
    id: "d003",
    name: "王强",
    hospitalId: "h002", // 上海瑞金医院
    specialty: "cardiology", // 心脏科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周三", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周五", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.9,
    education: ["上海交通大学医学院博士", "美国梅奥诊所访问学者"],
    experience: 22,
    biography: "王强医生是心血管疾病领域的专家，擅长复杂心脏病的诊断和治疗，尤其在心脏介入手术方面经验丰富。",
    imageUrl: "https://example.com/images/doctors/wangqiang.jpg"
  },
  {
    id: "d004",
    name: "赵敏",
    hospitalId: "h002", // 上海瑞金医院
    specialty: "endocrinology", // 内分泌科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周四", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周六", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.7,
    education: ["复旦大学医学院内分泌学博士"],
    experience: 15,
    biography: "赵敏医生专注于糖尿病和甲状腺疾病的诊断和治疗，在内分泌代谢疾病方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/zhaomin.jpg"
  },
  
  // 广州南方医院医生
  {
    id: "d005",
    name: "陈明",
    hospitalId: "h003", // 广州南方医院
    specialty: "orthopedics", // 骨科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周二", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周四", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.8,
    education: ["中山大学医学院骨科学博士", "德国柏林夏里特医学院访问学者"],
    experience: 20,
    biography: "陈明医生是骨科领域的知名专家，擅长脊柱疾病和关节置换手术，在复杂骨折治疗方面有丰富的经验。",
    imageUrl: "https://example.com/images/doctors/chenming.jpg"
  },
  {
    id: "d006",
    name: "林华",
    hospitalId: "h003", // 广州南方医院
    specialty: "ophthalmology", // 眼科
    title: "副主任医师",
    availability: [
      { day: "周三", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周五", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周六", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.6,
    education: ["中山大学眼科学博士"],
    experience: 16,
    biography: "林华医生专注于眼科疾病的诊断和治疗，尤其在白内障和青光眼手术方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/linhua.jpg"
  },
  
  // 武汉同济医院医生
  {
    id: "d007",
    name: "刘芳",
    hospitalId: "h004", // 武汉同济医院
    specialty: "gastroenterology", // 消化内科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周三", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周五", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.9,
    education: ["华中科技大学同济医学院博士", "日本东京大学访问学者"],
    experience: 23,
    biography: "刘芳医生是消化系统疾病领域的专家，擅长胃肠道疾病和肝胆疾病的诊断和治疗，在内镜技术方面经验丰富。",
    imageUrl: "https://example.com/images/doctors/liufang.jpg"
  },
  {
    id: "d008",
    name: "周健",
    hospitalId: "h004", // 武汉同济医院
    specialty: "pulmonology", // 呼吸内科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周四", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周六", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.7,
    education: ["华中科技大学同济医学院呼吸病学博士"],
    experience: 17,
    biography: "周健医生专注于呼吸系统疾病的诊断和治疗，尤其在慢性阻塞性肺疾病和肺部感染方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/zhoujian.jpg"
  },
  
  // 成都华西医院医生
  {
    id: "d009",
    name: "杨丽",
    hospitalId: "h005", // 成都华西医院
    specialty: "pediatrics", // 儿科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周三", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周五", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.9,
    education: ["四川大学华西医学院儿科学博士", "美国波士顿儿童医院访问学者"],
    experience: 21,
    biography: "杨丽医生是儿科领域的知名专家，擅长儿童常见病和疑难病的诊断和治疗，在儿童发育和免疫方面有丰富的经验。",
    imageUrl: "https://example.com/images/doctors/yangli.jpg"
  },
  {
    id: "d010",
    name: "郑伟",
    hospitalId: "h005", // 成都华西医院
    specialty: "gynecology", // 妇科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周四", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周六", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.8,
    education: ["四川大学华西医学院妇产科学博士"],
    experience: 19,
    biography: "郑伟医生专注于妇科疾病的诊断和治疗，尤其在妇科肿瘤和不孕不育方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/zhengwei.jpg"
  },
  
  // 浙江邵逸夫医院医生
  {
    id: "d011",
    name: "孙明",
    hospitalId: "h006", // 浙江邵逸夫医院
    specialty: "orthopedics", // 骨科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周三", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周五", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.7,
    education: ["浙江大学医学院骨科学博士", "瑞士洛桑大学医院访问学者"],
    experience: 18,
    biography: "孙明医生是骨科领域的专家，擅长关节疾病和运动损伤的诊断和治疗，在微创手术方面经验丰富。",
    imageUrl: "https://example.com/images/doctors/sunming.jpg"
  },
  {
    id: "d012",
    name: "钱芳",
    hospitalId: "h006", // 浙江邵逸夫医院
    specialty: "ophthalmology", // 眼科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周四", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周六", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.6,
    education: ["浙江大学医学院眼科学博士"],
    experience: 15,
    biography: "钱芳医生专注于眼科疾病的诊断和治疗，尤其在近视手术和视网膜疾病方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/qianfang.jpg"
  },
  
  // 天津医科大学总医院医生
  {
    id: "d013",
    name: "吴强",
    hospitalId: "h007", // 天津医科大学总医院
    specialty: "cardiology", // 心脏科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周三", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周五", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.8,
    education: ["天津医科大学心血管病学博士", "德国慕尼黑大学医学中心访问学者"],
    experience: 24,
    biography: "吴强医生是心脏病领域的知名专家，擅长心脏介入手术和心律失常的诊断与治疗，在复杂心脏病例方面有丰富的经验。",
    imageUrl: "https://example.com/images/doctors/wuqiang.jpg"
  },
  {
    id: "d014",
    name: "郭丽",
    hospitalId: "h007", // 天津医科大学总医院
    specialty: "oncology", // 肿瘤科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周四", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周六", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.7,
    education: ["天津医科大学肿瘤学博士"],
    experience: 16,
    biography: "郭丽医生专注于肿瘤疾病的诊断和治疗，尤其在乳腺癌和肺癌方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/guoli.jpg"
  },
  
  // 南京鼓楼医院医生
  {
    id: "d015",
    name: "徐明",
    hospitalId: "h008", // 南京鼓楼医院
    specialty: "gastroenterology", // 消化内科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周三", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周五", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.6,
    education: ["南京医科大学消化病学博士", "美国约翰霍普金斯大学访问学者"],
    experience: 20,
    biography: "徐明医生是消化系统疾病领域的专家，擅长胃肠道疾病和肝胆疾病的诊断和治疗，在内镜技术方面经验丰富。",
    imageUrl: "https://example.com/images/doctors/xuming.jpg"
  },
  {
    id: "d016",
    name: "张丽",
    hospitalId: "h008", // 南京鼓楼医院
    specialty: "nephrology", // 肾脏科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周四", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周六", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.5,
    education: ["南京医科大学肾脏病学博士"],
    experience: 14,
    biography: "张丽医生专注于肾脏疾病的诊断和治疗，尤其在慢性肾病和肾小球肾炎方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/zhangli.jpg"
  },
  
  // 西安交通大学第一附属医院医生
  {
    id: "d017",
    name: "王刚",
    hospitalId: "h009", // 西安交通大学第一附属医院
    specialty: "neurology", // 神经科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周三", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周五", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.7,
    education: ["西安交通大学医学院神经病学博士", "加拿大多伦多大学访问学者"],
    experience: 22,
    biography: "王刚医生是神经系统疾病领域的知名专家，擅长脑血管疾病和神经退行性疾病的诊断与治疗，在脑卒中方面有丰富的经验。",
    imageUrl: "https://example.com/images/doctors/wanggang.jpg"
  },
  {
    id: "d018",
    name: "李明",
    hospitalId: "h009", // 西安交通大学第一附属医院
    specialty: "tcm", // 中医科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周四", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周六", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.6,
    education: ["陕西中医药大学中医内科学博士"],
    experience: 18,
    biography: "李明医生专注于中医内科疾病的诊断和治疗，尤其在中医调理慢性病方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/liming.jpg"
  },
  
  // 哈尔滨医科大学附属第一医院医生
  {
    id: "d019",
    name: "张强",
    hospitalId: "h010", // 哈尔滨医科大学附属第一医院
    specialty: "cardiology", // 心脏科
    title: "主任医师",
    availability: [
      { day: "周一", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周三", startTime: "13:00", endTime: "17:00", available: true },
      { day: "周五", startTime: "13:00", endTime: "17:00", available: true }
    ],
    rating: 4.6,
    education: ["哈尔滨医科大学心血管病学博士", "俄罗斯莫斯科大学访问学者"],
    experience: 19,
    biography: "张强医生是心脏病领域的专家，擅长冠心病和心力衰竭的诊断与治疗，在心脏介入手术方面经验丰富。",
    imageUrl: "https://example.com/images/doctors/zhangqiang.jpg"
  },
  {
    id: "d020",
    name: "刘洋",
    hospitalId: "h010", // 哈尔滨医科大学附属第一医院
    specialty: "pulmonology", // 呼吸内科
    title: "副主任医师",
    availability: [
      { day: "周二", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周四", startTime: "08:00", endTime: "12:00", available: true },
      { day: "周六", startTime: "08:00", endTime: "12:00", available: true }
    ],
    rating: 4.5,
    education: ["哈尔滨医科大学呼吸病学博士"],
    experience: 15,
    biography: "刘洋医生专注于呼吸系统疾病的诊断和治疗，尤其在慢性阻塞性肺疾病和肺部感染方面有丰富的临床经验。",
    imageUrl: "https://example.com/images/doctors/liuyang.jpg"
  }
];

// 通过ID获取医生信息
export const getDoctorById = (id: string): Doctor | undefined => {
  return doctors.find(doctor => doctor.id === id);
};

// 通过医院ID获取医生列表
export const getDoctorsByHospital = (hospitalId: string): Doctor[] => {
  return doctors.filter(doctor => doctor.hospitalId === hospitalId);
};

// 通过专科获取医生列表
export const getDoctorsBySpecialty = (specialty: string): Doctor[] => {
  return doctors.filter(doctor => doctor.specialty === specialty);
};

// 通过名称搜索医生
export const searchDoctorsByName = (name: string): Doctor[] => {
  const lowerCaseName = name.toLowerCase();
  
  // 首先尝试精确匹配
  const exactMatches = doctors.filter(doctor => 
    doctor.name.toLowerCase() === lowerCaseName
  );
  
  if (exactMatches.length > 0) {
    return exactMatches;
  }
  
  // 如果没有精确匹配，尝试部分匹配
  const partialMatches = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(lowerCaseName)
  );
  
  if (partialMatches.length > 0) {
    return partialMatches;
  }
  
  // 如果仍然没有匹配，尝试处理包含职称的名称
  // 例如："亚承主任医师" -> "亚承"
  return doctors.filter(doctor => {
    // 检查医生姓名是否包含在查询中
    if (lowerCaseName.includes(doctor.name.toLowerCase())) {
      return true;
    }
    
    // 检查查询是否包含医生姓名和职称
    const nameWithTitle = `${doctor.name}${doctor.title}`.toLowerCase();
    if (lowerCaseName.includes(nameWithTitle)) {
      return true;
    }
    
    return false;
  });
};

// 通过评分筛选医生
export const filterDoctorsByRating = (minRating: number): Doctor[] => {
  return doctors.filter(doctor => 
    doctor.rating >= minRating
  );
};

// 获取所有医生
export const getAllDoctors = (): Doctor[] => {
  return [...doctors];
};

// 获取推荐医生（评分最高的前N名）
export const getRecommendedDoctors = (count: number = 5): Doctor[] => {
  return [...doctors]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
};

// 获取可预约的医生
export const getAvailableDoctors = (): Doctor[] => {
  return doctors.filter(doctor => 
    doctor.availability.some(slot => slot.available)
  );
};
