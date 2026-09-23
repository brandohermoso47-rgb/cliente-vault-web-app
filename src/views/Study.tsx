// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Study({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"26px","maxWidth":"1180px"}}>
      <div>
        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
          {"Plan de Estudio"}
        </div>
        <div style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"32px","color":"var(--ink)","marginTop":"6px"}}>
          {"Historia y técnica del Waacking"}
        </div>
        <div style={{"fontSize":"13.5px","color":"var(--ink-2)","marginTop":"6px","maxWidth":"640px","textWrap":"pretty"}}>
          {"Seis módulos interactivos, en el orden en que se van desbloqueando: historia, técnica, significado cultural, figuras notables, waacking vs. voguing, y revival global."}
        </div>
      </div>
      {v.studyLocked && (
        <>
          <div style={{"display":"flex","alignItems":"center","gap":"18px","padding":"24px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass-2)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
            <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"48px","height":"48px","flex":"0 0 48px","borderRadius":"14px","color":"var(--yellow)","border":"1px solid var(--yellow)","background":"color-mix(in oklch, var(--yellow) 16%, transparent)"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <div style={{"flex":"1","minWidth":"220px"}}>
              <div style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink)"}}>
                {"Disponible con Usuario Premium"}
              </div>
              <div style={{"fontSize":"12.5px","color":"var(--ink-2)","marginTop":"4px","textWrap":"pretty"}}>
                {"El Plan de Estudio Interactivo es parte de la suscripción de plataforma ($15/mes). Incluye los 6 módulos, los quizzes y tu progreso guardado en tu cuenta."}
              </div>
            </div>
            <div onClick={v.goPlanes} style={{"padding":"12px 20px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
              {"Suscribirme"}
            </div>
          </div>
        </>
      )}
      {v.hasPlatform && (
        <>
          <div style={sty(v.cardGrid)}>
            {(v.studyModuleList ?? []).map((m: any, $index: number) => (
              <Fragment key={$index}>
                <div onClick={m?.pick} style={sty(m?.card)}>
                  <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"10px"}}>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                      {"Módulo "}
                      {m?.order}
                    </div>
                    {m?.showBadge && (
                      <>
                        <span style={sty(m?.badgeStyle)}>
                          {m?.badge}
                        </span>
                      </>
                    )}
                  </div>
                  <div style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink)"}}>
                    {m?.title}
                  </div>
                  <div style={{"fontSize":"12.5px","color":"var(--ink-2)","textWrap":"pretty"}}>
                    {m?.description}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          {v.studyHasActive && (
            <>
              <div style={{"display":"flex","flexDirection":"column","gap":"20px","padding":"24px","borderRadius":"24px","border":"1px solid var(--hair)","background":"var(--glass-2)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
                <div>
                  <div style={{"fontSize":"18px","fontWeight":"700","color":"var(--ink)"}}>
                    {v.studyActiveTitle}
                  </div>
                  <div style={{"fontSize":"12.5px","color":"var(--ink-2)","marginTop":"4px","textWrap":"pretty"}}>
                    {v.studyActiveDescription}
                  </div>
                </div>
                {v.studyShowTimeline && (
                  <>
                    <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
                      <div style={{"display":"flex","gap":"10px","flexWrap":"wrap"}}>
                        {(v.studyTimelinePills ?? []).map((t: any, $index: number) => (
                          <Fragment key={$index}>
                            <div onClick={t?.pick} style={sty(t?.style)}>
                              {t?.year}
                              {" · "}
                              {t?.title}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{"padding":"18px","borderRadius":"16px","background":"var(--glass)","border":"1px solid var(--hair-soft)"}}>
                        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
                          {v.studyTimelineDetailYear}
                        </div>
                        <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)","marginTop":"4px"}}>
                          {v.studyTimelineDetailTitle}
                        </div>
                        <div style={{"fontSize":"13px","color":"var(--ink-2)","marginTop":"8px","textWrap":"pretty"}}>
                          {v.studyTimelineDetailText}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {v.studyShowChecklist && (
                  <>
                    <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","color":"var(--ink-3)"}}>
                        {v.studyChecklistDoneLabel}
                      </div>
                      {(v.studyChecklist ?? []).map((c: any, $index: number) => (
                        <Fragment key={$index}>
                          <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"14px 16px","borderRadius":"16px","border":"1px solid var(--hair)","background":"var(--glass)","flexWrap":"wrap"}}>
                            <div style={{"flex":"1","minWidth":"180px"}}>
                              <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                                {c?.name}
                              </div>
                              <div style={{"fontSize":"12px","color":"var(--ink-2)","marginTop":"3px","textWrap":"pretty"}}>
                                {c?.text}
                              </div>
                            </div>
                            <div onClick={c?.toggle} style={sty(c?.btn)}>
                              {c?.btnLabel}
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </>
                )}
                {v.studyShowReflection && (
                  <>
                    <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
                      {(v.studyReflectionCards ?? []).map((r: any, $index: number) => (
                        <Fragment key={$index}>
                          <div style={{"display":"flex","flexDirection":"column","gap":"10px","padding":"16px","borderRadius":"18px","border":"1px solid var(--hair)","background":"var(--glass)"}}>
                            <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                              {r?.question}
                            </div>
                            <textarea value={r?.value} onChange={r?.change} placeholder="Escribe tu respuesta…" rows="3" style={{"width":"100%","boxSizing":"border-box","padding":"12px","borderRadius":"12px","border":"1px solid var(--hair)","background":"var(--glass-2)","color":"var(--ink)","fontFamily":"inherit","fontSize":"13px","outline":"none","resize":"vertical"}}></textarea>
                            <div onClick={r?.save} style={{"alignSelf":"flex-end","padding":"9px 16px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass)","cursor":"pointer"}}>
                              {"Guardar"}
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </>
                )}
                {v.studyShowGallery && (
                  <>
                    <div style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","color":"var(--ink-3)"}}>
                        {v.studyMatchCountLabel}
                      </div>
                      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(260px,1fr))","gap":"20px"}}>
                        <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
                          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                            {"Pioneros"}
                          </div>
                          {(v.studyPioneers ?? []).map((p: any, $index: number) => (
                            <Fragment key={$index}>
                              <div onClick={p?.pick} style={sty(p?.card)}>
                                <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                                  {p?.name}
                                </div>
                                <div style={{"fontSize":"11.5px","color":"var(--ink-2)"}}>
                                  {p?.role}
                                </div>
                                <div style={{"fontSize":"11.5px","color":"var(--ink-3)","textWrap":"pretty"}}>
                                  {p?.bio}
                                </div>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                        <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
                          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                            {"Íconos modernos"}
                          </div>
                          {(v.studyModernIcons ?? []).map((i: any, $index: number) => (
                            <Fragment key={$index}>
                              <div onClick={i?.pick} style={sty(i?.card)}>
                                <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                                  {i?.name}
                                </div>
                                <div style={{"fontSize":"11.5px","color":"var(--ink-2)"}}>
                                  {i?.role}
                                </div>
                                <div style={{"fontSize":"11.5px","color":"var(--ink-3)","textWrap":"pretty"}}>
                                  {i?.bio}
                                </div>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {v.studyShowCompare && (
                  <>
                    <div style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
                      <div style={{"display":"flex","gap":"10px"}}>
                        <div onClick={v.studySetWaack} style={sty(v.studyCompareWaackBtn)}>
                          {"Waacking"}
                        </div>
                        <div onClick={v.studySetVogue} style={sty(v.studyCompareVogueBtn)}>
                          {"Voguing"}
                        </div>
                      </div>
                      {(v.studyCompareRows ?? []).map((row: any, $index: number) => (
                        <Fragment key={$index}>
                          <div style={{"display":"grid","gridTemplateColumns":"140px 1fr 1fr","gap":"14px","padding":"14px 16px","borderRadius":"14px","border":"1px solid var(--hair)","background":"var(--glass)"}}>
                            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
                              {row?.axis}
                            </div>
                            <div style={sty(row?.waackingStyle)}>
                              {row?.waacking}
                            </div>
                            <div style={sty(row?.voguingStyle)}>
                              {row?.voguing}
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </>
                )}
                {v.studyShowMap && (
                  <>
                    <div style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
                      <div style={{"display":"flex","gap":"10px","flexWrap":"wrap"}}>
                        {(v.studyHubs ?? []).map((h: any, $index: number) => (
                          <Fragment key={$index}>
                            <div onClick={h?.pick} style={sty(h?.style)}>
                              {h?.place}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{"padding":"16px","borderRadius":"16px","background":"var(--glass)","border":"1px solid var(--hair-soft)","fontSize":"13px","color":"var(--ink-2)","textWrap":"pretty"}}>
                        {v.studyHubDetail}
                      </div>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase","marginTop":"6px"}}>
                        {"Línea de tiempo del revival"}
                      </div>
                      {(v.studyRevivalList ?? []).map((rv: any, $index: number) => (
                        <Fragment key={$index}>
                          <div style={{"display":"flex","gap":"14px","alignItems":"baseline"}}>
                            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","fontWeight":"700","color":"var(--yellow)","minWidth":"60px"}}>
                              {rv?.year}
                            </div>
                            <div style={{"fontSize":"12.5px","color":"var(--ink-2)"}}>
                              {rv?.text}
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </>
                )}
                <div style={{"display":"flex","flexDirection":"column","gap":"14px","paddingTop":"18px","borderTop":"1px solid var(--hair-soft)"}}>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                    {"Quiz corto"}
                  </div>
                  {(v.studyQuizList ?? []).map((q: any, $index: number) => (
                    <Fragment key={$index}>
                      <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
                        <div style={{"fontSize":"13.5px","fontWeight":"700","color":"var(--ink)"}}>
                          {q?.text}
                        </div>
                        <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
                          {(q?.options ?? []).map((opt: any, $index: number) => (
                            <Fragment key={$index}>
                              <div onClick={opt?.pick} style={sty(opt?.style)}>
                                {opt?.label}
                              </div>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                  <div style={{"display":"flex","alignItems":"center","gap":"14px","flexWrap":"wrap"}}>
                    {v.studyQuizNotSubmitted && (
                      <>
                        <div onClick={v.studySubmitQuizClick} style={{"padding":"11px 20px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"var(--yellow)","cursor":"pointer"}}>
                          {"Enviar respuestas"}
                        </div>
                      </>
                    )}
                    {v.studyQuizSubmitted && (
                      <>
                        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"12px","color":"var(--yellow)","fontWeight":"700"}}>
                          {v.studyQuizScoreLabel}
                        </div>
                        {v.studyHasNextModule && (
                          <>
                            <div onClick={v.studyGoNextClick} style={{"padding":"11px 20px","borderRadius":"999px","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"var(--yellow)","cursor":"pointer"}}>
                              {"Módulo completado · Siguiente →"}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
    </>
  );
}
