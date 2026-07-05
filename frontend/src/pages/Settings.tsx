import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerApi, menuScheduleApi } from '../lib/api';

const sc = {
  card: { border: '1.5px solid #99BBDD', borderRadius: 8, overflow: 'hidden' as const, marginBottom: 6 },
  head: { background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 11, fontWeight: 900, padding: '4px 10px' },
  row: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, padding: '8px 10px', borderBottom: '1px solid rgba(120,170,200,0.3)', background: '#E8F4FA' },
  label: { fontSize: 12, fontWeight: 700, color: '#224466' },
  input: { background: '#E4F4FF', border: '1px solid #88AACC', borderRadius: 4, padding: '3px 7px', fontSize: 12, fontWeight: 700, color: '#111', fontFamily: 'inherit' as const, textAlign: 'right' as const, width: 110 },
};

export default function Settings() {
  const qc = useQueryClient();
  const { data: player } = useQuery({ queryKey: ['player'], queryFn: playerApi.get });

  const [form, setForm] = useState({ name: '', number: 7, position: 'ガード', playStyle: 'ドリブラー', height: 148, weight: 38 });
  const [stats, setStats] = useState({ gamesPlayed: 0, totalPoints: 0, totalAssists: 0 });
  const [saved, setSaved] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    if (player) {
      setForm({ name: player.name, number: player.number, position: player.position, playStyle: player.playStyle, height: player.height, weight: player.weight });
      setStats({ gamesPlayed: player.gamesPlayed, totalPoints: player.totalPoints, totalAssists: player.totalAssists });
    }
  }, [player]);

  const updateProfile = useMutation({
    mutationFn: () => playerApi.update(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['player'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: () => setSaved(false),
  });

  const updateStats = useMutation({
    mutationFn: () => playerApi.updateStats(stats),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['player'] });
      setStatsSaved(true);
      setStatsError('');
      setTimeout(() => setStatsSaved(false), 2000);
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || '';
      setStatsError(msg.includes('認証') || e.response?.status === 401
        ? '承認ページで親ログインが必要です'
        : 'エラーが発生しました');
    },
  });

  const positions = ['ガード', 'フォワード', 'センター'];
  const styles = ['ドリブラー', 'シューター', 'ポイントゲッター', 'オールラウンダー'];

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, width: '100%', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', margin: '3px 0 2px' }}>👤 プロフィール</div>
        <div style={sc.card}>
          <div style={sc.head}>選手情報</div>
          <div style={{ ...sc.row }}>
            <span style={sc.label}>選手名</span>
            <input style={sc.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={{ ...sc.row }}>
            <span style={sc.label}>背番号</span>
            <input style={{ ...sc.input, width: 70 }} type="number" value={form.number} onChange={e => setForm(p => ({ ...p, number: +e.target.value }))} />
          </div>
          <div style={{ ...sc.row }}>
            <span style={sc.label}>ポジション</span>
            <select style={{ ...sc.input, width: 120 }} value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}>
              {positions.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ ...sc.row }}>
            <span style={sc.label}>プレースタイル</span>
            <select style={{ ...sc.input, width: 140 }} value={form.playStyle} onChange={e => setForm(p => ({ ...p, playStyle: e.target.value }))}>
              {styles.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ ...sc.row }}>
            <span style={sc.label}>身長</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input style={{ ...sc.input, width: 70 }} type="number" value={form.height} onChange={e => setForm(p => ({ ...p, height: +e.target.value }))} />
              <span style={{ fontSize: 12, color: '#446688' }}>cm</span>
            </div>
          </div>
          <div style={{ ...sc.row, borderBottom: 'none' }}>
            <span style={sc.label}>体重</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input style={{ ...sc.input, width: 70 }} type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: +e.target.value }))} />
              <span style={{ fontSize: 12, color: '#446688' }}>kg</span>
            </div>
          </div>
        </div>
        <button onClick={() => updateProfile.mutate()} style={{ width: '100%', background: 'linear-gradient(135deg,#1A3A88,#2A5AAA)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer', marginBottom: 6 }}>
          {saved ? '保存しました ✓' : 'プロフィールを保存'}
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', margin: '3px 0 2px' }}>📊 成績</div>
        <div style={sc.card}>
          <div style={sc.head}>試合成績</div>
          <div style={sc.row}>
            <span style={sc.label}>出場試合数</span>
            <input style={{ ...sc.input, width: 70 }} type="number" value={stats.gamesPlayed} onChange={e => setStats(p => ({ ...p, gamesPlayed: +e.target.value }))} />
          </div>
          <div style={sc.row}>
            <span style={sc.label}>総得点</span>
            <input style={{ ...sc.input, width: 70 }} type="number" value={stats.totalPoints} onChange={e => setStats(p => ({ ...p, totalPoints: +e.target.value }))} />
          </div>
          <div style={{ ...sc.row, borderBottom: 'none' }}>
            <span style={sc.label}>総アシスト</span>
            <input style={{ ...sc.input, width: 70 }} type="number" value={stats.totalAssists} onChange={e => setStats(p => ({ ...p, totalAssists: +e.target.value }))} />
          </div>
        </div>
        {statsError && <div style={{ fontSize: 11, color: '#AA1111', fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>{statsError}</div>}
        <button onClick={() => updateStats.mutate()} style={{ width: '100%', background: 'linear-gradient(135deg,#1A3A88,#2A5AAA)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer', marginBottom: 6 }}>
          {statsSaved ? '保存しました ✓' : '成績を保存'}
        </button>

        <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', margin: '3px 0 2px' }}>🔐 セキュリティ</div>
        <div style={sc.card}>
          <div style={sc.head}>認証設定</div>
          <div style={{ ...sc.row, borderBottom: 'none' }}>
            <span style={sc.label}>親パスワード</span>
            <span style={{ fontSize: 12, color: '#888' }}>Railway環境変数で設定</span>
          </div>
        </div>

        <MenuScheduleSection />
      </div>
    </div>
  );
}

