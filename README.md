# Conveyor Lubrication Dashboard

Dashboard แสดงอัตราการใช้น้ำมันและจาระบีในระบบสายพานลำเลียง

## วิธีใช้งาน
1. อัปโหลดไฟล์ทั้งหมดขึ้น GitHub Repository
2. เปิด Settings > Pages
3. เลือก Branch: main และ Folder: /root
4. กด Save
5. รอ GitHub สร้าง URL สำหรับเปิด Dashboard

## การแก้ข้อมูล
แก้ข้อมูลจริงในไฟล์ `data.js`

ตัวอย่าง:
```js
{
  date: "2026-06-01",
  month: "2026-06",
  system: "BW2200 ST4000",
  equipment: "Gearbox 1500 kW",
  point: "Drive Unit",
  type: "Oil",
  lubricant: "Shell Omala S GX220",
  unit: "L",
  qty: 50,
  stock: 450,
  plan: 40
}
```
