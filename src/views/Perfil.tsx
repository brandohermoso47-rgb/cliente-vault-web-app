// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Perfil({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"22px","maxWidth":"1080px"}}>
      <div style={sty(v.fisPlate)}>
        <div style={{"display":"flex","gap":"30px","alignItems":"flex-start","flexWrap":"wrap"}}>
          <div style={{"width":"132px","height":"132px","flex":"0 0 132px","borderRadius":"50%","padding":"3px","background":"linear-gradient(135deg,var(--pink),var(--purple),var(--blue))","boxShadow":"0 18px 40px -20px var(--purple)","position":"relative"}}>
            <div onClick={v.onMyAvatarPick} title="Cambiar foto de perfil" style={sty(v.perfAvatarStyle)}>
              {v.myInitial}
            </div>
            {v.perfAvatarBusy && (
              <>
                <div style={{"position":"absolute","inset":"3px","borderRadius":"50%","background":"rgba(0,0,0,.55)","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontFamily":"'Geist Mono',monospace","fontSize":"12px"}}>
                  {v.perfAvatarPct}
                </div>
              </>
            )}
            <div onClick={v.onMyAvatarPick} title="Cambiar foto de perfil" style={{"position":"absolute","right":"2px","bottom":"2px","width":"30px","height":"30px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","color":"#fff","background":"var(--purple)","border":"2px solid var(--ground)","cursor":"pointer"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h3l2-3h6l2 3h3v13H4Z"></path>
                <circle cx="12" cy="13" r="3.5"></circle>
              </svg>
            </div>
            <input id="perf-avatar-input" type="file" accept="image/*" onChange={v.onMyAvatarFile} style={{"display":"none"}} />
          </div>
          <div style={{"flex":"1","minWidth":"260px","display":"flex","flexDirection":"column","gap":"16px"}}>
            {v.perfAvatarErr && (
              <>
                <div style={{"fontSize":"11.5px","color":"var(--pink)"}}>
                  {v.perfAvatarErr}
                </div>
              </>
            )}
            <div style={{"display":"flex","alignItems":"center","gap":"14px","flexWrap":"wrap"}}>
              <div style={{"fontSize":"22px","fontWeight":"800","letterSpacing":"-.02em","color":"var(--ink)"}}>
                {v.myHandle}
              </div>
              <div style={{"display":"inline-flex","alignItems":"center","gap":"6px","padding":"5px 11px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".14em","color":"var(--ink-2)","textTransform":"uppercase"}}>
                {"Nivel 2"}
              </div>
              <div style={{"flex":"1"}}></div>
              <div onClick={v.perfOpenUpload} style={{"padding":"11px 20px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"var(--pink)","boxShadow":"0 10px 22px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)","cursor":"pointer","whiteSpace":"nowrap","transition":"transform .18s ease"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                {"Subir contenido"}
              </div>
              <div style={{"padding":"11px 20px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"600","color":"var(--ink-2)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer","whiteSpace":"nowrap","transition":"color .18s ease"}} className={cx(pc("hover", "color:var(--ink)"))}>
                {"Editar perfil"}
              </div>
            </div>
            <div style={{"display":"flex","gap":"34px","flexWrap":"wrap"}}>
              <div>
                <div style={{"fontSize":"19px","fontWeight":"800","color":"var(--ink)","fontVariantNumeric":"tabular-nums"}}>
                  {v.perfCount}
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase","marginTop":"4px"}}>
                  {"Publicaciones"}
                </div>
              </div>
              <div>
                <div style={{"fontSize":"19px","fontWeight":"800","color":"var(--ink)","fontVariantNumeric":"tabular-nums"}}>
                  {"1.284"}
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase","marginTop":"4px"}}>
                  {"Seguidores"}
                </div>
              </div>
              <div>
                <div style={{"fontSize":"19px","fontWeight":"800","color":"var(--ink)","fontVariantNumeric":"tabular-nums"}}>
                  {v.perfFollowing}
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase","marginTop":"4px"}}>
                  {"Siguiendo"}
                </div>
              </div>
            </div>
            <div style={{"maxWidth":"520px"}}>
              <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                {"Sara Molina"}
              </div>
              <div style={{"fontSize":"12.5px","lineHeight":"1.6","color":"var(--ink-2)","marginTop":"6px","textWrap":"pretty"}}>
                {"Waacking desde 2023. Cátedra de Lorena. Entrenando arm control a 128 BPM. Madrid."}
              </div>
            </div>
          </div>
        </div>
        <div style={{"display":"flex","gap":"16px","overflowX":"auto","marginTop":"26px","paddingTop":"22px","borderTop":"1px solid var(--hair)"}}>
          {(v.perfHighlights ?? []).map((h: any, $index: number) => (
            <Fragment key={$index}>
              <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"8px","cursor":"pointer","flex":"0 0 auto"}}>
                <div style={sty(h?.ring)}>
                  <div style={{"width":"100%","height":"100%","borderRadius":"50%","border":"2px solid var(--ground)","background":"var(--glass-2)","display":"flex","alignItems":"center","justifyContent":"center","fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-2)"}}>
                    {h?.n}
                  </div>
                </div>
                <span style={{"fontSize":"10.5px","lineHeight":"1.3","color":"var(--ink-3)","width":"84px","textAlign":"center","textWrap":"pretty"}}>
                  {h?.label}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{"position":"relative","zIndex":"40","alignSelf":"flex-start"}}>
        <div onClick={v.agPanelToggle} style={sty(v.agPanelBtn)} className={cx(pc("hover", "border-color:color-mix(in oklch, var(--pink) 50%, transparent)"))}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="1.8" strokeLinecap="round" style={{"flex":"0 0 17px"}}>
            <rect x="3" y="5" width="18" height="16" rx="3"></rect>
            <path d="M3 10h18M8 3v4M16 3v4"></path>
          </svg>
          {' '}
          <span style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap"}}>
            {"Mis clases agendadas"}
          </span>
          {' '}
          <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","fontWeight":"700","letterSpacing":".1em","color":"#14111A","background":"var(--pink)","padding":"3px 8px","borderRadius":"999px"}}>
            {v.agCount}
          </span>
        </div>
        {v.agPanelOpen && (
          <>
            <div onClick={v.agPanelClose} style={{"position":"fixed","inset":"0","zIndex":"1500"}}></div>
            <div style={{"position":"absolute","top":"52px","left":"0","zIndex":"1501","width":"min(420px,86vw)","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(34px) saturate(180%)","WebkitBackdropFilter":"blur(34px) saturate(180%)","boxShadow":"0 30px 70px -30px rgba(0,0,0,.75), var(--lg-edge)","padding":"16px","animation":"rise3d .26s cubic-bezier(.2,.85,.25,1)"}}>
              <div style={{"display":"flex","alignItems":"center","gap":"10px"}}>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                  {"Agenda de Sara"}
                </div>
                <div style={{"flex":"1"}}></div>
                <div onClick={v.agPanelClose} style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink-3)","cursor":"pointer","lineHeight":"1","padding":"2px 4px"}}>
                  {"×"}
                </div>
              </div>
              <div style={{"display":"flex","gap":"6px","flexWrap":"wrap","marginTop":"12px"}}>
                {(v.agTabs ?? []).map((t: any, $index: number) => (
                  <Fragment key={$index}>
                    <div onClick={t?.pick} style={sty(t?.style)}>
                      {t?.label}
                    </div>
                  </Fragment>
                ))}
              </div>
              <div style={{"display":"flex","flexDirection":"column","gap":"8px","marginTop":"12px","maxHeight":"330px","overflowY":"auto"}}>
                {(v.agList ?? []).map((a: any, $index: number) => (
                  <Fragment key={$index}>
                    <div>
                      <div onClick={a?.toggle} style={sty(a?.row)} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                        <div style={sty(a?.date)}>
                          <div style={sty(a?.dayStyle)}>
                            {a?.day}
                          </div>
                          <div style={sty(a?.hourStyle)}>
                            {a?.hour}
                          </div>
                        </div>
                        <div style={{"flex":"1","minWidth":"0"}}>
                          <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","lineHeight":"1.35","textWrap":"pretty"}}>
                            {a?.title}
                          </div>
                          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".08em","color":"var(--ink-3)","marginTop":"5px","textTransform":"uppercase"}}>
                            {a?.teacher}
                            {" · "}
                            {a?.dur}
                          </div>
                        </div>
                        {' '}
                        <span style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink-3)","width":"14px","textAlign":"center"}}>
                          {a?.arrow}
                        </span>
                      </div>
                      {a?.open && (
                        <>
                          <div style={{"margin":"7px 0 2px 12px","padding":"12px 14px","borderRadius":"15px","border":"1px solid var(--hair)","background":"var(--glass)","display":"flex","gap":"12px","alignItems":"center","flexWrap":"wrap"}}>
                            <div style={{"flex":"1","minWidth":"160px"}}>
                              <div style={{"fontSize":"12px","lineHeight":"1.55","color":"var(--ink-2)","textWrap":"pretty"}}>
                                {a?.note}
                              </div>
                              <div style={{"display":"flex","alignItems":"center","gap":"8px","flexWrap":"wrap","marginTop":"8px"}}>
                                <span style={sty(a?.tag)}>
                                  {a?.mode}
                                </span>
                                <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".1em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                                  {a?.place}
                                </span>
                              </div>
                            </div>
                            <div style={sty(a?.ctaStyle)}>
                              {a?.cta}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{"display":"flex","gap":"20px","flexWrap":"wrap","alignItems":"flex-start"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"16px","minWidth":"280px","flex":"3 1 320px"}}>
          <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
            {(v.perfTabs ?? []).map((t: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={t?.pick} style={sty(t?.style)}>
                  {t?.label}
                </div>
              </Fragment>
            ))}
          </div>
          {v.perfEmpty && (
            <>
              <div style={sty(v.statCard)}>
                <div style={{"padding":"30px 0","textAlign":"center","fontSize":"12.5px","lineHeight":"1.6","color":"var(--ink-3)","textWrap":"pretty"}}>
                  {"Aún no hay nada en esta pestaña. Sube un clip o una foto para empezar tu archivo."}
                </div>
              </div>
            </>
          )}
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fill,minmax(190px,1fr))","gap":"12px"}}>
            {(v.perfMedia ?? []).map((m: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={m?.open} style={sty(m?.tile)} className={cx(pc("hover", "transform:translateY(-3px)"))}>
                  <div style={{"position":"absolute","inset":"0","background":"rgba(10,8,14,.36)","opacity":"0","transition":"opacity .2s ease","display":"flex","alignItems":"flex-end","padding":"12px"}} className={cx(pc("hover", "opacity:1"))}>
                    <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"#fff"}}>
                      {"♥ "}
                      {m?.likes}
                    </span>
                  </div>
                  <div style={{"position":"absolute","top":"10px","right":"10px","padding":"4px 9px","borderRadius":"999px","background":"rgba(10,8,14,.55)","backdropFilter":"blur(8px)","fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".1em","color":"#fff"}}>
                    {m?.badge}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"18px","position":"sticky","top":"12px","flex":"1 1 220px","minWidth":"210px","maxWidth":"320px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"11px","padding":"14px 18px","borderRadius":"18px","border":"1px solid var(--hair)","background":"var(--glass-2)","boxShadow":"var(--lg-edge)","cursor":"pointer","transition":"transform .18s ease, border-color .18s ease"}} className={cx(pc("hover", "transform:translateY(-1px);border-color:color-mix(in oklch, var(--blue) 45%, transparent)"))}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" style={{"flex":"0 0 17px"}}>
              <rect x="3" y="4" width="18" height="16" rx="2"></rect>
              <circle cx="8.5" cy="9.5" r="1.8"></circle>
              <path d="m4 17 5-5 4 4 3-2 4 4"></path>
            </svg>
            <span style={{"flex":"1","fontSize":"12.5px","fontWeight":"700","color":"var(--ink)"}}>
              {"Ver archivo"}
            </span>
            <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","fontVariantNumeric":"tabular-nums"}}>
              {v.perfCount}
            </span>
          </div>
        </div>
      </div>
      {v.perfUploadOpen && (
        <>
          <div onClick={v.perfCloseUpload} style={{"position":"fixed","inset":"0","zIndex":"90","background":"rgba(10,8,14,.72)","backdropFilter":"blur(18px)","WebkitBackdropFilter":"blur(18px)","display":"flex","alignItems":"center","justifyContent":"center","padding":"28px"}}>
            <div onClick={v.stopProp} style={{"width":"100%","maxWidth":"470px","borderRadius":"28px","border":"1px solid var(--hair)","background":"var(--glass)","boxShadow":"0 40px 90px -40px rgba(0,0,0,.8), var(--lg-edge)","padding":"28px"}}>
              <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"16px"}}>
                <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                  {"Nueva publicación"}
                </span>
                <div onClick={v.perfCloseUpload} style={{"fontSize":"20px","lineHeight":"1","color":"var(--ink-3)","cursor":"pointer","padding":"2px 6px"}} className={cx(pc("hover", "color:var(--pink)"))}>
                  {"×"}
                </div>
              </div>
              <div style={{"display":"flex","gap":"9px","marginTop":"20px"}}>
                {(v.perfKinds ?? []).map((k: any, $index: number) => (
                  <Fragment key={$index}>
                    <div onClick={k?.pick} style={sty(k?.style)}>
                      {k?.label}
                    </div>
                  </Fragment>
                ))}
              </div>
              <div style={{"marginTop":"18px","borderRadius":"20px","border":"1px dashed var(--hair)","background":"var(--glass-2)","padding":"34px 20px","textAlign":"center"}}>
                <div style={{"fontSize":"13px","fontWeight":"700","color":"var(--ink)"}}>
                  {v.perfDropTitle}
                </div>
                <div style={{"fontSize":"12px","lineHeight":"1.55","color":"var(--ink-3)","marginTop":"7px","textWrap":"pretty"}}>
                  {v.perfDropHint}
                </div>
              </div>
              <input value={v.perfDraft} onChange={v.perfSetDraft} placeholder="Escribe un pie de publicación" style={{"width":"100%","marginTop":"16px","padding":"13px 16px","borderRadius":"15px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontSize":"12.5px","fontFamily":"inherit","outline":"none","boxSizing":"border-box"}} />
              <div style={{"display":"flex","gap":"10px","marginTop":"20px"}}>
                <div onClick={v.perfCloseUpload} style={{"flex":"1","padding":"13px 18px","borderRadius":"999px","textAlign":"center","fontSize":"12.5px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                  {"Cancelar"}
                </div>
                <div onClick={v.perfPublish} style={{"flex":"1","padding":"13px 18px","borderRadius":"999px","textAlign":"center","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"var(--pink)","boxShadow":"0 10px 22px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)","cursor":"pointer","transition":"transform .18s ease"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                  {"Publicar"}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
}
