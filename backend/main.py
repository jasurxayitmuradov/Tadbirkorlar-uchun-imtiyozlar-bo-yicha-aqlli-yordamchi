from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional
import html
import re
import time
import xml.etree.ElementTree as ET
import tempfile

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pdfminer.high_level import extract_text

LEX_RSS_URL = "https://lex.uz/rss"
LEX_BASE_URL = "https://lex.uz"
CACHE_TTL_SECONDS = 600




ENTREPRENEUR_KEYWORDS = [
    "tadbirkor",
    "tadbirkorlik",
    "biznes",
    "kichik biznes",
    "xususiy",
    "soliq",
    "imtiyoz",
    "yengillik",
    "subsid",
    "subsidiya",
    "grant",
    "kredit",
    "mikrokredit",
    "litsenziya",
    "ruxsatnoma",
    "eksport",
    "import",
    "invest",
    "investitsiya",
    "yatt",
    "mchj",
    "tekshiruv",
    "nazorat",
    "jarima",
    # Cyrillic (Uzbek/Russian) variants
    "тадбиркор",
    "тадбиркорлик",
    "бизнес",
    "кичик бизнес",
    "хусусий",
    "солиқ",
    "имтиёз",
    "енгиллик",
    "субсид",
    "субсидия",
    "грант",
    "кредит",
    "микрокредит",
    "лицензия",
    "рухсатнома",
    "экспорт",
    "импорт",
    "инвест",
    "инвестиция",
    "ятт",
    "мчж",
    "текширув",
    "назорат",
    "жарима",
    # Russian terms
    "предприниматель",
    "предпринимательство",
    "льгота",
    "льготы",
    "налог",
    "субсидия",
    "субсидии",
    "грант",
    "кредит",
    "микрокредит",
    "лицензия",
    "разрешение",
    "экспорт",
    "импорт",
    "инвестиции",
]


class NewsItem(BaseModel):
    title: str
    link: str
    pubDate: str
    description: str
    guid: str


class NewsResponse(BaseModel):
    source: str
    generated_at: str
    total: int
    items: List[NewsItem]


class ContextItem(BaseModel):
    id: str
    doc_title: str
    doc_type: str
    source: str
    url: str
    status_hint: str
    published_date: str
    effective_date: str
    last_updated: str
    article_or_clause: str
    snippet_text: str
    snippet_language: str
    confidence: float


class ContextPayload(BaseModel):
    items: List[ContextItem]


class EligibilityRule(BaseModel):
    rule: str
    needsField: Optional[str] = None
    source_ref: Optional[str] = None


class ContextSnippet(BaseModel):
    ctx_id: str
    snippet_text: str
    article_or_clause: str
    url: str
    status_hint: str


class ApplicationSpec(BaseModel):
    requiredFields: List[str]
    optionalFields: List[str] = []
    requiredAttachments: List[str] = []
    submitChannel: str
    manualLink: Optional[str] = None


class BenefitPayload(BaseModel):
    benefitId: str
    benefitTitle: str
    benefitSummary: str
    status_hint: str
    applicationSpec: ApplicationSpec
    eligibilityRules: List[EligibilityRule] = []
    contextSnippets: List[ContextSnippet]


class UserAttachments(BaseModel):
    registrationCert: Optional[str] = None
    charter: Optional[str] = None
    directorOrder: Optional[str] = None
    passportCopy: Optional[str] = None


class UserProfile(BaseModel):
    userId: str
    consentAutoSubmit: bool
    legalForm: str
    companyName: str
    firstName: str
    lastName: str
    tin: str
    phone: str
    region: str
    address: Optional[str] = None
    oked: List[str]
    bankAccount: Optional[str] = None
    email: Optional[str] = None
    employeesCount: Optional[int] = None
    annualTurnover: Optional[float] = None
    attachments: UserAttachments


class BenefitIngestRequest(BaseModel):
    benefit: BenefitPayload


class DecisionRequest(BaseModel):
    benefit: BenefitPayload
    user_profile: UserProfile
    app_base_url: str


class SubmitRequest(BaseModel):
    benefitId: str
    userId: str
    fields: dict
    attachments: List[dict]


class SmsRequest(BaseModel):
    to: str
    text: str


