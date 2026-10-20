// ===== THÔNG TIN THIỆP MỜI — sửa tất cả ở đây =====
// Chưa biết thông tin nào thì để "" — trang sẽ hiện "Sắp công bố".
window.GRAD_CONFIG = {
  graduateName: "Phạm Minh Tuấn", // VD: "Phạm Minh Tuấn"
  school: "Trường Đại học Giao Thông Vận Tải TP.HCM", // VD: "Đại học Bách Khoa TP.HCM"
  major: "Công nghệ thông tin", // VD: "Khoa học Máy tính"
  classOf: "2026",

  // Ảnh lớn kiểu "trang nhất báo" ở đầu trang (ảnh ngang, cắt từ pic8).
  heroPhoto: "assets/gallery/pic1.jpg",
  heroPhoto2x: "assets/gallery/pic1@2x.jpg",
  // Ảnh trong phong bì ở phần "Welcome" (cắt vuông từ pic2).
  photo: "assets/avatar.jpg",
  photo2x: "assets/avatar@2x.jpg",

  event: {
    // Dùng cho đồng hồ đếm ngược, ngày trên "báo" và lịch "Save the date".
    // VD: "2026-12-20T08:00:00+07:00"
    dateTime: "2026-12-26T17:00:00+07:00",
    displayDate: "Thứ Bảy, 26/12/2026", // VD: "Chủ nhật, 20/12/2026"
    displayTime: "17:00", // VD: "8:00 sáng"
    venueName: "Trường Đại học Giao Thông Vận Tải TP.HCM", // VD: "Hội trường A, Đại học ABC"
    venueAddress: "Số 2 Võ Oanh, P.Thạnh Mỹ Tây, TP.HCM", // VD: "268 Lý Thường Kiệt, Q.10, TP.HCM"
    mapUrl: "https://maps.app.goo.gl/N8LtzbQPNZ8UBdS66", // link Google Maps
    dressCode: "", // VD: "Trang phục lịch sự" — để trống sẽ ẩn dòng này
    contact: "0961 634 579 (Tuấn)", // VD: "0961 634 579 (Tuấn)" — để trống sẽ ẩn
  },

  // Ghi chú viết tay trên tờ lịch "Save the date".
  saveTheDateNote: "*Nhớ có mặt đúng giờ nha mọi người <3",

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

  // Ảnh cho phần "Chapters of Us". Ảnh đầu tiên là ảnh lớn ở giữa.
  gallery: [
    ["assets/gallery/pic6.jpg", "assets/gallery/pic6@2x.jpg"],
    ["assets/gallery/pic3.jpg", "assets/gallery/pic3@2x.jpg"],
    ["assets/gallery/pic7.jpg", "assets/gallery/pic7@2x.jpg"],
    ["assets/gallery/pic4.jpg", "assets/gallery/pic4@2x.jpg"],
    ["assets/gallery/pic8.jpg", "assets/gallery/pic8@2x.jpg"],
    ["assets/gallery/pic5.jpg", "assets/gallery/pic5@2x.jpg"],
    ["assets/gallery/pic9.jpg", "assets/gallery/pic9@2x.jpg"],
  ],

  location: {
    note: "Hẹn gặp ở đây nhé!!!",
    // Hướng dẫn đường đi. VD:
    // directions: [
    //   { from: "Từ cổng chính", steps: ["Đi thẳng tới toà A", "Rẽ trái, sảnh nằm bên phải"] },
    // ],
    directions: [],
  },

  thankYou: {
    paragraphs: [
      "Cảm ơn {name} đã luôn ở bên và đồng hành cùng mình trong suốt những năm tháng vừa qua.",
      "Nhờ có bạn, quãng đời sinh viên của mình trở nên ý nghĩa và đáng nhớ hơn rất nhiều.",
      "Mình mong lắm được gặp bạn trong ngày lễ tốt nghiệp sắp tới!",
    ],
    photo: "assets/gallery/pic10.jpg",
    photo2x: "assets/gallery/pic10@2x.jpg",
  },

  // Dán URL Web App của Google Apps Script vào đây (xem README.md).
  // Để trống = chế độ demo: form vẫn chạy nhưng không lưu dữ liệu.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbxl5XB8UQjBItHTkiri0YbGWKN3Dv2C2xcefIA0Gaj1iKxgo88CQ-SGmTD4iRFb6nUq/exec",

  // Nhạc nền: phát qua trình nhúng chính thức của YouTube (không tải file nhạc nào).
  // Có file nhạc riêng (có bản quyền hợp lệ) thì điền musicUrl, VD: "assets/music.mp3" — sẽ được ưu tiên.
  musicUrl: "",
  youtubeMusicId: "Z1D26z9l8y8", // youtube.com/watch?v=
  musicTitle: "Bầu Trời Mới",
  musicArtist: "Da LAB ft. Minh Tốc & Lam",
  builtInMusic: true, // false = tắt hẳn nhạc nền (khi musicUrl và youtubeMusicId đều trống)
};
