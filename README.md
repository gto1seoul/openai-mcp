# OpenAI MCP (Model Connection Proxy)

OpenAI API를 활용하여 다양한 OpenAI 모델(gpt-4o, gpt-4.5-preview, o1-preview, o3-mini 등)을 사용할 수 있게 해주는 프록시 서버입니다.

## 기능

- OpenAI API 키 하나로 다양한 OpenAI 모델 접근
- 채팅 완성 API 지원
- 스트리밍 응답 지원
- Smithery 배포 지원

## 설치 및 실행 방법

### 로컬 개발 환경

1. 저장소 클론
```bash
git clone https://github.com/yourusername/openai-mcp.git
cd openai-mcp
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용 추가:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

4. 서버 실행
```bash
npm start
```

### Smithery 배포

1. Smithery 계정에 로그인

2. 새 앱 생성

3. 저장소 연결 또는 코드 업로드

4. 환경 변수 설정: `OPENAI_API_KEY`

5. 배포 버튼 클릭

## API 사용법

### 모델 목록 조회
```
GET /models
```

### 채팅 완성
```
POST /chat/completions
Content-Type: application/json

{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello, what can you do?"}
  ],
  "temperature": 0.7
}
```

### 스트리밍 채팅 완성
```
POST /chat/completions/stream
Content-Type: application/json

{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello, what can you do?"}
  ],
  "temperature": 0.7
}
```

## 지원되는 모델

- gpt-4o
- gpt-4o-mini
- gpt-4.5-preview
- gpt-4-turbo
- o1-preview
- o1-mini
- o3-mini

## 라이센스

MIT
