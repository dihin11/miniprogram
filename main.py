from fastapi import FastAPI, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from typing import List
import os
import uuid
import magic
import openai
from PIL import Image
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 安全配置
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME)
API_KEY = os.getenv("API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
UPLOAD_DIR = "uploads"

# 确保上传目录存在
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 验证API密钥
async def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key

# 验证文件类型
def validate_image(file_content: bytes) -> bool:
    mime = magic.Magic(mime=True)
    file_type = mime.from_buffer(file_content)
    return file_type.startswith('image/')

# 图片上传接口
@app.post("/upload")
async def upload_image(file: UploadFile, api_key: str = Depends(verify_api_key)):
    try:
        # 读取文件内容
        content = await file.read()
        
        # 验证文件类型
        if not validate_image(content):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # 生成唯一文件名
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # 保存文件
        with open(filepath, "wb") as f:
            f.write(content)
            
        # 验证图片是否可以打开
        try:
            with Image.open(filepath) as img:
                img.verify()
        except Exception:
            os.remove(filepath)
            raise HTTPException(status_code=400, detail="Invalid image file")
            
        return {"url": filepath}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 算命接口
@app.post("/fortune")
async def get_fortune(request: dict, api_key: str = Depends(verify_api_key)):
    try:
        fortune_type = request.get("type")
        image_urls = request.get("images", [])
        
        if not fortune_type or not image_urls:
            raise HTTPException(status_code=400, detail="Missing required parameters")
            
        # 根据不同类型生成不同的prompt
        prompts = {
            "self": "请根据这张照片，从面相学的角度分析此人的性格特点、运势和未来发展。要求：1. 内容真实可信 2. 语言要温和积极 3. 要有具体的建议",
            "friendship": "请分析这两张照片中的两个人的友谊关系。要求：1. 分析两人性格的互补性 2. 预测友谊发展 3. 给出维护友谊的建议",
            "love": "请从面相学角度分析这一对男女的姻缘配对。要求：1. 分析两人性格匹配度 2. 预测感情发展 3. 给出具体建议"
        }
        
        # 设置OpenAI API密钥
        openai.api_key = OPENAI_API_KEY
        
        # 调用OpenAI API
        response = await openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个专业的算命大师，精通面相、八字、姻缘等领域。"},
                {"role": "user", "content": f"{prompts[fortune_type]}"}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # 生成匹配度分数（仅用于友情和姻缘）
        score = None
        if fortune_type in ["friendship", "love"]:
            score = min(max(int(response.choices[0].message.content.count("正面") * 10), 60), 100)
            
        result = {
            "fortune": response.choices[0].message.content,
            "score": score
        }
        
        # 清理临时文件
        for url in image_urls:
            if os.path.exists(url):
                os.remove(url)
                
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)