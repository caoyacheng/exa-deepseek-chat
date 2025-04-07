import OSS from 'ali-oss';

// OSS配置
interface OssConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  secure: boolean; // 是否使用HTTPS
}

// 获取OSS配置
export const getOssConfig = (): OssConfig => {
  // 从环境变量中获取配置
  const region = process.env.NEXT_PUBLIC_OSS_REGION || '';
  const accessKeyId = process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_ID || '';
  const accessKeySecret = process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET || '';
  const bucket = process.env.NEXT_PUBLIC_OSS_BUCKET || '';

  // 处理region格式，如果包含完整域名，则提取区域部分
  let cleanRegion = region;
  if (region.includes('.aliyuncs.com')) {
    cleanRegion = region.split('.')[0];
  }
  
  return {
    region: cleanRegion,
    accessKeyId,
    accessKeySecret,
    bucket,
    secure: true, // 使用HTTPS
  };
};

// 创建OSS客户端
export const createOssClient = (): OSS => {
  const config = getOssConfig();
  return new OSS({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
    secure: config.secure,
  });
};

/**
 * 将文件上传到OSS
 * @param file 要上传的文件
 * @param directory 存储目录（可选）
 * @returns 上传后的文件URL（签名URL）
 */
export const uploadFileToOss = async (file: File, directory: string = 'uploads'): Promise<string> => {
  try {
    const client = createOssClient();
    
    // 生成唯一的文件名
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${directory}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // 上传文件
    const result = await client.put(fileName, file);
    
    // 生成签名URL（有效期24小时）
    try {
      const signedUrl = await client.signatureUrl(fileName, {
        expires: 24 * 3600 // 24小时
      });
      return signedUrl;
    } catch (signError) {
      console.error('生成签名URL失败，尝试使用普通URL:', signError);
      
      // 如果生成签名URL失败，回退到普通URL
      if (result.url) {
        return result.url;
      } else {
        // 如果result.url不存在，手动构建URL
        const config = getOssConfig();
        // 构建标准的OSS URL格式
        const url = `https://${config.bucket}.${config.region}.aliyuncs.com/${fileName}`;
        return url;
      }
    }
  } catch (error) {
    console.error('上传文件失败:', error);
    console.error('错误详情:', error);
    
    // 重新抛出错误，包含更多信息
    if (error instanceof Error) {
      throw new Error(`上传文件失败: ${error.message}`);
    } else {
      throw new Error('上传文件失败，未知错误');
    }
  }
};

/**
 * 从OSS URL中获取文件名
 * @param url OSS文件URL
 * @returns 文件名
 */
export const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch (error) {
    console.error('从URL获取文件名失败:', error);
    return '';
  }
};

/**
 * 测试OSS连接
 * 尝试列出指定前缀的文件，验证配置是否正确
 * @returns 是否连接成功
 */
export const testOssConnection = async (): Promise<boolean> => {
  try {
    console.log('测试OSS连接...');
    const client = createOssClient();
    
    // 尝试列出文件
    const result = await client.list({
      prefix: 'uploads/',
      'max-keys': 1
    }, {});
    
    console.log('OSS连接测试成功:', {
      objects: result.objects ? result.objects.length : 0,
      prefixes: result.prefixes,
      nextMarker: result.nextMarker
    });
    
    return true;
  } catch (error) {
    console.error('OSS连接测试失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      // 检查是否是认证错误
      if (error.message.includes('AccessDenied') || error.message.includes('InvalidAccessKeyId')) {
        console.error('认证失败，请检查AccessKey是否正确');
      } else if (error.message.includes('NoSuchBucket')) {
        console.error('Bucket不存在，请检查Bucket名称是否正确');
      }
    }
    return false;
  }
};

/**
 * 从OSS删除文件
 * @param url 文件URL或文件名
 * @returns 是否删除成功
 */