const DAY_ENTRIES = [
  { key: 'monGroup' as const, label: '月', code: 'MON' },
  { key: 'tueGroup' as const, label: '火', code: 'TUE' },
  { key: 'wedGroup' as const, label: '水', code: 'WED' },
  { key: 'thuGroup' as const, label: '木', code: 'THU' },
  { key: 'friGroup' as const, label: '金', code: 'FRI' },
  { key: 'satGroup' as const, label: '土', code: 'SAT' },
  { key: 'sunGroup' as const, label: '日', code: 'SUN' },
];
type GroupValue = 'A' | 'B';

function MenuScheduleSection() {
  const qc = useQueryClient();
  const { data: schedule } = useQuery({ queryKey: ['menu-schedule'], queryFn: menuScheduleApi.get });
  const [form, setForm] = useState<Record<string, GroupValue>>({
    monGroup: 'A', tueGroup: 'B', wedGroup: 'A',
    thuGroup: 'B', friGroup: 'A', satGroup: 'A', sunGroup: 'B',
  });
  const [teamDays, setTeamDays] = useState<string[]>(['MON','SAT','SUN']);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schedule) {
      setForm({
        monGroup: schedule.monGroup, tueGroup: schedule.tueGroup,
        wedGroup: schedule.wedGroup, thuGroup: schedule.thuGroup,
        friGroup: schedule.friGroup, satGroup: schedule.satGroup,
        sunGroup: schedule.sunGroup,
      });
      setTeamDays(schedule.teamDays ? schedule.teamDays.split(',') : ['MON','SAT','SUN']);
    }
  }, [schedule]);

  const update = useMutation({
    mutationFn: () => menuScheduleApi.update({ ...form, teamDays: teamDays.join(',') }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-schedule'] });
      setSaved(true); setError('');
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e: any) => {
      setError(e.response?.data?.error || '承認ページで親ログインが必要です');
    },
  });

  const toggleTeamDay = (code: string) => {
    setTeamDays(prev =>
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    );
  };

  const sc2 = {
    card: { border: '1.5px solid #99BBDD', borderRadius: 8, overflow: 'hidden' as const, marginBottom: 6 },
    head: { background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 11, fontWeight: 900, padding: '4px 10px' },
  };

  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', margin: '10px 0 2px' }}>📅 週間メニュー設定</div>
      <div style={sc2.card}>
        <div style={sc2.head}>曜日ごとのメニュー（親JWT必須）</div>
        <div style={{ background: '#E8F4FA', padding: '8px 10px' }}>

          {/* A/B 割当 */}
          <div style={{ fontSize: 10, fontWeight: 700, color: '#446688', marginBottom: 4 }}>コーチメニュー A/B</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 10 }}>
            {DAY_ENTRIES.map(({ key, label }) => (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#446688', marginBottom: 3 }}>{label}</div>
                {(['A','B'] as GroupValue[]).map(opt => (
                  <div key={opt} onClick={() => setForm(p => ({ ...p, [key]: opt }))}
                    style={{
                      background: form[key] === opt ? (opt === 'A' ? '#1A3A88' : '#116633') : '#fff',
                      color: form[key] === opt ? '#fff' : '#446688',
                      border: '1px solid #88AACC', borderRadius: 4,
                      fontSize: 10, fontWeight: 900, padding: '3px 0',
                      textAlign: 'center' as const, cursor: 'pointer', marginBottom: 2,
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* チーム練習日 */}
          <div style={{ fontSize: 10, fontWeight: 700, color: '#446688', marginBottom: 4 }}>チーム練習日（参加トグルを表示する曜日）</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 10 }}>
            {DAY_ENTRIES.map(({ label, code }) => {
              const active = teamDays.includes(code);
              return (
                <div key={code} onClick={() => toggleTeamDay(code)}
                  style={{
                    textAlign: 'center' as const, cursor: 'pointer',
                    background: active ? '#1A3A88' : '#fff',
                    color: active ? '#fff' : '#446688',
                    border: '1px solid #88AACC', borderRadius: 4,
                    fontSize: 10, fontWeight: 900, padding: '4px 0',
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: '#557799', marginBottom: 8 }}>
            A=コーチメニュー①　B=コーチメニュー②　チーム練習日=その日にチーム練習参加トグルを表示
          </div>

          {error && <div style={{ fontSize: 11, color: '#AA1111', fontWeight: 700, marginBottom: 4 }}>{error}</div>}
          <button onClick={() => update.mutate()}
            style={{ width: '100%', background: 'linear-gradient(135deg,#1A3A88,#2A5AAA)', color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontSize: 12, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' }}>
            {saved ? '保存しました ✓' : '週間設定を保存'}
          </button>
        </div>
      </div>
    </>
  );
}
