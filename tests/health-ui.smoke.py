"""Real health entries, profile isolation, charts, and linked-senior Home checks.

Uses fake data only against an already-running web export; no server is started.
"""

import argparse
from datetime import datetime
import importlib.util
from pathlib import Path
import re

from playwright.sync_api import expect, sync_playwright


SCHEDULE_PATH = Path(__file__).with_name("schedule-ui.smoke.py")
SCHEDULE_SPEC = importlib.util.spec_from_file_location("schedule_ui_smoke", SCHEDULE_PATH)
SCHEDULE = importlib.util.module_from_spec(SCHEDULE_SPEC)
SCHEDULE_SPEC.loader.exec_module(SCHEDULE)
LOGIN = SCHEDULE.HELPERS

PROFILE_A = "Người thân kiểm thử A"
PROFILE_B = "Người thân kiểm thử B"
FAMILY_PHONE = "0900000041"
SENIOR_PHONE = "0900000042"


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def field(page, name):
    return page.get_by_role("textbox", name=name, exact=True)


def radio(page, name):
    return page.get_by_role("radio", name=name, exact=True)


def tab(page, name):
    return page.get_by_role("tab", name=name, exact=True)


def text(page, value):
    return page.get_by_text(value, exact=True).filter(visible=True)


def wait_route(page, pattern):
    SCHEDULE.wait_route(page, pattern)


def screenshot(page, name):
    SCHEDULE.screenshot(page, name)


def create_relative(page, name):
    LOGIN.wait_form(page)
    field(page, "Họ và tên người thân, bắt buộc").fill(name)
    field(page, "Năm sinh của người thân, bắt buộc, gồm 4 chữ số").fill("1960")
    radio(page, "Mẹ").click()
    button(page, "Tạo hồ sơ người thân").click()
    wait_route(page, "**/add-more-senior?created=1")


def home(page, role="family"):
    tab(page, "Trang chủ").click()
    wait_route(page, f"**/{role}-home")


def set_recorded_at(page, date, time):
    SCHEDULE.select_date(page, "Ngày ghi nhận, bắt buộc", date)
    SCHEDULE.select_time(page, "Giờ ghi nhận, bắt buộc", time)


def commit(page, label):
    # Two events in one JS turn must create a single record.
    button(page, label).evaluate("element => { element.click(); element.click(); }")
    expect(button(page, label)).to_have_count(0)


def add_reading(page, kind, value, date, time="09:00", unit=None, meal=None, note=""):
    button(page, "Ghi chỉ số").click()
    radio(page, kind).click()
    if unit:
        radio(page, unit).click()
    if meal:
        radio(page, meal).click()
    if kind == "Huyết áp":
        systolic, diastolic = value.split("/")
        field(page, "Huyết áp tâm thu, bắt buộc").fill(systolic)
        field(page, "Huyết áp tâm trương, bắt buộc").fill(diastolic)
    else:
        field(page, f"{kind}, bắt buộc").fill(value)
    set_recorded_at(page, date, time)
    if note:
        field(page, "Ghi chú chỉ số").fill(note)
    commit(page, "Lưu chỉ số")


def assert_no_seed_data(page):
    for value in ("125/82", "6.1", "6,1", "Amlodipine", "Con Hoàng", "Con Mai", "Đã uống thuốc"):
        expect(text(page, value)).to_have_count(0)


def check_home_shell(page):
    expect(text(page, "KithCare")).to_have_count(1)
    expect(text(page, "KithCare")).to_be_in_viewport()
    for name in ("Trang chủ", "Thuốc", "Sức khỏe", "Trợ lý AI", "Gia đình"):
        expect(tab(page, name)).to_be_in_viewport()
    expect(tab(page, "Trang chủ")).to_have_attribute("aria-selected", "true")
    LOGIN.check_width(page)


def logout(page):
    button(page, "Tài khoản").click()
    button(page, "Đăng xuất").click()
    wait_route(page, "**/login")


def select_profile(page, name):
    choice = radio(page, f"Chọn người thân {name}")
    choice.click()
    expect(choice).to_be_checked()


def assert_latest(page, kind, label, value):
    expect(page.get_by_test_id(f"health-latest-{kind}")).to_have_attribute("aria-label", f"{label}, gần nhất {value}")