class BenefitStatusItem(BaseModel):
    benefitId: str
    status: str
    updatedAt: int
    trackingId: Optional[str] = None
    userId: Optional[str] = None


class TaxApplication(BaseModel):
    applicationId: str
    title: str
    summary: str
    serviceUrl: str
    status_hint: str
    submitChannel: str
    requiredFields: List[str]
    requiredAttachments: List[str] = []
    needsOneID: bool
    needsECP: bool
    contextSnippets: List[ContextSnippet] = []


class TaxDecisionRequest(BaseModel):
    tax_application: TaxApplication
    user_profile: UserProfile
    app_base_url: str


class MyGovSubmitRequest(BaseModel):
    userId: str
    applicationId: str
    serviceUrl: str
    fields: dict
    attachments: List[dict]
    sourceUrls: List[str]
    createdAt: int


@dataclass
class CacheState:
    items: List[NewsItem]
    fetched_at: float


cache_state: Optional[CacheState] = None

# MVP in-memory stores
benefits_store: dict = {}
applications_store: List[dict] = []
notifications_store: List[dict] = []
audit_log: List[dict] = []


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def strip_html(text: Optional[str]) -> str:
    if not text:
        return ""
    cleaned = re.sub(r"(?is)<(script|style).*?>.*?</\1>", " ", text)
    no_tags = re.sub(r"<[^>]+>", " ", cleaned)
    collapsed = re.sub(r"\s+", " ", no_tags).strip()
    return html.unescape(collapsed)


def to_absolute_lex_link(rel_or_abs: Optional[str]) -> str:
    if not rel_or_abs:
        return ""
    link = rel_or_abs.strip()
    if link.startswith("http://") or link.startswith("https://"):
        return link
    if not link.startswith("/"):
        link = "/" + link
    return f"{LEX_BASE_URL}{link}"


def matches_entrepreneurship(text: str) -> bool:
    haystack = text.lower()
    return any(keyword in haystack for keyword in ENTREPRENEUR_KEYWORDS)


def _tag_name(tag: str) -> str:
    return tag.split("}", 1)[-1] if "}" in tag else tag


def _child_text(item: ET.Element, name: str) -> str:
    for child in list(item):
        if _tag_name(child.tag) == name:
            return child.text or ""
    return ""


def parse_rss(xml_text: str) -> List[NewsItem]:
    root = ET.fromstring(xml_text)
    items: List[NewsItem] = []
    for elem in root.iter():
        if _tag_name(elem.tag) != "item":
            continue
        title = _child_text(elem, "title").strip()
        link_raw = _child_text(elem, "link").strip()
        guid_raw = _child_text(elem, "guid").strip()
        pub_date = _child_text(elem, "pubDate").strip()
        description_raw = _child_text(elem, "description")
        description = strip_html(description_raw)
        link = to_absolute_lex_link(link_raw)
        guid = guid_raw or link_raw or link

        items.append(
            NewsItem(
                title=title,
                link=link,
                pubDate=pub_date,
                description=description,
                guid=guid,
            )
        )
    return items


def _get_missing_fields(required_fields: List[str], user: UserProfile) -> List[str]:
    missing = []
    for field in required_fields:
        value = getattr(user, field, None)
        if value is None or (isinstance(value, str) and not value.strip()) or (isinstance(value, list) and len(value) == 0):
            missing.append(field)
    return missing


def _get_missing_attachments(required_attachments: List[str], user: UserProfile) -> List[str]:
    missing = []
    for att in required_attachments:
        value = getattr(user.attachments, att, None)
        if not value:
            missing.append(att)
    return missing


def _build_sms_text(benefit_title: str, missing_fields: List[str], missing_attachments: List[str], app_base_url: str) -> str:
    missing_parts = []
    if missing_fields:
        missing_parts.append("maydonlar: " + ", ".join(missing_fields))
    if missing_attachments:
        missing_parts.append("hujjatlar: " + ", ".join(missing_attachments))
    missing_text = "; ".join(missing_parts) if missing_parts else "ma'lumotlar yetishmaydi"
    return f"{benefit_title}. Yetishmayotganlar — {missing_text}. Profilni to'ldiring: {app_base_url}"


