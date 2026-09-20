// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Fisico({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"26px","maxWidth":"1180px"}}>
      <div style={sty(v.fisPlate)}>
        <div style={{"display":"flex","alignItems":"flex-end","justifyContent":"space-between","gap":"20px","flexWrap":"wrap"}}>
          <div style={{"minWidth":"240px"}}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Preparación física"}
            </div>
            <div style={{"fontSize":"17px","fontWeight":"700","color":"var(--ink)","marginTop":"6px"}}>
              {"Elige la zona que vas a trabajar"}
            </div>
            <div style={{"fontSize":"12.5px","lineHeight":"1.55","color":"var(--ink-2)","marginTop":"5px","maxWidth":"520px","textWrap":"pretty"}}>
              {"Cada zona trae ejercicios de estiramiento y fuerza ya definidos. Haz la rutina completa o añade ejercicios sueltos a la sesión de hoy."}
            </div>
          </div>
          <div style={{"display":"flex","gap":"22px","flexWrap":"wrap"}}>
            <div>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Zona"}
              </div>
              <div style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink)","marginTop":"5px"}}>
                {v.fisPart}
              </div>
            </div>
            <div>
              <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Duración"}
              </div>
              <div style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink)","marginTop":"5px"}}>
                {v.fisPartTime}
              </div>
            </div>
          </div>
        </div>
        <div style={{"display":"flex","gap":"8px","flexWrap":"wrap","marginTop":"18px"}}>
          {(v.fisParts ?? []).map((p: any, $index: number) => (
            <Fragment key={$index}>
              <div onClick={p?.pick} style={sty(p?.style)} className={cx(pc("hover", v.chipHover3d))}>
                {p?.name}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(300px,1fr))","gap":"22px","alignItems":"start"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"7px"}}>
            <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"var(--blue)"}}></span>
            <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Ejercicios de "}
              {v.fisPartLower}
            </span>
          </div>
          {(v.fisExercises ?? []).map((e: any, $index: number) => (
            <Fragment key={$index}>
              <div style={{"padding":"18px 20px","borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","display":"flex","gap":"15px","alignItems":"flex-start"}}>
                <div style={{"width":"34px","height":"34px","flex":"0 0 34px","borderRadius":"12px","display":"flex","alignItems":"center","justifyContent":"center","fontFamily":"'Geist Mono',monospace","fontSize":"11px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","background":"var(--glass-2)"}}>
                  {e?.num}
                </div>
                <div style={{"flex":"1","minWidth":"0"}}>
                  <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"12px","flexWrap":"wrap"}}>
                    <span style={{"fontSize":"14.5px","fontWeight":"700","color":"var(--ink)"}}>
                      {e?.name}
                    </span>
                    <span style={sty(e?.tag)}>
                      {e?.kind}
                    </span>
                  </div>
                  <div style={{"fontSize":"12.5px","lineHeight":"1.55","color":"var(--ink-2)","marginTop":"7px","textWrap":"pretty"}}>
                    {e?.note}
                  </div>
                  <div style={{"display":"flex","alignItems":"center","gap":"16px","flexWrap":"wrap","marginTop":"12px"}}>
                    <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10.5px","color":"var(--ink-3)"}}>
                      {e?.dose}
                    </span>
                    <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10.5px","color":"var(--ink-3)"}}>
                      {"Nivel "}
                      {e?.level}
                    </span>
                    <div style={{"flex":"1"}}></div>
                    <div onClick={e?.add} style={sty(e?.btn)}>
                      {e?.btnLabel}
                    </div>
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"18px","position":"sticky","top":"12px"}}>
          <div style={sty(v.statCard)}>
            <div style={{"display":"flex","alignItems":"baseline","justifyContent":"space-between","gap":"12px"}}>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                {"Rutina de hoy"}
              </span>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10.5px","color":"var(--ink-3)"}}>
                {v.fisRoutineTime}
              </span>
            </div>
            {v.fisRoutineEmpty && (
              <>
                <div style={{"padding":"26px 0 8px","fontSize":"12.5px","lineHeight":"1.55","color":"var(--ink-3)","textWrap":"pretty"}}>
                  {"Todavía no has añadido ejercicios. Toca “Añadir” en cualquiera de la lista para armar tu rutina."}
                </div>
              </>
            )}
            <div style={{"display":"flex","flexDirection":"column","gap":"9px","marginTop":"16px"}}>
              {(v.fisRoutine ?? []).map((r: any, $index: number) => (
                <Fragment key={$index}>
                  <div style={{"display":"flex","alignItems":"center","gap":"12px","padding":"12px 14px","borderRadius":"15px","border":"1px solid var(--hair)","background":"var(--glass-2)"}}>
                    <span style={{"width":"7px","height":"7px","borderRadius":"50%","flex":"0 0 7px","background":"var(--blue)"}}></span>
                    <div style={{"flex":"1","minWidth":"0"}}>
                      <div style={{"fontSize":"12.5px","fontWeight":"700","color":"var(--ink)","whiteSpace":"nowrap","overflow":"hidden","textOverflow":"ellipsis"}}>
                        {r?.name}
                      </div>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9.5px","color":"var(--ink-3)","marginTop":"3px"}}>
                        {r?.part}
                        {" · "}
                        {r?.dose}
                      </div>
                    </div>
                    <div onClick={r?.remove} style={{"fontSize":"16px","lineHeight":"1","color":"var(--ink-3)","cursor":"pointer","padding":"2px 4px"}} className={cx(pc("hover", "color:var(--pink)"))}>
                      {"×"}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
            <div onClick={v.fisStart} style={sty(v.fisStartBtn)} className={cx(pc("hover", "transform:translateY(-1px)"))}>
              {v.fisStartLabel}
            </div>
          </div>
          <div style={sty(v.statCard)}>
            <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
              {"Antes de empezar"}
            </div>
            <div style={{"display":"flex","flexDirection":"column","gap":"11px","marginTop":"14px"}}>
              {(v.fisTips ?? []).map((t: any, $index: number) => (
                <Fragment key={$index}>
                  <div style={{"display":"flex","gap":"10px","alignItems":"flex-start"}}>
                    <span style={{"width":"5px","height":"5px","borderRadius":"50%","flex":"0 0 5px","marginTop":"7px","background":"var(--blue)"}}></span>
                    <span style={{"fontSize":"12.5px","lineHeight":"1.55","color":"var(--ink-2)","textWrap":"pretty"}}>
                      {t?.text}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      {v.fisRunActive && (
        <>
          <div style={{"position":"fixed","inset":"0","zIndex":"90","background":"rgba(10,8,14,.72)","backdropFilter":"blur(18px)","WebkitBackdropFilter":"blur(18px)","display":"flex","alignItems":"center","justifyContent":"center","padding":"28px"}}>
            <div style={{"width":"100%","maxWidth":"560px","borderRadius":"28px","border":"1px solid var(--hair)","background":"var(--glass)","boxShadow":"0 40px 90px -40px rgba(0,0,0,.8), var(--lg-edge)","padding":"30px 32px 26px","display":"flex","flexDirection":"column","gap":"0"}}>
              <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"16px"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
                  <span style={{"width":"6px","height":"6px","borderRadius":"50%","background":"var(--pink)"}}></span>
                  <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                    {"En ejecución · "}
                    {v.fisRunStep}
                  </span>
                </div>
                <div onClick={v.fisStop} style={{"fontSize":"20px","lineHeight":"1","color":"var(--ink-3)","cursor":"pointer","padding":"2px 6px"}} className={cx(pc("hover", "color:var(--pink)"))}>
                  {"×"}
                </div>
              </div>
              <div style={{"height":"3px","borderRadius":"999px","background":"var(--glass-2)","marginTop":"20px","overflow":"hidden"}}>
                <div style={sty(v.fisRunBar)}></div>
              </div>
              {v.fisRunDone && (
                <>
                  <div style={{"padding":"34px 0 10px","textAlign":"center"}}>
                    <div style={{"fontSize":"26px","fontWeight":"800","letterSpacing":"-.02em","color":"var(--ink)"}}>
                      {"Rutina completada"}
                    </div>
                    <div style={{"fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","marginTop":"10px","textWrap":"pretty"}}>
                      {v.fisRunSummary}
                    </div>
                  </div>
                </>
              )}
              {v.fisRunPlaying && (
                <>
                  <div style={{"padding":"26px 0 4px"}}>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","letterSpacing":".18em","color":"var(--blue)","textTransform":"uppercase"}}>
                      {v.fisRunPart}
                      {" · "}
                      {v.fisRunKind}
                    </div>
                    <div style={{"fontSize":"25px","fontWeight":"800","letterSpacing":"-.02em","lineHeight":"1.2","color":"var(--ink)","marginTop":"10px","textWrap":"pretty"}}>
                      {v.fisRunName}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11.5px","color":"var(--ink-3)","marginTop":"8px"}}>
                      {v.fisRunDose}
                    </div>
                    <div style={{"fontSize":"12.5px","lineHeight":"1.6","color":"var(--ink-2)","marginTop":"16px","textWrap":"pretty"}}>
                      {v.fisRunNote}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"64px","fontWeight":"700","letterSpacing":"-.04em","color":"var(--ink)","marginTop":"22px","textAlign":"center","fontVariantNumeric":"tabular-nums"}}>
                      {v.fisRunClock}
                    </div>
                  </div>
                </>
              )}
              <div style={{"display":"flex","gap":"10px","marginTop":"24px"}}>
                {v.fisRunPlaying && (
                  <>
                    <div onClick={v.fisPause} style={{"flex":"1","padding":"13px 18px","borderRadius":"999px","textAlign":"center","fontSize":"12.5px","fontWeight":"700","color":"var(--ink-2)","border":"1px solid var(--hair)","background":"var(--glass-2)","cursor":"pointer"}} className={cx(pc("hover", "color:var(--ink)"))}>
                      {v.fisPauseLabel}
                    </div>
                    <div onClick={v.fisNext} style={{"flex":"1","padding":"13px 18px","borderRadius":"999px","textAlign":"center","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"var(--pink)","boxShadow":"0 10px 22px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)","cursor":"pointer"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                      {v.fisNextLabel}
                    </div>
                  </>
                )}
                {v.fisRunDone && (
                  <>
                    <div onClick={v.fisStop} style={{"flex":"1","padding":"13px 18px","borderRadius":"999px","textAlign":"center","fontSize":"12.5px","fontWeight":"700","color":"#14111A","background":"var(--pink)","boxShadow":"0 10px 22px -10px var(--pink), inset 0 1px 0 rgba(255,255,255,.3)","cursor":"pointer"}} className={cx(pc("hover", "transform:translateY(-1px)"))}>
                      {"Cerrar"}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
}
