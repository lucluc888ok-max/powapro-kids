import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingApi, menuScheduleApi } from '../lib/api';

const STAT_JP: Record<string, string> = {
  handling: 'ハンドリング', physical: 'フィジカル', speed: 'スピード',
  shooting: 'シュート', defense: 'ディフェンス', passing: 'パス', mental: 'メンタル',
};

const DAY_KEYS = ['sunGroup','monGroup','tueGroup','wedGroup','thuGroup','friGroup','satGroup'] as const;
const DAY_CODES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const DAY_JP    = ['日','月','火','水','木','金','土'];

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
            {m.detail && (
              <span style={{ fontSize: 10, color: '#557799', whiteSpace: 'nowrap' }}>{m.detail}</span>
            )}
          </div>
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

export default function Training() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [teamParticipated, setTeamParticipated] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const { data: menus = [] } = useQuery<Menu[]>({ queryKey: ['menus'], queryFn: trainingApi.getMenus });
  const { data: schedule } = useQuery({ queryKey: ['menu-schedule'], queryFn: menuScheduleApi.get });

  const todayDayIdx = new Date().getDay();
  const todayGroup: string = schedule ? schedule[DAY_KEYS[todayDayIdx]] : 'A';
  const teamDaysList: string[] = schedule?.teamDays ? schedule.teamDays.split(',') : ['MON','SAT','SUN'];
  const isTeamDay = teamDaysList.includes(DAY_CODES[todayDayIdx]);

  const coachMenus = menus.filter(m =>
    m.isCoachMenu && m.menuGroup !== 'TEAM' &&
    (m.menuGroup === todayGroup || m.menuGroup === null)
  );
  const teamMenus = menus.filter(m => m.menuGroup === 'TEAM');

  const submit = useMutation({
    mutationFn: () => {
      const ids = [
        ...Array.from(selected),
        ...(teamParticipated ? teamMenus.map(m => m.id) : []),
      ];
      return trainingApi.submitLog(ids);
    },
    onSuccess: () => { setDone(true); setError(''); qc.invalidateQueries({ queryKey: ['history'] }); },
    onError: (e: any) => setError(e.response?.data?.error || 'エラーが発生しました'),
  });

  const toggle = (id: number) => setSelected(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const totalSelected = selected.size + (teamParticipated ? 1 : 0);
  const canSubmit = selected.size > 0 || teamParticipated;

  if (done) return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ ...sc.card, display: 'inline-block', padding: '24px 40px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📨</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#1A3A88', marginBottom: 8 }}>親に送りました！</div>
        <div style={{ fontSize: 12, color: '#557799' }}>承認されたらステータスが上がります</div>
        <button onClick={() => { setDone(false); setSelected(new Set()); setTeamParticipated(false); }}
          style={{ marginTop: 16, background: '#1A3A88', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
          戻る
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, width: '100%', maxWidth: 980, margin: '0 auto' }}>

      {/* 左列：コーチメニュー */}
      <div style={{ flex: 2, minWidth: 0 }}>
        <div style={sc.card}>
          <div style={{ ...sc.head, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              🏋️ コーチメニュー
              <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, opacity: 0.8 }}>
                （{DAY_JP[todayDayIdx]}曜：メニュー{todayGroup}）
              </span>
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setSelected(new Set(coachMenus.map(m => m.id)))}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}
              >全選択</button>
              <button
                onClick={() => setSelected(new Set())}
                style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}
              >解除</button>
            </div>
          </div>
          <div style={sc.body}>
            {coachMenus.length === 0 ? (
              <div style={{ fontSize: 11, color: '#557799', padding: '8px 0' }}>読み込み中...</div>
            ) : (
              <>
                {coachMenus.filter(m => m.menuGroup !== null).length > 0 && (
                  <>
                    <div style={{ background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 3, marginBottom: 6 }}>
                      メニュー{todayGroup}
                    </div>
                    {coachMenus.filter(m => m.menuGroup !== null).map(m => (
                      <CoachMenuItem key={m.id} m={m} selected={selected.has(m.id)} onToggle={() => toggle(m.id)} />
                    ))}
                  </>
                )}
                {coachMenus.filter(m => m.menuGroup === null).length > 0 && (
                  <>
                    <div style={{ background: 'linear-gradient(90deg,#886600,#AA8800)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 3, marginBottom: 6, marginTop: 8 }}>
                      共通パート
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

      {/* 右列：チーム練習 ＋ 送信 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {isTeamDay && (
          <div style={sc.card}>
            <div style={sc.head}>🏀 チーム練習</div>
            <div style={{ padding: '12px 10px' }}>
              <div style={{ fontSize: 11, color: '#446688', marginBottom: 6 }}>
                今日（{DAY_JP[todayDayIdx]}）はチーム練習日
              </div>
              <div style={{ fontSize: 10, color: '#668899', marginBottom: 10 }}>
                参加した場合はONにする<br />
                <span style={{ color: '#2266AA' }}>シュート・パス・DF・メンタル +5</span>
              </div>
              <button
                onClick={() => setTeamParticipated(p => !p)}
                style={{
                  width: '100%',
                  background: teamParticipated
                    ? 'linear-gradient(135deg,#116633,#22AA55)'
                    : '#E8F4FA',
                  color: teamParticipated ? '#fff' : '#446688',
                  border: `2px solid ${teamParticipated ? '#22AA55' : '#88AACC'}`,
                  borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 900,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {teamParticipated ? '✓ 参加した' : 'チーム練習に参加した'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          {error && <div style={{ fontSize: 11, color: '#AA1111', fontWeight: 700 }}>{error}</div>}
          <div style={{ fontSize: 11, color: '#224466', fontWeight: 700 }}>
            {selected.size}種目チェック{teamParticipated ? '＋チーム練習' : ''}
          </div>
          <button
            onClick={() => canSubmit && submit.mutate()}
            disabled={!canSubmit || submit.isPending}
            style={{
              width: '100%',
              background: canSubmit ? 'linear-gradient(135deg,#CC2200,#AA1100)' : '#999',
              color: '#fff',
              border: `2px solid ${canSubmit ? '#EE4422' : '#bbb'}`,
              borderRadius: 7, padding: 11, fontSize: 14, fontWeight: 900,
              fontFamily: 'inherit', cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {submit.isPending ? '送信中...' : '親に送る 📨'}
          </button>
        </div>
      </div>
    </div>
  );
}