def _make_decision(payload: DecisionRequest) -> dict:
    benefit = payload.benefit
    user = payload.user_profile
    warnings = []
    if benefit.status_hint in ("noaniq", "amalda_emas"):
        warnings.append("Hujjat statusi noaniq yoki amalda emas ko‘rinmoqda.")

    eligibility_status = "eligible"
    eligibility_details = []
    if benefit.eligibilityRules:
        for rule in benefit.eligibilityRules:
            if rule.needsField:
                value = getattr(user, rule.needsField, None)
                if value is None or (isinstance(value, str) and not value.strip()):
                    eligibility_status = "unknown"
                    eligibility_details.append(f"Mezonni tekshirish uchun '{rule.needsField}' yetishmaydi.")
    else:
        eligibility_status = "unknown"
        eligibility_details.append("Moslik mezonlari kontekstdan aniq emas.")

    missing_fields = _get_missing_fields(benefit.applicationSpec.requiredFields, user)
    missing_attachments = _get_missing_attachments(benefit.applicationSpec.requiredAttachments, user)

    decision = "AUTO_SUBMIT"
    reason = "Barcha talablar bajarildi."

    if benefit.applicationSpec.submitChannel == "manual_link":
        decision = "MANUAL_ONLY"
        reason = "Ariza faqat manual link orqali yuboriladi."
    elif not user.consentAutoSubmit:
        decision = "SEND_SMS"
        reason = "Avto yuborishga rozilik berilmagan."
    elif missing_fields or missing_attachments:
        decision = "SEND_SMS"
        reason = "Kerakli ma’lumotlar yoki hujjatlar yetishmaydi."
    elif eligibility_status != "eligible":
        decision = "MANUAL_ONLY"
        reason = "Moslikni avtomatik tasdiqlash mumkin emas."

    fields = {}
    for key in benefit.applicationSpec.requiredFields + benefit.applicationSpec.optionalFields:
        value = getattr(user, key, None)
        if value is not None and value != "":
            fields[key] = value

    attachments = []
    for att in benefit.applicationSpec.requiredAttachments:
        file_id = getattr(user.attachments, att, None)
        if file_id:
            attachments.append({"name": att, "fileId": file_id})

    sms_text = _build_sms_text(benefit.benefitTitle, missing_fields, missing_attachments, payload.app_base_url)

    return {
        "decision": decision,
        "reason": reason,
        "warnings": warnings,
        "missing": {"fields": missing_fields, "attachments": missing_attachments},
        "eligibility": {"status": eligibility_status, "details": eligibility_details},
        "prefilled_application": {
            "benefitId": benefit.benefitId,
            "fields": fields,
            "attachments": attachments,
        },
        "submit_request": {
            "endpoint": "/api/submit",
            "method": "POST",
            "body": {
                "benefitId": benefit.benefitId,
                "userId": user.userId,
                "fields": fields,
                "attachments": attachments,
            },
        },
        "sms": {"to": user.phone, "text": sms_text},
        "log": {"event": decision, "benefitId": benefit.benefitId, "userId": user.userId},
    }


