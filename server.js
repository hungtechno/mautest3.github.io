/**
 * Server Backend cho hệ thống AI Render Ảnh
 * Xử lý bởi: Antigravity AI
 * Chức năng: Nhận file ảnh từ client và trả về URL render từ Pollinations AI
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Cấu hình CORS: Cho phép trình duyệt truy cập từ các domain khác (ví dụ từ Render.com frontend hoặc Localhost)
app.use(cors());
app.use(express.json());

// Cấu hình Multer: Lưu file vào bộ nhớ đệm (Memory Storage) để xử lý nhanh và phù hợp với Render.com
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

/**
 * Endpoint chính: POST /api/render
 * Nhận 'image' (file) và 'prompt' (text) từ FormData
 */
app.post('/api/render', upload.single('image'), (req, res) => {
    try {
        const { prompt } = req.body;
        const file = req.file;

        if (!prompt) {
            return res.status(400).json({ 
                success: false, 
                error: 'Thiếu mô tả (prompt) cho AI.' 
            });
        }

        console.log(`Đang xử lý render với prompt: ${prompt}`);

        // Tối ưu hóa prompt để đạt độ chân thực cao nhất (Photorealistic)
        // Đây là bước "xử lý" bí mật để kết quả từ Pollinations AI đẹp nhất
        const qualityKeywords = "masterpiece, ultra-realistic, photorealistic, 4k resolution, cinematic lighting, architectural photography, hyper-detailed interior, unreal engine 5, professional render, high-end furniture";
        const finalPrompt = `${prompt}, ${qualityKeywords}`;
        
        // Encode prompt để đưa vào URL
        const encodedPrompt = encodeURIComponent(finalPrompt);
        
        // Tạo seed ngẫu nhiên để mỗi lần render là một kết quả khác nhau
        const seed = Math.floor(Math.random() * 1000000);
        
        // Sử dụng URL API của Pollinations AI (Flux model - chất lượng cao nhất hiện nay)
        // Cấu hình width/height là 1024x1024
        const renderUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;

        // Trả về URL cho Client
        res.json({ 
            success: true, 
            renderUrl: renderUrl,
            message: 'AI đã hoàn thành quá trình render.'
        });

    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi hệ thống server trung gian.' 
        });
    }
});

// Trang chủ backend để kiểm tra server có sống không
app.get('/', (req, res) => {
    res.send('AI Render Backend is Running!');
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng: ${PORT}`);
});
