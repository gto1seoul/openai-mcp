const readline = require('readline');
const OpenAI = require('openai');

// OpenAI API 키 가져오기
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAI 클라이언트 초기화
let openai;
try {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
  console.error('OpenAI client initialized successfully');
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  process.exit(1);
}

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

// JSON-RPC 2.0 응답 생성 함수
function createResponse(id, result) {
  return {
    jsonrpc: '2.0',
    id,
    result
  };
}

// JSON-RPC 2.0 에러 응답 생성 함수
function createErrorResponse(id, code, message, data = undefined) {
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

// 표준 입출력 설정
const rl = readline.createInterface({
  input: process.stdin,
  output: null,
  terminal: false
});

// 모델 정보 얻기 함수
function getModelInfo(modelId) {
  if (!SUPPORTED_MODELS.includes(modelId)) {
    return null;
  }
  
  return {
    id: modelId,
    provider: 'openai',
    name: modelId,
    description: `OpenAI ${modelId} model`,
    capabilities: {
      chat: true,
      streaming: true
    },
    inputTokenLimit: modelId.includes('o1') ? 32000 : 16000,
    outputTokenLimit: 4096,
  };
}

// 모든 모델 정보 얻기
function getAllModels() {
  return SUPPORTED_MODELS.map(getModelInfo);
}

// 초기화 핸들러
async function handleInitialize(params, id) {
  console.error(`Received initialize request with protocol version ${params.protocolVersion}`);
  
  // 지원하는 프로토콜 버전 확인
  if (params.protocolVersion !== '2024-11-05') {
    console.error(`Unsupported protocol version: ${params.protocolVersion}`);
    return createErrorResponse(id, -32600, 'Unsupported protocol version');
  }
  
  // 초기화 응답
  const response = createResponse(id, {
    capabilities: {
      chat: true,
      streaming: false // 간단하게 하기 위해 스트리밍은 비활성화
    },
    models: getAllModels(),
    serverInfo: {
      name: 'openai-mcp',
      version: '1.0.0'
    }
  });
  
  console.error('Sending initialize response');
  return response;
}

// 채팅 핸들러
async function handleChat(params, id) {
  console.error(`Received chat request for model ${params.model}`);
  
  const { model, messages, temperature = 0.7, max_tokens } = params;
  
  // 모델 유효성 검사
  if (!SUPPORTED_MODELS.includes(model)) {
    return createErrorResponse(id, -32602, `Unsupported model: ${model}`);
  }
  
  try {
    // OpenAI API 요청 옵션 구성
    const options = {
      model,
      messages,
      temperature
    };
    
    if (max_tokens) options.max_tokens = max_tokens;
    
    // OpenAI API 호출
    const completion = await openai.chat.completions.create(options);
    
    // 응답 구성
    const response = createResponse(id, {
      choices: [{
        message: {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content
        },
        finishReason: completion.choices[0].finish_reason
      }],
      usage: completion.usage
    });
    
    return response;
  } catch (error) {
    console.error('Error in chat completion:', error);
    return createErrorResponse(id, -32603, `OpenAI API error: ${error.message}`);
  }
}

// 모델 목록 핸들러
function handleGetModels(params, id) {
  console.error('Received get_models request');
  return createResponse(id, {
    models: getAllModels()
  });
}

// 메인 메시지 처리 함수
async function processMessage(message) {
  let parsedMessage;
  
  try {
    parsedMessage = JSON.parse(message);
  } catch (error) {
    console.error('Error parsing message:', error);
    return createErrorResponse(null, -32700, 'Parse error');
  }
  
  const { method, params, id } = parsedMessage;
  
  // 메소드별 처리
  switch (method) {
    case 'initialize':
      return await handleInitialize(params, id);
    
    case 'chat':
      return await handleChat(params, id);
    
    case 'get_models':
      return handleGetModels(params, id);
    
    default:
      console.error(`Unknown method: ${method}`);
      return createErrorResponse(id, -32601, `Method not found: ${method}`);
  }
}

// 메시지 라인 처리
rl.on('line', async (line) => {
  console.error(`Received message: ${line}`);
  
  try {
    const response = await processMessage(line);
    
    if (response) {
      // 응답 출력
      const responseJson = JSON.stringify(response);
      console.log(responseJson);
      console.error(`Sent response: ${responseJson}`);
    }
  } catch (error) {
    console.error('Error processing message:', error);
    
    // 일반 에러 응답
    const errorResponse = createErrorResponse(null, -32603, 'Internal error');
    console.log(JSON.stringify(errorResponse));
  }
});

// 서버 시작 메시지
console.error('MCP server started and ready to process requests');
