require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 서버 상태 확인 엔드포인트
app.get('/', (req, res) => {
  res.json({ status: 'OpenAI MCP Server is running' });
});

// 지원되는 모델 목록
const SUPPORTED_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4.5-preview',
  'gpt-4-turbo',
  'o1-preview',
  'o1-mini',
  'o3-mini'
];

// 모델 목록 제공 엔드포인트
app.get('/models', (req, res) => {
  res.json({
    models: SUPPORTED_MODELS.map(model => ({
      id: model,
      name: model,
      description: `OpenAI ${model} model via MCP`,
      max_tokens: model.includes('o1') ? 32000 : 16000,
    }))
  });
});

// 채팅 완성 엔드포인트
app.post('/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature = 0.7, max_tokens, stop } = req.body;
    
    if (!SUPPORTED_MODELS.includes(model)) {
      return res.status(400).json({ error: 'Unsupported model. Please choose from the supported models list.' });
    }
    
    const options = {
      model,
      messages,
      temperature,
    };
    
    if (max_tokens) options.max_tokens = max_tokens;
    if (stop) options.stop = stop;
    
    const completion = await openai.chat.completions.create(options);
    
    res.json(completion);
  } catch (error) {
    console.error('Error in chat completion:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.type || 'server_error'
    });
  }
});

// 스트리밍 채팅 완성 엔드포인트
app.post('/chat/completions/stream', async (req, res) => {
  try {
    const { model, messages, temperature = 0.7, max_tokens, stop } = req.body;
    
    if (!SUPPORTED_MODELS.includes(model)) {
      return res.status(400).json({ error: 'Unsupported model. Please choose from the supported models list.' });
    }
    
    const options = {
      model,
      messages,
      temperature,
      stream: true,
    };
    
    if (max_tokens) options.max_tokens = max_tokens;
    if (stop) options.stop = stop;
    
    // 스트리밍 응답을 위한 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const stream = await openai.chat.completions.create(options);
    
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in streaming chat completion:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.type || 'server_error'
    });
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`OpenAI MCP Server is running on port ${port}`);
});