def _make_tax_decision(payload: TaxDecisionRequest) -> dict:
    app = payload.tax_application
    user = payload.user_profile
    warnings = []
    if app.status_hint == "amalda_emas":
        warnings.append("Xizmat amalda emas.")

    missing_fields = _get_missing_fields(app.requiredFields, user)
    missing_attachments = _get_missing_attachments(app.requiredAttachments, user)

    decision = "AUTO_SUBMIT"
    reason = "Barcha talablar bajarildi."

    if app.status_hint == "amalda_emas":
        decision = "SEND_SMS"
        reason = "Xizmat amalda emas."
    elif app.needsECP:
        decision = "MANUAL_ONLY"
        reason = "ERI talab qilinadi."
    elif not user.consentAutoSubmit:
        decision = "SEND_SMS"
        reason = "Avto yuborishga rozilik berilmagan."
    elif missing_fields or missing_attachments:
        decision = "SEND_SMS"
        reason = "Kerakli ma’lumotlar yoki hujjatlar yetishmaydi."
    elif app.submitChannel == "manual_link":
        decision = "MANUAL_ONLY"
        reason = "Ariza faqat manual link orqali yuboriladi."

    fields = {}
    for key in app.requiredFields:
        value = getattr(user, key, None)
        if value is not None and value != "":
            fields[key] = value

    attachments = []
    for att in app.requiredAttachments:
        file_id = getattr(user.attachments, att, None)
        if file_id:
            attachments.append({"name": att, "fileId": file_id})

    sms_text = _build_sms_text(
        app.title,
        missing_fields[:4],
        missing_attachments[:4],
        f"{payload.app_base_url}/profile?complete=1&applicationId={app.applicationId}",
    )
    if decision in ("MANUAL_ONLY", "SEND_SMS"):
        sms_text = f"{sms_text} Ariza havolasi: {app.serviceUrl}"
        if app.needsECP:
            sms_text = f"{sms_text}. Eslatma: ERI talab qilinadi."
        if app.status_hint == "noaniq":
            sms_text = f"{sms_text}. Eslatma: xizmat holati noaniq."

    return {
        "decision": decision,
        "reason": reason,
        "warnings": warnings,
        "missing": {"fields": missing_fields, "attachments": missing_attachments},
        "prefilled_application": {
            "applicationId": app.applicationId,
            "userId": user.userId,
            "serviceUrl": app.serviceUrl,
            "fields": fields,
            "attachments": attachments,
            "sourceUrls": [snip.url for snip in app.contextSnippets if snip.url],
        },
        "submit_request": {
            "endpoint": "/api/mygov/submit",
            "method": "POST",
            "body": {
                "userId": user.userId,
                "applicationId": app.applicationId,
                "serviceUrl": app.serviceUrl,
                "fields": fields,
                "attachments": attachments,
                "sourceUrls": [snip.url for snip in app.contextSnippets if snip.url],
                "createdAt": int(time.time()),
            },
        },
        "sms": {"to": user.phone, "text": sms_text},
    }


def _is_pdf_url(url: str, content_type: str) -> bool:
    if "application/pdf" in content_type.lower():
        return True
    return url.lower().split("?")[0].endswith(".pdf")


def _guess_title_from_html(html_text: str) -> str:
    match = re.search(r"(?is)<title>(.*?)</title>", html_text)
    if not match:
        return ""
    return strip_html(match.group(1))[:200]


