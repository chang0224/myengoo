# STORK Security Talk: Key Bridge Design

> 출처: 회의 녹취록 (Meeting Transcript)
> 저장일: 2026-07-06
> 📖 [직독직해](../daily_news/2026-07-06_stork-security-talk-key-bridge.md) · 📚 [단어장](../words/2026-07-06_stork-security-talk-key-bridge.md)

---

#### ¶1

Since our project name is STORK, we're going to introduce STORK Security Talk briefly. So our goal is to make a security boundary satisfying FIPS Level 2. The gray box is our security boundary. We named it SecurityTop, and you could see that there is a CMH as a crypto engine and there are also some several other IP or hardware blocks.

#### ¶2

For instance, the PUF is the one that we mentioned earlier. We're going to use Synopsys SRAM PUF. And we're going to use the PUF value as the device unique key for each chip. And since the CMH provides the key only through the KIC interface, so we thought we should design some glue logic that could connect the CMH KIC interface and the PUF output interface. That's named as a Key Bridge. It's going to be a little hardware block.

#### ¶3

But since we want to control or read some status registers, whether the PUF value has been sent to the CMH without any error, those kind of things are going to be connected through the APB interface. And there is going to be a secure local bus that will mainly be used by these IPs or blocks. It's going to be separated from the SoC main bus because we're going to only allow the secure transactions to enter this gray box range.

#### ¶4

And so the master of the local bus would be CMH DMA, like AXI master, and also the secure transactions from the SoC main bus. And some other slave interfaces would be OTP. There's some general OTP in the SoC subsystem, but we just added the separate OTP only for SecurityTop's usage. And the STC is just a Security Top Controller that has some SFRs that we're going to use for control or maybe detect some errors and read some statuses.

#### ¶5

I guess that the CPU OTP, you separated that to make it exclusive to CMH, right? Yes. That's perfect. Yes, so SoC CPU will not be able to read it. Fantastic. After they initially write the value.

#### ¶6

Maybe the part that we're struggling with is the design of the Key Bridge. So initially the Key Bridge only had one goal. Its only goal was to connect the PUF output interface and the CMH KIC interface. So the only simple logic that could change the data bit width and some parity checks was the only role.

#### ¶7

The two items, the firmware encryption key and the OTP provisioned device root key, should be stored in secure OTP. The OTP provisioned device root key is — you can just think of this as a spare key of the PUF, because it's our first time using the PUF and we're not sure whether the PUF will be able to create the stable value all the time right after the manufacturing.

#### ¶8

And we heard from Synopsys that we could screen out some PUF failure chips right after the manufacturing. So if the PUF is not working, we thought there should be some workaround key that we could use. So we thought we could just store that in the OTP like we did in our previous project.

#### ¶9

And also, there's one more thing that we try to use — the firmware encryption key that we're going to use to decrypt the firmware that we read from the flash. So these two secrets should be stored in OTP. And since its basic use and its identity is the key, it should be input to the CMH through this KIC interface. So the role of the Key Bridge has extended from only a PUF bridge to some more complex function that should work as a master that could read values stored in the secure OTP.

#### ¶10

We thought this kind of design will be a little bit complex because secure OTP should have two masters. And maybe some kind of simple FSM should be added to the Key Bridge to work as a master to the secure OTP controller and some key selection things. We are dealing with this one, so we didn't get to the decision yet, but we're seeking for solutions.

#### ¶11

Quick question on that. Has it been reviewed by Rambus, your contact at Rambus? Have you presented that to the FAE or the contact you have at Rambus on the pre-sale side, to see what they think about it? This looks fine by me. But I'm not the same security level expert that they are. Just make sure to get that reviewed, maybe at some point.

#### ¶12

This one was not reviewed yet. It is under discussion internally. So the one thing we discovered in the CMH data sheet was the external master interface that is being called XC. As far as I know, this is configurable. This is not enabled by default, but we could configure up to five AHB masters. So we thought maybe we could use this master interface to access the secure OTP in our system.

#### ¶13

We had a lot of cases. We looked for a lot of cases for the firmware encryption key. Maybe we could just store them in the plain text key form. Or wrap it with PUF-derived key. Even after we wrap the key with the PUF value, there are two options: we can just store the plain text wrapped value in the OTP, or just store it as a structure that can be read directly by the Host API. So there are total three cases and we searched the data sheet and Host API documents to confirm whether these cases could be supported via the CMH Host API.

#### ¶14

We can probably go through that via tickets. We're going to send this document and the table to you. We don't really have a software team here, so that would be good for us to see that with the software team. As Gaetan told, you can create a ticket via our support site. If we need or if your site needs technical sessions, then we can arrange it. So other things are trivial compared to this Key Bridge design. That's all for today.
