"use strict";

// Friend Court is fully static. All state lives in memory, localStorage, or URL parameters.
const AXES = ["chaos", "honesty", "responsibility", "drama", "ghosting", "snackEnergy"];
const STORAGE_KEY = "friendCourtState.v1";
const LANG_STORAGE_KEY = "friendCourtLang";
const PARTY_STORAGE_KEY = "friendCourtParties.v1";
const SHARE_PARAM = "friendcase";
const SUPPORTED_LANGS = ["th", "en"];
const LANGUAGE_FLAGS = { th: "🇹🇭", en: "🇬🇧" };
const SITE_URL = "https://pkrtsir.github.io/friend-court/";
const RECOMMENDED_CASE_IDS = ["read-no-reply", "almost-there", "food-choice", "not-hungry"];
const ACCUSATION_CATEGORIES = [
  {
    id: "food",
    icon: "🍜",
    label: localText("คดีอาหาร", "Food case"),
    accusations: [
      ["not-hungry", "บอกไม่หิว แต่แย่งกิน", "Not hungry, still stole bites"],
      ["one-bite", "ขอคำเดียว แต่หมดไปครึ่งจาน", "One bite became half the plate"],
      ["anything-food", "ถามว่าจะกินอะไร แล้วตอบว่า “อะไรก็ได้”", "Asked what to eat, then said anything"],
      ["food-photo", "ถ่ายรูปอาหารนานจนเพื่อนหิวตาลาย", "Food photo shoot made everyone dizzy"]
    ]
  },
  {
    id: "chat",
    icon: "💬",
    label: localText("คดีแชท", "Chat case"),
    accusations: [
      ["read-no-reply", "อ่านแล้วไม่ตอบ", "Read, no reply"],
      ["haha-ghost", "ตอบว่า “555” แล้วหาย", "Sent haha, then vanished"],
      ["drop-topic", "เปิดประเด็นเอง แต่ไม่เล่าต่อ", "Started drama, refused episode two"],
      ["sticker-only", "ส่งสติกเกอร์แทนคำตอบทุกสถานการณ์", "Sticker-only communication"]
    ]
  },
  {
    id: "game",
    icon: "🎮",
    label: localText("คดีเกม", "Game case"),
    accusations: [
      ["game-ghost", "ชวนเล่นเกมแล้วหายจากล็อบบี้", "Invited everyone, left the lobby"],
      ["one-more-round", "บอกตาสุดท้ายมาแล้ว 8 ตา", "Final round lasted eight rounds"],
      ["loot-chaos", "แย่งของดรอปแล้วบอกว่าไม่เห็น", "Loot vanished into their bag"],
      ["rank-excuse", "แพ้แล้วโทษเน็ต โทษจอย โทษดาวเสาร์", "Blamed lag, controller, and Saturn"]
    ]
  },
  {
    id: "money",
    icon: "💸",
    label: localText("คดีเงิน", "Money case"),
    accusations: [
      ["split-bill", "หารบิลแล้วปัดเศษเข้าข้างตัวเอง", "Bill split got suspiciously creative"],
      ["forget-transfer", "บอกว่าโอนแล้ว แต่สลิปยังอยู่ในจินตนาการ", "Transfer receipt lives in imagination"],
      ["borrow-small", "ยืมนิดเดียว แต่นิดเดียวหลายรอบ", "Tiny loans became a subscription"],
      ["coupon-drama", "ใช้คูปองตัวเอง แต่ให้เพื่อนหารราคาเต็ม", "Used coupon, split full price"]
    ]
  },
  {
    id: "late",
    icon: "⏰",
    label: localText("คดีนัดแล้วเลท", "Late case"),
    accusations: [
      ["almost-there", "บอก “ใกล้ถึงแล้ว” แต่เพิ่งอาบน้ำ", "Almost there, still showering"],
      ["legend-late", "เลททุกนัดจนกลายเป็นตำนาน", "Late enough to become folklore"],
      ["outfit-delay", "ให้คนอื่นรอ แต่ตัวเองยังเลือกชุดอยู่", "Everyone waited while outfit court opened"],
      ["forgot-own-plan", "นัดเองแต่ลืมเอง", "Made the plan, forgot the plan"]
    ]
  },
  {
    id: "habit",
    icon: "🙃",
    label: localText("คดีนิสัยเพื่อน", "Friend habit case"),
    accusations: [
      ["anything-but-no", "พูดว่าอะไรก็ได้ แต่ปฏิเสธทุกอย่าง", "Anything is fine, except everything"],
      ["borrow-charger", "ยืมที่ชาร์จแล้วทำเหมือนเป็นมรดก", "Borrowed charger, inherited it"],
      ["voice-note", "ส่งวอยซ์ยาวเหมือนแถลงข่าว", "Voice note became a press conference"],
      ["photo-hostage", "ถ่ายรูปให้เพื่อน แต่ไม่เคยส่ง", "Took photos, held them hostage"]
    ]
  }
];
const EVIDENCE_OPTIONS = [
  { id: "solid", icon: "📸", label: localText("แน่นมาก มีแคปหน้าจอพร้อมขึ้นศาล", "Solid screenshots, ready for court"), weight: 22 },
  { id: "witness", icon: "👀", label: localText("มีพยานทั้งโต๊ะ ทุกคนพยักหน้า", "The whole table witnessed it"), weight: 16 },
  { id: "vibes", icon: "🧾", label: localText("หลักฐานบาง แต่ความรู้สึกแน่น", "Evidence thin, vibes strong"), weight: 8 },
  { id: "chaos", icon: "🤏", label: localText("มีแค่ความทรงจำกับความมั่นใจ", "Only memory and confidence"), weight: 2 }
];
const REMORSE_OPTIONS = [
  { id: "sorry", icon: "🥺", label: localText("สำนึกอยู่ แต่ยังขำตัวเอง", "Sorry, but still laughing"), weight: -12 },
  { id: "deny", icon: "😎", label: localText("ไม่สำนึก แถมทำหน้ามั่น", "No remorse, fully smug"), weight: 16 },
  { id: "excuse", icon: "🙄", label: localText("มีข้ออ้าง 4 หน้า A4", "Four pages of excuses"), weight: 10 },
  { id: "bribe", icon: "🍟", label: localText("พยายามไถ่โทษด้วยของกิน", "Trying to bribe with snacks"), weight: -6 }
];
let currentLang = "th";
let lastRouteHash = "home";

const translations = {
  th: {
    appTitle: "ศาลตัดสินเพื่อนสนิท",
    pageTitle: "Friend Court — ศาลตัดสินเพื่อนสนิท",
    appBadge: "MIDNIGHT FRIEND COURT",
    labels: { language: "ภาษา" },
    languageOptions: { th: "🇹🇭 ศาลไทย", en: "🇬🇧 English Court" },
    nav: { history: "ประวัติ", home: "หน้าแรก" },
    landing: {
      eyebrow: "⚡ คดีนี้ใครผิด?",
      subtitle: "ตอบไว รับคำตัดสินไว แล้วส่งไปให้แชตกลุ่มตัดสินซ้ำ",
      previewTitle: "แฟ้มคดีเด่น",
      previewSubtitle: "คดีสั้น ๆ สำหรับคนมีหลักฐานในใจ",
      hookTitle: "ส่งหมายเรียกให้เพื่อน",
      hookCopy: "เลือกคดี แล้วส่งให้เพื่อนที่น่าสงสัยที่สุดในกลุ่มแชต",
      recommendedTitle: "คดีแนะนำจากศาล",
      recommendedSubtitle: "เลือกคดีที่เหมือนแชตกลุ่มคุณที่สุด แล้วให้ศาลเริ่มไต่สวน",
      docketTitle: "อ่านแล้วไม่ตอบ",
      docketStamp: "น่าสงสัย"
    },
    signup: {
      eyebrow: "⚖️ เปิดศาลเพื่อน",
      title: "ลงนามการฟ้องร้อง",
      plaintiffLabel: "ชื่อผู้ฟ้อง",
      plaintiffPlaceholder: "เช่น มีนา",
      defendantLabel: "ชื่อจำเลย",
      defendantPlaceholder: "เช่น โอม",
      required: "ศาลต้องรู้ชื่อผู้ฟ้องกับจำเลยก่อนนะ",
      start: "⚖️ เริ่มการฟ้องร้อง"
    },
    buttons: {
      solo: "เริ่มเล่น",
      duo: "ฟ้องเพื่อน",
      daily: "คดีวันนี้",
      history: "ประวัติ",
      shareSite: "แชร์เว็บนี้",
      copySiteLink: "คัดลอกลิงก์เว็บ",
      randomFriendCase: "สุ่มคดีให้เพื่อน",
      sueFriendNow: "ฟ้องเพื่อนตอนนี้",
      randomCase: "สุ่มคดี",
      fileThisCase: "ฟ้องเพื่อนคดีนี้",
      copyVerdict: "คัดลอกคำพิพากษา",
      judgeCase: "⚖️ ตัดสินคดี",
      sendToDefendant: "📨 แชร์คำพิพากษา",
      saveVerdictImage: "📸 บันทึกคำพิพากษา",
      restartCase: "🔁 ฟ้องคดีใหม่",
      duoSame: "เล่น 2 คนในเครื่องเดียว",
      duoLink: "ส่งลิงก์ให้เพื่อน",
      acceptLink: "เริ่มตอบฝั่งของฉัน",
      nextPlayer: "เริ่มฝั่ง B",
      copyFriendLink: "คัดลอกลิงก์ให้เพื่อน",
      shareText: "แชร์ข้อความ",
      copyLink: "🔗 คัดลอกลิงก์",
      saveImage: "บันทึกหลักฐานเป็นรูปภาพ",
      playAgain: "เล่นอีกคดี",
      iphoneSaveHelp: "บน iPhone ให้เลือก Save Image จากหน้าต่างแชร์ หรือแตะค้างที่รูปเพื่อบันทึก",
      home: "กลับหน้าแรก",
      clearHistory: "ลบประวัติ"
    },
    modes: {
      eyebrow: "เลือกวิธีฟ้องเพื่อน",
      title: "ศาลจะรับฟังทั้งสองฝ่าย",
      sameDesc: "ผลของคนแรกจะถูกซ่อนไว้ แล้วให้คนที่สองตอบต่อ",
      linkDesc: "ตอบฝั่งคุณก่อน แล้วส่งลิงก์ให้เพื่อนมาให้การ"
    },
    cases: {
      eyebrow: "แฟ้มคดีศาลเพื่อน",
      title: "เลือกคดี",
      intro: "เลือกคดีที่จี้ใจที่สุด",
      linkIntro: "เพื่อนเปิดคดีแล้ว ถึงตาคุณ",
      caseNo: "CASE"
    },
    caseFlow: {
      eyebrow: "เลือกสำนวน",
      title: "ศาลขอไต่สวนสั้น ๆ",
      intro: "ตอบไม่กี่ข้อ เดี๋ยวศาลจัดคำพิพากษาให้",
      plaintiff: "ผู้ฟ้อง",
      defendant: "จำเลย",
      random: "สุ่มคดี",
      selected: "คดีที่เลือก",
      step: "ขั้นที่ {current}/{total}",
      categoryQuestion: "วันนี้จะฟ้องจำเลยเรื่องอะไร?",
      accusationQuestion: "ข้อกล่าวหาหลักคืออะไร?",
      evidenceQuestion: "หลักฐานแน่นแค่ไหน?",
      remorseQuestion: "จำเลยดูสำนึกไหม?",
      readyTitle: "สำนวนครบแล้ว",
      readyCopy: "ศาลพร้อมเคาะโต๊ะ ใครจะรอดใครจะร่วงรู้กัน",
      randomCourt: "สุ่มคดีให้ศาล",
      changeAnswer: "แก้คำตอบ"
    },
    linkInvite: {
      eyebrow: "มีหมายเรียกจากเพื่อน",
      subtitle: "เพื่อนตอบฝั่งแรกไว้แล้ว ตอนนี้ศาลต้องการคำให้การของคุณเพื่อออกคำตัดสินคู่"
    },
    question: {
      progress: "ความคืบหน้า",
      testimony: "คำให้การ",
      item: "ข้อ {current}/{total}",
      player: "ผู้เล่น {player}",
      friendSide: "ฝั่งเพื่อน",
      answerMarks: ["ก", "ข", "ค", "ง", "จ", "ฉ"]
    },
    between: {
      eyebrow: "ฝั่ง A ให้การเสร็จแล้ว",
      title: "ศาลปิดซองคำตอบไว้ก่อน",
      subtitle: "ส่งเครื่องให้ผู้เล่น B ตอบต่อ ผลลัพธ์จะออกพร้อมกันหลังตอบครบ"
    },
    verdict: {
      actionsLabel: "ตัวเลือกหลังตัดสิน",
      header: "ศาลตัดสินเพื่อนสนิท",
      kicker: "MIDNIGHT COURT JUDGMENT",
      judged: "ตัดสินแล้ว",
      waiting: "รอเพื่อน",
      order: "มีคำสั่ง",
      guiltySmall: "% น่าสงสัย",
      suspiciousPercent: "เปอร์เซ็นต์น่าสงสัย",
      compatibility: "ความเข้ากันได้",
      punishment: "บทลงโทษขำ ๆ",
      friendshipStatus: "สถานะมิตรภาพ",
      dailyPrefix: "คดีประจำวัน: {title}",
      shareSetupTitle: "ส่งหมายเรียกให้เพื่อน",
      shareSetupText: "ฝั่งคุณให้การเสร็จแล้ว ส่งลิงก์นี้ให้เพื่อนตอบต่อ ศาลจะรวมหลักฐานจากทั้งสองฝ่าย",
      shareSetupPunishment: "รอศาลตัดสินหลังเพื่อนตอบ",
      shareSetupStatus: "สถานะ: เปิดคดีสำเร็จ",
      soloStatusHigh: "สถานะ: น่าสงสัยแต่น่าเอ็นดู",
      soloStatusLow: "สถานะ: มิตรภาพยังใสกิ๊ง",
      duoStatusHigh: "สถานะ: ทีมเดียวกันแบบวุ่นนิด ๆ",
      duoStatusLow: "สถานะ: ควรกินข้าวก่อนคุยต่อ",
      both: "ทั้งคู่"
    },
    verdictCard: {
      plaintiff: "ผู้ฟ้อง",
      defendant: "จำเลย",
      caseTitle: "คดี",
      verdict: "คำพิพากษา",
      punishment: "บทลงโทษ",
      cta: "ส่งคดีนี้ให้เพื่อนเล่นต่อที่ Friend Court",
      guilty: "จำเลยมีความผิด",
      acquitted: "จำเลยพ้นผิด",
      sadReaction: "จำเลยเสียอาการ",
      happyReaction: "จำเลยยิ้มมุมปาก",
      guiltyOrder: "{defendant} มีพิรุธแบบน่าเอ็นดู ศาลสั่งให้รับโทษขำ ๆ เพื่อความสงบของแชตกลุ่ม",
      acquittedOrder: "หลักฐานยังจับ {defendant} ไม่อยู่ ศาลให้พ้นผิดชั่วคราว แต่ขอจับตาในแชตกลุ่มต่อ"
    },
    history: {
      eyebrow: "คลังคำตัดสิน",
      title: "ประวัติศาลเพื่อน",
      totalCases: "คดีที่เล่นแล้ว",
      streak: "สตรีคคดีประจำวัน",
      latestTitle: "ตำแหน่งล่าสุดที่น่าขำ",
      noTitle: "ยังไม่มีตำแหน่ง",
      empty: "ยังไม่มีคำตัดสิน ลองเริ่มคดีแรกได้เลย",
      confirmClear: "ลบประวัติคำตัดสินทั้งหมดใช่ไหม?",
      cleared: "ลบประวัติเรียบร้อย",
      guiltySummary: "น่าสงสัย {percent}%",
      compatibilitySummary: "เข้ากัน {percent}%"
    },
    players: {
      solo: "ผู้เล่น",
      playerA: "ผู้เล่น A",
      playerB: "ผู้เล่น B",
      us: "ฝั่งเรา",
      friend: "ฝั่งเพื่อน"
    },
    share: {
      solo: "ศาลเพื่อนตัดสินแล้ว: {caseTitle} | {title} | น่าสงสัย {guilty}% | {punishment}",
      duo: "ศาลเพื่อนตัดสินแล้ว: {caseTitle} | {title} | A {a}% B {b}% | เข้ากัน {compatibility}%",
      invite: "มีหมายเรียกจากศาลเพื่อนสนิท: {caseTitle} มาตอบฝั่งของเธอหน่อย {url}",
      verdict: "ศาลตัดสินแล้ว! ฉันได้ผลว่า: {verdictTitle} ในคดี {caseTitle} ลองมาให้ศาลตัดสินบ้าง: {url}",
      defendantVerdict: "ฉันส่งฟ้องคุณใน Friend Court แล้ว ⚖️ มาดูคำพิพากษา: {url}",
      site: "คดีนี้ใครผิด? ฟ้องเพื่อน แล้วให้ศาลลับกลางคืนตัดสินคดีไร้สาระแบบขำ ๆ {url}"
    },
    toast: {
      copied: "คัดลอกเรียบร้อย",
      shareCopied: "คัดลอกคำฟ้องแล้ว ส่งให้จำเลยได้เลย",
      copyFailed: "คัดลอกอัตโนมัติไม่ได้ ลองเลือกข้อความจากการ์ดแทน",
      imageSaved: "ดาวน์โหลดรูปภาพแล้ว",
      imageShareReady: "สร้างรูปภาพเรียบร้อย เลือกบันทึกจากหน้าต่างแชร์",
      imageOpened: "เปิดรูปแล้ว แตะค้างที่รูป แล้วเลือกบันทึกรูปภาพ",
      imageShareFallback: "แตะค้างที่รูปเพื่อบันทึก แล้วนำไปแชร์ในแชทหรือสตอรี่",
      imagePopupBlocked: "กรุณาอนุญาต popup แล้วลองใหม่ หรือกดค้างที่รูปเพื่อบันทึก",
      imageBuildFailed: "ไม่สามารถสร้างรูปภาพได้ กรุณาลองใหม่",
      shareCancelled: "ยกเลิกการแชร์แล้ว",
      imageFailedCopied: "บันทึกรูปไม่สำเร็จ เลยคัดลอกข้อความแชร์ให้แทน",
      imageFailed: "บันทึกรูปไม่สำเร็จ ลองใช้ปุ่มแชร์ข้อความแทน",
      storageFailed: "พื้นที่บันทึกเต็มหรือถูกปิดไว้"
    },
    export: {
      footer: "Friend Court — ศาลตัดสินเพื่อนสนิท",
      disclaimer: "เพื่อความบันเทิงเท่านั้น"
    },
    dateLocale: "th-TH"
  },
  en: {
    appTitle: "Friend Court",
    pageTitle: "Friend Court — Midnight Friendship Court",
    appBadge: "MIDNIGHT FRIEND COURT",
    labels: { language: "Language" },
    languageOptions: { th: "🇹🇭 ศาลไทย", en: "🇬🇧 English Court" },
    nav: { history: "History", home: "Home" },
    landing: {
      eyebrow: "⚡ Who’s sus tonight?",
      subtitle: "Answer fast. Get judged. Drop the verdict in the group chat.",
      previewTitle: "Hot Case Files",
      previewSubtitle: "Tiny crimes. Big friend energy.",
      hookTitle: "Send a Court Summons",
      hookCopy: "Pick a case and send it to the most suspicious friend in the group chat.",
      recommendedTitle: "Court-Recommended Cases",
      recommendedSubtitle: "Choose the case that sounds most like your group chat, then let court begin.",
      docketTitle: "Read, No Reply",
      docketStamp: "Looks Sus"
    },
    signup: {
      eyebrow: "⚖️ Open Friend Court",
      title: "Sign the Complaint",
      plaintiffLabel: "Plaintiff name",
      plaintiffPlaceholder: "e.g. Mina",
      defendantLabel: "Defendant name",
      defendantPlaceholder: "e.g. Ohm",
      required: "The court needs both plaintiff and defendant names first.",
      start: "⚖️ Start the Case"
    },
    buttons: {
      solo: "Play Solo",
      duo: "File a Friend Case",
      daily: "Daily Chaos",
      history: "Case History",
      shareSite: "Share This Site",
      copySiteLink: "Copy Site Link",
      randomFriendCase: "Random Friend Case",
      sueFriendNow: "File a Case Now",
      randomCase: "Random Case",
      fileThisCase: "File This Case",
      copyVerdict: "Copy Verdict",
      judgeCase: "⚖️ Judge Case",
      sendToDefendant: "📨 Share Verdict",
      saveVerdictImage: "📸 Save Verdict",
      restartCase: "🔁 New Case",
      duoSame: "Same Phone Trial",
      duoLink: "Send Court Link",
      acceptLink: "Give My Statement",
      nextPlayer: "Bring in Player B",
      copyFriendLink: "Copy Summons Link",
      shareText: "Share Verdict",
      copyLink: "🔗 Copy Link",
      saveImage: "Save Evidence PNG",
      iphoneSaveHelp: "On iPhone, choose Save Image from the share sheet or touch and hold the image to save.",
      playAgain: "New Case",
      home: "Back to Court",
      clearHistory: "Clear History"
    },
    modes: {
      eyebrow: "Pick your courtroom chaos",
      title: "One case. Two suspicious sides.",
      sameDesc: "Player A answers first. Their verdict stays sealed like forbidden tea.",
      linkDesc: "Answer your side, then send the summons link to your friend."
    },
    cases: {
      eyebrow: "Friend Court Files",
      title: "Pick a Case",
      intro: "Choose the one that feels illegally accurate.",
      linkIntro: "Your friend opened the case. Your turn to look innocent.",
      caseNo: "CASE"
    },
    caseFlow: {
      eyebrow: "Choose the File",
      title: "A Tiny Court Interrogation",
      intro: "Answer a few things and the court will judge.",
      plaintiff: "Plaintiff",
      defendant: "Defendant",
      random: "Random Case",
      selected: "Selected case",
      step: "Step {current}/{total}",
      categoryQuestion: "What are you filing today?",
      accusationQuestion: "What is the main accusation?",
      evidenceQuestion: "How strong is the evidence?",
      remorseQuestion: "Does the defendant look sorry?",
      readyTitle: "The file is ready",
      readyCopy: "Court is ready to slam the stamp.",
      randomCourt: "Let Court Randomize",
      changeAnswer: "Change answers"
    },
    linkInvite: {
      eyebrow: "You’ve been summoned",
      subtitle: "Your friend already testified. The court needs your side before the final roast."
    },
    question: {
      progress: "Progress",
      testimony: "Statement",
      item: "Exhibit {current}/{total}",
      player: "Player {player}",
      friendSide: "Friend side",
      answerMarks: ["A", "B", "C", "D", "E", "F"]
    },
    between: {
      eyebrow: "Player A has spoken",
      title: "That answer is sealed in a tiny vault",
      subtitle: "Pass the device to Player B. The chaos reveals itself after both sides answer."
    },
    verdict: {
      actionsLabel: "Verdict actions",
      header: "Friend Court",
      kicker: "MIDNIGHT COURT JUDGMENT",
      judged: "VERDICT",
      waiting: "PENDING",
      order: "ORDERED",
      guiltySmall: "% sus",
      suspiciousPercent: "Sus Score",
      compatibility: "Friend Sync",
      punishment: "Court-Ordered Punishment",
      friendshipStatus: "Friendship Vibe",
      dailyPrefix: "Daily Chaos: {title}",
      shareSetupTitle: "Summons Sent",
      shareSetupText: "Your side is locked. Send the link and let your friend enter the courtroom.",
      shareSetupPunishment: "Final verdict pending. Friend must appear first.",
      shareSetupStatus: "Friendship Vibe: case opened",
      soloStatusHigh: "Friendship Vibe: cute but sus",
      soloStatusLow: "Friendship Vibe: clean record",
      duoStatusHigh: "Friendship Vibe: chaotic co-op",
      duoStatusLow: "Friendship Vibe: feed them first",
      both: "Both besties"
    },
    verdictCard: {
      plaintiff: "Plaintiff",
      defendant: "Defendant",
      caseTitle: "Case",
      verdict: "Verdict",
      punishment: "Sentence",
      cta: "Send this case to a friend at Friend Court",
      guilty: "Defendant is guilty",
      acquitted: "Defendant is cleared",
      sadReaction: "Defendant is losing composure",
      happyReaction: "Defendant looks smug",
      guiltyOrder: "{defendant} is suspicious in a charming way. The court orders a funny sentence for group chat peace.",
      acquittedOrder: "The evidence cannot catch {defendant} today. The court clears the defendant for now, but the group chat is watching."
    },
    history: {
      eyebrow: "Verdict Vault",
      title: "Court Receipts",
      totalCases: "Cases Judged",
      streak: "Daily Streak",
      latestTitle: "Latest Title Drop",
      noTitle: "No title yet",
      empty: "No verdicts yet. Go create evidence.",
      confirmClear: "Clear the whole receipt vault?",
      cleared: "History cleared",
      guiltySummary: "{percent}% sus",
      compatibilitySummary: "{percent}% friend sync"
    },
    players: {
      solo: "Player",
      playerA: "Player A",
      playerB: "Player B",
      us: "Our side",
      friend: "Friend side"
    },
    share: {
      solo: "Friend Court judged me in {caseTitle}. Verdict: {title}. Sus score: {guilty}%. Sentence: {punishment}",
      duo: "Friend Court ruled on {caseTitle}: {title}. A is {a}% sus, B is {b}% sus, friend sync {compatibility}%.",
      invite: "Friend Court summons you for {caseTitle}. Enter the courtroom: {url}",
      verdict: "Friend Court has judged me: {verdictTitle} in {caseTitle}. Try your case here: {url}",
      defendantVerdict: "I filed a Friend Court case against you ⚖️ See the verdict: {url}",
      site: "Who is guilty? File a silly friend case and let Midnight Court decide. {url}"
    },
    toast: {
      copied: "Copied",
      shareCopied: "Complaint copied. Send it to the defendant.",
      copyFailed: "Copy failed. The court suggests manual screenshot energy.",
      imageSaved: "PNG image downloaded",
      imageShareReady: "Image created. Choose Save Image from the share sheet.",
      imageOpened: "Image opened. Touch and hold it to save.",
      imageShareFallback: "Touch and hold the image to save it, then share it to chat or stories.",
      imagePopupBlocked: "Please allow popups and try again, or touch and hold the image to save.",
      imageBuildFailed: "Could not create image. Please try again.",
      shareCancelled: "Share cancelled",
      imageFailedCopied: "PNG failed, so the share text got copied instead.",
      imageFailed: "PNG failed. Share the text receipt instead.",
      storageFailed: "Storage is full or disabled"
    },
    export: {
      footer: "Friend Court — Midnight Court Files",
      disclaimer: "For entertainment only"
    },
    dateLocale: "en-US"
  }
};

