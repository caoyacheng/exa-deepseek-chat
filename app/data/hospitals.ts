import { Hospital } from "../types/medical";

// 医院静态数据
export const hospitals: Hospital[] = [
  {
    id: "h012",
    name: "第七人民医院",
    address: "上海市浦东新区大同路200号",
    specialties: ["orthopedics", "neurology", "cardiology", "pediatrics", "emergency"],
    rating: 4.7,
    description: "上海市第七人民医院是一家综合性三级医院，在骨科和神经科领域有较高声誉，同时提供全面的儿科服务。",
    location: {
      latitude: 31.2456,
      longitude: 121.5123
    },
    contactInfo: {
      phone: "021-58858999",
      email: "info@seventh-hospital.org.cn",
      website: "https://www.seventh-hospital.org.cn"
    },
    imageUrl: "https://example.com/images/hospitals/seventh-hospital.jpg"
  },
  {
    id: "h011",
    name: "第六人民医院",
    address: "上海市徐汇区宜山路600号",
    specialties: ["endocrinology", "orthopedics", "cardiology", "neurology", "gastroenterology"],
    rating: 4.8,
    description: "上海市第六人民医院是一家三级甲等综合性医院，在内分泌和代谢疾病方面尤为专长，是上海市糖尿病研究所所在地。",
    location: {
      latitude: 31.1773,
      longitude: 121.4217
    },
    contactInfo: {
      phone: "021-64369181",
      email: "info@sixth-hospital.org.cn",
      website: "https://www.sixth-hospital.org.cn"
    },
    imageUrl: "https://example.com/images/hospitals/sixth-hospital.jpg"
  },
  {
    id: "h001",
    name: "北京协和医院",
    address: "北京市东城区帅府园1号",
    specialties: ["cardiology", "neurology", "oncology", "orthopedics", "gastroenterology"],
    rating: 5,
    description: "北京协和医院是中国最著名的综合性医院之一，拥有一流的医疗设备和专业团队，提供高质量的医疗服务。",
    location: {
      latitude: 39.9123,
      longitude: 116.4171
    },
    contactInfo: {
      phone: "010-69156114",
      email: "contact@pumch.cn",
      website: "https://www.pumch.cn"
    },
    imageUrl: "https://example.com/images/hospitals/pumch.jpg"
  },
  {
    id: "h002",
    name: "上海瑞金医院",
    address: "上海市瑞金二路197号",
    specialties: ["cardiology", "endocrinology", "nephrology", "rheumatology", "hematology"],
    rating: 4.9,
    description: "上海瑞金医院是一家三级甲等综合性医院，在心血管疾病、内分泌疾病等领域具有很高的声誉。",
    location: {
      latitude: 31.2152,
      longitude: 121.4717
    },
    contactInfo: {
      phone: "021-64370045",
      email: "info@rjh.com.cn",
      website: "https://www.rjh.com.cn"
    },
    imageUrl: "https://example.com/images/hospitals/rjh.jpg"
  },
  {
    id: "h003",
    name: "广州南方医院",
    address: "广州市白云区广州大道北1838号",
    specialties: ["orthopedics", "neurology", "ophthalmology", "ent", "dermatology"],
    rating: 4.7,
    description: "广州南方医院是华南地区的重点医院，拥有先进的医疗设备和技术，在骨科和神经科领域尤为突出。",
    location: {
      latitude: 23.1924,
      longitude: 113.2699
    },
    contactInfo: {
      phone: "020-62787333",
      email: "service@nfyy.com",
      website: "https://www.nfyy.com"
    },
    imageUrl: "https://example.com/images/hospitals/nfyy.jpg"
  },
  {
    id: "h004",
    name: "武汉同济医院",
    address: "武汉市硚口区解放大道1095号",
    specialties: ["gastroenterology", "pulmonology", "urology", "oncology", "cardiology"],
    rating: 4.8,
    description: "武汉同济医院是华中地区的顶级医院，在消化系统疾病和肺部疾病治疗方面处于国内领先水平。",
    location: {
      latitude: 30.5857,
      longitude: 114.2694
    },
    contactInfo: {
      phone: "027-83662688",
      email: "info@tjh.com.cn",
      website: "https://www.tjh.com.cn"
    },
    imageUrl: "https://example.com/images/hospitals/tjh.jpg"
  },
  {
    id: "h005",
    name: "成都华西医院",
    address: "成都市武侯区国学巷37号",
    specialties: ["pediatrics", "gynecology", "oncology", "dentistry", "tcm"],
    rating: 4.9,
    description: "成都华西医院是西南地区规模最大的医院之一，在儿科和妇科方面拥有丰富的经验和专业知识。",
    location: {
      latitude: 30.6421,
      longitude: 104.0411
    },
    contactInfo: {
      phone: "028-85422114",
      email: "service@wchscu.cn",
      website: "https://www.wchscu.cn"
    },
    imageUrl: "https://example.com/images/hospitals/wchscu.jpg"
  },
  {
    id: "h006",
    name: "浙江邵逸夫医院",
    address: "杭州市庆春东路3号",
    specialties: ["orthopedics", "neurology", "cardiology", "ophthalmology", "endocrinology"],
    rating: 4.6,
    description: "浙江邵逸夫医院是一家现代化综合性医院，在骨科和神经科手术方面有很高的成功率。",
    location: {
      latitude: 30.2591,
      longitude: 120.1737
    },
    contactInfo: {
      phone: "0571-86006666",
      email: "contact@srrsh.com",
      website: "https://www.srrsh.com"
    },
    imageUrl: "https://example.com/images/hospitals/srrsh.jpg"
  },
  {
    id: "h007",
    name: "天津医科大学总医院",
    address: "天津市和平区鞍山道154号",
    specialties: ["cardiology", "oncology", "urology", "neurology", "emergency"],
    rating: 4.7,
    description: "天津医科大学总医院是天津市最大的综合性医院，在心脏病和癌症治疗方面拥有先进的技术和设备。",
    location: {
      latitude: 39.1088,
      longitude: 117.1935
    },
    contactInfo: {
      phone: "022-60362255",
      email: "info@tmugs.com",
      website: "https://www.tmugs.com"
    },
    imageUrl: "https://example.com/images/hospitals/tmugs.jpg"
  },
  {
    id: "h008",
    name: "南京鼓楼医院",
    address: "南京市中山路321号",
    specialties: ["gastroenterology", "nephrology", "hematology", "rheumatology", "endocrinology"],
    rating: 4.5,
    description: "南京鼓楼医院是江苏省重点医院，在消化系统疾病和肾脏疾病治疗方面有丰富的经验。",
    location: {
      latitude: 32.0584,
      longitude: 118.7812
    },
    contactInfo: {
      phone: "025-83106666",
      email: "service@njglyy.com",
      website: "https://www.njglyy.com"
    },
    imageUrl: "https://example.com/images/hospitals/njglyy.jpg"
  },
  {
    id: "h009",
    name: "西安交通大学第一附属医院",
    address: "西安市雁塔西路277号",
    specialties: ["cardiology", "neurology", "orthopedics", "ophthalmology", "tcm"],
    rating: 4.6,
    description: "西安交通大学第一附属医院是西北地区的重点医院，在心脏病和神经系统疾病治疗方面处于领先地位。",
    location: {
      latitude: 34.2486,
      longitude: 108.9841
    },
    contactInfo: {
      phone: "029-85323112",
      email: "contact@xjtu1.com",
      website: "https://www.xjtu1.com"
    },
    imageUrl: "https://example.com/images/hospitals/xjtu1.jpg"
  },
  {
    id: "h010",
    name: "哈尔滨医科大学附属第一医院",
    address: "哈尔滨市南岗区邮政街23号",
    specialties: ["cardiology", "oncology", "pulmonology", "gastroenterology", "emergency"],
    rating: 4.5,
    description: "哈尔滨医科大学附属第一医院是东北地区的重点医院，在心脏病和肺部疾病治疗方面有很高的声誉。",
    location: {
      latitude: 45.7484,
      longitude: 126.6426
    },
    contactInfo: {
      phone: "0451-85555888",
      email: "info@hrbmu1.com",
      website: "https://www.hrbmu1.com"
    },
    imageUrl: "https://example.com/images/hospitals/hrbmu1.jpg"
  }
];

// 通过ID获取医院信息
export const getHospitalById = (id: string): Hospital | undefined => {
  return hospitals.find(hospital => hospital.id === id);
};

// 通过名称搜索医院
export const searchHospitalsByName = (name: string): Hospital[] => {
  const lowerCaseName = name.toLowerCase();
  return hospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(lowerCaseName)
  );
};

// 通过专科筛选医院
export const filterHospitalsBySpecialty = (specialtyId: string): Hospital[] => {
  return hospitals.filter(hospital => 
    hospital.specialties.includes(specialtyId)
  );
};

// 通过评分筛选医院
export const filterHospitalsByRating = (minRating: number): Hospital[] => {
  return hospitals.filter(hospital => 
    hospital.rating >= minRating
  );
};

// 获取所有医院
export const getAllHospitals = (): Hospital[] => {
  return [...hospitals];
};

// 获取推荐医院（评分最高的前N家）
export const getRecommendedHospitals = (count: number = 5): Hospital[] => {
  return [...hospitals]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
};
