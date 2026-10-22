# คู่มือ Supabase Storage สำหรับรูปฝากขาย KHARAWA

เอกสารนี้ใช้ตั้งค่า Supabase Storage สำหรับรูปสินค้าที่ลูกค้าส่งผ่านฟอร์ม Pre-loved Consignment โดยออกแบบให้ bucket เป็นแบบ Private และให้ไฟล์ถูกควบคุมด้วย RLS ก่อนนำไปเชื่อมกับฟอร์มและ Admin Dashboard

## 1. สร้าง Bucket

1. เข้า Supabase Dashboard และเลือก Project ของ KHARAWA
2. เปิดเมนู **Storage**
3. เลือก **New bucket**
4. ตั้งชื่อเป็น `consignment-images` หรือชื่อเดียวกับค่าที่จะใส่ใน `SUPABASE_STORAGE_BUCKET`
5. ตั้ง **Public bucket = ปิด** เพื่อให้เป็น Private Bucket
6. ตั้ง **File size limit = 5 MB**
7. จำกัดชนิดไฟล์เป็น:
   - `image/jpeg`
   - `image/png`
   - `image/webp`
8. กด **Create bucket**

Supabase ระบุว่า Private Bucket เป็นค่าเริ่มต้น และการดาวน์โหลดต้องผ่าน RLS หรือ Signed URL ส่วน Public Bucket จะทำให้ผู้ที่มี URL สามารถเปิดไฟล์ได้โดยไม่ต้องผ่านการควบคุมการเข้าถึง ดังนั้นรูปฝากขายที่อาจมีข้อมูลส่วนตัวควรเริ่มจาก Private Bucket [1]

## 2. โครงสร้างไฟล์ที่แนะนำ

ใช้ path ที่แยกตามผู้ใช้และรายการ เช่น:

```text
<auth-user-id>/<submission-id>/<random-file-name>.webp
```

ตัวอย่าง:

```text
7d2...abc/consign-2026-0001/9f1c...a2.webp
```

ไม่ควรใช้ชื่อไฟล์เดิมของลูกค้าเป็น path หลัก เพราะชื่ออาจซ้ำ มีอักขระที่ไม่เหมาะสม หรือเปิดเผยข้อมูลส่วนตัว ควรสร้างชื่อไฟล์แบบสุ่มและไม่ overwrite ไฟล์เดิม

## 3. Policy สำหรับผู้ใช้ที่ล็อกอิน

ในตัวอย่างนี้ผู้ส่งต้องผ่าน Supabase Auth และระบบจะบังคับให้ผู้ใช้เขียนไฟล์ไว้ในโฟลเดอร์ที่ขึ้นต้นด้วย `auth.uid()` เท่านั้น

ไปที่ **SQL Editor** แล้วปรับชื่อ bucket ในตัวแปร `consignment-images` ให้ตรงกับ bucket จริง จากนั้นรัน SQL นี้:

```sql
create policy "consignment users can upload own images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'consignment-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "consignment users can read own images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'consignment-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "consignment users can update own images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'consignment-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'consignment-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "consignment users can delete own images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'consignment-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
```

Policy สำหรับอัปโหลดต้องมี `INSERT` เท่านั้นถ้าใช้การสร้างไฟล์ใหม่ ส่วนการใช้ `upsert` จะต้องมี `SELECT` และ `UPDATE` เพิ่มด้วย ตามเอกสาร Storage Access Control ของ Supabase [2]

## 4. Policy สำหรับ Admin

กำหนด role ของผู้ดูแลใน Supabase Auth `app_metadata` เป็น `admin` เช่น:

```json
{
  "role": "admin"
}
```

จากนั้นใช้ policy สำหรับดูและลบไฟล์ของรายการฝากขายทั้งหมด:

```sql
create policy "consignment admins can read all images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'consignment-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "consignment admins can delete images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'consignment-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
```

หลังตั้งค่าแล้วให้ทดสอบด้วยบัญชี Admin จริง ไม่ควรใช้ `service_role key` ใน Browser เพราะ service key จะ bypass RLS และ Supabase ระบุว่าไม่ควรเปิดเผยคีย์นี้ต่อสาธารณะ [2]

## 5. กรณีฟอร์มฝากขายเป็นสาธารณะ

