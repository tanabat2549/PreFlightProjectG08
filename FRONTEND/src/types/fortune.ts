export interface Fortune {
  id: number;
  number: number;          // เลขใบเซียมซี (1-17)
  title: string;           // หัวข้อ เช่น "ใบที่ ๑ มหาโชคโภคทรัพย์"
  workFortune: string;     // คำทำนายการงาน
  loveFortune: string;     // คำทำนายความรัก
  moneyFortune: string;    // คำทำนายการเงิน
  studyFortune: string;    // คำทำนายการเรียน
  healthFortune: string;   // คำทำนายสุขภาพ
}