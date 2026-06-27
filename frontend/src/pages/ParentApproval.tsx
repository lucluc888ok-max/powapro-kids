import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalApi, trainingApi, setAuthToken } from '../lib/api';

const STAT_JP: Record<string, string> = {
  handling: 'ハンドリング', physical: 'フィジカル', speed: 'スピード',
  shooting: 'シュート', defense: 'ディフェンス', passing: 'パス', mental: 'メンタル',
};

const sc = {
  card: { background: '#D8EEFA', border: '2px solid #88BBDD', borderRadius: 8, overflow: 'hidden' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' },
  head: { background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px' },
  body: { padding: 8 },
};

export default function ParentApproval() {
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('parent_token'));
  const [loginError, setLoginError] = useState('');

  const { data: pending = [], refetch } = useQuery({
    queryKey: ['pending'],
    queryFn: trainingApi.getPending,
    enabled: authed,
  });

  const login = useMutation({
    mutationFn: () => approvalApi.login(input),
    onSuccess: (data: { token: string }) => {
      setAuthToken(data.token);
      setAuthed(true);
      setLoginError('');
    },
    onError: () => setLoginError('パスワードが違います'),
  });

  const approve = useMutation({
    mutationFn: (id: number) => approvalApi.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['player'] }); refetch(); },
  });

  const reject = useMutation({
    mutationFn: (id: number) => approvalApi.reject(id),
    onSuccess: () => refetch(),
  });

  const addDigit = (d: string) => {
    if (input.length < 4) setInput(prev => prev + d);
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, width: '100%', maxWidth: 980, margin: '0 auto' }}>

      {/* テンキー */}
      <div style={{ flex: '0 0 240px' }}>
        <div style={sc.card}>
          <div style={sc.head}>🔐 親パスワード認証</div>
          {authed ? (
            <div style={{ ...sc.body, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#228844', marginBottom: 12 }}>認証済み</div>
              <button onClick={() => { setAuthToken(null); setAuthed(false); setInput(''); }} style={{ fontSize: 10, color: '#AA1111', border: '1px solid #FFAAAA', borderRadius: 4, padding: '4px 12px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                ログアウト
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: 14 }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #88AACC', background: i < input.length ? '#1A3A88' : '#fff' }} />
                ))}
              </div>
              {loginError && <div style={{ textAlign: 'center', fontSize: 11, color: '#AA1111', fontWeight: 700, marginBottom: 4 }}>{loginError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, padding: '0 12px 12px' }}>
                {['1','2','3','4','5','6','7','8','9','⌫','0','OK'].map(k => (
                  <button key={k} onClick={() => {
                    if (k === '⌫') setInput(p => p.slice(0,-1));
                    else if (k === 'OK') { if (input.length === 4) login.mutate(); }
                    else addDigit(k);
                  }} style={{
                    background: k === 'OK' ? 'linear-gradient(135deg,#22AA55,#118833)' : '#fff',
                    border: `1.5px solid ${k === 'OK' ? '#117733' : '#AACCE0'}`,
                    borderRadius: 6, padding: 10, fontSize: k === '⌫' ? 14 : 18, fontWeight: 900,
                    color: k === 'OK' ? '#fff' : k === '⌫' ? '#AA1111' : '#1A2A44',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>{k}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 承認リスト */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={sc.card}>
          <div style={sc.head}>📋 承認待ちの練習記録</div>
          <div style={sc.body}>
            {!authed ? (
              <div style={{ fontSize: 12, color: '#557799', textAlign: 'center', padding: 20 }}>左でパスワードを入力してください</div>
            ) : pending.length === 0 ? (
              <div style={{ fontSize: 12, color: '#557799', textAlign: 'center', padding: 20 }}>承認待ちの記録はありません</div>
            ) : (pending as any[]).map((log: any) => (
              <div key={log.id} style={{ background: '#fff', border: '1px solid #99BBDD', borderRadius: 7, padding: '8px 10px', marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#1A3A88' }}>
                    {new Date(log.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' })}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1A2A44', lineHeight: 1.5 }}>
                  {(log.menus as any[]).map((m: any) => m.name).join('・')}
                </div>
                <div style={{ fontSize: 10, color: '#1A5A88', fontWeight: 700, marginTop: 2 }}>
                  → {Object.entries(log.statsDelta as Record<string, number>).map(([k, v]) => `${STAT_JP[k]}+${v}`).join('　')}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button onClick={() => approve.mutate(log.id)} style={{ flex: 1, background: 'linear-gradient(135deg,#22AA55,#118833)', color: '#fff', border: 'none', borderRadius: 5, padding: 7, fontSize: 12, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' }}>
                    ✅ 承認する
                  </button>
                  <button onClick={() => reject.mutate(log.id)} style={{ flex: 1, background: '#fff', color: '#BB1111', border: '1.5px solid #FFAAAA', borderRadius: 5, padding: 7, fontSize: 12, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' }}>
                    ✗ 却下
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
