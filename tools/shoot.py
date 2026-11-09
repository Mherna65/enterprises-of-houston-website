# Retake previews; needs `python3 -m http.server 8765` running in this folder
import sys
from playwright.sync_api import sync_playwright
root="/workspace/eoh-website"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    for name,w,mobile in [("desktop",1280,False),("mobile",390,True)]:
        ctx=b.new_context(viewport={"width":w,"height":844 if mobile else 800},device_scale_factor=2 if mobile else 1,is_mobile=mobile,has_touch=mobile)
        pg=ctx.new_page(); pg.goto("http://127.0.0.1:8765/",wait_until="networkidle")
        pg.wait_for_timeout(500)
        pg.screenshot(path=f"{root}/preview-{name}.png",full_page=True)
        if mobile:
            pg.click(".nav-toggle"); pg.wait_for_timeout(200)
            pg.screenshot(path=f"/workspace/_mnav.png")
        ctx.close()
    b.close()
