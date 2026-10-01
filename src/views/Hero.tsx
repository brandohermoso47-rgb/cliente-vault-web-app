// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Hero({ v }: { v: any }) {
  return (
    <>
    <div style={{"position":"relative","overflow":"hidden","borderRadius":"28px","border":"1px solid rgba(226,232,244,.22)","background":"linear-gradient(135deg, #3E4249 0%, #2A2D33 26%, #4B505A 52%, #23252A 74%, #383B42 100%)","boxShadow":"inset 0 1px 0 rgba(255,255,255,.28), 0 26px 60px -30px rgba(0,0,0,.85)","padding":"34px","marginBottom":"26px","maxWidth":"1180px"}}>
      {v.isCursos && (
        <>
        </>
      )}
      <div style={{"position":"relative","display":"flex","alignItems":"flex-end","justifyContent":"space-between","gap":"28px","flexWrap":"wrap"}}>
        <div style={{"minWidth":"280px","flex":"1"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"10px","flexWrap":"wrap"}}>
            <div style={sty(v.heroKickerStyle)}>
              {v.heroKicker}
            </div>
            <span style={sty(v.roleBadge)}>
              {v.roleShort}
            </span>
          </div>
          <h1 style={{"margin":"12px 0 10px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"56px","lineHeight":"1.02","fontWeight":"400","letterSpacing":"-0.005em","color":"#fff","textShadow":"0 2px 18px rgba(8,6,11,.7)"}}>
            {v.heroTitle}
          </h1>
          <p style={{"margin":"0","fontSize":"14.5px","fontWeight":"500","lineHeight":"1.6","color":"#fff","maxWidth":"560px","textWrap":"pretty","textShadow":"0 1px 12px rgba(8,6,11,.7)"}}>
            {v.heroSub}
          </p>
          {v.isCursos && (
            <>
              <div style={{"display":"flex","alignItems":"center","gap":"14px","marginTop":"22px","maxWidth":"440px"}}>
                <div style={{"flex":"1","height":"6px","borderRadius":"999px","background":"var(--hair)","overflow":"hidden"}}>
                  <div style={{"width":"20%","height":"100%","borderRadius":"999px","background":"var(--blue)"}}></div>
                </div>
                <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"12px","fontWeight":"700","color":"var(--ink)"}}>
                  {"20%"}
                </span>
              </div>
            </>
          )}
        </div>
        {v.heroHasGo && (
          <>
            <button type="button" onClick={v.heroCtaGo} style={{"position":"relative","overflow":"hidden","display":"inline-flex","alignItems":"center","gap":"10px","padding":"15px 26px","border":"0","borderRadius":"999px","font":"inherit","fontSize":"13px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"0 12px 30px -8px rgba(201,152,46,0.45), inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer","transformStyle":"preserve-3d","transition":"transform .22s cubic-bezier(.2,.85,.25,1), box-shadow .22s ease"}} className={cx(pc("hover", "transform:perspective(700px) translateZ(calc(26px * var(--z3d, 1))) translateY(-4px) rotateX(-7deg);box-shadow:0 24px 44px -12px rgba(201,152,46,.6), inset 0 1px 0 rgba(255,255,255,.6)"))}>
              <span style={{"position":"absolute","top":"0","bottom":"0","width":"44px","background":"linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)","animation":"goldSweep 3.2s linear infinite"}}></span>
              <span style={{"position":"relative","whiteSpace":"nowrap"}}>
                {v.heroCta}
              </span>
            </button>
          </>
        )}
        {v.heroNoGo && (
          <>
            <div style={{"position":"relative","overflow":"hidden","display":"inline-flex","alignItems":"center","gap":"10px","padding":"15px 26px","borderRadius":"999px","fontSize":"13px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"0 12px 30px -8px rgba(201,152,46,0.45), inset 0 1px 0 rgba(255,255,255,.5)","transformStyle":"preserve-3d","transition":"transform .22s cubic-bezier(.2,.85,.25,1), box-shadow .22s ease"}} className={cx(pc("hover", "transform:perspective(700px) translateZ(calc(26px * var(--z3d, 1))) translateY(-4px) rotateX(-7deg);box-shadow:0 24px 44px -12px rgba(201,152,46,.6), inset 0 1px 0 rgba(255,255,255,.6)"))}>
              <span style={{"position":"absolute","top":"0","bottom":"0","width":"44px","background":"linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)","animation":"goldSweep 3.2s linear infinite"}}></span>
              <span style={{"position":"relative","whiteSpace":"nowrap"}}>
                {v.heroCta}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
    <div style={sty(v.adsBanner)}>
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","padding":"0 18px 12px"}}>
        <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
          {"Anuncios de la comunidad"}
        </span>
        <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".14em","color":"var(--ink-3)","textTransform":"uppercase"}}>
          {"Contenido patrocinado"}
        </span>
      </div>
      <div style={{"position":"relative","overflow":"hidden"}}>
        <div style={{"display":"flex","width":"max-content","gap":"14px","padding":"0 18px","animation":"adMarquee 34s linear infinite"}}>
          {(v.adTiles ?? []).map((a: any, $index: number) => (
            <Fragment key={$index}>
              <button type="button" onClick={a?.go} style={sty(a?.card)} className={cx(pc("hover", "transform:perspective(900px) translateZ(calc(18px * var(--z3d, 1))) translateY(-3px)"))}>
                <div style={sty(a?.thumb)}></div>
                <div style={{"flex":"1","minWidth":"0"}}>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8px","letterSpacing":".16em","textTransform":"uppercase","color":"var(--ink-3)"}}>
                    {a?.kind}
                  </div>
                  <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","marginTop":"5px","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                    {a?.title}
                  </div>
                  <div style={{"fontSize":"11.5px","color":"var(--ink-2)","marginTop":"3px","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                    {a?.meta}
                  </div>
                </div>
              </button>
            </Fragment>
          ))}
        </div>
        <div style={{"position":"absolute","left":"0","top":"0","bottom":"0","width":"70px","background":"linear-gradient(90deg, var(--ground), transparent)","pointerEvents":"none"}}></div>
        <div style={{"position":"absolute","right":"0","top":"0","bottom":"0","width":"70px","background":"linear-gradient(270deg, var(--ground), transparent)","pointerEvents":"none"}}></div>
      </div>
    </div>
    </>
  );
}
