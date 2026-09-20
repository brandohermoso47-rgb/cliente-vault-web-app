// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function ChatDock({ v }: { v: any }) {
  return (
    <>
    <div style={{"position":"fixed","right":"24px","bottom":"92px","zIndex":"60","display":"flex","flexDirection":"column","alignItems":"flex-end","gap":"14px"}}>
      {v.chatOpen && (
        <>
          <div style={{"width":"clamp(300px,26vw,360px)","height":"min(520px,70vh)","display":"flex","flexDirection":"column","borderRadius":"26px","overflow":"hidden","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge), var(--lg-lift)","animation":"rise3d .34s cubic-bezier(.2,.85,.25,1) backwards"}}>
            {v.inRoom && (
              <>
                <div style={{"display":"flex","alignItems":"center","gap":"11px","padding":"14px 16px","borderBottom":"1px solid var(--hair-soft)"}}>
                  <div onClick={v.backToRooms} style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"50%","border":"1px solid var(--hair)","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink);border-color:var(--pink)"))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                  </div>
                  <span style={sty(v.chatRoom?.avatar)}></span>
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                      {v.chatRoom?.name}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","color":"var(--ink-3)","marginTop":"3px"}}>
                      {v.chatRoom?.members}
                    </div>
                  </div>
                  <div onClick={v.closeChat} style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"28px","height":"28px","flex":"0 0 28px","borderRadius":"50%","color":"var(--ink-3)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18"></path>
                    </svg>
                  </div>
                </div>
                <div style={{"flex":"1","overflowY":"auto","padding":"16px","display":"flex","flexDirection":"column","gap":"12px"}}>
                  <div style={{"alignSelf":"flex-start","maxWidth":"80%","padding":"11px 14px","borderRadius":"18px 18px 18px 6px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontSize":"13px","lineHeight":"1.5","color":"var(--ink)"}}>
                    {v.chatRoom?.topic}
                  </div>
                  <div style={{"alignSelf":"flex-start","maxWidth":"80%","padding":"11px 14px","borderRadius":"18px 18px 18px 6px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontSize":"13px","lineHeight":"1.5","color":"var(--ink)"}}>
                    {"Brando: subid vuestro clip con el metrónomo puesto, se nota mucho en el freno."}
                  </div>
                  <div style={{"alignSelf":"flex-end","maxWidth":"80%","padding":"11px 14px","borderRadius":"18px 18px 6px 18px","background":"var(--pink)","color":"#fff","fontSize":"13px","lineHeight":"1.5"}}>
                    {"Voy con el de 112 BPM esta noche."}
                  </div>
                  <div style={{"alignSelf":"center","fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".14em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                    {"Hoy"}
                  </div>
                </div>
                <div style={{"display":"flex","alignItems":"center","gap":"9px","padding":"12px 14px","borderTop":"1px solid var(--hair-soft)"}}>
                  <input placeholder="Escribe un mensaje" style={{"flex":"1","minWidth":"0","padding":"11px 14px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontFamily":"Geist,sans-serif","fontSize":"13px","color":"var(--ink)","outline":"none"}} className={cx(pc("focus", "border-color:var(--pink)"))} />
                  <div style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"38px","height":"38px","flex":"0 0 38px","borderRadius":"50%","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","color":"#1A1400","cursor":"pointer"}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M4 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </>
            )}
            {v.chatRoomsVisible && (
              <>
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"10px","padding":"16px 16px 12px"}}>
                  <div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--pink)","fontWeight":"700","textTransform":"uppercase"}}>
                      {"Comunidad"}
                    </div>
                    <div style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"21px","fontWeight":"400","letterSpacing":"0","color":"var(--ink)","marginTop":"5px"}}>
                      {"Salas de chat"}
                    </div>
                  </div>
                  <div onClick={v.closeChat} style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"30px","height":"30px","flex":"0 0 30px","borderRadius":"50%","border":"1px solid var(--hair)","color":"var(--ink-3)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18"></path>
                    </svg>
                  </div>
                </div>
                <div style={{"padding":"0 16px 12px"}}>
                  <input value={v.chatQuery} onChange={v.onChatQuery} placeholder="Buscar sala" style={{"width":"100%","boxSizing":"border-box","padding":"11px 14px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontFamily":"Geist,sans-serif","fontSize":"13px","color":"var(--ink)","outline":"none"}} className={cx(pc("focus", "border-color:var(--pink)"))} />
                </div>
                <div style={{"flex":"1","overflowY":"auto","padding":"0 10px 12px","display":"flex","flexDirection":"column","gap":"4px"}}>
                  {(v.chatRoomList ?? []).map((r: any, $index: number) => (
                    <Fragment key={$index}>
                      <div onClick={r?.open} style={{"display":"flex","alignItems":"center","gap":"12px","padding":"11px 12px","borderRadius":"18px","border":"1px solid transparent","cursor":"pointer","transition":"background .18s ease, border-color .18s ease"}} className={cx(pc("hover", "background:var(--glass-2);border-color:var(--hair)"))}>
                        <span style={sty(r?.avatar)}></span>
                        <div style={{"flex":"1","minWidth":"0"}}>
                          <div style={{"display":"flex","alignItems":"center","gap":"7px"}}>
                            <span style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                              {r?.name}
                            </span>
                            {r?.isLive && (
                              <>
                                <span style={{"display":"inline-flex","alignItems":"center","gap":"4px","padding":"3px 8px","borderRadius":"999px","background":"var(--pink)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"7px","fontWeight":"700","letterSpacing":".12em","whiteSpace":"nowrap"}}>
                                  <span style={{"width":"3px","height":"3px","borderRadius":"50%","background":"#fff","animation":"livePulse 1.2s ease-in-out infinite"}}></span>
                                  {"VIVO"}
                                </span>
                              </>
                            )}
                          </div>
                          <div style={{"fontSize":"12px","color":"var(--ink-2)","marginTop":"4px","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                            {r?.last}
                          </div>
                        </div>
                        <div style={{"display":"flex","flexDirection":"column","alignItems":"flex-end","gap":"6px","flex":"0 0 auto"}}>
                          <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","color":"var(--ink-3)","whiteSpace":"nowrap"}}>
                            {r?.time}
                          </span>
                          {r?.hasUnread && (
                            <>
                              <span style={{"minWidth":"19px","textAlign":"center","padding":"2px 6px","borderRadius":"999px","background":"var(--purple)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700"}}>
                                {r?.unread}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
      <div onClick={v.toggleChat} style={{"position":"relative","display":"flex","alignItems":"center","justifyContent":"center","width":"58px","height":"58px","borderRadius":"50%","border":"1px solid color-mix(in oklch, var(--gold) 55%, transparent)","background":"linear-gradient(135deg,var(--gold-hi),var(--gold-lo))","boxShadow":"0 14px 30px -12px var(--gold), inset 0 1px 0 rgba(255,255,255,.45)","color":"#1A1400","cursor":"pointer","transition":"transform .2s cubic-bezier(.2,.85,.25,1)","animation":"goldEdge 4.5s ease-in-out infinite"}} className={cx(pc("hover", "transform:translateY(-3px)"))}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.9 9.9 0 01-2.8-.4L3 21l1.6-4.6A8.3 8.3 0 013 11.5 8.4 8.4 0 0112 3a8.4 8.4 0 019 8.5z"></path>
        </svg>
        <span style={{"position":"absolute","top":"-3px","right":"-3px","minWidth":"20px","padding":"2px 6px","borderRadius":"999px","background":"var(--purple)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700","textAlign":"center","border":"2px solid var(--ground)"}}>
          {v.chatTotalUnread}
        </span>
      </div>
    </div>
    </>
  );
}
