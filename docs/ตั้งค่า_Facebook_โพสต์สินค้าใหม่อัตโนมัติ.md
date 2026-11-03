# โพสต์สินค้ามือสองชิ้นใหม่ลงเพจ Facebook อัตโนมัติ

ใช้ไฟล์ `docs/facebook-post.gs` (วางเป็นไฟล์ที่ 4 ใน Apps Script ข้างไฟล์เดิม ไม่ต้องแก้หรือลบไฟล์เดิม)
เมื่อสถานะแถวเป็น "ลงขาย" และมีรูป ระบบจะโพสต์ "รูป + ข้อความ + ลิงก์" ลงเพจ แล้วจดเวลาคอลัมน์ O กันโพสต์ซ้ำ

**ปิดอยู่เป็นค่าเริ่มต้น** จะไม่โพสต์จนกว่าจะตั้ง `FB_POST_ENABLED = yes`
**ห้ามส่งรหัสใดในแชต** (App Secret, โทเคน) วางในช่อง Script Properties เท่านั้น

## ขั้นที่ 1: วางโค้ด
1. Google Sheet → ส่วนขยาย → Apps Script → กด **+** ข้าง Files → Script → ตั้งชื่อ `facebook-post`
2. คัดลอกโค้ดจากลิงก์ raw ของ `docs/facebook-post.gs` มาวาง → บันทึก
3. เช็คว่ามีฟังก์ชัน `facebookExchangeToken` ในรายการฟังก์ชันแถบบน (ถ้าไม่มี แปลว่าวางไม่ครบ)

## ขั้นที่ 2: สร้างแอป Facebook
1. เข้า https://developers.facebook.com → **My Apps** → **Create App** (ถ้าถามให้สมัครนักพัฒนา ทำตามหน้าจอ)
2. ตั้งชื่อแอป เช่น `KHARAWA Poster` เลือกประเภท/Use case เป็น **Other** หรือ **Business** ตามที่มี แล้วสร้าง
3. เมนูซ้าย **App settings → Basic** จะเห็น **App ID** และ **App Secret** (กด Show)
4. ใน Apps Script → Project Settings (เฟือง) → Script Properties → เพิ่ม:
   - `FB_APP_ID` = App ID
   - `FB_APP_SECRET` = App Secret

## ขั้นที่ 3: หา Page ID และออกโทเคนชั่วคราว
1. เปิด https://developers.facebook.com/tools/explorer
2. ช่อง Meta App เลือกแอปที่สร้าง, User or Page เลือก **User Token**
3. ช่อง Permissions เพิ่ม `pages_show_list`, `pages_manage_posts`, `pages_read_engagement` → กด **Generate Access Token** → ล็อกอินและติ๊กเลือก **เพจ KHARAWA** ให้แอป
4. ช่องคำสั่งพิมพ์ `me/accounts` กด Submit จะเห็นรายชื่อเพจและ `id` ของเพจ
5. เพิ่มใน Script Properties:
   - `FB_PAGE_ID` = id ของเพจ
   - `FB_SHORT_USER_TOKEN` = โทเคนในช่อง Access Token ของ Explorer (โทเคนนี้หมดอายุเร็ว ทำขั้นต่อไปทันที)

## ขั้นที่ 4: แลกเป็นโทเคนเพจถาวร
1. เลือกฟังก์ชัน `facebookExchangeToken` → **Run** (อนุญาตสิทธิ์ครั้งแรก)
2. ดู Execution log ต้องขึ้น `OK: saved the Page token for "KHARAWA"` โทเคนชั่วคราวจะถูกลบเอง และระบบสร้าง `FB_PAGE_TOKEN` ให้ในช่อง Script Properties
3. เลือก `facebookCheckSetup` → Run ต้องขึ้น `OK: connected to Page ...`

## ขั้นที่ 5: ทดลองแล้วเปิดใช้
1. `facebookDryRun` → Run ดูข้อความที่ "จะโพสต์" (ยังไม่โพสต์จริง)
2. พอใจแล้ว เพิ่ม `FB_POST_ENABLED` = `yes` แล้ว Run `setupFacebookTrigger` หนึ่งครั้ง (ตรวจทุก 15 นาที)
3. หยุดได้โดยแก้เป็น `no`

## ที่ควรรู้
- ถ้าแอปยังเป็นโหมด Development ผู้ที่เป็นแอดมินเพจ/ผู้ดูแลแอปจะโพสต์ลงเพจของตัวเองได้ ปกติไม่ต้องส่งแอปให้ Meta ตรวจ
- ครั้งละไม่เกิน 2 โพสต์ ถ้ามีสินค้าเก่าที่ไม่อยากโพสต์ ให้พิมพ์อะไรก็ได้ในคอลัมน์ O ของแถวนั้นก่อนเปิด
- ถ้าเห็น error ใน Executions (เช่น permission) ส่งข้อความ error (ไม่ใช่รหัส) มาให้ผมดูได้
