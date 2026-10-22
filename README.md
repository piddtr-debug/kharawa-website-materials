# KHARAWA Website Materials

เอกสารและ asset สำหรับพัฒนาเว็บไซต์ KHARAWA ต่อ

เว็บไซต์ที่ตรวจพบปัจจุบัน: https://kharawa-8jhdxqn6.manus.space/

## ไฟล์

- `assets/KHARAWA-logo-new.png` — ภาพโลโก้ใหม่ที่ผู้ใช้ส่งมา ขนาด 1228×1281 px
- `docs/โลโก้ใหม่_วิธีนำไปใช้.md` — จุดที่ต้องเปลี่ยนในเว็บไซต์
- `site/index.html` — Landing Page หลักแบบ Static
- `site/styles.css` — ระบบสี, layout และ responsive design
- `site/script.js` — เมนูมือถือและ interaction เบื้องต้น
- Product Showcase พร้อมหน้าต่างรายละเอียดสินค้า
- Cart Drawer เพิ่ม/ลด/ลบสินค้าและบันทึกตะกร้าด้วย `localStorage`
- Language switcher `TH / EN` สำหรับเมนู ปุ่ม หัวข้อ สินค้า Product Modal, Cart และ Footer พร้อมจำค่าภาษาที่เลือก
- Pre-loved Consignment form สำหรับฝากขายสินค้ามือสอง พร้อมข้อมูลสินค้า สภาพ ราคา ช่องทางติดต่อ รายละเอียด และรูปภาพ
- `site/admin/consignments.html` — Admin Dashboard สำหรับค้นหา กรอง ดูรายละเอียด และเปลี่ยนสถานะรายการฝากขาย
- `docs/SUPABASE_STORAGE_SETUP.md` — คู่มือสร้าง Bucket และกำหนด Storage Policy สำหรับรูปฝากขาย

## ขอบเขตสำคัญ

Repository นี้ยัง **ไม่ใช่ source code เต็มของเว็บไซต์ที่เผยแพร่** เนื่องจาก source code ต้นฉบับยังไม่ได้ถูกส่งเข้ามาใน Sandbox ขณะจัดทำ repository

ชุดนี้เป็น Landing Page แบบ Static สำหรับนำไปพัฒนาต่อ ยังไม่มี database, authentication หรือระบบ order จริง ดังนั้นไม่ควรนำส่วน `/track` และ `/admin/pre-orders` ไปใช้งาน production โดยตรง

ตะกร้าสินค้าในเวอร์ชันนี้เป็น client-side prototype: สินค้ายังมีสถานะ `PRE-LAUNCH` และ `PRICE TBC` จึงยังไม่เปิด checkout จริง ปุ่ม `REQUEST PRE-ORDER` จะเปิดใช้งานเมื่อเชื่อมราคาจริง ฐานข้อมูล และระบบรับคำสั่งซื้อแล้ว

ฟอร์มฝากขายในเวอร์ชันนี้เป็น draft form: หลังส่งข้อมูลจะเก็บเฉพาะข้อมูลแบบร่างไว้ใน `localStorage` ของ Browser เครื่องนั้น ยังไม่ได้ส่งเข้าอีเมล, LINE, database หรือระบบหลังบ้านจริง จึงต้องเชื่อม submission endpoint ก่อนใช้งานรับฝากขายจริง

Admin Dashboard ปัจจุบันอ่านข้อมูลจาก `localStorage` ชุดเดียวกับฟอร์มฝากขาย จึงเหมาะสำหรับตรวจ flow และ UI เท่านั้น ยังไม่มี Authentication และยังไม่ใช่ระบบ production จนกว่าจะเชื่อม Supabase Server API และเพิ่มสิทธิ์ผู้ดูแล

## เมื่อมี source code

เปลี่ยนการอ้างอิงโลโก้เดิมทุกจุดเป็น:

```text
/assets/KHARAWA-logo-new.png
```

และตรวจอย่างน้อยที่ Header, Footer, Collection, favicon, Open Graph image และ JSON-LD/metadata หากมี

## เส้นทางที่ตรวจพบว่าต้องพัฒนาต่อ

- `/collection` — เปิดใช้งานแล้วบนเว็บไซต์ปัจจุบัน
- `/track` — ยังเป็น 404
- `/admin/pre-orders` — ยังเป็น 404

## ความปลอดภัย

ไม่รวม `.env`, API keys, passwords, tokens หรือข้อมูลลูกค้าใน repository นี้
