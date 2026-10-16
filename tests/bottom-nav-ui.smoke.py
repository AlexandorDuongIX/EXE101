"""Real scrolling and the 300ms floating navigation idle contract on both roles.

Runs against a web export already served by the caller. All profile/schedule data is fake.
"""

import argparse
from datetime import datetime
import importlib.util
from pathlib import Path
import re
import time

from playwright.sync_api import expect, sync_playwright


HELPER_PATH = Path(__file__).with_name("schedule-ui.smoke.py")
HELPER_SPEC = importlib.util.spec_from_file_location("schedule_ui_smoke", HELPER_PATH)
HELPERS = importlib.util.module_from_spec(HELPER_SPEC)
HELPER_SPEC.loader.exec_module(HELPERS)
LOGIN = HELPERS.HELPERS
PROFILE_NAME = "Hồ sơ cuộn giả A"


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def tab(page, name):
    return page.get_by_role("tab", name=name, exact=True)


def wait_route(page, pattern):
    HELPERS.wait_route(page, pattern)


def create_relative(page, name):
    LOGIN.wait_form(page)
    page.get_by_role("textbox", name="Họ và tên người thân, bắt buộc", exact=True).fill(name)
    page.get_by_role("textbox", name="Năm sinh của người thân, bắt buộc, gồm 4 chữ số", exact=True).fill("1960")
    page.get_by_role("radio", name="Mẹ", exact=True).click()
    button(page, "Tạo hồ sơ người thân").click()
    wait_route(page, "**/add-more-senior?created=1")


def expect_tabs(page):
    for name in ("Trang chủ", "Thuốc", "Sức khỏe", "Trợ lý AI", "Gia đình"):
        expect(tab(page, name)).to_be_in_viewport()
    expect(tab(page, "Lịch")).to_have_count(0)


def wheel_until_settled(page, scroll, distance):
    before = scroll.evaluate("element => element.scrollTop")
    page.mouse.wheel(0, distance)
    previous = before
    last_change = time.monotonic()
    deadline = last_change + 2
    while time.monotonic() < deadline:
        position = scroll.evaluate("element => element.scrollTop")
        now = time.monotonic()
        if position != previous:
            previous = position
            last_change = now
        if position != before and now - last_change >= 0.12:
            return position
        # Observe native compositor scrolling directly rather than assuming one frame is enough.
        time.sleep(0.02)
    raise AssertionError("Real wheel scrolling did not settle")


def scroll_hides_then_restores(page, scroll_id, label):
    navigation = page.get_by_test_id("bottom-navigation").filter(visible=True)
    scroll = page.get_by_test_id(scroll_id).filter(visible=True)
    expect(navigation).to_be_in_viewport(ratio=1)
    expect_tabs(page)
    dimensions = scroll.evaluate("element => ({height: element.clientHeight, content: element.scrollHeight, top: element.scrollTop})")
    assert dimensions["content"] > dimensions["height"] + 40, f"{label} must contain real scrollable content"
    scroll.evaluate("""element => {
      element.__navLastObservedScroll = null;
      element.addEventListener('scroll', () => {
        element.__navLastObservedScroll = Date.now();
      }, {passive: true});
    }""")
    navigation.evaluate("""(element, scrollId) => {
      const scroll = Array.from(document.querySelectorAll('[data-testid]')).find(candidate =>
        candidate.getAttribute('data-testid') === scrollId && candidate.getBoundingClientRect().height > 0);
      element.__navShowEvents = [];
      element.__navObserver = new MutationObserver(() => {
        if (element.getAttribute('aria-hidden') !== 'true' && scroll.__navLastObservedScroll !== null) {
          element.__navShowEvents.push({
            at: Date.now(), elapsed: Date.now() - scroll.__navLastObservedScroll,
          });
        }
      });
      element.__navObserver.observe(element, {attributes: true, attributeFilter: ['aria-hidden']});
    }""", scroll_id)
    bounds = scroll.bounding_box()
    page.mouse.move(bounds["x"] + bounds["width"] / 2, bounds["y"] + min(180, bounds["height"] / 2))
    try:
        initial_scroll = scroll.evaluate("element => element.scrollTop")
        scroll_range = dimensions["content"] - dimensions["height"]
        direction = 1 if scroll_range - initial_scroll >= initial_scroll else -1
        distance = direction * min(160, max(12, int(scroll_range / 4)))
        wheel_until_settled(page, scroll, distance)
        expect(navigation).to_have_attribute("aria-hidden", "true")
        first_position = scroll.evaluate("element => element.scrollTop")
        assert first_position != initial_scroll, f"{label}: wheel did not scroll the screen"

        # Continuing to scroll must cancel the earlier show deadline.
        wheel_until_settled(page, scroll, distance)
        assert scroll.evaluate("element => element.scrollTop") != first_position, f"{label}: continued wheel did not scroll again"
        last_scroll = scroll.evaluate("element => element.__navLastObservedScroll")
        assert last_scroll is not None, f"{label}: no real DOM scroll event observed"
        expect(navigation).to_have_attribute("aria-hidden", "true")
        expect(tab(page, "Trợ lý AI")).to_have_count(0)
        hidden_tabs = navigation.get_by_role("tab", include_hidden=True)
        expect(hidden_tabs).to_have_count(5)
        for item in hidden_tabs.all():
            expect(item).to_have_attribute("aria-disabled", "true")
            assert item.evaluate("element => element.tabIndex") == -1, f"{label}: hidden navigation remains keyboard-focusable"
        assert navigation.evaluate("element => element.getBoundingClientRect().top >= innerHeight"), f"{label}: navigation did not slide below the viewport"
        page.screenshot(path=str(ARTIFACTS / f"{label}-hidden.png"), full_page=True)

        # The UI must start restoring after its 300ms idle window, then finish its 220ms slide.
        expect(navigation).not_to_have_attribute("aria-hidden", "true")
        events = navigation.evaluate("element => element.__navShowEvents")
        assert events, f"{label}: no navigation restore transition was observed"
        assert all(299 <= event["elapsed"] <= 360 for event in events), f"{label}: wrong scroll-to-restore timing: {events}"
        expect(navigation).to_be_in_viewport(ratio=1)
        expect_tabs(page)
        for item in navigation.get_by_role("tab").all():
            expect(item).not_to_have_attribute("aria-disabled", "true")
            expect(item).to_be_enabled()
        LOGIN.check_width(page)
        page.screenshot(path=str(ARTIFACTS / f"{label}-restored.png"), full_page=True)
        print(f"PASS {label}: hidden and keyboard-disabled during scroll, restored after{events[-1]['elapsed']}ms idle, then fully visible")
    finally:
        navigation.evaluate("element => element.__navObserver.disconnect()")


