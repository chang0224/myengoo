---
name: engoo-study
description: Convert English articles into Korean study materials using 직독직해 (phrase-by-phrase direct translation with slash-separated chunks) and extract B2+ CEFR vocabulary with IPA pronunciation. Use this skill whenever the user shares an URL, asks for 직독직해 or 끊어읽기, requests phrase-by-phrase English-to-Korean translation of an article, or wants a vocabulary list (단어장) from an English text aimed at Korean learners. Trigger even when the user only says "영어 공부" alongside a specific article URL or pasted English text.
---

# Engoo 영어 공부 스킬

영어 기사를 한국어 학습자용 **직독직해 자료 + B2 이상 단어장**으로 변환합니다.

## 언제 쓰나

- 사용자가 URL을 공유하거나 붙여넣은 내용에 대해 번역 요청
- "직독직해", "끊어읽기 해석" 요청
- 영어 기사/지문과 함께 "영어 공부", "단어장", "어휘 정리" 등 언급
- CEFR B2 이상 단어 추출 요청

---

## 작업 흐름

### 1단계: 기사 본문 확보

**URL이 주어진 경우:**
웹 페이지에 대해서는 일단 `web_fetch`를 시도하되, 빈 페이지나 `Please enable JavaScript`가 반환되면 다음을 사용자에게 요청하세요:

- 기사 제목 + 본문 전체 복사/붙여넣기

**본문이 이미 제공된 경우:** 바로 2단계로.

### 2단계: 직독직해 생성

문장을 의미 단위로 끊고 `/`로 구분합니다. 영어 줄 바로 아래에 같은 구조의 한국어 줄을 배치합니다.

**끊는 기준 (보통 청크당 2~6단어):**
- 주어 / 동사 / 목적어
- 관계절 · 부사절 · 명사절의 시작 (that, which, who, when 등)
- 전치사구 (in, on, of, with 등)
- 등위·종속 접속사 앞뒤 (and, but, because 등)
- to부정사구, 분사구문

**한국어 번역 원칙:**
- **영어 어순을 유지**합니다. 한국어로 자연스럽게 재배열하지 마세요. 학습자가 영어 읽는 순서대로 이해하도록 훈련하는 게 목적입니다.
- 각 청크의 한국어는 대응되는 영어 청크와 **1:1로 맞닿게** 배치합니다.
- 어색해도 괜찮습니다. 예: "were less likely / to experience cognitive decline" → "가능성이 더 낮았다 / 인지 저하를 경험할".

**형식 예시:**

```
Researchers found / that older adults / who regularly used technology / 
연구자들은 발견했다 / 노년층이 / 기술을 정기적으로 사용한 /

were less likely / to experience cognitive decline.
가능성이 더 낮았다 / 인지 저하를 경험할.
```

문장이 길면 줄바꿈으로 끊되, 영어-한국어 페어 구조는 유지합니다.

### 3단계: B2 이상 단어장 추출

본문에서 **CEFR B2, C1, C2**에 해당하는 단어를 선별합니다.

**포함 기준 (확실히 B2 이상인 것만):**
- 추상적 개념어 (cognitive, implication, perspective, paradigm)
- 학술·시사 용어 (methodology, correlation, sustainable, diagnosis)
- 격식있는 동사 (implement, demonstrate, investigate, mitigate, note의 "지적하다"가 아니라 더 격식있는 구체적 단어)
- 확실한 B2+ 구동사·연어 (bring about, in light of, on the verge of, be associated with)
- 의학·심리학·과학 용어 (dementia, cognition, prevalence)

**제외 기준 (엄격하게):**
- A1~B1 기초 어휘 (daily, important, study, people 같은 일상어)
- **한국 고등학교 수준에서 흔히 다루는 단어** — 예: `device`, `published`, `note`, `include`, `effect`, `reason`, `case`, `research`, `result`, `average`
- 뉴스·SNS에서 흔한 단어
- 고유명사 (인명, 지명, 기관명)
- 숫자, 날짜
- 다의어 중 가장 흔한 뜻으로 쓰인 경우 (예: `note`가 "지적하다"로 쓰였어도 이 단어 자체가 너무 기본이라 제외)

**판단이 애매하면 제외합니다.** 기준: "한국 고등학교 졸업자가 이 단어를 이 문맥에서 알고 있을 가능성이 높은가?" → yes면 제외.

