# Quarkus LOL Fan Site

자바웹프로그래밍 수업 실습 프로젝트입니다.  
Quarkus 기반으로 LOL 팬 사이트 메인 페이지, 챔피언 상세 모달, 로그인 페이지, 다운로드 페이지를 구현했습니다.

## 2주차 수업 내용

- Quarkus 개발 환경 구축
- `http://localhost:8080/` 서버 실행 확인
- `META-INF/resources/index.html` 생성
- HTML 기본 태그 작성
- Bootstrap 5 적용
- LOL 메인화면 프로토타입 구현
- 다크 테마 CSS 및 카드 hover 효과 적용

## 4주차 수업 내용

- 네비게이션 바 수정
- 메인화면 / 뉴스 / 챔피언 / 다운로드 / 로그인 메뉴 구성
- 외부사이트 드롭다운 메뉴 추가
- LOL 공식 웹사이트, Bootstrap 공식문서, Quarkus 공식문서 링크 연결
- 챔피언 카드 6개 구성
- Aatrox 상세보기 버튼 추가
- Bootstrap 모달창 구현
- `modals/Aatrox.html` 상세 페이지 생성
- iframe 방식으로 모달 내용 분리
- `images/Aatrox.png` 로컬 이미지 적용
- 로그인 서브 페이지 생성
- `login_page_sub/login.html` 연결
- 다운로드 서브 페이지 생성
- `main_page_sub/download.html` 연결
- `download-banner.jpg` 배경 이미지 적용
- 권장 시스템 사양 표 추가
- `download.css` 파일로 CSS 분리

## 실행 방법

```bash
cmd /c mvnw.cmd quarkus:dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:8080/
```

## 주요 페이지

- 메인 페이지: `http://localhost:8080/`
- 로그인 페이지: `http://localhost:8080/login_page_sub/login.html`
- 다운로드 페이지: `http://localhost:8080/main_page_sub/download.html`
- 아트록스 상세 페이지: `http://localhost:8080/modals/Aatrox.html`

## 화면 예시

### 메인 페이지

<img src="screenshots/main-page.png" width="600" alt="메인 페이지">

### 아트록스 상세 모달

<img src="screenshots/aatrox-modal.png" width="600" alt="아트록스 상세 모달">

### 다운로드 페이지

<img src="screenshots/download-page.png" width="600" alt="다운로드 페이지">

## 6주차 수업 내용

- JavaScript 기본 문법 학습
- 검색창 form 구성 및 search.js 연동
- 챔피언/뉴스 데이터 배열 생성
- 실시간 검색 결과 화면 구현
- 챔피언/뉴스 카테고리 전환 기능 구현
- 추가 구현: 챔피언 데이터 3개 이상 추가
- 추가 구현: 검색어가 없거나 공백일 때 메인화면으로 복귀

## 실행 화면

### 메인 페이지

![메인 페이지](screenshots/main-page.png)

### 다운로드 페이지

![다운로드 페이지](screenshots/download-page.png)

### 챔피언 모달 화면

![챔피언 모달 화면](screenshots/aatrox-modal.png)

---

## 9주차 수업 내용

### 1. JavaScript 기능 추가

- `test2.js`를 활용하여 배열과 객체 배열의 성능 테스트를 진행하였다.
- `toggle.js`를 추가하여 다크 모드와 라이트 모드 전환 기능을 구현하였다.
- 검색 결과 챔피언 카드를 클릭하면 기존 상세보기 모달창이 열리도록 수정하였다.

### 2. MySQL 데이터베이스 연동

- MySQL Server 8.x를 설치하고 `lol` 데이터베이스를 생성하였다.
- `pom.xml`에 MySQL JDBC, Hibernate ORM Panache, REST Jackson 의존성을 추가하였다.
- `application.properties`에 MySQL 접속 정보를 설정하였다.
- Quarkus Dev UI와 VS Code DB 확장 기능을 통해 데이터베이스 연결을 확인하였다.

### 3. 챔피언 테이블 및 API 구현

- `Champion.java` 파일을 생성하여 `champions` 테이블과 Java 클래스를 매핑하였다.
- `ChampionResource.java` 파일을 생성하여 `/champions` API를 구현하였다.
- `DataSeeder.java` 파일을 생성하여 초기 챔피언 데이터를 데이터베이스에 삽입하였다.

### 4. 검색 기능 DB 연동

- 기존 `search.js`의 고정 챔피언 배열 대신 `/champions` API에서 데이터를 불러오도록 수정하였다.
- 검색창에서 챔피언 이름, 영어 이름, 역할, 라인을 기준으로 검색되도록 구현하였다.
- 검색 결과 화면에서 MySQL 데이터베이스에 저장된 챔피언 정보가 정상 출력되는 것을 확인하였다.

### 9주차 실행 화면

#### 9주차 메인 페이지

![9주차 메인 페이지](screenshots/week9-main.png)

#### 9주차 MySQL 챔피언 데이터 확인

![9주차 MySQL 챔피언 데이터 확인](screenshots/week9-sql.png)
