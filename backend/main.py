from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import html
import re
import time
from typing import List, Optional
import xml.etree.ElementTree as ET

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

LEX_RSS_URL = "https://lex.uz/rss"
LEX_BASE_URL = "https://lex.uz"
CACHE_TTL_SECONDS = 600


class LexNewsItem(BaseModel):
    title: str
    link: str
    pubDate: str
    description: str
    guid: str
    doc_id: Optional[str] = None


class LexNewsResponse(BaseModel):
    source: str
    generated_at: str
    total: int
    items: List[LexNewsItem]


@dataclass
class CacheState:
    items: List[LexNewsItem]
    fetched_at: float


cache_state: Optional[CacheState] = None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def collapse_ws(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def strip_html(text: Optional[str]) -> str:
    if not text:
        return ""
    no_tags = re.sub(r"<[^>]+>", " ", text)
    return html.unescape(collapse_ws(no_tags))


def to_absolute_lex_link(rel_or_abs: Optional[str]) -> str:
    if not rel_or_abs:
        return ""
    link = rel_or_abs.strip()
    if link.startswith("http://") or link.startswith("https://"):
        return link
    if not link.startswith("/"):
        link = "/" + link
    return f"{LEX_BASE_URL}{link}"


def extract_doc_id(text: str) -> Optional[str]:
    match = re.search(r"/docs/(-?\d+)", text or "")
    return match.group(1) if match else None


def _tag_name(tag: str) -> str:
    return tag.split("}", 1)[-1] if "}" in tag else tag


def _child_text(item: ET.Element, name: str) -> str:
    for child in list(item):
        if _tag_name(child.tag) == name:
            return child.text or ""
    return ""


def parse_rss(xml_text: str) -> List[LexNewsItem]:
    root = ET.fromstring(xml_text)
    items: List[LexNewsItem] = []
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
        doc_id = extract_doc_id(link_raw) or extract_doc_id(guid_raw)

        items.append(
            LexNewsItem(
                title=title,
                link=link,
                pubDate=pub_date,
                description=description,
                guid=guid,
                doc_id=doc_id,
            )
        )
    return items


async def fetch_rss() -> List[LexNewsItem]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(LEX_RSS_URL)
        resp.raise_for_status()
    return parse_rss(resp.text)


def cache_is_valid() -> bool:
    if not cache_state:
        return False
    return (time.time() - cache_state.fetched_at) < CACHE_TTL_SECONDS


app = FastAPI(title="Lex RSS API", version="1.0.0")

allow_origins = []
for port in range(5173, 5180):
    allow_origins.append(f"http://127.0.0.1:{port}")
    allow_origins.append(f"http://localhost:{port}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/news/lex", response_model=LexNewsResponse)
async def get_lex_news(
    limit: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
) -> LexNewsResponse:
    global cache_state

    if cache_state and cache_is_valid():
        items = cache_state.items
    else:
        try:
            items = await fetch_rss()
            cache_state = CacheState(items=items, fetched_at=time.time())
        except Exception:
            if cache_state:
                items = cache_state.items
            else:
                raise HTTPException(status_code=502, detail="Failed to fetch lex.uz RSS.")

    if q:
        query = q.lower()
        items = [
            item
            for item in items
            if query in f"{item.title} {item.description}".lower()
        ]

    limited = items[:limit]
    return LexNewsResponse(
        source="lex.uz/rss",
        generated_at=now_iso(),
        total=len(items),
        items=limited,
    )