const caseTranslations = {
  "read-no-reply": {
    title: "The Read But No Reply Case",
    desc: "The receipt says read. The reply is still missing.",
    level: "Chat Ghost 7/10",
    questions: [
      ["A message pops up while you are free. What do you do?", ["Reply with one complete tiny sentence", "Read it and rehearse the reply mentally", "Exit and let the read receipt take the blame", "Send a sticker face as a time buffer"]],
      ["It says read, but your friend is still waiting. What are you thinking?", ["I should answer before I forget again", "The first line must be perfect", "If I stay quiet, maybe nobody notices", "I should reply after I finish chewing"]],
      ["Your friend types “you there?” What do you send?", ["I am here. Sorry, I forgot to reply", "I was literally about to answer", "Act like I just saw it", "Send a sweet drink photo and say charging up"]],
      ["What evidence explains the silent chat?", ["A real pile of notifications", "A thought map longer than the answer", "A blank screen and no excuse", "A snack receipt from the missing minutes"]],
      ["A three-paragraph message arrives. What is your move?", ["Answer point by point like an adult", "Give the case a title first", "Bookmark it for later, and later gets long", "Find a drink because this is court paperwork"]],
      ["How do you make up for cooling the chat?", ["Answer everything without over-explaining", "Apologize with exactly one meme", "Return smoothly with “I was busy”", "Offer fries instead of a statement"]]
    ]
  },
  "almost-there": {
    title: "The “Almost There” But Still Home Case",
    desc: "The court needs your shoe status before your location.",
    level: "Suspicious 9/10",
    questions: [
      ["When you type “almost there,” have you touched the front door?", ["Already out and actually on the way", "Putting on the first shoe", "Still choosing a bag, but spiritually arrived", "Buying coffee before getting in the car"]],
      ["Your friend asks for live location. What do you send?", ["Real location with arrival time", "A road photo that looks convincing", "Two more lights, though no lights are visible", "A coffee photo labeled fuel"]],
      ["What does “one sec” mean in this case?", ["Five real clock minutes", "Fifteen minutes with shoe conditions", "Time bends under chat pressure", "One drink queue long"]],
      ["Why are you not out of the house yet?", ["I misjudged getting-ready time", "The keys vanished with background music", "I read the chat and feared the real location", "I got hungry and had to protect my mood"]],
      ["You arrive late. What is your opening line?", ["Sorry, I left late", "Let me tell the adventure from the front door", "Smile and ask if we started", "Present snacks as reduced sentence paperwork"]],
      ["How will you stop making friends wait next time?", ["Report the real time while still home", "Name an alarm “do not say almost there”", "Mute chat until I am truly out", "Meet at a snack shop I can run to"]]
    ]
  },
  "food-choice": {
    title: "The Cannot Pick a Restaurant Case",
    desc: "The meeting lasts longer than the meal.",
    level: "Hungry 10/10",
    questions: [
      ["Your friend asks “what should we eat?” How do you open court?", ["Suggest one place with two reasons", "Open maps and call an emergency meeting", "Go silent because hunger deleted language", "Ask whether fried food exists"]],
      ["The suggested place has mid reviews. What do you do?", ["Check the main menu and decide", "Read reviews like witness testimony", "Send only “hmm” and freeze the room", "Scroll to dessert photos first"]],
      ["What is a valid reason to reject a restaurant?", ["Someone truly cannot eat there", "The table lighting fails my heart standard", "No clear reason, just the vibe says no", "Too few snacks for friendship"]],
      ["If you must choose in 10 seconds, what is your rule?", ["Distance, price, menu, done", "Pick the name with the best aura", "Give voting power to the hungriest person", "Pick the place with the clearest fries"]],
      ["Your friends start saying “just choose.” What do you do?", ["Summarize three options for a vote", "Create a poll called Lunch Court", "Hope someone else makes the call", "Suggest a snack break before judgment"]],
      ["What ending closes the meal case nicely?", ["Everyone is full with no resentment", "We gain a new place to debate next time", "I survive without admitting I slowed us down", "Dessert becomes the final stamp"]]
    ]
  },
  "game-ghost": {
    title: "The Invited Us to Game Then Vanished Case",
    desc: "The lobby aged while the host disappeared.",
    level: "Silent Lobby 8/10",
    questions: [
      ["How ready are you when you invite everyone to play?", ["Game open, waiting in party", "Customizing the character with dignity", "Online, but inside another game", "Waiting for snacks before round one"]],
      ["The team is ready but you are not in. What are you doing?", ["Join the room as soon as I see it", "Tuning the mic like a stage show", "Saw the invite and hid in settings", "Pouring snacks into a bowl for free hands"]],
      ["How long has your “one more round” ever lasted?", ["I leave after that round", "One round with overtime and rematch", "Long enough that friends stop counting", "Until the snack bag is empty"]],
      ["Your friend asks “where did you go?” What do you answer?", ["Sorry, I was stuck in another game", "I got lost in the settings maze", "The internet is weird, then go quiet", "I grabbed water and found extra snacks"]],
      ["You enter late and the team complains. How do you apologize?", ["Ready up and stop delaying", "Spam apology emotes until the screen shakes", "Mute because cross-examination is scary", "Announce that supplies are ready"]],
      ["What evidence do you bring to Game Court?", ["Online history open for inspection", "A new skin that truly took time", "A chat “one sec” with no timestamp", "A snack bag beside the keyboard"]]
    ]
  },
  "clip-storm": {
    title: "The Sent 12 Videos in a Row Case",
    desc: "The phone buzzed like an emergency meeting.",
    level: "Meme 12/10",
    questions: [
      ["Does the first video need context?", ["Add a caption with the exact part to watch", "Write “this first” and keep sending", "Let the video explain itself", "Add “watch while eating”"]],
      ["Why did video number seven arrive?", ["It really continues the topic", "The algorithm opened a portal", "Send first, explain later", "There is a food scene my friend needs"]],
      ["Your friend does not reply after the video storm. What do you assume?", ["They probably have no time yet", "I should send a highlight to help", "Silence means they are watching", "The food review made them hungry"]],
      ["If the court allows one video only, how do you choose?", ["Pick the most relevant one", "Pick the one that wakes the chat", "Send one playlist link and call it one", "Pick the one with food"]],
      ["How much do you expect your friend to watch?", ["Only the part I marked", "All of it for the lore", "Not all, but they should understand my soul", "During snack break"]],
      ["What is the lesson from video flooding?", ["Make a table of contents", "Label clips “actually important” or “just vibes”", "Stop sending until friends breathe", "End with one snack clip only"]]
    ]
  },
  "sleep-online": {
    title: "The Said Goodnight But Still Online Case",
    desc: "The body is resting. The status is not.",
    level: "Fake Sleepy 8/10",
    questions: [
      ["After typing “sleeping now,” what do you do?", ["Put the phone down and actually sleep", "Scroll three elastic minutes", "Read new chats but fear replying", "Check late-night food menus"]],
      ["Your friend says “weren’t you asleep?” What is your defense?", ["Not asleep yet, sorry I announced early", "My body slept, my soul stayed online", "The status did that by itself", "I woke up thinking about snacks"]],
      ["What keeps you awake?", ["A real thing I need to answer", "Short videos lined up as witnesses", "Replying might create a long chat", "My stomach whispered to the court"]],
      ["If you truly want to sleep, what signal do you send?", ["Say goodnight and leave politely", "Send a high-level sleepy sticker", "Turn off notifications from the universe", "Announce I will sleep after eating"]],
      ["What evidence gets you caught?", ["Online status after “sleeping”", "Liking a post at 1 a.m.", "Reading the chat with no reply again", "Sending a midnight food review"]],
      ["What should the court order before bedtime?", ["Say sleeping only when actually sleeping", "Set an app shutdown ceremony", "Do not read chats and leave them in a dream", "Prepare water first so you stop scrolling"]]
    ]
  },
  "anything-but-no": {
    title: "The “Anything Is Fine” But Rejects Everything Case",
    desc: "The phrase has hidden terms and conditions.",
    level: "Particular 9/10",
    questions: [
      ["What hidden condition lives inside your “anything is fine”?", ["I can name two acceptable places", "I want my friend to guess correctly", "I avoid choosing by creating fog", "Anything crispy will do"]],
      ["Your friend suggests the first place. How do you reject it?", ["It is too crowded, honestly", "Nice, but today’s energy says no", "Think silently instead of answering", "It lacks the fried thing in my heart"]],
      ["If asked what you actually want, what do you say?", ["Near, fair price, many menu options", "Somewhere that feels right but cannot be explained", "Let me think, then vanish into reviews", "A place with dessert built in"]],
      ["Your friend is tired of “anything.” What do you do?", ["Offer three options immediately", "Create an emergency poll called Pick For Me", "Stay still and hope the case passes", "Buy snacks to calm the meeting"]],
      ["What kind of place gets your instant yes?", ["Easy to reach and everyone can eat", "A name that sounds like content", "Someone else chose, so I am safe", "Snack menu stronger than the sign"]],
      ["What phrase should the court ban temporarily?", ["No “anything” if you have conditions", "No “I’m fine” with a not-fine face", "No slow replies that make friends guess", "No using fried food as the only reason"]]
    ]
  },
  "wake-at-meet": {
    title: "The 10 AM Plan, 10 AM Wake-Up Case",
    desc: "On time, but only for starting life.",
    level: "Alarm Lost 10/10",
    questions: [
      ["It is 10 AM and you just woke up. What do you do?", ["Tell friends immediately", "Rise like a secret mission begins", "Stare at chat, then disappear to shower", "Grab bread for strength to confess"]],
      ["Why did the alarm fail?", ["I set the wrong day", "I dreamed I already turned it off", "The phone rang but my soul declined", "Empty stomach blocked the signal"]],
      ["What is your first message after waking?", ["Sorry, woke up late, rushing now", "Almost there, meaning almost starting", "One sec, then vanish to get dressed", "Want me to bring peace offerings?"]],
      ["How do you get ready after oversleeping?", ["Cut every unnecessary step", "Rush but still choose a proper outfit", "Do not read chat until ready to leave", "Buy coffee because life just booted"]],
      ["What evidence reduces your sentence?", ["Ten alarm screenshots", "Official-level bed hair", "No evidence, only silence", "Breakfast bag of a very rushed person"]],
      ["How do you prevent this next time?", ["Two alarms and earlier sleep", "Let friends call like court opening", "Request afternoon plans for peace", "Meet at breakfast so the smell wakes me"]]
    ]
  },
  "drop-topic": {
    title: "The Opened a Topic Then Disappeared Case",
    desc: "Left “I’ll tell you later” in the middle of court.",
    level: "Cliffhanger 10/10",
    questions: [
      ["Why did you start with “I’ll tell you later”?", ["I need to organize the story", "The chat needed suspense music", "Life dragged me elsewhere", "I needed a snack prop first"]],
      ["Friends ask “can you tell us now?” What do you do?", ["Tell the short version now", "Say it is complicated and ask for more time", "Let the mystery work", "Finish chewing before the plot"]],
      ["What kind of topic do you usually open?", ["A real story that needs careful wording", "A tiny thing with trailer energy", "A story with no clear ending yet", "Something that happened near food"]],
      ["If the court gives you one minute, can you tell it?", ["Main point, on time", "Spend half the minute on setup", "Ask to type it out, then disappear", "Tell it while eating, still understandable"]],
      ["What leaves friends hanging the most?", ["I genuinely forget to continue", "I type “so intense” and vanish", "I see the question but am not ready", "I send a snack photo instead of the ending"]],
      ["How do you close the opened-topic case?", ["Return with a three-line summary", "Make a mini table of contents", "Do not type later unless actually free", "Tell it with snacks as waiting compensation"]]
    ]
  },
  "short-story": {
    title: "The “Quick Story” That Took 40 Minutes Case",
    desc: "Intro, expansion, and bonus episode included.",
    level: "Epic 8/10",
    questions: [
      ["You say “quick story.” Where do you begin?", ["At the main event", "At breakfast, for realism", "With a teaser, then hunt for photos", "With what I ate before it happened"]],
      ["Why did the short story become 40 minutes?", ["The details matter", "Every side character has a role", "I pause so much time expands", "There are snack breaks between chapters"]],
      ["Your friend starts losing focus. What do you do?", ["Summarize faster", "Ask “you still listening?” dramatically", "Ignore the signs and continue", "Suggest a water break before the big scene"]],
      ["Which part of your story stretches the most?", ["Cause and timeline", "Dialogue with voice impressions", "The part where I decide what to say", "The food description"]],
      ["If the court asks for a headline, what is it?", ["Misunderstanding caused by missing info", "Ordinary day becomes saga", "Full version coming to chat later", "Snacks saved the day"]],
      ["What is the storyteller sentence?", ["Three sentences before the full version", "Make a trailer and let friends opt in", "No “quick” if there is an intro", "Buy drinks for the listeners"]]
    ]
  },
  "borrow-forget": {
    title: "The Borrowed It and Forgot to Return It Case",
    desc: "Whose house is the evidence in?",
    level: "Missing Evidence 7/10",
    questions: [
      ["When borrowing, did you remember a return date?", ["I noted it immediately", "I thought I would remember because it is obvious", "I remember borrowing, not from whom", "It merged with the snack pile"]],
      ["Where is the borrowed item now?", ["Packed and ready to return", "On a table with layered objects", "Somewhere in my house", "Near the latest snack bag"]],
      ["Your friend asks for it back. What do you say?", ["Sorry, I will return it today", "Explain its journey around my room", "Read, search, then forget to reply", "Ask if they want it back with milk tea"]],
      ["Why do you forget returns?", ["No clear return spot", "It fits my life too well", "I fear admitting I forgot", "Snack bags cover the evidence"]],
      ["If the item is important, what do you do?", ["Return it right away", "Wrap it like premium evidence", "Stop borrowing until memory improves", "Add snacks as care fees"]],
      ["What is the next borrowing rule?", ["Photo the item and return date", "Label it “not mine”", "Do not promise if I cannot return", "Place a return box near the food table"]]
    ]
  },
  "extra-food": {
    title: "The Ordered Extra Food But Said Just a Bite Case",
    desc: "Just a bite somehow became a new dish.",
    level: "Very Full 8/10",
    questions: [
      ["When saying “just a bite,” what do you order?", ["A small shared plate", "A big plate called emotionally small", "Let a friend order so evidence is blurry", "Extra fries because they called my name"]],
      ["Food fills the table. How do you explain it?", ["Admit I ordered too much", "The plate looked smaller in photos", "Ask who wants to help", "Snacks do not count"]],
      ["Friends ask who will finish this. What do you do?", ["Divide it and own my plate", "Declare I will fight for this table", "Arrange plates to buy time", "Start with fries before they cool"]],
      ["The bill arrives. How do you split the extras?", ["Pay for what I pushed", "Invent math that confuses the calculator", "Wait for others to mention the bill", "Offer dessert next time"]],
      ["If food is left, what happens?", ["Pack it and take responsibility", "Hold a takeaway ceremony", "Say we will think later, then go quiet", "Save fries as emergency assets"]],
      ["How should “just a bite” work next time?", ["Name the number of dishes first", "Let friends inspect before ordering", "Do not say bite when I want a set", "Set a separate snack budget"]]
    ]
  },
  "not-hungry": {
    title: "The Not Hungry But Steals Fries Case",
    desc: "“Not hungry” vanished with the fries.",
    level: "Snack 11/10",
    questions: [
      ["When saying “not hungry,” have you checked the menu?", ["I checked myself honestly", "The menu made my heart shake", "I avoid ordering to avoid evidence", "I politely stare at my friend’s fries"]],
      ["How big is your “just one bite”?", ["One real bite with thanks", "One bite with a good camera angle", "I taste and forget counting", "A whole fry zone disappears"]],
      ["Your friend catches you eating their food. What do you say?", ["Sorry, I will order you more", "It walked into my mouth by itself", "Change the subject to sauce", "This dish is court-worthy"]],
      ["If your friend tells you to order your own, what happens?", ["I order a small plate", "Too late, I am bonded to this plate", "Wait until they look away", "Order shared snacks immediately"]],
      ["What is the strongest evidence?", ["I admit I ate several bites", "Sauce on my fingers", "My “not hungry” text from five minutes ago", "The fries visibly dropped"]],
      ["What punishment fits this case?", ["Order my own food from the start", "Carry an official tasting permit", "No “not hungry” while staring at plates", "Buy a shared fries mountain"]]
    ]
  },
  "sticker-only": {
    title: "The Sticker Instead of Answers Case",
    desc: "The court must interpret the sticker face.",
    level: "Mysterious 6/10",
    questions: [
      ["A friend asks a real question. What sticker do you send?", ["Text first, sticker after", "A smile with ten meanings", "A character hiding behind a door", "A food sticker meaning I will reply later"]],
      ["Why answer with stickers?", ["They soften the reply, but need words", "One image carries three paragraphs", "I let the cartoon take responsibility", "Food stickers are easiest to understand"]],
      ["Your friend asks “what does that mean?”", ["Translate it into words", "Send an even stranger sticker", "Disappear because the sticker has spoken", "Say it means hungry, want to eat?"]],
      ["When is sticker-only not enough?", ["Time and place plans", "A friend opening a big case", "When I want to dodge", "When choosing dinner with dessert stickers"]],
      ["What happens after the wrong sticker?", ["Correct it with words", "The chat laughs but the case gets confused", "Pretend it was an accident and vanish", "It becomes a dinner plan"]],
      ["What sticker rule should court set?", ["Important things need text", "Stickers allowed, but max two in a row", "No hiding behind stickers", "Food stickers allowed at lunch only"]]
    ]
  },
  "memory-weird": {
    title: "The Forgets Important Things, Remembers Nonsense Case",
    desc: "Forgot the plan. Remembers a 2019 meme.",
    level: "Selective Brain 9/10",
    questions: [
      ["What important thing did you recently forget?", ["A time I should have saved", "A plan discussed for three days", "A message I thought I answered", "A restaurant closing day"]],
      ["What useless thing do you remember perfectly?", ["A joke from five years ago", "An outfit from a rainy day", "A line someone teased me with", "A menu nobody liked"]],
      ["A friend reminds you of an important plan. How do you store it?", ["Calendar immediately", "A weird rhyme so I remember", "Type okay but do not save", "Link it to the restaurant"]],
      ["When asked “do you remember?” What do you answer?", ["I do not, please resend", "I remember it was important, but what?", "Smile silently while loading", "I remember what we ate after"]],
      ["What proves your brain chooses favorites?", ["Forgot the date, remembered Wi-Fi", "Remembered cup color better than time", "Remembered reading, not replying", "Remembered the special menu price"]],
      ["How should you improve memory?", ["Write it now, not later", "Name reminders something funny", "Confirm with proof I saved it", "Link it to food, but still write it"]]
    ]
  },
  "playlist-judge": {
    title: "The Played a Song and Everyone Went Silent Case",
    desc: "The car DJ made the court request a pause.",
    level: "Odd Beat 7/10",
    questions: [
      ["How confident are you with the first song?", ["Check everyone’s vibe first", "Play a secret song the world needs", "Ask no one and stare out the window", "Pick a song based on the restaurant"]],
      ["Everyone goes quiet. What do you think?", ["Maybe this is not the vibe", "They are absorbing the art", "Silence means no objection", "We need a dinner song"]],
      ["A friend asks to skip. What do you do?", ["Skip and let someone else choose", "Ask for ten more chorus seconds", "Pretend not to hear", "Trade it for a snack stop"]],
      ["What song do you sneak into playlists?", ["One that fits the moment", "An indie song with a very long title", "A song nobody knows and no explanation", "A snack commercial from memory"]],
      ["If you stay DJ, what rule do you set?", ["Everyone adds one song", "Five-minute weird song trial", "No explaining, music will prove itself", "Snack break song in the middle"]],
      ["What punishment fits a silent-car DJ?", ["Vote before playing", "Write a warning label for each song", "Lose Bluetooth control for one trip", "Only play snack-shop songs near arrival"]]
    ]
  },
  "photo-delay": {
    title: "The Took 40 Photos, Sent 2 Case",
    desc: "The evidence exists, but not in public.",
    level: "Photo Pending 8/10",
    questions: [
      ["Why did you send only two of forty photos?", ["Still choosing the best ones", "Editing light like a contest entry", "Forgot the album exists", "Edited food photos first"]],
      ["Your friend asks for photos. How do you open the gallery?", ["Send the whole album", "Say it must pass quality control", "Search but forget to send", "Send dessert photos as a teaser"]],
      ["Why are some photos detained?", ["Blur or closed eyes", "The angle is not worthy", "Sending means explaining every photo", "A dish blocked the frame"]],
      ["What is your photo delivery system?", ["Make an album link", "Send one by one with commentary", "Wait for three reminders", "Separate people and food albums"]],
      ["A friend needs a story photo now. What do you do?", ["Send three usable photos", "Edit fast but beautifully", "Say one sec and vanish into gallery", "Send a drink photo first"]],
      ["What should the court order?", ["Send raw photos before edits", "Set an album deadline after getting home", "No “I’ll send later” before opening gallery", "Edit food after people photos"]]
    ]
  },
  "group-chat-lurker": {
    title: "The Reads the Group Chat, Never Replies Case",
    desc: "Present at every hearing, silent on record.",
    level: "Quiet 9/10",
    questions: [
      ["The group asks for opinions. What do you do?", ["Reply with a clear choice", "React like a secret vote", "Read everything and put the phone down", "Appear only when food is mentioned"]],
      ["Why do you rarely type in the group?", ["I wait to avoid repeating info", "The chat moves like a river", "Quiet feels safer", "Restaurant talk gives me power"]],
      ["Someone tags you. What happens?", ["Answer okay or not okay", "Send one line that wakes the chat", "Need a moment before replying", "Ask what we eat after"]],
      ["How do you help silently?", ["Remember details after reading", "Audit the timeline in my head", "Type nothing but keep evidence", "Save every restaurant mentioned"]],
      ["If a vote closes in one minute?", ["Vote and confirm", "Pick the option with content energy", "Wait for the majority", "Pick the one nearest food"]],
      ["What should Group Chat Court order?", ["One sentence when asked", "Reactions allowed, but clear", "Stop being a shadow during decisions", "Summarize food plans after lurking"]]
    ]
  },
  "weather-excuse": {
    title: "The Blames the Weather for Everything Case",
    desc: "Hot means no. Cold means nap. Rain means pause.",
    level: "Forecast Mood 6/10",
    questions: [
      ["It is very hot. How do you use that?", ["Suggest a better time or place", "Declare the sun hostile witness", "Go quiet until friends assume melting", "Suggest air-con and dessert"]],
      ["Rain starts before you leave. What do you do?", ["Tell friends and check a new route", "Send a sky photo like a weather reporter", "Use rain as a reply delay", "Wait it out in a cafe"]],
      ["A tiny chill appears. How much does it affect you?", ["Bring a jacket and go", "Want a blanket and a petition", "Read chat in bed without moving", "Need a warm drink before leaving"]],
      ["A friend says the weather is fine. You say?", ["Okay, original plan then", "Fine for you, cloudy for my soul", "Send weather sticker and go silent", "Fine for sitting, not for walking far"]],
      ["What weather excuse do you use most?", ["Too hot, choose somewhere closer", "Cloudy in a suspicious way", "The sky disagrees, so I pause", "This weather calls for fried food"]],
      ["What solution does Weather Court approve?", ["Check forecast and offer backup", "Rate weather before choosing activity", "Do not use weather instead of answers", "Pick comfy seats with cold drinks"]]
    ]
  },
  "battery-one": {
    title: "The 1% Battery During Important Chat Case",
    desc: "Power vanishes exactly when court calls.",
    level: "Mystery Battery 8/10",
    questions: [
      ["Your battery is 1% during an important question. What do you do?", ["Send the main answer before blackout", "Send a long message that makes the battery nervous", "Read and hope the phone dies with dignity", "Find a cafe table near an outlet"]],
      ["Why is the battery this low?", ["Forgot to charge, my fault", "Photos and maps exhausted it", "Saw the warning and swiped it away", "Spent too long reading menus"]],
      ["Before shutdown, what do you send?", ["Time, place, and final answer", "A rushed voice note like breaking news", "One “later” and the screen goes dark", "Location of a place with outlets"]],
      ["Friend asks why no power bank. What do you say?", ["I forgot and will carry one", "Today’s bag rejected extra energy", "Silent because the phone truly died", "Borrow an outlet with snacks"]],
      ["Is your 1% evidence believable?", ["Screenshot before death", "History of red battery behavior", "No proof because proof died", "Cafe receipt from the outlet hunt"]],
      ["What should Battery Court order?", ["Answer important chats before opening other apps", "Charge reminder at 20%", "No hiding behind dead battery", "Reserve outlet seats with snacks"]]
    ]
  },
  "map-confident": {
    title: "The Confident Navigator Who Got Everyone Lost Case",
    desc: "The volume was high. The accuracy was low.",
    level: "Wrong Turn 9/10",
    questions: [
      ["Why did you say “this way for sure”?", ["I have been here and remember landmarks", "This direction has an aura", "I did not want to admit maps were loading", "I remember a snack shop this way"]],
      ["GPS says one way, your heart says another. What wins?", ["Check GPS and ask friends", "Trust instinct and announce confidence", "Keep walking silently and hope", "Choose the route with food"]],
      ["When you start getting lost, what face do you make?", ["Admit we may be wrong", "Call it a scenic route", "Open maps secretly", "Point at a shop and request a food break"]],
      ["Friends ask how many minutes left. What do you answer?", ["The real map estimate", "Almost there, with a smaller voice", "Avoid by asking if they are tired", "Near food first, destination later"]],
      ["What landmark do you use?", ["Street names and real signs", "A colored building that may no longer exist", "A vague memory from last year", "The smell of a snack shop"]],
      ["What should Navigation Court order?", ["Open maps before saying sure", "Give confidence in percentages", "Do not go silent when lost", "Lost is allowed with a clear food stop"]]
    ]
  },
  "voice-note-long": {
    title: "The 5-Minute Voice Note for “Okay” Case",
    desc: "The court needs headphones for this testimony.",
    level: "Long Audio 8/10",
    questions: [
      ["Why did “okay” become five minutes?", ["I wanted to explain conditions", "I started talking and found new points", "Typing was too much, so voice took over", "My hands were busy holding snacks"]],
      ["Before sending a long voice note, do you think of the listener?", ["Yes, I add a summary", "They will love this podcast", "Send first, discuss later", "Hope the snack bag is not too loud"]],
      ["Friend replies “summary?” What do you do?", ["Type one line summary", "Tell them to start at minute three", "Think I will summarize later", "Send summary and ask what to eat"]],
      ["Which part should be cut?", ["Thinking pauses", "Intro longer than the point", "Silence while I do something else", "Chewing that is not evidence"]],
      ["If the court limits you to 20 seconds?", ["Main point and final answer", "Talk fast like a train announcement", "Send two 20-second clips", "Finish eating first for clarity"]],
      ["What punishment fits long voice notes?", ["Attach a summary every time", "Give every voice note an episode title", "No voice note for just okay", "Buy drinks for the listener"]]
    ]
  },
  "same-outfit": {
    title: "The “Casual Outfit” But Overdressed Case",
    desc: "Everyone defines casual differently.",
    level: "Too Ready 7/10",
    questions: [
      ["What does casual mean in your heart?", ["Comfortable and right for the place", "Casual, but styled in layers", "I did not answer dress code but prepared hard", "An outfit that looks good with dessert"]],
      ["Friends see you overdressed. What do you say?", ["Sorry, I misunderstood casual", "This is ceremonial casual", "Smile and change the subject", "Ask if we take photos before eating"]],
      ["Why did outfit planning take so long?", ["I wanted to match the activity", "Every accessory has a job", "I did not want to admit I cared", "I chose based on the restaurant"]],
      ["The group says you stand out. What do you do?", ["Listen and remove one accessory", "Announce Fashion Court is open", "Stand in the back to reduce drama", "Use a snack bag as a shared prop"]],
      ["How will the group photo look?", ["Everyone looks like one team", "I look like a special guest", "I hide but the outfit still shines", "My outfit matches the dessert table"]],
      ["What dress code rule comes next?", ["Agree on effort level before meeting", "Send a moodboard", "No silence then overdressing", "Choose clothes you can eat in"]]
    ]
  },
  "queue-escape": {
    title: "The Held My Place Then Vanished Case",
    desc: "Returned cheerful just as the queue moved.",
    level: "Queue Panic 8/10",
    questions: [
      ["Your friend holds the queue. Where did you go?", ["A nearby errand with a clear return time", "Browsing until time melted", "Assumed the line was slow and gave no update", "Bought snacks and came back"]],
      ["Friend calls when the queue is near. How do you answer?", ["Answer and return immediately", "Answer with shopping bags rustling", "Miss the call because I am inside a shop", "Ask if they want anything"]],
      ["You return just in time. What face do you make?", ["Apologize and take over", "Act like this was the plan", "Slide back in quietly", "Offer snacks as queue rent"]],
      ["Why did you dare leave?", ["Misread the line speed", "Believed queues move like drama scenes", "Trusted friends to handle it", "The nearby snack shop was too tempting"]],
      ["If you leave again, what should you do?", ["State time and destination", "Send live updates like a reporter", "Do not leave if I know I wander", "Buy food for the person waiting"]],
      ["What should Queue Court order?", ["Stand through one full queue", "Hold a sign saying I am back for real", "No disappearing without a return time", "Pay snack tax to the queue holder"]]
    ]
  },
  "spoiler-soft": {
    title: "The “Not Spoiling” Spoiler Case",
    desc: "Just a little hint, somehow the whole plot.",
    level: "Soft Reveal 9/10",
    questions: [
      ["You say no spoilers. What comes out?", ["Only genre and feeling", "Enough hints for friends to connect dots", "Stop mid-sentence suspiciously", "Mention how good the food scene is"]],
      ["A friend covers their ears. What do you do?", ["Stop and change topic", "Whisper “just a little”", "Continue in chat instead", "Suggest popcorn as emotional repair"]],
      ["What is a safe review?", ["Rating without plot", "Atmosphere that almost reveals the twist", "Trailer link and let them guess", "Review food in the story"]],
      ["Where is the line between hint and spoiler?", ["If they can guess the ending, too far", "If their eyes widen, near the line", "If I say “not telling,” danger", "Talking about food is safer"]],
      ["You are excited but your friend has not watched. How do you vent?", ["Write it down and wait", "Talk in a separate watched-it chat", "Send a crying sticker with no explanation", "Eat and talk only vibes"]],
      ["What is the soft-spoiler punishment?", ["Ask permission before every detail", "Say review, not recap", "No “tiny hint” if it is important", "Buy apology popcorn"]]
    ]
  },
  "borrow-charger": {
    title: "The Borrowed Charger Settled Down Case",
    desc: "The charger became temporary public property.",
    level: "Power Borrowed 7/10",
    questions: [
      ["When borrowing a charger, when do you promise to return it?", ["After enough charge to send messages", "Five more percent with sequels", "No clear promise, it feels warm here", "After ordering food"]],
      ["Where did the charger settle down?", ["Beside my phone, ready to return", "The shared cable table with no owners", "In a bag I cannot find", "Beside snacks and a drink"]],
      ["Your friend is at red battery and asks back. What do you do?", ["Unplug immediately", "Ask for a tiny bit more with puppy voice", "Pretend to search while still plugged in", "Offer an outlet trip with snacks"]],
      ["What is your classic charger excuse?", ["I will unplug for real", "Just a little more to full", "I thought it was communal", "I am charging to read the menu for everyone"]],
      ["If the charger briefly disappears, what do you do?", ["Search until found and apologize", "Map the charger ecosystem", "Stay quiet because I look guilty", "Lure it out with the snack table"]],
      ["What is the next charger rule?", ["Set a return timer", "Label the owner clearly", "Do not borrow if I will leave the outlet", "Carry my own cable and separate snacks"]]
    ]
  },
  "one-more-episode": {
    title: "The One More Episode Until Morning Case",
    desc: "One episode is a unit the court cannot define.",
    level: "Wide Awake 8/10",
    questions: [
      ["What time do you say one more episode?", ["When there is real sleep time left", "When the clock starts judging me", "When friend chats are still unanswered", "When half the snack bag remains"]],
      ["Why did one episode not end?", ["Autoplay happened but I should stop", "The cliffhanger opened court", "I ignored chats to keep focus", "Snacking made autoplay invisible"]],
      ["A friend messages while you watch. What do you do?", ["Pause and answer", "Ask to finish this scene", "Read and wait until episode ends", "Send snack plus screen status"]],
      ["You have a morning plan tomorrow. Still watching?", ["Turn it off for friendship", "Negotiate half an episode", "Pretend not to see the time", "Make a drink instead of sleeping"]],
      ["What proves self-control?", ["Pausing mid-episode", "Finishing without pressing next", "No proof except promises", "Stopping when snacks run out"]],
      ["What should the court order?", ["Set a stop timer before watching", "Let a friend lock the next button", "No one more episode with pending chats", "Limit snacks to one episode"]]
    ]
  },
  "receipt-split": {
    title: "The Bill Split Down to One Meatball Case",
    desc: "Justice begins with the calculator.",
    level: "Exact 6/10",
    questions: [
      ["Where do you start splitting the bill?", ["Separate personal and shared items", "Open calculator like Supreme Court", "Wait for someone else because mistakes scare me", "Circle every shared fried item"]],
      ["One tiny item creates drama. What happens?", ["Ask who ate it fairly", "Open a cents-level court case", "Let it go but remember forever", "Count skewers like evidence"]],
      ["Friends suggest equal split. How do you feel?", ["If everyone agrees, done", "My heart wants a spreadsheet", "Silent, but I remember every menu", "Ask whether snacks count"]],
      ["A mystery dish appears on the bill. What do you do?", ["Ask directly without blaming", "Investigate table photos", "Let it become table folklore", "Take it if I secretly tasted it"]],
      ["What rounding method is acceptable?", ["Round for convenience and tell everyone", "Round to a pretty number", "Round so the case ends fast", "Move the change into shared dessert"]],
      ["What should Bill Court order?", ["Use a split app before confusion", "No tiny-item trial over five minutes", "Say what bothers you, do not store it", "Shared snacks must be declared first"]]
    ]
  },
  "camera-shy": {
    title: "The No Photos But Wants to See Every Photo Case",
    desc: "Not in frame, but quality control is active.",
    level: "Angle Control 7/10",
    questions: [
      ["Why say no photos but ask to see all of them?", ["To confirm I am truly not in them", "I am the post-camera director", "Not in frame, still in control", "To check if the food looks good"]],
      ["A friend hands you the camera. What do you do?", ["Take good photos and send them all", "Direct lighting like a production crew", "Shoot, then dodge my own frame", "Ask if photos happen before or after eating"]],
      ["A friend wants you in the group photo.", ["Join one for friendship", "Choose angle and lighting first", "Stand at the very back", "Hold a drink to look natural"]],
      ["What photo do you approve fastest?", ["Everyone looks good enough", "Magazine-cover angle", "No me in it, so fine", "Food is not blurry"]],
      ["Friends wait while you choose photos. What happens?", ["Pick three and finish", "Compare lighting pixel by pixel", "Say I will check later and disappear", "Ask for a snack break before judging"]],
      ["What is the punishment for photo-control shyness?", ["Join one group photo without rechecking", "Become table photographer", "No asking for all photos if not in frame", "Buy drinks for the photographer"]]
    ]
  },
  "plan-committee": {
    title: "The Planning Group With No Final Plan Case",
    desc: "Group name exists. Energy exists. Decision missing.",
    level: "Loop Meeting 10/10",
    questions: [
      ["What is the first message in the planning group?", ["Goal, date, and budget", "Twelve location links immediately", "Read every idea but decide nothing", "Ask where we eat first"]],
      ["Why does the plan loop?", ["Date and time info is incomplete", "Every place looks too good", "Nobody wants to be the decider", "Restaurant options change everyone’s mind"]],
      ["Someone sends a new link near final decision. What do you do?", ["Check if it fits the goal", "Open a new poll and reset the universe", "React without reading details", "Check nearby food first"]],
      ["If court demands a summary now, what do you summarize?", ["Date, time, place, people", "Backup plans A B C D", "Hand it to the last person who replied", "Book the restaurant first"]],
      ["What proves the group still has hope?", ["Everyone gave available dates", "The group name is too good to abandon", "Everyone is reading, somehow", "The food list is already clear"]],
      ["What should Planning Court order?", ["Set a real decision deadline", "No new links after voting closes", "The group creator must close the case", "Lock dinner first, then the plan moves"]]
    ]
  }
};