def assert_empty(page):
    for kind, label in (("blood-pressure", "Huyết áp"), ("heart-rate", "Nhịp tim"), ("blood-glucose", "Đường huyết"), ("weight", "Cân nặng")):
        expect(page.get_by_test_id(f"health-latest-{kind}")).to_have_attribute("aria-label", f"{label}, chưa có lần đo")
    expect(text(page, "Chưa có ghi nhận sức khỏe.")).to_be_visible()
    expect(text(page, "Chưa có ghi nhận triệu chứng hôm nay.")).to_be_visible()
    assert_no_seed_data(page)


def assert_chart(page, label, days, count, unit):
    button(page, f"Xem biểu đồ {label}").click()
    button(page, f"{days} ngày").click()
    expect(button(page, f"Xem biểu đồ {label}")).to_have_attribute("aria-pressed", "true")
    expect(button(page, f"{days} ngày")).to_have_attribute("aria-pressed", "true")
    expect(page.get_by_role("img", name=f"Biểu đồ {label}, {count} lần đo trong {days} ngày. Đơn vị {unit}.", exact=True)).to_be_visible()


def expand_history(page):
    more = page.get_by_role("button", name=re.compile(r"^Xem toàn bộ \d+ ghi nhận$"))
    if more.count():
        more.click()


def care_card(page, kind):
    # Scope to the Home card identified by its public link, excluding cached tab scenes.
    return button(page, "Xem lịch thuốc" if kind == "medication" else "Xem lịch khám").locator("xpath=../..")


def schedule_text(page, value):
    return page.get_by_role("tablist").locator("..").get_by_text(value, exact=True).filter(visible=True)


def record_family_health(page):
    # Required numbers and future timestamps are checked without inventing clinical thresholds.
    button(page, "Ghi chỉ số").click()
    button(page, "Lưu chỉ số").click()
    expect(text(page, "Vui lòng nhập số đo lớn hơn 0.")).to_have_count(2)
    field(page, "Huyết áp tâm thu, bắt buộc").fill("128")
    field(page, "Huyết áp tâm trương, bắt buộc").fill("84")
    set_recorded_at(page, "2026-10-16", "23:59")
    button(page, "Lưu chỉ số").click()
    expect(text(page, "Thời gian ghi nhận không được ở tương lai.")).to_be_visible()
    set_recorded_at(page, "2026-10-15", "09:00")
    screenshot(page, "family-blood-pressure-form-390.png")
    commit(page, "Lưu chỉ số")
    assert_latest(page, "blood-pressure", "Huyết áp", "128/84 mmHg")

    # Insert older records later: the newest timestamp must continue to win.
    add_reading(page, "Huyết áp", "111/71", "2026-10-01")
    assert_latest(page, "blood-pressure", "Huyết áp", "128/84 mmHg")
    add_reading(page, "Huyết áp", "126/82", "2026-10-14")
    add_reading(page, "Huyết áp", "119/79", "2026-09-01")
    assert_latest(page, "blood-pressure", "Huyết áp", "128/84 mmHg")
    assert_chart(page, "Huyết áp", 7, 2, "mmHg")
    assert_chart(page, "Huyết áp", 30, 3, "mmHg")
    assert_chart(page, "Huyết áp", 90, 4, "mmHg")
    page.set_viewport_size({"width": 320, "height": 740})
    page.get_by_role("img", name="Biểu đồ Huyết áp, 4 lần đo trong 90 ngày. Đơn vị mmHg.", exact=True).scroll_into_view_if_needed()
    screenshot(page, "family-blood-pressure-chart-320.png")
    page.set_viewport_size({"width": 390, "height": 844})

    add_reading(page, "Nhịp tim", "73", "2026-10-15", time="09:15")
    assert_latest(page, "heart-rate", "Nhịp tim", "73 nhịp/phút")
    add_reading(page, "Đường huyết", "5,7", "2026-10-14", unit="mmol/L", meal="Lúc đói")
    assert_latest(page, "blood-glucose", "Đường huyết", "5,7 mmol/L")
    add_reading(page, "Đường huyết", "103", "2026-10-15", time="10:00", unit="mg/dL", meal="Sau ăn")
    assert_latest(page, "blood-glucose", "Đường huyết", "103 mg/dL")
    button(page, "7 ngày").click()
    expect(text(page, "Các đơn vị đường huyết được theo dõi riêng. Biểu đồ này dùng mg/dL.")).to_be_visible()
    expect(text(page, "1 lần đo")).to_be_visible()
    expect(page.get_by_role("img", name=re.compile(r"^Biểu đồ Đường huyết"))).to_have_count(0)
    add_reading(page, "Cân nặng", "60,5", "2026-10-15", time="10:15")
    assert_latest(page, "weight", "Cân nặng", "60,5 kg")

    button(page, "Ghi triệu chứng").click()
    page.get_by_role("checkbox", name="Đau đầu", exact=True).click()
    field(page, "Triệu chứng khác").fill("Triệu chứng giả kiểm thử")
    button(page, "Lưu triệu chứng").click()
    expect(text(page, "Vui lòng chọn mức độ triệu chứng.")).to_be_visible()
    radio(page, "Nhẹ").click()
    set_recorded_at(page, "2026-10-16", "08:00")
    commit(page, "Lưu triệu chứng")
    expect(text(page, "Triệu chứng giả kiểm thử").first).to_be_visible()

    button(page, "Ghi triệu chứng").click()
    page.get_by_role("checkbox", name="Đau đầu", exact=True).click()
    field(page, "Triệu chứng khác").fill("Nội dung phải được xóa")
    radio(page, "Hôm nay thấy ổn").click()
    expect(page.get_by_role("checkbox", name="Đau đầu", exact=True)).not_to_be_checked()
    expect(field(page, "Triệu chứng khác")).to_have_value("")
    set_recorded_at(page, "2026-10-16", "09:00")
    screenshot(page, "family-symptoms-form-390.png")
    commit(page, "Lưu triệu chứng")
    expect(text(page, "Không có triệu chứng").first).to_be_visible()
    expand_history(page)
    for value in ("5,7 mmol/L", "103 mg/dL", "Lúc đói", "Sau ăn", "Triệu chứng giả kiểm thử", "Mức độ đã ghi: Nhẹ"):
        expect(text(page, value).first).to_be_visible()
    assert_no_seed_data(page)
    print("PASS real readings and decimal commas, future rejection, latest timestamp, 7/30/90 chart counts, glucose unit isolation, custom symptoms and explicit well")


