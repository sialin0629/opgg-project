require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// 환경 변수 설정
const API_KEY = process.env.API_KEY;

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// API 엔드포인트 설정
app.get('/api/config', (req, res) => {
    res.json({ apiKey: API_KEY });
});

// 기본 경로로 접근 시 main.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'main.html'));
});

// 포트 설정
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
