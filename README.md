# 우리싸인 API 서버

문서를 관리하고 참가자가 문서에 서명이 가능한 `우리싸인 API 서버`를 개발해야 합니다. `공개용 API(가입/로그인/참가자 인증)`는 개발이 되어 있는 상태입니다.

개발 요건을 잘 확인하고, 우리싸인 API 서버를 완성해주세요.

## 개발 환경

- 개발 언어: JavaScript, TypeScript v4.3
- 실행 환경: Node.js v12.22
- 서버 프레임워크: express v4.17
- 데이터베이스 및 라이브러리: sqlite, better-sqlite3 v7.4
- 테스트 프레임워크: jest v27, supertest v6

문서의 [하단](#library)에 데이터베이스 라이브러리 및 세션 사용법을 적어두었습니다.

---

## 요건 1. API 응답 포멧

정상처리 및 오류처리에 대한 API 서버 공통 응답 포맷을 아래와 같이 정의합니다.

- 정상처리 및 오류처리 모두 success 필드를 포함합니다.
  - 정상처리라면 true, 오류처리라면 false 값을 출력합니다.
- 정상처리는 response 필드를 포함하고 error 필드는 null 입니다.
  - 응답 데이터가 단일 객체라면, response 필드는 JSON Object로 표현됩니다.
  - 응답 데이터가 스칼라 타입(string, number, boolean)이라면, response 필드는 string, number, boolean로 표현됩니다.
  - 응답 데이터가 Array라면, response 필드는 JSON Array로 표현됩니다.
- 오류처리는 error 필드를 포함하고 response 필드는 null 입니다. error 필드는 status, message 필드를 포함합니다.
  - status : HTTP Response status code 값과 동일한 값을 출력해야 합니다.
  - message : 오류 메시지가 출력됩니다.

### 1.1. 로그인 성공 응답 예시

``` json
{
  {
  "success": true,
  "response": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...이하생략...",
    "user": {
      "name": "tester",
      ...
    },
  },
  "error": null
}
```

### 1.2. 로그인 실패 응답 예시

- 로그인 이메일 누락 (HTTP STATUS 400)

``` json
{
  "success": false,
  "response": null,
  "error": {
    "status": 400,
    "message": "이메일은 필수입니다."
  }
}
```

- 로그인 이메일/비밀번호 미일치 (HTTP STATUS 401)

``` json
{
  "success": false,
  "response": null,
  "error": {
    "status": 401,
    "message": "이메일 또는 비밀번호가 다릅니다."
  }
}
```

## 요건 2. 공개용 API 및 인증 사용자용 API 구분

API는 사용자가 로그인하지 않아도 호출할 수 있는 `공개용 API`와 로그인 후 호출할 수 있는 `로그인 사용자용 API` 그리고 참가자 인증 후 호출할 수 있는 `참가자용 API`로 구분됩니다.

- 공개용 API는 이미 작성이 되어 있으니 개발시 참고해 주세요.
- 로그인 사용자 인증 정보로 `참가자용 API`를 호출할 수 없습니다. 참가자 인증 정보도 `로그인 사용자용 API`를 호출할 수 없습니다.
- 인증 사용자용 API를 호출하기 위해 요청 헤더에 `Authorization` 항목을 추가하고, 값으로 로그인 후 전달받은 `token`에 `Bearer` 키워드를 앞에 붙여 입력합니다.

``` bash
curl --request GET 'http://localhost:8080/api/users/me' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...이하생략...'
```

인증 사용자용 API 호출시 `Authorization` 헤더가 누락되거나 값이 올바르지 않다면 아래와 같은 오류 응답이 발생해야 합니다.

``` json
{
  "success": false,
  "response": null,
  "error": {
    "status": 401,
    "message": "인증 자격 증명이 유효하지 않습니다."
  }
}
```

### API

- 공개용 API
  - 가입: POST /api/users/signup
  - 로그인: POST /api/users/login
  - 참가자 인증: POST /api/participant/token
- 로그인 사용자용 API
  - 문서 생성 POST /api/documents
  - 문서 읽기 GET /api/documents/{documentId}
  - 문서 삭제 DELETE /api/documents/{documentId}
  - 문서 발행 POST /api/documents/{documentId}/publish
  - 문서 목록 GET /api/documents
- 참가자용 API
  - 참가자 문서 읽기 GET /api/participant/document
  - 참가자 싸인 POST /api/participant/sign

## 요건 3. API 구현

- `state-machine`을 활용해서 문서와 참가자의 상태를 처리해 주세요.
- 계약과정에서 일어나는 액션에 대한 히스토리를 저장해 주세요.
  - schema.sql에서 `document_histories`와 `participant_histories` 테이블을 참고해 주세요.
  - JSON 데이터 타입은 `JSON.stringify()`로 넣어야 합니다.
  - `data`에는 새로 생성되거나 변경되는 정보만 넣어주세요.
  - `type`은 API 명세를 확인해 주세요.

### 3.1. 문서 생성

> `DocumentController.create` 메소드를 구현하세요.

문서를 생성합니다.

- 로그인 사용자만 호출할 수 있습니다.
- 제목과 내용은 필수입니다.
- 참가자 이름과 이메일은 필수입니다.
- 참가자 이메일은 이메일 형식이어야 합니다.
- 참가자는 최소 2명 최대 10명까지 등록이 가능합니다.
- 문서 ID는 `uuid`를 이용해서 생성합니다. (가입 API를 참고해 주세요.)
- 문서 상태는 `CREATED`로 저장합니다.
- 참가자 목록을 문서 ID와 함께 참가자 ID를 UUID로 생성해서 `participants` 테이블에 `CREATED` 상태로 저장합니다.
- 문서 히스토리와 참가자들 히스토리 타입을 `CREATE`로 저장합니다.

| method | path |
|--|--|
| POST | /api/documents |

Request Body:
``` json
{
  "title": "계약서",
  "content": "매우 긴 내용",
  "participants": [
    {
      "name": "참가자",
      "email": "email@example.com",
    },
    ...
  ]
}
```

Response Body:
``` json
{
  "success": true,
  "response": {
    "documentId": "05a05180-c6bb-11eb-b8bc-0242ac130003"
  },
  "error": null
}
```

Exception:
- 인증 정보가 없는 경우 (401)
- 제목 또는 내용이 없는 경우 (400)
- 참가자의 이름 또는 이메일이 없는 경우 (400)
- 참가자의 이메일 값이 이메일 형식이 아닌 경우 (400)
- 참가자의 이메일이 중복으로 들어가 있는 경우 (400)
- 참가자가 2명 미만이거나 10명을 초과한 경우 (400)

### 3.2. 문서 읽기

> `DocumentController.read` 메소드를 구현하세요.

문서를 DB에서 읽어서 리턴합니다.

- 로그인 사용자이고 문서의 소유자만 호출할 수 있습니다.
- 참가자들의 서명은 응답에 포함하지 않도록 해주세요.

| Method | URL |
|--|--|
| GET | /api/documents/{documentId} |

Param:
- documentId: 문서 ID

Response Body:
``` json
{
  "success": true,
  "response": {
    "document": {
      "id": "05a05180-c6bb-11eb-b8bc-0242ac130003",
      "title": "계약서",
      "content": "매우 긴 내용",
      "status": "PUBLISHED",
      "participants": [{
        "id": "b24aee27-1c6c-4294-a4fa-49cf11ea442f",
        "name": "참가자",
        "email": "email@example.com",
        "status": "INVITED",
        "createdAt": "2021-06-10T10:00:00.000Z",
        "updatedAt": "2021-06-11T10:00:00.000Z",
      }],
      "createdAt": "2021-06-10T10:00:00.000Z",
      "updatedAt": "2021-06-11T10:00:00.000Z",
    }
  },
  "error": null
}
```

Exception:
- 인증 정보가 없는 경우 (401)
- 문서의 소유자가 아닌 경우 (403)
- 문서 ID가 올바르지 않은 경우 (404)
- 문서를 찾을 수 없는 경우 (404)

### 3.3. 문서 삭제

> `DocumentController.remove` 메소드를 구현하세요.

문서를 삭제합니다.

- 로그인 사용자이고 문서의 소유자만 호출할 수 있습니다.
- 문서의 상태가 `CREATED`인 경우에만 삭제할 수 있습니다.
- 문서와 참가자들의 상태를 `DELETED`로 업데이트하는 논리 삭제를 합니다.
- 이미 삭제 상태인 경우 DB 업데이트를 하지 않고 성공 처리합니다.
- 문서 히스토리와 참가자들 히스토리 타입을 `DELETE`로 저장합니다.

| Method | URL |
|--|--|
| DELETE | /api/documents/{documentId} |

Param:
- documentId: 문서 ID

Response Body:
``` json
{
  "success": true,
  "response": true,
  "error": null
}
```

Exception:
- 인증 정보가 없는 경우 (401)
- 문서의 소유자가 아닌 경우 (403)
- 문서 ID가 올바르지 않은 경우 (404)
- 문서를 찾을 수 없는 경우 (404) 
- 문서의 상태가 `CREATED`가 아닌 경우 (400)

### 3.4. 문서 발행

> `DocumentController.publish` 메소드를 구현하세요.

참가자들에게 문서를 발행합니다.

- 로그인 사용자이고 문서의 소유자만 호출할 수 있습니다.
- 문서가 `CREATED` 상태의 경우에만 발행할 수 있습니다.
- 문서의 상태를 `PUBLISHED`로 업데이트합니다.
- 문서 히스토리 타입을 `PUBLISH`로 저장합니다.
- 문서 참가자들의 상태를 `INVITED` 상태로 업데이트합니다.
- 참가자들의 히스토리 타입을 `INVITED`로 저장합니다.

| method | path |
|--|--|
| POST | /api/documents/{documentId}/publish |

Param:
- documentId: 문서 ID

Response Body:
``` json
{
  "success": true,
  "response": true,
  "error": null
}
```

Exception:
- 인증 정보가 없는 경우 (401)
- 문서 ID가 올바르지 않은 경우 (404)
- 문서를 찾을 수 없는 경우 (404) 
- 문서의 소유자가 아닌 경우 (403)
- 문서의 상태가 `CREATED`가 아닌 경우 (400)

### 3.5. 문서 목록 조회

> `DocumentController.getAll` 메소드를 구현하세요.

문서 목록을 조회합니다.

- 로그인 사용자가 호출할 수 있습니다.

| Method | URL |
|--|--|
| GET | /api/documents?offset&size&status |

Query:
- offset: 페이징 처리 파라미터 (최솟값: 0, 최댓값: Number.MAX_SAFE_INTEGER 기본값: 0)
  - 최솟값-최댓값 범위를 벗어나거나 값이 넘어오지 않았다면, 기본값으로 대체합니다.
- size: 출력할 아이템 개수 (최솟값: 1, 최댓값: 5, 기본값: 5)
  - 최솟값-최댓값 범위를 벗어나거나 값이 넘어오지 않았다면, 기본값으로 대체합니다.
- status: 문서 상태 (기본값: none)

Response Body:
``` json
{
  "success": true,
  "response": {
    "documents": [{
      "id": "05a05180-c6bb-11eb-b8bc-0242ac130003",
      "title": "계약서",
      "content": "매우 긴 내용",
      "status": "CREATED",
      "participants": [{
        "id": "b24aee27-1c6c-4294-a4fa-49cf11ea442f",
        "name": "참가자",
        "email": "email@example.com",
        "status": "CREATED",
        "createdAt": "2021-06-10T10:00:00.000Z",
        "updatedAt": "2021-06-10T10:00:00.000Z",
      }],
      "createdAt": "2021-06-10T10:00:00.000Z",
      "updatedAt": "2021-06-10T10:00:00.000Z",
    }, {
      ...
    }]
  },
  "error": null
}
```

Exception:
- 인증 정보가 없는 경우 (401)

### 3.6. 참가자 문서 읽기

> `ParticipantController.readDocument` 메소드를 구현하세요.

DB에서 문서를 읽어서 리턴합니다.

- 참가자 인증 사용자만 호출할 수 있습니다.
- 참가자 히스토리 타입을 `READ_DOCUMENT`로 저장합니다.

| Method | URL |
|--|--|
| GET | /api/participant/document |

Response Body:
``` json
{
  "success": true,
  "response": {
    "document": {
      "id": "05a05180-c6bb-11eb-b8bc-0242ac130003",
      "title": "계약서",
      "content": "매우 긴 내용",
      "status": "PUBLISHED",
      "createdAt": "2021-06-10T10:00:00.000Z",
      "updatedAt": "2021-06-11T10:00:00.000Z",
    }
  },
  "error": null
}
```

Exception:
- 참가자 인증 정보가 없는 경우 (401)

### 3.7. 참가자 문서 서명

> `ParticipantController.sign` 메소드를 구현하세요.

참가자가 문서에 서명합니다.

- 참가자 인증 사용자만 호출할 수 있습니다.
- 서명은 필수입니다.
- 참가자 서명을 저장하면서 상태를 `SIGNED`로 업데이트합니다.
- 참가자 히스토리 타입을 `SIGN`로 저장합니다.

| Method | URL |
|--|--|
| POST | /api/participant/sign |

Request Body:
``` json
{
  "signature": "sign",
}
```

Response Body:
``` json
{
  "success": true,
  "response": true,
  "error": null
}
```

Exception:
- 참가자 인증 정보가 없는 경우 (401)
- 서명이 없는 경우 (400)
- 이미 서명한 문서인 경우 (400)

## 요건 4. 보안

문서 정보가 노출되면 안 되기 때문에 보안에 각별히 신경을 써야 합니다.

### 4.1. 사이트 간 요청 위조 (Cross-site request forgery, CSRF, XSRF) 차단

 > `src/middlewares/csrf.middleware`를 구현해주세요.

`express-session`과 `csrf` 라이브러리가 이미 설치되어 있습니다. 해당 라이브러리를 이용해서 csrf 미들웨어를 작성해 주세요.

`csrf` 라이브러리 문서는 [여기](https://github.com/pillarjs/csrf/blob/master/README.md)에서 확인할 수 있습니다.

- 요청이 들어올 때마다 token을 생성해서 응답 해더 `x-csrf-token`로 내려주세요.
- `/api` path로 요청이 오면, secret을 생성해서 세션에 저장해 주세요.
- `/api` path가 아닌 요청이 오면, `x-csrf-token` 해더값을 검증해 주세요.
- 마지막 token을 세션에 저장하고 해더값을 검증할 때 토큰 값이 같은지 비교해 주세요.

Exception:
- 세션에 csrfSecret 정보가 없는 경우 (401)
- 해더 값이 세션에 저장된 csrf token과 같지 않은 경우 (403)
- csrf 토큰 정보가 유효하지 않은 경우 (403)

### 4.2. 중복 로그인 방지

> `UserController.login`과 `ParticipantController.token` 메소드에 코드를 추가해 주세요.

새로운 인증 토큰을 발행할 때 다른 인증 토큰을 만료시켜서 하나의 인증 토큰만 유효하도록 해주세요.

- 인증 토큰을 발행 후 세션에 인증 정보를 저장합니다.
- `req.sessionStore`에서 해당 인증의 다른 세션을 찾아서 제거합니다. (참가자ID 또는 사용자ID로 조회)

Exception:
- 세션 정보가 없을 경우 (401)
- 세션 정보와 인증 정보가 다른 경우 (403)

<a id="library"></a>

## 라이브러리 설명

### better-sqlite3

sqlite3 데이터베이스 라이브러리로 비동기 처리를 하지 않아도 됩니다.

문서는 [여기](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md)에서 확인할 수 있습니다.

기본 동작 사용법은 다음과 같습니다.

``` js
const Database = require('better-sqlite3');
const db = new Database(':memory:', { verbose: console.log });

// .prepare(string) -> Statement
const stmt = db.prepare('SELECT name, age FROM cats');

// .all([...bindParameters]) -> array of rows
const cats = stmt.all();

// .get([...bindParameters]) -> row
const cat = db.prepare('SELECT name, age FROM cats WHERE id = ?').get(1);

// .transaction(function) -> function
const insert = db.prepare('INSERT INTO cats (name, age) VALUES (@name, @age)');

const insertMany = db.transaction((cats) => {
  for (const cat of cats) insert.run(cat);
});

insertMany([
  { name: 'Joey', age: 2 },
  { name: 'Sally', age: 4 },
  { name: 'Junior', age: 1 },
]);

// .run([...bindParameters]) -> object
const stmt = db.prepare('INSERT INTO cats (name, age) VALUES (?, ?)');
const info = stmt.run('Joey', 2);

console.log(info.changes); // => 1
console.log(info.lastInsertRowid) // => 1

// Binding Parameters
const stmt = db.prepare('INSERT INTO people VALUES (@firstName, @lastName, @age)');
const stmt = db.prepare('INSERT INTO people VALUES (:firstName, :lastName, :age)');
const stmt = db.prepare('INSERT INTO people VALUES ($firstName, $lastName, $age)');
const stmt = db.prepare('INSERT INTO people VALUES (@firstName, :lastName, $age)');

stmt.run({
  firstName: 'John',
  lastName: 'Smith',
  age: 45
});
```

### express-session

cookie에 세션 ID를 저장하고 세션을 관리하는 미들웨어 입니다.

세션 데이터 저장소로 MemoryStore를 사용합니다.

문서는 [여기](https://github.com/expressjs/session/blob/master/README.md)에서 확인할 수 있습니다.

여기에서는 간단하게 Session과 SessionStore 사용법에 대해서만 추가했습니다.

``` js

// access session id
req.sessionID // or req.session.id

// access session data
if (req.session.viewCount) {
  req.session.viewCount++
} else {
  req.session.viewCount = 1
}

// session store
const store = req.sessionStore

// Get all sessions in the store as an array.
store.all((err, sessions) => {
  console.log(sessions) // { sid: { viewCount: 1 } }
})

// Destroys the session
store.destroy('sid', (err) => {})
```