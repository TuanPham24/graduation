// ===== THÔNG TIN THIỆP MỜI — sửa tất cả ở đây =====
// Chưa biết thông tin nào thì để "" — trang sẽ hiện "Sắp công bố".
window.GRAD_CONFIG = {
  graduateName: "Tên của bạn", // VD: "Phạm Minh Tuấn"
  school: "Tên trường", // VD: "Đại học Bách Khoa TP.HCM"
  major: "Chuyên ngành", // VD: "Khoa học Máy tính"
  classOf: "2026",
  // Ảnh tròn ở đầu trang. Thay bằng ảnh thật của bạn, VD: "assets/me.jpg"
  // (nên cắt vuông, khoảng 400x400px, dưới 200KB để trang tải nhanh). Để "" sẽ ẩn ảnh.
  photo: "assets/graduate.svg",

  event: {
    // Dùng cho đồng hồ đếm ngược. VD: "2026-12-20T08:00:00+07:00"
    dateTime: "",
    displayDate: "", // VD: "Chủ nhật, 20/12/2026"
    displayTime: "", // VD: "8:00 sáng"
    venueName: "", // VD: "Hội trường A, Đại học ABC"
    venueAddress: "", // VD: "268 Lý Thường Kiệt, Q.10, TP.HCM"
    mapUrl: "", // link Google Maps
    dressCode: "", // VD: "Trang phục lịch sự" — để trống sẽ ẩn ô này
  },

  rsvpDeadline: "", // VD: "10/12/2026"

  letter: {
    // Khách sẽ nhập tên khi mở trang. {name} trong thư sẽ được thay bằng tên đó.
    defaultRecipient: "bạn thân yêu",
    paragraphs: [
      "Sau bao đêm thức khuya, bao ly cà phê và không biết bao nhiêu deadline, cuối cùng mình cũng sắp tốt nghiệp rồi!",
      "Chặng đường này sẽ chẳng trọn vẹn nếu thiếu {name}. Cảm ơn bạn đã luôn cổ vũ, làm mình cười những lúc mệt mỏi và nhắc mình rằng mọi cố gắng đều xứng đáng.",
      "Mình sẽ rất vui nếu {name} có thể đến chung vui trong ngày đặc biệt này. Đến chụp thật nhiều ảnh dễ thương và cùng mình ăn mừng nhé!",
    ],
    signOff: "Thương bạn nhiều,",

    // Lời nhắn riêng (P.S.) cho từng người — khớp theo tên khách nhập,
    // không phân biệt hoa/thường hay có dấu/không dấu ("minh anh" = "Minh Anh").
    // Lưu ý: ai xem mã nguồn trang cũng đọc được phần này.
    personalNotes: {
      "Minh Anh": "Nhớ hồi mình cùng chạy deadline đồ án tới 3 giờ sáng không? Không có bạn chắc mình bỏ cuộc rồi!",
    },
  },

  // Dán URL Web App của Google Apps Script vào đây (xem README.md).
  // Để trống = chế độ demo: form vẫn chạy nhưng không lưu dữ liệu.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbxl5XB8UQjBItHTkiri0YbGWKN3Dv2C2xcefIA0Gaj1iKxgo88CQ-SGmTD4iRFb6nUq/exec",

  // Nhạc nền: mặc định dùng giai điệu hộp nhạc có sẵn (không tốn dung lượng tải).
  // Muốn dùng bài riêng thì đặt file mp3 vào assets và điền, VD: "assets/music.mp3"
  musicUrl: "",
  builtInMusic: true, // false = tắt hẳn nhạc nền (khi musicUrl để trống)
};
