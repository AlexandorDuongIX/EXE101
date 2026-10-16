"""Schedule CRUD, senior linking, and responsive checks against a running web export.

Uses fake data only. This script does not start a server or build the application.
"""

import argparse
from datetime import datetime
import importlib.util
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


HELPER_PATH = Path(__file__).with_name("senior-ui.smoke.py")
HELPER_SPEC = importlib.util.spec_from_file_location("senior_ui_smoke", HELPER_PATH)
HELPERS = importlib.util.module_from_spec(HELPER_SPEC)
HELPER_SPEC.loader.exec_module(HELPERS)

FAMILY_PHONE = "0900000002"
SENIOR_PHONE = "0900000001"
PROFILE_NAME = "Người thân giả kiểm thử"


def visible_text(page, text):
    return page.get_by_text(text, exact=True).filter(visible=True)


def schedule_text(page, text):
    # Home also summarizes schedules; inspect records inside the schedule screen.
    heading = page.get_by_role("heading", name=re.compile(r"^(Lịch chăm sóc|Lịch của tôi)$"))
    return heading.locator("..").locator("..").get_by_text(text, exact=True)


def field(page, name):
    return page.get_by_role("textbox", name=name, exact=True)


def button(page, name):
    return page.get_by_role("button", name=name, exact=True)


def tab(page, name):
    return page.get_by_role("tab", name=name, exact=True)


def wait_route(page, pattern):
    page.wait_for_url(pattern)
    # Avoid Playwright scrollIntoView moving the overflow-hidden scene mid-slide.
    page.wait_for_timeout(300)


def choose_kind(page, name):
    tab(page, name).click()
    expect(tab(page, name)).to_have_attribute("aria-selected", "true")


def check_shell(page):
    expect(visible_text(page, "KithCare")).to_have_count(1)
    expect(visible_text(page, "KithCare")).to_be_in_viewport()
    for name in ("Trang chủ", "Thuốc", "Sức khỏe", "Trợ lý AI", "Gia đình"):
        expect(tab(page, name)).to_have_count(1)
        expect(tab(page, name)).to_be_in_viewport()
    expect(tab(page, "Thuốc")).to_have_attribute("aria-selected", "true")
    heading = page.get_by_role("heading", name=re.compile(r"^(Lịch chăm sóc|Lịch của tôi)$"))
    bounds = heading.bounding_box()
    assert bounds and bounds["x"] >= -1, "Schedule scene is clipped horizontally"
    assert bounds["x"] + bounds["width"] <= page.viewport_size["width"] + 1, "Schedule scene exceeds viewport"
    HELPERS.check_width(page)


def screenshot(page, name):
    # Native-style tab/modal transitions continue briefly after accessibility updates.
    page.wait_for_timeout(450)
    HELPERS.check_width(page)
    page.screenshot(path=str(ARTIFACTS / name), full_page=True)


def double_save(page, title):
    # Two events in one JS turn exercise the synchronous controller guard.
    button(page, title).evaluate("element => { element.click(); element.click(); }")
    expect(button(page, title)).to_have_count(0)


def calendar_day(page, value):
    year, month, day = value.split("-")
    return button(page, f"Chọn ngày {day}/{month}/{year}")


def navigate_calendar(page, value):
    year, month, _ = map(int, value.split("-"))
    target = year * 12 + month
    heading = page.get_by_role("heading", name=re.compile(r"^Tháng \d{1,2}, \d{4}$"))
    for _ in range(48):
        match = re.fullmatch(r"Tháng (\d{1,2}), (\d{4})", heading.inner_text())
        assert match, "Calendar month heading is missing"
        current = int(match.group(2)) * 12 + int(match.group(1))
        if current == target:
            return
        button(page, "Tháng sau" if current < target else "Tháng trước").click()
    raise AssertionError("Calendar did not reach the requested month")


def select_date(page, label, value):
    button(page, label).click()
    navigate_calendar(page, value)
    calendar_day(page, value).click()
    button(page, "Xác nhận ngày").click()
    expect(button(page, "Xác nhận ngày")).to_have_count(0)


