# KHARAWA Website Materials

เอกสารและ asset สำหรับพัฒนาเว็บไซต์ KHARAWA ต่อ

เว็บไซต์ที่ตรวจพบปัจจุบัน: https://kharawa-8jhdxqn6.manus.space/

## ไฟล์

- `assets/KHARAWA-logo-new.png` — ต้นฉบับโลโก้ใหม่ที่ผู้ใช้ส่งมา ขนาด 1228×1281 px (เก็บไว้เป็น master ไม่ใช้บนเว็บโดยตรง)
- `docs/โลโก้ใหม่_วิธีนำไปใช้.md` — จุดที่ต้องเปลี่ยนในเว็บไซต์
- `site/index.html` — Landing Page หลักแบบ Static
- `site/styles.css` — ระบบสี, layout และ responsive design
- `site/script.js` — เมนูมือถือและ interaction เบื้องต้น
- Product Showcase พร้อมหน้าต่างรายละเอียดสินค้า
- Cart Drawer เพิ่ม/ลด/ลบสินค้าและบันทึกตะกร้าด้วย `localStorage`
- Language switcher `TH / EN` สำหรับเมนู ปุ่ม หัวข้อ สินค้า Product Modal, Cart และ Footer พร้อมจำค่าภาษาที่เลือก
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

### ดีไซน์แนวหรูหรา (Luxury direction)

แนวคิด: "แกลเลอรีที่แขวนงานพิมพ์" ให้ภาพศิลป์ของแบรนด์เป็นพระเอก ส่วนหน้าเว็บเป็นกรอบเงียบๆ

- **ฟอนต์** (โหลดจาก Google Fonts ใน `index.html`): Bodoni Moda สำหรับหัวข้ออังกฤษ, Noto Serif Thai สำหรับหัวข้อและย่อหน้าไทย, Hanken Grotesk + Noto Sans Thai สำหรับข้อความทั่วไป
- **สี** (ตัวแปรใน `:root` ของ `styles.css`): ink `#0d0c0b`, bone `#ece3d1`, oxblood `#9a2019` (บนพื้นดำใช้ `#d6554b` เพื่อให้อ่านชัด)
- **ภาษาไทย** ใช้ระยะบรรทัดสูงกว่า ไม่ใช้ตัวเอียงสังเคราะห์ และลดตัวอักษรเว้นระยะ (ดูกฎ `html[lang="th"]` ใน `styles.css`)
- หัวข้ออังกฤษเขียนแบบ sentence case ทั้งในหน้าและใน `TRANSLATIONS.en` ของ `script.js` ต้องแก้ทั้งสองที่ให้ตรงกัน

### วิธีใส่รูปสินค้าจริง

การ์ดสินค้าตอนนี้ใช้ "แผ่นภาพ" ที่ตัดจากงานศิลป์ (`site/assets/plates/plate-1.jpg` ถึง `plate-5.jpg`) แทนรูปสินค้า รูปเดียวกันนี้ใช้ในหน้าต่างรายละเอียดและตะกร้าด้วย (กำหนดด้วยคลาส `.product-image-1` ถึง `-5` ใน `styles.css`)

เมื่อมีรูปสินค้าจริง วางไฟล์ใน `site/assets/products/` (แนะนำ WebP สัดส่วน 1:1.16) แล้วเพิ่ม `<img>` ในการ์ดนั้นใน `site/index.html`:

```html
<div class="product-image product-image-1 has-photo">
  <span>KH / FS-01</span>
  <img src="./assets/products/fs-01.webp" alt="เสื้อ First Press Tee ด้านหน้า" width="800" height="928" loading="lazy" />
</div>
```

รูปจะเติมเต็มกรอบและทับแผ่นภาพสำรอง `has-photo` ซ่อนกรอบเส้นบางบนรูป ส่วนรหัสสินค้า (`KH / FS-01`) ยังอยู่มุมซ้ายล่าง ถ้าจะให้หน้าต่างรายละเอียดและตะกร้าใช้รูปจริงด้วย ให้เปลี่ยน `background-image` ของคลาส `.product-image-1` ใน `styles.css` เป็นไฟล์รูปจริง

## ขอบเขตสำคัญ

Repository นี้ยัง **ไม่ใช่ source code เต็มของเว็บไซต์ที่เผยแพร่** เนื่องจาก source code ต้นฉบับยังไม่ได้ถูกส่งเข้ามาใน Sandbox ขณะจัดทำ repository

ชุดนี้เป็น Landing Page แบบ Static สำหรับนำไปพัฒนาต่อ ยังไม่มี database, authentication หรือระบบ order จริง ดังนั้นไม่ควรนำส่วน `/track` และ `/admin/pre-orders` ไปใช้งาน production โดยตรง

ตะกร้าสินค้าในเวอร์ชันนี้เป็น client-side prototype: สินค้ายังมีสถานะ `PRE-LAUNCH` และ `PRICE TBC` จึงยังไม่เปิด checkout จริง ปุ่ม `REQUEST PRE-ORDER` จะเปิดใช้งานเมื่อเชื่อมราคาจริง ฐานข้อมูล และระบบรับคำสั่งซื้อแล้ว

## เมื่อมี source code

เปลี่ยนการอ้างอิงโลโก้เดิมทุกจุดไปใช้ไฟล์ใน `site/assets/` (ไม่ใช้ `KHARAWA-logo-new.png` ตรงๆ)

และตรวจอย่างน้อยที่ Header, Footer, Collection, favicon, Open Graph image และ JSON-LD/metadata หากมี

## เส้นทางที่ตรวจพบว่าต้องพัฒนาต่อ

- `/collection` — เปิดใช้งานแล้วบนเว็บไซต์ปัจจุบัน
- `/track` — ยังเป็น 404
- `/admin/pre-orders` — ยังเป็น 404

## ความปลอดภัย

ไม่รวม `.env`, API keys, passwords, tokens หรือข้อมูลลูกค้าใน repository นี้
