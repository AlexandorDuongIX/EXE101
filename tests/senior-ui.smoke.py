"""Behavioral browser checks using fake demo data; run against the local Expo server."""

import argparse
import base64
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def login(page, role="Con cái / Người thân", phone="0912345678", open_page=True):
    if open_page:
        page.goto(f"{BASE_URL}/login", wait_until="networkidle")
    role_option = page.get_by_role("radio", name=role, exact=True)
    role_option.click()
    expect(role_option).to_be_checked()
    page.get_by_role("textbox").fill(phone)
    page.get_by_role("button", name="Tiếp tục nhận mã OTP", exact=True).click()
    page.get_by_text("Xác thực mã OTP", exact=True).wait_for()
    for digit in "123456":
        page.get_by_text(digit, exact=True).click()
    page.get_by_role("button", name="Xác nhận & Đăng nhập", exact=True).click()


def wait_form(page):
    page.wait_for_url("**/create-senior")
    page.get_by_text("1. Thông tin cá nhân", exact=True).wait_for()


def check_width(page):
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), "Horizontal overflow"


def create_and_repeat(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    login(page)
    wait_form(page)
    submit = page.get_by_role("button", name="Tạo hồ sơ người thân", exact=True)
    submit.click()
    expect(page.get_by_text("Vui lòng nhập họ tên có ít nhất 2 ký tự.", exact=True)).to_be_visible()
    expect(page.get_by_text("Vui lòng chọn quan hệ của người thân với bạn.", exact=True)).to_be_visible()
    page.get_by_role("textbox", name="Họ và tên người thân, bắt buộc", exact=True).fill("  Người thân Demo  ")
    current_year = page.evaluate("new Date().getFullYear()")
    page.get_by_role("textbox", name="Năm sinh của người thân, bắt buộc, gồm 4 chữ số", exact=True).fill(str(current_year + 1))
    page.get_by_role("radio", name="Khác", exact=True).click()
    expect(page.get_by_role("radio", name="Khác", exact=True)).to_be_checked()
    submit.click()
    expect(page.get_by_text("Vui lòng nhập quan hệ của người thân với bạn.", exact=True)).to_be_visible()
    page.get_by_role("textbox", name="Năm sinh của người thân, bắt buộc, gồm 4 chữ số", exact=True).fill("1960")
    page.get_by_role("textbox", name="Quan hệ khác với bạn, bắt buộc", exact=True).fill(" Bác ")
    page.get_by_role("checkbox", name="Tăng huyết áp", exact=True).click()
    page.get_by_role("checkbox", name="Không có bệnh nền đã biết", exact=True).click()
    expect(page.get_by_role("checkbox", name="Tăng huyết áp", exact=True)).not_to_be_checked()
    page.get_by_role("checkbox", name="Chưa rõ", exact=True).click()
    expect(page.get_by_role("checkbox", name="Không có bệnh nền đã biết", exact=True)).not_to_be_checked()
    page.get_by_role("checkbox", name="Đái tháo đường (tiểu đường)", exact=True).click()
    expect(page.get_by_role("checkbox", name="Chưa rõ", exact=True)).not_to_be_checked()
    page.get_by_role("checkbox", name="Khác", exact=True).click()
    page.get_by_role("textbox", name="Bệnh nền khác, không bắt buộc", exact=True).fill("Tiểu đường; Bệnh demo; bệnh demo")
    page.get_by_role("textbox", name="Các lưu ý về sức khỏe, không bắt buộc", exact=True).fill("Ghi chú giả để thử tính năng.")
    page.get_by_role("checkbox", name="Đặt người này làm liên hệ khẩn cấp chính (SOS)", exact=True).click()

    image_path = ARTIFACTS / "demo-avatar.png"
    image_path.write_bytes(base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5WQAAAAASUVORK5CYII="
    ))
    with page.expect_file_chooser() as chooser:
        page.get_by_role("button", name="Chọn ảnh đại diện người thân", exact=True).click()
    chooser.value.set_files(image_path)
    expect(page.get_by_role("img", name="Ảnh đại diện người thân đã chọn", exact=True)).to_be_visible()
    page.get_by_role("button", name="Xóa ảnh đại diện người thân đã chọn", exact=True).click()
    expect(page.get_by_role("img", name="Ảnh đại diện người thân mặc định", exact=True)).to_be_visible()
    with page.expect_file_chooser() as chooser:
        page.get_by_role("button", name="Chọn ảnh đại diện người thân", exact=True).click()
    chooser.value.set_files(image_path)
    expect(page.get_by_role("img", name="Ảnh đại diện người thân đã chọn", exact=True)).to_be_visible()
    check_width(page)
    submit.evaluate("element => { element.click(); element.click(); }")
    page.wait_for_url("**/family-home?created=1")
    expect(page.get_by_text("Đã tạo hồ sơ người thân", exact=True)).to_be_visible()
    expect(page.get_by_text("1 hồ sơ người thân", exact=True)).to_be_visible()
    expect(page.get_by_text("Người thân Demo", exact=True)).to_be_visible()
    expect(page.get_by_text("Bác của bạn", exact=True)).to_be_visible()
    expect(page.get_by_text("Đã đánh dấu SOS chính cho demo", exact=True)).to_be_visible()
    page.screenshot(path=str(ARTIFACTS / "senior-family-desktop.png"), full_page=True)
    page.get_by_role("button", name="Đăng xuất tài khoản Con cái", exact=True).click()
    page.wait_for_url("**/login")
    login(page, open_page=False)
    wait_form(page)
    page.get_by_role("button", name="Để sau và quay lại trang quản lý người thân", exact=True).click()
    page.wait_for_url("**/family-home")
    expect(page.get_by_text("1 hồ sơ người thân", exact=True)).to_be_visible()
    expect(page.get_by_text("Người thân Demo", exact=True)).to_be_visible()
    page.reload(wait_until="networkidle")
    page.wait_for_url("**/login")
    assert "/create-senior" not in page.url
    context.close()
    print("PASS creation, validation, health exclusivity, avatar, duplicate taps, repeat login, refresh")


