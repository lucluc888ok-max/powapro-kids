import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../lib/api';

const STAT_JP: Record<string, string> = {
  handling: 'ハンドリング', physical: 'フィジカル', speed: 'スピード',
  shooting: 'シュート', defense: 'ディフェンス', passing: 'パス', mental: 'メンタル',
};

const sc = {
  card: { background: '#D8EEFA', border: '2px solid #88BBDD', borderRadius: 8, overflow: 'hidden' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' },
  head: { background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px' },
  body: { padding: 8 },
};

export default function History() {
  const { data: history = [] } = useQuery({ queryKey: ['history'], queryFn: historyApi.getAll });

  const half = Math.ceil((history as any[]).length / 2);
  const left = (history as any[]).slice(0, half);
  const right = (history as any[]).slice(half);

  const renderLog = (log: any) => (
    <div key={log.id} style={{ background: '#fff', border: '1px solid #99BBDD', borderRadius: 7, padding: '7px 10px', marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#1A3A88' }}>
          {new Date(log.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' })}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 900, padding: '1px 8px', borderRadius: 8,
          background: log.approved ? '#CCEECC' : log.rejected ? '#FFCCCC' : '#FFEEAA',
          color: log.approved ? '#115511' : log.rejected ? '#AA1111' : '#775500',
        }}>
          {log.approved ? '承認済み ✓' : log.rejected ? '却下' : '承認待ち'}
        </span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A2A44', lineHeight: 1.4 }}>
        {(log.menus as any[]).map((m: any) => m.name).join('・')}
      </div>
      {log.approved && (
        <div style={{ fontSize: 10, color: '#1A4A88', fontWeight: 700, marginTop: 2 }}>
          {Object.entries(log.statsDelta as Record<string, number>).map(([k, v]) => `${STAT_JP[k]}+${v}`).join(' ／ ')}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, width: '100%', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ flex: 1 }}>
        <div style={sc.card}>
          <div style={sc.head}>📋 練習履歴</div>
          <div style={sc.body}>
            {left.length === 0 ? <div style={{ fontSize: 11, color: '#557799' }}>まだ記録がありません</div> : left.map(renderLog)}
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ ...sc.card, visibility: right.length > 0 ? 'visible' : 'hidden' }}>
          <div style={sc.head}>&nbsp;</div>
          <div style={sc.body}>{right.map(renderLog)}</div>
        </div>
      </div>
    </div>
  );
}
