# STORK Security Talk: Key Bridge Design

> 출처: 회의 녹취록 (Meeting Transcript)
> 학습일: 2026-07-06
> 📄 [원문](../contents/2026-07-06_stork-security-talk-key-bridge.md) · 📚 [단어장](../words/2026-07-06_stork-security-talk-key-bridge.md)

---

## 📖 직독직해

### ¶1

Since our project name is STORK, / we're going to introduce / STORK Security Talk / briefly.
우리 프로젝트 이름이 STORK이므로, / 우리는 소개하려 한다 / STORK 보안 논의를 / 간략히.

So our goal is / to make a security boundary / satisfying FIPS Level 2.
그래서 우리의 목표는 / 보안 경계를 만드는 것이다 / FIPS 레벨 2를 충족하는.

The gray box / is our security boundary. / We named it SecurityTop, /
회색 박스는 / 우리의 보안 경계이다. / 우리는 이것을 SecurityTop이라고 이름 붙였고, /

and you could see / that there is a CMH / as a crypto engine /
당신이 볼 수 있듯이 / CMH가 있다 / 암호 엔진으로 /

and there are also / some several other IP / or hardware blocks.
그리고 또한 있다 / 몇몇 다른 IP들이 / 또는 하드웨어 블록들이.

### ¶2

For instance, / the PUF is the one / that we mentioned earlier. /
예를 들어, / PUF는 그것이다 / 우리가 이전에 언급한. /

We're going to use / Synopsys SRAM PUF.
우리는 사용할 것이다 / Synopsys SRAM PUF를.

And we're going to use / the PUF value / as the device unique key / for each chip.
그리고 우리는 사용할 것이다 / PUF 값을 / 디바이스 고유 키로 / 각 칩마다.

And since the CMH provides the key / only through the KIC interface, /
그리고 CMH가 키를 제공하기 때문에 / KIC 인터페이스를 통해서만, /

so we thought / we should design / some glue logic /
그래서 우리는 생각했다 / 우리가 설계해야 한다고 / 어떤 글루 로직을 /

that could connect / the CMH KIC interface / and the PUF output interface.
연결할 수 있는 / CMH KIC 인터페이스와 / PUF 출력 인터페이스를.

That's named as a Key Bridge. / It's going to be / a little hardware block.
그것은 Key Bridge라고 이름 붙여졌다. / 그것은 될 것이다 / 작은 하드웨어 블록이.

### ¶3

But since we want to control / or read some status registers, /
하지만 우리가 제어하거나 / 일부 상태 레지스터를 읽고 싶기 때문에, /

whether the PUF value / has been sent to the CMH / without any error, /
PUF 값이 / CMH에 전송되었는지 / 오류 없이, /

those kind of things / are going to be connected / through the APB interface.
그런 종류의 것들은 / 연결될 것이다 / APB 인터페이스를 통해.

And there is going to be / a secure local bus /
그리고 있을 것이다 / 보안 로컬 버스가 /

that will mainly be used / by these IPs or blocks.
주로 사용될 / 이 IP들이나 블록들에 의해.

It's going to be separated / from the SoC main bus /
그것은 분리될 것이다 / SoC 메인 버스로부터 /

because we're going to only allow / the secure transactions / to enter this gray box range.
왜냐하면 우리는 오직 허용할 것이기 때문이다 / 보안 트랜잭션만 / 이 회색 박스 범위에 진입하는 것을.

### ¶4

And so the master / of the local bus / would be CMH DMA, / like AXI master, /
그래서 마스터는 / 로컬 버스의 / CMH DMA일 것이다, / AXI 마스터처럼, /

and also the secure transactions / from the SoC main bus.
그리고 또한 보안 트랜잭션이 / SoC 메인 버스로부터의.

And some other slave interfaces / would be OTP.
그리고 일부 다른 슬레이브 인터페이스는 / OTP일 것이다.

There's some general OTP / in the SoC subsystem, /
일반적인 OTP가 있다 / SoC 서브시스템에, /