def care_plan_links(page):
    # Home links carry both the selected profile and the requested schedule kind.
    button(page, "Xem lịch thuốc").click()
    wait_route(page, "**/family-medications?*")
    expect(tab(page, "Lịch thuốc")).to_have_attribute("aria-selected", "true")
    expect(radio(page, f"Lịch của {PROFILE_A}")).to_be_checked()
    button(page, "Thêm lịch thuốc").click()
    SCHEDULE.fill_medication(page, name="Thuốc lịch giả A", times=("20:00",))
    commit(page, "Tạo lịch thuốc")
    home(page)
    expect(care_card(page, "medication").get_by_text("Thuốc lịch giả A", exact=True)).to_be_visible()
    button(page, "Xem lịch khám").click()
    wait_route(page, "**/family-medications?*")
    expect(tab(page, "Lịch khám")).to_have_attribute("aria-selected", "true")
    expect(radio(page, f"Lịch của {PROFILE_A}")).to_be_checked()
    button(page, "Thêm lịch khám").click()
    SCHEDULE.fill_appointment(page, title="Buổi khám giả A")
    SCHEDULE.select_date(page, "Ngày khám, bắt buộc", "2026-10-17")
    commit(page, "Tạo lịch khám")
    home(page)
    expect(care_card(page, "appointment").get_by_text("Buổi khám giả A", exact=True)).to_be_visible()
    select_profile(page, PROFILE_B)
    expect(care_card(page, "medication").get_by_text("Thuốc lịch giả A", exact=True)).to_have_count(0)
    expect(care_card(page, "appointment").get_by_text("Buổi khám giả A", exact=True)).to_have_count(0)
    button(page, "Xem lịch khám").click()
    wait_route(page, "**/family-medications?*")
    expect(tab(page, "Lịch khám")).to_have_attribute("aria-selected", "true")
    expect(radio(page, f"Lịch của {PROFILE_B}")).to_be_checked()
    expect(schedule_text(page, "Buổi khám giả A")).to_have_count(0)
    home(page)
    select_profile(page, PROFILE_A)
    print("PASS real upcoming medication/appointment and Home links preserve kind and selected profile")


