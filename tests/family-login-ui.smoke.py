"""Family login routing checks using fake session-only data and real UI login/logout."""

import argparse
import importlib.util
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


HELPER_PATH = Path(__file__).with_name("senior-ui.smoke.py")
HELPER_SPEC = importlib.util.spec_from_file_location("senior_ui_smoke", HELPER_PATH)
HELPERS = importlib.util.module_from_spec(HELPER_SPEC)
HELPER_SPEC.loader.exec_module(HELPERS)

FIRST_FAMILY_PHONE = "0900000021"
OTHER_FAMILY_PHONE = "0900000022"
PROFILE_NAME = "Người thân giả kiểm thử đăng nhập"


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def tab(page, name):
    return page.get_by_role("tab", name=name, exact=True)


def visible_text(page, text):
    return page.get_by_text(text, exact=True).filter(visible=True)


def wait_route(page, pattern):
    page.wait_for_url(pattern)
    page.wait_for_timeout(300)


def logout(page):
    button(page, "Tài khoản").click()
    button(page, "Đăng xuất").click()
    wait_route(page, "**/login")


def returning_family_goes_home(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    runtime_errors = []
    visited_urls = []
    page.on("pageerror", lambda error: runtime_errors.append(str(error)))
    page.on("framenavigated", lambda frame: visited_urls.append(frame.url) if frame == page.main_frame else None)
    try:
        HELPERS.login(page, phone=FIRST_FAMILY_PHONE)
        HELPERS.wait_form(page)
        page.evaluate("window.__familyLoginDocumentMarker = 'same-document'")
        page.get_by_role("textbox", name="Họ và tên người thân, bắt buộc", exact=True).fill(PROFILE_NAME)
        page.get_by_role("textbox", name="Năm sinh của người thân, bắt buộc, gồm 4 chữ số", exact=True).fill("1960")
        page.get_by_role("radio", name="Mẹ", exact=True).click()
        button(page, "Tạo hồ sơ người thân").click()
        wait_route(page, "**/add-more-senior?created=1")
        expect(visible_text(page, PROFILE_NAME)).to_have_count(1)
        logout(page)

        visited_urls.clear()
        HELPERS.login(page, phone=FIRST_FAMILY_PHONE, open_page=False)
        wait_route(page, "**/family-home")
        assert page.evaluate("window.__familyLoginDocumentMarker") == "same-document", "Logout/relogin reloaded the session"
        assert not any("/create-senior" in url for url in visited_urls), f"Returning family briefly visited profile creation: {visited_urls}"
        expect(visible_text(page, "Tạo hồ sơ người thân")).to_have_count(0)
        expect(tab(page, "Trang chủ")).to_have_attribute("aria-selected", "true")
        HELPERS.check_width(page)
        page.screenshot(path=str(ARTIFACTS / "returning-family-home-390.png"), full_page=True)

        tab(page, "Gia đình").click()
        wait_route(page, "**/add-more-senior")
        expect(visible_text(page, PROFILE_NAME)).to_have_count(1)
        button(page, "Thêm hồ sơ người thân").click()
        HELPERS.wait_form(page)
        button(page, "Để sau và quay lại trang chủ gia đình").click()
        wait_route(page, "**/family-home")
        logout(page)

        HELPERS.login(page, phone=OTHER_FAMILY_PHONE, open_page=False)
        HELPERS.wait_form(page)
        expect(visible_text(page, PROFILE_NAME)).to_have_count(0)
        button(page, "Để sau và quay lại trang chủ gia đình").click()
        wait_route(page, "**/family-home")
        tab(page, "Gia đình").click()
        wait_route(page, "**/add-more-senior")
        expect(visible_text(page, "Chưa có người thân")).to_be_visible()
        expect(visible_text(page, PROFILE_NAME)).to_have_count(0)
        page.screenshot(path=str(ARTIFACTS / "other-family-empty-390.png"), full_page=True)
        logout(page)
        HELPERS.login(page, phone=OTHER_FAMILY_PHONE, open_page=False)
        HELPERS.wait_form(page)
        assert not runtime_errors, f"Browser runtime errors: {runtime_errors}"
        print("PASS new/empty family opens creation, returning family opens home without creation flash, manual add remains available, different family cannot inherit profiles")
    except Exception:
        page.screenshot(path=str(ARTIFACTS / "failure.png"), full_page=True)
        raise
    finally:
        context.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8084")
    args = parser.parse_args()
    HELPERS.BASE_URL = args.base_url.rstrip("/")
    ARTIFACTS = Path(__file__).resolve().parents[1] / ".expo" / "family-login-ui-tests"
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            returning_family_goes_home(browser)
        finally:
            browser.close()