but we just added / the separate OTP / only for SecurityTop's usage.
하지만 우리는 그냥 추가했다 / 별도의 OTP를 / SecurityTop 전용으로만.

And the STC / is just a Security Top Controller /
그리고 STC는 / 그저 Security Top Controller이다 /

that has some SFRs / that we're going to use / for control /
SFR들을 가진 / 우리가 사용할 / 제어를 위해 /

or maybe detect some errors / and read some statuses.
또는 아마 일부 오류를 감지하고 / 일부 상태를 읽기 위해.

### ¶5

I guess / that the CPU OTP, / you separated that / to make it exclusive to CMH, / right?
내가 추측하기로는 / CPU OTP를, / 당신이 그것을 분리한 것은 / CMH 전용으로 만들기 위해서, / 맞죠?

Yes. That's perfect. / Yes, so SoC CPU / will not be able to read it. / Fantastic.
네. 완벽하네요. / 네, 그래서 SoC CPU는 / 그것을 읽을 수 없을 것입니다. / 훌륭해요.

After they initially write the value.
그들이 처음에 값을 기록한 이후에는.

### ¶6

Maybe the part / that we're struggling with / is the design of the Key Bridge.
아마 그 부분은 / 우리가 고군분투하고 있는 / Key Bridge의 설계이다.

So initially / the Key Bridge only had one goal. /
그래서 처음에는 / Key Bridge는 오직 하나의 목표만 있었다. /

Its only goal was / to connect the PUF output interface / and the CMH KIC interface.
그것의 유일한 목표는 ~이었다 / PUF 출력 인터페이스를 연결하는 것 / 그리고 CMH KIC 인터페이스와.

So the only simple logic / that could change the data bit width /
그래서 유일한 단순 로직은 / 데이터 비트 폭을 변경할 수 있는 /

and some parity checks / was the only role.
그리고 일부 패리티 검사 / 그것이 유일한 역할이었다.

### ¶7

The two items, / the firmware encryption key / and the OTP provisioned device root key, /
두 항목, / 펌웨어 암호화 키와 / OTP 프로비저닝된 디바이스 루트 키는, /

should be stored / in secure OTP.
저장되어야 한다 / 보안 OTP에.

The OTP provisioned device root key is — / you can just think of this /
OTP 프로비저닝된 디바이스 루트 키는 — / 당신은 그냥 이것을 생각하면 된다 /

as a spare key of the PUF, /
PUF의 예비 키로, /

because it's our first time / using the PUF /
왜냐하면 이것은 우리의 처음이기 때문이다 / PUF를 사용하는 것이 /

and we're not sure / whether the PUF will be able / to create the stable value /
그리고 우리는 확신하지 못한다 / PUF가 가능할지 / 안정된 값을 생성할 수 있을지 /

all the time / right after the manufacturing.
항상 / 제조 직후에.

### ¶8

And we heard from Synopsys / that we could screen out /
그리고 우리는 Synopsys로부터 들었다 / 우리가 걸러낼 수 있다고 /

some PUF failure chips / right after the manufacturing.
일부 PUF 실패 칩들을 / 제조 직후에.

So if the PUF is not working, / we thought / there should be /
그래서 PUF가 작동하지 않으면, / 우리는 생각했다 / 있어야 한다고 /

some workaround key / that we could use.
일부 우회 키가 / 우리가 사용할 수 있는.

So we thought / we could just store that / in the OTP /
그래서 우리는 생각했다 / 우리가 그냥 그것을 저장할 수 있다고 / OTP에 /

like we did / in our previous project.
우리가 했던 것처럼 / 이전 프로젝트에서.

### ¶9

And also, / there's one more thing / that we try to use — /
그리고 또한, / 한 가지 더 있다 / 우리가 사용하려는 — /

the firmware encryption key / that we're going to use /
펌웨어 암호화 키 / 우리가 사용할 /

