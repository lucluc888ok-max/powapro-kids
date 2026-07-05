import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingApi, menuScheduleApi } from '../lib/api';

const CATEGORY_MAP: Record<string, string> = {
  handling: '🏀 ハンドリング系',
  shooting: '🎯 シュート系',
  speed:    '⚡ スピード系',
  defense:  '🛡️ ディフェンス系',
  passing:  '🤝 パス系',
  physical: '💪 フィジカル系',
  mental:   '🧠 メンタル系',
};

const STAT_JP: Record<string, string> = {
  handling: 'ハンドリング', physical: 'フィジカル', speed: 'スピード',
  shooting: 'シュート', defense: 'ディフェンス', passing: 'パス', mental: 'メンタル',
};

const DAY_KEYS = ['sunGroup','monGroup','tueGroup','wedGroup','thuGroup','friGroup','satGroup'] as const;

const sc = {
  card: { background: '#D8EEFA', border: '2px solid #88BBDD', borderRadius: 8, overflow: 'hidden' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' },
  head: { background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px' },
  body: { padding: 8 },
};

interface Menu {
  id: number; name: string; targetStat: string; deltaValue: number;
  isCoachMenu: boolean; menuGroup: string | null;
  detail: string | null; videos: string | null;
}

interface VideoLink { label: string; url: string; }

function parseVideos(raw: string | null): VideoLink[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function CoachMenuItem({ m, selected, onToggle }: { m: Menu; selected: boolean; onToggle: () => void }) {
  const videos = parseVideos(m.videos);
  return (
    <div
      onClick={onToggle}
      style={{
        background: selected ? '#BBDDFF' : '#EAF4FD',
        border: `1.5px solid ${selected ? '#3388BB' : '#88B8D8'}`,
        borderRadius: 7, padding: '8px 10px', cursor: 'pointer',
        marginBottom: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{
          flexShrink: 0, width: 20, height: 20, marginTop: 1,
          background: selected ? '#1A3A88' : '#EEF4FF',
          border: `1.5px solid ${selected ? '#1A3A88' : '#88AACC'}`,
          borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 900, color: selected ? '#fff' : '#1A3A88',
        }}>
          {selected ? '✓' : ''}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2A44' }}>{m.name}</span>
            <span style={{ background: '#AADDFF', color: '#1A3A88', border: '1px solid #66AADD', borderRadius: 8, padding: '1px 7px', fontSize: 9, fontWeight: 900, whiteSpace: 'nowrap' }}>
              {STAT_JP[m.targetStat]}+1
            </span>
          </div>
          {m.detail && (
            <div style={{ fontSize: 10, color: '#446688', marginTop: 2 }}>{m.detail}</div>
          )}
          {videos.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }} onClick={e => e.stopPropagation()}>
              {videos.map((v, i) => (
                <a key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 10, color: '#1A5A88', textDecoration: 'none',
                    border: '1.5px solid #88AACC', background: '#fff',
                    padding: '3px 9px', borderRadius: 20, fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ▶ {v.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SelfMenuItem({ m, selected, onToggle }: { m: Menu; selected: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      background: selected ? '#BBDDFF' : '#fff',
      border: `1px solid ${selected ? '#3388BB' : '#99BBDD'}`,
      borderRadius: 5, padding: '5px 8px',
      display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
    }}>
      <div style={{
        width: 18, height: 18, flexShrink: 0,
        background: selected ? '#1A3A88' : '#EEF4FF',
        border: `1.5px solid ${selected ? '#1A3A88' : '#88AACC'}`,
        borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 900, color: selected ? '#fff' : '#1A3A88',
      }}>
        {selected ? '✓' : ''}
      </div>
      <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#1A2A44' }}>{m.name}</span>
      <span style={{ background: '#AADDFF', color: '#1A3A88', border: '1px solid #66AADD', borderRadius: 8, padding: '1px 7px', fontSize: 9, fontWeight: 900 }}>
        {STAT_JP[m.targetStat]}+1
      </span>
    </div>
  );
}

export default function Training() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const { data: menus = [] } = useQuery<Menu[]>({ queryKey: ['menus'], queryFn: trainingApi.getMenus });
  const { data: schedule } = useQuery({ queryKey: ['menu-schedule'], queryFn: menuScheduleApi.get });

  const submit = useMutation({
    mutationFn: () => trainingApi.submitLog(Array.from(selected)),
    onSuccess: () => { setDone(true); setError(''); qc.invalidateQueries({ queryKey: ['history'] }); },
    onError: (e: any) => setError(e.response?.data?.error || 'エラーが発生しました'),
  });

  // 今日のグループを決定
  const todayDayIdx = new Date().getDay(); // 0=日〜6=土
  const todayGroup: string = schedule ? schedule[DAY_KEYS[todayDayIdx]] : 'A';
  const isNone = todayGroup === 'NONE';

  // メニュー分類
  const coachMenus = menus.filter(m =>
    m.isCoachMenu && !isNone &&
    (m.menuGroup === todayGroup || m.menuGroup === null)
  );
  const selfMenus = menus.filter(m => !m.isCoachMenu);

  const toggle = (id: number) => setSelected(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const grouped = selfMenus.reduce((acc: Record<string, Menu[]>, m) => {
    if (!acc[m.targetStat]) acc[m.targetStat] = [];
    acc[m.targetStat].push(m);
    return acc;
  }, {});

  const DAY_JP = ['日','月','火','水','木','金','土'];

  if (done) return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ ...sc.card, display: 'inline-block', padding: '24px 40px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📨</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#1A3A88', marginBottom: 8 }}>親に送りました！</div>
        <div style={{ fontSize: 12, color: '#557799' }}>承認されたらステータスが上がります</div>
        <button onClick={() => { setDone(false); setSelected(new Set()); }}
          style={{ marginTop: 16, background: '#1A3A88', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
          戻る
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, width: '100%', maxWidth: 980, margin: '0 auto' }}>

      {/* 左列：コーチメニュー */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={sc.card}>
          <div style={sc.head}>
            🏋️ 今週のコーチメニュー
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, opacity: 0.8 }}>
              {isNone ? '（本日はコーチメニューなし）' : `（${DAY_JP[todayDayIdx]}曜：メニュー${todayGroup}）`}
            </span>
          </div>
          <div style={sc.body}>
            {isNone ? (
              <div style={{ fontSize: 11, color: '#557799', padding: '8px 0' }}>
                今日はチーム練習日です。下の自主練メニューから選択できます。
              </div>
            ) : coachMenus.length === 0 ? (
              <div style={{ fontSize: 11, color: '#557799', padding: '8px 0' }}>読み込み中...</div>
            ) : (
              <>
                {/* グループ固有メニュー */}
                {coachMenus.filter(m => m.menuGroup !== null).length > 0 && (
                  <>
                    <div style={{ background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 3, marginBottom: 6 }}>
                      ハンドリング &amp; ドリブル（メニュー{todayGroup}）
                    </div>
                    {coachMenus.filter(m => m.menuGroup !== null).map(m => (
                      <CoachMenuItem key={m.id} m={m} selected={selected.has(m.id)} onToggle={() => toggle(m.id)} />
                    ))}
                  </>
                )}
                {/* 共通メニュー */}
                {coachMenus.filter(m => m.menuGroup === null).length > 0 && (
                  <>
                    <div style={{ background: 'linear-gradient(90deg,#886600,#AA8800)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 3, marginBottom: 6, marginTop: 8 }}>
                      アジリティ &amp; ジャンプ（共通）
                    </div>
                    {coachMenus.filter(m => m.menuGroup === null).map(m => (
                      <CoachMenuItem key={m.id} m={m} selected={selected.has(m.id)} onToggle={() => toggle(m.id)} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 右列：自主練メニュー＋送信 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={sc.card}>
          <div style={sc.head}>📅 自主練メニュー</div>
          <div style={sc.body}>
            {Object.entries(grouped).map(([stat, items]) => (
              <div key={stat}>
                <div style={{ background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 3, marginBottom: 4 }}>
                  {CATEGORY_MAP[stat]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                  {items.map(m => (
                    <SelfMenuItem key={m.id} m={m} selected={selected.has(m.id)} onToggle={() => toggle(m.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 送信エリア */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          {error && <div style={{ fontSize: 11, color: '#AA1111', fontWeight: 700 }}>{error}</div>}
          <div style={{ fontSize: 11, color: '#224466', fontWeight: 700 }}>{selected.size}つ選択中</div>
          <button
            onClick={() => selected.size > 0 && submit.mutate()}
            disabled={selected.size === 0 || submit.isPending}
            style={{
              width: '100%',
              background: selected.size > 0 ? 'linear-gradient(135deg,#CC2200,#AA1100)' : '#999',
              color: '#fff',
              border: `2px solid ${selected.size > 0 ? '#EE4422' : '#bbb'}`,
              borderRadius: 7, padding: 11, fontSize: 14, fontWeight: 900,
              fontFamily: 'inherit', cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {submit.isPending ? '送信中...' : '親に送る 📨'}
          </button>
        </div>
      </div>
    </div>
  );
}