def select_time(page, label, value):
    hour, minute = value.split(":")
    button(page, label).click()
    hour_choice = page.get_by_role("radio", name=f"Giờ {hour}", exact=True)
    minute_choice = page.get_by_role("radio", name=f"Phút {minute}", exact=True)
    hour_choice.click()
    minute_choice.click()
    expect(hour_choice).to_be_checked()
    expect(minute_choice).to_be_checked()
    button(page, "Xác nhận giờ").click()
    expect(button(page, "Xác nhận giờ")).to_have_count(0)


def assert_time_chips(page, values):
    chips = page.get_by_role("button", name=re.compile(r"^Sửa giờ uống \d{2}:\d{2}$"))
    expect(chips).to_have_count(len(values))
    assert [chip.get_attribute("aria-label") for chip in chips.all()] == [f"Sửa giờ uống {value}" for value in values]


def fill_medication(page, name="Thuốc thử nghiệm", times=("20:00", "08:00", "08:00")):
    field(page, "Tên thuốc, bắt buộc").fill(name)
    field(page, "Liều dùng mỗi lần, bắt buộc").fill("Theo đơn mẫu")
    field(page, "Hướng dẫn uống").fill("Nội dung giả để kiểm thử giao diện.")
    for value in times:
        select_time(page, "Thêm giờ uống", value)
    select_date(page, "Ngày bắt đầu, bắt buộc", "2026-10-16")
    select_date(page, "Ngày kết thúc", "2026-10-30")


def fill_appointment(page, title="Buổi khám thử nghiệm"):
    field(page, "Nội dung khám, bắt buộc").fill(title)
    field(page, "Cơ sở khám hoặc địa chỉ, bắt buộc").fill("Cơ sở giả để kiểm thử")
    field(page, "Bác sĩ").fill("Tên giả kiểm thử")
    select_date(page, "Ngày khám, bắt buộc", "2026-10-16")
    select_time(page, "Giờ khám, bắt buộc", "09:30")
    field(page, "Ghi chú buổi khám").fill("Ghi chú giả để kiểm thử.")


def delete_schedule(page, kind, name):
    delete = button(page, f"Xóa lịch {kind} {name}")
    delete.click()
    expect(page.get_by_role("heading", name=f"Xóa lịch {kind}?", exact=True)).to_be_visible()
    button(page, "Hủy xóa lịch").click()
    expect(visible_text(page, name)).to_have_count(1)
    delete.click()
    button(page, "Xác nhận xóa lịch").click()
    expect(visible_text(page, name)).to_have_count(0)


