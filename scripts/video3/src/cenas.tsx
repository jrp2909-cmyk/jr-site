import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Cena, digitado, em, entra, faixaDe, Fundo, GRAD_TERMO, mola, MONO, NotaFicticia, Painel, Pilula, Rotulo, Sobe, useU } from './comum';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
// a imagem da logo tem fundo azul-marinho: as bordas somem com uma mascara suave
const MASCARA_LOGO: React.CSSProperties = {
  maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent), linear-gradient(180deg, transparent, #000 8%, #000 94%, transparent)',
  maskComposite: 'intersect', WebkitMaskComposite: 'source-in' as any,
};

/* 1. Abertura: logo revelada com brilho, tagline letra a letra */
export const Intro: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useU();
  const m = mola(f, fps, 2, { damping: 12 });
  const revela = entra(f, 2, 22);
  const brilho = interpolate(f, [16, 46], [-40, 140], clamp);
  const tag = 'Relacionamento desde o 1º contato';
  const letras = Math.floor(interpolate(f, [24, 24 + tag.length * 1.1], [0, tag.length], clamp));
  return (
    <Fundo calor={0.3}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 36 * u }}>
        <div style={{ position: 'absolute', width: 900 * u, height: 900 * u, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(249,115,22,.35), transparent)', transform: `scale(${0.4 + m * 0.8})`, opacity: 1 - entra(f, 20, 60) * 0.5 }} />
        {/* o blend fica no conteiner: clipPath/filter isolam o grupo, e no filho ele nao alcancaria o fundo */}
        <div style={{ position: 'relative', width: 820 * u, mixBlendMode: 'lighten', transform: `scale(${0.86 + m * 0.14})`, filter: `blur(${(1 - revela) * 14}px)`, clipPath: `inset(0 ${(1 - revela) * 100}% 0 0)` }}>
          <Img src={staticFile('img/logo.png')} style={{ width: '100%', display: 'block', ...MASCARA_LOGO }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${brilho - 12}%, rgba(255,255,255,.35) ${brilho}%, transparent ${brilho + 12}%)`, mixBlendMode: 'overlay' }} />
        </div>
        <div style={{ fontSize: 54 * u, fontWeight: 600, letterSpacing: '-.02em', minHeight: 70 * u }}>
          {tag.slice(0, letras)}<span style={{ color: C.laranja, opacity: f % 20 < 10 && letras < tag.length ? 1 : 0 }}>|</span>
        </div>
      </AbsoluteFill>
    </Fundo>
  );
};

/* 2. Problema: cartoes que racham e a pergunta em laranja */
const Dor: React.FC<{ txt: string; ic: string; ini: number; quebra: number; x: number; y: number; r: number }> = ({ txt, ic, ini, quebra, x, y, r }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useU();
  const m = mola(f, fps, ini);
  const q = entra(f, quebra, 14);
  const treme = f > quebra && f < quebra + 10 ? Math.sin(f * 2.4) * 8 * u : 0;
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) translate(${treme}px, ${q * 120 * u}px) rotate(${r + q * r * 2}deg) scale(${0.7 + m * 0.3})`, opacity: m * (1 - entra(f, quebra + 8, 10)), filter: `grayscale(${q})` }}>
      <Painel style={{ padding: `${34 * u}px ${44 * u}px`, display: 'flex', alignItems: 'center', gap: 26 * u, position: 'relative', overflow: 'hidden' }}>
        <span style={{ fontSize: 60 * u }}>{ic}</span>
        <span style={{ fontSize: 50 * u, fontWeight: 700, letterSpacing: '-.02em', maxWidth: 640 * u }}>{txt}</span>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: q }}>
          <path d="M55 0 L50 14 L58 20 L47 30 L52 40" stroke="#e8ecf4" strokeWidth=".6" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - q} />
        </svg>
      </Painel>
    </div>
  );
};