일반적으로 기사 1편당 **8~12개 정도**가 적정입니다. 너무 많이 뽑지 마세요.

**각 단어 형식:**

```markdown
**cognitive** /ˈkɑːɡnətɪv/ [형용사] 인지의, 인식의
- 본문 [¶2](#p2): "technology may slow **cognitive** decline in older adults"
- 예문: Reading regularly can sharpen your cognitive skills.
```

- **IPA는 미국식 발음**
- 품사는 한국어로: 명사/동사/형용사/부사/전치사/접속사/구동사
- 한국어 뜻은 본문 맥락에 맞는 것을 **첫 번째**로, 주요 다른 뜻이 있으면 쉼표로 추가
- 예문은 짧고 자연스러운 B1~B2 수준 문장
- **본문 링크 필수**: 단어가 처음 등장한 문단 번호를 `[¶N](#pN)` 형식으로 표시. 이 링크는 `daily_news/` 파일에서는 같은 파일 내 앵커로 점프하고, `words/` 파일에서는 `../contents/{파일명}.md#pN`으로 원문 파일의 해당 문단으로 점프합니다 (상세는 4단계 참조).
- 같은 단어가 여러 문단에 나오면 **처음 등장한 문단** 기준.

### 4단계: 파일 출력 (3개 파일로 분리)

결과를 **3개 파일**로 나눠 저장합니다. 출력 루트는 git의 루트디렉토리 이거나 index 파일이 있는 top 디렉토리입니다 (환경에 따라 사용자 지정 경로일 수 있음).

**디렉토리 구조:**

```
./
├── index.md                    ← 전체 학습 인덱스 (매번 갱신)
├── contents/                   ← 원문 저장
│   └── YYYY-MM-DD_slug.md
├── daily_news/                 ← 원문 + 직독직해 + 단어장 통합본
│   └── YYYY-MM-DD_slug.md
└── words/                      ← 단어장만
    └── YYYY-MM-DD_slug.md
```

**파일명 규칙:**
- 형식: `YYYY-MM-DD_slug.md`
- 날짜: 학습일 (오늘 날짜)
- slug: 기사 제목을 소문자+하이픈으로, **3~5단어**로 축약 (관사·전치사·조동사 생략)
  - 예: "Technology May Slow Cognitive Decline in Older Adults" → `technology-slow-cognitive-decline`
- 세 파일의 이름은 **완전히 동일**하게 맞춥니다 (세 디렉토리에 같은 이름).

**① `contents/{date}_{slug}.md` — 원문 전용**

기사 제목 + 메타 + 영어 원문만. 번역·주석 없음. **각 문단마다 HTML 앵커를 붙입니다** (단어장/표현에서 링크로 점프해올 때 타겟).

```markdown
# {기사 제목}

> 출처: {URL if available}
> 저장일: YYYY-MM-DD

---

<a id="p1"></a>
{1번째 문단}

<a id="p2"></a>
{2번째 문단}

<a id="p3"></a>
{3번째 문단}

...
```

앵커 ID는 `p1`, `p2`, ... 형식 (ASCII만 사용). 문단 번호는 원문 그대로의 순서 기준.

**② `words/{date}_{slug}.md` — 단어장 전용**

B2+ 단어와 핵심 표현만. 단어 암기·Anki 변환 등에 쓰기 편하도록 원문·직독직해 없음. **본문 링크는 원문 파일(`contents/`)의 해당 문단으로 cross-file 링크**.

```markdown
# 단어장: {기사 제목}

> 저장일: YYYY-MM-DD
> 원문: [../contents/{같은 파일명}.md](../contents/{같은 파일명}.md)

## 📚 B2+ 단어장

**word** /ipa/ [품사] 뜻
- 본문 [¶N](../contents/{같은 파일명}.md#pN): "... **word** ..."
- 예문: ...

...

## 💡 핵심 표현

- **표현** [¶N](../contents/{같은 파일명}.md#pN) : 한국어 설명
```

링크 타겟은 **`contents/` 파일의 앵커**를 가리킵니다 (상대 경로 `../contents/...`).

**③ `daily_news/{date}_{slug}.md` — 통합 학습본**

