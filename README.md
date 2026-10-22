# KHARAWA Website Materials

เอกสารและ asset สำหรับพัฒนาเว็บไซต์ KHARAWA ต่อ

เว็บไซต์ที่ตรวจพบปัจจุบัน: https://kharawa-8jhdxqn6.manus.space/

## ไฟล์

- `assets/KHARAWA-logo-new.png` — ต้นฉบับโลโก้ใหม่ที่ผู้ใช้ส่งมา ขนาด 1228×1281 px (เก็บไว้เป็น master ไม่ใช้บนเว็บโดยตรง)
- `docs/โลโก้ใหม่_วิธีนำไปใช้.md` — จุดที่ต้องเปลี่ยนในเว็บไซต์
- `site/index.html` — Landing Page หลักแบบ Static
- `site/styles.css` — ระบบสี, layout และ responsive design
- `site/script.js` — เมนูมือถือและ interaction เบื้องต้น
- `site/assets/` — ไฟล์ภาพที่เว็บใช้จริง ตัดมาจากต้นฉบับโลโก้

### ไฟล์ใน `site/assets/`

ต้นฉบับโลโก้เป็นภาพแคปหน้าเว็บ มีแถบเทาขอบบน/ล่าง เมนู และข้อความ "FIELD EDITION 001" ติดอยู่ในภาพ จึงครอปออกก่อนนำมาใช้

| ไฟล์ | ใช้ที่ |
| --- | --- |
| `kharawa-art.webp` | ภาพ Hero (ครอปเป็น 1228×1060 ไม่มีเมนู/ป้ายติดมา) |
| `icon-192.png`, `icon-512.png` | โลโก้สี่เหลี่ยมใน Header, Footer และส่วน Contact |
| `favicon-32.png`, `apple-touch-icon.png` | favicon และไอคอนหน้าจอโฮมมือถือ |
| `og-image.jpg` | ภาพแชร์โซเชียล 1200×630 (ยังไม่ได้ใส่ใน `<meta>` ดูด้านล่าง) |

> `og:image` ต้องใช้ URL เต็ม (absolute) จึงยังไม่ได้เพิ่มแท็กใน `index.html` เมื่อรู้โดเมนจริงให้เพิ่ม
> `<meta property="og:image" content="https://<โดเมน>/assets/og-image.jpg" />`

เนื่องจาก workflow ปล่อยเฉพาะโฟลเดอร์ `site/` ไฟล์ภาพทุกไฟล์ที่เว็บอ้างอิงต้องอยู่ใน `site/` เท่านั้น (อย่าอ้าง `../assets/...`)

### วิธีใส่รูปสินค้าจริง

การ์ดสินค้าตอนนี้เป็นภาพสีสำรองพร้อมป้าย KHARAWA เมื่อมีรูปจริง ให้วางไฟล์ใน `site/assets/products/` (แนะนำ WebP สัดส่วนประมาณ 1:1.08) แล้วแก้ใน `site/index.html` เฉพาะการ์ดนั้น:

```html
<div class="product-image product-image-1 has-photo">
  <span>KH / FS-01</span>
  <img src="./assets/products/fs-01.webp" alt="เสื้อ First Press Tee ด้านหน้า" width="800" height="864" loading="lazy" />
</div>
```

`has-photo` ซ่อนป้ายสำรอง และรูปจะเติมเต็มกรอบอัตโนมัติ ส่วนป้ายรหัสสินค้า (`KH / FS-01`) ยังอยู่มุมซ้ายบน

## ขอบเขตสำคัญ

Repository นี้ยัง **ไม่ใช่ source code เต็มของเว็บไซต์ที่เผยแพร่** เนื่องจาก source code ต้นฉบับยังไม่ได้ถูกส่งเข้ามาใน Sandbox ขณะจัดทำ repository

ชุดนี้เป็น Landing Page แบบ Static สำหรับนำไปพัฒนาต่อ ยังไม่มี database, authentication หรือระบบ order จริง ดังนั้นไม่ควรนำส่วน `/track` และ `/admin/pre-orders` ไปใช้งาน production โดยตรง

## เมื่อมี source code

เปลี่ยนการอ้างอิงโลโก้เดิมทุกจุดไปใช้ไฟล์ใน `site/assets/` (ไม่ใช้ `KHARAWA-logo-new.png` ตรงๆ)

และตรวจอย่างน้อยที่ Header, Footer, Collection, favicon, Open Graph image และ JSON-LD/metadata หากมี

## เส้นทางที่ตรวจพบว่าต้องพัฒนาต่อ

- `/collection` — เปิดใช้งานแล้วบนเว็บไซต์ปัจจุบัน
- `/track` — ยังเป็น 404
- `/admin/pre-orders` — ยังเป็น 404

## ความปลอดภัย

ไม่รวม `.env`, API keys, passwords, tokens หรือข้อมูลลูกค้าใน repository นี้
