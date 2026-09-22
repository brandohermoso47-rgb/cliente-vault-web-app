// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Reels({ v }: { v: any }) {
  return (
    <>
    <div style={sty(`position:fixed;top:0;right:0;bottom:0;left:${v.asideW ?? ""};z-index:30`)}>
      <div style={{"position":"absolute","left":"26px","top":"50%","transform":"translateY(-50%)","display":"flex","flexDirection":"column","gap":"12px","zIndex":"3"}}>
        <div onClick={v.reelPrev} style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"46px","height":"46px","borderRadius":"50%","border":"1px solid rgba(255,255,255,.28)","background":"rgba(255,255,255,.14)","backdropFilter":"var(--lg-blur)","color":"#fff","cursor":"pointer"}} className={cx(pc("hover", "background:rgba(255,255,255,.26)"))}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 15l-6-6-6 6"></path>
          </svg>
        </div>
        <div onClick={v.reelNext} style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"46px","height":"46px","borderRadius":"50%","border":"1px solid rgba(255,255,255,.28)","background":"rgba(255,255,255,.14)","backdropFilter":"var(--lg-blur)","color":"#fff","cursor":"pointer"}} className={cx(pc("hover", "background:rgba(255,255,255,.26)"))}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </div>
      </div>
      <div style={{"position":"absolute","inset":"0"}}>
        <div style={{"position":"relative","width":"100%","height":"100%","overflow":"hidden","background":"#08060B"}}>
          <div ref={v.feedRef} style={{"position":"absolute","inset":"0","overflowY":"auto","scrollSnapType":"y mandatory","scrollbarWidth":"none"}}>
            {(v.reelItems ?? []).map((r: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{"position":"relative","width":"100%","height":"100%","scrollSnapAlign":"start","overflow":"hidden"}}>
                  <div style={sty(r?.bg)}></div>
                  <div style={{"position":"absolute","inset":"0","background":"radial-gradient(120% 68% at 50% 18%, transparent, rgba(0,0,0,.6))"}}></div>
                  {r?.isLive && (
                    <>
                      <span style={{"position":"absolute","top":"74px","left":"16px","display":"inline-flex","alignItems":"center","gap":"5px","padding":"5px 11px","borderRadius":"999px","background":"var(--pink)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"8px","fontWeight":"700","letterSpacing":".12em","whiteSpace":"nowrap"}}>
                        <span style={{"width":"4px","height":"4px","borderRadius":"50%","background":"#fff","animation":"livePulse 1.2s ease-in-out infinite"}}></span>
                        {"EN VIVO"}
                      </span>
                    </>
                  )}
                  {r?.isNew && (
                    <>
                      <span style={{"position":"absolute","top":"74px","left":"16px","padding":"5px 11px","borderRadius":"999px","background":"var(--purple)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"8px","fontWeight":"700","letterSpacing":".12em","whiteSpace":"nowrap"}}>
                        {"NUEVO"}
                      </span>
                    </>
                  )}
                  <div style={{"position":"absolute","right":"12px","bottom":"104px","display":"flex","flexDirection":"column","alignItems":"center","gap":"16px"}}>
                    <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"6px"}}>
                      <div onClick={r?.onLike} style={sty(r?.heart)}>
                        <svg width="21" height="21" viewBox="0 0 24 24" fill={r?.heartFill} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                          <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 000-7.8z"></path>
                        </svg>
                      </div>
                      <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","fontWeight":"700","color":"#fff"}}>
                        {r?.likeLabel}
                      </span>
                    </div>
                    <div onClick={r?.onComments} style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"6px","cursor":"pointer"}}>
                      <div style={{"width":"46px","height":"46px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","background":"rgba(255,255,255,.14)","border":"1px solid rgba(255,255,255,.28)","backdropFilter":"blur(14px)","color":"#fff"}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                          <path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.9 9.9 0 01-2.8-.4L3 21l1.6-4.6A8.3 8.3 0 013 11.5 8.4 8.4 0 0112 3a8.4 8.4 0 019 8.5z"></path>
                        </svg>
                      </div>
                      <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","fontWeight":"700","color":"#fff"}}>
                        {r?.commentLabel}
                      </span>
                    </div>
                    <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"6px"}}>
                      <div style={{"width":"46px","height":"46px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","background":"rgba(255,255,255,.14)","border":"1px solid rgba(255,255,255,.28)","backdropFilter":"blur(14px)","color":"#fff","cursor":"pointer"}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                          <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"></path>
                          <path d="M12 16V3"></path>
                          <path d="M7 8l5-5 5 5"></path>
                        </svg>
                      </div>
                      <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","fontWeight":"700","color":"#fff"}}>
                        {"Enviar"}
                      </span>
                    </div>
                  </div>
                  <div style={{"position":"absolute","left":"0","right":"64px","bottom":"78px","padding":"0 16px","display":"flex","flexDirection":"column","gap":"9px"}}>
                    <div style={{"display":"flex","alignItems":"center","gap":"10px"}}>
                      <span style={sty(r?.avatar)}></span>
                      <span style={{"fontSize":"13px","fontWeight":"700","color":"#fff"}}>
                        {r?.user}
                      </span>
                      {r?.showFollow && (
                        <>
                          <span onClick={r?.onFollow} style={{"padding":"5px 12px","borderRadius":"999px","border":"1px solid rgba(255,255,255,.6)","fontSize":"11px","fontWeight":"700","color":"#fff","cursor":"pointer"}} className={cx(pc("hover", "background:rgba(255,255,255,.2)"))}>
                            {r?.followLabel}
                          </span>
                        </>
                      )}
                    </div>
                    <div style={{"fontSize":"13px","lineHeight":"1.45","color":"#fff","textWrap":"pretty"}}>
                      {r?.caption}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"rgba(255,255,255,.8)"}}>
                      {r?.music}
                    </div>
                  </div>
                  {r?.commentsOpen && (
                    <>
                      <div style={{"position":"absolute","left":"0","right":"0","bottom":"0","top":"40%","background":"rgba(8,6,11,.94)","backdropFilter":"blur(20px)","borderRadius":"20px 20px 0 0","display":"flex","flexDirection":"column","zIndex":"4"}}>
                        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"14px 18px","borderBottom":"1px solid rgba(255,255,255,.12)"}}>
                          <span style={{"fontSize":"13px","fontWeight":"700","color":"#fff"}}>
                            {"Comentarios"}
                          </span>
                          <span onClick={r?.onComments} style={{"color":"rgba(255,255,255,.7)","cursor":"pointer","fontSize":"18px","lineHeight":"1"}}>
                            {"×"}
                          </span>
                        </div>
                        <div style={{"flex":"1","overflowY":"auto","padding":"12px 18px","display":"flex","flexDirection":"column","gap":"12px"}}>
                          {(r?.comments ?? []).map((c: any, $index: number) => (
                            <Fragment key={$index}>
                              <div>
                                <div style={{"fontSize":"12px","fontWeight":"700","color":"#fff"}}>
                                  {c?.authorName}
                                </div>
                                <div style={{"fontSize":"12.5px","color":"rgba(255,255,255,.82)","marginTop":"2px"}}>
                                  {c?.text}
                                </div>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                        <div style={{"display":"flex","gap":"8px","padding":"12px 18px","borderTop":"1px solid rgba(255,255,255,.12)"}}>
                          <input value={r?.commentValue} onChange={r?.onCommentChange} placeholder="Escribe un comentario…" style={{"flex":"1","minWidth":"0","padding":"10px 14px","borderRadius":"999px","border":"1px solid rgba(255,255,255,.2)","background":"rgba(255,255,255,.08)","color":"#fff","fontSize":"12.5px","outline":"none","boxSizing":"border-box"}} />
                          <div onClick={r?.onSendComment} style={{"padding":"10px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#14111A","background":"var(--pink)","cursor":"pointer","whiteSpace":"nowrap"}}>
                            {"Enviar"}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Fragment>
            ))}
          </div>
          <div style={{"position":"absolute","top":"0","left":"0","right":"0","display":"flex","alignItems":"center","justifyContent":"space-between","gap":"14px","padding":"18px 18px 12px","background":"linear-gradient(rgba(0,0,0,.55),transparent)","pointerEvents":"none"}}>
            <div style={{"display":"flex","gap":"20px","pointerEvents":"auto"}}>
              <div onClick={v.pickForYou} style={sty(v.tabForYou)}>
                {"Para ti"}
              </div>
              <div onClick={v.pickFollowing} style={sty(v.tabFollowing)}>
                {"Siguiendo"}
              </div>
            </div>
            <div onClick={v.toggleMute} title={v.muteLabel} style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"34px","height":"34px","borderRadius":"50%","background":"rgba(255,255,255,.14)","border":"1px solid rgba(255,255,255,.28)","backdropFilter":"blur(12px)","color":"#fff","cursor":"pointer","pointerEvents":"auto"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M11 5L6 9H3v6h3l5 4V5z"></path>
              </svg>
            </div>
          </div>
          <div style={{"position":"absolute","bottom":"0","left":"0","right":"0","display":"flex","alignItems":"center","justifyContent":"space-around","padding":"14px 18px 20px","background":"linear-gradient(transparent,rgba(0,0,0,.75))"}}>
            <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"4px","color":"rgba(255,255,255,.6)","cursor":"pointer"}} className={cx(pc("hover", "color:#fff"))}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z"></path>
              </svg>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8px","letterSpacing":".1em"}}>
                {"INICIO"}
              </span>
            </div>
            <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"4px","color":"#fff","cursor":"pointer"}}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="18" rx="3"></rect>
                <path d="M10 8l6 4-6 4z"></path>
              </svg>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8px","letterSpacing":".1em"}}>
                {"REELS"}
              </span>
            </div>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"42px","height":"30px","borderRadius":"10px","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","color":"#1A1400","cursor":"pointer"}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </div>
            <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"4px","color":"rgba(255,255,255,.6)","cursor":"pointer"}} className={cx(pc("hover", "color:#fff"))}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"></path>
                <circle cx="10" cy="7" r="4"></circle>
              </svg>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8px","letterSpacing":".1em"}}>
                {"MURO"}
              </span>
            </div>
            <div onClick={v.goPerfil} style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"4px","color":"rgba(255,255,255,.6)","cursor":"pointer"}} className={cx(pc("hover", "color:#fff"))}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"></path>
              </svg>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8px","letterSpacing":".1em"}}>
                {"PERFIL"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
