# 💿 Node.js 프로그래밍 실습

## 1. 웹 서버 만들기
- http 모듈로 웹 서버 생성
- Express 프레임워크로 웹 서버 생성
- 미들웨어 사용
  - static 미들웨어
  - body-parser 미들웨어
- 요청 라우팅
  - Router 미들웨어
  - 오류 페이지
- 쿠키와 세션

## 2. 데이터베이스 사용
- mongoDB 시작하기
  - NoSQL 개념
  - 컬렉션과 도큐멘트
  - 관계형 데이터베이스(RDS)와 비교
  - mongoDB 서버 설치
- 패키지 모듈 사용
  - mongodb 모듈
  - mongoose 모듈
  - connectDB 함수 호출
  - static과 메소드
- mongoose 모듈
  - 스키마 작성
  - virtual 메소드 활용하여 비밀번호 암호화
  - 인덱스와 메소드 사용법
- MySQL
  - mysql 패키지 모듈 설치
  - 생성, 수정, 조회 기능 구현

## 3. 프로젝트 모듈화
- 기능에 따라 js파일 모듈화
- 데이터베이스 스키마 설정파일에 추가
- 라우팅 정보 설정파일에 추가
- UI 라이브러리 사용

## 4. 뷰 템플릿
- 뷰 템플릿 개념
- ejs 뷰 엔진
- pug 뷰 엔진

## 5. 패스포트
- 패스포트 미들웨어 정의
- 패스포트로 로그인
> 📍 errorHandler 모듈은 가장 마지막에 사용!

## 6. 채팅 서버
- socket.io 모듈 설치
- socket.io src 불러오기

> 📍 socket.io 버전 유의 및 사용법 공식 사이트 참고
> 
> io.socket.connected -> socket.to 메소드 변경 유의!
> 
> 클라이언트 부분에서 socket 객체 위치를 보고 메소드 사용할 것

- 1:1 채팅 기능 구현
- 그룹 채팅방 만들기

> 📍 socket.io 버전 유의
>
> socket.id ver.3부터 io.sockets.adapter.rooms의 반환 객체가 Map 객체로 변경됨
> 
> io.socket.adapter.rooms **[object.key]** -> io.sockets.adapter.rooms. **get(object.key)** 로 변경
> 
> 책에 나와있는 내용이랑 다르므로 수정해서 반영함
>
> io.to -> **나를 포함한** 모든 대상에게 event emit
> 
> socket.to -> **나를 제외한** 모든 대상에게 event emit

- jQuery => Vanila Javascript로 변환

> 📍 jQuery의 메소드 내용 확인
>
> jQeury의 메소드 중 변환하려는 기능이 무엇인지 파악한 뒤 Vanila Javascript로 구현

## 7. JSON-RPC
- jayson 모듈 설치
- echo 모듈 구현
- 계산기 모듈 구현
- 사용자 목록 조회

> 📍 global 객체
>
> database를 global 객체로 접근하려면 먼저 app.js에서 global.database로 등록해야함
> mongoose 객체의 요소 파악

- crypto 암호화