def other_roles(browser):
    context = browser.new_context()
    page = context.new_page()
    login(page, role="Người cao tuổi")
    page.wait_for_url("**/senior-home")
    assert "/create-senior" not in page.url
    login(page, role="Điều dưỡng")
    expect(page.get_by_text("Đã đăng nhập tài khoản Điều dưỡng trong chế độ demo.", exact=True)).to_be_visible()
    assert page.url.endswith("/login")
    context.close()
    print("PASS Senior and caregiver keep their destinations")


def mobile_dark_and_cancel(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark")
    page = context.new_page()
    page.goto(f"{BASE_URL}/create-senior", wait_until="networkidle")
    page.wait_for_url("**/login")
    login(page, open_page=False)
    wait_form(page)
    expect(page.get_by_role("checkbox", name="Đặt người này làm liên hệ khẩn cấp chính (SOS)", exact=True)).not_to_be_checked()
    page.get_by_role("textbox", name="Họ và tên người thân, bắt buộc", exact=True).fill("Hồ sơ giả")
    page.get_by_role("textbox", name="Năm sinh của người thân, bắt buộc, gồm 4 chữ số", exact=True).fill("2026")
    page.get_by_role("radio", name="Mẹ", exact=True).click()
    with page.expect_file_chooser() as chooser:
        page.get_by_role("button", name="Chọn ảnh đại diện người thân", exact=True).click()
    chooser.value.set_files([])
    expect(page.get_by_role("button", name="Chọn ảnh đại diện người thân", exact=True)).to_be_enabled()
    check_width(page)
    page.screenshot(path=str(ARTIFACTS / "senior-create-mobile-dark.png"), full_page=True)
    page.get_by_role("button", name="Tạo hồ sơ người thân", exact=True).click()
    page.wait_for_url("**/family-home?created=1")
    expect(page.get_by_text("Hồ sơ giả", exact=True)).to_be_visible()
    check_width(page)
    context.close()
    print("PASS direct-route guard, mobile dark, optional avatar cancellation, no age minimum")


def otp_cancel_race(browser):
    context = browser.new_context()
    page = context.new_page()
    page.goto(f"{BASE_URL}/login", wait_until="networkidle")
    page.get_by_role("radio", name="Con cái / Người thân", exact=True).click()
    page.get_by_role("textbox").fill("0912345678")
    page.get_by_role("button", name="Tiếp tục nhận mã OTP", exact=True).click()
    page.get_by_text("Xác thực mã OTP", exact=True).wait_for()
    for digit in "123456":
        page.get_by_text(digit, exact=True).click()
    page.get_by_role("button", name="Xác nhận & Đăng nhập", exact=True).click()
    page.get_by_text("✕", exact=True).last.click()
    page.get_by_role("radio", name="Người cao tuổi", exact=True).click()
    page.get_by_role("button", name="Tiếp tục nhận mã OTP", exact=True).click()
    page.get_by_text("Xác thực mã OTP", exact=True).wait_for()
    # Observe the old timer's deadline; a new challenge must remain unconfirmed.
    page.wait_for_timeout(1000)
    assert page.url.endswith("/login"), "Cancelled OTP authenticated a later challenge"
    for digit in "123456":
        page.get_by_text(digit, exact=True).click()
    page.get_by_role("button", name="Xác nhận & Đăng nhập", exact=True).click()
    page.wait_for_url("**/senior-home")
    context.close()
    print("PASS cancelled OTP cannot authenticate a new challenge")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8083")
    args = parser.parse_args()
    BASE_URL = args.base_url.rstrip("/")
    ARTIFACTS = Path(__file__).resolve().parents[1] / ".expo" / "senior-ui-tests"
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            create_and_repeat(browser)
            other_roles(browser)
            mobile_dark_and_cancel(browser)
            otp_cancel_race(browser)
        finally:
            browser.close()
