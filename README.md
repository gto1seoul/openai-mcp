# OpenAI MCP for Smithery

이 저장소는 Smithery와 완벽하게 호환되는 OpenAI Model Connection Proxy(MCP) 구현입니다. MCP를 통해 Claude가 다양한 OpenAI 모델에 접근할 수 있습니다.

## 지원하는 모델

- gpt-4o
- gpt-4o-mini
- gpt-4.5-preview
- gpt-4-turbo
- o1-preview
- o1-mini
- o3-mini

## Smithery 배포 방법

1. GitHub에 이 저장소를 푸시합니다.
2. Smithery 웹사이트에서 새 MCP 서버를 생성합니다.
3. GitHub 저장소를 연결합니다.
4. 구성에서 OpenAI API 키를 설정합니다.
5. 배포 버튼을 클릭합니다.

## 구현 세부 정보

- JSON-RPC 2.0 프로토콜 사용
- 지원하는 MCP 프로토콜 버전: 2024-11-05
- 지원하는 메소드: initialize, chat, get_models

## 디버깅

오류가 발생하면 Smithery 로그에서 `[DEBUG]` 접두어가 붙은 메시지를 확인하세요.

## 라이센스

MIT