직독직해 + 단어장 + 핵심 표현 모두 포함. 이 파일이 실제 학습의 메인입니다. **직독직해의 각 ¶ 섹션에 앵커를 붙여서** 단어장에서 같은 파일 내 점프가 가능하게 합니다.

```markdown
# {기사 제목}

> 출처: {URL}  
> 학습일: YYYY-MM-DD

---

## 📖 직독직해

<a id="p1"></a>
### ¶1

{¶1 직독직해}

<a id="p2"></a>
### ¶2

{¶2 직독직해}

...

---

## 📚 B2+ 단어장

**word** /ipa/ [품사] 뜻
- 본문 [¶N](#pN): "... **word** ..."
- 예문: ...

...

---

## 💡 핵심 표현

- **표현** [¶N](#pN) : 한국어 설명
```

같은 파일 내 링크이므로 `(#pN)` 형식 (경로 없음). 앵커 ID는 `contents/` 파일과 **동일한 `p1`, `p2`** 를 씁니다.

### 5단계: 인덱스 갱신

최상위 `/mnt/user-data/outputs/index.md`를 확인하고 갱신합니다.

**절차:**
1. 기존 `index.md`가 있으면 읽어서 기존 엔트리를 보존합니다.
2. 오늘 작업한 기사 정보를 **최상단** (최신순)에 추가합니다.
3. 없으면 새로 만듭니다.
4. 상단의 "총 N개 기사", "마지막 업데이트" 수치·날짜를 다시 계산해서 갱신합니다.

**인덱스 포맷:**

```markdown
# 📚 Engoo 학습 인덱스

> 총 {N}개 기사 · 마지막 업데이트: YYYY-MM-DD

| 날짜 | 제목 | 원문 | 통합 | 단어장 | 단어 수 |
|------|------|------|------|--------|---------|
| 2026-04-24 | Technology May Slow Cognitive Decline | [원문](contents/2026-04-24_technology-slow-cognitive-decline.md) | [📖](daily_news/2026-04-24_technology-slow-cognitive-decline.md) | [📚](words/2026-04-24_technology-slow-cognitive-decline.md) | 10 |
```

최신 항목이 맨 위, 이전 항목들은 아래로 내려갑니다.

### 6단계: 사용자에게 제시

`present_files`로 **4개 파일** (index, contents, daily_news, words)을 보여줍니다. 순서는: ①index.md → ②daily_news(통합) → ③words(단어장) → ④contents(원문). 인덱스를 먼저 보여줘서 전체 조감이 먼저 들어오게 합니다.

---

## 품질 체크리스트

제출 전 확인:
- [ ] 모든 문장이 직독직해됐는가 (빠진 문장 없음)
- [ ] 청크가 2~6단어 범위에 대체로 들어가는가
- [ ] 영어 어순 그대로 한국어가 대응되는가 (자연스럽게 재배열하지 않음)
- [ ] 단어장에 A1~B1 쉬운 단어가 섞여 있지 않은가 (한국 고졸 수준 단어 제외)
- [ ] 모든 단어에 IPA · 품사 · 한국어 뜻 · **본문 링크** · 예문이 있는가
- [ ] 핵심 표현에도 **본문 링크** `[¶N](#pN 또는 ../contents/...)`가 있는가
- [ ] `contents/` 파일 각 문단에 `<a id="pN"></a>` 앵커가 달려 있는가
- [ ] `daily_news/` 파일 각 `### ¶N` 앞에 `<a id="pN"></a>` 앵커가 달려 있는가
- [ ] `daily_news/` 내 링크는 `(#pN)`, `words/` 내 링크는 `(../contents/파일명.md#pN)` 형식인가
- [ ] 3개 파일 (contents/, daily_news/, words/)이 각자 **동일한 파일명**으로 저장됐는가
- [ ] `index.md`가 최신 기사를 최상단에 추가하고 총 개수·업데이트 날짜를 갱신했는가
- [ ] `present_files`로 4개 파일 (index + 3개)이 모두 제시됐는가

---

## 간단한 인사말

스킬 시작 시 한 줄로 무엇을 할지 알려주세요. 예:  
_"직독직해 + B2 단어장으로 정리해드릴게요. 잠시만요!"_

긴 preamble은 생략하고 바로 본 작업으로 넘어갑니다.
