import { useQuery } from '@tanstack/react-query';
import { playerApi, historyApi } from '../lib/api';
import { calcRank, rankColor } from '../lib/rankCalc';

const STATS = [
  { key: 'handling', label: 'ハンドリング' },
  { key: 'physical', label: 'フィジカル' },
  { key: 'speed',    label: 'スピード' },
  { key: 'shooting', label: 'シュート' },
  { key: 'defense',  label: 'ディフェンス' },
  { key: 'passing',  label: 'パス' },
  { key: 'mental',   label: 'メンタル' },
] as const;

const STAT_LABELS: Record<string, string> = {
  handling: 'ハンドリング', physical: 'フィジカル', speed: 'スピード',
  shooting: 'シュート', defense: 'ディフェンス', passing: 'パス', mental: 'メンタル',
};

export default function Home() {
  const { data: player } = useQuery({ queryKey: ['player'], queryFn: playerApi.get });
  const { data: history = [] } = useQuery({ queryKey: ['history'], queryFn: historyApi.getAll });

  if (!player) return (
    <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>読み込み中...</div>
  );

  const approvedLogs = history.filter((h: any) => h.approved);
  const totalDays = approvedLogs.length;
  let streak = 0;
  let totalPts = 0;
  for (const log of approvedLogs) {
    const d = log.statsDelta as Record<string, number>;
    totalPts += Object.values(d).reduce((s: number, v) => s + (v as number), 0);
  }
  // 連続日数（簡易計算）
  const sortedDates = approvedLogs
    .map((l: any) => new Date(l.date).toDateString())
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    if (new Date(sortedDates[i]).toDateString() === expected.toDateString()) streak++;
    else break;
  }

  const todayLog = history.find((h: any) => {
    const d = new Date(h.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const recentApproved = approvedLogs.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8, gap: 6 }}>

      {/* パワプロカード */}
      <div style={{
        background: '#EAF4FD', border: '2px solid #88B8D8', borderRadius: 10,
        overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,40,0.3)', width: '100%', maxWidth: 980,
      }}>

        {/* タブ */}
        <div style={{ background: '#1A3080', display: 'flex', alignItems: 'flex-end', padding: '3px 4px 0', gap: 2, height: 32 }}>
          <div style={{ background: '#0C1E5A', color: '#88AAEE', fontSize: 10, fontWeight: 900, padding: '0 8px', height: 26, borderRadius: '4px 4px 0 0', border: '1px solid #2A44AA', borderBottom: 'none', display: 'flex', alignItems: 'center' }}>◀ L1</div>
          <div style={{ flex: 1, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, borderRadius: '4px 4px 0 0', border: '1px solid #77AACC', borderBottom: 'none', background: '#EAF4FD', color: '#111' }}>選手能力</div>
          <div style={{ flex: 1, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, borderRadius: '4px 4px 0 0', border: '1px solid #0A4466', borderBottom: 'none', background: '#072E44', color: '#55AACC' }}>プロフィール</div>
          <div style={{ background: '#0C1E5A', color: '#88AAEE', fontSize: 10, fontWeight: 900, padding: '0 8px', height: 26, borderRadius: '4px 4px 0 0', border: '1px solid #2A44AA', borderBottom: 'none', display: 'flex', alignItems: 'center' }}>R1 ▶</div>
        </div>

        {/* 選手名行 */}
        <div style={{ background: '#D8EEFA', borderBottom: '1px solid #99C4E0', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px' }}>
          <div style={{ background: '#33BB00', border: '2px solid #229900', borderRadius: 6, padding: '4px 14px', fontSize: 18, fontWeight: 900, color: '#fff', textShadow: '0 1px 3px rgba(0,80,0,0.5)', whiteSpace: 'nowrap' }}>
            {player.name}
          </div>
          <div style={{ width: 28, height: 20, border: '1px solid #AABBCC', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: '#fff' }}>🏀</div>
          <div style={{ background: '#fff', border: '1.5px solid #88AACC', borderRadius: 4, padding: '3px 12px', fontSize: 17, fontWeight: 900, color: '#111', minWidth: 44, textAlign: 'center' }}>
            {player.number}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ background: '#C8E4F4', border: '1px solid #88AACC', borderRadius: 3, padding: '1px 5px', fontSize: 10, fontWeight: 700, color: '#224466', marginRight: 2 }}>成　績</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#111', marginLeft: 6 }}>{player.gamesPlayed}</span><span style={{ fontSize: 10, color: '#446688' }}>試合</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#111', marginLeft: 6 }}>{player.totalPoints}</span><span style={{ fontSize: 10, color: '#446688' }}>点</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#111', marginLeft: 6 }}>{player.totalAssists}</span><span style={{ fontSize: 10, color: '#446688' }}>ast</span>
          </div>
        </div>

        {/* ポジション行 */}
        <div style={{ background: '#D8EEFA', borderBottom: '1px solid #99C4E0', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px' }}>
          <span style={{ background: '#C8E0F0', border: '1px solid #88AACC', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, color: '#224466', whiteSpace: 'nowrap' }}>ポジション</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#111' }}>{player.position}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 6 }}>
            <div style={{ background: 'linear-gradient(135deg,#FFE800,#FFAA00)', border: '1px solid #BB8800', borderRadius: 3, padding: '1px 7px', fontSize: 11, fontWeight: 900, color: '#2A1800' }}>
              ★{STATS.reduce((s, st) => s + (player[st.key] || 0), 0)}
            </div>
          </div>
          <div style={{ width: 58, height: 58, background: '#fff', border: '1px solid #AACCDD', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏀</div>
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>
              <span style={{ background: '#C8E0F0', border: '1px solid #88AACC', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 700, color: '#224466', marginRight: 3 }}>身長</span>
              {player.height} cm
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>
              <span style={{ background: '#C8E0F0', border: '1px solid #88AACC', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 700, color: '#224466', marginRight: 3 }}>体重</span>
              {player.weight} kg
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>
              <span style={{ background: '#C8E0F0', border: '1px solid #88AACC', borderRadius: 3, padding: '1px 6px', fontSize: 10, fontWeight: 700, color: '#224466', marginRight: 3 }}>スタイル</span>
              {player.playStyle}
            </div>
          </div>
        </div>

        {/* メインエリア */}
        <div style={{ display: 'flex' }}>

          {/* 左：ステータス */}
          <div style={{ flex: '0 0 auto', width: 188, background: '#EAF4FD', borderRight: '1px solid #99C4E0', padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', height: 32, gap: 6 }}>
              <div style={{ background: '#fff', border: '1px solid #AACCDD', borderRadius: 5, width: 72, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#446688', flexShrink: 0 }}>プレー</div>
              <span style={{ fontSize: 14, color: '#333', textAlign: 'right', paddingRight: 4, flex: 1 }}>{player.position}</span>
            </div>
            {STATS.map(({ key, label }) => {
              const val = player[key] || 0;
              const rank = calcRank(val);
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', height: 32, gap: 6 }}>
                  <div style={{ background: '#fff', border: '1px solid #AACCDD', borderRadius: 5, width: 72, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#446688', flexShrink: 0, letterSpacing: '-0.01em' }}>{label}</div>
                  <span style={{ fontSize: 24, fontWeight: 900, width: 28, textAlign: 'center', flexShrink: 0, lineHeight: 1, color: rankColor[rank] }}>{rank}</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#111', flex: 1, textAlign: 'right', paddingRight: 4 }}>{val}</span>
                </div>
              );
            })}
          </div>

          {/* 右：スキルエリア（スキルはSkills画面で管理、ここでは簡易表示） */}
          <SkillsPanel playerId={player.id} />
        </div>
      </div>

      {/* 下段3列 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', width: '100%', maxWidth: 980 }}>

        {/* 今日の練習状況 */}
        <div style={{ flex: 1, background: '#D8EEFA', border: '2px solid #88BBDD', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
          <div style={{ background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px' }}>📅 今日の練習状況</div>
          <div style={{ padding: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#335577', marginBottom: 5 }}>
              {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
            </div>
            {todayLog ? (
              <div style={{ background: '#fff', border: '1px solid #99BBDD', borderRadius: 7, padding: '8px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1A2A44', lineHeight: 1.5 }}>
                  {(todayLog.menus as any[]).map((m: any) => m.name).join('・')}
                </div>
                <div style={{ fontSize: 10, color: '#1A5A88', fontWeight: 700, marginTop: 2 }}>
                  → {Object.entries(todayLog.statsDelta as Record<string, number>).map(([k, v]) => `${STAT_LABELS[k]}+${v}`).join('　')}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 900, padding: '1px 8px', borderRadius: 8, background: todayLog.approved ? '#CCEECC' : todayLog.rejected ? '#FFCCCC' : '#FFEEAA', color: todayLog.approved ? '#115511' : todayLog.rejected ? '#AA1111' : '#775500' }}>
                    {todayLog.approved ? '承認済み ✓' : todayLog.rejected ? '却下' : '承認待ち'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: '#557799' }}>まだ練習を記録していません</div>
            )}
          </div>
        </div>

        {/* 最近の成長 */}
        <div style={{ flex: 1, background: '#D8EEFA', border: '2px solid #88BBDD', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
          <div style={{ background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px' }}>📈 最近の成長</div>
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {recentApproved.length === 0 ? (
              <div style={{ fontSize: 11, color: '#557799' }}>承認済みの練習記録がまだありません</div>
            ) : recentApproved.map((log: any) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ fontWeight: 700, color: '#335577' }}>
                  {new Date(log.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })} 承認済み
                </span>
                <span style={{ fontWeight: 900, color: '#1A5A88' }}>
                  {Object.entries(log.statsDelta as Record<string, number>).map(([k, v]) => `${STAT_LABELS[k]}+${v}`).join(' / ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 継続記録 */}
        <div style={{ flex: 1, background: '#D8EEFA', border: '2px solid #88BBDD', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
          <div style={{ background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px' }}>🔥 継続記録</div>
          <div style={{ padding: '6px 8px', display: 'flex', gap: 16, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#1A4A88' }}>{totalDays}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#557799' }}>累計練習日数</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#CC8800' }}>{streak}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#557799' }}>連続練習日数</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#228844' }}>{totalPts}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#557799' }}>累計加算ポイント</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SkillsPanel({ playerId }: { playerId: number }) {
  const { data: skills = [] } = useQuery({
    queryKey: ['skills', playerId],
    queryFn: async () => {
      const { skillsApi } = await import('../lib/api');
      return skillsApi.getAll();
    },
  });

  const empties = Math.max(0, 24 - skills.length);

  return (
    <div style={{ flex: 1, background: '#fff', padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, flex: 1 }}>
        {skills.map((sk: any) => (
          <div key={sk.id} style={{
            background: sk.isGold ? '#FFE050' : '#B8D4EA',
            border: `1px solid ${sk.isGold ? '#BBAA00' : '#88AACC'}`,
            borderRadius: 3, height: 28, padding: '0 4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: sk.isGold ? 900 : 700,
            color: sk.isGold ? '#3A2000' : '#112233', textAlign: 'center',
          }}>{sk.name}</div>
        ))}
        {Array.from({ length: empties }).map((_, i) => (
          <div key={`mt-${i}`} style={{ background: '#fff', border: '1px solid #AACCDD', borderRadius: 3, height: 28 }} />
        ))}
      </div>
    </div>
  );
}