export const deleteFileFromOss = async (url: string): Promise<boolean> => {
  try {
    const client = createOssClient();
    
    // 从URL中提取文件名
    let fileName = url;
    if (url.startsWith('http')) {
      fileName = getFileNameFromUrl(url);
      // 如果文件名前面有目录，需要包含目录
      const pathParts = new URL(url).pathname.split('/');
      if (pathParts.length > 2) {
        fileName = pathParts.slice(1).join('/');
      }
    }
    
    if (!fileName) {
      console.error('无效的文件URL:', url);
      return false;
    }
    
    // 删除文件
    await client.delete(fileName);
    console.log('文件删除成功:', fileName);
    return true;
  } catch (error) {
    console.error('从OSS删除文件失败:', error);
    return false;
  }
};

/**
 * 从OSS获取文件URL
 * 支持公共访问和私有访问两种模式
 * 
 * @param objectName 对象名称（完整路径，如 'uploads/image.jpg'）
 * @param options 可选参数
 * @param options.expires 签名URL的过期时间（秒），默认为3600秒（1小时）
 * @param options.process 图片处理参数，如 'image/resize,w_200'
 * @param options.fileName 下载时的文件名
 * @returns 可访问的文件URL
 */
export const getFileUrl = async (
  objectName: string, 
  options: {
    expires?: number;
    process?: string;
    fileName?: string;
  } = {}
): Promise<string> => {
  try {    
    // 如果传入的是完整URL，提取对象名称
    if (objectName.startsWith('http')) {
      const urlObj = new URL(objectName);
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.length > 1) {
        // 移除开头的空字符串（因为pathname以/开头）
        objectName = pathParts.slice(1).join('/');
      }
    }
    
    const client = createOssClient();
    const config = getOssConfig();
    
    // 构建查询参数
    const queryParams: Record<string, string | number> = {};
    
    // 添加处理参数
    if (options.process) {
      queryParams['x-oss-process'] = options.process;
    }
    
    // 添加下载文件名
    if (options.fileName) {
      queryParams['response-content-disposition'] = `attachment; filename="${encodeURIComponent(options.fileName)}"`;
    }
    
    // 尝试获取签名URL（适用于私有Bucket）
    try {
      const expires = options.expires || 3600; // 默认1小时
      const signedUrl = await client.signatureUrl(objectName, {
        expires,
        ...queryParams
      });
      
      return signedUrl;
    } catch (signError) {
      console.warn('生成签名URL失败，尝试使用公共访问:', signError);
      
      // 如果签名失败，尝试构建公共访问URL
      let publicUrl = `https://${config.bucket}.${config.region}.aliyuncs.com/${objectName}`;
      
      // 添加查询参数
      if (Object.keys(queryParams).length > 0) {
        const urlObj = new URL(publicUrl);
        Object.entries(queryParams).forEach(([key, value]) => {
          urlObj.searchParams.append(key, String(value));
        });
        publicUrl = urlObj.toString();
      }
      
      return publicUrl;
    }
  } catch (error) {
    console.error('获取OSS文件URL失败:', error);
    if (error instanceof Error) {
      throw new Error(`获取文件URL失败: ${error.message}`);
    } else {
      throw new Error('获取文件URL失败，未知错误');
    }
  }
};

/**
 * 将元数据保存到OSS
 * @param data 要保存的数据
 * @param path OSS中的路径
 */
export const saveMetadataToOss = async (data: unknown, path: string = 'metadata/data.json'): Promise<void> => {
  try {
    const client = createOssClient();
    
    // 将数据转换为JSON字符串
    const jsonString = JSON.stringify(data);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 上传到OSS
    await client.put(path, blob);
    
  } catch (error) {
    console.error('保存元数据到OSS失败:', error);
    throw error;
  }
};

/**
 * 从OSS获取元数据
 * @param path OSS中的路径
 */
export const getMetadataFromOss = async (path: string = 'metadata/data.json'): Promise<unknown> => {
  try {
    const client = createOssClient();
    
    // 检查文件是否存在
    try {
      await client.head(path);
    } catch (error) {
      return null;
    }
    
    // 获取文件
    const result = await client.get(path);
    
    // 解析JSON
    const jsonString = result.content.toString();
    return JSON.parse(jsonString);
    
  } catch (error) {
    console.error('从OSS获取元数据失败:', error);
    return null;
  }
};