def medication_crud(page):
    expect(visible_text(page, "Chưa có lịch thuốc")).to_be_visible()
    button(page, "Thêm lịch thuốc").click()
    button(page, "Tạo lịch thuốc").click()
    for error in (
        "Vui lòng nhập tên thuốc.",
        "Vui lòng nhập liều dùng.",
        "Chọn từ 1 đến 12 giờ uống hợp lệ.",
        "Vui lòng chọn ngày bắt đầu hợp lệ.",
    ):
        expect(visible_text(page, error)).to_have_count(1)
    expect(page.get_by_role("textbox", name=re.compile(r"^(Ngày|Giờ)"))).to_have_count(0)
    initial_date_text = button(page, "Ngày bắt đầu, bắt buộc").inner_text()
    button(page, "Ngày bắt đầu, bắt buộc").click()
    navigate_calendar(page, "2026-10-16")
    calendar_day(page, "2026-10-16").click()
    month_heading = page.get_by_role("heading", name="Tháng 10, 2026", exact=True)
    expect(month_heading).to_be_visible()
    button(page, "Tháng sau").click()
    expect(page.get_by_role("heading", name="Tháng 11, 2026", exact=True)).to_be_visible()
    button(page, "Tháng trước").click()
    expect(month_heading).to_be_visible()
    button(page, "Hủy chọn ngày").click()
    expect(button(page, "Ngày bắt đầu, bắt buộc")).to_have_text(initial_date_text)
    button(page, "Thêm giờ uống").click()
    page.get_by_role("radio", name="Giờ 14", exact=True).click()
    page.get_by_role("radio", name="Phút 25", exact=True).click()
    button(page, "Hủy chọn giờ").click()
    assert_time_chips(page, [])

    fill_medication(page)
    assert_time_chips(page, ["08:00", "20:00"])
    expect(visible_text(page, "Giờ này đã có trong lịch.")).to_be_visible()
    select_time(page, "Thêm giờ uống", "12:30")
    select_time(page, "Sửa giờ uống 12:30", "08:00")
    assert_time_chips(page, ["08:00", "12:30", "20:00"])
    expect(visible_text(page, "Giờ này đã có trong lịch.")).to_be_visible()
    select_time(page, "Sửa giờ uống 12:30", "09:15")
    assert_time_chips(page, ["08:00", "09:15", "20:00"])
    button(page, "Xóa giờ uống 09:15").click()
    assert_time_chips(page, ["08:00", "20:00"])
    extra_times = [f"{hour:02d}:00" for hour in range(11) if hour != 8]
    for value in extra_times:
        select_time(page, "Thêm giờ uống", value)
    assert_time_chips(page, sorted(["08:00", "20:00", *extra_times]))
    expect(button(page, "Thêm giờ uống")).to_be_disabled()
    expect(visible_text(page, "Đã chọn đủ 12 giờ uống.")).to_be_visible()
    for value in extra_times:
        button(page, f"Xóa giờ uống {value}").click()
    expect(button(page, "Thêm giờ uống")).to_be_enabled()
    assert_time_chips(page, ["08:00", "20:00"])

    page.set_viewport_size({"width": 320, "height": 740})
    button(page, "Ngày kết thúc").click()
    navigate_calendar(page, "2026-10-30")
    expect(calendar_day(page, "2026-10-15")).to_be_disabled()
    expect(calendar_day(page, "2026-10-16")).to_be_enabled()
    screenshot(page, "calendar-picker-320.png")
    button(page, "Hủy chọn ngày").click()
    expect(button(page, "Ngày kết thúc")).to_contain_text("30/10/2026")
    button(page, "Ngày bắt đầu, bắt buộc").click()
    navigate_calendar(page, "2026-10-16")
    expect(calendar_day(page, "2026-10-31")).to_be_disabled()
    button(page, "Hủy chọn ngày").click()
    button(page, "Xóa Ngày kết thúc").click()
    expect(button(page, "Ngày kết thúc")).not_to_contain_text("30/10/2026")
    select_date(page, "Ngày kết thúc", "2026-10-30")
    screenshot(page, "family-medication-form-320.png")
    double_save(page, "Tạo lịch thuốc")
    expect(visible_text(page, "Thuốc thử nghiệm")).to_have_count(1)
    expect(visible_text(page, "08:00")).to_have_count(1)
    expect(visible_text(page, "20:00")).to_have_count(1)
    button(page, "Sửa lịch thuốc Thuốc thử nghiệm").click()
    expect(field(page, "Liều dùng mỗi lần, bắt buộc")).to_have_value("Theo đơn mẫu")
    assert_time_chips(page, ["08:00", "20:00"])
    expect(button(page, "Ngày bắt đầu, bắt buộc")).to_contain_text("16/10/2026")
    expect(button(page, "Ngày kết thúc")).to_contain_text("30/10/2026")
    button(page, "Sửa giờ uống 08:00").click()
    expect(page.get_by_role("radio", name="Giờ 08", exact=True)).to_be_checked()
    expect(page.get_by_role("radio", name="Phút 00", exact=True)).to_be_checked()
    screenshot(page, "time-picker-320.png")
    button(page, "Hủy chọn giờ").click()
    button(page, "Ngày bắt đầu, bắt buộc").click()
    navigate_calendar(page, "2026-10-16")
    expect(calendar_day(page, "2026-10-16")).to_have_attribute("aria-selected", "true")
    button(page, "Hủy chọn ngày").click()
    field(page, "Tên thuốc, bắt buộc").fill("Thuốc thử nghiệm đã sửa")
    field(page, "Hướng dẫn uống").fill("Ghi chú giả đã cập nhật.")
    double_save(page, "Lưu thay đổi")
    expect(visible_text(page, "Thuốc thử nghiệm")).to_have_count(0)
    expect(visible_text(page, "Thuốc thử nghiệm đã sửa")).to_have_count(1)
    expect(visible_text(page, "Ghi chú giả đã cập nhật.")).to_have_count(1)
    check_shell(page)
    screenshot(page, "family-medication-list-320.png")
    delete_schedule(page, "thuốc", "Thuốc thử nghiệm đã sửa")
    expect(visible_text(page, "Chưa có lịch thuốc")).to_be_visible()
    page.set_viewport_size({"width": 390, "height": 844})
    button(page, "Thêm lịch thuốc").click()
    fill_medication(page, name="Thuốc thử nghiệm để xem", times=("08:00",))
    double_save(page, "Tạo lịch thuốc")
    print("PASS medication picker cancel/confirm, month navigation, date bounds/clear, unique sorted editable/removable times, max12, CRUD and duplicate saves")