export const Problema: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const tPerg = em(p, 0.5);
  const m = mola(f, fps, tPerg, { damping: 11 });
  return (
    <Fundo calor={0}>
      <Dor txt="Follow-up esquecido." ic="🔔" ini={em(p, 0)} quebra={tPerg - 6} x={v ? 50 : 34} y={v ? 30 : 34} r={-3} />
      <Dor txt="Planilha que não entende de gente." ic="📋" ini={em(p, 0.18)} quebra={tPerg - 3} x={v ? 50 : 64} y={v ? 52 : 62} r={2.5} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: f >= tPerg ? 1 : 0 }}>
        <div style={{ textAlign: 'center', transform: `scale(${0.6 + m * 0.4})` }}>
          <Rotulo style={{ marginBottom: 20 * u }}>A pergunta de todo dia</Rotulo>
          <div style={{ fontSize: (v ? 110 : 128) * u, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1.02, color: C.laranja, textShadow: `0 0 ${24 * u}px rgba(249,115,22,.45)`, maxWidth: (v ? 900 : 1500) * u }}>
            Quem merece atenção hoje?
          </div>
        </div>
      </AbsoluteFill>
    </Fundo>
  );
};

/* 3. Termometro: eventos voam para o mostrador e a relacao esquenta */
const EVENTOS = [
  ['Dados de contato completos', 25], ['Conexão aceita', 15], ['Respondeu à mensagem', 8], ['1ª dor mapeada', 8],
  ['3 canais de contato', 8], ['1º compromisso', 8], ['Apresentação agendada', 10], ['Apresentação realizada', 10],
] as const;

