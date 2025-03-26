# OpenAI MCP Server for Smithery

이 프로젝트는 Smithery와 호환되는 OpenAI Model Connection Proxy(MCP) 서버입니다. 이 서버를 통해 Claude가 다양한 OpenAI 모델(gpt-4o, gpt-4.5-preview, o1-preview, o3-mini 등)에 접근할 수 있습니다.

## 지원되는 모델

- gpt-4o
- gpt-4o-mini
- gpt-4.5-preview
- gpt-4-turbo
- o1-preview
- o1-mini
- o3-mini

## Smithery에 배포하기

1. 이 저장소를 GitHub에 푸시합니다.

2. Smithery에 로그인하고 새 MCP 서버를 생성합니다.

3. 이 GitHub 저장소를 선택합니다.

4. OpenAI API 키를 설정합니다.

5. 배포 버튼을 클릭합니다.

## MCP 프로토콜

이 서버는 Smithery MCP 프로토콜 버전 "2024-11-05"를 지원합니다. 다음과 같은 메소드를 구현했습니다:

- `initialize`: MCP 서버 초기화
- `get_models`: 지원하는 모델 목록 반환
- `chat`: 채팅 완성 요청 처리

## 개발

### 의존성 설치

```bash
npm install
```

### 로컬 테스트

OpenAI API 키를 환경 변수로 설정하고 서버를 실행합니다:

```bash
OPENAI_API_KEY=your_api_key_here node server.js
```

## 문제 해결

서버가 제대로 응답하지 않는 경우, stderr로 출력되는 로그를 확인하세요. 디버깅을 위해 `console.error()`를 사용하여 로그를 출력할 수 있습니다.

## 라이센스

MIT