def appointment_crud(page):
    choose_kind(page, "Lịch khám")
    expect(visible_text(page, "Chưa có lịch khám")).to_be_visible()
    button(page, "Thêm lịch khám").click()
    button(page, "Tạo lịch khám").click()
    for error in (
        "Vui lòng nhập nội dung khám.",
        "Vui lòng nhập cơ sở khám.",
        "Vui lòng chọn ngày khám hợp lệ.",
        "Vui lòng chọn giờ khám hợp lệ.",
    ):
        expect(visible_text(page, error)).to_have_count(1)
    expect(page.get_by_role("textbox", name=re.compile(r"^(Ngày|Giờ)"))).to_have_count(0)
    initial_time_text = button(page, "Giờ khám, bắt buộc").inner_text()
    button(page, "Giờ khám, bắt buộc").click()
    page.get_by_role("radio", name="Giờ 09", exact=True).click()
    page.get_by_role("radio", name="Phút 30", exact=True).click()
    screenshot(page, "time-picker-390.png")
    button(page, "Hủy chọn giờ").click()
    expect(button(page, "Giờ khám, bắt buộc")).to_have_text(initial_time_text)
    fill_appointment(page)
    double_save(page, "Tạo lịch khám")
    expect(visible_text(page, "Buổi khám thử nghiệm")).to_have_count(1)
    button(page, "Sửa lịch khám Buổi khám thử nghiệm").click()
    expect(button(page, "Ngày khám, bắt buộc")).to_contain_text("16/10/2026")
    expect(button(page, "Giờ khám, bắt buộc")).to_contain_text("09:30")
    button(page, "Ngày khám, bắt buộc").click()
    navigate_calendar(page, "2026-10-16")
    expect(calendar_day(page, "2026-10-16")).to_have_attribute("aria-selected", "true")
    screenshot(page, "calendar-picker-390.png")
    button(page, "Hủy chọn ngày").click()
    field(page, "Nội dung khám, bắt buộc").fill("Buổi khám thử nghiệm đã sửa")
    select_time(page, "Giờ khám, bắt buộc", "10:45")
    double_save(page, "Lưu thay đổi")
    expect(visible_text(page, "Buổi khám thử nghiệm đã sửa")).to_have_count(1)
    expect(visible_text(page, "10:45")).to_have_count(1)
    check_shell(page)
    screenshot(page, "family-appointment-list-390.png")
    delete_schedule(page, "khám", "Buổi khám thử nghiệm đã sửa")
    expect(visible_text(page, "Chưa có lịch khám")).to_be_visible()
    button(page, "Thêm lịch khám").click()
    fill_appointment(page, title="Buổi khám thử nghiệm để xem")
    double_save(page, "Tạo lịch khám")
    print("PASS appointment picker validation, cancel/confirm, selected values on edit, CRUD and duplicate saves")


def logout(page):
    button(page, "Tài khoản").click()
    button(page, "Đăng xuất").click()
    wait_route(page, "**/login")


