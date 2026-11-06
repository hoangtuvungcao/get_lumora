# Lumora

**Kết nối trực tiếp. Riêng tư theo cách của bạn.** · *Direct. Private. Yours.*

Nhắn tin, gọi video, gửi file và giúp người thân sửa máy từ xa — trong một ứng dụng.
Miễn phí, không quảng cáo, không cần đăng ký hay số điện thoại. Chỉ bạn và người nhận đọc được.

Chat, video call, send files and help your family fix their computer from afar — all in one app.
Free, no ads, no sign-up, no phone number. Only you and the people you talk to can read your messages.

**Website:** https://getlumora.pages.dev

---

## Tải về · Download

**[Bản mới nhất · Latest release](https://github.com/hoangtuvungcao/get_lumora/releases/latest)**

| Hệ điều hành · Platform | Tệp · File |
|---|---|
| **Windows 10/11** (64-bit) | `…-windows-x86_64-setup.exe` (cài đặt · installer) hoặc · or `…-windows-x86_64-portable.zip` |
| **macOS 11+** (Intel & Apple Silicon) | `…-macos-universal.dmg` |
| **Linux** x86_64 (Ubuntu 24.04, Debian 13, Fedora 40 trở lên · or newer) | `.deb` (Debian/Ubuntu), `.AppImage` (bản phân phối khác · other distros) hoặc · or `.tar.gz` |
| **Android 8+** | `…-android-arm64-v8a.apk` cho hầu hết điện thoại · for most phones — không chắc thì chọn · if unsure: `…-android-universal.apk` |

**macOS:** nếu lần đầu mở bị chặn, vào *Cài đặt hệ thống › Quyền riêng tư & Bảo mật › Vẫn mở*.
If macOS blocks the first launch, go to *System Settings › Privacy & Security › Open Anyway*.

**Android:** cho phép *Cài ứng dụng không rõ nguồn gốc* cho trình duyệt hoặc trình quản lý tệp khi được hỏi.
Allow *Install unknown apps* for your browser or file manager when asked.

---

## Tính năng · Features

- Nhắn tin, nhóm, kênh, sticker, tin 24 giờ, tin tự huỷ · Chats, groups, channels, stickers, 24-hour stories, disappearing messages
- Gọi thoại và video, chia sẻ màn hình · Voice & video calls, screen sharing
- Gửi file không giới hạn dung lượng · Send files of any size
- Điều khiển máy tính / điện thoại từ xa (có xác nhận) · Remote control of computers and phones (with consent)
- Dùng một tài khoản trên nhiều thiết bị · One account on several devices
- Mã hoá đầu cuối; khôi phục tài khoản bằng cụm 24 từ · End-to-end encrypted; account recovery with a 24-word phrase

---

## Kiểm tra tệp tải về · Verify your download

Mỗi bản phát hành có `SHA256SUMS` và chữ ký `SHA256SUMS.sigstore.json` do quy trình build chính thức tạo ra.
Every release ships `SHA256SUMS` and its signature `SHA256SUMS.sigstore.json`, produced by the official build workflow.

```bash
sha256sum -c SHA256SUMS --ignore-missing      # macOS: shasum -a 256 -c SHA256SUMS --ignore-missing
```

Lệnh `cosign verify-blob` đầy đủ có trong ghi chú của từng bản phát hành.
The full `cosign verify-blob` command is in each release's notes.

---

## Hỗ trợ · Support

Báo lỗi hoặc góp ý: [Issues](https://github.com/hoangtuvungcao/get_lumora/issues).
Bug reports and feedback: [Issues](https://github.com/hoangtuvungcao/get_lumora/issues).

## Giấy phép · License

Lumora là phần mềm miễn phí, mã nguồn đóng — xem [LICENSE.md](LICENSE.md).
Thành phần mã nguồn mở bên thứ ba: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Lumora is proprietary freeware — see [LICENSE.md](LICENSE.md).
Third-party open-source components: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Repository này chỉ chứa bản cài đặt, không chứa mã nguồn. · This repository holds release binaries only, no source code.