to decrypt the firmware / that we read from the flash.
펌웨어를 복호화하기 위해 / 우리가 플래시에서 읽는.

So these two secrets / should be stored in OTP.
그래서 이 두 가지 비밀은 / OTP에 저장되어야 한다.

And since its basic use / and its identity is the key, /
그리고 그것의 기본 용도는 / 그리고 그것의 정체는 키이기에, /

it should be input / to the CMH / through this KIC interface.
그것은 입력되어야 한다 / CMH에 / 이 KIC 인터페이스를 통해.

So the role of the Key Bridge / has extended /
그래서 Key Bridge의 역할은 / 확장되었다 /

from only a PUF bridge / to some more complex function /
단순 PUF 브릿지에서 / 좀 더 복잡한 기능으로 /

that should work as a master / that could read values / stored in the secure OTP.
마스터로 작동해야 하는 / 값을 읽을 수 있는 / 보안 OTP에 저장된.

### ¶10

We thought / this kind of design / will be a little bit complex /
우리는 생각했다 / 이런 종류의 설계는 / 조금 복잡할 것이라고 /

because secure OTP / should have two masters.
왜냐하면 보안 OTP가 / 두 개의 마스터를 가져야 하기 때문이다.

And maybe / some kind of simple FSM / should be added /
그리고 아마도 / 어떤 종류의 단순 FSM이 / 추가되어야 한다 /

to the Key Bridge / to work as a master /
Key Bridge에 / 마스터로 작동하기 위해 /

to the secure OTP controller / and some key selection things.
보안 OTP 컨트롤러에 대한 / 그리고 일부 키 선택 기능.

We are dealing with this one, / so we didn't get to the decision yet, /
우리는 이것을 다루고 있다, / 그래서 우리는 아직 결정에 도달하지 못했다, /

but we're seeking for solutions.
하지만 우리는 해결책을 찾고 있다.

### ¶11

Quick question on that. / Has it been reviewed / by Rambus, /
그것에 대한 간단한 질문. / 리뷰가 되었나요 / Rambus에 의해, /

your contact at Rambus? / Have you presented that /
Rambus에 있는 당신의 담당자에게? / 당신은 그것을 발표했나요 /

to the FAE / or the contact you have / at Rambus / on the pre-sale side, /
FAE에게 / 또는 당신이 가진 담당자에게 / Rambus의 / 사전판매 측의, /

to see / what they think about it?
확인하기 위해 / 그들이 그것에 대해 어떻게 생각하는지?

This looks fine by me. / But I'm not / the same security level expert /
이것은 나에게는 괜찮아 보인다. / 하지만 나는 아니다 / 같은 보안 수준의 전문가가 /

that they are. / Just make sure / to get that reviewed, / maybe at some point.
그들이 하는 것처럼. / 그냥 확인해라 / 그것이 리뷰되도록, / 아마 어느 시점에.

### ¶12

This one was not reviewed yet. / It is under discussion / internally.
이것은 아직 리뷰되지 않았다. / 논의 중이다 / 내부적으로.

So the one thing / we discovered / in the CMH data sheet /
그래서 한 가지 / 우리가 발견한 것은 / CMH 데이터 시트에서 /

was the external master interface / that is being called XC.
외부 마스터 인터페이스였다 / XC라고 불리는.

As far as I know, / this is configurable. /
내가 아는 한, / 이것은 구성 가능하다. /

This is not enabled by default, /
이것은 기본적으로 활성화되어 있지 않지만, /

but we could configure / up to five AHB masters.
하지만 우리는 구성할 수 있다 / 최대 5개의 AHB 마스터를.

So we thought / maybe we could use / this master interface /
그래서 우리는 생각했다 / 아마 우리가 사용할 수 있다고 / 이 마스터 인터페이스를 /

to access the secure OTP / in our system.
보안 OTP에 접근하기 위해 / 우리 시스템에서.

### ¶13

We had a lot of cases. / We looked for a lot of cases /
우리는 많은 경우의 수가 있었다. / 우리는 많은 경우의 수를 살펴보았다 /

