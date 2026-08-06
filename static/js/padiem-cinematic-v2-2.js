
(() => {
const PANELS = {
ax: {
accent: "143,207,255",
kicker: "SOLUTIONS 01",
title: "Generative AI · AX",
lead: "기업의 문서, 지식, 보고, 견적, 교육과 반복 업무를 AI 기반으로 다시 설계합니다.",
items: [
"기업용 AI 에이전트",
"업무 프로세스 자동화",
"사내 문서와 지식 검색",
"보고서·제안서·견적서 생성",
"조직 맞춤형 AI 시스템",
"도입 전략과 운영 체계 설계",
],
},
public: {
accent: "126,221,230",
kicker: "SOLUTIONS 02",
title: "Public AI Agent",
lead: "복잡한 정책과 행정 절차를 시민이 이해하고 실행할 수 있는 언어로 연결합니다.",
items: [
"지자체 AI 안내 서비스",
"행정정보와 정책 탐색",
"민원·신청서 작성 지원",
"공공데이터 연결",
"다국어 행정 안내",
"국민 체감형 AI 서비스",
],
},
multimodal: {
accent: "239,196,123",
kicker: "SOLUTIONS 03",
title: "Multimodal Content AI",
lead: "텍스트, 음성, 이미지와 영상을 하나의 콘텐츠 제작 흐름으로 연결합니다.",
items: [
"음성인식",
"음성합성",
"실시간 통역·번역",
"이미지·영상 생성",
"다국어 콘텐츠 제작",
"립싱크와 음성 기반 영상",
"자동 요약과 콘텐츠 재구성",
],
},
safety: {
accent: "138,211,184",
kicker: "SOLUTIONS 04",
title: "Safety · Vision AI",
lead: "센서와 영상 데이터를 분석해 현장의 위험을 감지하고 대응 흐름을 연결합니다.",
items: [
"영상 기반 위험 감지",
"현장 안전 모니터링",
"IoT 센서 연계",
"위치 기반 서비스",
"모바일·클라우드 연결",
"이상 상황 알림과 대응 지원",
],
},
about: {
accent: "228,188,116",
kicker: "COMPANY",
title: "주식회사 파디엠",
titleLines: ["주식회사", "파디엠"],
lead: "주식회사 파디엠은 2018년 5월 설립된 AI·소프트웨어 기술기업으로, 산업과 공공 현장의 문제를 기술로 해결합니다.",
paragraphs: [
"파디엠은 위험 상황에서 영상·사진·위치 정보를 전송하는 안전 IoT 기술을 개발하며 현장 안전 기술의 기반을 만들었습니다.",
"이후 음성인식·음성합성·실시간 번역·통역, 영상 생성, 자동 요약, 컴퓨터 비전과 멀티모달 AI로 기술 영역을 확장했으며, 현재는 생성형 AI·업무자동화(AX)와 공공 AI 에이전트를 중심으로 기업과 기관의 실제 업무 전환을 지원합니다.",
],
sections: [
{
label: "01 · COMPANY",
title: "회사",
items: [
"주식회사 파디엠 · PADIEM Co., Ltd.",
"2018년 5월 법인 설립",
],
},
{
label: "02 · TECHNOLOGY",
title: "기술",
items: [
"Safety IoT · 시민 안전",
"음성·언어 AI",
"Vision · Multimodal AI",
"Generative AI · AX",
"Public AI Agent",
],
},
{
label: "03 · SERVICES",
title: "서비스",
items: [
"AI 시스템 개발",
"AI 모델 개발",
"AI·AX 도입",
"AI 교육·컨설팅",
],
},
],
},
team: {
accent: "153,194,229",
kicker: "TEAM",
title: "Leadership",
lead: "파디엠을 이끄는 두 명의 리더를 소개합니다.",
leadership: [
{ role:"CEO · FOUNDER", name:"강혜림", image:"/images/about/ceo.png", alt:"주식회사 파디엠 CEO 강혜림", summary:"공공안전 문제를 AI 기술과 사업으로 연결하는 창업자", facts:["경찰대학교 공공안전행정 박사","광주인공지능청년협회 회장","올해의 청년기업인 중소벤처기업부 장관상","세계여성발명대회 대상·금상·동상"] },
{ role:"CTO", name:"강철원", summary:"AI 기술을 제품과 서비스로 구현하는 기술 리더", image:"/images/about/cto.png", alt:"주식회사 파디엠 CTO 강철원", facts:[{ school:"University of Illinois Urbana-Champaign", field:"Computer Science · Data Science" },"경찰대학교 공공안전행정","산업통상자원부 장관상"] },
],
},
inquiry: {
accent: "143,207,255",
kicker: "CONTACT",
title: "Project Inquiry",
lead: "현재 해결하려는 업무와 문제를 알려주시면 적용 가능한 AI 방식부터 함께 검토합니다.",
items: [
"기업 AI 도입",
"공공 AI 서비스",
"맞춤형 기술 개발",
"AI 교육·컨설팅",
"사업 제휴",
"기타 프로젝트",
],
inquiry: true,
},
};
const overlay = document.getElementById("overlay");
const kicker = document.getElementById("overlayKicker");
const title = document.getElementById("overlayTitle");
const lead = document.getElementById("overlayLead");
const body = document.getElementById("overlayBody");
const closeBtn = overlay.querySelector(".overlay-close");
let lastTrigger = null;
const renderList = (items) =>
`<ul class="overlay-list">${items.map((item) => `<li><span>${item}</span></li>`).join("")}</ul>`;
const renderRows = (rows) =>
`<dl class="overlay-rows">${rows
.map(([label, value]) => {
const v = Array.isArray(value)
? value.map((s) => `<span>${s}</span>`).join('<span class="sep">·</span>')
: value;
return `<div class="overlay-row"><dt>${label}</dt><dd>${v}</dd></div>`;
})
.join("")}</dl>`;
const renderCompanySections = (sections) =>
`<section class="company-sections" aria-label="회사 기술 서비스">${sections.map((section) => `<article class="company-section"><p class="company-section-label">${section.label}</p><h3>${section.title}</h3><ul>${section.items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</section>`;
const renderLeadership = (leaders) =>
`<section class="leadership" aria-label="파디엠 리더십"><div class="leadership-grid">${leaders.map((leader) => `<article class="leader-card"><div class="leader-photo-wrap"><img class="leader-photo" src="${leader.image}" alt="${leader.alt}" loading="eager" /></div><div class="leader-meta"><p class="leader-role">${leader.role}</p><h3 class="leader-name">${leader.name}</h3>${leader.summary ? `<p class="leader-summary">${leader.summary}</p>` : ""}<ul class="leader-facts">${leader.facts.map((fact) => typeof fact === "string" ? `<li>${fact}</li>` : `<li><strong class="leader-school">${fact.school}</strong><span class="leader-field">${fact.field}</span></li>`).join("")}</ul></div></article>`).join("")}</div></section>`;
const render = (key) => {
const panel = PANELS[key];
if (!panel) return;
overlay.dataset.panel = key;
overlay.style.setProperty("--overlay-accent-rgb", panel.accent || "143,207,255");
kicker.textContent = panel.kicker;
if (panel.titleLines) {
title.innerHTML = panel.titleLines.map((line) => `<span class="title-line">${line}</span>`).join("");
} else {
title.textContent = panel.title;
}
lead.textContent = panel.lead;
let html = "";
if (panel.paragraphs) {
html += `<div class="overlay-narrative">${panel.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>`;
}
if (panel.items) html += renderList(panel.items);
if (panel.rows) html += renderRows(panel.rows);
if (panel.sections) html += renderCompanySections(panel.sections);
if (panel.leadership) html += renderLeadership(panel.leadership);
if (panel.inquiry) {
html += `<div class="overlay-extra"><div class="contact-email" aria-label="문의 이메일 ceo@padiem.net"><span class="contact-email-label">문의 이메일</span><span class="contact-email-address">ceo@padiem.net</span></div></div>`;
}
body.innerHTML = html;
};
const openOverlay = (key, trigger) => {
render(key);
lastTrigger = trigger || null;
overlay.hidden = false;
overlay.setAttribute("aria-hidden", "false");
document.body.classList.add("overlay-open");
closeBtn.focus();
};
const closeOverlay = () => {
overlay.hidden = true;
overlay.setAttribute("aria-hidden", "true");
document.body.classList.remove("overlay-open");
if (lastTrigger) lastTrigger.focus();
};
document.querySelectorAll("[data-overlay]").forEach((el) => {
el.addEventListener("click", (event) => {
event.preventDefault();
openOverlay(el.dataset.overlay, el);
});
if (el.tagName === "DIV") {
el.addEventListener("keydown", (event) => {
if (event.key === "Enter" || event.key === " ") {
event.preventDefault();
openOverlay(el.dataset.overlay, el);
}
});
}
});
overlay.querySelectorAll("[data-overlay-close]").forEach((el) => {
el.addEventListener("click", closeOverlay);
});
addEventListener("keydown", (event) => {
if (event.key === "Escape" && !overlay.hidden) closeOverlay();
});
})();
