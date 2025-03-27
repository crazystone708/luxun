import { NextResponse } from "next/server";

// 获取百度 access token
async function getAccessToken() {
  const API_KEY = process.env.BAIDU_API_KEY;
  const SECRET_KEY = process.env.BAIDU_SECRET_KEY;
  
  try {
    const response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    if (!data.access_token) {
      throw new Error('获取access token失败: ' + JSON.stringify(data));
    }
    return data.access_token;
  } catch (error) {
    console.error('获取access token失败:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // 检查文件大小（不能超过4MB）
    if (image.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "图片大小不能超过4MB" },
        { status: 400 }
      );
    }

    // 将图片转换为 base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // 获取访问令牌
    const accessToken = await getAccessToken();

    // 调用百度图像风格转换API
    const styleTransferResponse = await fetch(
      `https://aip.baidubce.com/rest/2.0/image-process/v1/selfie_anime?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: `image=${encodeURIComponent(base64Image)}`
      }
    );

    const result = await styleTransferResponse.json();
    console.log('API Response:', result); // 添加调试日志

    if (result.image) {
      // 返回转换后的图片URL（base64格式）
      return NextResponse.json({ 
        url: `data:image/jpeg;base64,${result.image}` 
      });
    } else {
      throw new Error(
        result.error_msg || 
        result.error_description || 
        JSON.stringify(result) || 
        '图片转换失败'
      );
    }

  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: typeof error === 'string' ? error : error.message || "图片处理失败" },
      { status: 500 }
    );
  }
} 