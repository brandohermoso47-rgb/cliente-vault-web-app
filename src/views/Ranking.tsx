// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Ranking({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"26px","maxWidth":"1180px"}}>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(320px,1fr))","gap":"22px","alignItems":"start"}}>
        <div style={sty(v.platePanel)}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Liga de septiembre"}
          </div>
          {(v.rankRows ?? []).map((r: any, $index: number) => (
            <Fragment key={$index}>
              <div style={sty(r?.row)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(22px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--pink) 55%, transparent)"))}>
                <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"13px","fontWeight":"700","color":"var(--ink-3)","width":"24px","flex":"0 0 24px"}}>
                  {r?.pos}
                </span>
                {' '}
                <span style={sty(r?.avatar)}></span>
                {' '}
                <div style={{"flex":"1","minWidth":"0"}}>
                  <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                    {r?.name}
                  </div>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"4px"}}>
                    {r?.level}
                  </div>
                </div>
                {' '}
                <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"12px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap"}}>
                  {r?.pts}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
        <div style={sty(v.platePanel)}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Insignias"}
          </div>
          {(v.badges ?? []).map((b: any, $index: number) => (
            <Fragment key={$index}>
              <div style={sty(b?.card)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(22px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--pink) 45%, transparent)"))}>
                <span style={sty(b?.ring)}>
                  {b?.icStep && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 4v7a3 3 0 0 0 3 3h1"></path>
                        <path d="M17 14v3a3 3 0 0 1-3 3h-1"></path>
                        <circle cx="7" cy="7" r="3"></circle>
                      </svg>
                    </>
                  )}
                  {b?.icFlame && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-1.6.8-2.9 2-4 .3 1.2 1 2 2 2 0-2.6 0-5 1-7z"></path>
                      </svg>
                    </>
                  )}
                  {b?.icBeat && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l10-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="16" cy="16" r="3"></circle>
                      </svg>
                    </>
                  )}
                  {b?.icMic && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="2" width="6" height="11" rx="3"></rect>
                        <path d="M5 11a7 7 0 0 0 14 0"></path>
                        <path d="M12 18v4"></path>
                      </svg>
                    </>
                  )}
                  {b?.icTrophy && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 4h12v5a6 6 0 0 1-12 0z"></path>
                        <path d="M6 6H3v2a3 3 0 0 0 3 3"></path>
                        <path d="M18 6h3v2a3 3 0 0 1-3 3"></path>
                        <path d="M9 20h6M12 15v5"></path>
                      </svg>
                    </>
                  )}
                  {b?.icBook && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"></path>
                        <path d="M8 7h7M8 11h7"></path>
                      </svg>
                    </>
                  )}
                  {b?.icStar && (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.4 6.7 19.2l1.1-5.9L3.5 9.2l5.9-.8z"></path>
                      </svg>
                    </>
                  )}
                  {b?.locked && (
                    <>
                      <span style={{"position":"absolute","right":"-2px","bottom":"-2px","width":"20px","height":"20px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","background":"var(--ground-2)","border":"1px solid var(--hair)","color":"var(--ink-3)"}}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <rect x="4" y="11" width="16" height="10" rx="2"></rect>
                          <path d="M8 11V7a4 4 0 018 0v4"></path>
                        </svg>
                      </span>
                    </>
                  )}
                  {b?.unlocked && (
                    <>
                      <span style={{"position":"absolute","right":"-2px","bottom":"-2px","width":"20px","height":"20px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","background":"var(--ground-2)","border":"1px solid currentColor"}}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M4 12l5 5L20 6"></path>
                        </svg>
                      </span>
                    </>
                  )}
                </span>
                {' '}
                <div style={{"flex":"1","minWidth":"0"}}>
                  <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                    {b?.title}
                  </div>
                  <div style={{"fontSize":"12.5px","color":"var(--ink-2)","marginTop":"4px","textWrap":"pretty"}}>
                    {b?.desc}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