for the firmware encryption key.
펌웨어 암호화 키에 대해.

Maybe we could just store them / in the plain text key form. /
아마 우리는 그냥 그것들을 저장할 수 있다 / 일반 텍스트 키 형태로. /

Or wrap it / with PUF-derived key.
또는 그것을 감싸다 / PUF 파생 키로.

Even after we wrap the key / with the PUF value, /
우리가 키를 감싼 후에도 / PUF 값으로, /

there are two options: /
두 가지 옵션이 있다: /

we can just store / the plain text wrapped value / in the OTP, /
우리는 그냥 저장할 수 있다 / 일반 텍스트 래핑된 값을 / OTP에, /

or just store it / as a structure /
또는 그냥 그것을 저장할 수 있다 / 구조체로 /

that can be read directly / by the Host API.
직접 읽힐 수 있는 / Host API에 의해.

So there are total three cases / and we searched /
그래서 총 세 가지 경우가 있다 / 그리고 우리는 검색했다 /

the data sheet and Host API documents / to confirm /
데이터 시트와 Host API 문서를 / 확인하기 위해 /

whether these cases / could be supported / via the CMH Host API.
이 경우들이 / 지원될 수 있는지 / CMH Host API를 통해.

### ¶14

We can probably go through that / via tickets.
우리는 아마 그것을 처리할 수 있다 / 티켓을 통해.

We're going to send / this document and the table / to you.
우리는 보낼 것이다 / 이 문서와 표를 / 당신에게.

We don't really have / a software team here, /
우리는 사실 없다 / 소프트웨어 팀이 여기에, /

so that would be good / for us to see that / with the software team.
그래서 그것이 좋을 것이다 / 우리가 그것을 보는 것이 / 소프트웨어 팀과 함께.

As Gaetan told, / you can create a ticket / via our support site.
Gaetan이 말했듯이, / 당신은 티켓을 생성할 수 있다 / 우리 지원 사이트를 통해.

If we need / or if your site needs / technical sessions, /
만약 우리가 필요하거나 / 또는 당신 쪽에서 필요하면 / 기술 세션이, /

then we can arrange it.
그러면 우리가 그것을 주선할 수 있다.

So other things / are trivial / compared to this Key Bridge design.
그래서 다른 것들은 / 사소하다 / 이 Key Bridge 설계에 비하면.

That's all for today.
오늘은 이것이 전부이다.

---

## 📚 B2+ 단어장

