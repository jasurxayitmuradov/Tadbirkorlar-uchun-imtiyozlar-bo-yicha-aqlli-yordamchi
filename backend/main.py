from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Optional
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


class BusinessProfile(BaseModel):
    user_name: str = ""
    region: str = ""
    business_name: str = ""
    tin: str = ""
    legal_form: str = ""
    activity_type: str = ""
    director_name: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    employee_count: Optional[int] = None


class Opportunity(BaseModel):
    id: str
    title: str
    platform: str
    published_at: str
    deadline: str
    target_regions: List[str]
    required_fields: List[str]
    required_activity_keywords: List[str]
    allowed_legal_forms: List[str]


class OpportunityStatus(BaseModel):
    opportunity: Opportunity
    eligible: bool
    missing_fields: List[str]
    reason: str


class AutoApplicationScanResponse(BaseModel):
    generated_at: str
    total: int
    items: List[OpportunityStatus]


class AutoApplicationAnalyzeRequest(BaseModel):
    profile: BusinessProfile
    only_new: bool = True


class AutoApplicationDraft(BaseModel):
    application_id: str
    opportunity_id: str
    title: str
    platform: str
    status: str
    submitted_at: str
    payload: Dict[str, str]


class SmsEvent(BaseModel):
    to_phone: str
    message: str
    related_opportunity_id: str
    created_at: str


class AutoApplicationAnalyzeResponse(BaseModel):
    generated_at: str
    auto_submitted: List[AutoApplicationDraft]
    pending_user_input: List[OpportunityStatus]
    sms_queue: List[SmsEvent]


@dataclass
class CacheState:
    items: List[NewsItem]
    fetched_at: float


cache_state: Optional[CacheState] = None


AUTO_APPLICATION_FEED: List[Opportunity] = [
    Opportunity(
        id="app-2026-001",
        title="Ayollar tadbirkorligi uchun subsidiya",
        platform="my.gov.uz",
        published_at="2026-02-11T09:00:00Z",
        deadline="2026-03-15",
        target_regions=["all"],
        required_fields=["business_name", "tin", "legal_form", "director_name", "phone", "activity_type"],
        required_activity_keywords=["ishlab chiqarish", "xizmat", "savdo"],
        allowed_legal_forms=["YTT", "MCHJ"],
    ),
    Opportunity(
        id="app-2026-002",
        title="Eksportyorlar uchun aylanma mablag' krediti",
        platform="lex.uz",
        published_at="2026-02-12T07:30:00Z",
        deadline="2026-02-28",
        target_regions=["all"],
        required_fields=["business_name", "tin", "legal_form", "phone", "email", "address", "activity_type"],
        required_activity_keywords=["eksport", "logistika", "ishlab chiqarish"],
        allowed_legal_forms=["MCHJ"],
    ),
    Opportunity(
        id="app-2026-003",
        title="Yangi YTT uchun soliq imtiyozi arizasi",
        platform="soliq.uz",
        published_at="2026-02-10T13:00:00Z",
        deadline="2026-04-01",
        target_regions=["all"],
        required_fields=["business_name", "tin", "legal_form", "phone"],
        required_activity_keywords=[],
        allowed_legal_forms=["YTT"],
    ),
]


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


def _is_activity_match(activity: str, keywords: List[str]) -> bool:
    if not keywords:
        return True
    haystack = (activity or "").lower()
    return any(keyword.lower() in haystack for keyword in keywords)


def _is_legal_form_allowed(legal_form: str, allowed_legal_forms: List[str]) -> bool:
    if not allowed_legal_forms:
        return True
    return (legal_form or "").upper() in [item.upper() for item in allowed_legal_forms]


def _missing_fields(profile: BusinessProfile, required_fields: List[str]) -> List[str]:
    missing: List[str] = []
    payload = profile.model_dump()
    for field in required_fields:
        value = payload.get(field)
        if value is None:
            missing.append(field)
            continue
        if isinstance(value, str) and not value.strip():
            missing.append(field)
    return missing


