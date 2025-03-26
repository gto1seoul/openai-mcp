#!/usr/bin/env node

const readline = require('readline');
const { OpenAI } = require('openai');

// 버전 정보
const SERVER_VERSION = '1.0.0';
const PROTOCOL_VERSION = '2024-11-05';

// 디버깅 로그
function log(message) {
  console.error(`[DEBUG] ${message}`);
}

log('Server starting up...');

// OpenAI API 키 확인
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  log('ERROR: OPENAI_API_KEY environment variable not set');
  process.exit(1);
}

// OpenAI 클라이언트 초기화
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
log('OpenAI client initialized');

// 지원하는 모델 목록
const SUPPORTED_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4.5-preview',
  'gpt-4-turbo',
  'o1-preview',
  'o1-mini',
  'o3-mini'
];

// readline 인터페이스 설정
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// 요청 처리 핸들러
const handlers = {
  // 초기화 요청 처리
  async initialize(params, id) {
    log(`Handling initialize request: ${JSON.stringify(params)}`);
    
    // 프로토콜 버전 확인
    if (params.protocolVersion !== PROTOCOL_VERSION) {
      log(`Warning: Protocol version mismatch. Expected ${PROTOCOL_VERSION}, got ${params.protocolVersion}`);
    }
    
    // 모델 정보 구성
    const models = SUPPORTED_MODELS.map(modelId => ({
      id: modelId,
      provider: 'openai',
      name: modelId,
      description: `OpenAI ${modelId} model`,
      capabilities: {
        chat: true
      },
      inputTokenLimit: modelId.includes('o1') ? 32000 : 16000,
      outputTokenLimit: 4096
    }));
    
    return {
      models,
      capabilities: {
        chat: true
      },
      serverInfo: {
        name: 'openai-mcp',
        version: SERVER_VERSION
      }
    };
  },
  
  // 채팅 요청 처리
  async chat(params, id) {
    log(`Handling chat request for model ${params.model}`);
    
    // 필수 파라미터 확인
    if (!params.model || !params.messages || !params.messages.length) {
      throw new Error('Missing required parameters: model, messages');
    }
    
    // 모델 유효성 확인
    if (!SUPPORTED_MODELS.includes(params.model)) {
      throw new Error(`Unsupported model: ${params.model}`);
    }
    
    try {
      // OpenAI API 호출
      const completion = await openai.chat.completions.create({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.max_tokens
      });
      
      // 응답 구성
      return {
        choices: [{
          message: {
            role: completion.choices[0].message.role,
            content: completion.choices[0].message.content
          },
          finishReason: completion.choices[0].finish_reason
        }],
        usage: completion.usage
      };
    } catch (error) {
      log(`Error in chat completion: ${error.message}`);
      throw error;
    }
  },
  
  // 모델 목록 요청 처리
  async get_models(params, id) {
    log('Handling get_models request');
    
    // 모든 지원 모델 반환
    return {
      models: SUPPORTED_MODELS.map(modelId => ({
        id: modelId,
        provider: 'openai',
        name: modelId,
        description: `OpenAI ${modelId} model`,
        capabilities: {
          chat: true
        },
        inputTokenLimit: modelId.includes('o1') ? 32000 : 16000,
        outputTokenLimit: 4096
      }))
    };
  }
};

// JSON-RPC 응답 생성 함수
function createResponse(id, result) {
  return {
    jsonrpc: '2.0',
    id,
    result
  };
}

// JSON-RPC 에러 응답 생성 함수
function createErrorResponse(id, code, message, data) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      data
    }
  };
}

// 메시지 처리 함수
async function processMessage(message) {
  let request;
  
  try {
    request = JSON.parse(message);
    log(`Processing request: ${request.method}`);
  } catch (error) {
    log(`Failed to parse JSON: ${error.message}`);
    return createErrorResponse(null, -32700, 'Parse error');
  }
  
  // 필수 필드 확인
  if (!request.jsonrpc || request.jsonrpc !== '2.0' || !request.method) {
    log('Invalid JSON-RPC request format');
    return createErrorResponse(request.id, -32600, 'Invalid Request');
  }
  
  const { method, params, id } = request;
  
  // 해당 메소드 핸들러 찾기
  const handler = handlers[method];
  if (!handler) {
    log(`Method not found: ${method}`);
    return createErrorResponse(id, -32601, `Method not found: ${method}`);
  }
  
  try {
    // 핸들러 실행 및 응답 생성
    const result = await handler(params || {}, id);
    return createResponse(id, result);
  } catch (error) {
    log(`Error handling request: ${error.message}`);
    return createErrorResponse(
      id,
      -32603,
      error.message || 'Internal error',
      error.stack
    );
  }
}

// 입력 라인 처리
rl.on('line', async (line) => {
  if (!line.trim()) {
    return;
  }
  
  log(`Received: ${line}`);
  
  try {
    const response = await processMessage(line);
    const responseJson = JSON.stringify(response);
    log(`Sending response: ${responseJson}`);
    console.log(responseJson);
  } catch (error) {
    log(`Unhandled error: ${error.message}`);
    console.log(JSON.stringify(createErrorResponse(null, -32603, 'Internal error')));
  }
});

// 서버 준비 완료
log('MCP server ready');