**boundary** /ˈbaʊndəri/ [명사] 경계, 한계
- 본문 [¶1](#¶1): "our goal is to make a security **boundary** satisfying FIPS Level 2"
- 예문: The river forms the natural boundary between the two countries.

**exclusive** /ɪkˈskluːsɪv/ [형용사] 독점적인, 배타적인
- 본문 [¶5](#¶5): "you separated that to make it **exclusive** to CMH"
- 예문: This parking area is exclusive to hotel guests.

**parity** /ˈpærəti/ [명사] 패리티 (오류 검출용 비트), 동등
- 본문 [¶6](#¶6): "the data bit width and some **parity** checks was the only role"
- 예문: A parity bit is added to ensure data integrity during transmission.

**provision** /prəˈvɪʒən/ [동사] 사전 주입하다, 공급하다
- 본문 [¶7](#¶7): "the OTP **provisioned** device root key should be stored in secure OTP"
- 예문: The server was provisioned with all necessary security certificates.

**screen out** /skriːn aʊt/ [구동사] 걸러내다, 선별 제거하다
- 본문 [¶8](#¶8): "we could **screen out** some PUF failure chips right after the manufacturing"
- 예문: The interview process is designed to screen out unqualified candidates.

**workaround** /ˈwɜːrkəˌraʊnd/ [명사] 임시 해결책, 우회 방법
- 본문 [¶8](#¶8): "there should be some **workaround** key that we could use"
- 예문: We found a workaround until the bug is properly fixed.

**decrypt** /diːˈkrɪpt/ [동사] 복호화하다, 해독하다
- 본문 [¶9](#¶9): "the firmware encryption key that we're going to use to **decrypt** the firmware"
- 예문: You need the correct password to decrypt the encrypted file.

**configurable** /kənˈfɪɡjərəbəl/ [형용사] 구성 가능한, 설정 가능한
- 본문 [¶12](#¶12): "As far as I know, this is **configurable**"
- 예문: The software is highly configurable to meet different user needs.

**derive** /dɪˈraɪv/ [동사] 도출하다, 파생시키다
- 본문 [¶13](#¶13): "Or wrap it with PUF-**derived** key"
- 예문: The encryption key is derived from the user's password.

**trivial** /ˈtrɪviəl/ [형용사] 사소한, 하찮은
- 본문 [¶14](#¶14): "other things are **trivial** compared to this Key Bridge design"
- 예문: The issue seemed trivial at first, but it caused a major system failure.

---

## 💡 핵심 표현

- **glue logic** [¶2](#¶2) — IP 블록 간을 연결하는 작은 보조 로직 회로
- **right after the manufacturing** [¶7](#¶7) — 제조 직후 (양산 후 즉시)
- **under discussion internally** [¶12](#¶12) — 내부적으로 논의 중인 (아직 결정되지 않은 사안)
- **go through that via tickets** [¶14](#¶14) — 티켓(지원 요청서)을 통해 처리하다
- **as far as I know** [¶12](#¶12) — 내가 아는 한 (확신이 없을 때 사용하는 표현)

---

## 🗣️ 유용한 표현

- **the part that we're struggling with** [¶6](#¶6)
  - 뜻: "우리가 고군분투하고 있는 부분" (현재 해결 중인 난제를 회의에서 솔직하게 제시할 때)
  - 본문: "Maybe the part that we're struggling with is the design of the Key Bridge."
  - 활용: The part that we're struggling with is the timing closure in the post-layout stage.

- **we didn't get to the decision yet** [¶10](#¶10)
  - 뜻: "아직 결정에 이르지 못했다" (논의가 진행 중임을 명확히 전달할 때)
  - 본문: "We are dealing with this one, so we didn't get to the decision yet"
  - 활용: We reviewed several options but we didn't get to the decision yet.

- **we're seeking for solutions** [¶10](#¶10)
  - 뜻: "해결책을 찾고 있다" (문제 인식 후 적극적으로 대응 중임을 표현할 때)
  - 본문: "but we're seeking for solutions."
  - 활용: The issue is known and we're seeking for solutions with the vendor.

- **just make sure to ~** [¶11](#¶11)
  - 뜻: "반드시 ~해 두세요" (권고나 지시를 부드럽게 전달할 때)
  - 본문: "Just make sure to get that reviewed, maybe at some point."
  - 활용: Just make sure to update the test coverage before merging.

- **this looks fine by me** [¶11](#¶11)
  - 뜻: "내 쪽에서 보기엔 괜찮다" (조건부 동의 또는 검토 후 승인을 표현할 때)
  - 본문: "This looks fine by me. But I'm not the same security level expert that they are."
  - 활용: The architecture looks fine by me, but let's get a second opinion from the team lead.

- **we looked for a lot of cases** [¶13](#¶13)
  - 뜻: "많은 경우의 수를 검토했다" (설계 결정 전 충분한 검토 과정을 설명할 때)
  - 본문: "We had a lot of cases. We looked for a lot of cases for the firmware encryption key."
  - 활용: We looked for a lot of cases before settling on this interface design.

- **we can arrange it** [¶14](#¶14)
  - 뜻: "그것을 주선/조율할 수 있다" (회의나 기술 세션 등을 잡을 수 있다고 제안할 때)
  - 본문: "If we need or if your site needs technical sessions, then we can arrange it."
  - 활용: If the team needs a walk-through session, we can arrange it next week.