ฟอร์ม KHARAWA ใน Repository ปัจจุบันยังเป็น Static Page และยังไม่มี Supabase Auth ดังนั้น **ไม่ควรเพิ่ม policy แบบนี้ใน Production**:

```sql
-- ไม่แนะนำสำหรับ Production
create policy "anyone can upload"
on storage.objects
for insert
to anon
with check (bucket_id = 'consignment-images');
```

แม้จะทำให้ลูกค้าอัปโหลดได้ทันที แต่ทุกคนสามารถยิงคำขออัปโหลดซ้ำ ๆ ได้ และยังไม่มีระบบผูกไฟล์กับรายการฝากขายหรือจำกัด abuse อย่างเหมาะสม

แนวทางที่แนะนำสำหรับฟอร์มสาธารณะคือ:

1. ฟอร์มส่งข้อมูลและไฟล์ไปยัง Supabase Edge Function
2. Edge Function ตรวจชนิดไฟล์ ขนาดไฟล์ และรูปแบบข้อมูล
3. ตรวจ rate limit หรือ CAPTCHA ก่อนรับไฟล์
4. สร้างชื่อไฟล์และ submission ID ฝั่ง Server
5. ใช้ `service_role key` เฉพาะใน Edge Function Secret ไม่ใส่ในหน้าเว็บ
6. อัปโหลดไฟล์เข้า Private Bucket
7. บันทึก path ของไฟล์ลงตาราง `consignments`
8. ส่งอีเมลแจ้งเตือนผ่าน Resend

## 6. การอัปโหลดผ่าน JavaScript เมื่อมี Auth แล้ว

Supabase แนะนำ Standard Upload สำหรับไฟล์ขนาดเล็ก โดยรูปของฟอร์มนี้จำกัดไว้ 5 MB ซึ่งเหมาะกับวิธีดังกล่าว [3]

```js
const filePath = `${user.id}/${submissionId}/${crypto.randomUUID()}.webp`;

const { data, error } = await supabase.storage
  .from('consignment-images')
  .upload(filePath, file, {
    contentType: file.type,
    upsert: false
  });

if (error) {
  throw error;
}

console.log(data.path);
```

ควรใช้ path ใหม่ทุกครั้งและตั้ง `upsert: false` เพื่อป้องกันการเขียนทับไฟล์เดิมและลดปัญหา cache ของ CDN ตามคำแนะนำของ Supabase [3]

## 7. ตรวจสอบการตั้งค่า

หลังสร้าง Bucket และ Policy ให้ตรวจตามรายการนี้:

- Bucket ชื่อถูกต้องตรงกับค่าที่เว็บไซต์จะใช้
- Bucket เป็น Private
- จำกัดขนาดไฟล์ไม่เกิน 5 MB
- จำกัด MIME type เป็น JPEG, PNG และ WebP
- ไม่มี policy ที่อนุญาต `anon` upload แบบกว้างทั้ง bucket
- ผู้ใช้ทั่วไปอัปโหลดได้เฉพาะโฟลเดอร์ของตนเอง
- Admin อ่านไฟล์ได้ผ่าน Auth และ role ที่กำหนด
- ไม่มี `service_role key` อยู่ใน HTML, JavaScript ฝั่ง Browser หรือ GitHub
- Admin Dashboard ใช้ Signed URL หรือ Edge Function เมื่อต้องแสดงรูปจาก Private Bucket

## 8. ค่าที่ต้องใช้ตอนเชื่อมเว็บไซต์

เก็บเป็น Secret หรือ Environment Variable เท่านั้น:

```text
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
SUPABASE_STORAGE_BUCKET=consignment-images
```

`SUPABASE_PUBLISHABLE_KEY` หรือ `anon key` ใช้ฝั่ง Browser ได้เมื่อ RLS ถูกตั้งค่าอย่างถูกต้อง ส่วน `service_role key` ต้องอยู่เฉพาะฝั่ง Server หรือ Edge Function เท่านั้น

## References

[1]: https://supabase.com/docs/guides/storage/buckets/fundamentals "Supabase Storage Buckets"
[2]: https://supabase.com/docs/guides/storage/security/access-control "Supabase Storage Access Control"
[3]: https://supabase.com/docs/guides/storage/uploads/standard-uploads "Supabase Standard Uploads"
[4]: https://supabase.com/docs/guides/storage/quickstart "Supabase Storage Quickstart"
