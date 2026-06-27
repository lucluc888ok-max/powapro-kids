import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingApi } from '../lib/api';

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

const sc = {
  card: { background: '#D8EEFA', border: '2px solid #88BBDD', borderRadius: 8, overflow: 'hidden' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' },
  head: { background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px' },
  body: { padding: 8 },
};

export default function Training() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const { data: menus = [] } = useQuery({ queryKey: ['menus'], queryFn: trainingApi.getMenus });

  const submit = useMutation({
    mutationFn: () => trainingApi.submitLog(Array.from(selected)),
    onSuccess: () => { setDone(true); setError(''); qc.invalidateQueries({ queryKey: ['history'] }); },
    onError: (e: any) => setError(e.response?.data?.error || 'エラーが発生しました'),
  });

  const grouped = menus.reduce((acc: Record<string, any[]>, m: any) => {
    if (!acc[m.targetStat]) acc[m.targetStat] = [];
    acc[m.targetStat].push(m);
    return acc;
  }, {});

  const toggle = (id: number) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  if (done) return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ ...sc.card, display: 'inline-block', padding: '24px 40px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📨</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#1A3A88', marginBottom: 8 }}>親に送りました！</div>
        <div style={{ fontSize: 12, color: '#557799' }}>承認されたらステータスが上がります</div>
        <button onClick={() => { setDone(false); setSelected(new Set()); }} style={{ marginTop: 16, background: '#1A3A88', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
          戻る
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, width: '100%', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={sc.card}>
          <div style={sc.head}>📅 {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}の練習記録</div>
          <div style={sc.body}>
            {Object.entries(grouped).slice(0, 4).map(([stat, items]) => (
              <div key={stat}>
                <div style={{ background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 3, marginBottom: 4 }}>
                  {CATEGORY_MAP[stat]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                  {(items as any[]).map((m: any) => {
                    const on = selected.has(m.id);
                    return (
                      <div key={m.id} onClick={() => toggle(m.id)} style={{ background: on ? '#BBDDFF' : '#fff', border: `1px solid ${on ? '#3388BB' : '#99BBDD'}`, borderRadius: 5, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                        <div style={{ width: 18, height: 18, background: on ? '#1A3A88' : '#EEF4FF', border: `1.5px solid ${on ? '#1A3A88' : '#88AACC'}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: on ? '#fff' : '#1A3A88', flexShrink: 0 }}>
                          {on ? '✓' : ''}
                        </div>
                        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#1A2A44' }}>{m.name}</span>
                        <span style={{ background: '#AADDFF', color: '#1A3A88', border: '1px solid #66AADD', borderRadius: 8, padding: '1px 7px', fontSize: 9, fontWeight: 900 }}>
                          {STAT_JP[m.targetStat]}+1
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={sc.card}>
          <div style={sc.body}>
            {Object.entries(grouped).slice(4).map(([stat, items]) => (
              <div key={stat}>
                <div style={{ background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 3, marginBottom: 4 }}>
                  {CATEGORY_MAP[stat]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                  {(items as any[]).map((m: any) => {
                    const on = selected.has(m.id);
                    return (
                      <div key={m.id} onClick={() => toggle(m.id)} style={{ background: on ? '#BBDDFF' : '#fff', border: `1px solid ${on ? '#3388BB' : '#99BBDD'}`, borderRadius: 5, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                        <div style={{ width: 18, height: 18, background: on ? '#1A3A88' : '#EEF4FF', border: `1.5px solid ${on ? '#1A3A88' : '#88AACC'}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: on ? '#fff' : '#1A3A88', flexShrink: 0 }}>
                          {on ? '✓' : ''}
                        </div>
                        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#1A2A44' }}>{m.name}</span>
                        <span style={{ background: '#AADDFF', color: '#1A3A88', border: '1px solid #66AADD', borderRadius: 8, padding: '1px 7px', fontSize: 9, fontWeight: 900 }}>
                          {STAT_JP[m.targetStat]}+1
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
          {error && <div style={{ fontSize: 11, color: '#AA1111', fontWeight: 700 }}>{error}</div>}
          <div style={{ fontSize: 11, color: '#224466', fontWeight: 700 }}>{selected.size}つ選択中</div>
          <button
            onClick={() => selected.size > 0 && submit.mutate()}
            disabled={selected.size === 0 || submit.isPending}
            style={{ width: '100%', background: selected.size > 0 ? 'linear-gradient(135deg,#CC2200,#AA1100)' : '#999', color: '#fff', border: `2px solid ${selected.size > 0 ? '#EE4422' : '#bbb'}`, borderRadius: 7, padding: 11, fontSize: 14, fontWeight: 900, fontFamily: 'inherit', cursor: selected.size > 0 ? 'pointer' : 'not-allowed' }}
          >
            {submit.isPending ? '送信中...' : '親に送る 📨'}
          </button>
        </div>
      </div>
    </div>
  );
}