def seed_schedules(page):
    button(page, "Xem lịch thuốc").click()
    wait_route(page, "**/family-medications?*")
    for index in (1, 2):
        button(page, "Thêm lịch thuốc").click()
        HELPERS.fill_medication(page, name=f"Lịch thuốc cuộn giả {index}", times=("08:00", "20:00"))
        HELPERS.double_save(page, "Tạo lịch thuốc")
    HELPERS.choose_kind(page, "Lịch khám")
    for index in (1, 2):
        button(page, "Thêm lịch khám").click()
        HELPERS.fill_appointment(page, title=f"Lịch khám cuộn giả {index}")
        HELPERS.double_save(page, "Tạo lịch khám")
    HELPERS.choose_kind(page, "Lịch thuốc")


def family_and_senior_navigation(browser, home_only=False):
    context = browser.new_context(viewport={"width": 320, "height": 740}, timezone_id="Asia/Ho_Chi_Minh")
    page = context.new_page()
    page.clock.install(time=datetime.fromisoformat("2026-10-16T12:00:00+07:00"))
    runtime_errors = []
    page.on("pageerror", lambda error: runtime_errors.append(str(error)))
    try:
        LOGIN.login(page, phone="0900000061")
        create_relative(page, PROFILE_NAME)
        for name in ("Hồ sơ cuộn giả B", "Hồ sơ cuộn giả C"):
            button(page, "Thêm hồ sơ người thân").click()
            create_relative(page, name)
        tab(page, "Trang chủ").click()
        wait_route(page, "**/family-home")
        expect_tabs(page)
        tab(page, "Trợ lý AI").click()
        expect(tab(page, "Trợ lý AI")).to_have_attribute("aria-selected", "true")
        tab(page, "Trang chủ").click()
        wait_route(page, "**/family-home")
        scroll_hides_then_restores(page, "family-home-scroll", "family-home-320")
        if home_only:
            return

        # Use the public Home link to seed the selected profile's schedule.
        seed_schedules(page)
        scroll_hides_then_restores(page, "family-schedules-scroll", "family-medications-320")
        HELPERS.choose_kind(page, "Lịch khám")
        scroll_hides_then_restores(page, "family-schedules-scroll", "family-appointments-320")
        tab(page, "Gia đình").click()
        wait_route(page, "**/add-more-senior")
        scroll_hides_then_restores(page, "family-relatives-scroll", "family-relatives-320")
        button(page, f"Mã liên kết {PROFILE_NAME}").click()
        code_display = page.get_by_label("Mã liên kết 6 số", exact=True)
        expect(code_display).to_have_text(re.compile(r"^\d{6}$"))
        code = code_display.inner_text().strip()
        button(page, "Đóng mã liên kết").click()
        button(page, "Tài khoản").click()
        button(page, "Đăng xuất").click()
        wait_route(page, "**/login")

        LOGIN.login(page, role="Người cao tuổi", phone="0900000062", open_page=False)
        wait_route(page, "**/link-senior")
        page.get_by_role("textbox", name="Mã liên kết 6 chữ số", exact=True).fill(code)
        button(page, "Liên kết với gia đình").click()
        wait_route(page, "**/senior-home")
        scroll_hides_then_restores(page, "senior-home-scroll", "senior-home-320")
        tab(page, "Thuốc").click()
        wait_route(page, "**/senior-medications")
        HELPERS.choose_kind(page, "Lịch thuốc")
        scroll_hides_then_restores(page, "senior-schedules-scroll", "senior-medications-320")
        HELPERS.choose_kind(page, "Lịch khám")
        scroll_hides_then_restores(page, "senior-schedules-scroll", "senior-appointments-320")
        assert not runtime_errors, f"Browser runtime errors: {runtime_errors}"
        print("PASS AI bottom tab label, Family/Senior scrolling screens, real content, no overflow and no runtime errors")
    except Exception:
        page.screenshot(path=str(ARTIFACTS / "failure.png"), full_page=True)
        raise
    finally:
        context.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8084")
    parser.add_argument("--home-only", action="store_true", help="Check one Home scroll cycle before the full navigation regression")
    args = parser.parse_args()
    BASE_URL = args.base_url.rstrip("/")
    LOGIN.BASE_URL = BASE_URL
    HELPERS.BASE_URL = BASE_URL
    ARTIFACTS = Path(__file__).resolve().parents[1] / ".expo" / "bottom-nav-ui-tests"
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    HELPERS.ARTIFACTS = ARTIFACTS
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            family_and_senior_navigation(browser, home_only=args.home_only)
        finally:
            browser.close()
