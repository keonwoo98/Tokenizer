# 블록체인과 토큰: 핵심 개념 가이드

이 문서는 블록체인, 코인, 토큰에 대한 기초 개념을 설명합니다.
Web3에 대해 전혀 모르는 사람도 이해할 수 있도록 작성되었습니다.

---

## 목차

1. [블록체인이란?](#1-블록체인이란)
2. [코인 vs 토큰](#2-코인-vs-토큰)
3. [스마트 컨트랙트](#3-스마트-컨트랙트)
4. [토큰 표준 (ERC-20, BEP-20)](#4-토큰-표준-erc-20-bep-20)
5. [테스트넷 vs 메인넷](#5-테스트넷-vs-메인넷)
6. [지갑과 주소](#6-지갑과-주소)
7. [가스비 (수수료)](#7-가스비-수수료)
8. [토큰의 목적과 토크노믹스](#8-토큰의-목적과-토크노믹스)
9. [Solidity 기초](#9-solidity-기초)
10. [ERC-20 토큰 구조](#10-erc-20-토큰-구조)
11. [고급 기능: mint, burn, owner](#11-고급-기능-mint-burn-owner)
12. [스마트 컨트랙트 보안](#12-스마트-컨트랙트-보안)
13. [개발 도구 소개](#13-개발-도구-소개)
14. [프로젝트 구현 전략](#14-프로젝트-구현-전략)
15. [Multisig (다중 서명) - 보너스](#15-multisig-다중-서명---보너스)
16. [최종 구현 결과](#16-최종-구현-결과)

---

## 1. 블록체인이란?

### 정의

블록체인은 **분산 원장 기술**입니다. 거래 기록(장부)을 중앙 서버가 아닌 네트워크 참여자 모두가 공유하고 검증하는 시스템입니다.

### 전통적인 시스템과의 비교

```
전통적인 시스템 (은행):

        [중앙 서버]
            │
    ┌───────┼───────┐
    │       │       │
   고객A   고객B   고객C

→ 은행이 모든 거래 기록을 관리
→ 은행을 신뢰해야 함
→ 은행이 조작하면 알 수 없음
```

```
블록체인:

    참여자A ─── 참여자B
       │    ╲  ╱    │
       │     ╲╱     │
       │     ╱╲     │
       │    ╱  ╲    │
    참여자C ─── 참여자D

→ 모든 참여자가 동일한 장부 보유
→ 누구도 단독으로 조작 불가
→ 중개자 없이 거래 가능
```

### 핵심 특성

| 특성 | 설명 |
|------|------|
| **분산성** | 데이터가 여러 노드에 복제되어 저장 |
| **불변성** | 한번 기록되면 수정/삭제 불가 |
| **투명성** | 모든 거래 기록이 공개 |
| **탈중앙화** | 중앙 관리자 없이 운영 |

### 주요 블록체인 플랫폼

| 블록체인 | 특징 | 기본 코인 |
|---------|------|----------|
| Bitcoin | 최초의 블록체인, 가치 저장 목적 | BTC |
| Ethereum | 스마트 컨트랙트 플랫폼 | ETH |
| BNB Chain | Ethereum 호환, 낮은 수수료 | BNB |
| Solana | 고속 처리, 낮은 수수료 | SOL |

---

## 2. 코인 vs 토큰

이 두 용어는 일상에서 혼용되지만, 기술적으로 명확한 차이가 있습니다.

### 코인 (Coin)

**블록체인의 기본 화폐**입니다.

- 해당 블록체인에 내장되어 있음
- 트랜잭션 수수료(가스비) 지불에 사용
- 채굴/스테이킹 보상으로 발행
- 새로운 코인을 만들려면 **블록체인 자체를 새로 만들어야 함**

예시: BTC (Bitcoin), ETH (Ethereum), BNB (BNB Chain)

### 토큰 (Token)

**스마트 컨트랙트로 생성한 디지털 자산**입니다.

- 기존 블록체인 "위에서" 동작
- 스마트 컨트랙트(프로그램)로 규칙 정의
- **누구나 만들 수 있음**
- 기반 블록체인의 코인으로 수수료 지불

예시: USDT, LINK, UNI (모두 Ethereum 위의 토큰)

### 비유로 이해하기

```
코인 = 국가의 법정화폐 (원화, 달러)
       → 그 나라(블록체인)를 운영하는 기본 통화

토큰 = 그 나라에서 발행된 상품권, 포인트
       → 법정화폐 기반으로 만들어진 파생 자산
```

### 실제 예시

| 블록체인 | 코인 (Native) | 토큰 (Smart Contract) |
|---------|--------------|----------------------|
| Ethereum | ETH | USDT, USDC, LINK, UNI, SHIB |
| BNB Chain | BNB | CAKE, BUSD |
| TRON | TRX | USDT (TRC-20) |

### 주의: LINK는 토큰이다

거래소에서 "코인"이라 부르지만, Chainlink(LINK)는 기술적으로 Ethereum 위의 ERC-20 **토큰**입니다. 시가총액이 높다고 코인이 되는 것이 아닙니다.

---

## 3. 스마트 컨트랙트

### 정의

블록체인 위에서 실행되는 **자동화된 프로그램**입니다. 미리 정해진 조건이 충족되면 자동으로 실행됩니다.

### 일반 계약과의 비교

```
일반 계약:
"A가 B에게 100만원 보내면 B가 물건을 준다"
→ 사람이 이행해야 함
→ 신뢰 필요, 분쟁 가능

스마트 컨트랙트:
if (A가 100만원 보냄) {
    자동으로 물건 전송
}
→ 코드가 자동 실행
→ 신뢰 불필요, 조작 불가
```

### 특징

- **자동 실행**: 조건 충족 시 즉시 실행
- **불변성**: 배포 후 코드 수정 불가
- **투명성**: 코드가 공개되어 누구나 검증 가능
- **신뢰 불필요**: 코드가 약속을 보장

### 토큰과의 관계

**토큰 = 스마트 컨트랙트**입니다.

토큰은 "누가 얼마나 가지고 있는지"를 기록하고 관리하는 프로그램입니다.

```javascript
// 토큰의 본질 (단순화)
balances = {
    "지갑주소A": 1000,
    "지갑주소B": 500,
    "지갑주소C": 200
}

// transfer 함수 = 숫자 옮기기
function transfer(to, amount) {
    balances[나] -= amount;
    balances[to] += amount;
}
```

---

## 4. 토큰 표준 (ERC-20, BEP-20)

### 표준이 필요한 이유

```
표준 없이 각자 만들면:

토큰A: sendMoney(to, amount)
토큰B: transferToken(receiver, value)
토큰C: send(address, qty)

→ 지갑, 거래소가 각각 다르게 대응해야 함
→ 호환성 없음
```

```
표준이 있으면:

모든 토큰: transfer(to, amount)

→ 하나의 지갑으로 모든 토큰 관리 가능
→ 거래소도 쉽게 상장 가능
```

### 주요 토큰 표준

| 표준 | 블록체인 | 용도 | 예시 |
|------|---------|------|------|
| **ERC-20** | Ethereum | 대체 가능 토큰 (화폐형) | USDT, UNI, LINK |
| **ERC-721** | Ethereum | NFT (고유한 토큰) | CryptoPunks, BAYC |
| **ERC-1155** | Ethereum | 멀티 토큰 (게임 아이템) | 게임 내 아이템 |
| **BEP-20** | BNB Chain | ERC-20과 동일 | CAKE, BUSD |

### ERC-20 vs BEP-20

두 표준은 **거의 동일**합니다. BNB Chain이 Ethereum과 호환되도록 설계되었기 때문입니다.

- 같은 Solidity 코드 사용
- 같은 함수 인터페이스
- 다른 블록체인에 배포할 뿐

### ERC-20 필수 인터페이스

```
읽기 함수:
- name()        → 토큰 이름
- symbol()      → 티커 심볼 (예: BTC, ETH)
- decimals()    → 소수점 자릿수
- totalSupply() → 총 발행량
- balanceOf()   → 특정 주소의 잔액

쓰기 함수:
- transfer()     → 직접 전송
- approve()      → 전송 권한 부여
- transferFrom() → 위임 전송

이벤트:
- Transfer  → 전송 시 발생
- Approval  → 승인 시 발생
```

---

## 5. 테스트넷 vs 메인넷

### 메인넷 (Mainnet)

- **실제 서비스**가 운영되는 네트워크
- 코인/토큰에 **실제 경제적 가치**가 있음
- 트랜잭션에 **실제 돈** 필요

### 테스트넷 (Testnet)

- **개발/테스트** 목적의 네트워크
- 코인/토큰에 **가치 없음**
- **무료**로 테스트 코인 획득 가능 (Faucet)
- 메인넷과 동일한 환경에서 테스트

### 주요 테스트넷

| 메인넷 | 테스트넷 | Faucet |
|--------|---------|--------|
| Ethereum | Sepolia, Goerli | 검색: "Sepolia Faucet" |
| BNB Chain | BSC Testnet | BNB Chain Faucet |

### 이 프로젝트에서는?

**반드시 테스트넷 사용**. 실제 돈을 사용할 필요가 없습니다.

---

## 6. 지갑과 주소

### 지갑 (Wallet)

블록체인과 상호작용하기 위한 소프트웨어입니다.

- **개인키(Private Key)** 관리
- 트랜잭션 서명
- 잔액 조회

대표적인 지갑: MetaMask (브라우저 확장)

### 주소 (Address)

블록체인에서의 **계좌번호**입니다.

```
Ethereum/BNB Chain 주소 형식:
0x742d35Cc6634C0532925a3b844Bc454e4438f44e

- 0x로 시작
- 40자리 16진수
- 공개 가능 (입금 받을 때 공유)
```

### 개인키 vs 공개키 vs 주소

```
개인키 (Private Key):
→ 절대 공개 금지
→ 이것만 있으면 자산 탈취 가능
→ 지갑 복구 시 필요

공개키 (Public Key):
→ 개인키에서 수학적으로 도출
→ 서명 검증에 사용

주소 (Address):
→ 공개키에서 도출
→ 다른 사람에게 공유 가능
→ 입금 받을 때 사용
```

---

## 7. 가스비 (수수료)

### 가스(Gas)란?

블록체인에서 트랜잭션을 처리하는 데 필요한 **연산 비용**입니다.

### 왜 필요한가?

1. **스팸 방지**: 무료면 악의적인 트랜잭션 폭주
2. **검증자 보상**: 트랜잭션 처리해주는 대가
3. **자원 배분**: 네트워크 자원의 효율적 사용

### 가스비 계산

```
가스비 = 가스 사용량 × 가스 가격

예시 (Ethereum):
- 단순 전송: ~21,000 gas
- 토큰 전송: ~65,000 gas
- 스마트 컨트랙트 배포: ~수백만 gas
```

### 네트워크별 가스비 비교

| 네트워크 | 상대적 비용 | 지불 코인 |
|---------|-----------|----------|
| Ethereum | 높음 ($1~$50+) | ETH |
| BNB Chain | 낮음 ($0.1~$1) | BNB |
| Solana | 매우 낮음 ($0.001) | SOL |

테스트넷에서는 가스비도 **무료 테스트 코인**으로 지불합니다.

---

## 8. 토큰의 목적과 토크노믹스

### 토큰을 만드는 이유

모든 토큰의 본질: **"특정 행동을 유도하기 위한 경제적 보상 시스템"**

### 토큰의 역할 분류

| 역할 | 설명 | 예시 |
|------|------|------|
| **유틸리티** | 서비스 이용권 | 게임 아이템 구매, 수수료 할인 |
| **거버넌스** | 의사결정 투표권 | 프로토콜 업그레이드 투표 |
| **보상** | 기여에 대한 인센티브 | 채굴 보상, 스테이킹 이자 |
| **자산** | 실물/디지털 자산의 토큰화 | 부동산 지분, 예술품 소유권 |

### 실제 사례

| 프로젝트 | 토큰 | 목적 |
|---------|------|------|
| Bitcoin | BTC | 채굴자 보상 → 네트워크 보안 유지 |
| Uniswap | UNI | 거버넌스 투표권 → 탈중앙화 의사결정 |
| Chainlink | LINK | 오라클 노드 보상 → 정확한 데이터 제공 유도 |

### 토크노믹스 (Tokenomics)

토큰의 경제 설계를 의미합니다.

```
설계 요소:

1. 총 발행량
   └── 고정? 무제한?

2. 초기 분배
   ├── 팀: 20%
   ├── 투자자: 15%
   ├── 커뮤니티: 40%
   └── 재단: 25%

3. 베스팅 (Vesting)
   └── 팀 물량을 4년간 점진적 해제
   └── 한번에 덤핑 방지

4. 인플레이션/디플레이션
   ├── 신규 발행 (mint)
   └── 소각 (burn)

5. 유틸리티
   └── 토큰 없으면 서비스 이용 불가?
```

### 발행량 설계 옵션

**고정 발행**: 배포 시 전량 발행, 추가 발행 불가 (Bitcoin 방식)

**가변 발행**: mint 함수로 추가 발행 가능 (인플레이션 가능)

**소각 가능**: burn 함수로 토큰 영구 삭제 (디플레이션)

### 채굴은 토큰에 없다

```
채굴 (Mining):
→ 코인(블록체인)에만 존재
→ 새 블록 생성 + 트랜잭션 검증의 보상
→ 네트워크 보안 유지 목적

토큰:
→ 이미 있는 블록체인 위에서 동작
→ 채굴 필요 없음
→ 블록 생성은 기반 체인이 담당
```

---

## 9. Solidity 기초

Solidity는 Ethereum 스마트 컨트랙트 작성 언어입니다. BNB Chain도 동일하게 사용합니다.

### 기본 구조

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    // 상태 변수
    // 함수
    // 이벤트
}
```

### 데이터 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| `uint256` | 양의 정수 (256비트) | 잔액, 발행량 |
| `uint8` | 양의 정수 (8비트, 0~255) | decimals |
| `string` | 문자열 | 토큰 이름 |
| `address` | 지갑/컨트랙트 주소 | 0x1234... |
| `bool` | true/false | 상태 플래그 |
| `mapping` | key-value 저장소 | 잔액 기록 |

### 상태 변수

블록체인에 **영구 저장**되는 데이터입니다.

```solidity
string public name = "My Token";           // 문자열
uint256 public totalSupply;                // 숫자
mapping(address => uint256) public balanceOf;  // 매핑
```

### mapping (매핑)

Python의 dict, JavaScript의 object와 유사합니다.

```solidity
mapping(address => uint256) public balanceOf;

// 내부 구조:
// balanceOf[0x1234...] = 1000
// balanceOf[0x5678...] = 500
```

### 함수

```solidity
function transfer(address to, uint256 value) public returns (bool) {
    // 로직
    return true;
}
```

### 함수 가시성

| 키워드 | 접근 범위 |
|--------|----------|
| `public` | 어디서든 호출 가능 |
| `external` | 외부에서만 호출 가능 |
| `internal` | 컨트랙트 내부 + 상속 |
| `private` | 컨트랙트 내부에서만 |

### 이벤트

블록체인에 로그를 기록합니다. 프론트엔드가 감지할 수 있습니다.

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);

// 사용
emit Transfer(msg.sender, to, value);
```

### 특수 변수

```solidity
msg.sender  // 현재 함수를 호출한 주소
msg.value   // 함께 전송된 ETH/BNB 양
block.timestamp  // 현재 블록 시간
```

### require

조건 검증에 사용합니다. 조건이 false면 트랜잭션이 취소됩니다.

```solidity
require(balanceOf[msg.sender] >= value, "Insufficient balance");
// 잔액이 부족하면 "Insufficient balance" 에러와 함께 실패
```

---

## 10. ERC-20 토큰 구조

### 완전한 구현 예시

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FortyTwoToken {
    // ============ 상태 변수 ============
    string public name = "Forty Two Token";    // 토큰 이름
    string public symbol = "F42T";             // 티커 심볼
    uint8 public decimals = 18;                // 소수점 자릿수
    uint256 public totalSupply;                // 총 발행량

    // 잔액 저장: 주소 → 잔액
    mapping(address => uint256) public balanceOf;

    // 위임 저장: 소유자 → (위임받은자 → 금액)
    mapping(address => mapping(address => uint256)) public allowance;

    // ============ 이벤트 ============
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ============ 생성자 ============
    constructor(uint256 initialSupply) {
        // 총 발행량 설정 (decimals 적용)
        totalSupply = initialSupply * 10 ** decimals;

        // 배포자에게 모든 토큰 지급
        balanceOf[msg.sender] = totalSupply;

        // 토큰 생성 이벤트
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    // ============ 함수 ============

    // 직접 전송
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    // 권한 부여
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;

        emit Approval(msg.sender, spender, value);
        return true;
    }

    // 위임 전송
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }
}
```

### 각 함수 설명

#### transfer (직접 전송)

```
A가 B에게 100 토큰 전송:

Before:
  balanceOf[A] = 1000
  balanceOf[B] = 0

transfer(B, 100) 호출

After:
  balanceOf[A] = 900
  balanceOf[B] = 100
```

#### approve + transferFrom (위임 전송)

DEX(탈중앙 거래소) 같은 서비스에서 사용합니다.

```
왜 필요한가?

직접 전송만 있다면:
1. 내가 DEX에 토큰 전송
2. DEX가 거래 실행
3. 문제: DEX가 먹튀하면?

위임 방식:
1. DEX에게 "100토큰까지 사용 권한" 부여 (approve)
2. DEX가 필요한 만큼만 가져감 (transferFrom)
3. 안전: 승인한 금액 이상은 절대 못 가져감
```

```
실행 흐름:

1. A가 DEX에게 권한 부여
   approve(DEX, 100)
   → allowance[A][DEX] = 100

2. DEX가 A의 토큰을 B에게 전송
   transferFrom(A, B, 50)

   After:
     balanceOf[A] = 950
     balanceOf[B] = 50
     allowance[A][DEX] = 50  ← 사용한 만큼 감소
```

### Decimals (소수점)

블록체인은 소수점을 직접 다루지 않습니다.

```
현실: 1.5 토큰

블록체인 내부 (decimals=18):
1.5 × 10^18 = 1,500,000,000,000,000,000

→ 정수로 저장하고, 표시할 때만 나눔
```

```
decimals = 18 일 때:

1 토큰   = 1,000,000,000,000,000,000 (10^18)
0.1 토큰 = 100,000,000,000,000,000
```

### address(0)

```
address(0) = 0x0000000000000000000000000000000000000000

→ "없음"을 의미하는 특수 주소
→ 토큰 생성 시: "무에서 생성됨"
→ 토큰 소각 시: "이 주소로 보내면 영구 삭제"
```

---

## 부록: 같은 토큰, 다른 네트워크

### USDT 예시

USDT(테더)는 여러 블록체인에 존재합니다.

| 네트워크 | 표준 | 컨트랙트 주소 |
|---------|------|--------------|
| Ethereum | ERC-20 | 0xdAC17F9... |
| TRON | TRC-20 | TR7NHqje... |
| BNB Chain | BEP-20 | 0x55d398... |

**기술적으로는 완전히 다른 토큰**입니다. 각각 다른 블록체인에 있는 별개의 스마트 컨트랙트입니다.

**경제적으로는 같은 가치**입니다. 발행사(Tether)가 1달러 교환을 보장하기 때문입니다.

### 주의사항

```
잘못된 전송:

나: "TRC-20 주소로 USDT 보내줘"
상대방: (ERC-20 네트워크로 전송)

결과: 자산이 영원히 사라질 수 있음!
```

거래소에서 입출금 시 **반드시 네트워크를 확인**해야 합니다.

---

## 참고 자료

- [Ethereum 공식 문서](https://ethereum.org/developers)
- [Solidity 공식 문서](https://docs.soliditylang.org/)
- [BNB Chain 공식 문서](https://docs.bnbchain.org/)
- [OpenZeppelin ERC-20 구현](https://docs.openzeppelin.com/contracts/erc20)
- [ERC-20 표준 (EIP-20)](https://eips.ethereum.org/EIPS/eip-20)

---

## 11. 고급 기능: mint, burn, owner

기본 ERC-20에 자주 추가되는 기능들입니다.

### Owner 패턴

특정 함수를 **소유자만 실행**할 수 있도록 제한합니다.

```solidity
contract FortyTwoToken {
    address public owner;

    // 생성자에서 배포자를 owner로 설정
    constructor() {
        owner = msg.sender;
    }

    // 제한자 (modifier): 재사용 가능한 조건 검사
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;  // 원래 함수 코드가 여기서 실행됨
    }

    // onlyOwner가 붙은 함수는 owner만 호출 가능
    function mint(address to, uint256 amount) public onlyOwner {
        // ...
    }
}
```

```
modifier 동작 원리:

onlyOwner 제한자:
1. require 검사 실행
2. 통과하면 _; 위치에서 원래 함수 실행
3. 실패하면 트랜잭션 취소
```

### mint (토큰 발행)

새로운 토큰을 **생성**합니다. 총 발행량이 증가합니다.

```solidity
function mint(address to, uint256 amount) public onlyOwner {
    totalSupply += amount;
    balanceOf[to] += amount;
    emit Transfer(address(0), to, amount);  // 0x0에서 생성
}
```

```
mint(0xABC, 1000) 실행 시:

Before:
  totalSupply = 1,000,000
  balanceOf[0xABC] = 0

After:
  totalSupply = 1,001,000  ← 증가
  balanceOf[0xABC] = 1000
```

### burn (토큰 소각)

토큰을 **영구 삭제**합니다. 총 발행량이 감소합니다.

```solidity
function burn(uint256 amount) public {
    require(balanceOf[msg.sender] >= amount, "Insufficient balance");
    balanceOf[msg.sender] -= amount;
    totalSupply -= amount;
    emit Transfer(msg.sender, address(0), amount);  // 0x0으로 소각
}
```

```
burn(500) 실행 시:

Before:
  totalSupply = 1,000,000
  balanceOf[caller] = 1000

After:
  totalSupply = 999,500  ← 감소
  balanceOf[caller] = 500
```

### 소유권 이전

owner를 다른 주소로 변경할 수 있습니다.

```solidity
function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0), "Invalid address");
    owner = newOwner;
}
```

### 왜 이런 기능이 필요한가?

| 기능 | 용도 |
|------|------|
| owner | 관리자 권한 분리, 보안 강화 |
| mint | 스테이킹 보상, 추가 발행 |
| burn | 수수료 소각, 디플레이션 설계 |

---

## 12. 스마트 컨트랙트 보안

스마트 컨트랙트는 배포 후 수정이 불가능합니다. 보안 취약점이 있으면 치명적인 자산 손실로 이어질 수 있습니다.

### 주요 취약점

#### 1. Reentrancy (재진입 공격)

외부 호출 중에 같은 함수가 다시 호출되는 공격입니다.

```solidity
// 취약한 코드
function withdraw() public {
    uint256 amount = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: amount}("");  // 외부 호출
    balances[msg.sender] = 0;  // 잔액 초기화가 나중에 됨
}

// 공격자가 call 실행 중에 다시 withdraw 호출 가능
// → 잔액 초기화 전에 여러 번 출금
```

```solidity
// 안전한 코드 (Checks-Effects-Interactions 패턴)
function withdraw() public {
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;  // 먼저 상태 변경
    (bool success, ) = msg.sender.call{value: amount}("");  // 그 다음 외부 호출
}
```

#### 2. Integer Overflow/Underflow

정수 연산이 범위를 초과하는 문제입니다.

```solidity
// Solidity 0.8.0 이전에는 위험했음
uint8 x = 255;
x = x + 1;  // 0이 됨 (overflow)

uint8 y = 0;
y = y - 1;  // 255가 됨 (underflow)
```

```solidity
// Solidity 0.8.0 이상에서는 자동으로 검사
// overflow/underflow 시 트랜잭션 실패 (revert)
// → 우리는 0.8.20 사용하므로 안전
```

#### 3. 접근 제어 미흡

민감한 함수에 권한 검사가 없는 경우입니다.

```solidity
// 취약한 코드
function mint(address to, uint256 amount) public {
    totalSupply += amount;
    balanceOf[to] += amount;
}
// → 누구나 무한 발행 가능!

// 안전한 코드
function mint(address to, uint256 amount) public onlyOwner {
    totalSupply += amount;
    balanceOf[to] += amount;
}
// → owner만 발행 가능
```

### 보안 체크리스트

| 항목 | 확인 사항 |
|------|----------|
| 접근 제어 | 민감한 함수에 onlyOwner 등 제한자 적용 |
| 입력 검증 | require로 모든 입력값 검증 |
| 잔액 검사 | 전송 전 충분한 잔액 확인 |
| 제로 주소 | address(0)으로 전송 방지 |
| 오버플로우 | Solidity 0.8+ 사용 |
| 외부 호출 | Checks-Effects-Interactions 패턴 |

### OpenZeppelin 사용

검증된 라이브러리를 사용하면 보안 위험을 줄일 수 있습니다.

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FortyTwoToken is ERC20, Ownable {
    constructor() ERC20("Forty Two Token", "F42T") Ownable(msg.sender) {
        _mint(msg.sender, 42000000 * 10 ** decimals());
    }
}
```

OpenZeppelin 장점:
- 수천 번의 감사(audit)를 거친 코드
- 커뮤니티에서 지속적으로 검증
- 업계 표준으로 인정

---

## 13. 개발 도구 소개

### Hardhat

JavaScript/TypeScript 기반 스마트 컨트랙트 개발 프레임워크입니다.

```
주요 기능:
- 로컬 블록체인 네트워크 실행
- 컴파일, 테스트, 배포 자동화
- 디버깅 및 console.log 지원
- 플러그인 생태계
```

### Remix IDE

브라우저 기반 Solidity 개발 환경입니다.

```
주요 기능:
- 설치 없이 브라우저에서 사용
- 컴파일, 배포, 테스트 가능
- 초보자에게 추천
- 빠른 프로토타이핑
```

### MetaMask

브라우저 확장 프로그램 지갑입니다.

```
주요 기능:
- 개인키 관리
- 트랜잭션 서명
- 여러 네트워크 지원
- DApp과 연동
```

### 블록체인 익스플로러

트랜잭션과 컨트랙트를 조회하는 웹사이트입니다.

| 네트워크 | 익스플로러 |
|---------|-----------|
| Ethereum | etherscan.io |
| BNB Chain | bscscan.com |
| BSC Testnet | testnet.bscscan.com |

---

## 14. 프로젝트 구현 전략

이 프로젝트를 완수하기 위한 단계별 로드맵입니다.

### 전체 구조

```
Phase 1: 환경 설정
    │
    ▼
Phase 2: 스마트 컨트랙트 개발
    │
    ▼
Phase 3: 로컬 테스트
    │
    ▼
Phase 4: 테스트넷 배포
    │
    ▼
Phase 5: 검증 및 문서화
```

### Phase 1: 환경 설정

```
1-1. MetaMask 설치 및 설정
     • Chrome 확장 프로그램 설치
     • 새 지갑 생성 (시드 구문 안전하게 보관)
     • BSC Testnet 네트워크 추가

1-2. 테스트 BNB 획득
     • BNB Chain Faucet 접속
     • 지갑 주소 입력하여 tBNB 수령

1-3. Hardhat 프로젝트 초기화
     • npm init
     • npm install --save-dev hardhat
     • npx hardhat init
```

### Phase 2: 스마트 컨트랙트 개발

```
2-1. 토큰 설계
     • 이름: "42"가 포함되어야 함
     • 심볼: 3-5자 티커
     • 총 발행량 결정
     • 추가 기능 결정 (mint, burn, owner)

2-2. 컨트랙트 작성
     • contracts/ 폴더에 .sol 파일 생성
     • ERC-20 표준 구현
     • 주석으로 코드 설명 추가

2-3. 컴파일
     • npx hardhat compile
     • 에러 수정
```

### Phase 3: 로컬 테스트

```
3-1. 테스트 코드 작성
     • test/ 폴더에 테스트 파일 생성
     • 배포 테스트
     • transfer 테스트
     • approve/transferFrom 테스트

3-2. 로컬 네트워크 테스트
     • npx hardhat node (로컬 블록체인 실행)
     • npx hardhat test
```

### Phase 4: 테스트넷 배포

```
4-1. 배포 스크립트 작성
     • scripts/deploy.js 생성
     • 배포 로직 구현

4-2. 네트워크 설정
     • hardhat.config.js에 BSC Testnet 추가
     • 개인키 환경변수로 관리 (.env)

4-3. 배포 실행
     • npx hardhat run scripts/deploy.js --network bscTestnet
     • 컨트랙트 주소 기록

4-4. 컨트랙트 검증
     • BSCScan에서 소스코드 검증 (verify)
     • 누구나 코드 확인 가능하게 공개
```

### Phase 5: 검증 및 문서화

```
5-1. 기능 테스트
     • MetaMask에 토큰 추가
     • 전송 테스트
     • BSCScan에서 트랜잭션 확인

5-2. 문서 작성
     • README.md: 프로젝트 개요, 선택 이유
     • documentation/: 상세 문서
     • 컨트랙트 주소, 네트워크 정보 명시

5-3. 제출 준비
     • 디렉토리 구조 확인
     • 코드 주석 점검
     • Git commit 및 push
```

### 최종 디렉토리 구조

```
Tokenizer/
├── README.md                 # 프로젝트 설명, 선택 이유
├── code/                     # 스마트 컨트랙트 코드
│   ├── contracts/
│   │   └── FortyTwoToken.sol
│   ├── test/
│   │   └── Token.test.js
│   ├── hardhat.config.js
│   └── package.json
├── deployment/               # 배포 관련
│   ├── scripts/
│   │   └── deploy.js
│   └── deployed-addresses.md # 배포된 컨트랙트 주소
└── documentation/            # 문서
    ├── concepts.md           # 개념 설명 (이 문서)
    └── whitepaper.md         # 토큰 설명서
```

### 우리 토큰 설계안

| 항목 | 값 | 이유 |
|------|------|------|
| 이름 | Forty Two Token | 42 포함 필수 |
| 심볼 | F42T | 간결하고 식별 가능 |
| Decimals | 18 | 업계 표준 |
| 총 발행량 | 42,000,000 | 42와 연관 |
| 네트워크 | BSC Testnet | 42-BNB 파트너십 |
| 추가 기능 | mint, burn, owner, **multisig** | 학습 + 유연성 + 보안 |

---

## 15. Multisig (다중 서명) - 보너스

Multisig는 하나의 트랜잭션을 실행하기 위해 **여러 명의 승인**이 필요한 보안 메커니즘입니다.

### 왜 필요한가?

```
기존 방식 (단일 owner):

    [Owner 개인키]
         │
         ▼
    mint() 즉시 실행

문제점:
→ 개인키 유출 시 모든 권한 탈취
→ 한 사람이 실수하면 복구 불가
→ 신뢰가 한 사람에게 집중
```

```
Multisig 방식 (2-of-3):

    [Signer A]  [Signer B]  [Signer C]
         │           │           │
         └─────┬─────┘           │
               │                 │
           2명 이상 승인            │
               │                 │
               ▼                 │
           트랜잭션 실행          (선택)

장점:
→ 한 명의 키가 유출되어도 안전
→ 여러 사람이 검토 후 승인
→ 탈중앙화된 의사결정
```

### 실제 사용 사례

| 사례 | Multisig 설정 | 이유 |
|------|--------------|------|
| 회사 금고 | 3-of-5 | CEO, CFO, CTO 등 임원 합의 필요 |
| DAO 재무 | 4-of-7 | 커뮤니티 대표들의 합의 |
| 개인 자산 | 2-of-3 | 본인 + 가족 + 백업 장치 |

### 구현 원리

```solidity
// 1. 서명자 목록과 필요 서명 수 정의
address[] public signers;           // [A, B, C]
uint256 public requiredSignatures;  // 2

// 2. 트랜잭션 제안
struct Transaction {
    TransactionType txType;  // Mint 또는 TransferOwnership
    address target;          // 대상 주소
    uint256 amount;          // 금액 (mint의 경우)
    uint256 confirmations;   // 현재 승인 수
    bool executed;           // 실행 여부
}

// 3. 승인 추적
mapping(uint256 => mapping(address => bool)) public hasConfirmed;
// hasConfirmed[트랜잭션ID][서명자주소] = true/false
```

### 실행 흐름

```
Step 1: 제안 (Propose)
─────────────────────
Signer A가 proposeMint(recipient, 1000) 호출
→ Transaction #0 생성
→ confirmations = 0

Step 2: 승인 (Confirm)
─────────────────────
Signer A가 confirmTransaction(0) 호출
→ confirmations = 1
→ hasConfirmed[0][A] = true

Signer B가 confirmTransaction(0) 호출
→ confirmations = 2  ← 필요 서명 수 충족!
→ hasConfirmed[0][B] = true

Step 3: 실행 (Execute)
─────────────────────
Signer A 또는 B가 executeTransaction(0) 호출
→ confirmations >= requiredSignatures 확인
→ mint 실행
→ executed = true
```

### 우리 토큰에서의 Multisig 적용

| 기능 | Multisig 적용 | 이유 |
|------|--------------|------|
| `transfer` | ❌ | 일반 사용자 기능, 개인 자산 이동 |
| `burn` | ❌ | 자기 토큰만 소각 가능, 피해 제한적 |
| `mint` | ✅ | 토큰 발행은 공급량에 영향 → 합의 필요 |
| `transferOwnership` | ✅ | 모든 권한 이전 → 신중한 결정 필요 |

### Modifier 체인

```solidity
modifier onlySigner() {
    require(isSigner[msg.sender], "Not a signer");
    _;
}

modifier txExists(uint256 txId) {
    require(transactions[txId].exists, "Tx not found");
    _;
}

modifier notExecuted(uint256 txId) {
    require(!transactions[txId].executed, "Already executed");
    _;
}

modifier notConfirmed(uint256 txId) {
    require(!hasConfirmed[txId][msg.sender], "Already confirmed");
    _;
}

// 여러 modifier를 조합
function confirmTransaction(uint256 txId)
    public
    onlySigner           // 1. 서명자인가?
    txExists(txId)       // 2. 트랜잭션 존재하는가?
    notExecuted(txId)    // 3. 이미 실행되지 않았는가?
    notConfirmed(txId)   // 4. 이미 승인하지 않았는가?
{
    // 모든 조건 통과 시에만 실행
}
```

### 보안 고려사항

```
1. 서명자 수 보호
   → 서명자 제거 시 requiredSignatures보다 적어지면 안 됨
   → 예: 2-of-3에서 2명만 남으면 제거 불가

2. 중복 승인 방지
   → 같은 사람이 두 번 승인 불가
   → hasConfirmed 매핑으로 추적

3. 이미 실행된 트랜잭션
   → executed = true면 재실행 불가
   → 이중 지출 방지

4. 승인 철회 가능
   → revokeConfirmation으로 마음 변경 가능
   → 실행 전까지만 가능
```

---

## 16. 최종 구현 결과

### 배포된 컨트랙트

| 항목 | 값 |
|------|-----|
| **Contract Address** | `0x24805c13d21572A237FEbfa83B2B7782Ceab7a2E` |
| **Network** | BSC Testnet (Chain ID: 97) |
| **Token Name** | Forty Two Token |
| **Symbol** | F42T |
| **Total Supply** | 42,000,000 F42T |
| **BSCScan** | https://testnet.bscscan.com/address/0x24805c13d21572A237FEbfa83B2B7782Ceab7a2E#code |

### 구현된 기능

**Mandatory (필수)**:
- ✅ BEP-20 표준 (transfer, approve, transferFrom)
- ✅ 토큰 이름에 "42" 포함
- ✅ 소각 기능 (burn)
- ✅ 소유권 관리 (owner)

**Bonus (보너스)**:
- ✅ Multisig 시스템
  - proposeMint / proposeTransferOwnership
  - confirmTransaction / revokeConfirmation
  - executeTransaction
  - 서명자 관리 (add/remove/setRequired)

### 테스트 커버리지

총 **35개 테스트** 통과:

```
Deployment (7)
├── name, symbol, decimals
├── totalSupply, balanceOf
├── owner, signers, requiredSignatures

Transfer (4)
├── 정상 전송
├── Transfer 이벤트
├── 잔액 부족 실패
└── zero address 실패

Approve & TransferFrom (4)
├── allowance 설정
├── Approval 이벤트
├── 위임 전송
└── allowance 초과 실패

Burn (2)
├── 정상 소각
└── 잔액 부족 실패

Multisig Mint (7)
├── 제안 성공
├── 비서명자 제안 실패
├── 승인 성공
├── 중복 승인 실패
├── 실행 성공
├── 승인 부족 실패
└── 중복 실행 실패

Multisig Ownership (2)
├── 제안 성공
└── 실행 후 owner 변경 확인

Revoke (2)
├── 철회 성공
└── 미승인 상태 철회 실패

Signer Management (5)
├── 서명자 추가
├── 비소유자 추가 실패
├── 서명자 제거
├── multisig 깨지는 제거 실패
└── 필요 서명 수 변경

View Functions (2)
├── getSigners 확인
└── isConfirmed 확인
```

---

## 참고 자료

- [Ethereum 공식 문서](https://ethereum.org/developers)
- [Solidity 공식 문서](https://docs.soliditylang.org/)
- [BNB Chain 공식 문서](https://docs.bnbchain.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ERC-20 표준 (EIP-20)](https://eips.ethereum.org/EIPS/eip-20)
- [Hardhat 공식 문서](https://hardhat.org/docs)
- [MetaMask 공식 문서](https://docs.metamask.io/)

---

*이 문서는 42 Tokenizer 프로젝트의 학습 자료로 작성되었습니다.*
