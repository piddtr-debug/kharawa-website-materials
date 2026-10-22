# KHARAWA Website Materials

เอกสารและ asset สำหรับพัฒนาเว็บไซต์ KHARAWA ต่อ

เว็บไซต์ที่ตรวจพบปัจจุบัน: https://kharawa-8jhdxqn6.manus.space/

## ไฟล์

- `assets/KHARAWA-logo-new.png` — ภาพโลโก้ใหม่ที่ผู้ใช้ส่งมา ขนาด 1228×1281 px
- `docs/โลโก้ใหม่_วิธีนำไปใช้.md` — จุดที่ต้องเปลี่ยนในเว็บไซต์
- `site/index.html` — Landing Page หลักแบบ Static
- `site/styles.css` — ระบบสี, layout และ responsive design
- `site/script.js` — เมนูมือถือและ interaction เบื้องต้น

## ขอบเขตสำคัญ

Repository นี้ยัง **ไม่ใช่ source code เต็มของเว็บไซต์ที่เผยแพร่** เนื่องจาก source code ต้นฉบับยังไม่ได้ถูกส่งเข้ามาใน Sandbox ขณะจัดทำ repository

ชุดนี้เป็น Landing Page แบบ Static สำหรับนำไปพัฒนาต่อ ยังไม่มี database, authentication หรือระบบ order จริง ดังนั้นไม่ควรนำส่วน `/track` และ `/admin/pre-orders` ไปใช้งาน production โดยตรง

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