def link_and_check_senior(page, expected_latest):
    tab(page, "Gia đình").click()
    wait_route(page, "**/add-more-senior")
    button(page, f"Mã liên kết {PROFILE_A}").click()
    code_display = page.get_by_label("Mã liên kết 6 số", exact=True)
    expect(code_display).to_have_text(re.compile(r"^\d{6}$"))
    code = code_display.inner_text().strip()
    button(page, "Đóng mã liên kết").click()
    logout(page)
    LOGIN.login(page, role="Người cao tuổi", phone=SENIOR_PHONE, open_page=False)
    wait_route(page, "**/link-senior")
    field(page, "Mã liên kết 6 chữ số").fill(code)
    button(page, "Liên kết với gia đình").click()
    wait_route(page, "**/senior-home")
    for kind, label in expected_latest.items():
        expect(page.get_by_test_id(f"health-latest-{kind}")).to_have_attribute("aria-label", label)
    expect(button(page, "Ghi chỉ số")).to_have_count(0)
    expect(button(page, "Ghi triệu chứng")).to_have_count(0)
    expect(radio(page, f"Chọn người thân {PROFILE_B}")).to_have_count(0)
    assert_chart(page, "Huyết áp", 90, 4, "mmHg")
    expand_history(page)
    expect(text(page, "91 nhịp/phút")).to_have_count(0)
    expect(text(page, "Triệu chứng giả kiểm thử").first).to_be_visible()
    assert_no_seed_data(page)
    check_home_shell(page)
    page.set_viewport_size({"width": 320, "height": 740})
    page.get_by_role("heading", name=f"Chào {PROFILE_A}!", exact=True).scroll_into_view_if_needed()
    screenshot(page, "senior-home-populated-320.png")
    check_home_shell(page)
    page.get_by_role("heading", name="Sức khỏe gần nhất", exact=True).evaluate("element => element.scrollIntoView({block: 'start', inline: 'nearest'})")
    screenshot(page, "senior-health-metrics-320.png")
    button(page, "Mở lịch thuốc tiếp theo").click()
    wait_route(page, "**/senior-medications?*")
    expect(tab(page, "Lịch thuốc")).to_have_attribute("aria-selected", "true")
    expect(schedule_text(page, "Thuốc lịch giả A")).to_be_visible()
    home(page, role="senior")
    button(page, "Xem lịch khám").click()
    wait_route(page, "**/senior-medications?*")
    expect(tab(page, "Lịch khám")).to_have_attribute("aria-selected", "true")
    expect(schedule_text(page, "Buổi khám giả A")).to_be_visible()
    expect(page.get_by_role("button", name=re.compile(r"^(Thêm|Sửa|Xóa) lịch"))).to_have_count(0)
    print("PASS linked senior sees only matching real health/profile/schedules and cannot record or edit")


def family_and_senior_health(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844}, timezone_id="Asia/Ho_Chi_Minh")
    page = context.new_page()
    page.clock.install(time=datetime.fromisoformat("2026-10-16T12:00:00+07:00"))
    runtime_errors = []
    page.on("pageerror", lambda error: runtime_errors.append(str(error)))
    try:
        LOGIN.login(page, phone=FAMILY_PHONE)
        create_relative(page, PROFILE_A)
        button(page, "Thêm hồ sơ người thân").click()
        create_relative(page, PROFILE_B)
        home(page)
        select_profile(page, PROFILE_A)
        assert_empty(page)
        check_home_shell(page)
        screenshot(page, "family-home-empty-390.png")
        page.set_viewport_size({"width": 320, "height": 740})
        screenshot(page, "family-home-empty-320.png")
        page.set_viewport_size({"width": 390, "height": 844})
        record_family_health(page)
        expected_latest = {kind: page.get_by_test_id(f"health-latest-{kind}").get_attribute("aria-label") for kind in ("blood-pressure", "heart-rate", "blood-glucose", "weight")}
        select_profile(page, PROFILE_B)
        assert_empty(page)
        expect(text(page, "Triệu chứng giả kiểm thử")).to_have_count(0)
        add_reading(page, "Nhịp tim", "91", "2026-10-15")
        assert_latest(page, "heart-rate", "Nhịp tim", "91 nhịp/phút")
        select_profile(page, PROFILE_A)
        for kind, label in expected_latest.items():
            expect(page.get_by_test_id(f"health-latest-{kind}")).to_have_attribute("aria-label", label)
        care_plan_links(page)
        page.get_by_role("heading", name="Sức khỏe gần nhất", exact=True).evaluate("element => element.scrollIntoView({block: 'start', inline: 'nearest'})")
        screenshot(page, "family-home-populated-390.png")
        link_and_check_senior(page, expected_latest)
        assert not runtime_errors, f"Browser runtime errors: {runtime_errors}"
        print("PASS profile isolation, no fabricated data, responsive Home/header/navigation, and no browser runtime errors")
    except Exception:
        page.screenshot(path=str(ARTIFACTS / "failure.png"), full_page=True)
        raise
    finally:
        context.close()


