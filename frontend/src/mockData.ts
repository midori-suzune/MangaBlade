export interface Comic {
    id: number;
    title: string;
    chapter: string;
    time: string;
    hot?: boolean;
}

export const mockComics: Comic[] = [
    {id: 1, title: "Bảng Trạng Thái Bí Mật...", chapter: "Chương 32", time: "42 Phút Trước"},
    {id: 2, title: "Destiny Unchain Online", chapter: "Chương 41", time: "1 Giờ Trước", hot: true},
    {id: 3, title: "Sự Thức Tỉnh Của Hắc M...", chapter: "Chương 183", time: "1 Giờ Trước", hot: true},
    {id: 4, title: "Lúc Đó Tôi Không Biết...", chapter: "Chương 80", time: "2 Giờ Trước"},
    {id: 5, title: "Shakkin 100 Oku No Ka...", chapter: "Chương 6.5", time: "2 Giờ Trước"},
    {id: 6, title: "Cao Thủ Xuống Núi", chapter: "Chương 120", time: "3 Giờ Trước"},
    {id: 7, title: "Bắt Đầu Đánh Dấu Thánh...", chapter: "Chương 55", time: "3 Giờ Trước"},
    {id: 8, title: "Trọng Sinh Trở Lại", chapter: "Chương 90", time: "4 Giờ Trước"},
    {id: 9, title: "Ma Tôn Trở Lại", chapter: "Chương 220", time: "5 Giờ Trước", hot: true},
    {id: 10, title: "Học Viện Pháp Thuật", chapter: "Chương 34", time: "6 Giờ Trước"},
    {id: 11, title: "Thiên Đạo Tu Thư Quán", chapter: "Chương 112", time: "6 Giờ Trước"},
    {id: 12, title: "Toàn Trí Độc Giả", chapter: "Chương 98", time: "7 Giờ Trước"},
    {id: 13, title: "Nguyên Tôn", chapter: "Chương 500", time: "10 Giờ Trước"},
    {id: 14, title: "Võ Thần Chúa Tể", chapter: "Chương 3102", time: "12 Giờ Trước", hot: true},
    {id: 15, title: "Thiên Kim Khảo Cổ", chapter: "Chương 45", time: "1 Ngày Trước"},
    {id: 16, title: "Hồi Sinh Thập Niên 80", chapter: "Chương 15", time: "1 Ngày Trước"},
    {id: 17, title: "Ta Bất Địch Thiên Hạ", chapter: "Chương 19", time: "2 Ngày Trước"},
    {id: 18, title: "Nghịch Thiên Tà Thần", chapter: "Chương 2005", time: "2 Ngày Trước"},
    {id: 19, title: "Yêu Thần Ký", chapter: "Chương 310", time: "3 Ngày Trước"},
    {id: 20, title: "Luyện Khí Mười Vạn Năm", chapter: "Chương 145", time: "4 Ngày Trước"},
];

export const categoriesList = [
    "Action", "Adventure", "Anime", "Chuyển Sinh", "Comedy", "Comic",
    "Cooking", "Cổ Đại", "Doujinshi", "Drama", "Fantasy",
    "Historical", "Horror", "Live action", "Manga",
    "Manhua", "Manhwa", "Martial Arts", "Mecha", "Mystery",
    "Ngôn Tình", "Psychological", "Romance", "School Life"
];
