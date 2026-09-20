// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Instructor({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"24px","maxWidth":"1180px"}}>
      <div style={{"display":"flex","gap":"9px","flexWrap":"wrap"}}>
        {(v.insTabList ?? []).map((t: any, $index: number) => (
          <Fragment key={$index}>
            <div onClick={t?.pick} style={sty(t?.style)}>
              <span>
                {t?.label}
              </span>
              {' '}
              {t?.hasBadge && (
                <>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","opacity":".75"}}>
                    {t?.badge}
                  </span>
                </>
              )}
            </div>
          </Fragment>
        ))}
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"11px","padding":"16px 18px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--gold-text)","fontWeight":"700","textTransform":"uppercase"}}>
          {"Estudiante filtrado"}
        </div>
        <div style={{"display":"flex","gap":"9px","flexWrap":"wrap"}}>
          {(v.insChips ?? []).map((c: any, $index: number) => (
            <Fragment key={$index}>
              <div onClick={c?.pick} style={sty(c?.style)}>
                {c?.name}
              </div>
            </Fragment>
          ))}
        </div>
        <div style={{"fontSize":"12.5px","color":"var(--ink-2)"}}>
          {"Selecciona un alumno para mantener el contexto entre pestañas."}
        </div>
      </div>
      {v.insIsDashboard && (
        <>
          <div style={{"display":"grid","gridTemplateColumns":"minmax(0,1.15fr) minmax(0,1fr)","gap":"22px","alignItems":"start"}}>
            <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
              <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"12px"}}>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                  {"Quick stats"}
                </div>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","whiteSpace":"nowrap"}}>
                  {"últimos 30 días"}
                </div>
              </div>
              <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(190px,1fr))","gap":"16px","perspective":"1400px"}}>
                {(v.insStatCards ?? []).map((s: any, $index: number) => (
                  <Fragment key={$index}>
                    <div style={sty(s?.card)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(26px * var(--z3d, 1))) rotateX(-3deg)"))}>
                      <div style={sty(s?.dot)}></div>
                      <div style={{"marginTop":"22px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"42px","letterSpacing":"-0.01em","color":"var(--ink)"}}>
                        {s?.value}
                      </div>
                      <div style={{"fontSize":"13px","color":"var(--ink-2)","marginTop":"6px"}}>
                        {s?.label}
                      </div>
                      <div style={sty(s?.deltaStyle)}>
                        {s?.delta}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
            <div style={{"display":"flex","flexDirection":"column","gap":"16px","padding":"24px","borderRadius":"26px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
              <div style={{"display":"flex","alignItems":"flex-start","justifyContent":"space-between","gap":"14px"}}>
                <div>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--pink)","fontWeight":"700","textTransform":"uppercase"}}>
                    {"Sala de clase"}
                  </div>
                  <div style={{"marginTop":"8px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"30px","letterSpacing":"-0.01em","color":"var(--ink)"}}>
                    {"Bola disco de sala"}
                  </div>
                </div>
                {v.insLive && (
                  <>
                    <span style={{"display":"inline-flex","alignItems":"center","gap":"6px","padding":"6px 12px","borderRadius":"999px","background":"var(--pink)","color":"#fff","fontFamily":"'Geist Mono',monospace","fontSize":"8.5px","fontWeight":"700","letterSpacing":".12em","whiteSpace":"nowrap"}}>
                      <span style={{"width":"4px","height":"4px","borderRadius":"50%","background":"#fff","animation":"livePulse 1.2s ease-in-out infinite"}}></span>
                      {"CLASE EN VIVO"}
                    </span>
                  </>
                )}
              </div>
              <div style={{"position":"relative","aspectRatio":"16/10","borderRadius":"20px","overflow":"hidden","border":"1px solid var(--hair)","background":"radial-gradient(70% 60% at 50% 38%, rgba(255,190,240,.32), rgba(8,6,11,.9) 72%)"}}>
                <div style={{"position":"absolute","inset":"0","background":"radial-gradient(70% 60% at 50% 38%, rgba(8,6,11,.15), rgba(8,6,11,.8) 78%)"}}></div>
                <div style={{"position":"absolute","left":"50%","top":"42%","width":"34%","aspectRatio":"1","marginLeft":"-17%","borderRadius":"50%","background":"radial-gradient(circle at 34% 30%, #fff, rgba(233,196,226,.8) 30%, rgba(120,90,150,.7) 70%, rgba(20,14,26,.9))","boxShadow":"0 0 70px -10px rgba(255,190,240,.85)","animation":"metroBeat 1.6s ease-in-out infinite"}}></div>
                <div style={{"position":"absolute","inset":"0","backgroundImage":"linear-gradient(rgba(255,196,240,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,196,240,.14) 1px, transparent 1px)","backgroundSize":"44px 44px","maskImage":"linear-gradient(transparent, #000)","WebkitMaskImage":"linear-gradient(transparent, #000)"}}></div>
              </div>
              <div style={{"display":"flex","alignItems":"center","gap":"14px","flexWrap":"wrap"}}>
                <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                  {"Tempo"}
                </span>
                <span style={{"fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"28px","color":"var(--ink)"}}>
                  {v.insBpmLabel}
                </span>
                <input type="range" min="80" max="150" step="1" value={v.insBpm} onChange={v.setInsBpm} style={{"flex":"1","minWidth":"140px","accentColor":"var(--pink)"}} />
              </div>
              <div onClick={v.toggleInsLive} style={{"textAlign":"center","padding":"14px 20px","borderRadius":"999px","fontSize":"13px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer"}}>
                {v.insLiveLabel}
              </div>
            </div>
          </div>
        </>
      )}
      {v.insIsStudents && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
            {(v.insRows ?? []).map((r: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"16px 18px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
                  <span style={sty(r?.avatar)}></span>
                  <div style={{"flex":"1","minWidth":"180px"}}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {r?.name}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"4px"}}>
                      {r?.mail}
                    </div>
                  </div>
                  <span style={{"padding":"6px 12px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontSize":"11.5px","color":"var(--ink-2)","whiteSpace":"nowrap"}}>
                    {r?.level}
                  </span>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","whiteSpace":"nowrap"}}>
                    {r?.last}
                  </span>
                  <div style={{"display":"flex","alignItems":"center","gap":"10px","width":"170px"}}>
                    <div style={{"flex":"1","height":"5px","borderRadius":"999px","background":"var(--hair)","overflow":"hidden"}}>
                      <div style={sty(r?.bar)}></div>
                    </div>
                    <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","fontWeight":"700","color":"var(--ink)"}}>
                      {r?.pct}
                    </span>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </>
      )}
      {v.insIsClasses && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
            {(v.insClassList ?? []).map((c: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"17px 19px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
                  <div style={{"flex":"1","minWidth":"200px"}}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {c?.title}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"5px"}}>
                      {c?.when}
                      {" · "}
                      {c?.who}
                    </div>
                  </div>
                  <span style={sty(c?.badge)}>
                    {c?.state}
                  </span>
                  <span style={{"padding":"10px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "border-color:var(--pink)"))}>
                    {"Abrir sala"}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </>
      )}
      {v.insIsFinances && (
        <>
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(260px,1fr))","gap":"20px"}}>
            <div style={sty(v.statCard)}>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Tu parte · 80%"}
              </div>
              <div style={{"marginTop":"12px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"44px","color":"var(--ink)"}}>
                {"6.184 €"}
              </div>
              <div style={{"fontSize":"13px","color":"var(--ink-2)","marginTop":"8px"}}>
                {"Acumulado del trimestre"}
              </div>
            </div>
            <div style={sty(v.statCard)}>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Plataforma · 20%"}
              </div>
              <div style={{"marginTop":"12px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"44px","color":"var(--ink)"}}>
                {"1.546 €"}
              </div>
              <div style={{"fontSize":"13px","color":"var(--ink-2)","marginTop":"8px"}}>
                {"Comisión de Waack ON"}
              </div>
            </div>
            <div style={sty(v.statCard)}>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Próximo pago"}
              </div>
              <div style={{"marginTop":"12px","fontFamily":"'Instrument Serif',Georgia,serif","fontSize":"44px","color":"var(--ink)"}}>
                {"1 oct"}
              </div>
              <div style={{"fontSize":"13px","color":"var(--ink-2)","marginTop":"8px"}}>
                {"Transferencia · ES·· 8842"}
              </div>
            </div>
          </div>
        </>
      )}
      {v.insIsDocs && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
            {(v.insDocList ?? []).map((d: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"17px 19px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
                  <div style={{"flex":"1","minWidth":"200px"}}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {d?.title}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"5px"}}>
                      {d?.meta}
                    </div>
                  </div>
                  <span style={sty(d?.badge)}>
                    {d?.state}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </>
      )}
      {v.insIsPublish && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
            {(v.insCourseList ?? []).map((d: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"17px 19px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
                  <div style={{"flex":"1","minWidth":"200px"}}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {d?.title}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"5px"}}>
                      {d?.meta}
                    </div>
                  </div>
                  <span style={sty(d?.badge)}>
                    {d?.state}
                  </span>
                  <span style={{"padding":"10px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer","whiteSpace":"nowrap"}}>
                    {"Editar"}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </>
      )}
      {v.insIsPods && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
            {(v.insPodList ?? []).map((d: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"17px 19px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
                  <span style={{"display":"flex","alignItems":"center","justifyContent":"center","width":"40px","height":"40px","flex":"0 0 40px","borderRadius":"13px","background":"linear-gradient(135deg,var(--pink),var(--purple))","color":"#fff"}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"></path>
                    </svg>
                  </span>
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {d?.title}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"5px"}}>
                      {d?.meta}
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </>
      )}
      {v.insIsMethod && (
        <>
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(260px,1fr))","gap":"20px"}}>
            <div style={sty(v.statCard)}>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Metodología publicada"}
              </div>
              <p style={{"margin":"14px 0 0","fontSize":"13.5px","lineHeight":"1.65","color":"var(--ink-2)","textWrap":"pretty"}}>
                {"Cuatro niveles, cada uno con su pauta de evaluación y su ficha somática. Los alumnos ven la pauta; tú ves el histórico."}
              </p>
            </div>
            <div style={sty(v.statCard)}>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Freestyle Lab"}
              </div>
              <p style={{"margin":"14px 0 0","fontSize":"13.5px","lineHeight":"1.65","color":"var(--ink-2)","textWrap":"pretty"}}>
                {"Los drills que publiques aquí aparecen en el Laboratorio de tus alumnos con tu tempo recomendado."}
              </p>
            </div>
          </div>
        </>
      )}
      {v.insIsOverview && (
        <>
          <div style={sty(v.statCard)}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Ventas por semana"}
            </div>
            <div style={{"display":"flex","alignItems":"flex-end","gap":"12px","height":"150px","marginTop":"22px"}}>
              <div style={{"flex":"1","height":"42%","borderRadius":"9px 9px 3px 3px","background":"var(--purple)","opacity":".5"}}></div>
              <div style={{"flex":"1","height":"66%","borderRadius":"9px 9px 3px 3px","background":"var(--purple)","opacity":".65"}}></div>
              <div style={{"flex":"1","height":"38%","borderRadius":"9px 9px 3px 3px","background":"var(--purple)","opacity":".45"}}></div>
              <div style={{"flex":"1","height":"88%","borderRadius":"9px 9px 3px 3px","background":"var(--purple)"}}></div>
              <div style={{"flex":"1","height":"72%","borderRadius":"9px 9px 3px 3px","background":"var(--purple)","opacity":".7"}}></div>
            </div>
          </div>
        </>
      )}
      {v.insIsPromo && (
        <>
          <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"14px","padding":"17px 19px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
              <div>
                <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Cátedra destacada en portada"}
                </div>
                <div style={{"fontSize":"12.5px","color":"var(--ink-2)","marginTop":"5px"}}>
                  {"Aparece en la portada pública durante 7 días."}
                </div>
              </div>
              <span style={{"padding":"10px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer","whiteSpace":"nowrap"}}>
                {"Activar"}
              </span>
            </div>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"14px","padding":"17px 19px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
              <div>
                <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                  {"Avisos automáticos a alumnos"}
                </div>
                <div style={{"fontSize":"12.5px","color":"var(--ink-2)","marginTop":"5px"}}>
                  {"Notifica cada nueva lección publicada."}
                </div>
              </div>
              <span style={{"padding":"10px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer","whiteSpace":"nowrap"}}>
                {"Configurar"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
}
