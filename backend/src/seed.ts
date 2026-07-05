import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

const teamMenus = [
  { name: 'チーム練習(シュート)',       targetStat: 'shooting', deltaValue: 5, menuGroup: 'TEAM' },
  { name: 'チーム練習(パス)',           targetStat: 'passing',  deltaValue: 5, menuGroup: 'TEAM' },
  { name: 'チーム練習(ディフェンス)',   targetStat: 'defense',  deltaValue: 5, menuGroup: 'TEAM' },
  { name: 'チーム練習(メンタル)',       targetStat: 'mental',   deltaValue: 5, menuGroup: 'TEAM' },
];

async function main() {
  // 自主練メニュー（既存）を非表示化（履歴保全のため削除しない）
  await prisma.trainingMenu.updateMany({
    where: { isCoachMenu: false, menuGroup: null },
    data: { isActive: false },
  });

  // コーチメニュー（A/B/共通/TEAM）を全削除して再投入
  await prisma.trainingMenu.deleteMany({ where: { isCoachMenu: true } });
  await prisma.trainingMenu.createMany({
    data: [
      ...coachMenuA.map(m => ({ ...m, isCoachMenu: true })),
      ...coachMenuB.map(m => ({ ...m, isCoachMenu: true })),
      ...coachMenuCommon.map(m => ({ ...m, isCoachMenu: true })),
      ...teamMenus.map(m => ({ ...m, isCoachMenu: true, isActive: true })),
    ],
  });

  // MenuSchedule を upsert（teamDays を含む）
  await prisma.menuSchedule.upsert({
    where: { id: 1 },
    create: { id: 1, teamDays: 'MON,SAT,SUN' },
    update: { teamDays: 'MON,SAT,SUN' },
  });

  console.log(`シード完了：コーチA${coachMenuA.length}件 / コーチB${coachMenuB.length}件 / 共通${coachMenuCommon.length}件 / TEAM${teamMenus.length}件`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
