require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const readline = require('readline');

// 환경 변수 설정
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
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

// stdio 인터페이스 또는 HTTP 서버 모드 감지
const isStdioMode = process.env.SMITHERY_STDIO_MODE === 'true';

if (isStdioMode) {
  // stdio 모드로 실행
  runStdioMode();
} else {
  // HTTP 서버 모드로 실행
  runHttpServerMode();
}

// stdio 모드 실행 함수
function runStdioMode() {
  console.error('Starting in stdio mode...');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  rl.on('line', async (line) => {
    try {
      const request = JSON.parse(line);
      
      // 요청 처리
      if (request.type === 'ping') {
        // 핑 요청 처리
        process.stdout.write(JSON.stringify({ type: 'pong' }) + '\n');
      } else if (request.type === 'chat') {
        // 채팅 요청 처리
        const { model, messages, temperature = 0.7, max_tokens, stop } = request.data || {};
        
        if (!SUPPORTED_MODELS.includes(model)) {
          process.stdout.write(JSON.stringify({
            type: 'error',
            error: 'Unsupported model. Please choose from the supported models list.'
          }) + '\n');
          return;
        }
        
        const options = { model, messages, temperature };
        if (max_tokens) options.max_tokens = max_tokens;
        if (stop) options.stop = stop;
        
        try {
          const completion = await openai.chat.completions.create(options);
          process.stdout.write(JSON.stringify({ 
            type: 'chat_response',
            data: completion 
          }) + '\n');
        } catch (error) {
          process.stdout.write(JSON.stringify({
            type: 'error',
            error: error.message
          }) + '\n');
        }
      } else if (request.type === 'models') {
        // 모델 목록 요청 처리
        process.stdout.write(JSON.stringify({
          type: 'models_response',
          data: {
            models: SUPPORTED_MODELS.map(model => ({
              id: model,
              name: model,
              description: `OpenAI ${model} model via MCP`,
              max_tokens: model.includes('o1') ? 32000 : 16000,
            }))
          }
        }) + '\n');
      } else {
        // 알 수 없는 요청 타입
        process.stdout.write(JSON.stringify({
          type: 'error',
          error: `Unknown request type: ${request.type}`
        }) + '\n');
      }
    } catch (error) {
      // JSON 파싱 오류 또는 기타 오류
      process.stdout.write(JSON.stringify({
        type: 'error',
        error: `Error processing request: ${error.message}`
      }) + '\n');
    }
  });
  
  // 준비 상태 알림
  process.stderr.write('MCP server ready for stdio communication\n');
}

// HTTP 서버 모드 실행 함수
function runHttpServerMode() {
  const app = express();
  
  // 미들웨어 설정
  app.use(cors());
  app.use(express.json());
  
  // 서버 상태 확인 엔드포인트
  app.get('/', (req, res) => {
    res.json({ status: 'OpenAI MCP Server is running' });
  });
  
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
  app.listen(PORT, () => {
    console.error(`OpenAI MCP Server is running on port ${PORT}`);
  });
}
