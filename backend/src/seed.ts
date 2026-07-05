import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const selfPracticeMenus = [
  { name: 'その場ドリブル（左右各1分）', targetStat: 'handling' },
  { name: '8の字ドリブル',              targetStat: 'handling' },
  { name: 'チェンジオブペース',          targetStat: 'handling' },
  { name: '股下ドリブル',               targetStat: 'handling' },
  { name: 'フリースロー20本',            targetStat: 'shooting' },
  { name: 'レイアップ左右20本',          targetStat: 'shooting' },
  { name: 'ミドルシュート10本',          targetStat: 'shooting' },
  { name: 'キャッチ&シュート',           targetStat: 'shooting' },
  { name: 'ラダートレーニング',          targetStat: 'speed' },
  { name: 'シャトルラン',               targetStat: 'speed' },
  { name: 'サイドステップ',             targetStat: 'speed' },
  { name: 'ダッシュ×10本',             targetStat: 'speed' },
  { name: 'ディフェンスフットワーク',    targetStat: 'defense' },
  { name: '1on1守備',                  targetStat: 'defense' },
  { name: 'ヘルプディフェンス練習',      targetStat: 'defense' },
  { name: '胸パス壁当て50回',           targetStat: 'passing' },
  { name: 'バウンズパス練習',           targetStat: 'passing' },
  { name: '2人組パス練習',              targetStat: 'passing' },
  { name: '腕立て伏せ20回',             targetStat: 'physical' },
  { name: 'スクワット30回',             targetStat: 'physical' },
  { name: '体幹トレーニング',            targetStat: 'physical' },
  { name: 'ジャンプ練習',               targetStat: 'physical' },
  { name: '試合参加',                   targetStat: 'mental' },
  { name: '自主練（自分で考えて実施）',  targetStat: 'mental' },
  { name: '目標設定・振り返りノート記入',targetStat: 'mental' },
];

const v = (arr: { label: string; url: string }[]) => JSON.stringify(arr);

const coachMenuA = [
  {
    name: 'ノルディックスクワット', targetStat: 'physical', menuGroup: 'A',
    detail: '15回 x 2セット',
    videos: v([
      { label: '解説', url: 'https://utage-system.com/video/zHL0Ab1bkjXc' },
      { label: '実演', url: 'https://utage-system.com/video/VEUGt9DQqciI' },
    ]),
  },
  {
    name: 'トリプルスレッド', targetStat: 'handling', menuGroup: 'A',
    detail: '20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/Dm00Nj02B1Tk' }]),
  },
  {
    name: 'フロントハンドリング', targetStat: 'handling', menuGroup: 'A',
    detail: '20秒 x 2セット',
    videos: v([
      { label: '解説', url: 'https://utage-system.com/video/YtFMe3acslcx' },
      { label: '実践', url: 'https://utage-system.com/video/fJlWPBBwom8k' },
    ]),
  },
  {
    name: '縦引き（左右）', targetStat: 'handling', menuGroup: 'A',
    detail: '20回 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/5qgPTZa1lXdp' }]),
  },
  {
    name: 'ポケットハンドリング（左右）', targetStat: 'handling', menuGroup: 'A',
    detail: '20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/zq5mWeJkxiD3' }]),
  },
  {
    name: '3ドリポケット（左右）', targetStat: 'handling', menuGroup: 'A',
    detail: '20回 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/eejiWeReBmUC' }]),
  },
  {
    name: 'セミサークルポケット（右）', targetStat: 'handling', menuGroup: 'A',
    detail: '20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/sgTSzCgB6YcN' }]),
  },
  {
    name: 'セミサークルポケット（左）', targetStat: 'handling', menuGroup: 'A',
    detail: '20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/kaqvMSDHBWrp' }]),
  },
  {
    name: 'ドリブルダッシュ', targetStat: 'speed', menuGroup: 'A',
    detail: '20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/8fEFdaswdgwv' }]),
  },
];