def same_minute_latest_records(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844}, timezone_id="Asia/Ho_Chi_Minh")
    page = context.new_page()
    page.clock.install(time=datetime.fromisoformat("2026-10-16T12:00:00+07:00"))
    runtime_errors = []
    page.on("pageerror", lambda error: runtime_errors.append(str(error)))
    try:
        LOGIN.login(page, phone=FAMILY_PHONE)
        create_relative(page, PROFILE_A)
        home(page)
        add_reading(page, "Huyết áp", "120/80", "2026-10-16", time="09:15")
        add_reading(page, "Huyết áp", "130/85", "2026-10-16", time="09:15")
        assert_latest(page, "blood-pressure", "Huyết áp", "130/85 mmHg")
        assert_chart(page, "Huyết áp", 7, 2, "mmHg")

        button(page, "Ghi triệu chứng").click()
        page.get_by_role("checkbox", name="Đau đầu", exact=True).click()
        radio(page, "Nhẹ").click()
        set_recorded_at(page, "2026-10-16", "09:15")
        commit(page, "Lưu triệu chứng")
        button(page, "Ghi triệu chứng").click()
        radio(page, "Hôm nay thấy ổn").click()
        set_recorded_at(page, "2026-10-16", "09:15")
        commit(page, "Lưu triệu chứng")

        diary_heading = page.get_by_role("heading", name="Nhật ký hôm nay", exact=True)
        diary = diary_heading.locator("xpath=../..")
        expect(diary.get_by_text("Không có triệu chứng", exact=True)).to_be_visible()
        expect(diary.get_by_text("Đau đầu", exact=True)).to_have_count(0)
        expect(diary.get_by_text("Mức độ đã ghi: Nhẹ", exact=True)).to_have_count(0)
        expand_history(page)
        history = page.get_by_role("heading", name="Lịch sử sức khỏe", exact=True).locator("xpath=../../..")
        expect(history.get_by_text("Ghi nhận triệu chứng", exact=True)).to_have_count(2)
        for value in ("Đau đầu", "Mức độ đã ghi: Nhẹ", "Không có triệu chứng", "120/80 mmHg", "130/85 mmHg"):
            expect(history.get_by_text(value, exact=True)).to_have_count(1)
        diary_heading.evaluate("element => element.scrollIntoView({block: 'start', inline: 'nearest'})")
        screenshot(page, "same-minute-diary-390.png")
        assert not runtime_errors, f"Browser runtime errors: {runtime_errors}"
        print("PASS same-minute BP uses the last saved value, today's diary uses the last symptom entry, and history preserves every record")
    except Exception:
        page.screenshot(path=str(ARTIFACTS / "same-minute-failure.png"), full_page=True)
        raise
    finally:
        context.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8084")
    parser.add_argument("--same-minute-only", action="store_true", help="Run only equal-timestamp latest-record checks")
    args = parser.parse_args()
    BASE_URL = args.base_url.rstrip("/")
    LOGIN.BASE_URL = BASE_URL
    SCHEDULE.BASE_URL = BASE_URL
    ARTIFACTS = Path(__file__).resolve().parents[1] / ".expo" / "health-ui-tests"
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    SCHEDULE.ARTIFACTS = ARTIFACTS
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            if args.same_minute_only:
                same_minute_latest_records(browser)
            else:
                family_and_senior_health(browser)
                same_minute_latest_records(browser)
        finally:
            browser.close()
