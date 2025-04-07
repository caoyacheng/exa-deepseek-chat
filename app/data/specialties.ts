// 医疗专科列表
export const specialties = [
  {
    id: "cardiology",
    name: "心脏科",
    description: "诊断和治疗心脏疾病，包括冠心病、心力衰竭、心律失常等。"
  },
  {
    id: "neurology",
    name: "神经科",
    description: "诊断和治疗神经系统疾病，包括脑部、脊髓和周围神经疾病。"
  },
  {
    id: "orthopedics",
    name: "骨科",
    description: "诊断和治疗骨骼、关节、肌肉、韧带和肌腱的疾病和损伤。"
  },
  {
    id: "gastroenterology",
    name: "消化内科",
    description: "诊断和治疗消化系统疾病，包括食道、胃、肠、肝脏、胆囊和胰腺疾病。"
  },
  {
    id: "dermatology",
    name: "皮肤科",
    description: "诊断和治疗皮肤、头发和指甲的疾病。"
  },
  {
    id: "ophthalmology",
    name: "眼科",
    description: "诊断和治疗眼睛疾病和视力问题。"
  },
  {
    id: "ent",
    name: "耳鼻喉科",
    description: "诊断和治疗耳朵、鼻子、喉咙、头部和颈部的疾病。"
  },
  {
    id: "gynecology",
    name: "妇科",
    description: "诊断和治疗女性生殖系统疾病。"
  },
  {
    id: "urology",
    name: "泌尿科",
    description: "诊断和治疗泌尿系统疾病，包括肾脏、膀胱和前列腺疾病。"
  },
  {
    id: "pediatrics",
    name: "儿科",
    description: "诊断和治疗儿童疾病。"
  },
  {
    id: "endocrinology",
    name: "内分泌科",
    description: "诊断和治疗内分泌系统疾病，包括糖尿病、甲状腺疾病等。"
  },
  {
    id: "oncology",
    name: "肿瘤科",
    description: "诊断和治疗癌症。"
  },
  {
    id: "psychiatry",
    name: "精神科",
    description: "诊断和治疗精神疾病，包括抑郁症、焦虑症、精神分裂症等。"
  },
  {
    id: "pulmonology",
    name: "呼吸内科",
    description: "诊断和治疗肺部和呼吸系统疾病。"
  },
  {
    id: "rheumatology",
    name: "风湿科",
    description: "诊断和治疗风湿性疾病，包括关节炎、自身免疫性疾病等。"
  },
  {
    id: "nephrology",
    name: "肾脏科",
    description: "诊断和治疗肾脏疾病。"
  },
  {
    id: "hematology",
    name: "血液科",
    description: "诊断和治疗血液疾病。"
  },
  {
    id: "dentistry",
    name: "牙科",
    description: "诊断和治疗牙齿和口腔疾病。"
  },
  {
    id: "emergency",
    name: "急诊科",
    description: "处理需要紧急医疗护理的情况。"
  },
  {
    id: "tcm",
    name: "中医科",
    description: "使用传统中医方法诊断和治疗疾病。"
  }
];

// 通过ID获取专科信息
export const getSpecialtyById = (id: string) => {
  return specialties.find(specialty => specialty.id === id);
};

// 通过名称获取专科信息
export const getSpecialtyByName = (name: string) => {
  return specialties.find(specialty => specialty.name === name);
};

// 获取所有专科名称
export const getAllSpecialtyNames = () => {
  return specialties.map(specialty => specialty.name);
};