def _status_for_opportunity(profile: BusinessProfile, opp: Opportunity) -> OpportunityStatus:
    missing = _missing_fields(profile, opp.required_fields)
    if missing:
        return OpportunityStatus(
            opportunity=opp,
            eligible=False,
            missing_fields=missing,
            reason="required_fields_missing",
        )

    if not _is_legal_form_allowed(profile.legal_form, opp.allowed_legal_forms):
        return OpportunityStatus(
            opportunity=opp,
            eligible=False,
            missing_fields=[],
            reason="legal_form_not_supported",
        )

    if not _is_activity_match(profile.activity_type, opp.required_activity_keywords):
        return OpportunityStatus(
            opportunity=opp,
            eligible=False,
            missing_fields=[],
            reason="activity_not_matched",
        )

    return OpportunityStatus(
        opportunity=opp,
        eligible=True,
        missing_fields=[],
        reason="eligible",
    )


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


@app.get("/api/auto-applications/new", response_model=AutoApplicationScanResponse)
async def get_new_auto_applications(
    user_name: str = Query("", max_length=120),
    region: str = Query("all", max_length=120),
    business_name: str = Query("", max_length=200),
    tin: str = Query("", max_length=50),
    legal_form: str = Query("", max_length=40),
    activity_type: str = Query("", max_length=200),
    director_name: str = Query("", max_length=120),
    phone: str = Query("", max_length=40),
    email: str = Query("", max_length=150),
    address: str = Query("", max_length=250),
    employee_count: Optional[int] = Query(None, ge=0),
) -> AutoApplicationScanResponse:
    profile = BusinessProfile(
        user_name=user_name,
        region=region,
        business_name=business_name,
        tin=tin,
        legal_form=legal_form,
        activity_type=activity_type,
        director_name=director_name,
        phone=phone,
        email=email,
        address=address,
        employee_count=employee_count,
    )

    items = [_status_for_opportunity(profile, opp) for opp in AUTO_APPLICATION_FEED]
    return AutoApplicationScanResponse(
        generated_at=now_iso(),
        total=len(items),
        items=items,
    )


@app.post("/api/auto-applications/analyze", response_model=AutoApplicationAnalyzeResponse)
async def analyze_and_submit_auto_applications(
    request: AutoApplicationAnalyzeRequest,
) -> AutoApplicationAnalyzeResponse:
    statuses = [_status_for_opportunity(request.profile, opp) for opp in AUTO_APPLICATION_FEED]

    auto_submitted: List[AutoApplicationDraft] = []
    pending_user_input: List[OpportunityStatus] = []
    sms_queue: List[SmsEvent] = []

    for status in statuses:
        opp = status.opportunity
        if status.eligible:
            payload = {
                "business_name": request.profile.business_name,
                "tin": request.profile.tin,
                "legal_form": request.profile.legal_form,
                "activity_type": request.profile.activity_type,
                "director_name": request.profile.director_name,
                "phone": request.profile.phone,
                "email": request.profile.email,
                "address": request.profile.address,
                "submitted_by": request.profile.user_name,
            }
            auto_submitted.append(
                AutoApplicationDraft(
                    application_id=f"draft-{opp.id}-{int(time.time())}",
                    opportunity_id=opp.id,
                    title=opp.title,
                    platform=opp.platform,
                    status="submitted",
                    submitted_at=now_iso(),
                    payload=payload,
                )
            )
            continue

        pending_user_input.append(status)
        missing_txt = ", ".join(status.missing_fields) if status.missing_fields else status.reason
        sms_text = (
            f"Auto ariza uchun qo'shimcha ma'lumot kerak: {opp.title}. "
            f"Yetishmayotgan: {missing_txt}."
        )
        sms_queue.append(
            SmsEvent(
                to_phone=request.profile.phone or "unknown",
                message=sms_text,
                related_opportunity_id=opp.id,
                created_at=now_iso(),
            )
        )

    return AutoApplicationAnalyzeResponse(
        generated_at=now_iso(),
        auto_submitted=auto_submitted,
        pending_user_input=pending_user_input,
        sms_queue=sms_queue,
    )