const improvedEnglishCaseCopy = {
  "read-no-reply": {
    title: "The Read But No Reply Case",
    desc: "Read receipt is loud. The reply is missing.",
    level: "Ghost Mode 7/10",
    questions: [
      ["A message pops up while you’re free. What’s the move?", ["Reply now, tiny and complete", "Open it and mentally buffer", "Exit fast. Let “read” take the heat", "Sticker face. Emergency delay tactic"]],
      ["It says read. Your friend is waiting. Your brain says?", ["Answer before I become a myth", "First line must be cinematic", "Maybe silence can pass as strategy", "Reply after the snack crunch"]],
      ["Your friend sends “you alive?” You send back:", ["Alive. Sorry, my brain tab crashed", "I was literally typing in spirit", "New phone who dis? But softly", "Drink pic. Hydration as evidence"]],
      ["What’s your defense for the chat blackout?", ["Notification pileup, real receipts", "I drafted a TED Talk in my head", "No defense. Just vibes and shame", "Snack timestamp from the ghost window"]],
      ["A three-paragraph message lands. You:", ["Answer in neat little chunks", "Name the case before replying", "Save for later. Later becomes folklore", "Get a drink. This is paperwork"]],
      ["How do you unfreeze the chat?", ["Reply fully, no lore dump", "One apology meme, not twelve", "Slide back in with “busy day” energy", "Offer fries as emotional damages"]]
    ]
  },
  "almost-there": {
    title: "The “Almost There” But Still Home Case",
    desc: "Location unknown. Shoes also unknown.",
    level: "ETA Fiction 9/10",
    questions: [
      ["When you type “almost there,” where are your shoes?", ["On my feet. I’m actually moving", "One shoe on. We have progress", "Still choosing a bag, spiritually arrived", "At coffee. Fuel is part of travel"]],
      ["Friend asks for live location. You send:", ["Real pin. Real ETA. Clean record", "A road pic with Oscar energy", "“Two lights away” from zero lights", "Coffee photo captioned “in transit”"]],
      ["Your “one sec” usually means:", ["A real five minutes", "Fifteen with outfit turbulence", "Time is a social construct", "One beverage queue"]],
      ["Why haven’t you left?", ["I underestimated getting-ready physics", "Keys entered witness protection", "I feared sharing the real location", "Hunger filed an emergency motion"]],
      ["You arrive late. Opening line?", ["Sorry, I left late. That’s on me", "You won’t believe Act One", "Smile and ask, “did we start?”", "Present snacks as a plea deal"]],
      ["Next time, how do you avoid the lie?", ["Send honest ETA from home", "Alarm titled “do not say close”", "No texting until I cross the door", "Meet somewhere with instant snacks"]]
    ]
  },
  "food-choice": {
    title: "The Cannot Pick a Restaurant Case",
    desc: "The debate lasted longer than lunch.",
    level: "Hungry Council 10/10",
    questions: [
      ["Someone asks “what should we eat?” You:", ["Drop one option with reasons", "Open maps like a war room", "Go silent. Hunger deleted speech", "Ask where the crispy stuff lives"]],
      ["A friend suggests a mid-review place. You:", ["Check menu, decide like an adult", "Read reviews like court transcripts", "Send “hmm” and freeze the timeline", "Skip to dessert pics"]],
      ["A valid restaurant veto is:", ["Someone really can’t eat there", "Lighting has bad aura", "No reason. The vibe said no", "Snack section too weak"]],
      ["Ten seconds to choose. Your method:", ["Distance, price, menu. Done", "Best name wins", "Give power to the hungriest friend", "Follow the fries"]],
      ["Friends say “just pick.” You:", ["Offer three choices and vote", "Create a poll called Lunch Court", "Hope a braver person appears", "Suggest pre-decision snacks"]],
      ["A perfect ending is:", ["Everyone full, no side-eye", "A new place to debate next week", "Nobody proves I caused the delay", "Dessert becomes the stamp"]]
    ]
  },
  "game-ghost": {
    title: "The Invited Everyone to Game Then Vanished Case",
    desc: "Lobby full. Host missing. Suspicious pixels.",
    level: "AFK Energy 8/10",
    questions: [
      ["When you invite the squad, how ready are you?", ["Game open. Party waiting", "Still styling my character", "Online, but in a different universe", "Prepping snacks for better aim"]],
      ["Everyone is ready. You are not. Why?", ["Joining now, my bad", "Mic check became a concert", "Saw invite. Hid in settings", "Snack bowl logistics"]],
      ["Your “one more round” lasts:", ["One round. I have morals", "One round plus emotional overtime", "Until friends stop counting", "Until the chips are gone"]],
      ["Friend asks “where are you?” You say:", ["Stuck in another match, sorry", "Lost in settings, legally", "Internet weird. Then silence", "Got water and bonus snacks"]],
      ["You enter late. The squad complains. You:", ["Ready up immediately", "Apology emote spam", "Mute and avoid cross-exam", "Announce snack supplies are secured"]],
      ["Your best evidence in Game Court:", ["Online history, open for audit", "New skin took serious labor", "A timestamp-free “one sec”", "Keyboard crumbs as proof of prep"]]
    ]
  },
  "clip-storm": {
    title: "The Sent 12 Videos in a Row Case",
    desc: "The phone buzzed like breaking news.",
    level: "Meme Flood 12/10",
    questions: [
      ["Video one needs context. You:", ["Mark the exact funny second", "Write “watch this” and keep firing", "Let chaos explain itself", "Say “watch while eating”"]],
      ["Why did clip seven happen?", ["It continues the evidence", "The algorithm opened a portal", "Send now, explain never-ish", "There was a food cameo"]],
      ["No reply after the clip flood. You assume:", ["They’ll watch later", "They need a highlight reel", "Silence means full attention", "They got hungry"]],
      ["Court allows one video. You pick:", ["The most relevant clip", "The one that revives the chat", "A playlist link and call it one", "The one with snacks"]],
      ["How much should your friend watch?", ["Just the marked part", "All of it. For the lore", "Enough to understand my soul", "During snack break"]],
      ["New rule for video spam?", ["Add timestamps like a civilized meme dealer", "Label: important or vibes", "Let friends breathe between clips", "End with one snack clip"]]
    ]
  },
  "sleep-online": {
    title: "The “Goodnight” But Still Online Case",
    desc: "Body offline. Status very awake.",
    level: "Fake Sleep 8/10",
    questions: [
      ["After “going to sleep,” you:", ["Put phone down for real", "Scroll three stretchy minutes", "Read chats, fear replies", "Check midnight food menus"]],
      ["Friend says “weren’t you asleep?” Defense?", ["Not yet. I announced too early", "Body slept. Soul browsed", "The status acted alone", "Woke up thinking about snacks"]],
      ["What keeps you awake?", ["A real reply I owe", "Short videos forming a line", "Replying would start a saga", "My stomach filed a motion"]],
      ["A true sleep signal is:", ["Goodnight, then vanish properly", "One sleepy sticker, final answer", "Mute the universe", "Sleep after one tiny snack"]],
      ["What exposes you?", ["Online status after goodnight", "Liking posts at 1:07 AM", "Read receipt with no reply", "Midnight food review"]],
      ["Bedtime court order:", ["Say sleep only when sleep is real", "Phone shutdown ceremony", "No reading chats from bed court", "Water first, scroll less"]]
    ]
  },
  "anything-but-no": {
    title: "The “Anything Is Fine” But Says No Case",
    desc: "Hidden terms. No visible menu.",
    level: "Vibe Veto 9/10",
    questions: [
      ["Your “anything is fine” secretly means:", ["I have two acceptable options", "Please guess my exact craving", "I refuse responsibility politely", "Anything crispy"]],
      ["First suggestion arrives. You reject it with:", ["Crowded, honestly", "Good, but not today’s aura", "Typing dots, no answer", "Not enough fried energy"]],
      ["Asked what you actually want, you say:", ["Near, affordable, many options", "Something right. Don’t ask how", "Let me check, then vanish", "Dessert must be built in"]],
      ["Friends are tired. You:", ["Give three real options", "Launch Pick For Me poll", "Stay still and look innocent", "Deploy snacks to calm court"]],
      ["Instant yes restaurant?", ["Easy, everyone can eat", "Name sounds like content", "Someone else chose it", "Snack menu is elite"]],
      ["Court bans one phrase:", ["No “anything” with conditions", "No “I’m fine” face acting", "No slow reply guessing game", "No fried-food-only policy"]]
    ]
  },
  "wake-at-meet": {
    title: "The 10 AM Plan, 10 AM Wake-Up Case",
    desc: "Technically awake. Emotionally late.",
    level: "Alarm Defeat 10/10",
    questions: [
      ["It’s 10 AM. You just woke up. You:", ["Tell the truth immediately", "Rise like a secret agent", "Read chat, disappear to shower", "Grab bread for confession strength"]],
      ["Why did the alarm fail?", ["Wrong day. My fault", "Dream-me turned it off", "My soul declined the ringtone", "Empty stomach blocked signal"]],
      ["First message after waking:", ["Sorry, woke late, rushing now", "Almost there, meaning almost alive", "One sec, then outfit fog", "Need me to bring peace snacks?"]],
      ["Speed-run getting ready means:", ["Cut all optional steps", "Rush, but still style", "Avoid chat until shoes are on", "Coffee because life booted late"]],
      ["Evidence for reduced sentence:", ["Ten alarm screenshots", "Historic bed hair", "No evidence, only silence", "Breakfast bag of shame"]],
      ["Prevention plan:", ["Two alarms, earlier sleep", "Friend calls as court bell", "Only afternoon plans for my brand", "Meet where breakfast smells loud"]]
    ]
  },
  "drop-topic": {
    title: "The Dropped a Bomb Then Disappeared Case",
    desc: "Typed “I’ll tell you later” and left the planet.",
    level: "Cliffhanger 10/10",
    questions: [
      ["Why open with “I’ll tell you later”?", ["Story needs sorting", "Chat needed trailer energy", "Life grabbed me mid-plot", "I needed a snack prop"]],
      ["Friends say “tell us now.” You:", ["Give the short version", "Say “it’s complicated”", "Let suspense marinate", "Finish chewing first"]],
      ["Your usual topic type:", ["Real story, careful wording", "Tiny thing with trailer music", "No ending yet, only smoke", "Something near food"]],
      ["One-minute limit. Can you tell it?", ["Yes. Main point only", "Half the minute is setup", "I’ll type it, then vanish", "Eating while explaining"]],
      ["What makes friends suffer most?", ["I forget the sequel", "I type “OMG” then disappear", "I read the questions and freeze", "Snack photo instead of plot"]],
      ["How do you close the case?", ["Three-line summary", "Mini table of contents", "No “later” unless actually free", "Snacks as waiting compensation"]]
    ]
  },
  "short-story": {
    title: "The “Quick Story” That Became a Podcast Case",
    desc: "Intro, lore, side quest, bonus scene.",
    level: "Lore Dump 8/10",
    questions: [
      ["You say “quick story.” You begin at:", ["The main event", "Breakfast, for context", "A teaser while finding photos", "What I ate before the incident"]],
      ["Why did it hit 40 minutes?", ["Details are evidence", "Every side character matters", "Pauses expanded time", "Snack breaks between chapters"]],
      ["Friend’s focus is leaving. You:", ["Speed-run the summary", "Ask “are you listening?” dramatically", "Continue like a series finale", "Offer water before Act Three"]],
      ["The longest part is:", ["Timeline math", "Dialogue reenactments", "Deciding how to phrase it", "Food description"]],
      ["Court asks for a headline:", ["Misread message caused chaos", "Normal day became saga", "Full cut drops later", "Snacks saved the plot"]],
      ["Storyteller sentence:", ["Three lines before director’s cut", "Trailer first, opt-in after", "No “quick” if there’s lore", "Buy drinks for the audience"]]
    ]
  },
  "borrow-forget": {
    title: "The Borrowed It and Never Returned It Case",
    desc: "The evidence moved into someone’s room.",
    level: "Missing Item 7/10",
    questions: [
      ["When you borrow something, your return plan is:", ["Date set, reminder on", "Soon, in a spiritually close way", "I’ll remember when I see it", "After snacks, probably"]],
      ["Where is the borrowed item now?", ["Packed and ready to return", "On my desk judging me", "Somewhere safe-ish", "Near the snack zone"]],
      ["Friend asks for it back. You:", ["Return it ASAP", "Say “omg yes” with panic", "Search slowly and sweat", "Offer snack interest"]],
      ["Why did you forget?", ["No reminder. My bad", "It blended into my stuff", "I avoided the guilt text", "Food plans distracted me"]],
      ["Best apology evidence:", ["Item cleaned and returned", "Calendar reminder screenshot", "Honest “I forgot”", "Replacement snack tax"]],
      ["New borrowing rule:", ["Return date before taking it", "Photo of item and owner", "No borrowing during chaos era", "Snack debt included"]]
    ]
  },
  "extra-food": {
    title: "The “Just a Bite” But Ordered Extra Case",
    desc: "One bite somehow became a side quest.",
    level: "Snack Math 8/10",
    questions: [
      ["When you say “just a little,” you mean:", ["Actual little. Court-certified", "A flexible little", "Depends if no one watches", "A small plate with big dreams"]],
      ["Why order extra?", ["Everyone might want some", "The menu flirted with me", "I panicked and added sides", "Fries deserve backup"]],
      ["Food arrives huge. You:", ["Share and own the choice", "Call it a community project", "Pretend this was strategic", "Protect the crispy pieces"]],
      ["Friend says you said “tiny.” You:", ["Admit I miscalculated hunger", "Define tiny emotionally", "Change topic to sauce", "Offer first bite as diplomacy"]],
      ["Leftovers happen. Your plan:", ["Pack them properly", "Convince someone it’s fate", "Avoid eye contact with the receipt", "Snack later, obviously"]],
      ["Court-approved next order:", ["Say actual portion size", "Ask group before adding extras", "No hunger-based mystery math", "Order one shared fry pile"]]
    ]
  },
  "not-hungry": {
    title: "The “Not Hungry” But Stole Fries Case",
    desc: "No appetite. Very active fork.",
    level: "Fry Theft 11/10",
    questions: [
      ["You say “not hungry.” Then food appears. You:", ["Still decline politely", "Ask for one tiny taste", "Hover like a snack drone", "Target the fries"]],
      ["Your “one bite” usually is:", ["One bite. Legally clean", "One bite plus context", "Enough to change the plate layout", "The crispy corner"]],
      ["Friend catches you stealing fries. You say:", ["Sorry, I should’ve ordered", "They looked lonely", "I thought this was communal", "Quality control"]],
      ["Why didn’t you order?", ["I truly misread hunger", "Menu timing confused my soul", "I wanted no commitment", "I planned snack sampling"]],
      ["Best repair move:", ["Order your own side", "Replace the fries immediately", "Stop fork activity", "Buy dessert as damages"]],
      ["New food rule:", ["Hungry? Order. Don’t orbit", "One taste means one taste", "No stealth fries", "Shared snacks must be declared"]]
    ]
  },
  "sticker-only": {
    title: "The Stickers Only, No Words Case",
    desc: "The sticker is cute. The answer is unclear.",
    level: "Emoji Court 6/10",
    questions: [
      ["Friend asks a real question. You send:", ["Words first, sticker second", "Sticker that feels accurate", "Mystery bird face", "Snack sticker for comfort"]],
      ["Why avoid words?", ["I’m busy but can answer soon", "Sticker says it better", "Words create responsibilities", "Mouth full, emotionally"]],
      ["Friend misreads the sticker. You:", ["Clarify immediately", "Send a second sticker as evidence", "Let them interpret art", "Send food pic translation"]],
      ["Your go-to sticker mood:", ["Helpful thumbs-up", "Tiny chaos creature", "Blank stare with lore", "Happy snack face"]],
      ["When are stickers acceptable?", ["After a clear answer", "When the chat needs vibes", "When I’m not ready to commit", "When food is the answer"]],
      ["Sticker Court order:", ["Use words for plans", "One sticker, then context", "No sticker-only verdicts", "Snack stickers need subtitles"]]
    ]
  },
  "memory-weird": {
    title: "The Forgot Important Stuff, Remembered Random Lore Case",
    desc: "Plan forgotten. 2019 meme archived perfectly.",
    level: "Selective Brain 9/10",
    questions: [
      ["What do you remember too well?", ["Dates and plans, when written down", "Ancient memes with timestamps", "Drama details but not today’s plan", "Who ordered what last time"]],
      ["What do you forget most?", ["Things without reminders", "Important but boring logistics", "Replying after reading", "Whether I said I was hungry"]],
      ["Friend says “you forgot again.” You:", ["Own it and fix it", "Recite useless lore as proof of brain", "Freeze because they’re right", "Offer snack apology"]],
      ["Your brain saves random info because:", ["It needs better filing", "The useless stuff sparkles", "Pressure deletes useful tabs", "Food memories are sacred"]],
      ["Best evidence you care:", ["Calendar and reminder setup", "Notes titled “do not forget”", "Honest apology, no excuses", "Remember their snack order"]],
      ["Court-approved memory patch:", ["Write plans immediately", "Pin important chats", "No relying on vibes", "Attach snacks to reminders"]]
    ]
  },
  "playlist-judge": {
    title: "The Playlist That Made Everyone Quiet Case",
    desc: "DJ confidence high. Car vibes uncertain.",
    level: "Aux Trial 7/10",
    questions: [
      ["You take the aux. First track is:", ["Something everyone can survive", "My current obsession, no warning", "A risky deep cut", "A song that matches snack shopping"]],
      ["The car goes silent. You:", ["Ask if they want a skip", "Call it an immersive experience", "Pretend silence is respect", "Offer drive-thru as reset"]],
      ["Your playlist logic:", ["Mood, route, group taste", "Main character arc", "Nobody asked, but I felt called", "Songs that make food taste better"]],
      ["Friend says “what is this?” You:", ["Skip with dignity", "Explain the lore", "Turn it down and hide", "Say wait for the chorus, then snacks"]],
      ["Your best DJ evidence:", ["A balanced queue", "One song that becomes a meme", "No evidence, only confidence", "Snack-stop anthem"]],
      ["Aux Court sentence:", ["Ask before experimental tracks", "One weird song per ride", "No trapping friends in album lore", "Playlist must include snack break music"]]
    ]
  },
  "photo-delay": {
    title: "The Took 40 Photos, Sent 2 Case",
    desc: "Gallery full. Friend still waiting.",
    level: "Photo Jail 8/10",
    questions: [
      ["After taking photos, when do you send them?", ["Same day, clean behavior", "After selecting the “best” forever", "When reminded by guilt", "After snack lighting review"]],
      ["Why only two photos?", ["Only two were good", "Curation is an art form", "I forgot the gallery existed", "Food pics got priority"]],
      ["Friend asks for the rest. You:", ["Send all usable ones", "Say “editing” with no edits", "Promise later and vanish", "Send the food shots first"]],
      ["What slows the send?", ["Checking blur and duplicates", "Rating every angle like a museum", "Avoiding my own bad shots", "Comparing snack table lighting"]],
      ["Best apology move:", ["Send a full album link", "Label favorites and extras", "Admit the photo vault problem", "Add one bonus dessert pic"]],
      ["Photo Court order:", ["Send before midnight", "No gallery hostage situation", "Do not say editing if not editing", "Food photos are not enough"]]
    ]
  },
  "group-chat-lurker": {
    title: "The Group Chat Lurker Case",
    desc: "Read everything. Contributed air.",
    level: "Seen Zone 9/10",
    questions: [
      ["A group plan starts. You:", ["Answer availability", "React with tiny emoji support", "Read all, say nothing", "Ask where food fits"]],
      ["Why lurk?", ["I’m checking info first", "Others are faster", "Replying makes me responsible", "I’m waiting for menu details"]],
      ["Someone tags you. You:", ["Answer clearly", "Say “wait I’m reading”", "Panic-react then vanish", "Ask if snacks are involved"]],
      ["Your usual contribution:", ["Useful time or vote", "A reaction at a dramatic moment", "Silent surveillance", "Restaurant suggestion"]],
      ["Court evidence against you:", ["Read receipts everywhere", "Reactions without decisions", "Online but no vote", "Only replies to food words"]],
      ["Group Chat Court order:", ["Answer one concrete thing", "Vote before lurking", "No ghosting every plan", "Food opinions count, but not only food"]]
    ]
  },
  "weather-excuse": {
    title: "The Weather Blamed for Everything Case",
    desc: "Too hot, too cold, too cloudy, too convenient.",
    level: "Forecast Drama 6/10",
    questions: [
      ["It’s hot outside. You:", ["Suggest a cooler route", "Declare the sun a witness", "Go silent until plans melt", "Demand AC and dessert"]],
      ["Rain starts. Your move:", ["Update friends and plan B", "Send sky footage like news", "Use rain to delay replies", "Hide in a cafe"]],
      ["Tiny chill appears. You:", ["Bring jacket and go", "Request blanket-level sympathy", "Read chat from bed", "Need a warm drink first"]],
      ["Friend says weather is fine. You:", ["Okay, plan stays", "Fine for you, stormy for my soul", "Weather sticker, then silence", "Fine for sitting, not walking"]],
      ["Favorite weather excuse:", ["Too hot, choose closer", "Clouds look suspicious", "Sky said pause", "This weather requires fried food"]],
      ["Weather Court solution:", ["Check forecast, offer backup", "Rate weather before activity", "Do not replace answers with clouds", "Pick comfy seats and cold drinks"]]
    ]
  },
  "battery-one": {
    title: "The 1% Battery During Important Chat Case",
    desc: "Power vanished exactly when accountability arrived.",
    level: "Battery Drama 8/10",
    questions: [
      ["Battery hits 1% during a serious question. You:", ["Send the main answer now", "Type a novel and stress the phone", "Read and let the phone die nobly", "Find an outlet cafe"]],
      ["Why is it at 1%?", ["Forgot to charge. Guilty", "Maps and photos drained it", "Ignored every warning", "Menus consumed my battery"]],
      ["Before shutdown, you send:", ["Time, place, final answer", "Voice note like breaking news", "One “later” then darkness", "Outlet location"]],
      ["Friend asks “no power bank?” You:", ["I forgot. I’ll pack one", "Bag rejected extra energy", "Silence because phone truly died", "Borrow outlet plus snacks"]],
      ["Is the 1% believable?", ["Screenshot before death", "Known red-battery lifestyle", "No proof. Proof died too", "Cafe receipt from outlet hunt"]],
      ["Battery Court order:", ["Answer first, scroll later", "Charge reminder at 20%", "No hiding behind dead phones", "Outlets plus snacks are strategy"]]
    ]
  },
  "map-confident": {
    title: "The Confident Navigator Got Everyone Lost Case",
    desc: "Volume high. Accuracy missing.",
    level: "Wrong Turn 9/10",
    questions: [
      ["Why say “this way for sure”?", ["I remember real landmarks", "The street had vibes", "Maps were loading and pride was loud", "I smelled a snack shop"]],
      ["GPS says one way, your heart says another. Winner?", ["GPS plus friend check", "Heart. Loudly", "Keep walking and hope", "Food route"]],
      ["You realize you’re lost. Face?", ["Admit maybe wrong", "Call it scenic", "Open maps secretly", "Point at snacks as distraction"]],
      ["Friend asks ETA. You say:", ["Real map estimate", "Almost there, quieter now", "Are you tired? Deflection", "Food nearby, destination later"]],
      ["Your landmark style:", ["Street names and signs", "A blue building from 2018", "Vague memory cloud", "Smell of bakery"]],
      ["Navigation Court order:", ["Open maps before confidence", "Confidence must have percentage", "No silent wrong turns", "Lost is fine with snack stop"]]
    ]
  },
  "voice-note-long": {
    title: "The 5-Minute Voice Note for “Okay” Case",
    desc: "A tiny answer became a podcast episode.",
    level: "Audio Lore 8/10",
    questions: [
      ["Why did “okay” become five minutes?", ["Conditions needed context", "Talking unlocked side quests", "Typing felt illegal", "Hands full of snacks"]],
      ["Before sending long audio, you:", ["Add a text summary", "Assume they love podcasts", "Send first, explain later", "Hope chewing is not audible"]],
      ["Friend replies “summary?” You:", ["Type one line", "Say start at minute three", "Promise summary later", "Summarize plus ask food plan"]],
      ["What should be cut?", ["Thinking pauses", "Intro longer than point", "Background silence", "Crunching that adds nothing"]],
      ["20-second limit. You:", ["Main point only", "Talk like auctioneer", "Send two clips and pretend it counts", "Finish snack first"]],
      ["Voice Note Court order:", ["Summary required", "Episode titles mandatory", "No voice note for just okay", "Buy listener drinks"]]
    ]
  },
  "same-outfit": {
    title: "The “Casual” Outfit Went Full Main Character Case",
    desc: "Everyone heard casual. You heard premiere.",
    level: "Overprepared 7/10",
    questions: [
      ["Casual means:", ["Comfy and place-appropriate", "Styled but pretending not to be", "Silent dress code, maximum effort", "Dessert-photo compatible"]],
      ["Friends see the outfit. You say:", ["I misunderstood casual", "This is ceremonial casual", "Change topic immediately", "Photos before food?"]],
      ["Why did it take so long?", ["Matching the activity", "Accessories had assignments", "Didn’t want to admit I cared", "Restaurant dictated the fit"]],
      ["Group says you stand out. You:", ["Remove one dramatic item", "Open Fashion Court", "Hide in the back", "Use snack bag as prop"]],
      ["Group photo outcome:", ["Team energy", "Special guest energy", "I hide, outfit glows anyway", "Fit matches dessert table"]],
      ["New dress code rule:", ["Agree effort level first", "Moodboard or chaos", "No silence then runway", "Wear something you can eat in"]]
    ]
  },
  "queue-escape": {
    title: "The Held My Spot Then Vanished Case",
    desc: "Returned cheerful right as the line moved.",
    level: "Queue Panic 8/10",
    questions: [
      ["Friend holds your spot. You go:", ["Nearby errand, clear time", "Browsing until time melts", "Assume line is slow", "Snack run"]],
      ["Queue is close. Friend calls. You:", ["Answer and sprint back", "Answer with bag noises", "Miss it inside a shop", "Ask if they want anything"]],
      ["You return just in time. Face?", ["Apologize and take over", "Act like it was planned", "Slide in quietly", "Offer snack rent"]],
      ["Why leave at all?", ["Misread line speed", "Believed queues move slowly", "Trusted friend too much", "Snack shop was magnetic"]],
      ["Leaving again requires:", ["Destination and return time", "Live updates like news", "No leaving if I wander", "Food for queue holder"]],
      ["Queue Court order:", ["Stand through one full line", "Hold “I’m back for real” sign", "No vanish without ETA", "Pay snack tax"]]
    ]
  },
  "spoiler-soft": {
    title: "The “No Spoilers” Spoiler Case",
    desc: "Just one hint. Somehow the whole plot.",
    level: "Soft Spoil 9/10",
    questions: [
      ["You promise no spoilers. What slips out?", ["Only genre and vibe", "Enough dots to connect", "Stop mid-sentence suspiciously", "Mention the food scene"]],
      ["Friend covers their ears. You:", ["Stop instantly", "Whisper “tiny hint”", "Move spoilers to chat", "Offer popcorn repair"]],
      ["Safe review style:", ["Rating, no plot", "Atmosphere, almost too much", "Trailer link and chaos", "Food review only"]],
      ["Hint becomes spoiler when:", ["They can guess the ending", "Their eyes get huge", "You say “not telling”", "Food talk is safer"]],
      ["You need to vent. You:", ["Write it down for later", "Use watched-it chat", "Send one emotion sticker", "Eat and speak only vibes"]],
      ["Spoiler Court punishment:", ["Ask before details", "Review, don’t recap", "No “tiny hint” loophole", "Buy apology popcorn"]]
    ]
  },
  "borrow-charger": {
    title: "The Borrowed Charger Became Yours Case",
    desc: "Temporary cable. Permanent attachment.",
    level: "Outlet Drama 7/10",
    questions: [
      ["Borrowing a charger, you promise:", ["Return after enough battery", "Five more percent, with sequels", "No promise. It lives here now", "After ordering food"]],
      ["Where is the charger?", ["Beside my phone, ready", "The no-owner cable table", "In a mysterious bag pocket", "Next to snacks"]],
      ["Friend needs it back at red battery. You:", ["Unplug now", "Beg for tiny percent", "Search while still plugged in", "Offer outlet trip and snacks"]],
      ["Classic charger excuse:", ["Unplugging now for real", "Almost full, emotionally", "I thought it was communal", "Charging to read menus for all"]],
      ["Cable briefly disappears. You:", ["Search and apologize", "Map the charger ecosystem", "Stay quiet, look guilty", "Check snack table first"]],
      ["Charger Court rule:", ["Return timer", "Owner label", "No borrowing while wandering", "Carry cable, carry snacks"]]
    ]
  },
  "one-more-episode": {
    title: "The One More Episode Until Sunrise Case",
    desc: "One episode is not a unit of time.",
    level: "Autoplay 8/10",
    questions: [
      ["You say one more episode when:", ["Sleep time still exists", "Clock starts side-eyeing", "Chats are unanswered", "Snack bag is half alive"]],
      ["Why didn’t it stop?", ["Autoplay jumped me", "Cliffhanger opened court", "Ignored chat for focus", "Snacks hid the time"]],
      ["Friend texts mid-episode. You:", ["Pause and reply", "Ask for one scene", "Read, reply after credits", "Send snack + screen status"]],
      ["Morning plan tomorrow. Still watching?", ["Turn it off", "Negotiate half an episode", "Pretend time is fake", "Make a drink instead of sleeping"]],
      ["Self-control proof:", ["Pause mid-episode", "No next button", "Only promises, no proof", "Stop when snacks end"]],
      ["Autoplay Court order:", ["Stop timer before play", "Friend locks next button", "No “one more” with pending chats", "Snacks limited to one episode"]]
    ]
  },
  "receipt-split": {
    title: "The Bill Split Down to One Meatball Case",
    desc: "Justice started with a calculator.",
    level: "Receipt Court 6/10",
    questions: [
      ["Bill split begins with:", ["Personal vs shared items", "Calculator like Supreme Court", "Wait for someone brave", "Circle every fried thing"]],
      ["One tiny item causes chaos. You:", ["Ask who ate it", "Open a cents-level trial", "Let it go, remember forever", "Count skewers as evidence"]],
      ["Equal split suggestion. You feel:", ["Fine if everyone agrees", "Spreadsheet desire rising", "Silent but memorizing menu", "Do snacks count?"]],
      ["Mystery dish appears. You:", ["Ask directly, no blame", "Investigate table photos", "Let it become folklore", "Claim it if I tasted it"]],
      ["Best rounding method:", ["Round and tell everyone", "Round to a pretty number", "Round to end the case", "Move change to dessert fund"]],
      ["Bill Court order:", ["Use split app early", "No five-minute meatball trial", "Say it, don’t store it", "Declare shared snacks first"]]
    ]
  },
  "camera-shy": {
    title: "The No Photos But Let Me See Every Photo Case",
    desc: "Not in frame. Still creative director.",
    level: "Angle Audit 7/10",
    questions: [
      ["Why no photos but request all pics?", ["Confirm I’m not in them", "Post-production director energy", "Off-camera, still in charge", "Check food angle"]],
      ["Friend hands you the camera. You:", ["Take good pics and send all", "Direct lighting like a film set", "Shoot, then dodge the frame", "Ask before or after eating"]],
      ["Group photo request. You:", ["Join one for friendship", "Fix angle first", "Stand in the back", "Hold drink for natural pose"]],
      ["Fastest photo approval:", ["Everyone looks decent", "Magazine angle", "No me, approved", "Food not blurry"]],
      ["Friends wait while you choose. You:", ["Pick three and finish", "Compare pixels", "Say later and disappear", "Snack break before judging"]],
      ["Photo Court punishment:", ["Join one photo, no recheck", "Become table photographer", "No asking for all if you hide", "Buy drinks for photographer"]]
    ]
  },
  "plan-committee": {
    title: "The Planning Group With No Plan Case",
    desc: "Group name? Yes. Decision? Missing.",
    level: "Planning Loop 10/10",
    questions: [
      ["First message in the planning group:", ["Goal, date, budget", "Twelve links immediately", "Read all, decide nothing", "Where are we eating?"]],
      ["Why does the plan loop?", ["Missing date/time info", "Every place looks good", "Nobody wants final boss role", "Restaurant options keep changing minds"]],
      ["New link arrives near decision time. You:", ["Check if it fits", "Open a new poll and reset life", "React without reading", "Check nearby food first"]],
      ["Court demands summary now. You:", ["Date, time, place, people", "Backup plans A to D", "Pass to last person who replied", "Book food first"]],
      ["Proof the group has hope:", ["Everyone sent available dates", "Group name is too good", "Everyone is reading, somehow", "Food list is ready"]],
      ["Planning Court order:", ["Real decision deadline", "No new links after voting", "Group creator closes the case", "Lock dinner, plan follows"]]
    ]
  }
};

Object.assign(caseTranslations, improvedEnglishCaseCopy);

const QUESTION_OPTION_COUNT = 6;

function buildExtraQuestionChoices(questionText) {
  const text = String(questionText || "");
  if (/หลักฐาน|evidence|proof|caught|caught|caught/i.test(text)) {
    return [
      cx("เรียกพยานแชตกลุ่มขึ้นเบิกความ", "Summon the group chat as witness", { drama: 2, honesty: 2, chaos: 1 }),
      cx("ยื่นหลักฐานแบบมั่นใจ แม้ไฟล์ชื่อ final_final", "Submit confident evidence named final_final", { responsibility: 1, drama: 2, chaos: 1 })
    ];
  }
  if (/ศาล|โทษ|คำสั่ง|บทเรียน|แก้|ป้องกัน|ครั้งหน้า|rule|order|sentence|solution|lesson|next time/i.test(text)) {
    return [
      cx("ยอมรับคำสั่งศาล แล้วทำหน้าสำนึกประมาณ 60%", "Accept the order with 60% remorse face", { honesty: 2, responsibility: 2, drama: 1 }),
      cx("ขอลดโทษด้วยของกินและสัญญาว่าจะไม่ทำซ้ำ", "Request reduced sentence with snacks and a promise", { snackEnergy: 3, honesty: 1, responsibility: 1 })
    ];
  }
  if (/กิน|อาหาร|ข้าว|ร้าน|เมนู|ขนม|หิว|จาน|food|eat|snack|menu|restaurant|hungry/i.test(text)) {
    return [
      cx("ขอให้ศาลพักกินก่อนหนึ่งคำแล้วค่อยตอบ", "Ask the court for one bite before answering", { snackEnergy: 3, chaos: 1 }),
      cx("เสนอทางออกที่ทุกคนอิ่มและไม่มีใครต้องรับบทคนเลือก", "Offer a full-belly solution with no chooser burden", { responsibility: 2, snackEnergy: 2, honesty: 1 })
    ];
  }
  if (/แชต|ข้อความ|ตอบ|เพื่อน|พิมพ์|กลุ่ม|chat|message|reply|friend|text/i.test(text)) {
    return [
      cx("ตอบตรง ๆ ก่อน แล้วค่อยส่งมีมปิดท้าย", "Answer clearly first, then close with a meme", { honesty: 2, responsibility: 2, chaos: 1 }),
      cx("เรียกประชุมแชตกลุ่มเพื่อไกล่เกลี่ยแบบวุ่นนิด ๆ", "Call a tiny chaotic group-chat mediation", { drama: 2, chaos: 2, honesty: 1 })
    ];
  }
  if (/เกม|ล็อบบี้|ตา|ออนไลน์|game|lobby|online|round/i.test(text)) {
    return [
      cx("กดพร้อมเล่นทันทีเหมือนมีหมายเรียกศาล", "Ready up like a court summons arrived", { responsibility: 3, honesty: 1 }),
      cx("ขออีกหนึ่งนาทีที่ศาลไม่ค่อยเชื่อ", "Ask for one minute the court barely believes", { chaos: 2, ghosting: 1, drama: 1 })
    ];
  }
  if (/รูป|ถ่าย|กล้อง|photo|camera|picture/i.test(text)) {
    return [
      cx("ส่งรูปก่อนศาลหมดความอดทน", "Send photos before the court loses patience", { responsibility: 3, honesty: 1 }),
      cx("ขอคัดรูปอีกนิดแบบผู้กำกับหลักฐาน", "Curate a little more like evidence director", { drama: 2, chaos: 1, ghosting: 1 })
    ];
  }
  return [
    cx("ขอให้ศาลบันทึกว่าเจตนาดี แต่วิธีทำวุ่น", "Ask the court to note good intent, chaotic method", { honesty: 2, chaos: 2, drama: 1 }),
    cx("โยนให้แชตกลุ่มตัดสิน แล้วทำหน้าไม่รู้ไม่ชี้", "Let the group chat judge and act innocent", { ghosting: 1, drama: 2, chaos: 2 })
  ];
}

