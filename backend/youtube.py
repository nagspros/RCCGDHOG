import json
import os
import re
import threading
import time
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import urlopen

VIDEO_ID = re.compile(r"[A-Za-z0-9_-]{11}")
CHANNEL_ID = re.compile(r"UC[A-Za-z0-9_-]{22}")
DEFAULT_CHANNEL = "UCbaf7qittz4vReSJfeJUiZA"
CACHE_SECONDS = 1200
_cache = {}
_lock = threading.Lock()


def video_id(value):
    if not isinstance(value, str):
        return None
    if VIDEO_ID.fullmatch(value):
        return value
    try:
        url = urlsplit(value)
        parts = url.path.strip("/").split("/")
        candidate = ""
        if url.scheme == "https" and url.hostname in {"youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"}:
            if url.path == "/watch":
                candidate = parse_qs(url.query).get("v", [""])[0]
            elif len(parts) == 2 and parts[0] in {"embed", "live", "shorts"}:
                candidate = parts[1]
        elif url.scheme == "https" and url.hostname == "youtu.be" and len(parts) == 1:
            candidate = parts[0]
        return candidate if VIDEO_ID.fullmatch(candidate) else None
    except ValueError:
        return None


def live_video(channel, key):
    now = time.monotonic()
    with _lock:
        cached = _cache.get(channel)
        if cached and now < cached[0]:
            return cached[1]
        params = urlencode({"part": "snippet", "channelId": channel, "eventType": "live",
                            "type": "video", "videoEmbeddable": "true", "maxResults": 1, "key": key})
        try:
            with urlopen(f"https://www.googleapis.com/youtube/v3/search?{params}", timeout=4) as response:
                items = json.load(response)["items"]
            item = items[0] if items else {}
            current = video_id(item.get("id", {}).get("videoId"))
            result = (current, item.get("snippet", {}).get("title")) if current else None
        except (OSError, ValueError, KeyError, TypeError):
            _cache[channel] = (now + 60, None)
            return None
        _cache[channel] = (now + CACHE_SECONDS, result)
        return result


def public_stream(settings):
    channel = os.getenv("YOUTUBE_CHANNEL_ID", DEFAULT_CHANNEL)
    if not CHANNEL_ID.fullmatch(channel):
        channel = DEFAULT_CHANNEL
    key = os.getenv("YOUTUBE_API_KEY")
    current = live_video(channel, key) if key else None
    selected = video_id(settings.get("videoIdOrUrl"))
    stream = {
        field: settings.get(field, default)
        for field, default in {
            "status": "Offline", "streamTitle": "Watch online", "streamSubtitle": "",
            "thumbnailUrl": "", "activeServiceType": "", "scheduledTime": "",
            "preacher": "", "theme": "", "scripture": "", "viewerCount": 0,
            "pinnedNotice": "", "enableLiveChatNotice": False,
        }.items()
    }
    if current:
        selected, title = current
        stream["status"] = "LIVE NOW"
        stream["streamTitle"] = title or stream["streamTitle"]
    elif not selected and stream["status"] == "LIVE NOW":
        stream["status"] = "Offline"
    return {
        **stream,
        "videoIdOrUrl": selected or "",
        "embedUrl": f"https://www.youtube-nocookie.com/embed/{selected}" if selected else None,
        "channelUrl": f"https://www.youtube.com/channel/{channel}/live",
    }
