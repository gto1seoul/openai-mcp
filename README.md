# OpenAI MCP (Model Connection Proxy) for Smithery

OpenAI API를 활용하여 다양한 OpenAI 모델(gpt-4o, gpt-4.5-preview, o1-preview, o3-mini 등)을 사용할 수 있게 해주는 Smithery 호환 프록시 서버입니다.

## 기능

- OpenAI API 키 하나로 다양한 OpenAI 모델 접근
- Smithery MCP 프로토콜 지원 (stdio 모드)
- HTTP API 모드 지원 (독립 실행)
- 채팅 완성 API 지원
- 스트리밍 응답 지원

## 지원되는 모델

- gpt-4o
- gpt-4o-mini
- gpt-4.5-preview
- gpt-4-turbo
- o1-preview
- o1-mini
- o3-mini

## Smithery 배포 방법

1. 이 저장소를 GitHub에 푸시합니다.

2. Smithery 대시보드에서 새 MCP 서버를 생성합니다.

3. 저장소 연결 시 이 GitHub 저장소를 선택합니다.

4. 배포 시 OpenAI API 키를 입력합니다.

5. 배포 버튼을 클릭하여 MCP 서버를 배포합니다.

## 로컬 개발 환경

### HTTP 서버 모드로 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용 추가:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

3. 서버 실행
```bash
npm start
```

### Stdio 모드로 실행 (Smithery 테스트)

```bash
npm run start:stdio
```

## HTTP API 사용법

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

## Smithery MCP 프로토콜

이 서버는 Smithery의 stdio 기반 MCP 프로토콜을 지원합니다:

- `{"type": "ping"}` - 서버 상태 확인
- `{"type": "models"}` - 모델 목록 요청
- `{"type": "chat", "data": {...}}` - 채팅 완성 요청

## 라이센스

MIT