def assert_read_only(page):
    expect(page.get_by_role("button", name=re.compile(r"^(Thêm|Sửa|Xóa|Tạo|Lưu)(?: |$)"))).to_have_count(0)
    expect(visible_text(page, "Chỉnh sửa")).to_have_count(0)
    expect(visible_text(page, "Xóa")).to_have_count(0)
    check_shell(page)


def link_and_view_as_senior(page):
    tab(page, "Gia đình").click()
    wait_route(page, "**/add-more-senior")
    button(page, f"Mã liên kết {PROFILE_NAME}").click()
    code_display = page.get_by_label("Mã liên kết 6 số", exact=True)
    expect(code_display).to_have_text(re.compile(r"^\d{6}$"))
    previous_code = code_display.inner_text().strip()
    button(page, "Đóng mã liên kết").click()
    button(page, f"Mã liên kết {PROFILE_NAME}").click()
    expect(code_display).to_have_text(previous_code)
    button(page, "Tạo mã mới").click()
    expect(code_display).not_to_have_text(previous_code)
    code = code_display.inner_text().strip()
    assert re.fullmatch(r"\d{6}", code), code
    screenshot(page, "family-link-code-390.png")
    button(page, "Đóng mã liên kết").click()
    logout(page)
    HELPERS.login(page, role="Người cao tuổi", phone=SENIOR_PHONE, open_page=False)
    wait_route(page, "**/link-senior")
    expect(page.get_by_role("tab")).to_have_count(0)
    link_input = field(page, "Mã liên kết 6 chữ số")
    expect(button(page, "Liên kết với gia đình")).to_be_disabled()
    invalid_code = f"{(int(code) + 1) % 1_000_000:06d}"
    link_input.fill(invalid_code)
    button(page, "Liên kết với gia đình").click()
    invalid_message = "Mã liên kết không hợp lệ hoặc đã hết hạn. Vui lòng xin mã mới."
    expect(visible_text(page, invalid_message)).to_be_visible()
    link_input.fill(previous_code)
    button(page, "Liên kết với gia đình").click()
    expect(visible_text(page, invalid_message)).to_be_visible()
    screenshot(page, "senior-link-form-390.png")
    link_input.fill(code)
    button(page, "Liên kết với gia đình").click()
    wait_route(page, "**/senior-home")
    tab(page, "Thuốc").click()
    wait_route(page, "**/senior-medications")
    expect(visible_text(page, "Lịch của tôi")).to_be_visible()
    choose_kind(page, "Lịch thuốc")
    expect(schedule_text(page, "Thuốc thử nghiệm để xem")).to_have_count(1)
    assert_read_only(page)
    screenshot(page, "senior-medication-list-390.png")
    choose_kind(page, "Lịch khám")
    expect(schedule_text(page, "Buổi khám thử nghiệm để xem")).to_have_count(1)
    assert_read_only(page)
    page.set_viewport_size({"width": 320, "height": 740})
    check_shell(page)
    screenshot(page, "senior-appointment-list-320.png")
    tab(page, "Trang chủ").click()
    wait_route(page, "**/senior-home")
    tab(page, "Thuốc").click()
    wait_route(page, "**/senior-medications")
    logout(page)

    HELPERS.login(page, role="Người cao tuổi", phone="0900000099", open_page=False)
    wait_route(page, "**/link-senior")
    expect(page.get_by_role("tab")).to_have_count(0)
    field(page, "Mã liên kết 6 chữ số").fill(code)
    button(page, "Liên kết với gia đình").click()
    expect(visible_text(page, invalid_message)).to_be_visible()
    expect(schedule_text(page, "Thuốc thử nghiệm để xem")).to_have_count(0)
    screenshot(page, "senior-consumed-code-320.png")
    button(page, "Đổi tài khoản").click()
    wait_route(page, "**/login")
    HELPERS.login(page, role="Người cao tuổi", phone=SENIOR_PHONE, open_page=False)
    wait_route(page, "**/senior-home")
    tab(page, "Thuốc").click()
    wait_route(page, "**/senior-medications")
    choose_kind(page, "Lịch thuốc")
    expect(schedule_text(page, "Thuốc thử nghiệm để xem")).to_have_count(1)
    assert_read_only(page)
    print("PASS link code reuse/rotation, senior gate, invalid/consumed codes, linked senior read-only, another account isolation, linked relogin")


