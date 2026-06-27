import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillsApi } from '../lib/api';

const sc = {
  card: { background: '#D8EEFA', border: '2px solid #88BBDD', borderRadius: 8, overflow: 'hidden' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' },
  head: { background: 'linear-gradient(90deg,#1A3A88,#2A5AAA)', color: '#fff', fontSize: 12, fontWeight: 900, padding: '6px 12px' },
  body: { padding: 8 },
};

export default function Skills() {
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [authErr, setAuthErr] = useState('');

  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: skillsApi.getAll });

  const add = useMutation({
    mutationFn: () => skillsApi.add(newName),
    onSuccess: () => { setNewName(''); qc.invalidateQueries({ queryKey: ['skills'] }); },
    onError: (e: any) => setAuthErr(e.response?.data?.error || 'エラー（親認証が必要です）'),
  });

  const promote = useMutation({
    mutationFn: (id: number) => skillsApi.promoteGold(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
    onError: (e: any) => setAuthErr(e.response?.data?.error || 'エラー（親認証が必要です）'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => skillsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
    onError: (e: any) => setAuthErr(e.response?.data?.error || 'エラー（親認証が必要です）'),
  });

  const gold = (skills as any[]).filter((s: any) => s.isGold);
  const normal = (skills as any[]).filter((s: any) => !s.isGold);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, width: '100%', maxWidth: 980, margin: '0 auto' }}>

      {/* 金枠スキル */}
      <div style={{ flex: 1 }}>
        <div style={sc.card}>
          <div style={sc.head}>👑 金枠スキル</div>
          <div style={sc.body}>
            {gold.length === 0 ? (
              <div style={{ fontSize: 11, color: '#557799' }}>まだ金枠スキルがありません</div>
            ) : gold.map((s: any) => (
              <div key={s.id} style={{ background: 'linear-gradient(135deg,#FFE844,#FFD700)', border: '1px solid #AA8800', borderRadius: 7, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span>👑</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#3A2000' }}>{s.name}</span>
                <span style={{ fontSize: 10, color: '#886600', fontWeight: 900 }}>金枠</span>
                <button onClick={() => remove.mutate(s.id)} style={{ fontSize: 10, color: '#AA1111', border: '1px solid #FFAAAA', borderRadius: 3, padding: '2px 6px', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit' }}>削除</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 通常スキル + 追加 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={sc.card}>
          <div style={sc.head}>⭐ 通常スキル</div>
          <div style={sc.body}>
            {normal.length === 0 ? (
              <div style={{ fontSize: 11, color: '#557799' }}>通常スキルがありません</div>
            ) : normal.map((s: any) => (
              <div key={s.id} style={{ background: '#fff', border: '1px solid #99BBDD', borderRadius: 7, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span>⭐</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#1A2A44' }}>{s.name}</span>
                <button onClick={() => promote.mutate(s.id)} style={{ background: '#FFEE88', color: '#886600', border: '1px solid #AA8800', borderRadius: 3, padding: '2px 7px', fontSize: 9, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
                  金枠に昇格 ↑
                </button>
                <button onClick={() => remove.mutate(s.id)} style={{ fontSize: 10, color: '#AA1111', border: '1px solid #FFAAAA', borderRadius: 3, padding: '2px 6px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>削除</button>
              </div>
            ))}
          </div>
        </div>

        {authErr && <div style={{ fontSize: 11, color: '#AA1111', fontWeight: 700, textAlign: 'center' }}>{authErr}（承認ページでログインしてください）</div>}

        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="新しいスキル名"
            style={{ flex: 1, background: '#E4F4FF', border: '1px solid #88AACC', borderRadius: 4, padding: '3px 7px', fontSize: 12, fontFamily: 'inherit' }}
          />
          <button
            onClick={() => newName.trim() && add.mutate()}
            style={{ background: 'linear-gradient(135deg,#FFD700,#FFAA00)', color: '#3A2000', border: '2px solid #AA8800', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            ＋ 認定する
          </button>
        </div>
      </div>
    </div>
  );
}