const CASE_QUESTION_SETS = {
  "read-no-reply": [
    q("เห็นข้อความเด้งตอนกำลังว่าง คุณทำอะไร?", [
      c("ตอบทันทีด้วยประโยคสั้นแต่ครบ", { honesty: 2, responsibility: 3, ghosting: -1 }),
      c("เปิดอ่านแล้วซ้อมคำตอบในหัว", { chaos: 1, drama: 2, ghosting: 1 }),
      c("กดออกก่อน ให้เครื่องหมายอ่านรับกรรม", { ghosting: 3, responsibility: -1 }),
      c("ส่งตาน้องสติกเกอร์ไปคั่นเวลา", { chaos: 1, snackEnergy: 1, honesty: 1 })
    ]),
    q("ข้อความขึ้นว่าอ่านแล้ว แต่เพื่อนยังรอ คุณคิดอะไร?", [
      c("ต้องกลับไปตอบก่อนลืมรอบสอง", { honesty: 2, responsibility: 3 }),
      c("ประโยคแรกต้องดี ไม่งั้นคดีบาน", { drama: 2, chaos: 2 }),
      c("ถ้าเงียบต่ออีกนิด อาจไม่มีใครสังเกต", { ghosting: 3, honesty: -1 }),
      c("ตอบหลังเคี้ยวหมดจะสุภาพกว่า", { snackEnergy: 3, ghosting: 1 })
    ]),
    q("เพื่อนพิมพ์ว่า “อยู่ไหม” คุณตอบแบบไหน?", [
      c("อยู่ ขอโทษ อ่านแล้วลืมตอบ", { honesty: 3, responsibility: 2 }),
      c("กำลังจะตอบพอดี จังหวะศาลมาก", { drama: 2, chaos: 2 }),
      c("ทำเหมือนเพิ่งเห็นเมื่อกี้", { ghosting: 2, honesty: -2 }),
      c("ส่งรูปน้ำหวานแล้วบอกเติมพลัง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าต้องอธิบายความเงียบในแชต คุณยื่นหลักฐานอะไร?", [
      c("รายการแจ้งเตือนที่ทับกันจริง", { honesty: 2, responsibility: 2 }),
      c("แผนผังความคิดที่ยาวกว่าคำตอบ", { drama: 3, chaos: 1 }),
      c("หน้าจอว่างเปล่าที่ไม่มีข้อแก้ตัว", { ghosting: 2, honesty: 1 }),
      c("ใบเสร็จขนมช่วงเวลาหายตัว", { snackEnergy: 3, responsibility: -1 })
    ]),
    q("เจอข้อความยาวสามย่อหน้า คุณจัดการยังไง?", [
      c("แยกตอบทีละประเด็นแบบคนมีสติ", { responsibility: 3, honesty: 2 }),
      c("อ่านแล้วตั้งชื่อคดีให้ก่อน", { chaos: 2, drama: 2 }),
      c("ปักไว้ว่าเดี๋ยวกลับมา แล้วเดี๋ยวยาว", { ghosting: 3, responsibility: -1 }),
      c("หาเครื่องดื่มก่อน เพราะนี่คือเอกสารศาล", { snackEnergy: 3, drama: 1 })
    ]),
    q("วิธีไถ่โทษหลังปล่อยแชตเย็นคือ?", [
      c("ตอบครบและไม่แก้ตัวเกินจำเป็น", { honesty: 3, responsibility: 3 }),
      c("ส่งคำขอโทษพร้อมมีมหนึ่งอันพอดี", { chaos: 1, drama: 1, honesty: 1 }),
      c("กลับมาแบบเนียนด้วยคำว่า เมื่อกี้ยุ่ง", { ghosting: 2, honesty: -1 }),
      c("เลี้ยงเฟรนช์ฟรายส์แทนคำอธิบาย", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "almost-there": [
    q("ตอนพิมพ์ว่า “ใกล้ถึงแล้ว” คุณแตะประตูบ้านหรือยัง?", [
      c("ออกมาแล้ว อยู่ระหว่างทางจริง", { honesty: 3, responsibility: 3 }),
      c("กำลังใส่รองเท้าข้างแรก", { honesty: 1, chaos: 2, responsibility: -1 }),
      c("ยังเลือกกระเป๋าอยู่ แต่ใจไปถึงแล้ว", { drama: 2, ghosting: 1 }),
      c("ยืนซื้อกาแฟก่อนขึ้นรถ", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนขอโลเคชันสด คุณส่งอะไร?", [
      c("ส่งตำแหน่งจริงพร้อมเวลาถึง", { honesty: 3, responsibility: 3 }),
      c("ส่งรูปถนนที่ดูเหมือนกำลังเดินทาง", { drama: 2, chaos: 2 }),
      c("บอกอีกสองไฟแดง ทั้งที่ยังหาไฟแดงไม่เจอ", { ghosting: 2, honesty: -2 }),
      c("ส่งรูปแก้วกาแฟพร้อมคำว่าเติมน้ำมัน", { snackEnergy: 3, drama: 1 })
    ]),
    q("คำว่า “แป๊บเดียว” ของคุณในคดีนี้แปลว่าอะไร?", [
      c("ห้านาทีตามนาฬิกาจริง", { honesty: 2, responsibility: 3 }),
      c("สิบห้านาทีแบบมีเงื่อนไขรองเท้า", { chaos: 2, drama: 1 }),
      c("เวลายืดหยุ่นตามแรงกดดันในแชต", { ghosting: 2, drama: 2 }),
      c("เท่ากับคิวเครื่องดื่มหนึ่งแก้ว", { snackEnergy: 3, responsibility: -1 })
    ]),
    q("อะไรทำให้ยังไม่ออกจากบ้าน?", [
      c("ประเมินเวลาแต่งตัวผิดไปนิด", { honesty: 2, responsibility: 1 }),
      c("กุญแจหายแบบมีดนตรีประกอบ", { chaos: 3, drama: 2 }),
      c("อ่านแชตแล้วกลัวตอบพิกัดจริง", { ghosting: 3, honesty: -1 }),
      c("หิวก่อนออก เลยต้องป้องกันอารมณ์", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถึงที่นัดช้าแล้ว คุณเปิดประโยคแรกยังไง?", [
      c("ขอโทษ มาช้าเพราะออกช้าเอง", { honesty: 3, responsibility: 3 }),
      c("เล่าการผจญภัยตั้งแต่หน้าบ้าน", { drama: 3, chaos: 1 }),
      c("ยิ้มแล้วถามว่าเริ่มกันยัง", { ghosting: 1, honesty: -1, chaos: 1 }),
      c("ยื่นขนมเป็นเอกสารลดโทษ", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("ครั้งหน้าจะไม่ให้เพื่อนรอแบบเดิม คุณทำอะไร?", [
      c("แจ้งเวลาจริงตั้งแต่ยังอยู่บ้าน", { honesty: 3, responsibility: 3 }),
      c("ตั้งนาฬิกาชื่อว่าอย่าพูดว่าใกล้", { chaos: 1, responsibility: 2 }),
      c("ปิดแชตจนกว่าจะออกจริง", { ghosting: 2, responsibility: -1 }),
      c("นัดหน้าร้านขนมที่ตัวเองวิ่งไปได้", { snackEnergy: 3, chaos: 1 })
    ])
  ],
  "food-choice": [
    q("เพื่อนถามว่า “กินอะไรดี” คุณเปิดศาลยังไง?", [
      c("เสนอร้านแรกพร้อมเหตุผลสองข้อ", { responsibility: 3, honesty: 2 }),
      c("เปิดแผนที่แล้วเรียกประชุมทันที", { chaos: 2, drama: 2 }),
      c("เงียบเพราะหิวจนภาษาไทยหาย", { ghosting: 2, snackEnergy: 1 }),
      c("ถามก่อนว่ามีเมนูทอดไหม", { snackEnergy: 3, honesty: 1 })
    ]),
    q("ร้านที่เพื่อนเสนอมีคะแนนรีวิวกลาง ๆ คุณทำอะไร?", [
      c("เช็กเมนูหลักแล้วตัดสินใจ", { responsibility: 3, honesty: 2 }),
      c("อ่านรีวิวลึกเหมือนสอบสวนพยาน", { drama: 3, chaos: 1 }),
      c("ส่งแค่ อืม แล้วปล่อยห้องเงียบ", { ghosting: 3, honesty: -1 }),
      c("เลื่อนไปดูรูปของหวานก่อน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("คุณปฏิเสธร้านหนึ่งเพราะอะไรถึงฟังขึ้น?", [
      c("มีคนกินไม่ได้จริง ๆ", { honesty: 3, responsibility: 2 }),
      c("โต๊ะกับไฟไม่ผ่านมาตรฐานใจ", { drama: 2, chaos: 2 }),
      c("ไม่รู้เหตุผล แต่ปากบอกยังไม่ใช่", { honesty: -1, ghosting: 1, drama: 2 }),
      c("ของกินเล่นน้อยเกินไปต่อมิตรภาพ", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าให้เลือกใน 10 วินาที คุณใช้หลักอะไร?", [
      c("ระยะทาง ราคา เมนู จบ", { responsibility: 3, honesty: 1 }),
      c("สุ่มจากชื่อร้านที่อ่านแล้วรู้สึกใช่", { chaos: 3, drama: 1 }),
      c("โยนสิทธิ์ให้คนที่หิวสุด", { ghosting: 1, responsibility: -1 }),
      c("เลือกร้านที่มีมันฝรั่งชัดที่สุด", { snackEnergy: 3, honesty: 1 })
    ]),
    q("เพื่อนเริ่มบอกว่าเลือกเถอะ คุณรับมือยังไง?", [
      c("สรุปสามตัวเลือกแล้วให้โหวต", { responsibility: 3, honesty: 2 }),
      c("ตั้งชื่อโพลว่า ศาลข้าวกลางวัน", { chaos: 2, drama: 1 }),
      c("แอบหวังให้คนอื่นฟันธงแทน", { ghosting: 2, responsibility: -1 }),
      c("เสนอพักกินขนมก่อนตัดสิน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("มื้อไหนถือว่าปิดคดีสวย?", [
      c("ทุกคนอิ่มและไม่มีใครคาใจ", { responsibility: 3, honesty: 2 }),
      c("ได้ร้านใหม่ไว้เถียงรอบหน้า", { chaos: 2, drama: 2 }),
      c("ไม่ต้องยอมรับว่าเราคือคนทำให้ช้า", { ghosting: 2, honesty: -1 }),
      c("มีของหวานเป็นตราประทับ", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "game-ghost": [
    q("ตอนชวนเพื่อนเข้าเกม คุณพร้อมจริงแค่ไหน?", [
      c("เปิดเกมแล้วรอในปาร์ตี้", { responsibility: 3, honesty: 2 }),
      c("กำลังแต่งตัวละครให้สมศักดิ์ศรี", { chaos: 2, drama: 2 }),
      c("ออนไลน์อยู่แต่ไปอยู่เกมอื่น", { ghosting: 3, honesty: -1 }),
      c("รอขนมก่อนเริ่มตาแรก", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนครบทีมแล้วแต่คุณยังไม่เข้า คุณทำอะไรอยู่?", [
      c("กดเข้าห้องทันทีที่เห็น", { responsibility: 3, honesty: 1 }),
      c("ปรับเสียงไมค์เหมือนขึ้นเวที", { drama: 2, chaos: 2 }),
      c("อ่านคำเชิญแล้วหลบไปตั้งค่า", { ghosting: 3, responsibility: -1 }),
      c("เทขนมใส่ถ้วยให้มือว่าง", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("คำว่า “อีกตาเดียว” ของคุณเคยยาวแค่ไหน?", [
      c("จบตานั้นแล้วออกจริง", { honesty: 3, responsibility: 3 }),
      c("ตาเดียวที่มีต่อเวลาและรีแมตช์", { chaos: 3, drama: 1 }),
      c("ยาวจนเพื่อนเลิกนับ", { ghosting: 2, honesty: -1 }),
      c("เท่ากับขนมหมดถุง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนพิมพ์ว่า “หายไปไหน” คุณตอบอะไร?", [
      c("ขอโทษ ติดเกมอื่นอยู่จริง", { honesty: 3, responsibility: 2 }),
      c("หลงเมนูตั้งค่าเหมือนเขาวงกต", { chaos: 2, drama: 2 }),
      c("เน็ตแปลกมาก แล้วเงียบต่อ", { ghosting: 3, honesty: -1 }),
      c("ไปหยิบน้ำแล้วได้ขนมเพิ่ม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ตอนเข้าเกมช้าแล้วทีมเริ่มบ่น คุณง้อแบบไหน?", [
      c("กดพร้อมและไม่ลากต่อ", { responsibility: 3, honesty: 1 }),
      c("ส่งอีโมตขอโทษรัวจนหน้าจอสั่น", { chaos: 2, drama: 2 }),
      c("ปิดไมค์เพราะกลัวโดนซัก", { ghosting: 3, responsibility: -1 }),
      c("ประกาศว่ามีเสบียงพร้อมเล่นยาว", { snackEnergy: 3, drama: 1 })
    ]),
    q("หลักฐานฝั่งคุณในศาลเกมคืออะไร?", [
      c("ประวัติออนไลน์ที่ยอมให้ตรวจ", { honesty: 3, responsibility: 2 }),
      c("สกินใหม่ที่เสียเวลาจริงแต่สวย", { chaos: 2, drama: 2 }),
      c("คำว่าแป๊บในแชตที่ไม่มีเวลาแนบ", { ghosting: 2, honesty: -1 }),
      c("ถุงขนมข้างคีย์บอร์ด", { snackEnergy: 3, chaos: 1 })
    ])
  ],
  "clip-storm": [
    q("คลิปแรกที่ส่งไปต้องมีบริบทไหม?", [
      c("ใส่แคปชั่นว่าดูตรงไหน", { responsibility: 3, honesty: 2 }),
      c("เขียนว่าอันนี้ก่อน แล้วส่งต่อทันที", { chaos: 2, drama: 1 }),
      c("ปล่อยให้คลิปอธิบายตัวเอง", { ghosting: 1, responsibility: -1 }),
      c("แนบคำว่า ดูตอนกินข้าวได้", { snackEnergy: 2, chaos: 1 })
    ]),
    q("ทำไมถึงส่งคลิปที่ 7 ตามมา?", [
      c("มันต่อจากประเด็นที่คุยจริง", { honesty: 3, responsibility: 2 }),
      c("อัลกอริทึมเปิดประตูจักรวาล", { chaos: 3, drama: 2 }),
      c("ส่งก่อนแล้วค่อยกลับมาอธิบาย", { ghosting: 2, responsibility: -1 }),
      c("มีฉากอาหารที่เพื่อนควรรู้", { snackEnergy: 3, honesty: 1 })
    ]),
    q("เพื่อนไม่ตอบหลังคลิปชุดใหญ่ คุณคิดว่าอะไร?", [
      c("เขาอาจยังไม่มีเวลาดู", { honesty: 2, responsibility: 2 }),
      c("ต้องส่งคลิปไฮไลต์ช่วยตัดสิน", { chaos: 2, drama: 2 }),
      c("เงียบแบบนี้แปลว่าดูอยู่แน่", { ghosting: 1, honesty: -1 }),
      c("เขาคงหิวเพราะคลิปรีวิว", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าศาลให้ส่งได้แค่หนึ่งคลิป คุณเลือกยังไง?", [
      c("เลือกอันที่เกี่ยวกับบทสนทนาที่สุด", { responsibility: 3, honesty: 2 }),
      c("เลือกอันที่ทำให้ห้องแชตตื่น", { chaos: 3, drama: 2 }),
      c("ส่งลิงก์รวมแล้วถือว่าหนึ่งชุด", { ghosting: 1, honesty: -1 }),
      c("เลือกคลิปของกินที่เปิดแล้วใจดี", { snackEnergy: 3, chaos: 1 })
    ]),
    q("คุณคาดหวังให้เพื่อนดูคลิปยาวแค่ไหน?", [
      c("ดูเฉพาะส่วนที่บอกไว้ก็พอ", { responsibility: 3, honesty: 2 }),
      c("ดูครบเพื่อเข้าใจตำนาน", { drama: 3, chaos: 1 }),
      c("ดูไม่ครบก็ได้แต่ต้องเดาใจเรา", { ghosting: 1, drama: 2 }),
      c("ดูตอนพักกินของว่าง", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("บทเรียนจากคดีคลิปรัวคืออะไร?", [
      c("ทำสารบัญก่อนส่ง", { responsibility: 3, honesty: 1 }),
      c("ตั้งชื่อคลิปว่า สำคัญจริง หรือ แค่อยากให้ดู", { chaos: 2, drama: 1 }),
      c("งดส่งต่อถ้าเพื่อนยังไม่หายใจ", { ghosting: -1, responsibility: 2 }),
      c("ส่งคลิปขนมปิดท้ายแค่อันเดียว", { snackEnergy: 3, chaos: 1 })
    ])
  ],
  "sleep-online": [
    q("หลังพิมพ์ว่า “นอนละ” คุณทำอะไรต่อ?", [
      c("วางมือถือแล้วหลับจริง", { responsibility: 3, honesty: 3, ghosting: -1 }),
      c("ไถหน้าจออีกสามนาทีที่ยืดได้", { chaos: 2, drama: 1 }),
      c("อ่านแชตใหม่แต่ไม่กล้าตอบ", { ghosting: 3, honesty: -1 }),
      c("เช็กเมนูของกินก่อนหลับ", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนทักว่า “ไหนว่านอน” คุณแก้ต่างยังไง?", [
      c("ยังไม่นอนจริง ขอโทษที่ประกาศเร็ว", { honesty: 3, responsibility: 2 }),
      c("ร่างกายนอนแล้ว แต่ใจยังออนไลน์", { drama: 3, chaos: 1 }),
      c("สถานะมันขึ้นเอง เราเป็นผู้บริสุทธิ์", { ghosting: 2, honesty: -2 }),
      c("ตื่นเพราะคิดถึงขนมตอนดึก", { snackEnergy: 3, honesty: 1 })
    ]),
    q("อะไรทำให้คุณยังไม่หลับ?", [
      c("มีเรื่องต้องตอบให้จบก่อน", { responsibility: 3, honesty: 1 }),
      c("คลิปสั้นต่อคิวเหมือนพยานไม่หมด", { chaos: 3, drama: 1 }),
      c("กลัวเปิดตอบแล้วต้องคุยยาว", { ghosting: 3, responsibility: -1 }),
      c("ท้องร้องเบา ๆ แต่ศาลได้ยิน", { snackEnergy: 3, drama: 1 })
    ]),
    q("ถ้าอยากนอนจริง คุณส่งสัญญาณอะไร?", [
      c("บอกฝันดีแล้วหายแบบมีมารยาท", { honesty: 2, responsibility: 3 }),
      c("ส่งสติกเกอร์ง่วงขั้นสูง", { chaos: 1, drama: 1 }),
      c("ปิดแจ้งเตือนหนีทั้งจักรวาล", { ghosting: 3, responsibility: -1 }),
      c("ประกาศว่ากินเสร็จแล้วจะหลับ", { snackEnergy: 3, honesty: 1 })
    ]),
    q("หลักฐานที่ทำให้เพื่อนจับได้คือ?", [
      c("สถานะออนไลน์หลังคำว่านอน", { honesty: 1, responsibility: -1 }),
      c("กดไลก์โพสต์ตอนตีหนึ่ง", { chaos: 2, drama: 2 }),
      c("อ่านแชตแต่ไม่ตอบอีกแล้ว", { ghosting: 3, honesty: -1 }),
      c("ส่งรีวิวของกินตอนดึก", { snackEnergy: 3, chaos: 1 })
    ]),
    q("คำสั่งศาลก่อนนอนควรเป็นอะไร?", [
      c("พูดว่านอนเมื่อพร้อมนอนจริง", { honesty: 3, responsibility: 3 }),
      c("ตั้งเวลาปิดแอปแบบพิธีการ", { responsibility: 2, chaos: 1 }),
      c("ห้ามอ่านแชตแล้วทิ้งไว้ในฝัน", { ghosting: -1, responsibility: 2 }),
      c("เตรียมน้ำไว้ก่อน จะได้ไม่ลุกมาไถ", { snackEnergy: 2, responsibility: 2 })
    ])
  ],
  "anything-but-no": [
    q("คำว่า “อะไรก็ได้” ของคุณมีเงื่อนไขลับอะไร?", [
      c("มีสองร้านที่รับได้ บอกได้เลย", { honesty: 3, responsibility: 2 }),
      c("ขอให้เพื่อนเดาใจถูกแบบเกมโชว์", { drama: 2, chaos: 2 }),
      c("ไม่อยากเลือก เลยวางหมอกไว้", { ghosting: 2, responsibility: -1 }),
      c("ขอมีของกรอบก็พอ", { snackEnergy: 3, honesty: 1 })
    ]),
    q("เพื่อนเสนอร้านแรก คุณปฏิเสธด้วยประโยคไหน?", [
      c("ร้านนี้ไม่สะดวกเพราะคนเยอะ", { honesty: 3, responsibility: 2 }),
      c("ดีนะ แต่พลังวันนี้ไม่ใช่", { drama: 2, chaos: 1 }),
      c("อ่านแล้วทำหน้าคิดหนักแทนตอบ", { ghosting: 3, drama: 1 }),
      c("ร้านนี้ไม่มีของทอดในใจ", { snackEnergy: 3, honesty: 1 })
    ]),
    q("ถ้าเพื่อนถามว่าอยากได้แบบไหน คุณตอบยังไง?", [
      c("ขอใกล้ ๆ ราคาโอเค เมนูหลากหลาย", { responsibility: 3, honesty: 2 }),
      c("ขอที่รู้สึกใช่แต่ยังอธิบายไม่ได้", { drama: 3, chaos: 1 }),
      c("บอกคิดก่อน แล้วหายไปดูรีวิว", { ghosting: 2, responsibility: -1 }),
      c("ขอร้านที่มีของหวานจบในตัว", { snackEnergy: 3, honesty: 1 })
    ]),
    q("เพื่อนเริ่มหมดแรงกับคำว่าอะไรก็ได้ คุณทำอะไร?", [
      c("เสนอสามตัวเลือกให้เลือกทันที", { responsibility: 3, honesty: 2 }),
      c("ทำโพลฉุกเฉินชื่อ เลือกแทนเรา", { chaos: 2, drama: 1 }),
      c("นิ่งเพื่อให้คดีผ่านไปเอง", { ghosting: 3, responsibility: -1 }),
      c("ซื้อขนมมาระงับอารมณ์โต๊ะประชุม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ร้านที่คุณยอมทันทีต้องมีอะไร?", [
      c("เดินทางง่ายและทุกคนกินได้", { responsibility: 3, honesty: 1 }),
      c("ชื่อร้านดูมีเรื่องให้เล่า", { drama: 2, chaos: 2 }),
      c("คนอื่นเลือกแล้วเราไม่ต้องรับผิด", { ghosting: 2, responsibility: -1 }),
      c("เมนูกินเล่นเด่นกว่าป้ายร้าน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ศาลควรห้ามคุณพูดคำไหนชั่วคราว?", [
      c("ห้ามพูดอะไรก็ได้ถ้ายังมีเงื่อนไข", { honesty: 3, responsibility: 3 }),
      c("ห้ามพูดไม่ติดนะด้วยหน้าไม่ไป", { drama: 2, honesty: 1 }),
      c("ห้ามตอบช้าแล้วให้เพื่อนเดาใจ", { ghosting: -1, responsibility: 2 }),
      c("ห้ามใช้ของทอดเป็นเหตุผลเดียว", { snackEnergy: 2, chaos: 1 })
    ])
  ],
  "wake-at-meet": [
    q("นัด 10 โมง แต่ตื่น 10 โมง คุณเห็นนาฬิกาแล้วทำอะไร?", [
      c("บอกเพื่อนทันทีว่าตื่นสาย", { honesty: 3, responsibility: 3 }),
      c("ลุกแบบฉากเริ่มภารกิจลับ", { chaos: 3, drama: 2 }),
      c("จ้องแชตสามวิก่อนหายไปอาบน้ำ", { ghosting: 3, responsibility: -1 }),
      c("หยิบขนมปังเพราะต้องมีแรงรับผิด", { snackEnergy: 3, honesty: 1 })
    ]),
    q("ปลุกไม่ตื่นเพราะอะไร?", [
      c("ตั้งปลุกผิดวันจริง ๆ", { honesty: 3, responsibility: -1 }),
      c("ฝันว่าปิดปลุกไปประชุมแล้ว", { chaos: 2, drama: 2 }),
      c("มือถือสั่น แต่ใจไม่เข้าสู่ระบบ", { ghosting: 2, responsibility: -1 }),
      c("ท้องว่างทำให้สมองไม่รับสาย", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ข้อความแรกที่ส่งหลังตื่นคืออะไร?", [
      c("ขอโทษ ตื่นสาย กำลังรีบไป", { honesty: 3, responsibility: 3 }),
      c("ใกล้แล้วในความหมายว่าใกล้เริ่ม", { chaos: 2, drama: 1, honesty: -1 }),
      c("แป๊บนะ แล้วปิดแชตไปแต่งตัว", { ghosting: 3, responsibility: -1 }),
      c("เอาอะไรไปฝากแก้โทษไหม", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("ขั้นตอนเตรียมตัวหลังตื่นสายของคุณเป็นแบบไหน?", [
      c("ตัดขั้นตอนที่ไม่จำเป็นออก", { responsibility: 3, honesty: 1 }),
      c("รีบแต่ยังเลือกเสื้อด้วยศักดิ์ศรี", { chaos: 2, drama: 2 }),
      c("ไม่อ่านแชตจนกว่าจะพร้อมออก", { ghosting: 3, responsibility: -1 }),
      c("แวะซื้อกาแฟเพราะชีวิตเพิ่งเปิดเครื่อง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("หลักฐานไหนช่วยลดโทษได้บ้าง?", [
      c("หน้าจอนาฬิกาปลุกสิบรายการ", { honesty: 2, responsibility: 1 }),
      c("รูปผมยุ่งระดับเอกสารราชการ", { drama: 2, chaos: 1 }),
      c("ไม่มีหลักฐาน มีแต่ความเงียบ", { ghosting: 2, honesty: -1 }),
      c("ถุงอาหารเช้าของคนที่รีบมาก", { snackEnergy: 3, chaos: 1 })
    ]),
    q("นัดครั้งหน้าคุณจะป้องกันยังไง?", [
      c("ตั้งปลุกสองเครื่องและนอนเร็ว", { responsibility: 3, honesty: 2 }),
      c("ให้เพื่อนโทรปลุกแบบพิธีเปิดศาล", { chaos: 1, responsibility: 2 }),
      c("ขอนัดหลังเที่ยงเพื่อความสงบ", { ghosting: 1, honesty: 1 }),
      c("นัดที่ร้านอาหารเช้าให้ตื่นด้วยกลิ่น", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "drop-topic": [
    q("คุณเปิดประเด็นว่า “เดี๋ยวเล่า” เพราะอะไร?", [
      c("ต้องเรียงเรื่องก่อน ไม่อยากเล่าผิด", { honesty: 2, responsibility: 2 }),
      c("อยากให้แชตมีเสียงซาวด์ลุ้น", { drama: 3, chaos: 2 }),
      c("เปิดไว้ก่อนแล้วชีวิตพาไปทางอื่น", { ghosting: 3, responsibility: -1 }),
      c("ต้องไปหยิบขนมประกอบฉาก", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนถามว่า “เล่าได้ยัง” คุณตอบยังไง?", [
      c("เล่าแบบย่อทันที", { responsibility: 3, honesty: 2 }),
      c("บอกว่าเรื่องมันยาวมาก รอก่อน", { drama: 3, chaos: 1 }),
      c("อ่านแล้วปล่อยให้ความลึกลับทำงาน", { ghosting: 3, honesty: -1 }),
      c("ขอเคี้ยวให้เสร็จก่อนเข้าเรื่อง", { snackEnergy: 3, responsibility: -1 })
    ]),
    q("ประเด็นที่คุณเปิดไว้มักเป็นแนวไหน?", [
      c("เรื่องจริงที่ต้องระวังคำ", { honesty: 2, responsibility: 2 }),
      c("เรื่องเล็กที่เล่าแล้วเหมือนตัวอย่างหนัง", { drama: 3, chaos: 2 }),
      c("เรื่องที่ยังไม่มีตอนจบชัด", { ghosting: 2, chaos: 1 }),
      c("เรื่องที่เกิดหน้าร้านอาหาร", { snackEnergy: 3, honesty: 1 })
    ]),
    q("ถ้าศาลให้เล่าในหนึ่งนาที คุณทำได้ไหม?", [
      c("เล่าใจความและจบตรงเวลา", { responsibility: 3, honesty: 2 }),
      c("เปิดด้วยบทนำครึ่งนาที", { drama: 3, chaos: 1 }),
      c("ขอพิมพ์ก่อน แล้วหายไปจัดประโยค", { ghosting: 3, responsibility: -1 }),
      c("เล่าไปกินไปแต่ยังจับใจความได้", { snackEnergy: 2, chaos: 1 })
    ]),
    q("อะไรทำให้เพื่อนค้างคาที่สุด?", [
      c("บอกว่าจะเล่าแล้วลืมจริง", { honesty: 3, responsibility: -1 }),
      c("ใช้คำว่าแรงมากแล้วหาย", { drama: 3, ghosting: 1 }),
      c("เห็นคำถามเพื่อนแต่ยังไม่พร้อม", { ghosting: 3, honesty: -1 }),
      c("ส่งรูปขนมแทนตอนจบ", { snackEnergy: 3, chaos: 1 })
    ]),
    q("วิธีปิดคดีเปิดประเด็นคืออะไร?", [
      c("กลับมาเล่าให้ครบสามบรรทัด", { responsibility: 3, honesty: 2 }),
      c("ทำสารบัญว่าเรื่องนี้มีอะไรบ้าง", { chaos: 1, responsibility: 2 }),
      c("ห้ามพิมพ์เดี๋ยวเล่าถ้าไม่ว่างจริง", { honesty: 2, responsibility: 3 }),
      c("เล่าพร้อมของกินเป็นค่ารอ", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "short-story": [
    q("คุณบอกว่า “เล่าแป๊บเดียว” แล้วเริ่มตรงไหน?", [
      c("เริ่มที่เหตุการณ์หลักทันที", { responsibility: 3, honesty: 2 }),
      c("เริ่มตั้งแต่เช้าวันนั้นเพื่อความสมจริง", { drama: 3, chaos: 2 }),
      c("พิมพ์เกริ่นแล้วหายไปหารูปประกอบ", { ghosting: 2, responsibility: -1 }),
      c("เริ่มจากเมนูที่กินก่อนเกิดเรื่อง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ทำไมเรื่องสั้นกลายเป็น 40 นาที?", [
      c("รายละเอียดจำเป็นต่อความเข้าใจ", { honesty: 2, responsibility: 1 }),
      c("ตัวละครสมทบทุกคนมีบท", { drama: 3, chaos: 3 }),
      c("เล่าไปหยุดไปจนเวลายืด", { ghosting: 1, chaos: 2 }),
      c("มีพักกินและกลับมาเล่าต่อ", { snackEnergy: 3, drama: 1 })
    ]),
    q("เพื่อนทำหน้าเริ่มหลุดโฟกัส คุณสังเกตยังไง?", [
      c("สรุปให้เร็วขึ้นทันที", { responsibility: 3, honesty: 2 }),
      c("ถามว่า ยังฟังอยู่ใช่ไหม แบบตื่นเต้น", { drama: 2, chaos: 1 }),
      c("ทำเป็นไม่เห็นแล้วเล่าต่อ", { ghosting: 1, honesty: -1 }),
      c("ชวนพักจิบน้ำก่อนเข้าฉากสำคัญ", { snackEnergy: 2, responsibility: 1 })
    ]),
    q("ส่วนไหนในเรื่องของคุณมักยืดที่สุด?", [
      c("สาเหตุและลำดับเวลา", { responsibility: 2, honesty: 2 }),
      c("บทสนทนาที่ต้องเลียนเสียง", { drama: 3, chaos: 2 }),
      c("ช่วงคิดว่าจะเล่าดีไหม", { ghosting: 2, drama: 1 }),
      c("ช่วงบรรยายอาหารในเหตุการณ์", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าศาลให้สรุปเป็นพาดหัว คุณเขียนว่าอะไร?", [
      c("เพื่อนเข้าใจผิดเพราะข้อมูลไม่ครบ", { honesty: 2, responsibility: 2 }),
      c("มหากาพย์วันธรรมดาที่ไม่ธรรมดา", { drama: 3, chaos: 1 }),
      c("เดี๋ยวส่งเวอร์ชันเต็มในแชต", { ghosting: 2, responsibility: -1 }),
      c("เรื่องนี้พิสูจน์ว่าขนมช่วยชีวิต", { snackEnergy: 3, drama: 1 })
    ]),
    q("บทลงโทษนักเล่า 40 นาทีควรเป็นอะไร?", [
      c("เล่าด้วยสามประโยคก่อนขยาย", { responsibility: 3, honesty: 2 }),
      c("ทำตัวอย่างตอนต่อไปให้เพื่อนเลือกฟัง", { chaos: 2, drama: 2 }),
      c("ห้ามพูดว่าแป๊บเดียวถ้ายังมีบทนำ", { honesty: 2, responsibility: 2 }),
      c("เลี้ยงชามะนาวคนฟังจนจบ", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "borrow-forget": [
    q("ตอนขอยืมของ คุณจำกำหนดคืนไว้ไหม?", [
      c("จดวันคืนทันที", { responsibility: 3, honesty: 2 }),
      c("คิดว่าเดี๋ยวจำได้เพราะของเด่น", { chaos: 2, honesty: 1 }),
      c("จำได้แค่ว่ายืม แต่ไม่จำได้ว่าจากใคร", { ghosting: 2, responsibility: -1 }),
      c("วางไว้ข้างขนมจนกลมกลืน", { snackEnergy: 2, chaos: 2 })
    ]),
    q("ของที่ยืมไปตอนนี้อยู่ที่ไหน?", [
      c("อยู่ในถุงเตรียมคืน", { responsibility: 3, honesty: 2 }),
      c("อยู่บนโต๊ะที่มีของซ้อนเป็นชั้น", { chaos: 3, drama: 1 }),
      c("อยู่ที่ไหนสักที่ในบ้านเรา", { ghosting: 2, honesty: -1 }),
      c("อยู่ใกล้ถุงของกินล่าสุด", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนทวงของ คุณตอบอย่างไร?", [
      c("ขอโทษ เดี๋ยวเอาไปคืนวันนี้", { honesty: 3, responsibility: 3 }),
      c("เล่าว่าของเดินทางในบ้านยังไง", { drama: 2, chaos: 2 }),
      c("อ่านแล้วไปค้นก่อนแต่ลืมตอบ", { ghosting: 3, responsibility: -1 }),
      c("ถามว่ารับคืนพร้อมชานมไหม", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("อะไรทำให้ลืมคืนบ่อยที่สุด?", [
      c("ไม่มีจุดวางของคืนชัดเจน", { honesty: 2, responsibility: 1 }),
      c("ของนั้นเข้ากับชีวิตประจำวันเกินไป", { chaos: 2, drama: 1 }),
      c("กลัวทวงแล้วต้องยอมรับว่าลืม", { ghosting: 3, honesty: -1 }),
      c("ถุงขนมบังหลักฐาน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าของเพื่อนสำคัญมาก คุณทำอะไร?", [
      c("คืนทันทีหรือส่งให้ถึงมือ", { responsibility: 3, honesty: 2 }),
      c("ห่อเหมือนหลักฐานชั้นสูง", { drama: 2, chaos: 1 }),
      c("หยุดยืมจนกว่าความจำจะกลับมา", { responsibility: 2, ghosting: 1 }),
      c("แนบของกินเป็นค่าดูแล", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("กติกายืมของครั้งหน้าคืออะไร?", [
      c("ถ่ายรูปของและกำหนดคืน", { responsibility: 3, honesty: 2 }),
      c("ติดป้ายว่านี่ไม่ใช่ของเรา", { chaos: 1, responsibility: 2 }),
      c("ไม่รับปากถ้ายังไม่พร้อมคืน", { honesty: 2, responsibility: 2 }),
      c("วางกล่องคืนของข้างโต๊ะกิน", { snackEnergy: 2, responsibility: 2 })
    ])
  ],
  "extra-food": [
    q("ตอนบอกว่ากินนิดเดียว คุณสั่งอะไรเพิ่ม?", [
      c("สั่งจานเล็กแบ่งกันชัดเจน", { honesty: 2, responsibility: 3 }),
      c("สั่งจานใหญ่แล้วเรียกว่านิดเดียวทางใจ", { chaos: 3, drama: 2 }),
      c("ให้เพื่อนสั่งแทน จะได้ไม่เป็นหลักฐาน", { ghosting: 2, honesty: -1 }),
      c("เพิ่มของทอดเพราะมันเรียกชื่อเรา", { snackEnergy: 3, chaos: 1 })
    ]),
    q("อาหารมาเต็มโต๊ะ คุณอธิบายปริมาณยังไง?", [
      c("ยอมรับว่าสั่งเยอะไป", { honesty: 3, responsibility: 2 }),
      c("บอกว่าจานดูใหญ่กว่ารูป", { drama: 2, chaos: 1 }),
      c("หันไปถามว่าใครอยากช่วยกิน", { ghosting: 1, responsibility: -1 }),
      c("ยืนยันว่าของกินเล่นไม่นับ", { snackEnergy: 3, honesty: -1 })
    ]),
    q("เพื่อนบอกว่าใครจะกินหมด คุณทำอะไร?", [
      c("แบ่งส่วนและรับผิดชอบจานตัวเอง", { responsibility: 3, honesty: 2 }),
      c("ประกาศว่าเราจะสู้เพื่อโต๊ะนี้", { drama: 3, chaos: 2 }),
      c("ทำเป็นจัดจานเพื่อซื้อเวลา", { ghosting: 2, chaos: 1 }),
      c("เริ่มจากเฟรนช์ฟรายส์ก่อนหลักฐานเย็น", { snackEnergy: 3, responsibility: -1 })
    ]),
    q("บิลมาถึง คุณแบ่งค่าจานเพิ่มยังไง?", [
      c("จ่ายส่วนที่ตัวเองชวนสั่ง", { responsibility: 3, honesty: 2 }),
      c("หารแบบสร้างสรรค์จนเครื่องคิดเลขงง", { chaos: 3, drama: 1 }),
      c("รอให้คนอื่นพูดเรื่องบิลก่อน", { ghosting: 2, responsibility: -1 }),
      c("เสนอจ่ายเป็นของหวานรอบหน้า", { snackEnergy: 3, honesty: 1 })
    ]),
    q("ถ้าอาหารเหลือ คุณทำอะไร?", [
      c("ห่อกลับและรับผิดชอบเอง", { responsibility: 3, honesty: 2 }),
      c("จัดพิธีแบ่งกล่องกลับบ้าน", { chaos: 2, drama: 2 }),
      c("บอกว่าเดี๋ยวค่อยคิดแล้วเงียบ", { ghosting: 2, responsibility: -1 }),
      c("เก็บของทอดไว้เป็นทรัพย์สินฉุกเฉิน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ครั้งหน้าจะพูดคำว่านิดเดียวยังไงให้ปลอดภัย?", [
      c("ระบุจำนวนจานก่อนสั่ง", { responsibility: 3, honesty: 2 }),
      c("ให้เพื่อนตรวจเมนูก่อนกดยืนยัน", { responsibility: 2, chaos: 1 }),
      c("ไม่พูดนิดเดียวถ้าในใจอยากครบชุด", { honesty: 3, snackEnergy: 1 }),
      c("ตั้งงบของกินเล่นแยกต่างหาก", { snackEnergy: 2, responsibility: 2 })
    ])
  ],
  "not-hungry": [
    q("ตอนบอกว่าไม่หิว คุณมองเมนูหรือยัง?", [
      c("บอกไม่หิวหลังเช็กตัวเองจริง", { honesty: 3, responsibility: 2 }),
      c("มองเมนูแล้วใจเริ่มสั่น", { drama: 2, chaos: 1, snackEnergy: 1 }),
      c("ไม่สั่งเพื่อไม่ให้มีหลักฐาน", { ghosting: 2, honesty: -1 }),
      c("จ้องเฟรนช์ฟรายส์เพื่อนแบบสุภาพ", { snackEnergy: 3, drama: 1 })
    ]),
    q("คำว่า “ขอชิมนิดเดียว” ของคุณใหญ่แค่ไหน?", [
      c("หนึ่งคำจริง ๆ และขอบคุณ", { honesty: 3, responsibility: 2 }),
      c("หนึ่งคำที่ต้องมีมุมสวยของจาน", { chaos: 2, drama: 1 }),
      c("ชิมแล้วทำเป็นลืมนับ", { ghosting: 2, honesty: -1 }),
      c("ชิมจนเฟรนช์ฟรายส์หายไปหนึ่งโซน", { snackEnergy: 3, chaos: 2 })
    ]),
    q("เพื่อนหันมาเห็นคุณกินของเขา คุณพูดอะไร?", [
      c("ขอโทษ เดี๋ยวสั่งคืนให้", { honesty: 3, responsibility: 3 }),
      c("มันเดินเข้าปากเองแบบมีพยานน้อย", { chaos: 3, drama: 2 }),
      c("เปลี่ยนเรื่องถามน้ำจิ้ม", { ghosting: 2, honesty: -1 }),
      c("จานนี้อร่อยจนศาลควรรับรู้", { snackEnergy: 3, drama: 1 })
    ]),
    q("ถ้าเพื่อนบอกให้สั่งเอง คุณทำยังไง?", [
      c("สั่งจานเล็กของตัวเอง", { responsibility: 3, honesty: 2 }),
      c("บอกว่าไม่ทันแล้ว เราผูกพันกับจานนี้", { drama: 3, chaos: 2 }),
      c("รอเขาเผลอแล้วชิมอีกนิด", { ghosting: 3, honesty: -2 }),
      c("สั่งของกินเล่นกลางโต๊ะทันที", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("หลักฐานที่หนักที่สุดคืออะไร?", [
      c("ยอมรับว่ากินไปหลายคำ", { honesty: 3, responsibility: 1 }),
      c("รอยซอสบนมือที่ปฏิเสธไม่ได้", { chaos: 2, drama: 2 }),
      c("คำว่าไม่หิวในแชตเมื่อห้านาทีก่อน", { ghosting: 1, honesty: -1 }),
      c("เฟรนช์ฟรายส์ลดระดับแบบเห็นได้ชัด", { snackEnergy: 3, chaos: 1 })
    ]),
    q("บทลงโทษคนไม่หิวแต่ชิมเก่งคือ?", [
      c("สั่งของตัวเองตั้งแต่แรก", { responsibility: 3, honesty: 2 }),
      c("ถือป้ายขอชิมอย่างเป็นทางการ", { chaos: 2, drama: 1 }),
      c("ห้ามพูดไม่หิวถ้าตายังมองจาน", { honesty: 2, responsibility: 2 }),
      c("เลี้ยงเฟรนช์ฟรายส์กองกลาง", { snackEnergy: 3, responsibility: 2 })
    ])
  ],
  "sticker-only": [
    q("เพื่อนถามคำถามจริงจัง คุณส่งสติกเกอร์แบบไหน?", [
      c("ส่งข้อความตอบก่อนแล้วค่อยแปะสติกเกอร์", { responsibility: 3, honesty: 2 }),
      c("ส่งหน้ายิ้มที่ตีความได้สิบทาง", { chaos: 2, drama: 1 }),
      c("ส่งตัวละครหลบหลังประตู", { ghosting: 3, honesty: -1 }),
      c("ส่งสติกเกอร์กินข้าวแทนคำว่าเดี๋ยวตอบ", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ทำไมถึงชอบใช้สติกเกอร์แทนคำตอบ?", [
      c("ช่วยให้นุ่มขึ้น แต่ยังควรพิมพ์เสริม", { honesty: 2, responsibility: 2 }),
      c("ภาพเดียวมีอารมณ์ครบกว่าสามบรรทัด", { drama: 2, chaos: 2 }),
      c("ไม่อยากตอบตรง ๆ เลยให้ตัวการ์ตูนรับหน้า", { ghosting: 3, honesty: -1 }),
      c("สติกเกอร์ของกินเข้าใจง่ายที่สุด", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนตอบกลับว่า “แปลว่าอะไร” คุณทำยังไง?", [
      c("แปลเป็นคำพูดให้ทันที", { responsibility: 3, honesty: 2 }),
      c("ส่งอีกตัวที่ยิ่งลึกลับกว่า", { chaos: 3, drama: 1 }),
      c("หายไปเพราะสติกเกอร์หมดหน้าที่", { ghosting: 3, responsibility: -1 }),
      c("บอกว่าแปลว่าหิว ไปกินไหม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("สถานการณ์ไหนไม่ควรตอบด้วยสติกเกอร์อย่างเดียว?", [
      c("ตอนนัดเวลาและสถานที่", { responsibility: 3, honesty: 1 }),
      c("ตอนเพื่อนกำลังเปิดคดีใหญ่", { drama: 2, honesty: 1 }),
      c("ตอนเราอ่านแล้วอยากหลบ", { ghosting: 2, responsibility: -1 }),
      c("ตอนหาร้านข้าวแต่ส่งรูปขนม", { snackEnergy: 2, chaos: 1 })
    ]),
    q("สติกเกอร์ที่ส่งผิดทำให้เกิดอะไร?", [
      c("รีบแก้ด้วยข้อความจริง", { honesty: 3, responsibility: 2 }),
      c("ห้องแชตหัวเราะแต่คดีงง", { chaos: 3, drama: 1 }),
      c("ทำเป็นส่งผิดแล้วหาย", { ghosting: 3, honesty: -1 }),
      c("กลายเป็นนัดกินข้าวเฉย", { snackEnergy: 3, chaos: 1 })
    ]),
    q("กติกาศาลสำหรับสายสติกเกอร์คือ?", [
      c("เรื่องสำคัญต้องมีตัวหนังสือ", { responsibility: 3, honesty: 2 }),
      c("สติกเกอร์ได้ แต่ห้ามเกินสองตัวติด", { chaos: -1, responsibility: 2 }),
      c("ห้ามใช้สติกเกอร์หลบคำถาม", { ghosting: -2, honesty: 2 }),
      c("อนุญาตสติกเกอร์ของกินเฉพาะพักเที่ยง", { snackEnergy: 2, chaos: 1 })
    ])
  ],
  "memory-weird": [
    q("เรื่องสำคัญที่คุณลืมล่าสุดเป็นแนวไหน?", [
      c("เวลานัดที่ควรจด", { responsibility: -1, honesty: 2 }),
      c("รายละเอียดแพลนที่คุยกันสามวัน", { chaos: 2, drama: 1 }),
      c("ข้อความที่อ่านแล้วคิดว่าตอบแล้ว", { ghosting: 3, responsibility: -1 }),
      c("ร้านที่เพื่อนบอกว่าปิดวันจันทร์", { snackEnergy: 2, honesty: 1 })
    ]),
    q("แล้วเรื่องไร้สาระที่จำได้แม่นคืออะไร?", [
      c("มุกในแชตเมื่อห้าปีก่อน", { honesty: 2, chaos: 1 }),
      c("ชุดที่เพื่อนใส่ในวันฝนตกปีนั้น", { drama: 2, chaos: 2 }),
      c("ประโยคที่เคยโดนแซวแต่ไม่ตอบ", { ghosting: 1, drama: 1 }),
      c("เมนูที่ใครสั่งแล้วไม่อร่อย", { snackEnergy: 3, honesty: 1 })
    ]),
    q("เพื่อนเตือนนัดสำคัญ คุณเก็บข้อมูลยังไง?", [
      c("บันทึกปฏิทินทันที", { responsibility: 3, honesty: 2 }),
      c("ฝากสมองด้วยคำคล้องจองแปลก ๆ", { chaos: 2, drama: 1 }),
      c("พิมพ์ว่าโอเคแต่ไม่เซฟ", { ghosting: 2, responsibility: -1 }),
      c("ผูกกับชื่อร้านที่จะไปกิน", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("ตอนโดนถามว่าจำได้ไหม คุณตอบอย่างไร?", [
      c("จำไม่ได้ ขอดูรายละเอียดอีกที", { honesty: 3, responsibility: 2 }),
      c("จำได้ว่ามีเรื่องใหญ่ แต่เรื่องอะไรนะ", { chaos: 2, drama: 2 }),
      c("ยิ้มเงียบเหมือนโหลดข้อมูล", { ghosting: 2, honesty: -1 }),
      c("จำได้ว่าหลังจากนั้นเรากินอะไร", { snackEnergy: 3, chaos: 1 })
    ]),
    q("หลักฐานว่าสมองคุณเลือกจำคืออะไร?", [
      c("ลืมวันนัดแต่จำรหัสไวไฟบ้านเพื่อน", { chaos: 2, honesty: 2 }),
      c("จำสีแก้วน้ำได้แม่นกว่าวันเวลา", { drama: 1, chaos: 2 }),
      c("จำว่าเคยอ่านแล้ว แต่ไม่จำว่าตอบยัง", { ghosting: 3, responsibility: -1 }),
      c("จำราคาเมนูพิเศษได้ถึงบาท", { snackEnergy: 3, honesty: 1 })
    ]),
    q("วิธีปรับปรุงความจำแบบศาลอนุมัติคือ?", [
      c("จดทันที ไม่ฝากอนาคต", { responsibility: 3, honesty: 2 }),
      c("ตั้งชื่อแจ้งเตือนให้ตลกจนจำได้", { chaos: 1, responsibility: 2 }),
      c("ตอบรับพร้อมหลักฐานว่าเซฟแล้ว", { ghosting: -1, responsibility: 3 }),
      c("ผูกนัดกับของกินได้ แต่ต้องจดด้วย", { snackEnergy: 2, responsibility: 2 })
    ])
  ],
  "playlist-judge": [
    q("คุณเปิดเพลงแรกในรถด้วยความมั่นใจระดับไหน?", [
      c("เช็กแนวเพลงที่ทุกคนชอบก่อน", { responsibility: 3, honesty: 2 }),
      c("เปิดเพลงลับที่อยากให้โลกค้นพบ", { chaos: 3, drama: 2 }),
      c("ไม่ถามใครแล้วทำเป็นมองวิว", { ghosting: 1, honesty: -1 }),
      c("เลือกเพลงจากชื่อร้านที่กำลังไป", { snackEnergy: 2, chaos: 1 })
    ]),
    q("ทุกคนเงียบหลังเพลงขึ้น คุณตีความว่าอะไร?", [
      c("อาจไม่ใช่แนวนี้ เปลี่ยนได้", { honesty: 2, responsibility: 3 }),
      c("ทุกคนกำลังซึมซับศิลปะ", { drama: 3, chaos: 1 }),
      c("เงียบแปลว่าไม่มีใครค้าน", { ghosting: 1, honesty: -1 }),
      c("ต้องเปิดเพลงกินข้าวให้บรรยากาศดี", { snackEnergy: 2, chaos: 1 })
    ]),
    q("เพื่อนขอข้ามเพลง คุณทำยังไง?", [
      c("ข้ามทันทีแล้วให้คนอื่นเลือก", { responsibility: 3, honesty: 2 }),
      c("ขอท่อนฮุคอีกสิบวินาที", { drama: 2, chaos: 2 }),
      c("ทำเหมือนไม่ได้ยินเสียงขอข้าม", { ghosting: 2, honesty: -1 }),
      c("แลกด้วยการแวะซื้อของกิน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพลงแบบไหนที่คุณชอบแทรกในเพลย์ลิสต์?", [
      c("เพลงที่เข้ากับบรรยากาศจริง", { responsibility: 2, honesty: 2 }),
      c("เพลงอินดี้ที่ชื่อยาวมาก", { chaos: 3, drama: 1 }),
      c("เพลงที่ไม่มีใครรู้จักและไม่มีคำอธิบาย", { ghosting: 1, chaos: 2 }),
      c("เพลงโฆษณาขนมในความทรงจำ", { snackEnergy: 3, drama: 1 })
    ]),
    q("ถ้าเพื่อนให้เป็นดีเจต่อ คุณตั้งกติกาอะไร?", [
      c("ให้ทุกคนแอดเพลงคนละหนึ่ง", { responsibility: 3, honesty: 1 }),
      c("ทำช่วงทดลองเพลงแปลก 5 นาที", { chaos: 3, drama: 2 }),
      c("ไม่พูดเยอะ เพลงจะพิสูจน์เอง", { ghosting: 1, drama: 1 }),
      c("มีเพลงพักกินขนมคั่นกลาง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("บทลงโทษดีเจทำรถเงียบคือ?", [
      c("ให้เพื่อนโหวตก่อนเปิด", { responsibility: 3, honesty: 2 }),
      c("เขียนคำโปรยเพลงให้ทุกคนเตรียมใจ", { drama: 2, chaos: 1 }),
      c("หยุดผูกขาดบลูทูธหนึ่งทริป", { responsibility: 2, ghosting: -1 }),
      c("เปิดเพลงร้านขนมเฉพาะตอนใกล้ถึง", { snackEnergy: 2, chaos: 1 })
    ])
  ],
  "photo-delay": [
    q("ถ่ายรูปให้เพื่อน 40 รูป ทำไมส่งแค่ 2?", [
      c("กำลังคัดรูปที่ดีที่สุดจริง", { responsibility: 2, honesty: 2 }),
      c("ติดแต่งแสงจนรูปเหมือนงานประกวด", { drama: 2, chaos: 2 }),
      c("ลืมว่าอัลบั้มยังอยู่ในเครื่อง", { ghosting: 3, responsibility: -1 }),
      c("มัวแต่งรูปอาหารก่อน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนทวงรูป คุณเปิดแกลเลอรียังไง?", [
      c("ส่งทั้งอัลบั้มให้เลือกเอง", { responsibility: 3, honesty: 2 }),
      c("บอกว่าต้องผ่าน QC ก่อน", { drama: 2, chaos: 1 }),
      c("อ่านแล้วไปค้นรูปแต่ไม่ได้ส่ง", { ghosting: 3, responsibility: -1 }),
      c("ส่งรูปของหวานก่อนเป็นทีเซอร์", { snackEnergy: 3, chaos: 1 })
    ]),
    q("รูปที่ไม่ส่งถูกกักเพราะอะไร?", [
      c("เบลอหรือหลับตาจริง", { honesty: 2, responsibility: 1 }),
      c("มุมยังไม่สมศักดิ์ศรีเพื่อน", { drama: 3, chaos: 1 }),
      c("กลัวส่งแล้วต้องอธิบายทุกรูป", { ghosting: 2, responsibility: -1 }),
      c("ติดรูปจานอาหารบังเฟรม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("คุณมีระบบส่งรูปแบบไหน?", [
      c("สร้างอัลบั้มแล้วแชร์ลิงก์", { responsibility: 3, honesty: 2 }),
      c("ส่งทีละรูปพร้อมคำวิจารณ์", { drama: 2, chaos: 2 }),
      c("รอให้คนทวงครบสามรอบ", { ghosting: 3, honesty: -1 }),
      c("แยกอัลบั้มคนกับของกิน", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("เพื่อนอยากได้รูปด่วนเพื่อลงสตอรี่ คุณทำอะไร?", [
      c("ส่งรูปใช้ได้ทันทีสามใบ", { responsibility: 3, honesty: 2 }),
      c("รีบแต่งสีแบบไฟไหม้แต่สวย", { chaos: 2, drama: 2 }),
      c("บอกแป๊บแล้วหายเข้าแกลเลอรี", { ghosting: 3, responsibility: -1 }),
      c("ส่งรูปคู่กับเครื่องดื่มก่อน", { snackEnergy: 2, chaos: 1 })
    ]),
    q("คำสั่งศาลช่างภาพดองรูปคือ?", [
      c("ส่งรูปดิบก่อนแต่งเสมอ", { responsibility: 3, honesty: 2 }),
      c("ตั้งเดดไลน์อัลบั้มหลังกลับบ้าน", { responsibility: 3, chaos: 1 }),
      c("ห้ามพูดว่าเดี๋ยวส่งถ้ายังไม่เปิดแกลเลอรี", { honesty: 2, ghosting: -1 }),
      c("แต่งรูปอาหารหลังส่งรูปคน", { snackEnergy: 2, responsibility: 2 })
    ])
  ],
  "group-chat-lurker": [
    q("แชตกลุ่มถามความเห็น คุณทำอะไร?", [
      c("ตอบสั้น ๆ ว่าเลือกข้อไหน", { responsibility: 3, honesty: 2 }),
      c("กดรีแอ็กชันเหมือนลงคะแนนลับ", { chaos: 1, ghosting: 1 }),
      c("อ่านครบแล้ววางมือถือเงียบ", { ghosting: 3, responsibility: -1 }),
      c("โผล่เฉพาะตอนคุยเรื่องกิน", { snackEnergy: 3, honesty: 1 })
    ]),
    q("ทำไมคุณไม่ค่อยพิมพ์ในกลุ่ม?", [
      c("กลัวข้อมูลซ้ำ เลยรอจังหวะ", { honesty: 2, responsibility: 1 }),
      c("แชตไหลเร็วเหมือนแม่น้ำคดี", { chaos: 2, drama: 1 }),
      c("อยู่เงียบ ๆ ปลอดภัยกว่า", { ghosting: 3, honesty: -1 }),
      c("รอประเด็นร้านข้าวค่อยมีพลัง", { snackEnergy: 3, ghosting: 1 })
    ]),
    q("เพื่อนแท็กชื่อคุณในกลุ่ม คุณตอบยังไง?", [
      c("ตอบทันทีว่าโอเคหรือไม่โอเค", { responsibility: 3, honesty: 2 }),
      c("ส่งประโยคเดียวแต่ทำให้ทุกคนตื่น", { drama: 2, chaos: 2 }),
      c("เห็นแท็กแล้วขอทำใจก่อน", { ghosting: 3, responsibility: -1 }),
      c("ถามว่าหลังตกลงแล้วกินอะไร", { snackEnergy: 3, chaos: 1 })
    ]),
    q("คุณช่วยกลุ่มแบบเงียบ ๆ อย่างไร?", [
      c("อ่านสรุปแล้วจำรายละเอียดให้", { responsibility: 2, honesty: 2 }),
      c("จับผิดไทม์ไลน์ในใจอย่างจริงจัง", { drama: 1, chaos: 1 }),
      c("ไม่พิมพ์ แต่จำทุกหลักฐาน", { ghosting: 2, honesty: 1 }),
      c("เซฟร้านอาหารที่ทุกคนพูดถึง", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("ถ้าต้องโหวตภายในหนึ่งนาที?", [
      c("กดเลือกแล้วพิมพ์ยืนยัน", { responsibility: 3, honesty: 2 }),
      c("โหวตตัวเลือกที่ชื่อดูมีคอนเทนต์", { chaos: 2, drama: 1 }),
      c("รอคนส่วนใหญ่ก่อนค่อยตาม", { ghosting: 2, responsibility: -1 }),
      c("เลือกตัวที่มีของกินใกล้สุด", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ศาลแชตกลุ่มควรสั่งอะไร?", [
      c("ตอบอย่างน้อยหนึ่งประโยคเมื่อถูกถาม", { responsibility: 3, honesty: 2 }),
      c("ใช้รีแอ็กชันได้แต่ต้องชัด", { chaos: -1, responsibility: 2 }),
      c("เลิกเป็นเงาเฉพาะตอนตัดสินใจ", { ghosting: -2, honesty: 1 }),
      c("รับหน้าที่สรุปร้านกินหลังเงียบมานาน", { snackEnergy: 2, responsibility: 2 })
    ])
  ],
  "weather-excuse": [
    q("อากาศร้อนมาก คุณใช้เป็นเหตุผลยังไง?", [
      c("ขอปรับเวลาหรือที่นัดให้เหมาะ", { responsibility: 3, honesty: 2 }),
      c("ประกาศว่าดวงอาทิตย์เป็นพยานฝ่ายตรงข้าม", { drama: 3, chaos: 2 }),
      c("เงียบจนเพื่อนเดาว่าคงละลาย", { ghosting: 3, responsibility: -1 }),
      c("เสนอที่มีแอร์และของหวาน", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("ฝนเริ่มตกตอนใกล้ออก คุณทำอะไร?", [
      c("บอกเพื่อนและเช็กเส้นทางใหม่", { responsibility: 3, honesty: 2 }),
      c("ถ่ายรูปฟ้าเหมือนรายงานข่าว", { drama: 2, chaos: 1 }),
      c("ใช้ฝนเป็นเหตุพักการตอบ", { ghosting: 2, honesty: -1 }),
      c("รอฝนซาในคาเฟ่", { snackEnergy: 3, chaos: 1 })
    ]),
    q("อากาศเย็นนิดเดียวส่งผลกับคุณแค่ไหน?", [
      c("พกเสื้อแล้วไปตามนัด", { responsibility: 3, honesty: 1 }),
      c("อยากห่มผ้าและเขียนคำร้อง", { drama: 2, chaos: 1 }),
      c("อ่านแชตบนเตียงแล้วไม่ขยับ", { ghosting: 3, responsibility: -1 }),
      c("ต้องมีเครื่องดื่มอุ่นก่อนออก", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนบอกว่าอากาศก็ดีอยู่นะ คุณตอบอะไร?", [
      c("โอเค งั้นไปตามแผนเดิม", { honesty: 2, responsibility: 3 }),
      c("ดีสำหรับเธอ แต่ใจเรามีเมฆ", { drama: 3, chaos: 1 }),
      c("ส่งสติกเกอร์อากาศแล้วเงียบ", { ghosting: 2, honesty: -1 }),
      c("ดีพอสำหรับนั่งกิน ไม่พอสำหรับเดินไกล", { snackEnergy: 3, honesty: 1 })
    ]),
    q("ข้ออ้างอากาศที่คุณใช้บ่อยสุดคือ?", [
      c("ร้อนจนต้องเลือกที่ใกล้ขึ้น", { honesty: 2, responsibility: 1 }),
      c("ครึ้ม ๆ แบบใจต้องระวัง", { drama: 2, chaos: 1 }),
      c("ฟ้าดูไม่เป็นใจ เลยไม่ตอบก่อน", { ghosting: 3, honesty: -1 }),
      c("อากาศนี้เหมาะกับของทอด", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ทางออกที่ศาลอากาศอนุมัติคือ?", [
      c("เช็กพยากรณ์แล้วเสนอแผนสำรอง", { responsibility: 3, honesty: 2 }),
      c("ให้คะแนนอากาศก่อนเลือกกิจกรรม", { chaos: 1, drama: 1 }),
      c("ห้ามใช้อากาศแทนคำตอบ", { ghosting: -2, responsibility: 2 }),
      c("เลือกที่นั่งสบายพร้อมเมนูเย็น", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "battery-one": [
    q("แบตเหลือ 1% ตอนเพื่อนถามเรื่องสำคัญ คุณทำอะไร?", [
      c("ตอบใจความก่อนเครื่องดับ", { responsibility: 3, honesty: 2 }),
      c("ส่งข้อความยาวจนแบตลุ้นตาม", { chaos: 2, drama: 2 }),
      c("อ่านแล้วหวังว่าเครื่องดับจะเข้าใจ", { ghosting: 3, honesty: -1 }),
      c("หาโต๊ะใกล้ปลั๊กในร้านน้ำ", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("ทำไมแบตถึงเหลือน้อยขนาดนั้น?", [
      c("ลืมชาร์จจริงและควรรับผิด", { honesty: 3, responsibility: -1 }),
      c("ถ่ายรูปกับเปิดแผนที่จนเครื่องเหนื่อย", { chaos: 2, drama: 1 }),
      c("เห็นแบตเตือนแล้วเลื่อนทิ้ง", { ghosting: 2, responsibility: -1 }),
      c("ดูเมนูนานกว่าที่คิด", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ก่อนเครื่องดับ คุณเลือกส่งอะไร?", [
      c("เวลา สถานที่ และคำตอบหลัก", { responsibility: 3, honesty: 2 }),
      c("เสียงวอยซ์รีบ ๆ เหมือนข่าวด่วน", { chaos: 2, drama: 2 }),
      c("ส่งคำว่าเดี๋ยว แล้วจอมืด", { ghosting: 3, responsibility: -1 }),
      c("ส่งพิกัดร้านที่มีปลั๊ก", { snackEnergy: 2, responsibility: 2 })
    ]),
    q("เพื่อนถามว่าทำไมไม่พกพาวเวอร์แบงก์?", [
      c("ยอมรับว่าลืมและจะพกครั้งหน้า", { honesty: 3, responsibility: 2 }),
      c("บอกว่ากระเป๋าวันนี้ไม่รับพลังงานเพิ่ม", { drama: 2, chaos: 1 }),
      c("เงียบเพราะเครื่องดับจริง", { ghosting: 3, honesty: 1 }),
      c("ขอยืมปลั๊กแลกขนม", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("หลักฐานแบต 1% ของคุณน่าเชื่อไหม?", [
      c("มีภาพหน้าจอก่อนดับ", { honesty: 3, responsibility: 1 }),
      c("มีประวัติแบตแดงประจำ", { chaos: 2, responsibility: -1 }),
      c("ไม่มี เพราะเครื่องดับพร้อมหลักฐาน", { ghosting: 2, honesty: -1 }),
      c("มีใบเสร็จคาเฟ่ที่ไปหาปลั๊ก", { snackEnergy: 3, honesty: 1 })
    ]),
    q("คำสั่งศาลแบตต่ำคือ?", [
      c("ตอบเรื่องสำคัญก่อนเปิดแอปอื่น", { responsibility: 3, honesty: 2 }),
      c("ตั้งแจ้งเตือนชาร์จตอน 20%", { responsibility: 3, chaos: 1 }),
      c("ห้ามใช้แบตหมดเป็นผ้าคลุมคดี", { ghosting: -2, honesty: 2 }),
      c("จองที่นั่งใกล้ปลั๊กแบบมีของกิน", { snackEnergy: 2, responsibility: 1 })
    ])
  ],
  "map-confident": [
    q("คุณพูดว่า “ทางนี้แน่นอน” เพราะอะไร?", [
      c("เคยมาและจำจุดสังเกตได้", { honesty: 2, responsibility: 2 }),
      c("ทิศนี้รู้สึกมีออร่า", { chaos: 3, drama: 2 }),
      c("ไม่อยากยอมรับว่าเปิดแผนที่ไม่ทัน", { ghosting: 2, honesty: -2 }),
      c("จำได้ว่ามีร้านขนมทางนี้", { snackEnergy: 3, chaos: 1 })
    ]),
    q("GPS บอกอีกทาง แต่ใจคุณบอกอีกทาง คุณเลือกอะไร?", [
      c("เช็ก GPS และถามเพื่อนก่อน", { responsibility: 3, honesty: 2 }),
      c("เชื่อสัญชาตญาณแล้วประกาศมั่นใจ", { chaos: 3, drama: 2 }),
      c("เดินต่อเงียบ ๆ เผื่อถูก", { ghosting: 2, honesty: -1 }),
      c("เลือกทางที่ผ่านของกิน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("พอเริ่มหลง คุณทำหน้าแบบไหน?", [
      c("ยอมรับว่าอาจพาผิดทาง", { honesty: 3, responsibility: 2 }),
      c("บอกว่านี่คือเส้นทางชมเมือง", { drama: 3, chaos: 2 }),
      c("รีบเปิดแผนที่แบบไม่ให้ใครเห็น", { ghosting: 2, responsibility: -1 }),
      c("ชี้ร้านใกล้ ๆ แล้วขอพักกิน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนถามว่าเหลือกี่นาทีถึง คุณตอบยังไง?", [
      c("อ่านเวลาจากแผนที่จริง", { honesty: 3, responsibility: 3 }),
      c("บอกว่าใกล้แล้วแต่เสียงเริ่มเบา", { drama: 2, honesty: -1 }),
      c("เลี่ยงตอบด้วยการถามว่าเหนื่อยไหม", { ghosting: 2, responsibility: -1 }),
      c("บอกว่าใกล้ของกินก่อน ใกล้ที่หมายทีหลัง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("จุดสังเกตที่คุณใช้บอกทางคืออะไร?", [
      c("ชื่อถนนและป้ายที่เห็นจริง", { responsibility: 3, honesty: 2 }),
      c("ตึกสีที่อาจเคยมีอยู่", { chaos: 3, drama: 1 }),
      c("ความทรงจำลาง ๆ เมื่อปีที่แล้ว", { ghosting: 1, honesty: -1 }),
      c("กลิ่นร้านขนมที่จำแม่น", { snackEnergy: 3, chaos: 1 })
    ]),
    q("คำสั่งศาลนำทางคือ?", [
      c("เปิดแผนที่ก่อนพูดว่ามั่นใจ", { responsibility: 3, honesty: 2 }),
      c("ให้คะแนนความมั่นใจเป็นเปอร์เซ็นต์", { chaos: 1, drama: 1 }),
      c("ห้ามเดินเงียบเมื่อเริ่มหลง", { ghosting: -2, responsibility: 2 }),
      c("หลงได้แต่ต้องมีจุดพักกินที่ชัด", { snackEnergy: 3, chaos: 1 })
    ])
  ],
  "voice-note-long": [
    q("ทำไมคำว่าโอเคถึงกลายเป็นวอยซ์ 5 นาที?", [
      c("อยากอธิบายเงื่อนไขให้ครบ", { honesty: 2, responsibility: 2 }),
      c("เริ่มพูดแล้วเจอประเด็นใหม่เอง", { chaos: 3, drama: 2 }),
      c("ไม่อยากพิมพ์ เลยโยนให้เสียงทำงาน", { ghosting: 1, responsibility: -1 }),
      c("มือไม่ว่างเพราะถือขนม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ก่อนกดส่งวอยซ์ยาว คุณคิดถึงคนฟังไหม?", [
      c("คิดและสรุปท้ายคลิปไว้ให้", { responsibility: 3, honesty: 2 }),
      c("คิดว่าเพื่อนน่าจะชอบพอดแคสต์นี้", { drama: 3, chaos: 1 }),
      c("ส่งก่อน ถ้าไม่ฟังก็ค่อยว่ากัน", { ghosting: 2, honesty: -1 }),
      c("หวังว่าเสียงแกะถุงจะไม่ดังมาก", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนตอบว่า “สรุปคืออะไร” คุณทำอะไร?", [
      c("พิมพ์สรุปหนึ่งบรรทัดให้", { responsibility: 3, honesty: 2 }),
      c("บอกให้ฟังช่วงนาทีที่สาม", { drama: 2, chaos: 2 }),
      c("อ่านแล้วคิดว่าจะสรุปทีหลัง", { ghosting: 3, responsibility: -1 }),
      c("ส่งสรุปพร้อมถามกินอะไร", { snackEnergy: 2, responsibility: 1 })
    ]),
    q("ส่วนไหนในวอยซ์ควรถูกตัดออก?", [
      c("ช่วงคิดคำพูดกลางคลิป", { honesty: 1, responsibility: 2 }),
      c("บทนำยาวกว่าประเด็น", { drama: 2, chaos: 2 }),
      c("ช่วงเงียบเพราะไปทำอย่างอื่น", { ghosting: 2, responsibility: -1 }),
      c("เสียงเคี้ยวที่ไม่ใช่หลักฐาน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าศาลจำกัดวอยซ์ 20 วินาที คุณจะพูดอะไร?", [
      c("ใจความหลักและคำตอบสุดท้าย", { responsibility: 3, honesty: 2 }),
      c("พูดเร็วแบบประกาศรถไฟ", { chaos: 3, drama: 1 }),
      c("ส่งสองคลิป 20 วินาทีแทน", { ghosting: 1, honesty: -1 }),
      c("ขอกินให้หมดก่อนจะได้ชัด", { snackEnergy: 3, responsibility: -1 })
    ]),
    q("โทษของวอยซ์ยาวควรเป็นอะไร?", [
      c("แนบสรุปทุกครั้ง", { responsibility: 3, honesty: 2 }),
      c("ตั้งชื่อตอนให้วอยซ์แต่ละคลิป", { chaos: 2, drama: 2 }),
      c("ห้ามส่งวอยซ์แทนคำว่าโอเค", { responsibility: 2, ghosting: -1 }),
      c("เลี้ยงน้ำคนฟังจนจบ", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "same-outfit": [
    q("คำว่าแต่งชิล ๆ ในใจคุณแปลว่าอะไร?", [
      c("สบายและเข้ากับสถานที่", { honesty: 2, responsibility: 3 }),
      c("ชิลแบบคิดมาแล้วทุกชั้น", { drama: 2, chaos: 2 }),
      c("ไม่ตอบเรื่องเดรสโค้ดแต่เตรียมเต็ม", { ghosting: 2, honesty: -1 }),
      c("ชุดที่ถ่ายกับของหวานแล้วสวย", { snackEnergy: 2, drama: 1 })
    ]),
    q("เพื่อนเห็นคุณแต่งเต็มสุดในกลุ่ม คุณพูดอะไร?", [
      c("ขอโทษ เข้าใจคำว่าชิลไม่ตรงกัน", { honesty: 3, responsibility: 2 }),
      c("นี่คือชิลเวอร์ชันพิธีเปิด", { drama: 3, chaos: 2 }),
      c("ยิ้มแล้วเปลี่ยนเรื่องอากาศ", { ghosting: 2, honesty: -1 }),
      c("ถามว่าถ่ายรูปก่อนกินไหม", { snackEnergy: 2, chaos: 1 })
    ]),
    q("คุณใช้เวลาเลือกชุดนานเพราะอะไร?", [
      c("อยากให้เหมาะกับกิจกรรม", { responsibility: 2, honesty: 2 }),
      c("ทุกพร็อพมีหน้าที่ของมัน", { drama: 3, chaos: 2 }),
      c("ไม่อยากบอกในกลุ่มว่าจริงจัง", { ghosting: 2, honesty: -1 }),
      c("เลือกตามร้านที่จะไปกิน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้ากลุ่มบอกว่าชุดคุณเด่นมาก คุณทำอย่างไร?", [
      c("รับฟังและลดพร็อพถ้าจำเป็น", { responsibility: 3, honesty: 2 }),
      c("ประกาศว่าศาลแฟชั่นเปิดแล้ว", { drama: 3, chaos: 2 }),
      c("ยืนหลังสุดเพื่อไม่ให้เด่นเพิ่ม", { ghosting: 2, responsibility: -1 }),
      c("ใช้ถุงขนมเป็นพร็อพกลาง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ภาพหมู่วันนี้จะออกมาแบบไหน?", [
      c("ทุกคนดูเป็นทีมเดียวกัน", { responsibility: 3, honesty: 1 }),
      c("คุณเหมือนแขกรับเชิญพิเศษ", { drama: 3, chaos: 1 }),
      c("คุณหลบมุมแต่ชุดยังเด่น", { ghosting: 2, drama: 1 }),
      c("ชุดเข้ากับโต๊ะของหวานที่สุด", { snackEnergy: 3, chaos: 1 })
    ]),
    q("กติกาเดรสโค้ดรอบหน้าคือ?", [
      c("ตกลงระดับความเต็มก่อนนัด", { responsibility: 3, honesty: 2 }),
      c("ส่ง moodboard ให้กลุ่มดู", { chaos: 1, drama: 2 }),
      c("ห้ามเงียบแล้วแต่งเกินโจทย์", { ghosting: -1, honesty: 2 }),
      c("เลือกชุดที่กินสะดวกด้วย", { snackEnergy: 2, responsibility: 1 })
    ])
  ],
  "queue-escape": [
    q("ฝากเพื่อนต่อคิวแล้วคุณหายไปไหน?", [
      c("ไปทำธุระใกล้ ๆ และบอกเวลา", { responsibility: 3, honesty: 2 }),
      c("เดินดูของจนเวลาไหล", { chaos: 3, drama: 1 }),
      c("คิดว่าคิวยังไกลเลยไม่อัปเดต", { ghosting: 3, responsibility: -1 }),
      c("ไปซื้อของกินกลับมา", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนโทรตามตอนคิวใกล้ถึง คุณรับยังไง?", [
      c("รับแล้วรีบกลับทันที", { responsibility: 3, honesty: 2 }),
      c("รับพร้อมเสียงถุงช้อปปิ้งกรอบแกรบ", { chaos: 2, drama: 2 }),
      c("ไม่ได้ยินเพราะอยู่ในร้าน", { ghosting: 3, responsibility: -1 }),
      c("ถามว่าเอาอะไรเพิ่มไหม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("กลับมาถึงคิวแล้ว คุณทำหน้าแบบไหน?", [
      c("ขอโทษและรับช่วงต่อทันที", { responsibility: 3, honesty: 3 }),
      c("ทำหน้าเหมือนมาทันตามแผน", { drama: 2, chaos: 1 }),
      c("แทรกกลับแบบเนียนที่สุด", { ghosting: 2, honesty: -1 }),
      c("ยื่นขนมเป็นค่าฝากคิว", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("คุณประเมินคิวยังไงถึงกล้าหาย?", [
      c("ดูจำนวนคนแล้วคิดผิด", { honesty: 2, responsibility: 1 }),
      c("เชื่อว่าคิวเคลื่อนช้าเหมือนละคร", { drama: 2, chaos: 2 }),
      c("หวังว่าเพื่อนจะจัดการได้", { ghosting: 2, responsibility: -1 }),
      c("ร้านข้าง ๆ ดูใกล้มากเกินต้าน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าต้องออกจากคิวอีก คุณควรทำอะไร?", [
      c("บอกเวลาและจุดหมายชัด", { responsibility: 3, honesty: 2 }),
      c("ส่งอัปเดตทุกสามนาทีแบบผู้สื่อข่าว", { chaos: 1, responsibility: 2 }),
      c("ไม่ฝากถ้ารู้ว่าตัวเองจะเดินเพลิน", { honesty: 2, responsibility: 2 }),
      c("ซื้อของกินให้คนยืนแทน", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("คำสั่งศาลคิวคืออะไร?", [
      c("ยืนคิวเองหนึ่งรอบเต็ม", { responsibility: 3, honesty: 1 }),
      c("ถือป้ายกลับมาแล้วอยู่จริง", { chaos: 2, drama: 1 }),
      c("ห้ามหายโดยไม่มีเวลาคืนคิว", { ghosting: -2, responsibility: 2 }),
      c("จ่ายค่าขนมคนเฝ้าคิว", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "spoiler-soft": [
    q("คุณบอกว่าไม่สปอยล์ แล้วพูดอะไรออกไป?", [
      c("พูดแค่แนวเรื่องและความรู้สึก", { responsibility: 3, honesty: 2 }),
      c("บอกใบ้จนเพื่อนเริ่มต่อภาพได้", { drama: 3, chaos: 2 }),
      c("หยุดกลางประโยคให้เพื่อนค้าง", { ghosting: 2, drama: 2 }),
      c("เล่าว่าฉากกินข้าวดูน่าอร่อย", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนปิดหูทันที คุณทำอะไร?", [
      c("หยุดและเปลี่ยนหัวข้อ", { responsibility: 3, honesty: 2 }),
      c("กระซิบว่าแค่นิดเดียวเอง", { drama: 2, chaos: 2 }),
      c("พิมพ์ต่อในแชตแทนเสียง", { ghosting: 1, honesty: -1 }),
      c("ชวนไปซื้อป๊อปคอร์นล้างคดี", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("คำว่ารีวิวแบบปลอดภัยของคุณคืออะไร?", [
      c("ให้คะแนน ไม่แตะเนื้อเรื่อง", { responsibility: 3, honesty: 2 }),
      c("พูดบรรยากาศจนเกือบเฉลย", { drama: 3, chaos: 1 }),
      c("ส่งลิงก์ตัวอย่างแล้วปล่อยให้เดา", { ghosting: 2, responsibility: -1 }),
      c("รีวิวเมนูในเรื่องแทนพล็อต", { snackEnergy: 3, chaos: 1 })
    ]),
    q("อะไรคือเส้นแบ่งระหว่างใบ้กับสปอยล์?", [
      c("ถ้าเดาตอนจบได้คือเกิน", { honesty: 3, responsibility: 2 }),
      c("ถ้าเพื่อนตาโตคือใกล้เส้น", { drama: 2, chaos: 1 }),
      c("ถ้าเราเริ่มพูดว่า ไม่บอกนะ แปลว่าเสี่ยง", { ghosting: 1, honesty: 1 }),
      c("ถ้าพูดถึงอาหารยังปลอดภัยกว่า", { snackEnergy: 2, chaos: 1 })
    ]),
    q("เพื่อนยังไม่ได้ดู แต่คุณอินมาก คุณระบายยังไง?", [
      c("จดไว้แล้วรอเขาดูจบ", { responsibility: 3, honesty: 2 }),
      c("คุยกับคนที่ดูแล้วในห้องแยก", { chaos: 1, responsibility: 2 }),
      c("ส่งสติกเกอร์น้ำตาแล้วไม่อธิบาย", { ghosting: 2, drama: 1 }),
      c("ชวนกินข้าวแล้วพูดแค่ฟีล", { snackEnergy: 3, honesty: 1 })
    ]),
    q("โทษสปอยล์นุ่มควรเป็นอะไร?", [
      c("ถามก่อนทุกครั้งว่าเล่าได้ไหม", { responsibility: 3, honesty: 2 }),
      c("ใช้คำว่ารีวิว ไม่ใช่เล่าทั้งเรื่อง", { honesty: 2, responsibility: 2 }),
      c("ห้ามพูดนิดเดียวถ้านิดเดียวคือจุดสำคัญ", { drama: -1, responsibility: 2 }),
      c("เลี้ยงป๊อปคอร์นปลอบใจ", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "borrow-charger": [
    q("ตอนยืมสายชาร์จ คุณพูดว่าจะคืนเมื่อไร?", [
      c("ชาร์จพอส่งข้อความแล้วคืน", { responsibility: 3, honesty: 2 }),
      c("อีก 5% ที่มีภาคต่อ", { chaos: 2, drama: 1 }),
      c("ไม่ได้กำหนด เพราะสายเริ่มอบอุ่น", { ghosting: 2, honesty: -1 }),
      c("คืนหลังสั่งของกินเสร็จ", { snackEnergy: 3, chaos: 1 })
    ]),
    q("สายชาร์จเพื่อนไปตั้งรกรากตรงไหน?", [
      c("ข้างมือถือพร้อมคืน", { responsibility: 3, honesty: 2 }),
      c("โต๊ะรวมสายที่ไม่มีใครเป็นเจ้าของ", { chaos: 3, drama: 1 }),
      c("ในกระเป๋าที่หาไม่เจอ", { ghosting: 3, responsibility: -1 }),
      c("ข้างถุงขนมและแก้วน้ำ", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนแบตแดงแล้วขอสายคืน คุณทำอะไร?", [
      c("ถอดคืนทันที", { responsibility: 3, honesty: 2 }),
      c("ขอต่ออีกนิดด้วยเสียงอ้อน", { drama: 2, chaos: 1 }),
      c("ทำเป็นกำลังหา ทั้งที่ยังเสียบอยู่", { ghosting: 3, honesty: -2 }),
      c("เสนอพาไปปลั๊กพร้อมซื้อขนม", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("ข้ออ้างเรื่องสายชาร์จที่ใช้บ่อยคือ?", [
      c("เดี๋ยวถอดให้จริง ๆ", { honesty: 2, responsibility: 1 }),
      c("อีกนิดเดียวจะเต็มแบบมีหวัง", { drama: 2, chaos: 1 }),
      c("นึกว่าเป็นสายส่วนกลาง", { ghosting: 2, honesty: -2 }),
      c("ต้องชาร์จไว้ดูเมนูให้ทีม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าสายเพื่อนหายชั่วคราว คุณจัดการยังไง?", [
      c("ช่วยค้นจนเจอและขอโทษ", { responsibility: 3, honesty: 2 }),
      c("ทำแผนที่สายชาร์จในห้อง", { chaos: 2, drama: 1 }),
      c("นิ่งเพราะกลัวเป็นผู้ต้องสงสัย", { ghosting: 3, honesty: -1 }),
      c("ล่อสายออกมาด้วยโต๊ะขนม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("กติกายืมสายครั้งหน้าคือ?", [
      c("ตั้งเวลาคืนสาย", { responsibility: 3, honesty: 2 }),
      c("ติดป้ายชื่อเจ้าของให้ชัด", { responsibility: 2, chaos: 1 }),
      c("ห้ามยืมถ้าจะเดินหนีปลั๊ก", { ghosting: -1, responsibility: 2 }),
      c("พกสายเองและพกขนมแยก", { snackEnergy: 1, responsibility: 3 })
    ])
  ],
  "one-more-episode": [
    q("คุณพูดว่าอีกตอนเดียวตอนเวลาเท่าไร?", [
      c("ยังพอมีเวลานอนจริง", { responsibility: 3, honesty: 2 }),
      c("เวลาที่นาฬิกาเริ่มเตือนด้วยสายตา", { drama: 2, chaos: 1 }),
      c("ตอนที่แชตเพื่อนยังไม่ได้ตอบ", { ghosting: 2, responsibility: -1 }),
      c("ตอนขนมยังเหลือครึ่งถุง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("อะไรทำให้อีกตอนเดียวไม่จบ?", [
      c("ตอนต่อไปขึ้นเองแต่ยังควรกดหยุด", { responsibility: 2, honesty: 2 }),
      c("ตอนจบค้างจนต้องเปิดศาลต่อ", { drama: 3, chaos: 2 }),
      c("ไม่ตอบแชตเพราะกลัวเสียสมาธิ", { ghosting: 3, responsibility: -1 }),
      c("กินเพลินจนซีรีส์เล่นต่อเอง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนทักระหว่างคุณดูอยู่ คุณตอบยังไง?", [
      c("พักจอแล้วตอบก่อน", { responsibility: 3, honesty: 2 }),
      c("บอกขอจบฉากนี้ก่อน", { drama: 2, chaos: 1 }),
      c("อ่านแล้วรอจบตอนค่อยกลับมา", { ghosting: 3, responsibility: -1 }),
      c("ส่งรูปขนมกับหน้าจอเป็นสถานะ", { snackEnergy: 3, chaos: 1 })
    ]),
    q("พรุ่งนี้มีนัดเช้า คุณยังดูต่อไหม?", [
      c("ปิดจอทันทีเพื่อมิตรภาพ", { responsibility: 3, honesty: 2 }),
      c("ต่อรองครึ่งตอนแบบไม่มีในระบบ", { chaos: 2, drama: 2 }),
      c("ทำเป็นไม่เห็นเวลา", { ghosting: 2, honesty: -1 }),
      c("ชงเครื่องดื่มแทนการนอน", { snackEnergy: 3, responsibility: -1 })
    ]),
    q("หลักฐานว่าคุณควบคุมตัวเองได้คือ?", [
      c("กดหยุดกลางตอนจริง", { responsibility: 3, honesty: 2 }),
      c("ดูจบแล้วไม่กดตอนต่อไปแบบยากมาก", { drama: 1, responsibility: 2 }),
      c("ไม่มีหลักฐานนอกจากคำสัญญา", { ghosting: 1, honesty: -1 }),
      c("หยุดเมื่อขนมหมด", { snackEnergy: 3, chaos: 1 })
    ]),
    q("คำสั่งศาลอีกตอนเดียวคือ?", [
      c("ตั้งเวลาหยุดก่อนเริ่มดู", { responsibility: 3, honesty: 2 }),
      c("ให้เพื่อนตั้งรหัสหยุดเล่น", { chaos: 1, responsibility: 2 }),
      c("ห้ามพูดอีกตอนถ้ายังมีแชตค้าง", { ghosting: -1, responsibility: 2 }),
      c("จำกัดขนมให้พอดีกับหนึ่งตอน", { snackEnergy: 2, responsibility: 1 })
    ])
  ],
  "receipt-split": [
    q("คุณเริ่มหารบิลจากจุดไหน?", [
      c("แยกของส่วนตัวกับของกลางก่อน", { responsibility: 3, honesty: 2 }),
      c("เปิดเครื่องคิดเลขเหมือนเปิดศาลสูง", { drama: 2, chaos: 1 }),
      c("รอให้คนอื่นเริ่มเพราะกลัวผิด", { ghosting: 2, responsibility: -1 }),
      c("วงเมนูของทอดที่ทุกคนหยิบ", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("รายการลูกชิ้นหนึ่งไม้ทำให้เกิดอะไร?", [
      c("ถามว่าใครกินแล้วคิดแฟร์ ๆ", { honesty: 2, responsibility: 3 }),
      c("เปิดคดีเศษบาทอย่างมีพลัง", { drama: 3, chaos: 2 }),
      c("ปล่อยผ่านแต่ใจยังจำ", { ghosting: 1, drama: 1 }),
      c("นับไม้เสียบเหมือนหลักฐาน", { snackEnergy: 2, chaos: 1 })
    ]),
    q("เพื่อนเสนอหารเท่ากัน คุณรู้สึกยังไง?", [
      c("ถ้าทุกคนโอเคก็จบ", { responsibility: 3, honesty: 2 }),
      c("ใจอยากเปิดตารางแต่เก็บไว้", { drama: 2, chaos: 1 }),
      c("เงียบแต่จำเมนูไว้หมด", { ghosting: 2, honesty: 1 }),
      c("ถามว่าของกินเล่นนับรวมไหม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("บิลมีเมนูที่จำไม่ได้ว่าใครสั่ง คุณทำอะไร?", [
      c("ถามตรง ๆ ไม่กล่าวหา", { honesty: 3, responsibility: 2 }),
      c("สืบจากรูปโต๊ะอาหาร", { chaos: 2, drama: 2 }),
      c("ปล่อยให้เป็นความลับของโต๊ะ", { ghosting: 2, responsibility: -1 }),
      c("รับไว้ถ้าเป็นเมนูที่เราแอบชิม", { snackEnergy: 3, honesty: 2 })
    ]),
    q("วิธีปัดเศษที่คุณยอมรับได้คือ?", [
      c("ปัดให้คนจ่ายสะดวกและแจ้งทุกคน", { responsibility: 3, honesty: 2 }),
      c("ปัดแบบตัวเลขดูสวย", { chaos: 1, drama: 1 }),
      c("ปัดให้คดีเงียบเร็วที่สุด", { ghosting: 1, responsibility: -1 }),
      c("ปัดเศษไปเป็นกองขนมกลาง", { snackEnergy: 3, chaos: 1 })
    ]),
    q("คำสั่งศาลบิลละเอียดคือ?", [
      c("ใช้แอปหารเงินก่อนเริ่มงง", { responsibility: 3, honesty: 2 }),
      c("ห้ามเปิดคดีเศษบาทเกินห้านาที", { chaos: -1, responsibility: 2 }),
      c("พูดสิ่งที่คาใจ ไม่เก็บเงียบ", { ghosting: -1, honesty: 2 }),
      c("ของกินกลางโต๊ะต้องประกาศก่อนหยิบ", { snackEnergy: 2, responsibility: 2 })
    ])
  ],
  "camera-shy": [
    q("คุณบอกไม่ถ่ายรูป แต่ขอดูทุกรูปเพราะอะไร?", [
      c("อยากแน่ใจว่าไม่ได้ติดภาพจริง", { honesty: 2, responsibility: 1 }),
      c("เป็นผู้กำกับคุณภาพหลังกล้อง", { drama: 2, chaos: 2 }),
      c("ไม่เข้าเฟรมแต่ยังอยากควบคุม", { ghosting: 1, honesty: -1 }),
      c("ดูว่ารูปอาหารสวยพอไหม", { snackEnergy: 3, chaos: 1 })
    ]),
    q("เพื่อนยื่นกล้องให้ถ่าย คุณทำยังไง?", [
      c("ถ่ายให้เต็มที่และส่งรูปครบ", { responsibility: 3, honesty: 2 }),
      c("กำกับแสงเหมือนกองถ่าย", { drama: 3, chaos: 2 }),
      c("ถ่ายเสร็จแล้วหลบจากเฟรมตัวเอง", { ghosting: 2, responsibility: 1 }),
      c("ถามว่าถ่ายก่อนกินหรือหลังกิน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าเพื่อนอยากให้คุณเข้ารูปกลุ่ม?", [
      c("เข้าหนึ่งใบเพื่อมิตรภาพ", { responsibility: 3, honesty: 2 }),
      c("ขอเลือกมุมและแสงก่อน", { drama: 2, chaos: 2 }),
      c("ยืนหลังสุดแบบมีเทคนิค", { ghosting: 3, responsibility: -1 }),
      c("ถือเครื่องดื่มบังมือให้ดูธรรมชาติ", { snackEnergy: 2, chaos: 1 })
    ]),
    q("รูปที่คุณอนุมัติเร็วที่สุดคือแบบไหน?", [
      c("รูปที่ทุกคนดูดีพอ", { responsibility: 2, honesty: 2 }),
      c("รูปที่มุมเหมือนปกนิตยสาร", { drama: 3, chaos: 1 }),
      c("รูปที่ไม่มีเราแต่บอกว่าโอเค", { ghosting: 2, honesty: -1 }),
      c("รูปที่อาหารไม่เบลอ", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("เพื่อนรอคุณเลือกภาพนานแล้ว คุณทำอะไร?", [
      c("เลือกให้จบสามใบ", { responsibility: 3, honesty: 2 }),
      c("เริ่มเทียบแสงทีละพิกเซล", { chaos: 2, drama: 2 }),
      c("บอกเดี๋ยวดูต่อแล้วหาย", { ghosting: 3, responsibility: -1 }),
      c("ขอพักกินก่อนตัดสินรูป", { snackEnergy: 3, chaos: 1 })
    ]),
    q("โทษสายไม่ถ่ายแต่คุมรูปคือ?", [
      c("เข้ารูปกลุ่มหนึ่งใบโดยไม่ขอดูซ้ำ", { responsibility: 3, honesty: 2 }),
      c("รับตำแหน่งช่างภาพประจำโต๊ะ", { drama: 1, responsibility: 2 }),
      c("ห้ามขอทุกรูปถ้าไม่เข้าเฟรม", { ghosting: -1, honesty: 2 }),
      c("เลี้ยงน้ำตากล้อง", { snackEnergy: 3, responsibility: 1 })
    ])
  ],
  "plan-committee": [
    q("ตั้งกรุ๊ปวางแผนแล้วประโยคแรกคืออะไร?", [
      c("สรุปเป้าหมาย วัน และงบ", { responsibility: 3, honesty: 2 }),
      c("ส่งลิงก์สถานที่ 12 ที่ทันที", { chaos: 3, drama: 2 }),
      c("อ่านทุกไอเดียแต่ยังไม่ฟันธง", { ghosting: 2, responsibility: -1 }),
      c("ถามก่อนว่าไปกินที่ไหน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ทำไมแพลนถึงวนอยู่ที่เดิม?", [
      c("ข้อมูลวันเวลายังไม่ครบ", { honesty: 2, responsibility: 2 }),
      c("ทุกที่ดูน่าไปจนศาลล้นแฟ้ม", { chaos: 3, drama: 2 }),
      c("ไม่มีใครอยากเป็นคนตัดสิน", { ghosting: 2, responsibility: -1 }),
      c("ร้านอาหารเปลี่ยนใจทุกคน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("มีคนส่งลิงก์ใหม่ตอนใกล้สรุป คุณทำอะไร?", [
      c("เช็กว่าเข้ากับโจทย์ไหม", { responsibility: 3, honesty: 2 }),
      c("เปิดโพลใหม่เหมือนรีเซ็ตจักรวาล", { chaos: 3, drama: 2 }),
      c("กดใจแล้วไม่อ่านรายละเอียด", { ghosting: 2, responsibility: -1 }),
      c("ดูว่ามีร้านกินใกล้ไหมก่อน", { snackEnergy: 3, chaos: 1 })
    ]),
    q("ถ้าศาลให้สรุปตอนนี้ คุณสรุปอะไร?", [
      c("วัน เวลา สถานที่ คนไป", { responsibility: 3, honesty: 2 }),
      c("ทำแผนสำรอง A B C D", { chaos: 2, drama: 1 }),
      c("โยนให้คนที่ตอบล่าสุด", { ghosting: 2, responsibility: -1 }),
      c("เริ่มจากจองร้านข้าวก่อน", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("หลักฐานว่ากรุ๊ปนี้ยังมีหวังคืออะไร?", [
      c("มีคนตอบวันว่างครบ", { responsibility: 3, honesty: 1 }),
      c("ชื่อกรุ๊ปดีจนไม่อยากยุบ", { drama: 2, chaos: 1 }),
      c("ทุกคนอ่านอยู่แม้ไม่สรุป", { ghosting: 2, honesty: 1 }),
      c("มีลิสต์ร้านกินชัดเจนแล้ว", { snackEnergy: 3, responsibility: 1 })
    ]),
    q("คำสั่งศาลแพลนเที่ยวคือ?", [
      c("ตั้งเดดไลน์สรุปจริง", { responsibility: 3, honesty: 2 }),
      c("ห้ามส่งลิงก์ใหม่หลังปิดโหวต", { chaos: -1, responsibility: 2 }),
      c("คนเปิดกรุ๊ปต้องปิดคดี", { ghosting: -1, responsibility: 2 }),
      c("ล็อกร้านข้าวก่อน แล้วแพลนจะเดิน", { snackEnergy: 3, responsibility: 1 })
    ])
  ]
};

const cases = [
  {
    id: "read-no-reply",
    icon: "👀",
    title: "คดีอ่านแล้วไม่ตอบ",
    desc: "หลักฐานคือขึ้นอ่านแล้ว แต่ใจยังไม่ขึ้นตอบ",
    level: "วุ่นวาย 7/10",
    questions: getCaseQuestions("read-no-reply")
  },
  {
    id: "almost-there",
    icon: "🛵",
    title: "คดีบอกว่า “ใกล้ถึงแล้ว” ทั้งที่ยังไม่ออกจากบ้าน",
    desc: "ศาลขอเช็กพิกัดรองเท้าก่อน",
    level: "น่าสงสัย 9/10",
    questions: getCaseQuestions("almost-there")
  },
  {
    id: "food-choice",
    icon: "🍜",
    title: "คดีเลือกร้านข้าวไม่ได้",
    desc: "ประชุมยาวกว่ากินจริง",
    level: "หิว 10/10",
    questions: getCaseQuestions("food-choice")
  },
  {
    id: "game-ghost",
    icon: "🎮",
    title: "คดีชวนเล่นเกมแล้วหาย",
    desc: "ล็อบบี้รอจนแก่ แต่เจ้าของห้องหาย",
    level: "แชตเงียบ 8/10",
    questions: getCaseQuestions("game-ghost")
  },
  {
    id: "clip-storm",
    icon: "📎",
    title: "คดีส่งคลิปมา 12 อันติด",
    desc: "มือถือสั่นเหมือนมีประชุมด่วน",
    level: "มีม 12/10",
    questions: getCaseQuestions("clip-storm")
  },
  {
    id: "sleep-online",
    icon: "🌙",
    title: "คดีบอกจะนอน แต่ยังออนไลน์",
    desc: "ร่างกายพัก แต่สถานะไม่พัก",
    level: "ง่วงปลอม 8/10",
    questions: getCaseQuestions("sleep-online")
  },
  {
    id: "anything-but-no",
    icon: "🙃",
    title: "คดีพูดว่า “อะไรก็ได้” แต่ปฏิเสธทุกอย่าง",
    desc: "คำว่าอะไรก็ได้มีเงื่อนไขซ่อนอยู่",
    level: "ละเอียด 9/10",
    questions: getCaseQuestions("anything-but-no")
  },
  {
    id: "wake-at-meet",
    icon: "⏰",
    title: "คดีนัด 10 โมง ตื่น 10 โมง",
    desc: "ตรงเวลาแบบเริ่มต้นชีวิต",
    level: "นาฬิกาแพ้ 10/10",
    questions: getCaseQuestions("wake-at-meet")
  },
  {
    id: "drop-topic",
    icon: "💬",
    title: "คดีเปิดประเด็นแล้วหาย",
    desc: "ทิ้งคำว่าเดี๋ยวเล่าไว้กลางศาล",
    level: "ค้างคา 10/10",
    questions: getCaseQuestions("drop-topic")
  },
  {
    id: "short-story",
    icon: "📚",
    title: "คดีเล่าแป๊บเดียว แต่เล่า 40 นาที",
    desc: "มีบทนำ บทขยาย และภาคพิเศษ",
    level: "มหากาพย์ 8/10",
    questions: getCaseQuestions("short-story")
  },
  {
    id: "borrow-forget",
    icon: "🧢",
    title: "คดีขอยืมของแล้วลืมคืน",
    desc: "ของอยู่บ้านใคร ศาลอยากรู้",
    level: "หลักฐานหาย 7/10",
    questions: getCaseQuestions("borrow-forget")
  },
  {
    id: "extra-food",
    icon: "🍟",
    title: "คดีสั่งอาหารเพิ่มแล้วบอกกินนิดเดียว",
    desc: "นิดเดียวที่แปลว่าจานใหม่",
    level: "อิ่มมาก 8/10",
    questions: getCaseQuestions("extra-food")
  },
  {
    id: "not-hungry",
    icon: "🥄",
    title: "คดีบอกไม่หิว แต่แย่งกิน",
    desc: "คำว่าไม่หิวหายไปพร้อมเฟรนช์ฟรายส์",
    level: "ของกิน 11/10",
    questions: getCaseQuestions("not-hungry")
  },
  {
    id: "sticker-only",
    icon: "🐣",
    title: "คดีส่งสติกเกอร์แทนคำตอบทุกสถานการณ์",
    desc: "ศาลต้องตีความจากหน้าน้องสติกเกอร์",
    level: "ลึกลับ 6/10",
    questions: getCaseQuestions("sticker-only")
  },
  {
    id: "memory-weird",
    icon: "🧠",
    title: "คดีจำเรื่องสำคัญไม่ได้ แต่จำเรื่องไร้สาระได้แม่น",
    desc: "วันนัดลืม แต่มีมปี 2019 จำได้",
    level: "สมองเลือก 9/10",
    questions: getCaseQuestions("memory-weird")
  },
  {
    id: "playlist-judge",
    icon: "🎧",
    title: "คดีเปิดเพลงแล้วทุกคนเงียบ",
    desc: "ดีเจประจำรถที่ศาลยังต้องขอพักฟัง",
    level: "บีตแปลก 7/10",
    questions: getCaseQuestions("playlist-judge")
  },
  {
    id: "photo-delay",
    icon: "📸",
    title: "คดีถ่ายรูปให้เพื่อน 40 รูป แต่ส่งให้ 2 รูป",
    desc: "หลักฐานอยู่ในเครื่อง แต่ยังไม่ออกสู่สาธารณะ",
    level: "รอรูป 8/10",
    questions: getCaseQuestions("photo-delay")
  },
  {
    id: "group-chat-lurker",
    icon: "🫥",
    title: "คดีอ่านแชตกลุ่มครบ แต่ไม่เคยตอบ",
    desc: "อยู่ในศาลทุกนัด แต่ไม่ออกเสียง",
    level: "เงียบเนียน 9/10",
    questions: getCaseQuestions("group-chat-lurker")
  },
  {
    id: "weather-excuse",
    icon: "☁️",
    title: "คดีโทษอากาศทุกสถานการณ์",
    desc: "ร้อนก็ไม่ไป เย็นก็อยากนอน ฝนก็ต้องพัก",
    level: "พยากรณ์ใจ 6/10",
    questions: getCaseQuestions("weather-excuse")
  },
  {
    id: "battery-one",
    icon: "🪫",
    title: "คดีแบต 1% ตอนต้องตอบเรื่องสำคัญ",
    desc: "พลังงานหายเฉพาะตอนศาลเรียก",
    level: "แบตลึกลับ 8/10",
    questions: getCaseQuestions("battery-one")
  },
  {
    id: "map-confident",
    icon: "🗺️",
    title: "คดีนำทางมั่นใจ แต่พาหลง",
    desc: "บอกทางเสียงดังมาก ความถูกต้องเบามาก",
    level: "เลี้ยวผิด 9/10",
    questions: getCaseQuestions("map-confident")
  },
  {
    id: "voice-note-long",
    icon: "🎙️",
    title: "คดีส่งวอยซ์ 5 นาทีแทนคำว่าโอเค",
    desc: "ศาลต้องเตรียมหูฟังก่อนรับฟัง",
    level: "เสียงยาว 8/10",
    questions: getCaseQuestions("voice-note-long")
  },
  {
    id: "same-outfit",
    icon: "👕",
    title: "คดีนัดแต่งชิล ๆ แต่แต่งเต็มสุดในกลุ่ม",
    desc: "คำว่าชิลของแต่ละคนไม่เท่ากัน",
    level: "พร้อมเกิน 7/10",
    questions: getCaseQuestions("same-outfit")
  },
  {
    id: "queue-escape",
    icon: "🧾",
    title: "คดีฝากต่อคิวแล้วหายไปนาน",
    desc: "กลับมาอีกทีคิวเกือบถึงและหน้าตาสดใส",
    level: "คิวสั่น 8/10",
    questions: getCaseQuestions("queue-escape")
  },
  {
    id: "spoiler-soft",
    icon: "🎬",
    title: "คดีสปอยล์แบบบอกว่าไม่สปอยล์",
    desc: "พูดนิดเดียว แต่ใจความมาทั้งเรื่อง",
    level: "เฉลยนุ่ม 9/10",
    questions: getCaseQuestions("spoiler-soft")
  },
  {
    id: "borrow-charger",
    icon: "🔌",
    title: "คดียืมสายชาร์จแล้วตั้งรกราก",
    desc: "สายชาร์จกลายเป็นทรัพย์สินส่วนรวมชั่วคราว",
    level: "ไฟเข้า 7/10",
    questions: getCaseQuestions("borrow-charger")
  },
  {
    id: "one-more-episode",
    icon: "📺",
    title: "คดีบอกดูอีกตอนเดียวแล้วเช้า",
    desc: "อีกตอนเดียวเป็นหน่วยเวลาที่ศาลยังนิยามไม่ได้",
    level: "ตาใส 8/10",
    questions: getCaseQuestions("one-more-episode")
  },
  {
    id: "receipt-split",
    icon: "🧮",
    title: "คดีหารเงินละเอียดถึงระดับลูกชิ้น",
    desc: "ความยุติธรรมเริ่มต้นที่เครื่องคิดเลข",
    level: "เป๊ะมาก 6/10",
    questions: getCaseQuestions("receipt-split")
  },
  {
    id: "camera-shy",
    icon: "🫣",
    title: "คดีบอกไม่ถ่ายรูป แต่ขอดูทุกรูป",
    desc: "ไม่เข้าเฟรม แต่คุมคุณภาพหลังกล้อง",
    level: "เลือกมุม 7/10",
    questions: getCaseQuestions("camera-shy")
  },
  {
    id: "plan-committee",
    icon: "📋",
    title: "คดีตั้งกรุ๊ปวางแผนแล้วไม่มีใครสรุป",
    desc: "มีชื่อกรุ๊ป มีพลังใจ แต่ไม่มีข้อสรุป",
    level: "ประชุมวน 10/10",
    questions: getCaseQuestions("plan-committee")
  }
];

const resultTemplates = [
  {
    match: (s) => s.ghosting >= 17 && s.responsibility <= 11,
    title: "ผู้ต้องสงสัยโหมดไร้สัญญาณ",
    role: "จำเลยสายเงียบ",
    text: "ศาลพบร่องรอยการหายตัวชัดมาก เหมือนกดออกจากแชตแล้วฝากเงาไว้ตอบแทน"
  },
  {
    match: (s) => s.snackEnergy >= 18 && s.ghosting >= 14,
    title: "นักหลบคดีในร้านขนม",
    role: "ผู้ต้องสงสัยสายของกิน",
    text: "คุณอาจหายจากแชต แต่หลักฐานชี้ว่าไม่ได้หายจากเมนู ศาลขอให้กลับมาพร้อมคำตอบและของว่าง"
  },
  {
    match: (s) => s.chaos >= 19 && s.drama >= 16,
    title: "ผู้กำกับคดีไร้สาระระดับพรีเมียม",
    role: "ผู้พิพากษาแห่งความวุ่นวาย",
    text: "เรื่องเล็กผ่านมือคุณแล้วมีฉากเปิด ฉากพีค และเพลงประกอบ ศาลยอมรับว่าดูเพลินมาก"
  },
  {
    match: (s) => s.honesty >= 18 && s.responsibility >= 18,
    title: "พยานทองคำประจำศาลเพื่อน",
    role: "พยานผู้รู้ทุกอย่าง",
    text: "คุณให้การชัด รับผิดชอบไว และไม่โยนหมอกใส่เพื่อน คดีนี้ศาลแทบไม่ต้องเคาะโต๊ะ"
  },
  {
    match: (s) => s.responsibility >= 20 && s.chaos <= 12,
    title: "เสมียนศาลผู้คุมแฟ้มอยู่",
    role: "ผู้เก็บหลักฐานระดับละเอียด",
    text: "ในวันที่ทุกคนเริ่มออกทะเล คุณคือคนที่ยังถือแฟ้มถูกเล่มและพาเรือกลับฝั่ง"
  },
  {
    match: (s) => s.honesty >= 17 && s.drama <= 11,
    title: "พยานสายตรงเข้าประเด็น",
    role: "คนพูดสั้นแต่ศาลเข้าใจ",
    text: "คุณไม่แต่งเรื่องให้ฟู แต่พูดพอให้ศาลเห็นภาพ นี่คือความเท่แบบไม่ต้องเปิดเพลง"
  },
  {
    match: (s) => s.drama >= 18 && s.honesty <= 11,
    title: "ทนายหมอกบางประจำห้องแชต",
    role: "ผู้ให้การแบบมีหมอกบาง ๆ",
    text: "คำตอบของคุณมีบรรยากาศดีมาก แต่ศาลยังต้องถามซ้ำว่า สรุปแล้วเกิดอะไรขึ้น"
  },
  {
    match: (s) => s.snackEnergy >= 18 && s.responsibility >= 15,
    title: "ทูตขนมผู้ไกล่เกลี่ยได้จริง",
    role: "ทูตขนมประจำศาล",
    text: "คุณเข้าใจว่ามิตรภาพบางคดีต้องใช้ทั้งคำตอบและของกิน ศาลให้คะแนนความนุ่มนวลเพิ่ม"
  },
  {
    match: (s) => s.chaos >= 18 && s.honesty >= 16,
    title: "ตัวป่วนที่ยอมรับหลักฐาน",
    role: "เจ้าของซีนประจำวัน",
    text: "คุณวุ่นจริง แต่ไม่ได้หนีความจริง ศาลจึงมองว่านี่คือความปั่นแบบมีความรับผิดชอบเล็ก ๆ"
  },
  {
    match: (s) => s.ghosting >= 15 && s.honesty >= 15,
    title: "คนหายที่กลับมาพร้อมคำอธิบาย",
    role: "จำเลยโหมดออฟไลน์ชั่วคราว",
    text: "คุณมีจังหวะหลบสายตาศาล แต่ตอนกลับมาก็พกเหตุผลมาด้วย ถือว่ายังพอประกันตัวได้"
  },
  {
    match: (s) => s.snackEnergy >= 18,
    title: "ผู้ต้องสงสัยสายของกิน",
    role: "ผู้ต้องสงสัยสายของกิน",
    text: "ทุกเส้นทางในคดีนี้ดูเหมือนจะพาไปหาเมนูอะไรสักอย่าง ศาลไม่ได้ว่า แต่อย่าลืมตอบเพื่อน"
  },
  {
    match: (s) => s.ghosting >= 16,
    title: "จำเลยสายหายตัว",
    role: "จำเลยสายเงียบ",
    text: "คุณไม่ได้หายไปไกล แค่เข้าสู่โหมดไม่รับสำนวนชั่วคราวจนเพื่อนต้องออกหมายเรียก"
  },
  {
    match: (s) => s.chaos >= 18 && s.responsibility <= 12,
    title: "ตัวป่วนประจำคดี",
    role: "ผู้พิพากษาแห่งความวุ่นวาย",
    text: "หลักฐานชี้ว่าคุณไม่ได้ตั้งใจทำให้วุ่น แต่ความวุ่นดูเหมือนจะมีคีย์การ์ดเข้าชีวิตคุณ"
  },
  {
    match: (s) => s.drama >= 16,
    title: "ผู้เปิดประเด็นระดับตำนาน",
    role: "คนเปิดประเด็นแล้วหาย",
    text: "คุณทำให้เรื่องธรรมดามีไฟสปอตไลต์ได้ในสามวินาที ศาลขอแค่ตอนจบอย่าหาย"
  },
  {
    match: (s) => s.honesty >= 16,
    title: "พยานผู้พูดความจริงแต่พูดช้า",
    role: "พยานผู้รู้ทุกอย่าง",
    text: "คุณจริงใจแบบศาลรับรู้ได้ แต่อาจต้องส่งคำตอบให้ทันก่อนเพื่อนตั้งศาลย่อย"
  },
  {
    match: (s) => s.responsibility <= 10 && s.snackEnergy >= 13,
    title: "ผู้จัดการขนมที่ลืมจัดการชีวิต",
    role: "ผู้ดูแลเสบียงแต่ลืมกำหนดการ",
    text: "ของกินคุณวางแผนดีมาก ส่วนเรื่องอื่นศาลแนะนำให้ใช้ปฏิทินเป็นพยานร่วม"
  },
  {
    match: (s) => scoreSpread(s) <= 7,
    title: "จำเลยสมดุลแต่มีพิรุธนิด ๆ",
    role: "ทนายสายมีม",
    text: "คะแนนคุณกระจายสวยเหมือนตั้งใจทำตัวน่าสงสัยแบบพอดี ศาลยังจับไม่ได้แต่จะจับตาดู"
  },
  {
    match: () => true,
    title: "ทนายสายมีม",
    role: "ทนายสายมีม",
    text: "คุณอาจไม่ได้ชนะด้วยหลักฐาน แต่ชนะด้วยจังหวะ ความน่าเอ็นดู และความสามารถในการทำให้เพื่อนยิ้ม"
  }
];

const resultTranslations = {
  "ผู้ต้องสงสัยโหมดไร้สัญญาณ": {
    title: "No Signal, Full Suspicion",
    role: "Certified Chat Ghost",
    text: "The court found your signal in another dimension. Cute excuse. Still sus."
  },
  "นักหลบคดีในร้านขนม": {
    title: "Snack Aisle Escape Artist",
    role: "Snack-First Suspect",
    text: "You disappeared from the chat but stayed active near the menu. The receipt is screaming."
  },
  "ผู้กำกับคดีไร้สาระระดับพรีเมียม": {
    title: "Premium Chaos Director",
    role: "Main Character of the Mess",
    text: "You turned a tiny moment into a full trailer. Honestly? Watchable."
  },
  "พยานทองคำประจำศาลเพื่อน": {
    title: "Golden Friend Court Witness",
    role: "Receipts Department MVP",
    text: "Clear answer. Clean timing. Zero fog. The court is weirdly proud."
  },
  "เสมียนศาลผู้คุมแฟ้มอยู่": {
    title: "Case File Boss",
    role: "Receipts Organizer",
    text: "When the group drifts into nonsense, you are the one holding the right folder."
  },
  "พยานสายตรงเข้าประเด็น": {
    title: "Straight-to-the-Point Witness",
    role: "No Lore, Just Facts",
    text: "You kept it short and useful. Rare behavior. The court took notes."
  },
  "ทนายหมอกบางประจำห้องแชต": {
    title: "Vibes-Only Attorney",
    role: "Professional Fog Machine",
    text: "The atmosphere was excellent. The actual answer is still missing from the room."
  },
  "ทูตขนมผู้ไกล่เกลี่ยได้จริง": {
    title: "Snack Diplomat",
    role: "Certified Peace Snack",
    text: "You know some friendship drama needs fewer paragraphs and more fries."
  },
  "ตัวป่วนที่ยอมรับหลักฐาน": {
    title: "Chaos Grew Up a Little",
    role: "Honest Menace",
    text: "You brought chaos, then admitted it. That is character development."
  },
  "คนหายที่กลับมาพร้อมคำอธิบาย": {
    title: "Ghost With a Footnote",
    role: "Offline But Explainable",
    text: "You vanished, but came back with context. Suspicious, but not hopeless."
  },
  "ผู้ต้องสงสัยสายของกิน": {
    title: "Snack Motive Confirmed",
    role: "Snack-First Suspect",
    text: "All evidence points to food. The court respects the hunger, but answer the chat."
  },
  "จำเลยสายหายตัว": {
    title: "Certified Chat Ghost",
    role: "Read Receipt Phantom",
    text: "You did not leave the planet. You just made replying look like a side quest."
  },
  "ตัวป่วนประจำคดี": {
    title: "Resident Chaos Button",
    role: "Accidental Plot Twist",
    text: "You may not plan the chaos, but chaos clearly has your saved address."
  },
  "ผู้เปิดประเด็นระดับตำนาน": {
    title: "Legendary Tea Teaser",
    role: "Drop-and-Disappear Artist",
    text: "You can make one sentence feel like a season finale. Please return for episode two."
  },
  "พยานผู้พูดความจริงแต่พูดช้า": {
    title: "Honest, But Loading",
    role: "Truthful Buffering Witness",
    text: "The truth arrived. It just took the scenic route through your notifications."
  },
  "ผู้จัดการขนมที่ลืมจัดการชีวิต": {
    title: "Snack Manager, Life Beta",
    role: "Supply Chain Hero",
    text: "Snack logistics: elite. Life logistics: needs a software update."
  },
  "จำเลยสมดุลแต่มีพิรุธนิด ๆ": {
    title: "Balanced, But Make It Sus",
    role: "Meme Attorney",
    text: "Your scores are too neat. The court respects the symmetry and remains suspicious."
  },
  "ทนายสายมีม": {
    title: "Meme Attorney",
    role: "Meme Attorney",
    text: "The evidence is thin, but your timing is excellent. Case adjourned with a giggle."
  }
};

const punishments = [
  "ต้องส่งสติกเกอร์ขอโทษ 3 แบบ ห้ามซ้ำอารมณ์",
  "ต้องให้เพื่อนเลือกร้านข้าว 1 มื้อ โดยไม่พูดคำว่าอะไรก็ได้",
  "ต้องตอบแชตด้วยประโยคเต็มอย่างน้อย 1 วัน",
  "ต้องเป็นคนตั้งนาฬิกาปลุกให้กลุ่ม 2 ครั้ง",
  "ต้องเลี้ยงน้ำหวานระดับมิตรภาพ",
  "ต้องส่งมีมเยียวยาจิตใจ 1 ชุดแบบพอดี ไม่รัว",
  "ต้องเป็นคนสรุปแพลนครั้งหน้าใน 3 บรรทัด",
  "ต้องส่งรูปที่ถ่ายไว้ภายในวันนี้แบบไม่ดอง",
  "ต้องเลือกเพลงเปิดรถ 1 เพลงแล้วรับฟังคำวิจารณ์อย่างสงบ",
  "ต้องเป็นคนชาร์จพลังด้วยขนมให้ทีม 1 รอบ",
  "ต้องพูดคำว่าเดี๋ยวเล่าแล้วเล่าจริงภายใน 10 นาที",
  "ต้องรับหน้าที่หารบิลแบบปัดเศษให้มิตรภาพสบายใจ",
  "ต้องตอบแชตกลุ่มด้วยตัวอักษร ไม่ใช่แค่สติกเกอร์ 5 ครั้ง",
  "ต้องเป็นคนถือแผนที่ แต่ต้องฟังเพื่อนด้วย",
  "ต้องส่งวอยซ์ไม่เกิน 20 วินาทีเป็นเวลา 1 วัน",
  "ต้องให้เพื่อนเลือกมุมถ่ายรูปให้ 1 รอบโดยไม่ขอดูซ้ำเกิน 3 ครั้ง",
  "ต้องจองคิวขนมให้กลุ่มแบบไม่หายกลางทาง",
  "ต้องประกาศคำว่าโอเคให้ชัดเจน ไม่ต้องมีภาคขยาย",
  "ต้องตั้งชื่อกรุ๊ปใหม่ที่สรุปแพลนได้จริง",
  "ต้องเลี้ยงเฟรนช์ฟรายส์กองกลางแบบสันติ"
];

const punishmentTranslations = [
  "Send 3 apology stickers. No duplicate emotional faces.",
  "Let your friend pick food once. No “anything is fine” loophole.",
  "Reply in full sentences for 24 hours. Tiny miracle era.",
  "Become group alarm manager twice. No dramatic speech.",
  "Buy one friendship drink. Court-approved sweetness level.",
  "Send one healing meme pack. Not a meme hurricane.",
  "Summarize the next plan in 3 lines. No lore expansion.",
  "Release the photo hostage folder today.",
  "Pick one car song and accept the aux reviews silently.",
  "Recharge the squad with snacks. Emotional battery included.",
  "Say “I’ll tell you later” only if later is actually later.",
  "Split the bill with friendship math, not courtroom math.",
  "Use actual words in group chat 5 times. Stickers may supervise.",
  "Hold the map and listen to the living humans nearby.",
  "Voice notes capped at 20 seconds. Podcast season denied.",
  "Let a friend choose your angle once. Max 3 rechecks.",
  "Hold the snack queue without entering vanish mode.",
  "Say “okay” without a director’s cut.",
  "Rename the planning group to something that can finish a plan.",
  "Pay one peaceful pile of fries to the friendship fund."
];

const friendshipTitles = [
  "คู่หูวุ่นวายแต่ไว้ใจได้",
  "ทีมเปิดประเด็นแล้วหาย",
  "คู่กรณีที่ควรไปกินข้าวก่อนคุย",
  "มิตรภาพแข็งแรง แม้หลักฐานจะอ่อน",
  "คู่หูระดับตำนานของแชตกลุ่ม",
  "ทีมประชุมเยอะแต่รักกันอยู่",
  "คู่หูสายขนมแก้ปัญหา",
  "คู่กรณีผู้แชร์แบตและแชร์ใจ",
  "แก๊งหลักฐานน้อยแต่เสียงหัวเราะมาก",
  "คู่ซี้ที่ควรมีปฏิทินกลาง",
  "ทีมเลี้ยวผิดแต่ถึงด้วยกัน",
  "คู่หูผู้ทำเรื่องเล็กให้เป็นคอนเทนต์",
  "มิตรภาพแบบอ่านครบตอบช้า",
  "คู่ซี้สายสรุปไม่จบแต่จบที่ของกิน",
  "ทีมวางแผนมั่วแต่รูปออกมาดี",
  "คู่กรณีที่ศาลขอให้พักกินน้ำก่อน",
  "เพื่อนสนิทระดับคดีประจำปี",
  "คู่หูใจดีที่หลักฐานงงนิดหน่อย",
  "ทีมดราม่านุ่มนวลและปลอดภัย"
];

const friendshipTitleTranslations = [
  "Chaos Duo, Trustworthy Somehow",
  "Open Topic, Vanish Together",
  "Eat First, Talk Later Duo",
  "Strong Bond, Weak Evidence",
  "Group Chat Hall of Fame",
  "Meeting-Heavy, Still Besties",
  "Snack-Fueled Fixers",
  "Shared Battery, Shared Brain Cell",
  "Low Receipts, High Laughs",
  "Besties Who Need a Shared Calendar",
  "Wrong Turn, Right Duo",
  "Tiny Problem, Big Content Team",
  "Seen Everything, Replied Eventually",
  "Unfinished Plan, Finished Snacks",
  "Messy Plan, Great Photos",
  "Please Drink Water First Duo",
  "Case of the Year Besties",
  "Kind Hearts, Confusing Receipts",
  "Soft Drama, Safe Chaos"
];

const state = {
  view: "home",
  mode: "solo",
  plaintiffName: "",
  defendantName: "",
  caseFilter: "all",
  accusationCategory: "",
  accusationId: "",
  evidenceId: "",
  remorseId: "",
  selectedCaseId: null,
  answers: [],
  playerA: null,
  playerB: null,
  activePlayer: "A",
  latestVerdict: null,
  sharePayload: null,
  dailyCaseId: null
};

const app = document.querySelector("#app");

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("hashchange", routeFromHash);

function init() {
  currentLang = loadLanguage();
  loadSavedParties();
  applyDocumentLanguage();
  const payload = readShareParam();
  if (payload) {
    state.sharePayload = payload;
    state.mode = "duo-link-b";
    state.selectedCaseId = payload.caseId;
    location.hash = "#case-link";
  }
  routeFromHash();
}

function loadLanguage() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return SUPPORTED_LANGS.includes(saved) ? saved : "th";
  } catch (error) {
    return "th";
  }
}

function setLanguage(lang, options = { render: true }) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (error) {
    // The switch still works for the current session if storage is unavailable.
  }
  applyDocumentLanguage();
  trackEvent("switch_language", { language: lang });
  if (options.render) renderCurrentScreen();
}

function applyDocumentLanguage() {
  document.documentElement.lang = currentLang;
  document.title = t("pageTitle");
}

function renderCurrentScreen() {
  const hash = location.hash.replace("#", "") || "home";
  if ((hash === "question" || hash === "daily") && state.selectedCaseId && (hash === "question" || state.mode === "daily")) {
    renderQuestion();
    return;
  }
  if (hash === "verdict" && state.latestVerdict) {
    renderVerdict();
    return;
  }
  if (hash === "case-link" && state.sharePayload) {
    renderLinkInvite();
    return;
  }
  routeFromHash();
}

function t(path, params = {}) {
  const value = path.split(".").reduce((node, key) => node?.[key], translations[currentLang]);
  const fallback = path.split(".").reduce((node, key) => node?.[key], translations.th);
  return formatText(value ?? fallback ?? "", params);
}

function formatText(value, params = {}) {
  if (typeof value !== "string") return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

function localText(th, en = th) {
  return { th, en };
}

function getLocalized(value, lang = currentLang) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[lang] ?? value.th ?? value.en ?? "";
  }
  return value ?? "";
}

function getLocalizedForLang(value, lang) {
  return getLocalized(value, lang);
}

function caseTitleValue(item) {
  return localText(item.title, caseTranslations[item.id]?.title || item.title);
}

function caseDescValue(item) {
  return localText(item.desc, caseTranslations[item.id]?.desc || item.desc);
}

function caseLevelValue(item) {
  return localText(item.level, caseTranslations[item.id]?.level || item.level);
}

function getCaseTitle(item) {
  return getLocalized(caseTitleValue(item));
}

function getCaseDesc(item) {
  return getLocalized(caseDescValue(item));
}

function getCaseLevel(item) {
  return getLocalized(caseLevelValue(item));
}

function getQuestionText(question) {
  return getLocalized(question.text);
}

function getOptionText(option) {
  return getLocalized(option.text);
}

function renderLanguageSwitcher() {
  return `
    <div class="language-switch" role="group" aria-label="${t("labels.language")}" data-language-switch>
      ${SUPPORTED_LANGS.map((lang) => `
      <button
        class="lang-option ${lang === currentLang ? "is-active" : ""}"
        type="button"
        data-lang="${lang}"
        aria-label="${translations[currentLang].languageOptions[lang]}"
        aria-pressed="${lang === currentLang}"
      >
        <span aria-hidden="true">${LANGUAGE_FLAGS[lang]}</span>
      </button>
      `).join("")}
    </div>
  `;
}

function routeFromHash() {
  const hash = location.hash.replace("#", "") || "home";
  const routes = {
    home: renderHome,
    modes: renderModes,
    cases: renderCases,
    question: renderQuestion,
    verdict: renderVerdict,
    history: renderHistory,
    daily: startDaily,
    "case-link": renderLinkInvite
  };
  if (hash.startsWith("lang-")) {
    const nextLang = hash.replace("lang-", "");
    const targetHash = lastRouteHash || "home";
    setLanguage(nextLang, { render: false });
    window.history?.replaceState(null, "", `#${targetHash}`);
    renderHashRoute(targetHash, routes);
    return;
  }
  lastRouteHash = hash;
  renderHashRoute(hash, routes);
}

function renderHashRoute(hash, routes) {
  if ((hash === "question" || hash === "daily") && state.selectedCaseId && (hash === "question" || state.mode === "daily")) {
    renderQuestion();
    return;
  }
  if (hash === "verdict" && state.latestVerdict) {
    renderVerdict();
    return;
  }
  if (hash === "case-link" && state.sharePayload) {
    renderLinkInvite();
    return;
  }
  (routes[hash] || renderHome)();
}

function renderShell(content) {
  const route = location.hash.replace("#", "") || "home";
  const showNavButtons = route !== "home";
  app.innerHTML = `
    <div class="view">
      <nav class="topbar" aria-label="${currentLang === "th" ? "เมนูหลัก" : "Main menu"}">
        <a class="brand" href="#home" aria-label="${t("nav.home")}">
          <span class="brand-mark">⚖️</span>
          <span>Friend Court</span>
        </a>
        <div class="nav-actions">
          ${renderLanguageSwitcher()}
          ${showNavButtons ? `
          <button class="btn ghost" type="button" data-action="history">${t("nav.history")}</button>
          <button class="btn ghost" type="button" data-action="home">${t("nav.home")}</button>
          ` : ""}
        </div>
      </nav>
      ${content}
    </div>
  `;
  bindGlobalActions();
}

function renderHome() {
  const plaintiffValue = escapeHtml(state.plaintiffName);
  const defendantValue = escapeHtml(state.defendantName);
  renderShell(`
    <section class="signup-screen" aria-labelledby="hero-title">
      <form class="signup-card" data-party-form>
        <div class="summons-hero-copy">
          <span class="summons-logo" aria-hidden="true">⚖️</span>
          <p class="eyebrow">Friend Court</p>
          <h1 id="hero-title">${t("signup.title")}</h1>
          <p>${currentLang === "th" ? "ศาลเพื่อน ศาลนี้ตัดสินด้วยความปั่น" : "Friend court, powered by premium chaos."}</p>
        </div>
        <div class="summons-document" aria-label="${currentLang === "th" ? "ใบศาลส่งฟ้อง" : "Friend Court summons"}">
          <span class="summons-corner corner-tl" aria-hidden="true"></span>
          <span class="summons-corner corner-tr" aria-hidden="true"></span>
          <span class="summons-corner corner-bl" aria-hidden="true"></span>
          <span class="summons-corner corner-br" aria-hidden="true"></span>
          <div class="summons-doc-head">
            <span class="seal" aria-hidden="true">⚖️</span>
            <div>
              <span>CASE NO. FC-0001</span>
              <strong>${currentLang === "th" ? "ใบศาลส่งฟ้อง" : "Friend Court Summons"}</strong>
              <small>FRIEND COURT SUMMONS</small>
            </div>
          </div>
          <div class="summons-divider" aria-hidden="true"></div>
          <p class="summons-legal-line">${currentLang === "th" ? "ศาลขอรับฟังคำฟ้องคดีมิตรภาพไร้สาระแบบมีหลักฐานในใจ" : "The court accepts playful friendship complaints with dramatic evidence."}</p>
          <div class="summons-fields">
            <label class="summons-field" for="plaintiffName">
              <span>${t("signup.plaintiffLabel")}</span>
              <input
                id="plaintiffName"
                class="party-input"
                name="plaintiffName"
                type="text"
                value="${plaintiffValue}"
                placeholder="${t("signup.plaintiffPlaceholder")}"
                autocomplete="name"
                required
              />
            </label>
            <label class="summons-field" for="defendantName">
              <span>${t("signup.defendantLabel")}</span>
              <input
                id="defendantName"
                class="party-input"
                name="defendantName"
                type="text"
                value="${defendantValue}"
                placeholder="${t("signup.defendantPlaceholder")}"
                autocomplete="name"
                required
              />
            </label>
          </div>
          <div class="summons-charge">
            <span>${currentLang === "th" ? "ข้อหา" : "Charge"}</span>
            <strong>${currentLang === "th" ? "รอศาลพิจารณา" : "Pending court review"}</strong>
          </div>
          <div class="summons-stamp">${currentLang === "th" ? "พร้อมยื่นฟ้อง" : "Ready to file"}</div>
          <div class="summons-signature">
            <span>${currentLang === "th" ? "ลงชื่อศาล" : "Court signature"}</span>
            <strong>Friend Court</strong>
          </div>
        </div>
        <p class="form-message" data-form-message aria-live="polite"></p>
        <button class="btn primary big-action" type="submit">${t("signup.start")}</button>
      </form>
    </section>
  `);
  const form = app.querySelector("[data-party-form]");
  ["plaintiffName", "defendantName"].forEach((name) => {
    form.elements[name].addEventListener("input", () => {
      form.elements[name].classList.remove("is-invalid");
      const message = app.querySelector("[data-form-message]");
      if (message) message.textContent = "";
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const plaintiffName = form.elements.plaintiffName.value.trim();
    const defendantName = form.elements.defendantName.value.trim();
    form.elements.plaintiffName.classList.toggle("is-invalid", !plaintiffName);
    form.elements.defendantName.classList.toggle("is-invalid", !defendantName);
    if (!plaintiffName || !defendantName) {
      const message = app.querySelector("[data-form-message]");
      if (message) message.textContent = t("signup.required");
      showToast(t("signup.required"));
      return;
    }
    state.plaintiffName = plaintiffName;
    state.defendantName = defendantName;
    persistParties();
    resetInterrogation();
    state.mode = "solo";
    trackEvent("start_solo");
    location.hash = "#cases";
  });
}

function renderModes() {
  renderShell(`
    <section class="section court-panel">
      <p class="eyebrow">${t("modes.eyebrow")}</p>
      <h2>${t("modes.title")}</h2>
      <div class="mode-grid">
        <button class="mode-card" type="button" data-mode="duo-same">
          <span class="icon">📱</span>
          <h3>${t("buttons.duoSame")}</h3>
          <p>${t("modes.sameDesc")}</p>
        </button>
        <button class="mode-card" type="button" data-mode="duo-link-a">
          <span class="icon">🔗</span>
          <h3>${t("buttons.duoLink")}</h3>
          <p>${t("modes.linkDesc")}</p>
        </button>
      </div>
    </section>
  `);
  app.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      trackEvent("start_duo", { mode: state.mode });
      location.hash = "#cases";
    });
  });
}

function renderCases() {
  if (!hasParties()) {
    showToast(t("signup.required"));
    location.hash = "#home";
    return;
  }
  const featured = getRecommendedCases().slice(0, 4);
  const filters = getCaseFilters();
  const visibleCases = cases.filter((item) => state.caseFilter === "all" || getCaseCategoryKey(item) === state.caseFilter);
  renderShell(`
    <section class="case-flow case-selection-page">
      <div class="case-flow-head">
        <div>
          <p class="eyebrow">${t("cases.eyebrow")}</p>
          <h1><span aria-hidden="true">⚖</span> ${t("cases.title")}</h1>
          <p>${t("cases.intro")}</p>
        </div>
        <div class="party-summary" aria-label="${currentLang === "th" ? "คู่กรณี" : "Parties"}">
          <span>${t("caseFlow.plaintiff")}: <strong>${escapeHtml(state.plaintiffName)}</strong></span>
          <span>${t("caseFlow.defendant")}: <strong>${escapeHtml(state.defendantName)}</strong></span>
        </div>
      </div>
      <div class="case-filter-row" aria-label="${currentLang === "th" ? "ตัวกรองคดี" : "Case filters"}">
        ${filters.map((filter) => `
          <button class="case-filter ${state.caseFilter === filter.id ? "is-active" : ""}" type="button" data-case-filter="${filter.id}">
            ${filter.label}
          </button>
        `).join("")}
      </div>
      <div class="case-feature-panel">
        <div>
          <p class="eyebrow"><span aria-hidden="true">⚖️</span> ${currentLang === "th" ? "คดีฮอตในศาลวันนี้" : "Hot cases today"}</p>
          <div class="featured-case-row">
            ${featured.map((item, index) => `
              <button class="featured-case-chip" type="button" data-case="${item.id}">
                <span class="featured-dot" aria-hidden="true">${getCaseDisplayIcon(item)}</span>
                <strong>${getCaseTitle(item)}</strong>
              </button>
            `).join("")}
          </div>
        </div>
        <button class="court-random-ticket" type="button" data-random-case>
          <span aria-hidden="true">⚖️</span>
          <strong>${currentLang === "th" ? "ศาลสุ่มคดีให้" : "Random Court Case"}</strong>
          <small>${currentLang === "th" ? "ให้ศาลเลือกคดีให้อัตโนมัติ" : "Let the court choose automatically"}</small>
        </button>
      </div>
      <div class="case-grid full-case-list">
        ${visibleCases.map(renderCaseFileCard).join("")}
      </div>
      <div class="case-archive-footer"><span></span> ${currentLang === "th" ? "เลือกคดีที่ต้องการฟ้อง แล้วศาลจะเริ่มพิจารณา" : "Choose a case and the court will begin review"} <span></span></div>
    </section>
  `);
  app.querySelectorAll("[data-case-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.caseFilter = button.dataset.caseFilter;
      renderCases();
    });
  });
  app.querySelectorAll("[data-case]").forEach((button) => {
    button.addEventListener("click", () => {
      startCase(button.dataset.case);
    });
  });
  app.querySelectorAll("[data-random-case]").forEach((button) => {
    button.addEventListener("click", startRandomFriendCase);
  });
}

function renderCaseFileCard(item, index) {
  const originalIndex = cases.findIndex((caseItem) => caseItem.id === item.id);
  const fileNo = String(originalIndex + 1).padStart(3, "0");
  const stamp = getCaseStamp(item, originalIndex);
  return `
    <button class="case-card case-file-card tone-${index % 5}" type="button" data-case="${item.id}">
      <span class="case-stamp ${stamp.tone}">${stamp.text}</span>
      <span class="case-no">CASE FILE NO. FC-${fileNo}</span>
      <span class="case-file-id">FC-${String(2026 + originalIndex).slice(-2)}-${fileNo}</span>
      <span class="case-title-row"><span class="case-mini-icon" aria-hidden="true">${getCaseDisplayIcon(item)}</span><strong>${getCaseTitle(item)}</strong></span>
      <p><span>${currentLang === "th" ? "คำร้อง:" : "Petition:"}</span> ${getCaseDesc(item)}</p>
    </button>
  `;
}

function getCaseFilters() {
  return currentLang === "th"
    ? [
      { id: "all", label: "ทั้งหมด" },
      { id: "chat", label: "คดีแชท" },
      { id: "food", label: "คดีอาหาร" },
      { id: "plan", label: "คดีนัดหมาย" },
      { id: "money", label: "คดีเงิน" },
      { id: "game", label: "คดีเกม" },
      { id: "habit", label: "คดีนิสัย" }
    ]
    : [
      { id: "all", label: "All" },
      { id: "chat", label: "Chat" },
      { id: "food", label: "Food" },
      { id: "plan", label: "Plans" },
      { id: "money", label: "Money" },
      { id: "game", label: "Game" },
      { id: "habit", label: "Habits" }
    ];
}

function getCaseCategoryKey(item) {
  const title = `${getCaseTitle(item)} ${getCaseDesc(item)} ${item.id}`;
  if (/แชต|ตอบ|สติกเกอร์|วอยซ์|อ่าน|ประเด็น|Chat|Reply|Sticker|Voice|read|topic|lurker/i.test(title)) return "chat";
  if (/ข้าว|กิน|หิว|อาหาร|ร้าน|Food|Restaurant|Hungry|Fries|snack|extra-food/i.test(title)) return "food";
  if (/นัด|สาย|ตื่น|คิว|ทาง|แพลน|Plan|Queue|Late|Map|almost|wake|weather/i.test(title)) return "plan";
  if (/เงิน|บิล|ยืม|ชาร์จ|Bill|Borrow|Charger|receipt|money/i.test(title)) return "money";
  if (/เกม|Game|Episode|Playlist|clip|spoiler/i.test(title)) return "game";
  return "habit";
}

function getCaseDisplayIcon(item) {
  const category = getCaseCategoryKey(item);
  return {
    chat: "💬",
    food: "🍽",
    plan: "◷",
    money: "฿",
    game: "◆",
    habit: "§"
  }[category] || "§";
}

function getCaseStamp(item, index) {
  const stamps = currentLang === "th"
    ? ["รับฟ้องแล้ว", "รอพิจารณา", "หลักฐานแน่น", "คดีน่าสงสัย", "ศาลรับคำร้อง"]
    : ["Filed", "Pending Review", "Evidence Strong", "Suspicious Case", "Petition Accepted"];
  const tones = ["is-red", "is-gold"];
  return {
    text: stamps[index % stamps.length],
    tone: tones[index % tones.length]
  };
}

function renderInterrogation(step) {
  if (step.ready) {
    const accusation = getSelectedAccusation();
    return `
      <div class="selected-case">
        <span>${t("caseFlow.selected")}</span>
        <strong>${accusation.icon} ${getLocalized(accusation.label)}</strong>
      </div>
      <div class="court-question-card">
        <span>${t("caseFlow.step", { current: 4, total: 4 })}</span>
        <h2>${t("caseFlow.readyTitle")}</h2>
        <p>${t("caseFlow.readyCopy")}</p>
        <div class="case-actions">
          <button class="btn ghost" type="button" data-reset-interrogation>${t("caseFlow.changeAnswer")}</button>
          <button class="btn primary big-action" type="button" data-judge-case>${t("buttons.judgeCase")}</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="court-question-card">
      <span>${t("caseFlow.step", { current: step.number, total: 4 })}</span>
      <h2>${step.question}</h2>
    </div>
    <div class="case-grid interrogation-grid">
      ${step.options.map((option, index) => `
        <button class="case-card tone-${index % 5}" type="button" data-interrogation-choice data-field="${step.field}" data-value="${option.id}">
          <span class="icon">${option.icon}</span>
          <strong>${getLocalized(option.label)}</strong>
          ${option.note ? `<p>${getLocalized(option.note)}</p>` : ""}
        </button>
      `).join("")}
    </div>
    <div class="case-actions">
      <button class="btn pink" type="button" data-random-case>${t("caseFlow.randomCourt")}</button>
    </div>
  `;
}

function getInterrogationStep() {
  if (!state.accusationCategory) {
    return {
      number: 1,
      field: "accusationCategory",
      question: t("caseFlow.categoryQuestion"),
      options: ACCUSATION_CATEGORIES.map((category) => ({
        id: category.id,
        icon: category.icon,
        label: category.label
      }))
    };
  }
  if (!state.accusationId) {
    const category = getAccusationCategory();
    return {
      number: 2,
      field: "accusationId",
      question: t("caseFlow.accusationQuestion"),
      options: category.accusations.map(([id, th, en]) => ({
        id,
        icon: category.icon,
        label: localText(th, en)
      }))
    };
  }
  if (!state.evidenceId) {
    return {
      number: 3,
      field: "evidenceId",
      question: t("caseFlow.evidenceQuestion"),
      options: EVIDENCE_OPTIONS
    };
  }
  if (!state.remorseId) {
    return {
      number: 4,
      field: "remorseId",
      question: t("caseFlow.remorseQuestion"),
      options: REMORSE_OPTIONS
    };
  }
  return { ready: true };
}

function applyInterrogationChoice(field, value) {
  if (field === "accusationCategory") {
    state.accusationCategory = value;
    state.accusationId = "";
    state.evidenceId = "";
    state.remorseId = "";
    state.selectedCaseId = "";
    return;
  }
  if (field === "accusationId") {
    state.accusationId = value;
    state.selectedCaseId = value;
    state.evidenceId = "";
    state.remorseId = "";
    return;
  }
  if (field === "evidenceId") {
    state.evidenceId = value;
    state.remorseId = "";
    return;
  }
  if (field === "remorseId") state.remorseId = value;
}

function randomizeInterrogation() {
  const category = ACCUSATION_CATEGORIES[Math.floor(Math.random() * ACCUSATION_CATEGORIES.length)];
  const accusation = category.accusations[Math.floor(Math.random() * category.accusations.length)];
  const evidence = EVIDENCE_OPTIONS[Math.floor(Math.random() * EVIDENCE_OPTIONS.length)];
  const remorse = REMORSE_OPTIONS[Math.floor(Math.random() * REMORSE_OPTIONS.length)];
  state.accusationCategory = category.id;
  state.accusationId = accusation[0];
  state.selectedCaseId = accusation[0];
  state.evidenceId = evidence.id;
  state.remorseId = remorse.id;
}

function resetInterrogation() {
  state.accusationCategory = "";
  state.accusationId = "";
  state.evidenceId = "";
  state.remorseId = "";
  state.selectedCaseId = "";
}

function renderLinkInvite() {
  const item = getCase(state.selectedCaseId);
  renderShell(`
    <section class="section court-panel">
      <div class="glass-card question-card">
        <p class="eyebrow">${t("linkInvite.eyebrow")}</p>
        <h2>${item.icon} ${getCaseTitle(item)}</h2>
        <p class="subtitle">${t("linkInvite.subtitle")}</p>
        <button class="btn primary" type="button" data-accept-link>${t("buttons.acceptLink")}</button>
      </div>
    </section>
  `);
  app.querySelector("[data-accept-link]").addEventListener("click", () => {
    state.mode = "duo-link-b";
    state.answers = [];
    state.activePlayer = "B";
    location.hash = "#question";
  });
}

function startCase(caseId) {
  state.selectedCaseId = caseId;
  state.answers = [];
  state.playerA = null;
  state.playerB = null;
  state.latestVerdict = null;
  state.activePlayer = "A";
  if (state.mode === "instant") state.mode = "solo";
  location.hash = "#question";
}

function startRandomFriendCase() {
  const item = cases[Math.floor(Math.random() * cases.length)] || cases[0];
  state.selectedCaseId = item.id;
  state.answers = [];
  state.latestVerdict = null;
  state.mode = "solo";
  trackEvent("start_solo", { mode: "random_friend_case", case_id: state.selectedCaseId });
  location.hash = "#question";
}

function startFriendCaseFromVerdict(verdict) {
  const caseId = verdict.caseId || verdict.player?.caseId || verdict.playerA?.caseId || cases[0].id;
  state.selectedCaseId = caseId;
  state.latestVerdict = null;
  state.answers = [];
  state.mode = "solo";
  trackEvent("start_solo", { mode: "verdict_case", case_id: caseId });
  location.hash = "#question";
}

function getRecommendedCases() {
  return RECOMMENDED_CASE_IDS.map((id) => getCase(id)).filter(Boolean);
}

function getAccusationCategory() {
  return ACCUSATION_CATEGORIES.find((category) => category.id === state.accusationCategory) || ACCUSATION_CATEGORIES[0];
}

function getSelectedAccusation() {
  const category = getAccusationCategory();
  const source = category.accusations.find(([id]) => id === state.accusationId) || category.accusations[0];
  return {
    id: source[0],
    icon: category.icon,
    category,
    label: localText(source[1], source[2])
  };
}

function getSelectedEvidence() {
  return EVIDENCE_OPTIONS.find((option) => option.id === state.evidenceId) || EVIDENCE_OPTIONS[0];
}

function getSelectedRemorse() {
  return REMORSE_OPTIONS.find((option) => option.id === state.remorseId) || REMORSE_OPTIONS[0];
}

function getSelectedCaseForVerdict() {
  const accusation = getSelectedAccusation();
  const existing = getCase(accusation.id);
  if (existing?.id === accusation.id) return existing;
  return {
    id: accusation.id,
    icon: accusation.icon,
    title: getLocalizedForLang(accusation.label, "th"),
    desc: getLocalizedForLang(accusation.category.label, "th"),
    level: "ศาลขำ 10/10",
    questions: []
  };
}

function judgeInstantCase() {
  if (!hasParties()) {
    showToast(t("signup.required"));
    location.hash = "#home";
    return;
  }
  if (!state.remorseId) {
    showToast(t("caseFlow.intro"));
    return;
  }
  const item = getSelectedCaseForVerdict();
  state.latestVerdict = makeInstantVerdict(item);
  saveVerdict(state.latestVerdict);
  trackEvent("complete_case", {
    case_id: item.id,
    mode: "instant",
    verdict_type: state.latestVerdict.type
  });
  location.hash = "#verdict";
}

function startDaily() {
  state.mode = "daily";
  state.selectedCaseId = getDailyCaseId();
  state.dailyCaseId = state.selectedCaseId;
  state.answers = [];
  state.activePlayer = "A";
  renderQuestion();
}

function renderQuestion() {
  const item = getCase(state.selectedCaseId || cases[0].id);
  const question = item.questions[state.answers.length];
  if (!question) {
    finishAnswers();
    return;
  }
  const total = item.questions.length;
  const current = state.answers.length + 1;
  const answerMarks = t("question.answerMarks");
  const playerLabel = state.mode === "duo-same"
    ? t("question.player", { player: state.activePlayer })
    : state.mode === "duo-link-b" ? t("question.friendSide") : "";
  renderShell(`
    <section class="court-panel">
      <div class="progress-shell" aria-label="${t("question.progress")}">
        <div class="progress-bar" style="width:${Math.round((state.answers.length / total) * 100)}%"></div>
      </div>
      <article class="glass-card question-card">
        <p class="question-meta">${item.icon} ${getCaseTitle(item)} ${playerLabel ? `• ${playerLabel}` : ""}</p>
        <h2>${getQuestionText(question)}</h2>
        <p class="subtitle">${t("question.item", { current, total })}</p>
        <div class="answer-list">
          ${question.options.map((option, index) => `
            <button class="answer-card" type="button" data-answer="${index}">
              <span class="answer-mark">${answerMarks[index]}</span>
              <span class="answer-copy">
                <strong>${getOptionText(option)}</strong>
                ${getLocalized(option.hint) ? `<span>${getLocalized(option.hint)}</span>` : ""}
              </span>
            </button>
          `).join("")}
        </div>
      </article>
    </section>
  `);
  app.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.add("is-selected");
      state.answers.push(question.options[Number(button.dataset.answer)]);
      window.setTimeout(renderQuestion, 120);
    });
  });
}

function finishAnswers() {
  const item = getCase(state.selectedCaseId);
  const scores = calculateScores(state.answers);
  if (state.mode === "duo-same" && state.activePlayer === "A") {
    state.playerA = makePlayerResult(localText("ผู้เล่น A", "Player A"), item, scores);
    state.answers = [];
    state.activePlayer = "B";
    renderBetweenPlayers();
    return;
  }
  if (state.mode === "duo-same") {
    state.playerB = makePlayerResult(localText("ผู้เล่น B", "Player B"), item, scores);
    state.latestVerdict = makeDuoVerdict(state.playerA, state.playerB, item);
  } else if (state.mode === "duo-link-a") {
    state.playerA = makePlayerResult(localText("ฝั่งเรา", "Our side"), item, scores);
    state.latestVerdict = makeShareVerdict(state.playerA, item);
  } else if (state.mode === "duo-link-b") {
    state.playerA = state.sharePayload.player;
    state.playerB = makePlayerResult(localText("ฝั่งเพื่อน", "Friend side"), item, scores);
    state.latestVerdict = makeDuoVerdict(state.playerA, state.playerB, item);
  } else {
    state.latestVerdict = makeSoloVerdict(item, scores, state.mode === "daily");
  }
  saveVerdict(state.latestVerdict);
  trackEvent("complete_case", {
    case_id: item.id,
    mode: state.mode,
    verdict_type: state.latestVerdict.type
  });
  location.hash = "#verdict";
}

function renderBetweenPlayers() {
  renderShell(`
    <section class="section court-panel">
      <div class="glass-card question-card">
        <p class="eyebrow">${t("between.eyebrow")}</p>
        <h2>${t("between.title")}</h2>
        <p class="subtitle">${t("between.subtitle")}</p>
        <button class="btn primary" type="button" data-next-player>${t("buttons.nextPlayer")}</button>
      </div>
    </section>
  `);
  app.querySelector("[data-next-player]").addEventListener("click", renderQuestion);
}

function renderVerdict() {
  const verdict = state.latestVerdict;
  if (!verdict) {
    renderHome();
    return;
  }
  renderShell(`
    <section class="verdict-wrap">
      ${renderVerdictCard(verdict)}
      <aside class="verdict-actions" aria-label="${t("verdict.actionsLabel")}">
        <button class="btn pink big-action" type="button" data-share-image>${t("buttons.sendToDefendant")}</button>
        <button class="btn ghost" type="button" data-copy-link>${t("buttons.copyLink")}</button>
        <div class="save-image-block">
          <button class="btn" type="button" data-save-image>${t("buttons.saveVerdictImage")}</button>
          <p>${t("buttons.iphoneSaveHelp")}</p>
        </div>
        <button class="btn ghost" type="button" data-play-again>${t("buttons.restartCase")}</button>
      </aside>
    </section>
  `);
  bindVerdictActions(verdict);
}

function renderVerdictCard(verdict) {
  const caseNumber = getVerdictCaseNumber(verdict);
  const caseTitle = getLocalized(verdict.caseTitle);
  const title = getLocalized(verdict.title);
  const text = getLocalized(verdict.text);
  const punishment = getLocalized(verdict.punishment);
  const friendshipStatus = getLocalized(verdict.friendshipStatus);
  const parties = getVerdictParties(verdict);
  const reaction = getVerdictReaction(verdict);
  if (verdict.type === "duo") {
    return `
      <article id="verdictCard" class="verdict-card">
        <div class="verdict-doc-top">
          <div>
            <p class="verdict-label">${t("verdict.header")}</p>
            <p class="verdict-kicker">${t("verdict.kicker")}</p>
          </div>
          <span class="case-number">${caseNumber}</span>
        </div>
        <div class="stamp-wrap"><div class="stamp">${t("verdict.judged")}</div></div>
        <p class="case-name">${caseTitle}</p>
        <h2>${title}</h2>
        <p class="verdict-text">${text}</p>
        <div class="duo-board">
          <div class="duo-score"><strong><span>${getLocalized(verdict.playerA.name)}</span><span>${verdict.playerA.guilty}%</span></strong><p>${t("verdict.suspiciousPercent")}</p></div>
          <div class="duo-score"><strong><span>${getLocalized(verdict.playerB.name)}</span><span>${verdict.playerB.guilty}%</span></strong><p>${t("verdict.suspiciousPercent")}</p></div>
          <div class="duo-score"><strong><span>${t("verdict.compatibility")}</span><span>${verdict.compatibility}%</span></strong><p>${getLocalized(verdict.relationship)}</p></div>
        </div>
        <div class="verdict-section-grid">
          <section class="verdict-note">
            <span>${t("verdict.punishment")}</span>
            <strong>${punishment}</strong>
          </section>
          <section class="verdict-note">
            <span>${t("verdict.friendshipStatus")}</span>
            <strong>${friendshipStatus}</strong>
          </section>
        </div>
      </article>
    `;
  }
  return `
    <article id="verdictCard" class="verdict-card">
      <div class="verdict-doc-top">
        <div>
          <p class="verdict-label">${t("verdict.header")}</p>
          <p class="verdict-kicker">${t("verdict.kicker")}</p>
        </div>
        <span class="case-number">${caseNumber}</span>
      </div>
      <div class="stamp-wrap"><div class="stamp">${verdict.type === "share" ? t("verdict.waiting") : reaction.verdictLabel}</div></div>
      <div class="party-grid">
        <div><span>${t("verdictCard.plaintiff")}</span><strong>${escapeHtml(parties.plaintiff)}</strong></div>
        <div><span>${t("verdictCard.defendant")}</span><strong>${escapeHtml(parties.defendant)}</strong></div>
      </div>
      <p class="case-name">${t("verdictCard.caseTitle")}: ${caseTitle}</p>
      <div class="verdict-reaction ${reaction.className}" aria-label="${reaction.label}">
        <span class="reaction-face" aria-hidden="true">${reaction.emoji}</span>
        <strong>${reaction.verdictLabel}</strong>
      </div>
      <p class="verdict-subhead">⚖️ ${t("verdictCard.verdict")}</p>
      <h2>${title}</h2>
      ${verdict.type === "instant" ? "" : `<div class="percent"><strong>${verdict.guilty}</strong><small>${t("verdict.guiltySmall")}</small></div>`}
      <p class="verdict-text">${text}</p>
      <div class="paper-chip-row">
        <span class="paper-chip">${getLocalized(verdict.role)}</span>
      </div>
      <div class="verdict-section-grid">
        <section class="verdict-note">
          <span>${t("verdictCard.punishment")}</span>
          <strong>${punishment}</strong>
        </section>
        <section class="verdict-note">
          <span>Friend Court</span>
          <strong>${friendshipStatus}</strong>
        </section>
      </div>
    </article>
  `;
}

function getVerdictCaseNumber(verdict) {
  const caseId = verdict.caseId || verdict.playerA?.caseId || verdict.player?.caseId;
  const localizedCaseTitle = getLocalized(verdict.caseTitle, "th");
  const index = cases.findIndex((item) => item.id === caseId || item.title === localizedCaseTitle);
  const number = index >= 0 ? index + 1 : Math.max(1, String(localizedCaseTitle).length);
  return `${t("cases.caseNo")} ${String(number).padStart(3, "0")}`;
}

function renderHistory() {
  const saved = loadStore();
  const history = saved.history || [];
  const funniestItem = history.find((item) => item.title || item.resultKey);
  const funniest = funniestItem ? getHistoryTitle(funniestItem) : t("history.noTitle");
  renderShell(`
    <section class="section">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("history.eyebrow")}</p>
          <h2>${t("history.title")}</h2>
        </div>
        <button class="btn danger" type="button" data-clear-history ${history.length ? "" : "disabled"}>${t("buttons.clearHistory")}</button>
      </div>
      <div class="stat-grid">
        <div class="stat-card"><strong>${history.length}</strong><span>${t("history.totalCases")}</span></div>
        <div class="stat-card"><strong>${saved.dailyStreak || 0}</strong><span>${t("history.streak")}</span></div>
        <div class="stat-card"><strong>${funniest}</strong><span>${t("history.latestTitle")}</span></div>
      </div>
      <div class="section history-list">
        ${history.length ? history.map(renderHistoryItem).join("") : `<div class="glass-card empty">${t("history.empty")}</div>`}
      </div>
    </section>
  `);
  const clear = app.querySelector("[data-clear-history]");
  if (clear) {
    clear.addEventListener("click", () => {
      if (!window.confirm(t("history.confirmClear"))) return;
      const savedState = loadStore();
      savedState.history = [];
      writeStore(savedState);
      renderHistory();
      showToast(t("history.cleared"));
    });
  }
}

function renderHistoryItem(item) {
  const date = new Date(item.createdAt).toLocaleString(t("dateLocale"), { dateStyle: "medium", timeStyle: "short" });
  return `
    <article class="history-item">
      <div>
        <strong>${getHistoryTitle(item)}</strong>
        <p>${getHistoryCaseTitle(item)} • ${getHistorySummary(item)}</p>
      </div>
      <time datetime="${item.createdAt}">${date}</time>
    </article>
  `;
}

function bindGlobalActions() {
  app.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setLanguage(button.dataset.lang);
    });
  });
  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "home") location.hash = "#home";
      if (action === "history") location.hash = "#history";
      if (action === "daily") location.hash = "#daily";
    });
  });
}

function bindVerdictActions(verdict) {
  app.querySelectorAll("[data-play-again]").forEach((button) => {
    button.addEventListener("click", () => {
      state.latestVerdict = null;
      state.selectedCaseId = null;
      state.mode = "instant";
      location.hash = "#home";
    });
  });
  app.querySelectorAll("[data-file-this-case]").forEach((button) => {
    button.addEventListener("click", () => startFriendCaseFromVerdict(verdict));
  });
  app.querySelectorAll("[data-share-image]").forEach((button) => {
    button.addEventListener("click", () => exportVerdictImage(verdict, "share"));
  });
  app.querySelectorAll("[data-copy-link]").forEach((button) => {
    button.addEventListener("click", () => copyText(getShareUrl(verdict)));
  });
  app.querySelectorAll("[data-save-image]").forEach((button) => {
    button.addEventListener("click", () => exportVerdictImage(verdict));
  });
}

function getCaseQuestions(caseId) {
  const questions = CASE_QUESTION_SETS[caseId] || CASE_QUESTION_SETS["read-no-reply"];
  const englishQuestions = caseTranslations[caseId]?.questions || [];
  return questions.map((question, questionIndex) => cloneQuestion(question, englishQuestions[questionIndex]));
}

function q(text, options) {
  const expanded = [...options, ...buildExtraQuestionChoices(text)].slice(0, QUESTION_OPTION_COUNT);
  return { text, options: expanded };
}

function c(text, scores, hint = "") {
  return opt(text, hint, scores);
}

function cx(th, en, scores, hint = "") {
  return opt(localText(th, en), hint, scores);
}

function cloneQuestion(question, englishQuestion) {
  return {
    text: localText(question.text, englishQuestion?.[0] || question.text),
    options: question.options.map((option, optionIndex) => ({
      text: typeof option.text === "object" && option.text
        ? option.text
        : localText(option.text, englishQuestion?.[1]?.[optionIndex] || option.text),
      hint: option.hint ? localText(option.hint, "") : "",
      scores: completeScores(option.scores)
    }))
  };
}

function opt(text, hint, scores) {
  return { text, hint, scores: completeScores(scores) };
}

function completeScores(scores) {
  return AXES.reduce((filled, axis) => {
    filled[axis] = scores[axis] || 0;
    return filled;
  }, {});
}

function scoreSpread(scores) {
  const values = AXES.map((axis) => scores[axis]);
  return Math.max(...values) - Math.min(...values);
}

function calculateScores(answers) {
  const scores = Object.fromEntries(AXES.map((axis) => [axis, 8]));
  answers.forEach((answer) => {
    AXES.forEach((axis) => {
      scores[axis] += answer.scores[axis] || 0;
    });
  });
  AXES.forEach((axis) => {
    scores[axis] = clamp(scores[axis], 0, 32);
  });
  return scores;
}

function makePlayerResult(name, item, scores) {
  const template = resultTemplates.find((result) => result.match(scores));
  const guilty = clamp(Math.round((scores.chaos * 1.1 + scores.drama + scores.ghosting * 1.25 + (32 - scores.responsibility) * 0.8) / 1.55), 12, 98);
  return {
    name,
    caseId: item.id,
    caseTitle: caseTitleValue(item),
    scores,
    guilty,
    resultKey: template.title,
    title: resultField(template, "title"),
    role: resultField(template, "role"),
    text: resultField(template, "text")
  };
}

function makeSoloVerdict(item, scores, isDaily) {
  const player = makePlayerResult(localText("ผู้เล่น", "Player"), item, scores);
  const verdict = {
    type: "solo",
    caseId: item.id,
    resultKey: player.resultKey,
    caseTitle: caseTitleValue(item),
    title: isDaily
      ? localText(
        formatText(translations.th.verdict.dailyPrefix, { title: getLocalizedForLang(player.title, "th") }),
        formatText(translations.en.verdict.dailyPrefix, { title: getLocalizedForLang(player.title, "en") })
      )
      : player.title,
    guilty: player.guilty,
    role: player.role,
    text: player.text,
    punishment: pickPunishment(scores.chaos + scores.snackEnergy),
    friendshipStatus: player.guilty > 72
      ? localText(translations.th.verdict.soloStatusHigh, translations.en.verdict.soloStatusHigh)
      : localText(translations.th.verdict.soloStatusLow, translations.en.verdict.soloStatusLow),
    plaintiffName: state.plaintiffName,
    defendantName: state.defendantName,
    outcome: player.guilty >= 58 ? "defendant_loses" : "defendant_wins",
    shareText: ""
  };
  verdict.shareText = buildShareText(verdict);
  if (isDaily) updateDailyStreak();
  return verdict;
}

function makeInstantVerdict(item) {
  const evidence = getSelectedEvidence();
  const remorse = getSelectedRemorse();
  const accusation = getSelectedAccusation();
  const seed = `${item.id}|${state.plaintiffName}|${state.defendantName}|${state.evidenceId}|${state.remorseId}`;
  const score = hashScore(seed);
  const template = resultTemplates[score % resultTemplates.length];
  const punishment = buildInstantPunishment(item, evidence, remorse, score);
  const verdictTitle = resultField(template, "title");
  const guilty = clamp(38 + (score % 34) + evidence.weight + remorse.weight, 18, 97);
  const defendantLoses = guilty >= 58;
  const text = localText(
    buildInstantJudgmentText("th", defendantLoses, item, evidence, remorse),
    buildInstantJudgmentText("en", defendantLoses, item, evidence, remorse)
  );
  const verdict = {
    type: "instant",
    caseId: item.id,
    resultKey: template.title,
    caseTitle: localText(getLocalizedForLang(accusation.label, "th"), getLocalizedForLang(accusation.label, "en")),
    title: verdictTitle,
    guilty,
    outcome: defendantLoses ? "defendant_loses" : "defendant_wins",
    role: resultField(template, "role"),
    text,
    punishment,
    friendshipStatus: localText(translations.th.verdictCard.cta, translations.en.verdictCard.cta),
    plaintiffName: state.plaintiffName,
    defendantName: state.defendantName,
    shareText: ""
  };
  verdict.shareText = buildViralVerdictText(verdict);
  return verdict;
}

function buildInstantJudgmentText(lang, defendantLoses, item, evidence, remorse) {
  const defendant = state.defendantName;
  const caseTitle = getLocalizedForLang(localText(item.title, caseTranslations[item.id]?.title || item.title), lang);
  const evidenceText = getLocalizedForLang(evidence.label, lang);
  const remorseText = getLocalizedForLang(remorse.label, lang);
  if (lang === "en") {
    return defendantLoses
      ? `The court finds ${defendant} suspicious in “${caseTitle}”. Evidence says: ${evidenceText}. Defendant mood: ${remorseText}. Guilty, but make it friendship-safe.`
      : `The court cannot fully catch ${defendant} in “${caseTitle}”. Evidence says: ${evidenceText}. Defendant mood: ${remorseText}. Cleared for now, watched forever.`;
  }
  return defendantLoses
    ? `ศาลเห็นว่า ${defendant} มีพิรุธใน “${caseTitle}” หลักฐานคือ ${evidenceText} ส่วนท่าทีจำเลยคือ ${remorseText} จึงมีความผิดแบบเพื่อนยังคบต่อได้`
    : `ศาลยังจับ ${defendant} ไม่อยู่ใน “${caseTitle}” แม้หลักฐานจะบอกว่า ${evidenceText} และจำเลยมีท่าที ${remorseText} จึงให้พ้นผิดชั่วคราว แต่แชตกลุ่มจะจับตาดู`;
}

function buildInstantPunishment(item, evidence, remorse, score) {
  const base = pickPunishment(score + evidence.weight + remorse.weight);
  const th = `${getLocalizedForLang(base, "th")} และต้องประกาศในแชตว่า “ศาลรับทราบแล้ว”`;
  const en = `${getLocalizedForLang(base, "en")} Also announce: “Court has noted this.”`;
  return localText(th, en);
}

function makeShareVerdict(player, item) {
  const verdict = {
    type: "share",
    caseId: item.id,
    caseTitle: caseTitleValue(item),
    title: localText(translations.th.verdict.shareSetupTitle, translations.en.verdict.shareSetupTitle),
    guilty: player.guilty,
    role: player.role,
    text: localText(translations.th.verdict.shareSetupText, translations.en.verdict.shareSetupText),
    punishment: localText(translations.th.verdict.shareSetupPunishment, translations.en.verdict.shareSetupPunishment),
    friendshipStatus: localText(translations.th.verdict.shareSetupStatus, translations.en.verdict.shareSetupStatus),
    player
  };
  verdict.shareText = buildInviteText(verdict);
  return verdict;
}

function makeDuoVerdict(playerA, playerB, item) {
  const compatibility = calculateCompatibility(playerA.scores, playerB.scores);
  const relationship = pickRelationship(playerA, playerB, compatibility);
  const moreGuilty = playerA.guilty === playerB.guilty
    ? localText(translations.th.verdict.both, translations.en.verdict.both)
    : playerA.guilty > playerB.guilty ? playerA.name : playerB.name;
  const verdict = {
    type: "duo",
    caseId: item.id,
    caseTitle: caseTitleValue(item),
    title: relationship,
    text: buildDuoVerdictText(playerA, playerB, compatibility, moreGuilty),
    playerA,
    playerB,
    compatibility,
    relationship,
    punishment: pickPunishment(playerA.guilty + playerB.guilty + compatibility),
    friendshipStatus: compatibility >= 72
      ? localText(translations.th.verdict.duoStatusHigh, translations.en.verdict.duoStatusHigh)
      : localText(translations.th.verdict.duoStatusLow, translations.en.verdict.duoStatusLow)
  };
  verdict.shareText = buildShareText(verdict);
  return verdict;
}

function buildDuoVerdictText(playerA, playerB, compatibility, moreGuilty) {
  const combined = AXES.reduce((total, axis) => total + playerA.scores[axis] + playerB.scores[axis], 0);
  const guiltyTh = getLocalizedForLang(moreGuilty, "th");
  const guiltyEn = getLocalizedForLang(moreGuilty, "en");
  if (playerA.scores.snackEnergy + playerB.scores.snackEnergy >= 42) {
    return localText(
      `ศาลพบว่า ${guiltyTh} น่าสงสัยกว่าเล็กน้อย แต่พลังของกินแรงพอให้คดีนี้จบที่โต๊ะอาหารได้`,
      `The court finds ${guiltyEn} slightly sus. Luckily, snack energy can settle this at a table.`
    );
  }
  if (playerA.scores.ghosting + playerB.scores.ghosting >= 40) {
    return localText(
      `ศาลพบว่า ${guiltyTh} มีพิรุธกว่า แต่ทั้งคู่ควรเปิดโหมดตอบแชตก่อนเพื่อนตั้งศาลซ้ำ`,
      `${guiltyEn} is the bigger chat ghost. Both phones are sentenced to reply mode.`
    );
  }
  if (playerA.scores.chaos + playerB.scores.chaos >= 42) {
    return localText(
      `ศาลพบว่า ${guiltyTh} นำคะแนนความวุ่น แต่คู่นี้เปลี่ยนเรื่องธรรมดาให้เป็นคอนเทนต์ได้ดีเกินคาด`,
      `${guiltyEn} wins the chaos points. This duo turns a tiny plan into group-chat cinema.`
    );
  }
  if (compatibility >= 82) {
    return localText(
      `ศาลพบว่า ${guiltyTh} น่าสงสัยกว่าเล็กน้อย แต่จังหวะมิตรภาพเข้ากันจนหลักฐานเริ่มเขิน`,
      `${guiltyEn} is mildly sus, but the friend sync is annoyingly strong. Evidence got shy.`
    );
  }
  if (combined < 150) {
    return localText(
      `ศาลพบว่า ${guiltyTh} มีพิรุธนิดหน่อย คดีนี้ไม่รุนแรง แค่ต้องคุยกันให้ชัดก่อนสั่งน้ำ`,
      `${guiltyEn} is lightly sus. This case needs clear words and maybe one drink.`
    );
  }
  return localText(
    `ศาลพบว่า ${guiltyTh} น่าสงสัยกว่าเล็กน้อย แต่คดีนี้แก่นแท้คือมิตรภาพที่ชอบทำเรื่องเล็กให้มีพิธีเปิด`,
    `${guiltyEn} is slightly more sus. The real crime is making tiny things feel like a premiere.`
  );
}

function calculateCompatibility(a, b) {
  const chaosDiff = Math.abs(a.chaos - b.chaos);
  const snackDiff = Math.abs(a.snackEnergy - b.snackEnergy);
  const responsibilityDiff = Math.abs(a.responsibility - b.responsibility);
  const honestyDiff = Math.abs(a.honesty - b.honesty);
  const score = 92 - chaosDiff * 1.2 - snackDiff * 1.1 - responsibilityDiff * 1.8 - honestyDiff * 0.7;
  return clamp(Math.round(score), 28, 99);
}

function pickRelationship(playerA, playerB, compatibility) {
  if (playerA.scores.snackEnergy + playerB.scores.snackEnergy > 42) return localText("คู่กรณีที่ควรไปกินข้าวก่อนคุย", "Eat First, Talk Later Duo");
  if (playerA.scores.ghosting + playerB.scores.ghosting > 42) return localText("ทีมเปิดประเด็นแล้วหาย", "Open Topic, Vanish Together");
  if (compatibility > 82) return localText("คู่หูระดับตำนานของแชตกลุ่ม", "Group Chat Hall of Fame Duo");
  if (compatibility > 65) return localText("คู่หูวุ่นวายแต่ไว้ใจได้", "Chaos Duo, Trustworthy Somehow");
  return pickFriendshipTitle(compatibility);
}

function buildShareText(verdict) {
  if (verdict.type === "duo") {
    return t("share.duo", {
      caseTitle: getLocalized(verdict.caseTitle),
      title: getLocalized(verdict.title),
      a: verdict.playerA.guilty,
      b: verdict.playerB.guilty,
      compatibility: verdict.compatibility
    });
  }
  return t("share.solo", {
    caseTitle: getLocalized(verdict.caseTitle),
    title: getLocalized(verdict.title),
    guilty: verdict.guilty,
    punishment: getLocalized(verdict.punishment)
  });
}

function buildInviteText(verdict) {
  return t("share.invite", {
    caseTitle: getLocalized(verdict.caseTitle),
    url: getShareUrl(verdict)
  });
}

function getShareUrl(verdict) {
  if (verdict.type === "share") {
    const payload = encodePayload({ caseId: verdict.player.caseId, player: verdict.player });
    const url = new URL(window.location.href);
    url.hash = "case-link";
    url.searchParams.set(SHARE_PARAM, payload);
    return url.toString();
  }
  return SITE_URL;
}

function buildViralVerdictText(verdict) {
  if (verdict.type === "instant") {
    return t("share.defendantVerdict", { url: SITE_URL });
  }
  return t("share.verdict", {
    verdictTitle: getLocalized(verdict.title),
    caseTitle: getLocalized(verdict.caseTitle),
    url: SITE_URL
  });
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

async function shareSite() {
  const text = t("share.site", { url: SITE_URL });
  if (navigator.share) {
    try {
      await navigator.share({ title: t("pageTitle"), text, url: SITE_URL });
      return;
    } catch (error) {
      // A cancelled native share should still leave the user with a useful fallback.
    }
  }
  copyText(text);
}

async function shareVerdict(verdict) {
  const text = verdict.type === "share" ? buildInviteText(verdict) : buildViralVerdictText(verdict);
  const url = getShareUrl(verdict);
  trackEvent("share_verdict", {
    case_id: verdict.caseId || verdict.player?.caseId || verdict.playerA?.caseId || "",
    verdict_type: verdict.type
  });
  if (navigator.share) {
    try {
      await navigator.share({ title: t("appTitle"), text, url });
      return;
    } catch (error) {
      // A cancelled native share should still leave the user with a useful fallback.
    }
  }
  copyText(text, t("toast.shareCopied"));
}

async function shareText(verdict) {
  const text = verdict.type === "share" ? buildInviteText(verdict) : buildShareText(verdict);
  if (navigator.share) {
    try {
      await navigator.share({ title: t("appTitle"), text, url: getShareUrl(verdict) });
      return;
    } catch (error) {
      // User cancellation is harmless; copying below keeps the action useful.
    }
  }
  copyText(text);
}

async function copyText(text, successMessage = t("toast.copied")) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch (error) {
    if (legacyCopyText(text)) {
      showToast(successMessage);
      return;
    }
    showToast(t("toast.copyFailed"));
  }
}

function legacyCopyText(text) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch (error) {
    return false;
  }
}

async function exportVerdictImage(verdict, mode = "save") {
  try {
    const canvas = document.querySelector("#exportCanvas");
    const ctx = canvas.getContext("2d");
    const caseNumber = getVerdictCaseNumber(verdict);
    const caseTitle = getLocalized(verdict.caseTitle);
    const title = getLocalized(verdict.title);
    const punishment = getLocalized(verdict.punishment);
    const friendshipStatus = getLocalized(verdict.friendshipStatus);
    const parties = getVerdictParties(verdict);
    const reaction = getVerdictReaction(verdict);
    canvas.width = 1080;
    canvas.height = 1350;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#06142E");
    gradient.addColorStop(0.52, "#0A1E46");
    gradient.addColorStop(1, "#020817");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawShareBlob(ctx, 72, 78, 300, "#F8D36B", 0.18);
    drawShareBlob(ctx, 775, 70, 260, "#1D4ED8", 0.2);
    drawShareBlob(ctx, 760, 1040, 320, "#F59E0B", 0.12);
    roundRect(ctx, 70, 82, 940, 1186, 56, "#FFF9E8");
    ctx.strokeStyle = "rgba(184, 134, 11, 0.55)";
    ctx.lineWidth = 4;
    roundRectStroke(ctx, 98, 112, 884, 1126, 38);

    ctx.fillStyle = "#64748B";
    drawWrappedText(ctx, t("verdict.kicker"), 130, 166, 520, 32, canvasFont(900, 26), 1);
    ctx.fillStyle = "#0F172A";
    drawWrappedText(ctx, t("verdict.header"), 130, 226, 640, 54, canvasFont(900, 48), 1);

    roundRect(ctx, 742, 142, 210, 54, 27, "#F8E7B0");
    ctx.fillStyle = "#12306B";
    drawWrappedText(ctx, caseNumber, 774, 178, 160, 28, canvasFont(900, 25), 1);

    ctx.strokeStyle = "rgba(15, 23, 42, 0.14)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(130, 282);
    ctx.lineTo(940, 282);
    ctx.stroke();

    ctx.save();
    ctx.translate(708, 234);
    ctx.rotate(-0.13);
    ctx.strokeStyle = "#F59E0B";
    ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
    ctx.lineWidth = 8;
    roundRectStroke(ctx, 0, 0, 230, 112, 18);
    ctx.fillStyle = "#B45309";
    ctx.font = canvasFont(900, 36);
    ctx.fillText(verdict.type === "share" ? t("verdict.waiting") : reaction.verdictLabel, 26, 68);
    ctx.restore();

    roundRect(ctx, 130, 334, 810, 58, 29, "rgba(255, 255, 255, 0.62)");
    ctx.fillStyle = "#334155";
    drawWrappedText(ctx, caseTitle, 154, 373, 760, 38, canvasFont(800, 31), 1);
    drawInfoBox(ctx, 130, 420, 390, 106, t("verdictCard.plaintiff"), parties.plaintiff);
    drawInfoBox(ctx, 550, 420, 390, 106, t("verdictCard.defendant"), parties.defendant);
    ctx.save();
    ctx.translate(760, 610);
    ctx.rotate(reaction.className === "is-happy" ? 0.08 : -0.08);
    roundRect(ctx, -105, -105, 210, 210, 46, reaction.className === "is-happy" ? "#E8F8C8" : "#FFE0C8");
    ctx.font = canvasFont(900, 112);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#0F172A";
    ctx.fillText(reaction.emoji, 0, -6);
    ctx.restore();

    ctx.fillStyle = "#0F172A";
    drawWrappedText(ctx, `⚖️ ${t("verdictCard.verdict")}`, 130, 582, 500, 32, canvasFont(900, 28), 1);
    const titleEnd = drawWrappedText(ctx, title, 130, 610, 500, 64, canvasFont(900, 54), 3);

    const scoreTop = Math.max(815, titleEnd + 24);
    if (verdict.type === "instant") {
      drawWrappedText(ctx, getLocalized(verdict.text), 130, scoreTop, 810, 40, canvasFont(700, 30), 3);
    } else if (verdict.type === "duo") {
      drawMetricPill(ctx, 130, scoreTop, 250, `${verdict.playerA.guilty}%`, getLocalized(verdict.playerA.name));
      drawMetricPill(ctx, 415, scoreTop, 250, `${verdict.playerB.guilty}%`, getLocalized(verdict.playerB.name));
      drawMetricPill(ctx, 700, scoreTop, 240, `${verdict.compatibility}%`, t("verdict.compatibility"));
    } else {
      drawGuiltyBadge(ctx, 130, scoreTop, verdict.guilty);
    }

    const punishmentY = verdict.type === "duo" ? scoreTop + 238 : verdict.type === "instant" ? scoreTop + 150 : scoreTop + 230;
    drawInfoBox(ctx, 130, punishmentY, 810, 130, t("verdictCard.punishment"), punishment);
    drawInfoBox(ctx, 130, punishmentY + 158, 810, 120, "Friend Court", friendshipStatus);

    ctx.fillStyle = "#64748B";
    drawWrappedText(ctx, t("export.footer"), 130, 1198, 720, 36, canvasFont(900, 30), 1);
    ctx.fillStyle = "#64748B";
    drawWrappedText(ctx, t("export.disclaimer"), 130, 1240, 720, 30, canvasFont(700, 24), 1);

    if (mode === "share") {
      await shareCanvasPng(canvas);
    } else {
      await saveCanvasPng(canvas);
    }
    trackEvent(mode === "share" ? "share_verdict" : "save_result_image", {
      case_id: verdict.caseId || verdict.player?.caseId || verdict.playerA?.caseId || "",
      verdict_type: verdict.type
    });
  } catch (error) {
    console.warn("Verdict image export failed:", error);
    copyExportFallback(verdict);
  }
}

async function saveCanvasPng(canvas) {
  const blob = await canvasToBlob(canvas);
  if (!blob) {
    showToast(t("toast.imageBuildFailed"));
    return;
  }
  const file = createVerdictImageFile(blob);
  if (file && navigator.canShare?.({ files: [file] }) && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "Friend Court",
        text: "คำพิพากษาจาก Friend Court ⚖️",
        files: [file]
      });
      showToast(t("toast.imageShareReady"));
      return;
    } catch (error) {
      console.warn("Image share cancelled or failed:", error);
    }
  }
  const imageUrl = URL.createObjectURL(blob);
  if (isIOSDevice()) {
    const imageWindow = window.open(imageUrl, "_blank");
    if (!imageWindow) {
      showToast(t("toast.imagePopupBlocked"));
      URL.revokeObjectURL(imageUrl);
      return;
    }
    showToast(t("toast.imageOpened"));
    window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
    return;
  }
  const link = document.createElement("a");
  link.download = "friend-court-verdict.png";
  link.href = imageUrl;
  if (typeof link.download === "string") {
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(t("toast.imageSaved"));
    window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
    return;
  }
  const imageWindow = window.open(imageUrl, "_blank");
  if (imageWindow) {
    showToast(t("toast.imageOpened"));
    window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
    return;
  }
  window.location.href = imageUrl;
  showToast(t("toast.imageOpened"));
  window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
}

async function shareCanvasPng(canvas) {
  const blob = await canvasToBlob(canvas);
  if (!blob) {
    showToast(t("toast.imageBuildFailed"));
    return;
  }
  const file = createVerdictImageFile(blob);
  if (file && navigator.canShare?.({ files: [file] }) && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "Friend Court",
        text: "คำพิพากษาจาก Friend Court ⚖️",
        files: [file]
      });
      return;
    } catch (error) {
      if (isShareCancelled(error)) {
        showToast(t("toast.shareCancelled"));
        return;
      }
      console.warn("Image share failed:", error);
    }
  }
  openBlobImage(blob, t("toast.imageShareFallback"));
}

function createVerdictImageFile(blob) {
  return typeof File === "function"
    ? new File([blob], "friend-court-verdict.png", { type: "image/png" })
    : null;
}

function openBlobImage(blob, message) {
  const imageUrl = URL.createObjectURL(blob);
  const imageWindow = window.open(imageUrl, "_blank");
  if (!imageWindow) {
    showToast(t("toast.imagePopupBlocked"));
    URL.revokeObjectURL(imageUrl);
    return;
  }
  showToast(message);
  window.setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
}

function isShareCancelled(error) {
  return error?.name === "AbortError" || /cancel/i.test(error?.message || "");
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    if (!canvas.toBlob) {
      resolve(dataUrlToBlob(canvas.toDataURL("image/png")));
      return;
    }
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function dataUrlToBlob(dataUrl) {
  try {
    const [meta, data] = dataUrl.split(",");
    const mime = meta.match(/:(.*?);/)?.[1] || "image/png";
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch (error) {
    return null;
  }
}

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function copyExportFallback(verdict) {
  const text = verdict.type === "share" ? buildInviteText(verdict) : buildShareText(verdict);
  if (!navigator.clipboard?.writeText) {
    showToast(t("toast.imageFailed"));
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => showToast(t("toast.imageFailedCopied")))
    .catch(() => showToast(t("toast.imageFailed")));
}

function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundRectStroke(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.stroke();
}

function drawShareBlob(ctx, x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y + size * 0.45, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMetricPill(ctx, x, y, width, value, label) {
  roundRect(ctx, x, y, width, 160, 30, "#EAF4FF");
  ctx.fillStyle = "#0369A1";
  ctx.font = canvasFont(900, 58);
  ctx.fillText(value, x + 26, y + 74);
  ctx.fillStyle = "#64748B";
  drawWrappedText(ctx, label, x + 26, y + 122, width - 52, 30, canvasFont(800, 24), 1);
}

function drawGuiltyBadge(ctx, x, y, value) {
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#D9ECFF";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(x + 96, y + 96, 88, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#0369A1";
  ctx.font = canvasFont(900, 72);
  ctx.fillText(String(value), x + 42, y + 106);
  ctx.fillStyle = "#64748B";
  drawWrappedText(ctx, t("verdict.guiltySmall"), x + 44, y + 148, 112, 25, canvasFont(900, 22), 1);
  ctx.restore();
}

function drawInfoBox(ctx, x, y, width, height, label, value) {
  roundRect(ctx, x, y, width, height, 26, "#FFFFFF");
  ctx.strokeStyle = "#D8E7F8";
  ctx.lineWidth = 3;
  roundRectStroke(ctx, x, y, width, height, 26);
  ctx.fillStyle = "#64748B";
  drawWrappedText(ctx, label, x + 28, y + 38, width - 56, 28, canvasFont(900, 24), 1);
  ctx.fillStyle = "#0F172A";
  drawWrappedText(ctx, value, x + 28, y + 82, width - 56, 34, canvasFont(800, 29), 2);
}

function canvasFont(weight, size) {
  return `${weight} ${size}px "Noto Sans Thai", "IBM Plex Sans Thai", sans-serif`;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, font, maxLines = 99) {
  ctx.font = font;
  let linesDrawn = 0;
  String(text).split("\n").forEach((paragraph) => {
    if (linesDrawn >= maxLines) return;
    const words = getWrapTokens(paragraph, ctx, maxWidth);
    let line = "";
    words.forEach((token) => {
      if (linesDrawn >= maxLines) return;
      if (/^\s+$/.test(token) && !line) return;
      const test = `${line}${token}`;
      if (!/^\s+$/.test(token) && ctx.measureText(test.trimEnd()).width > maxWidth && line.trim()) {
        const output = line.trimEnd();
        ctx.fillText(linesDrawn === maxLines - 1 ? ellipsize(ctx, output, maxWidth) : output, x, y);
        linesDrawn += 1;
        line = token.trimStart();
        y += lineHeight;
      } else {
        line = test;
      }
    });
    if (line.trim() && linesDrawn < maxLines) {
      const output = line.trimEnd();
      ctx.fillText(linesDrawn === maxLines - 1 ? ellipsize(ctx, output, maxWidth) : output, x, y);
      linesDrawn += 1;
      y += lineHeight;
    }
  });
  return y;
}

function getWrapTokens(text, ctx, maxWidth) {
  const source = String(text).trim();
  if (!source) return [];
  if (currentLang === "th" && typeof Intl !== "undefined" && Intl.Segmenter) {
    const segments = Array.from(new Intl.Segmenter("th", { granularity: "word" }).segment(source), (item) => item.segment);
    return segments.flatMap((segment) => (/^\s+$/.test(segment) ? [segment] : splitLongToken(segment, ctx, maxWidth)));
  }
  return source.split(/(\s+)/).filter(Boolean).flatMap((segment) => (/^\s+$/.test(segment) ? [segment] : splitLongToken(segment, ctx, maxWidth)));
}

function splitLongToken(token, ctx, maxWidth) {
  if (ctx.measureText(token).width <= maxWidth) return [token];
  const chunks = [];
  let chunk = "";
  Array.from(token).forEach((char) => {
    const test = chunk + char;
    if (ctx.measureText(test).width > maxWidth && chunk) {
      chunks.push(chunk);
      chunk = char;
    } else {
      chunk = test;
    }
  });
  if (chunk) chunks.push(chunk);
  return chunks;
}

function ellipsize(ctx, text, maxWidth) {
  let output = text;
  while (output.length > 1 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function saveVerdict(verdict) {
  if (verdict.type === "share") return;
  const store = loadStore();
  store.history = [
    {
      id: cryptoRandomId(),
      createdAt: new Date().toISOString(),
      type: verdict.type,
      caseId: verdict.caseId || null,
      resultKey: verdict.resultKey || null,
      relationship: verdict.relationship || null,
      caseTitle: getLocalized(verdict.caseTitle, "th"),
      title: getLocalized(verdict.title, "th"),
      plaintiffName: verdict.plaintiffName || null,
      defendantName: verdict.defendantName || null,
      guilty: verdict.guilty || null,
      compatibility: verdict.compatibility || null
    },
    ...(store.history || [])
  ].slice(0, 30);
  writeStore(store);
}

function getHistoryTitle(item) {
  if (item.type === "duo") {
    return getLocalized(item.relationship) || getLocalized(localText(item.title, findFriendshipTranslation(item.title)));
  }
  if (item.resultKey) {
    const template = resultTemplates.find((result) => result.title === item.resultKey);
    if (template) return getLocalized(resultField(template, "title"));
  }
  return getLocalized(localText(item.title || "", findResultTitleTranslation(item.title)));
}

function getHistoryCaseTitle(item) {
  const source = item.caseId ? getCase(item.caseId) : cases.find((caseItem) => caseItem.title === item.caseTitle);
  return source ? getCaseTitle(source) : getLocalized(localText(item.caseTitle || "", item.caseTitle || ""));
}

function getHistorySummary(item) {
  if (item.type === "duo" || item.compatibility) {
    return t("history.compatibilitySummary", { percent: item.compatibility || 0 });
  }
  if (!item.guilty && item.summary) return item.summary;
  return t("history.guiltySummary", { percent: item.guilty || 0 });
}

function findResultTitleTranslation(title) {
  return resultTranslations[title]?.title || title;
}

function findFriendshipTranslation(title) {
  const index = friendshipTitles.indexOf(title);
  return index >= 0 ? friendshipTitleTranslations[index] : title;
}

function updateDailyStreak() {
  const store = loadStore();
  const today = getDateKey(new Date());
  if (store.lastDailyDate === today) return;
  const yesterday = getDateKey(new Date(Date.now() - 86400000));
  store.dailyStreak = store.lastDailyDate === yesterday ? (store.dailyStreak || 0) + 1 : 1;
  store.lastDailyDate = today;
  store.dailyCaseId = state.dailyCaseId;
  writeStore(store);
}

function getDailyCaseId() {
  const key = getDateKey(new Date());
  const seed = key.split("-").reduce((sum, part) => sum + Number(part), 0);
  return cases[seed % cases.length].id;
}

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function writeStore(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    showToast(t("toast.storageFailed"));
  }
}

function loadSavedParties() {
  try {
    const saved = JSON.parse(localStorage.getItem(PARTY_STORAGE_KEY)) || {};
    state.plaintiffName = typeof saved.plaintiffName === "string" ? saved.plaintiffName : "";
    state.defendantName = typeof saved.defendantName === "string" ? saved.defendantName : "";
  } catch (error) {
    state.plaintiffName = "";
    state.defendantName = "";
  }
}

function persistParties() {
  try {
    localStorage.setItem(PARTY_STORAGE_KEY, JSON.stringify({
      plaintiffName: state.plaintiffName,
      defendantName: state.defendantName
    }));
  } catch (error) {
    // Names are still kept for the current session when storage is unavailable.
  }
}

function hasParties() {
  return Boolean(state.plaintiffName.trim() && state.defendantName.trim());
}

function getVerdictParties(verdict) {
  return {
    plaintiff: verdict.plaintiffName || state.plaintiffName || getLocalized(verdict.playerA?.name) || t("players.us"),
    defendant: verdict.defendantName || state.defendantName || getLocalized(verdict.playerB?.name) || t("players.friend")
  };
}

function getVerdictReaction(verdict) {
  const defendantWins = verdict.outcome === "defendant_wins" || (!verdict.outcome && Number(verdict.guilty || 0) < 58);
  if (defendantWins) {
    return {
      emoji: "😎",
      label: t("verdictCard.happyReaction"),
      verdictLabel: t("verdictCard.acquitted"),
      className: "is-happy"
    };
  }
  return {
    emoji: "😭",
    label: t("verdictCard.sadReaction"),
    verdictLabel: t("verdictCard.guilty"),
    className: "is-sad"
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hashScore(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function encodePayload(payload) {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodePayload(value) {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch (error) {
    return null;
  }
}

function readShareParam() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(SHARE_PARAM);
  return value ? decodePayload(value) : null;
}

function getCase(id) {
  return cases.find((item) => item.id === id) || cases[0];
}

function resultField(template, field) {
  return localText(template[field], resultTranslations[template.title]?.[field] || template[field]);
}

function pickPunishment(score) {
  const index = Math.abs(Math.round(score)) % punishments.length;
  return localText(punishments[index], punishmentTranslations[index] || punishments[index]);
}

function pickFriendshipTitle(score) {
  const index = Math.abs(Math.round(score)) % friendshipTitles.length;
  return localText(friendshipTitles[index], friendshipTitleTranslations[index] || friendshipTitles[index]);
}

function pickByScore(list, score) {
  return list[Math.abs(Math.round(score)) % list.length];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cryptoRandomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showToast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2600);
}


