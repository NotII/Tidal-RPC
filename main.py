import time
import psutil
import ctypes
from ctypes import wintypes
from pypresence import Presence
import tidalapi
from pathlib import Path

all_handles = []

def enum_windows_proc(hwnd, lParam):
    all_handles.append(hwnd)
    return True

def get_window_title(hwnd):
    length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
    if length > 0:
        buf = ctypes.create_unicode_buffer(length + 1)
        ctypes.windll.user32.GetWindowTextW(hwnd, buf, length + 1)
        return buf.value
    return ""

def extract_song_info(window_title):
    parts = window_title.split(' - ')
    if len(parts) >= 2:
        song_name = parts[0].strip()
        artist = parts[1].strip()
        return song_name, artist
    else:
        return None, None

def get_tidal_song_info():
    all_handles.clear()
    tidal_pids = []
    for proc in psutil.process_iter(['pid', 'name']):
        if 'TIDAL.exe' in proc.info['name']:
            tidal_pids.append(proc.info['pid'])
    if not tidal_pids:
        return None, None

    enum_windows_proc_callback = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.POINTER(ctypes.c_int), ctypes.c_void_p)
    ctypes.windll.user32.EnumWindows(enum_windows_proc_callback(enum_windows_proc), 0)
    for hwnd in all_handles:
        pid = ctypes.wintypes.DWORD()
        ctypes.windll.user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        if pid.value in tidal_pids:
            window_title = get_window_title(hwnd)
            song_name, artist = extract_song_info(window_title)
            if song_name and artist:
                return song_name, artist

    return None, None

session_file = Path("tidal-session-oauth.json")

session = tidalapi.Session()
session.login_session_file(session_file)

github_url = "https://github.com/notii/tidal-rpc"

rpc = Presence(1236873477311430716)
rpc.connect()

while True:
    try:
        song_name, artist = get_tidal_song_info()

        if song_name and artist:
            track = session.search(f'{artist} - {song_name}', limit=1)
            albumArt = session.album(track["tracks"][0].album.id).image(640, 640) if track["tracks"] else "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0TiNtfzWOOKq0-a6sRKgrRYGKdyjC2ICWnalfiLykMQ&s"
            rpc.update(
                details='Now Listening to:',
                state=f'{artist} - {song_name}',
                large_image=albumArt,
                large_text=f'{artist} - {song_name}',
                small_image='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0TiNtfzWOOKq0-a6sRKgrRYGKdyjC2ICWnalfiLykMQ&s',
                small_text=github_url
            )
        else:
            albumArt = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0TiNtfzWOOKq0-a6sRKgrRYGKdyjC2ICWnalfiLykMQ&s"
            rpc.update( 
                details="Not listening to TIDAL",
                large_image=albumArt,
                large_text=github_url
            )

        time.sleep(15)

    except KeyboardInterrupt:
        print("Exiting...")
        rpc.close()
        break