const coachMenuB = [
  {
    name: 'サイドキック', targetStat: 'speed', menuGroup: 'B',
    detail: '',
    videos: v([
      { label: '解説', url: 'https://utage-system.com/video/f29FSn3y8Rjv' },
      { label: '実践', url: 'https://utage-system.com/video/Bf67KGvTU3Zj' },
    ]),
  },
  {
    name: '4コーンクロス', targetStat: 'handling', menuGroup: 'B',
    detail: '',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/1DxcQoZjg8Ik' }]),
  },
  {
    name: 'トリプルスレッド（クロス）', targetStat: 'handling', menuGroup: 'B',
    detail: '',
    videos: v([{ label: '実践', url: 'https://utage-system.com/video/hxtmdo8eSg7i' }]),
  },
  {
    name: '2ドリからフロントチェンジ', targetStat: 'handling', menuGroup: 'B',
    detail: '各20秒',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/pKbrSn5XAM8u' }]),
  },
  {
    name: '片側スキップ', targetStat: 'speed', menuGroup: 'B',
    detail: '',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/PulrDL7XdBfu' }]),
  },
  {
    name: 'スキップダッシュドリブル', targetStat: 'speed', menuGroup: 'B',
    detail: '',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/jdU2qvWd7H2f' }]),
  },
  {
    name: '片側スキップポケットドリブル（右）', targetStat: 'handling', menuGroup: 'B',
    detail: '各20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/PLCR0QI2hdHH' }]),
  },
  {
    name: '片側スキップポケットドリブル（左）', targetStat: 'handling', menuGroup: 'B',
    detail: '各20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/7nZCIFSyGQKr' }]),
  },
  {
    name: '6コーンスキップドライブ', targetStat: 'speed', menuGroup: 'B',
    detail: '各20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/LEkFBO3ba5Ez' }]),
  },
];

const coachMenuCommon = [
  {
    name: '両足レジストジャンプ', targetStat: 'physical', menuGroup: null,
    detail: '20秒→15秒休憩→20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/rYglMUlfDjPY' }]),
  },
  {
    name: '片足レジストもも上げ（左右）', targetStat: 'physical', menuGroup: null,
    detail: '20秒→15秒休憩→20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/2c4xTdBseirf' }]),
  },
  {
    name: 'ウォール12ダッシュ', targetStat: 'speed', menuGroup: null,
    detail: '20秒→15秒休憩→20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/Zl8iuwsQKFXA' }]),
  },
  {
    name: 'もも上げダッシュ', targetStat: 'speed', menuGroup: null,
    detail: '20秒→15秒休憩→20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/X3fhC0cYB0Jh' }]),
  },
  {
    name: 'ハンズアップもも上げ', targetStat: 'speed', menuGroup: null,
    detail: '20秒→15秒休憩→20秒 x 2セット',
    videos: v([{ label: '動画', url: 'https://utage-system.com/video/n6XWqt27FeNF' }]),
  },
];

async function main() {
  // 自主練メニュー（既存25件）を再投入
  await prisma.trainingMenu.deleteMany({ where: { isCoachMenu: false } });
  await prisma.trainingMenu.createMany({
    data: selfPracticeMenus.map(m => ({ ...m, isCoachMenu: false })),
  });

  // コーチメニューを再投入
  await prisma.trainingMenu.deleteMany({ where: { isCoachMenu: true } });
  const coachData = [
    ...coachMenuA.map(m => ({ ...m, isCoachMenu: true })),
    ...coachMenuB.map(m => ({ ...m, isCoachMenu: true })),
    ...coachMenuCommon.map(m => ({ ...m, isCoachMenu: true })),
  ];
  await prisma.trainingMenu.createMany({ data: coachData });

  // MenuScheduleを初期化（既存があればスキップ）
  const existing = await prisma.menuSchedule.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.menuSchedule.create({ data: { id: 1 } });
    console.log('MenuSchedule を初期化しました');
  }

  console.log(`シード完了：自主練${selfPracticeMenus.length}件 / コーチA${coachMenuA.length}件 / コーチB${coachMenuB.length}件 / 共通${coachMenuCommon.length}件`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