def _extract_text_from_pdf_bytes(data: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
        tmp.write(data)
        tmp.flush()
        return extract_text(tmp.name) or ""


async def fetch_rss() -> List[NewsItem]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(LEX_RSS_URL)
        resp.raise_for_status()
    return parse_rss(resp.text)


def get_cached_items() -> Optional[List[NewsItem]]:
    global cache_state
    if not cache_state:
        return None
    return cache_state.items


def cache_is_valid() -> bool:
    if not cache_state:
        return False
    return (time.time() - cache_state.fetched_at) < CACHE_TTL_SECONDS


app = FastAPI(title="Lex RSS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5177",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/news/lex", response_model=NewsResponse)
async def get_lex_news(
    limit: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
    mode: str = Query("entrepreneurship", pattern="^(entrepreneurship|all)$"),
) -> NewsResponse:
    global cache_state

    items: Optional[List[NewsItem]] = None
    if cache_is_valid():
        items = cache_state.items
    else:
        try:
            items = await fetch_rss()
            cache_state = CacheState(items=items, fetched_at=time.time())
        except Exception:
            items = get_cached_items()
            if not items:
                raise HTTPException(
                    status_code=502,
                    detail="Failed to fetch lex.uz RSS and no cached data available.",
                )

    filtered = items

    if mode == "entrepreneurship":
        filtered = [
            item
            for item in filtered
            if matches_entrepreneurship(f"{item.title} {item.description}")
        ]
        if q:
            query = q.lower()
            filtered = [
                item
                for item in filtered
                if query in f"{item.title} {item.description}".lower()
            ]

    limited = filtered[:limit]

    return NewsResponse(
        source="lex.uz/rss",
        generated_at=now_iso(),
        total=len(filtered),
        items=limited,
    )


@app.get("/api/context/lex", response_model=ContextPayload)
async def get_lex_context(
    url: str = Query(..., min_length=5),
    title: Optional[str] = None,
    published_date: Optional[str] = None,
) -> ContextPayload:
    if not url:
        raise HTTPException(status_code=400, detail="Missing url")

    html_text = ""
    is_pdf = False
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "")
            is_pdf = _is_pdf_url(url, content_type)
            if is_pdf:
                raw_text = _extract_text_from_pdf_bytes(resp.content)
            else:
                html_text = resp.text
                raw_text = strip_html(html_text)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch context: {exc}")

    snippet = (raw_text or "").strip()
    if not snippet:
        snippet = "Matn ajratib bo'lmadi. Iltimos, hujjatni Lex.uz orqali tekshiring."

    inferred_title = title or ("" if is_pdf else _guess_title_from_html(html_text)) or url
    source = "lex.uz" if "lex.uz" in url else "other"

    item = ContextItem(
        id=url,
        doc_title=inferred_title,
        doc_type="Boshqa",
        source=source,
        url=url,
        status_hint="unknown",
        published_date=published_date or "",
        effective_date="",
        last_updated="",
        article_or_clause="Band/Bo'lim topilmadi",
        snippet_text=snippet[:4000],
        snippet_language="uz",
        confidence=0.5,
    )

    return ContextPayload(items=[item])


@app.post("/api/benefits/ingest")
async def ingest_benefit(payload: BenefitIngestRequest):
    benefits_store[payload.benefit.benefitId] = payload.benefit.dict()
    audit_log.append(
        {
            "event": "BENEFIT_INGESTED",
            "benefitId": payload.benefit.benefitId,
            "createdAt": int(time.time()),
        }
    )
    return {"ok": True, "benefitId": payload.benefit.benefitId}


@app.post("/api/benefits/decision")
async def decide_benefit(payload: DecisionRequest):
    decision = _make_decision(payload)
    audit_log.append(
        {
            "event": "DECISION",
            "benefitId": payload.benefit.benefitId,
            "userId": payload.user_profile.userId,
            "decision": decision.get("decision"),
            "createdAt": int(time.time()),
        }
    )
    return decision


@app.post("/api/submit")
async def submit_application(payload: SubmitRequest):
    tracking_id = f"SUB-{int(time.time())}"
    applications_store.append(
        {
            "benefitId": payload.benefitId,
            "userId": payload.userId,
            "status": "Submitted",
            "trackingId": tracking_id,
            "updatedAt": int(time.time()),
        }
    )
    audit_log.append(
        {
            "event": "SUBMITTED",
            "benefitId": payload.benefitId,
            "userId": payload.userId,
            "trackingId": tracking_id,
            "createdAt": int(time.time()),
        }
    )
    return {"ok": True, "trackingId": tracking_id}


@app.post("/api/notify/sms")
async def notify_sms(payload: SmsRequest):
    message_id = f"SMS-{int(time.time())}"
    notifications_store.append(
        {
            "messageId": message_id,
            "to": payload.to,
            "text": payload.text,
            "createdAt": int(time.time()),
        }
    )
    audit_log.append(
        {
            "event": "SMS_SENT",
            "messageId": message_id,
            "createdAt": int(time.time()),
        }
    )
    return {"ok": True, "messageId": message_id}


@app.get("/api/benefits/status", response_model=List[BenefitStatusItem])
async def get_benefit_status(userId: str):
    return [
        BenefitStatusItem(
            benefitId=item.get("benefitId"),
            status=item.get("status"),
            updatedAt=item.get("updatedAt"),
            trackingId=item.get("trackingId"),
            userId=item.get("userId"),
        )
        for item in applications_store
        if item.get("userId") == userId
    ]


@app.post("/api/tax/decide")
async def decide_tax(payload: TaxDecisionRequest):
    decision = _make_tax_decision(payload)
    audit_log.append(
        {
            "event": "TAX_DECISION",
            "applicationId": payload.tax_application.applicationId,
            "userId": payload.user_profile.userId,
            "decision": decision.get("decision"),
            "createdAt": int(time.time()),
        }
    )
    return decision


@app.post("/api/mygov/submit")
async def submit_mygov(payload: MyGovSubmitRequest):
    tracking_id = f"MYGOV-{int(time.time())}"
    applications_store.append(
        {
            "benefitId": payload.applicationId,
            "userId": payload.userId,
            "status": "Submitted",
            "trackingId": tracking_id,
            "updatedAt": int(time.time()),
        }
    )
    audit_log.append(
        {
            "event": "MYGOV_SUBMITTED",
            "applicationId": payload.applicationId,
            "userId": payload.userId,
            "trackingId": tracking_id,
            "createdAt": int(time.time()),
        }
    )
    return {"ok": True, "trackingId": tracking_id}