def create_relative_and_open_schedules(page, profile_name=PROFILE_NAME):
    HELPERS.login(page, phone=FAMILY_PHONE)
    HELPERS.wait_form(page)
    field(page, "Họ và tên người thân, bắt buộc").fill(profile_name)
    field(page, "Năm sinh của người thân, bắt buộc, gồm 4 chữ số").fill("1960")
    page.get_by_role("radio", name="Mẹ", exact=True).click()
    button(page, "Tạo hồ sơ người thân").click()
    wait_route(page, "**/add-more-senior?created=1")
    tab(page, "Thuốc").click()
    wait_route(page, "**/family-medications")


def family_crud(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    runtime_errors = []
    page.on("pageerror", lambda error: runtime_errors.append(str(error)))
    try:
        create_relative_and_open_schedules(page)
        check_shell(page)
        medication_crud(page)
        appointment_crud(page)

        tab(page, "Trang chủ").click()
        wait_route(page, "**/family-home")
        tab(page, "Thuốc").click()
        wait_route(page, "**/family-medications")
        check_shell(page)
        link_and_view_as_senior(page)
        assert not runtime_errors, f"Browser runtime errors: {runtime_errors}"
        print("PASS family tab round trip, fixed shell, and 390/320px layouts")
    except Exception:
        page.screenshot(path=str(ARTIFACTS / "failure.png"), full_page=True)
        raise
    finally:
        context.close()


def daily_time_survives_dst_gap(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844}, timezone_id="America/New_York")
    page = context.new_page()
    # New York skips 02:00–02:59 on this date; daily medication time is independent of that date.
    page.clock.install(time=datetime.fromisoformat("2026-03-08T12:00:00-04:00"))
    runtime_errors = []
    page.on("pageerror", lambda error: runtime_errors.append(str(error)))
    try:
        create_relative_and_open_schedules(page, profile_name="Người thân kiểm thử DST")
        assert page.evaluate("new Date().getMonth() === 2 && new Date().getDate() === 8 && new Date().getHours() === 12")
        assert page.evaluate("new Date(2026, 2, 8, 2, 30).getHours()") == 3, "Test timezone must contain the DST gap"
        button(page, "Thêm lịch thuốc").click()
        select_time(page, "Thêm giờ uống", "02:30")
        assert_time_chips(page, ["02:30"])
        button(page, "Sửa giờ uống 02:30").click()
        expect(page.get_by_role("radio", name="Giờ 02", exact=True)).to_be_checked()
        expect(page.get_by_role("radio", name="Phút 30", exact=True)).to_be_checked()
        screenshot(page, "time-picker-dst-390.png")
        button(page, "Hủy chọn giờ").click()
        assert_time_chips(page, ["02:30"])
        assert not runtime_errors, f"Browser runtime errors: {runtime_errors}"
        print("PASS daily 02:30 remains unchanged when created and reopened during New York DST spring-forward day")
    except Exception:
        page.screenshot(path=str(ARTIFACTS / "dst-failure.png"), full_page=True)
        raise
    finally:
        context.close()


def unauthenticated_guards(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    try:
        page = context.new_page()
        for route in ("/family-medications", "/senior-medications", "/link-senior"):
            page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
            page.wait_for_url("**/login")
            expect(page.get_by_role("radio", name="Người cao tuổi", exact=True)).to_be_visible()
        print("PASS unauthenticated direct schedule routes redirect to login")
    finally:
        context.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8084")
    parser.add_argument("--dst-only", action="store_true", help="Run only the daily-time DST regression")
    args = parser.parse_args()
    BASE_URL = args.base_url.rstrip("/")
    HELPERS.BASE_URL = BASE_URL
    ARTIFACTS = Path(__file__).resolve().parents[1] / ".expo" / "schedule-ui-tests"
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            if not args.dst_only:
                family_crud(browser)
                unauthenticated_guards(browser)
            daily_time_survives_dst_gap(browser)
        finally:
            browser.close()
