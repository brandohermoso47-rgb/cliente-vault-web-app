// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Feed({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"grid","gridTemplateColumns":"minmax(0,1.55fr) minmax(0,.85fr)","gap":"22px","alignItems":"start","maxWidth":"1180px"}}>
      <div style={{"minWidth":"0","display":"flex","flexDirection":"column","gap":"18px"}}>
        <div style={sty(v.composerPlate)}>
          <div style={{"display":"flex","gap":"14px","alignItems":"flex-start"}}>
            <span style={sty(v.myDropAvatar)}>
              {v.myInitial}
            </span>
            <div style={{"flex":"1","minWidth":"0"}}>
              <textarea value={v.feedComposerValue} onChange={v.feedComposerChange} placeholder="Escribir nueva publicación..." rows="2" style={{"width":"100%","boxSizing":"border-box","resize":"vertical","border":"none","borderBottom":"1px solid var(--hair-soft)","background":"transparent","color":"var(--ink)","fontFamily":"inherit","fontSize":"14.5px","padding":"9px 0 16px","outline":"none"}}></textarea>
              {v.feedFileName && (
                <>
                  <div style={{"display":"flex","alignItems":"center","gap":"8px","marginTop":"8px","fontSize":"11.5px","color":"var(--ink-2)"}}>
                    <span>
                      {"📎 "}
                      {v.feedFileName}
                    </span>
                    <span onClick={v.feedClearFile} style={{"cursor":"pointer","color":"var(--pink)"}}>
                      {"Quitar"}
                    </span>
                  </div>
                </>
              )}
              {v.feedComposerErr && (
                <>
                  <div style={{"marginTop":"8px","fontSize":"11.5px","color":"var(--pink)"}}>
                    {v.feedComposerErr}
                  </div>
                </>
              )}
              <div style={{"display":"flex","alignItems":"center","gap":"6px","flexWrap":"wrap","paddingTop":"14px"}}>
                {(v.feedTools ?? []).map((t: any, $index: number) => (
                  <Fragment key={$index}>
                    <div onClick={t?.pick} title={t?.name} style={sty(t?.style)} className={cx(pc("hover", "background:var(--glass-2);color:var(--pink)"))}>
                      {" "}
                      {t?.svg}
                      {" "}
                    </div>
                  </Fragment>
                ))}
                <div style={{"flex":"1"}}></div>
                <div onClick={v.feedPublish} style={sty(v.feedPublishStyle)} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                  {v.feedPublishLabel}
                </div>
              </div>
              <input id="feed-media-input" type="file" accept="image/*,video/*" onChange={v.onFeedFile} style={{"display":"none"}} />
            </div>
          </div>
        </div>
        <div style={{"display":"flex","gap":"8px","flexWrap":"wrap"}}>
          {(v.feedFilters ?? []).map((f: any, $index: number) => (
            <Fragment key={$index}>
              <div onClick={f?.pick} style={sty(f?.style)} className={cx(pc("hover", v.chipHover3d))}>
                {f?.name}
              </div>
            </Fragment>
          ))}
        </div>
        <div style={{"display":"flex","gap":"10px","overflowX":"auto","paddingBottom":"4px"}}>
          <div style={{"position":"relative","flex":"0 0 118px","aspectRatio":"4/5","maxHeight":"148px","borderRadius":"16px","overflow":"hidden","border":"1px solid var(--hair)","background":"linear-gradient(160deg, color-mix(in srgb, var(--purple) 78%, #0D0A12 22%), color-mix(in srgb, var(--pink) 58%, #0D0A12 42%))","cursor":"pointer","display":"flex","flexDirection":"column","justifyContent":"flex-end","padding":"14px"}} className={cx(pc("hover", "transform:translateY(-3px)"))}>
            <div style={{"position":"absolute","top":"14px","left":"14px","width":"32px","height":"32px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","color":"#fff","background":"rgba(255,255,255,.22)","border":"1px solid rgba(255,255,255,.5)"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14"></path>
                <path d="M5 12h14"></path>
              </svg>
            </div>
            <div style={{"position":"relative","fontSize":"12.5px","fontWeight":"700","color":"#fff","lineHeight":"1.35"}}>
              {"Añadir a la historia"}
            </div>
          </div>
          <div style={{"flex":"0 0 118px","aspectRatio":"4/5","maxHeight":"148px","borderRadius":"16px","border":"1px solid #00E5FF","background":"linear-gradient(165deg, rgba(0,229,255,.24), rgba(0,229,255,.05))","boxShadow":"0 0 26px -10px #00E5FF, var(--lg-edge)","cursor":"pointer","display":"flex","flexDirection":"column","justifyContent":"space-between","padding":"16px"}} className={cx(pc("hover", "box-shadow:0 0 34px -8px #00E5FF"))}>
            <div style={{"width":"32px","height":"32px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","color":"#02121A","background":"#00E5FF","boxShadow":"0 0 18px -4px #00E5FF"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M9 15 15 9"></path>
                <circle cx="9.5" cy="9.5" r="1.4"></circle>
                <circle cx="14.5" cy="14.5" r="1.4"></circle>
                <circle cx="12" cy="12" r="9"></circle>
              </svg>
            </div>
            <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","lineHeight":"1.35"}}>
              {"Iniciar promoción de perfil"}
            </div>
          </div>
          <div style={{"flex":"0 0 118px","aspectRatio":"4/5","maxHeight":"148px","borderRadius":"16px","border":"1px solid #C6FF00","background":"linear-gradient(165deg, rgba(198,255,0,.22), rgba(198,255,0,.05))","boxShadow":"0 0 26px -10px #C6FF00, var(--lg-edge)","cursor":"pointer","display":"flex","flexDirection":"column","justifyContent":"space-between","padding":"16px"}} className={cx(pc("hover", "box-shadow:0 0 34px -8px #C6FF00"))}>
            <div style={{"width":"32px","height":"32px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","color":"#141A00","background":"#C6FF00","boxShadow":"0 0 18px -4px #C6FF00"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M12 16V4"></path>
                <path d="m7 9 5-5 5 5"></path>
                <path d="M5 20h14"></path>
              </svg>
            </div>
            <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","lineHeight":"1.35"}}>
              {"Subir clip al Freestyle Lab"}
            </div>
          </div>
          <div style={{"flex":"0 0 118px","aspectRatio":"4/5","maxHeight":"148px","borderRadius":"16px","border":"1px solid #B14BFF","background":"linear-gradient(165deg, rgba(177,75,255,.24), rgba(177,75,255,.05))","boxShadow":"0 0 26px -10px #B14BFF, var(--lg-edge)","cursor":"pointer","display":"flex","flexDirection":"column","justifyContent":"space-between","padding":"16px"}} className={cx(pc("hover", "box-shadow:0 0 34px -8px #B14BFF"))}>
            <div style={{"width":"32px","height":"32px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","color":"#fff","background":"#B14BFF","boxShadow":"0 0 18px -4px #B14BFF"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="5" width="18" height="16" rx="3"></rect>
                <path d="M3 10h18M8 3v4M16 3v4"></path>
              </svg>
            </div>
            <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","lineHeight":"1.35"}}>
              {"Programar un directo"}
            </div>
          </div>
          <div style={{"flex":"0 0 118px","aspectRatio":"4/5","maxHeight":"148px","borderRadius":"16px","border":"1px solid #FF2E9A","background":"linear-gradient(165deg, rgba(255,46,154,.24), rgba(255,46,154,.05))","boxShadow":"0 0 26px -10px #FF2E9A, var(--lg-edge)","cursor":"pointer","display":"flex","flexDirection":"column","justifyContent":"space-between","padding":"16px"}} className={cx(pc("hover", "box-shadow:0 0 34px -8px #FF2E9A"))}>
            <div style={{"width":"32px","height":"32px","borderRadius":"50%","display":"flex","alignItems":"center","justifyContent":"center","color":"#fff","background":"#FF2E9A","boxShadow":"0 0 18px -4px #FF2E9A"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M12 20v-6"></path>
                <path d="M6 20v-10"></path>
                <path d="M18 20V6"></path>
              </svg>
            </div>
            <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","lineHeight":"1.35"}}>
              {"Ver mis estadísticas"}
            </div>
          </div>
        </div>
        {(v.feedPosts ?? []).map((p: any, $index: number) => (
          <Fragment key={$index}>
            <div style={sty(p?.card)}>
              <div style={{"display":"flex","alignItems":"flex-start","gap":"12px","padding":"18px 20px 14px"}}>
                <span style={sty(p?.avatar)}></span>
                <div style={{"flex":"1","minWidth":"0"}}>
                  <div style={{"display":"flex","alignItems":"center","gap":"7px","flexWrap":"wrap"}}>
                    <span style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                      {p?.name}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9"></circle>
                      <path d="m8.5 12 2.4 2.4 4.6-4.8"></path>
                    </svg>
                  </div>
                  <div style={{"fontSize":"11.5px","color":"var(--ink-3)","marginTop":"3px"}}>
                    {p?.handle}
                  </div>
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","whiteSpace":"nowrap"}}>
                  {p?.time}
                </div>
              </div>
              <div style={{"padding":"0 20px 14px"}}>
                <p style={{"margin":"0","fontSize":"13.5px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty"}}>
                  {p?.text}
                </p>
                <div style={{"display":"flex","alignItems":"center","gap":"7px","marginTop":"11px","fontSize":"11.5px","fontWeight":"600","color":"var(--blue)","cursor":"pointer"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"></path>
                    <circle cx="7.5" cy="7.5" r="1.1"></circle>
                  </svg>
                  {" "}
                  {p?.tags}
                  {" "}
                </div>
              </div>
              {p?.isImage && (
                <>
                  <img src={p?.mediaUrl} alt="" style={{"aspectRatio":"16/10","width":"100%","objectFit":"cover","display":"block"}} />
                </>
              )}
              {p?.isVideo && (
                <>
                  <video src={p?.mediaUrl} controls="" style={{"aspectRatio":"16/10","width":"100%","display":"block","background":"#000"}}></video>
                </>
              )}
              <div style={{"display":"flex","alignItems":"center","gap":"18px","padding":"14px 20px"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--pink)"))}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1Z"></path>
                  </svg>
                  {" "}
                  {p?.likes}
                  {" "}
                </div>
                <div style={{"display":"flex","alignItems":"center","gap":"7px","fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--pink)"))}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z"></path>
                  </svg>
                  {" "}
                  {p?.comments}
                  {" "}
                </div>
                <div style={{"flex":"1"}}></div>
                <div style={{"fontSize":"12px","fontWeight":"600","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                  {"Guardar"}
                </div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
      <div style={{"minWidth":"0","display":"flex","flexDirection":"column","gap":"16px"}}>
        <div style={{"display":"flex","alignItems":"center","gap":"10px","padding":"12px 16px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"blur(28px)","WebkitBackdropFilter":"blur(28px)","boxShadow":"var(--lg-edge)"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m20 20-3.5-3.5"></path>
          </svg>
          <span style={{"fontSize":"12.5px","color":"var(--ink-3)"}}>
            {"Buscar bailarines o publicaciones"}
          </span>
        </div>
        <div style={sty(v.railPlate)}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Amigos"}
          </div>
          <div style={{"display":"flex","gap":"6px","marginTop":"12px"}}>
            <input value={v.friendSearchValue} onChange={v.friendSearchChange} placeholder="Buscar por @usuario" style={{"flex":"1","minWidth":"0","padding":"9px 12px","borderRadius":"12px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontSize":"12px","fontFamily":"inherit","outline":"none","boxSizing":"border-box"}} />
            <div onClick={v.friendSearchGo} style={{"padding":"9px 14px","borderRadius":"12px","fontSize":"11.5px","fontWeight":"700","color":"#14111A","background":"var(--pink)","cursor":"pointer","whiteSpace":"nowrap"}}>
              {v.friendSearchLabel}
            </div>
          </div>
          {v.friendSearchErr && (
            <>
              <div style={{"marginTop":"8px","fontSize":"11px","color":"var(--pink)"}}>
                {v.friendSearchErr}
              </div>
            </>
          )}
          {v.friendSearchResult && (
            <>
              <div style={{"display":"flex","alignItems":"center","gap":"9px","marginTop":"10px","padding":"9px","borderRadius":"14px","background":"var(--glass-2)"}}>
                <div style={{"flex":"1","minWidth":"0"}}>
                  <div style={{"fontSize":"11.5px","fontWeight":"700","color":"var(--ink)","overflowWrap":"anywhere"}}>
                    {v.friendSearchResult?.name}
                  </div>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","color":"var(--ink-3)"}}>
                    {v.friendSearchResult?.handle}
                  </div>
                </div>
                <div onClick={v.friendSearchResult?.add} style={{"padding":"8px 12px","borderRadius":"999px","fontSize":"10.5px","fontWeight":"700","color":"#14111A","background":"var(--blue)","cursor":"pointer","whiteSpace":"nowrap"}}>
                  {"Agregar"}
                </div>
              </div>
            </>
          )}
          {v.friendPending && (
            <>
              <div style={{"marginTop":"16px","fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","letterSpacing":".14em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Solicitudes"}
              </div>
              <div style={{"display":"flex","flexDirection":"column","gap":"8px","marginTop":"8px"}}>
                {(v.friendPending ?? []).map((f: any, $index: number) => (
                  <Fragment key={$index}>
                    <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
                      <div style={{"flex":"1","minWidth":"0","fontSize":"11px","color":"var(--ink-2)","overflowWrap":"anywhere"}}>
                        {f?.other}
                      </div>
                      <div onClick={f?.accept} style={{"padding":"6px 10px","borderRadius":"999px","fontSize":"10px","fontWeight":"700","color":"#14111A","background":"var(--blue)","cursor":"pointer"}}>
                        {"Aceptar"}
                      </div>
                      <div onClick={f?.decline} style={{"padding":"6px 10px","borderRadius":"999px","fontSize":"10px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","cursor":"pointer"}}>
                        {"Rechazar"}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </>
          )}
          <div style={{"marginTop":"16px","fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","letterSpacing":".14em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Tus amigos"}
          </div>
          <div style={{"display":"flex","flexDirection":"column","gap":"8px","marginTop":"8px"}}>
            {v.friendList && (
              <>
                {(v.friendList ?? []).map((f: any, $index: number) => (
                  <Fragment key={$index}>
                    <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
                      <div style={{"flex":"1","minWidth":"0","fontSize":"11.5px","color":"var(--ink)","overflowWrap":"anywhere"}}>
                        {f?.other}
                      </div>
                      <div onClick={f?.remove} style={{"padding":"6px 10px","borderRadius":"999px","fontSize":"10px","fontWeight":"600","color":"var(--ink-2)","border":"1px solid var(--hair)","cursor":"pointer"}}>
                        {"Quitar"}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </>
            )}
            {v.friendListEmpty && (
              <>
                <div style={{"fontSize":"11px","color":"var(--ink-3)"}}>
                  {"Todavía no tienes amigos. Búscalos arriba."}
                </div>
              </>
            )}
          </div>
        </div>
        <div style={sty(v.railPlate)}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Suscripción"}
          </div>
          <div style={{"display":"flex","alignItems":"center","gap":"12px","marginTop":"13px","cursor":"pointer"}}>
            <div style={{"flex":"1","minWidth":"0"}}>
              <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                {"Precio de suscripción y promociones"}
              </div>
              <div style={{"fontSize":"11.5px","color":"var(--ink-3)","marginTop":"4px"}}>
                {"$10 al mes · paquetes de 2 suscripciones"}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.9" strokeLinecap="round">
              <path d="m9 6 6 6-6 6"></path>
            </svg>
          </div>
          <div style={{"marginTop":"18px","paddingTop":"18px","borderTop":"1px solid var(--hair-soft)"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"8px"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="none" style={{"flex":"0 0 14px"}}>
                <path d="m5 16-2-9 6 4 3-6 3 6 6-4-2 9H5Z"></path>
              </svg>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".18em","fontWeight":"700","color":"var(--gold)","textTransform":"uppercase"}}>
                {"Directorio de profesores globales"}
              </span>
            </div>
            <p style={{"margin":"9px 0 0","fontSize":"11.5px","lineHeight":"1.55","color":"var(--ink-3)","textWrap":"pretty"}}>
              {"Conecta con los mejores exponentes de la cultura Waack On a nivel internacional. Los instructores destacados aparecen al principio."}
            </p>
            <div style={{"marginTop":"14px","padding":"11px 14px","borderRadius":"16px","display":"flex","alignItems":"center","gap":"8px","fontSize":"12px","fontWeight":"700","lineHeight":"1.35","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5), 0 10px 22px -12px var(--gold)","cursor":"pointer","transition":"transform .18s ease"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{"flex":"0 0 14px"}}>
                <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"></path>
                <circle cx="16" cy="6" r="2"></circle>
                <circle cx="10" cy="12" r="2"></circle>
                <circle cx="18" cy="18" r="2"></circle>
              </svg>
              <span style={{"flex":"1","minWidth":"0"}}>
                {"Editar mi plataforma & precio"}
              </span>
            </div>
            <input value={v.dirQuery} onChange={v.dirSetQuery} placeholder="Especialidad o país…" style={{"width":"100%","marginTop":"10px","padding":"11px 14px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontSize":"12px","fontFamily":"inherit","outline":"none","boxSizing":"border-box"}} />
            <div style={{"marginTop":"10px","padding":"10px 14px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass-2)","textAlign":"center","fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","lineHeight":"1.5","letterSpacing":".1em","fontWeight":"700","color":"var(--ink-2)","textTransform":"uppercase","cursor":"pointer","transition":"color .18s ease"}} className={cx(pc("hover", "color:var(--gold)"))}>
              {"¿Eres instructor? Regístrate gratis"}
            </div>
            {v.dirEmpty && (
              <>
                <div style={{"padding":"22px 0 4px","textAlign":"center","fontSize":"12px","lineHeight":"1.55","color":"var(--ink-3)"}}>
                  {"Ningún profesor coincide con ese filtro."}
                </div>
              </>
            )}
            <div className="dir-marquee" style={{"position":"relative","marginTop":"16px","maxHeight":"430px","overflow":"hidden","WebkitMaskImage":"linear-gradient(180deg,transparent 0,#000 26px,#000 calc(100% - 26px),transparent 100%)","maskImage":"linear-gradient(180deg,transparent 0,#000 26px,#000 calc(100% - 26px),transparent 100%)"}}>
              <div className="dir-track" style={sty(v.dirTrackStyle)}>
                {(v.dirTeachers ?? []).map((d: any, $index: number) => (
                  <Fragment key={$index}>
                    <div style={sty(d?.card)} className={cx(pc("hover", "transform:translateY(-2px);border-color:color-mix(in oklch, var(--gold) 45%, transparent)"))}>
                      {d?.hi && (
                        <>
                          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"7.5px","letterSpacing":".14em","fontWeight":"700","color":"var(--gold)","textTransform":"uppercase","marginBottom":"9px"}}>
                            {"★ Destacado"}
                          </div>
                        </>
                      )}
                      <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
                        <div style={sty(d?.av)}>
                          {d?.ini}
                        </div>
                        <div style={{"flex":"1","minWidth":"0"}}>
                          <div style={{"fontSize":"12px","fontWeight":"700","lineHeight":"1.3","color":"var(--ink)","overflowWrap":"anywhere"}}>
                            {d?.name}
                          </div>
                          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","lineHeight":"1.4","letterSpacing":".1em","color":"var(--ink-3)","textTransform":"uppercase","marginTop":"4px","overflowWrap":"anywhere"}}>
                            {d?.country}
                          </div>
                        </div>
                      </div>
                      <div style={sty(d?.priceStyle)}>
                        {d?.price}
                      </div>
                      <div style={{"display":"flex","gap":"5px","flexWrap":"wrap","marginTop":"10px"}}>
                        {(d?.sp ?? []).map((s: any, $index: number) => (
                          <Fragment key={$index}>
                            <span style={{"padding":"4px 9px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass)","fontSize":"9px","lineHeight":"1.35","fontWeight":"600","color":"var(--ink-2)","overflowWrap":"anywhere"}}>
                              {s?.text}
                            </span>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{"display":"flex","alignItems":"center","gap":"6px","flexWrap":"wrap","marginTop":"11px"}}>
                        <span style={{"fontSize":"11px","fontWeight":"700","color":"var(--gold)"}}>
                          {"★ "}
                          {d?.rating}
                        </span>
                        <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","color":"var(--ink-3)"}}>
                          {"("}
                          {d?.votes}
                          {")"}
                        </span>
                      </div>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","color":"var(--ink-3)","marginTop":"5px","overflowWrap":"anywhere"}}>
                        {d?.handle}
                      </div>
                      <div style={{"marginTop":"11px","padding":"9px 12px","borderRadius":"13px","border":"1px solid color-mix(in oklch, var(--gold) 40%, transparent)","background":"color-mix(in oklch, var(--gold) 10%, transparent)","textAlign":"center","fontFamily":"'Geist Mono',monospace","fontSize":"9px","lineHeight":"1.4","letterSpacing":".08em","fontWeight":"700","color":"var(--gold)","textTransform":"uppercase","cursor":"pointer","transition":"background .18s ease"}} className={cx(pc("hover", "background:color-mix(in oklch, var(--gold) 20%, transparent)"))}>
                        {"Ver plan mensual →"}
                      </div>
                    </div>
                  </Fragment>
                ))}
                {(v.dirTeachersLoop ?? []).map((d: any, $index: number) => (
                  <Fragment key={$index}>
                    <div aria-hidden="true" style={sty(d?.card)} className={cx(pc("hover", "transform:translateY(-2px);border-color:color-mix(in oklch, var(--gold) 45%, transparent)"))}>
                      {d?.hi && (
                        <>
                          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"7.5px","letterSpacing":".14em","fontWeight":"700","color":"var(--gold)","textTransform":"uppercase","marginBottom":"9px"}}>
                            {"★ Destacado"}
                          </div>
                        </>
                      )}
                      <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
                        <div style={sty(d?.av)}>
                          {d?.ini}
                        </div>
                        <div style={{"flex":"1","minWidth":"0"}}>
                          <div style={{"fontSize":"12px","fontWeight":"700","lineHeight":"1.3","color":"var(--ink)","overflowWrap":"anywhere"}}>
                            {d?.name}
                          </div>
                          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","lineHeight":"1.4","letterSpacing":".1em","color":"var(--ink-3)","textTransform":"uppercase","marginTop":"4px","overflowWrap":"anywhere"}}>
                            {d?.country}
                          </div>
                        </div>
                      </div>
                      <div style={sty(d?.priceStyle)}>
                        {d?.price}
                      </div>
                      <div style={{"display":"flex","gap":"5px","flexWrap":"wrap","marginTop":"10px"}}>
                        {(d?.sp ?? []).map((s: any, $index: number) => (
                          <Fragment key={$index}>
                            <span style={{"padding":"4px 9px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass)","fontSize":"9px","lineHeight":"1.35","fontWeight":"600","color":"var(--ink-2)","overflowWrap":"anywhere"}}>
                              {s?.text}
                            </span>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{"display":"flex","alignItems":"center","gap":"6px","flexWrap":"wrap","marginTop":"11px"}}>
                        <span style={{"fontSize":"11px","fontWeight":"700","color":"var(--gold)"}}>
                          {"★ "}
                          {d?.rating}
                        </span>
                        <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","color":"var(--ink-3)"}}>
                          {"("}
                          {d?.votes}
                          {")"}
                        </span>
                      </div>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","color":"var(--ink-3)","marginTop":"5px","overflowWrap":"anywhere"}}>
                        {d?.handle}
                      </div>
                      <div style={{"marginTop":"11px","padding":"9px 12px","borderRadius":"13px","border":"1px solid color-mix(in oklch, var(--gold) 40%, transparent)","background":"color-mix(in oklch, var(--gold) 10%, transparent)","textAlign":"center","fontFamily":"'Geist Mono',monospace","fontSize":"9px","lineHeight":"1.4","letterSpacing":".08em","fontWeight":"700","color":"var(--gold)","textTransform":"uppercase","cursor":"pointer","transition":"background .18s ease"}} className={cx(pc("hover", "background:color-mix(in oklch, var(--gold) 20%, transparent)"))}>
                        {"Ver plan mensual →"}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={sty(v.railPlate)}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Eventos programados"}
          </div>
          <p style={{"margin":"11px 0 0","fontSize":"11.5px","lineHeight":"1.55","color":"var(--ink-2)","textWrap":"pretty"}}>
            {"Programa publicaciones, mensajes y directos para sostener tu presencia, y míralos en el calendario."}
          </p>
          <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"10px","padding":"26px 0 18px"}}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="5" width="18" height="16" rx="3"></rect>
              <path d="M3 10h18M8 3v4M16 3v4"></path>
            </svg>
            <span style={{"fontSize":"12px","color":"var(--ink-3)"}}>
              {"No tienes eventos programados."}
            </span>
          </div>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"center","padding":"13px","borderRadius":"14px","border":"1px dashed var(--hair)","background":"var(--glass-2)","color":"var(--ink-2)","cursor":"pointer"}} className={cx(pc("hover", "border-color:var(--pink);color:var(--pink)"))}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
          </div>
          <div style={{"textAlign":"right","marginTop":"13px","fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".14em","fontWeight":"700","color":"var(--blue)","textTransform":"uppercase","cursor":"pointer"}}>
            {"Ver el archivo"}
          </div>
        </div>
        {v.isDocente && (
          <>
            <div style={sty(v.railPlate)}>
              <div style={{"display":"flex","alignItems":"baseline","gap":"9px"}}>
                <span style={{"fontSize":"17px","fontWeight":"700","letterSpacing":"-0.01em","color":"var(--blue)"}}>
                  {"Mensajes PPV"}
                </span>
              </div>
              <div style={{"width":"34px","height":"3px","borderRadius":"999px","background":"var(--blue)","marginTop":"7px"}}></div>
              <p style={{"margin":"13px 0 0","fontSize":"12px","lineHeight":"1.55","color":"var(--ink-2)","textWrap":"pretty"}}>
                {"Envía clips o correcciones de pago único a tus seguidores. Ellos desbloquean el mensaje y tú cobras al instante."}
              </p>
              <div style={{"marginTop":"15px","padding":"12px 18px","borderRadius":"999px","textAlign":"center","fontSize":"12.5px","fontWeight":"700","color":"#F6F8FC","background":"color-mix(in srgb, var(--blue) 82%, #0D0A12)","boxShadow":"0 10px 22px -10px var(--blue)","cursor":"pointer"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                {"Crear mensaje PPV"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