export const Termometro: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const tempos = EVENTOS.map((_, k) => em(p, 0.08 + (k / (EVENTOS.length - 1)) * 0.82));
  let nota = 0;
  EVENTOS.forEach(([, pts], k) => { nota += pts * entra(f, tempos[k] + 8, 12); });
  const n = Math.round(nota);
  const fx = faixaDe(n);
  const R = 300 * u, cx = 340 * u, cy = 330 * u;
  const arco = Math.PI * R;
  const ang = Math.PI * (1 - n / 100);
  const pulsoFaixa = tempos.some((t, k) => { const antes = EVENTOS.slice(0, k).reduce((s, e) => s + e[1], 0); return faixaDe(antes).nome !== faixaDe(antes + EVENTOS[k][1]).nome && f > t + 8 && f < t + 22; });
  return (
    <Fundo calor={n / 100}>
      <NotaFicticia />
      <AbsoluteFill style={{ flexDirection: v ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: (v ? 40 : 90) * u, padding: 80 * u }}>
        <div style={{ position: 'relative', width: 680 * u, height: 420 * u }}>
          <svg width={680 * u} height={380 * u} style={{ overflow: 'visible' }}>
            <defs><linearGradient id="g"><stop offset="0" stopColor={C.gelado} /><stop offset=".35" stopColor={C.morno} /><stop offset=".6" stopColor={C.aquecendo} /><stop offset=".8" stopColor={C.quente} /><stop offset="1" stopColor={C.brasa} /></linearGradient></defs>
            <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="#1c2840" strokeWidth={40 * u} strokeLinecap="round" />
            <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="url(#g)" strokeWidth={40 * u} strokeLinecap="round" strokeDasharray={`${(arco * n) / 100} ${arco}`} />
            <circle cx={cx + R * Math.cos(ang)} cy={cy - R * Math.sin(ang)} r={26 * u} fill="#fff" stroke={C.fundo} strokeWidth={8 * u} />
            {pulsoFaixa && <circle cx={cx} cy={cy} r={R + 40 * u} fill="none" stroke={fx.cor} strokeWidth={4 * u} opacity={0.6} />}
          </svg>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 150 * u, textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 150 * u, fontWeight: 600, lineHeight: 1 }}>{n}<span style={{ fontSize: 46 * u, color: C.suave }}>°</span></div>
            <div style={{ marginTop: 18 * u, transform: `scale(${pulsoFaixa ? 1.12 : 1})` }}><Pilula cor={fx.cor} tam={38}>{fx.nome}</Pilula></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: v ? '1fr 1fr' : '1fr', gap: 14 * u, width: (v ? 920 : 640) * u }}>
          {EVENTOS.map(([t, pts], k) => {
            const m = mola(f, fps, tempos[k]);
            const absorve = entra(f, tempos[k] + 30, 20);
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16 * u, padding: `${14 * u}px ${20 * u}px`, borderRadius: 16 * u, background: 'rgba(22,32,54,.85)', border: `${2 * u}px solid ${absorve > 0.5 ? '#22314f' : C.laranja}`, transform: `translateX(${(1 - m) * 200 * u}px)`, opacity: m * (1 - absorve * 0.45) }}>
                <span style={{ width: 34 * u, height: 34 * u, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(74,222,128,.18)', color: C.verde, fontSize: 20 * u, fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: (v ? 26 : 30) * u, fontWeight: 500, flex: 1 }}>{t}</span>
                <span style={{ fontFamily: MONO, fontSize: 28 * u, color: C.laranjaClaro, fontWeight: 700 }}>+{pts}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Fundo>
  );
};

/* 4. Funil que se move sozinho + tarefa que nasce */
const COLUNAS = ['Conexão pendente', 'A abordar', 'Em conversa', 'Apresentação'];
const OUTROS = [['Rota 66', 'Nexo Eng.'], ['Pixel Varejo'], ['Lótus', 'Trilha Energia'], ['Aurora Log.']];

export const Funil: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const passos = [em(p, 0.05), em(p, 0.3), em(p, 0.55)];
  const col = passos.reduce((c, t, k) => c + entra(f, t, 16) * (k === 0 ? 1 : 1), 0); // 0..3
  const larg = (v ? 230 : 360) * u, gap = (v ? 20 : 28) * u;
  const tarefa = mola(f, fps, em(p, 0.62), { damping: 10 });
  const ev = Math.max(0, passos.filter((t) => f >= t - 4).length - 1);
  const eventoTxt = ['Conexão aceita', 'Respondeu à mensagem', 'Apresentação agendada'][ev];
  const toast = entra(f, passos[ev] - 4, 8) * (1 - entra(f, passos[ev] + 26, 8));
  return (
    <Fundo calor={0.25 + col * 0.12}>
      <NotaFicticia />
      <AbsoluteFill style={{ opacity: 0.12, transform: 'perspective(1600px) rotateX(18deg)', transformOrigin: '50% 0%' }}>
        <Img src={staticFile('img/03-funil.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50 * u }}>
        <div style={{ position: 'relative', display: 'flex', gap }}>
          {COLUNAS.map((c, k) => (
            <div key={c} style={{ width: larg, minHeight: 420 * u, borderRadius: 20 * u, background: 'rgba(16,24,40,.88)', border: `${2 * u}px solid ${C.borda}`, padding: 16 * u, display: 'flex', flexDirection: 'column', gap: 12 * u }}>
              <div style={{ fontSize: (v ? 20 : 26) * u, fontWeight: 700, color: Math.round(col) === k ? C.laranjaClaro : C.suave, marginBottom: 6 * u }}>{c}</div>
              <div style={{ height: 96 * u }} />
              {OUTROS[k].map((o) => <div key={o} style={{ padding: 14 * u, borderRadius: 12 * u, background: C.sup2, border: `${1.5 * u}px solid #22314f`, fontSize: (v ? 18 : 22) * u, color: C.suave }}>{o}</div>)}
            </div>
          ))}
          <div style={{ position: 'absolute', top: 62 * u, left: 16 * u + col * (larg + gap), width: larg - 32 * u, height: 96 * u, borderRadius: 14 * u, background: '#1b2742', border: `${2.5 * u}px solid ${C.laranja}`, boxShadow: `0 ${10 * u}px ${22 * u}px -${6 * u}px rgba(249,115,22,.55)`, padding: `${12 * u}px ${14 * u}px`, transform: `rotate(${Math.sin(col * Math.PI) * 4}deg) scale(${1 + Math.sin(col * Math.PI) * 0.06})` }}>
            <div style={{ fontSize: (v ? 20 : 25) * u, fontWeight: 700 }}>Vértice Logística</div>
            <div style={{ height: 10 * u, borderRadius: 99, background: GRAD_TERMO, marginTop: 12 * u, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: `${25 + col * 15}%`, width: 18 * u, height: 18 * u, borderRadius: '50%', background: '#fff', transform: 'translate(-50%,-50%)' }} />
            </div>
          </div>
          <div style={{ position: 'absolute', top: -70 * u, left: '50%', transform: `translate(-50%, ${(1 - toast) * 20 * u}px)`, opacity: toast, background: C.laranja, color: '#0a0f1c', fontWeight: 800, fontSize: 30 * u, padding: `${10 * u}px ${26 * u}px`, borderRadius: 999 }}>✓ {eventoTxt}</div>
        </div>
        <div style={{ transform: `scale(${tarefa}) translateY(${(1 - tarefa) * 40}px)`, opacity: tarefa }}>
          <Painel destaque style={{ display: 'flex', alignItems: 'center', gap: 22 * u, padding: `${22 * u}px ${30 * u}px` }}>
            <span style={{ fontSize: 46 * u }}>✨</span>
            <div>
              <Rotulo>Próximo passo · nasceu sozinho</Rotulo>
              <div style={{ fontSize: (v ? 30 : 36) * u, fontWeight: 600, marginTop: 6 * u }}>Enviar a pauta da apresentação</div>
            </div>
          </Painel>
        </div>
      </AbsoluteFill>
    </Fundo>
  );
};

/* 5. IA: analise visivel e tres versoes sendo escritas */
const ANALISE = ['Contexto do projeto Órbita Cloud', 'Perfil e momento de Marina Costa', 'Último post: fechamento do mês'];
const VERSOES = [
  ['Responder ao post', 'Oi, Marina! Li seu post sobre a planilha que só uma pessoa entende e me identifiquei…'],
  ['Oferecer algo útil', 'Oi, Marina! Separei um checklist que times financeiros usam para encurtar o fechamento…'],
  ['Pergunta direta', 'Oi, Marina! O que mais toma tempo hoje: a conciliação ou juntar os números do comercial?'],
];
export const IA: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const tA = ANALISE.map((_, k) => em(p, 0.02 + k * 0.1));
  const tV = VERSOES.map((_, k) => em(p, 0.32 + k * 0.12));
  const escolha = em(p, 0.8);
  const esc = entra(f, escolha, 12);
  return (
    <Fundo calor={0.4}>
      <NotaFicticia />
      <AbsoluteFill style={{ flexDirection: v ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 50 * u, padding: 90 * u }}>
        <Painel style={{ width: (v ? 900 : 560) * u, padding: 34 * u }}>
          <Rotulo>✨ Escrever com IA</Rotulo>
          <div style={{ fontSize: 34 * u, fontWeight: 700, margin: `${14 * u}px 0 ${24 * u}px` }}>O JR! está lendo:</div>
          {ANALISE.map((a, k) => {
            const ok = f > tA[k] + 12;
            const vis = entra(f, tA[k], 10);
            return (
              <div key={a} style={{ display: 'flex', gap: 16 * u, alignItems: 'center', fontSize: 28 * u, marginTop: 16 * u, opacity: 0.35 + vis * 0.65 }}>
                <span style={{ width: 30 * u, height: 30 * u, borderRadius: '50%', border: `${4 * u}px solid ${ok ? C.verde : C.laranja}`, borderTopColor: ok ? C.verde : 'transparent', background: ok ? C.verde : 'transparent', transform: `rotate(${ok ? 0 : f * 18}deg)`, boxShadow: ok ? `inset 0 0 0 ${5 * u}px #111a2d` : 'none' }} />
                {a}
              </div>
            );
          })}
        </Painel>
        <div style={{ display: 'grid', gap: 18 * u, width: (v ? 900 : 900) * u }}>
          {VERSOES.map(([e, t], k) => {
            const m = mola(f, fps, tV[k]);
            const sel = k === 1;
            return (
              <div key={e} style={{ transform: `translateY(${(1 - m) * 40 * u}px) scale(${sel ? 1 + esc * 0.04 : 1})`, opacity: m * (sel ? 1 : 1 - esc * 0.55) }}>
                <Painel destaque={sel && esc > 0.5} style={{ padding: `${22 * u}px ${28 * u}px`, position: 'relative' }}>
                  <Rotulo style={{ fontSize: 20 * u }}>Versão {k + 1} · {e}</Rotulo>
                  <div style={{ fontSize: (v ? 27 : 29) * u, lineHeight: 1.45, marginTop: 10 * u, minHeight: 84 * u }}>{digitado(t, f, tV[k] + 4, 75)}</div>
                  {sel && <div style={{ position: 'absolute', right: 22 * u, top: -20 * u, opacity: esc, transform: `scale(${0.6 + esc * 0.4})`, background: C.laranja, color: '#0a0f1c', fontWeight: 800, fontSize: 24 * u, padding: `${6 * u}px ${18 * u}px`, borderRadius: 999 }}>Você escolheu</div>}
                </Painel>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Fundo>
  );
};

/* 6. Radar: varredura e novidades com sugestao */
const POSTS = [
  ['Marina Costa', 'Publicou sobre o fechamento do mês', 'Comentar com a sua experiência'],
  ['Rafael Mendes', 'Inaugurou a 12ª unidade', 'Parabenizar e retomar integrações'],
  ['Paula Ribeiro', 'Novo cargo: CEO', 'Mandar uma mensagem de parabéns'],
];
export const Radar: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const tP = POSTS.map((_, k) => em(p, 0.12 + k * 0.22));
  const T = 560 * u;
  return (
    <Fundo calor={0.35}>
      <NotaFicticia />
      <AbsoluteFill style={{ flexDirection: v ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 70 * u }}>
        <div style={{ position: 'relative', width: T, height: T }}>
          {[1, 0.7, 0.4].map((s) => <div key={s} style={{ position: 'absolute', inset: `${((1 - s) / 2) * 100}%`, borderRadius: '50%', border: `${2 * u}px solid rgba(249,115,22,.3)` }} />)}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from ${f * 6}deg, rgba(249,115,22,.55), transparent 22%)` }} />
          {tP.map((t, k) => {
            const a = entra(f, t - 6, 8) * (1 - entra(f, t + 30, 30) * 0.6);
            const ang = (k * 120 + 40) * (Math.PI / 180);
            return <div key={k} style={{ position: 'absolute', left: T / 2 + Math.cos(ang) * T * 0.3 - 14 * u, top: T / 2 + Math.sin(ang) * T * 0.3 - 14 * u, width: 28 * u, height: 28 * u, borderRadius: '50%', background: C.laranja, opacity: a, boxShadow: `0 0 0 ${a * 18 * u}px rgba(249,115,22,.25)` }} />;
          })}
          <div style={{ position: 'absolute', inset: '38%', borderRadius: '50%', background: C.fundo, border: `${2 * u}px solid ${C.borda}`, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div><div style={{ fontSize: 46 * u }}>👁</div><div style={{ fontFamily: MONO, fontSize: 18 * u, color: C.suave }}>SÓ LEITURA</div></div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 18 * u, width: (v ? 900 : 760) * u }}>
          {POSTS.map(([n, o, s], k) => {
            const m = mola(f, fps, tP[k]);
            return (
              <div key={n} style={{ transform: `translateX(${(1 - m) * 160 * u}px)`, opacity: m }}>
                <Painel style={{ padding: `${22 * u}px ${28 * u}px` }}>
                  <div style={{ fontSize: 30 * u, fontWeight: 700 }}>{n} <span style={{ fontWeight: 400, color: C.suave }}>· {o}</span></div>
                  <div style={{ marginTop: 12 * u, fontSize: 26 * u, color: C.laranjaClaro, background: 'rgba(249,115,22,.1)', borderRadius: 10 * u, padding: `${8 * u}px ${14 * u}px` }}>💡 Sugestão: {s}</div>
                </Painel>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Fundo>
  );
};

/* 7. Assistente e relatorios */
const LINHAS = [['Nexo Engenharia', 'Quente · 64°', C.quente], ['Rota 66 Transportes', 'Quente · 61°', C.quente], ['Lótus Bem-estar', 'Aquecendo · 48°', C.aquecendo]] as const;
export const Assistente: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const tQ = em(p, 0), tR = em(p, 0.2), troca = em(p, 0.5);
  const sai = entra(f, troca, 14);
  const rel = ['rel-simples-topo.png', 'rel-medio-topo.png', 'rel-detalhado-topo.png'];
  return (
    <Fundo calor={0.45}>
      <NotaFicticia />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - sai, transform: `translateX(${-sai * 300 * u}px) scale(${1 - sai * 0.1})` }}>
        <Painel style={{ width: (v ? 920 : 1000) * u, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 18 * u, alignItems: 'center', padding: `${20 * u}px ${28 * u}px`, borderBottom: `${2 * u}px solid ${C.borda}`, background: '#0c1322' }}>
            <span style={{ width: 56 * u, height: 56 * u, borderRadius: '50%', background: C.laranja, color: '#0a0f1c', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 34 * u }}>!</span>
            <div><div style={{ fontSize: 30 * u, fontWeight: 700 }}>Assistente do JR!</div><div style={{ fontSize: 22 * u, color: C.suave }}>Só lê. Nunca altera nada.</div></div>
          </div>
          <div style={{ padding: 28 * u, display: 'grid', gap: 18 * u }}>
            <div style={{ justifySelf: 'end', background: C.laranja, color: '#0a0f1c', fontWeight: 700, fontSize: 30 * u, padding: `${14 * u}px ${22 * u}px`, borderRadius: 20 * u, opacity: entra(f, tQ, 8), transform: `translateY(${(1 - entra(f, tQ, 10)) * 20}px)` }}>Quais são as 3 mais quentes?</div>
            <div style={{ background: C.sup2, border: `${2 * u}px solid ${C.borda}`, borderRadius: 20 * u, padding: 22 * u, opacity: entra(f, tR, 8) }}>
              {LINHAS.map(([e, t, c], k) => {
                const m = mola(f, fps, tR + 4 + k * 5);
                return (
                  <div key={e} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 28 * u, padding: `${12 * u}px 0`, borderBottom: k < 2 ? `${1.5 * u}px solid ${C.borda}` : 'none', opacity: m, transform: `translateX(${(1 - m) * 40}px)` }}>
                    <span>{k + 1}. {e}</span><Pilula cor={c}>{t}</Pilula>
                  </div>
                );
              })}
            </div>
          </div>
        </Painel>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: sai }}>
        <div style={{ position: 'relative', width: 1400 * u, height: 760 * u, transform: v ? 'scale(.68)' : undefined }}>
          {rel.map((r, k) => {
            const m = mola(f, fps, troca + 4 + k * 4, { damping: 13 });
            const rot = (k - 1) * 9 * m, x = (k - 1) * 380 * m * u;
            return (
              <div key={r} style={{ position: 'absolute', left: '50%', top: 40 * u, width: 520 * u, height: 640 * u, marginLeft: -260 * u, transform: `translateX(${x}px) rotate(${rot}deg) translateY(${(1 - m) * 200}px)`, borderRadius: 18 * u, overflow: 'hidden', background: '#fff', boxShadow: `0 ${20 * u}px ${30 * u}px -${10 * u}px rgba(0,0,0,.75)`, zIndex: k === 1 ? 2 : 1 }}>
                <Img src={staticFile(`img/${r}`)} style={{ width: '100%' }} />
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: '50%', bottom: -10 * u, transform: `translateX(-50%) scale(${mola(f, fps, troca + 18)})`, zIndex: 3, background: C.laranja, color: '#0a0f1c', fontWeight: 800, fontSize: 36 * u, padding: `${14 * u}px ${34 * u}px`, borderRadius: 999, boxShadow: `0 ${12 * u}px ${26 * u}px -${8 * u}px rgba(249,115,22,.8)`, whiteSpace: 'nowrap' }}>Relatório em 1 clique · PDF ou WhatsApp</div>
        </div>
      </AbsoluteFill>
    </Fundo>
  );
};

/* 8. Voce no comando */
export const Comando: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { u, v } = useU();
  const t1 = em(p, 0), t2 = em(p, 0.3), t3 = em(p, 0.58);
  const faixa = entra(f, t2 - 2, 12);
  const tam = (v ? 120 : 150) * u;
  return (
    <Fundo calor={0.2}>
      <AbsoluteFill style={{ justifyContent: 'center', paddingLeft: (v ? 80 : 180) * u, gap: 6 * u }}>
        <Sobe ini={t1}><div style={{ fontSize: tam, fontWeight: 800, letterSpacing: '-.04em' }}>A IA sugere.</div></Sobe>
        <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
          <div style={{ position: 'absolute', left: -30 * u, right: -30 * u, top: '8%', bottom: '4%', background: C.laranja, transformOrigin: 'left', transform: `scaleX(${faixa})`, borderRadius: 12 * u }} />
          <Sobe ini={t2} style={{ position: 'relative' }}><div style={{ fontSize: tam, fontWeight: 800, letterSpacing: '-.04em', color: faixa > 0.6 ? '#0a0f1c' : C.laranja }}>Você decide.</div></Sobe>
        </div>
        <Sobe ini={t3} style={{ marginTop: 24 * u }}><div style={{ fontSize: 56 * u, color: C.suave, fontWeight: 500 }}>Nada é enviado sem você.</div></Sobe>
      </AbsoluteFill>
    </Fundo>
  );
};

/* 9. Final: logo, convite para fundadores e endereco */
export const Final: React.FC<Cena> = (p) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useU();
  const m = mola(f, fps, 4, { damping: 12 });
  const b = mola(f, fps, em(p, 0.35));
  const url = entra(f, em(p, 0.6), 14);
  const brilho = interpolate(f % 60, [0, 60], [-30, 130]);
  return (
    <Fundo calor={0.55}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46 * u }}>
        <Img src={staticFile('img/logo.png')} style={{ width: 640 * u, mixBlendMode: 'lighten', ...MASCARA_LOGO, transform: `scale(${0.8 + m * 0.2})`, opacity: m }} />
        <div style={{ transform: `scale(${b})`, position: 'relative', overflow: 'hidden', background: C.laranja, color: '#0a0f1c', fontWeight: 800, fontSize: 52 * u, padding: `${22 * u}px ${54 * u}px`, borderRadius: 22 * u, boxShadow: `0 ${14 * u}px ${30 * u}px -${8 * u}px rgba(249,115,22,.8)` }}>
          Seja um cliente fundador
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${brilho - 10}%, rgba(255,255,255,.45) ${brilho}%, transparent ${brilho + 10}%)` }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 46 * u, letterSpacing: '.04em', opacity: url, transform: `translateY(${(1 - url) * 20}px)` }}>jrcrm.com.br</div>
      </AbsoluteFill>
    </Fundo>
  );
};
