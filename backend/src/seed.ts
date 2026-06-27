import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const menus = [
  { name: 'その場ドリブル（左右各1分）', targetStat: 'handling' },
  { name: '8の字ドリブル', targetStat: 'handling' },
  { name: 'チェンジオブペース', targetStat: 'handling' },
  { name: '股下ドリブル', targetStat: 'handling' },
  { name: 'フリースロー20本', targetStat: 'shooting' },
  { name: 'レイアップ左右20本', targetStat: 'shooting' },
  { name: 'ミドルシュート10本', targetStat: 'shooting' },
  { name: 'キャッチ&シュート', targetStat: 'shooting' },
  { name: 'ラダートレーニング', targetStat: 'speed' },
  { name: 'シャトルラン', targetStat: 'speed' },
  { name: 'サイドステップ', targetStat: 'speed' },
  { name: 'ダッシュ×10本', targetStat: 'speed' },
  { name: 'ディフェンスフットワーク', targetStat: 'defense' },
  { name: '1on1守備', targetStat: 'defense' },
  { name: 'ヘルプディフェンス練習', targetStat: 'defense' },
  { name: '胸パス壁当て50回', targetStat: 'passing' },
  { name: 'バウンズパス練習', targetStat: 'passing' },
  { name: '2人組パス練習', targetStat: 'passing' },
  { name: '腕立て伏せ20回', targetStat: 'physical' },
  { name: 'スクワット30回', targetStat: 'physical' },
  { name: '体幹トレーニング', targetStat: 'physical' },
  { name: 'ジャンプ練習', targetStat: 'physical' },
  { name: '試合参加', targetStat: 'mental' },
  { name: '自主練（自分で考えて実施）', targetStat: 'mental' },
  { name: '目標設定・振り返りノート記入', targetStat: 'mental' },
];

async function main() {
  await prisma.trainingMenu.deleteMany();
  await prisma.trainingMenu.createMany({ data: menus });
  console.log('シード完了：', menus.length, '件のメニューを投入しました');
}

main().catch(console.error).finally(() => prisma.$disconnect());
