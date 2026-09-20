// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Cursos2({ v }: { v: any }) {
  return (
    <>
    <div style={{"position":"fixed","inset":"0","zIndex":"0","pointerEvents":"none","backgroundImage":"url('uploads/3.png')","backgroundSize":"cover","backgroundPosition":"center 30%","opacity":".14","willChange":"transform,opacity","animation":"bgDrift 26s ease-in-out infinite","maskImage":"linear-gradient(#000, transparent 70%)","WebkitMaskImage":"linear-gradient(#000, transparent 70%)"}}></div>
    <div style={{"position":"relative","zIndex":"1","display":"flex","flexDirection":"column","gap":"26px","maxWidth":"1180px"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"10px","flexWrap":"wrap"}}>
        <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase","marginRight":"4px"}}>
          {"Mis suscripciones"}
        </span>
        {(v.teacherTabs ?? []).map((t: any, $index: number) => (
          <Fragment key={$index}>
            <div onClick={t?.pick} style={sty(t?.style)}>
              {t?.label}
            </div>
          </Fragment>
        ))}
      </div>
      {(v.teacherSections ?? []).map((s: any, $index: number) => (
        <Fragment key={$index}>
          <div style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"14px 18px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
              <span style={sty(s?.avatar)}></span>
              <div style={{"flex":"1","minWidth":"190px"}}>
                <div style={{"fontSize":"15px","fontWeight":"700","color":"var(--ink)"}}>
                  {s?.name}
                </div>
                <div style={{"fontSize":"12px","color":"var(--ink-2)","marginTop":"3px"}}>
                  {s?.role}
                </div>
              </div>
              <span style={{"display":"inline-flex","alignItems":"center","gap":"7px","padding":"7px 13px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".14em","color":"var(--ink-2)","textTransform":"uppercase"}}>
                <span style={{"width":"5px","height":"5px","borderRadius":"50%","background":"var(--blue)"}}></span>
                {s?.plan}
              </span>
              <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
                {s?.count}
              </span>
            </div>
            <div style={sty(v.cardGrid)}>
              {(s?.courses ?? []).map((c: any, $index: number) => (
                <Fragment key={$index}>
                  <div style={sty(c?.card)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(30px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--blue) 50%, transparent)"))}>
                    <div style={sty(c?.cover)}></div>
                    <div style={{"padding":"20px"}}>
                      <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                        {c?.meta}
                      </div>
                      <h3 style={{"margin":"9px 0 8px","fontSize":"16px","fontWeight":"700","color":"var(--ink)"}}>
                        {c?.title}
                      </h3>
                      <p style={{"margin":"0 0 16px","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty"}}>
                        {c?.desc}
                      </p>
                      <div style={{"display":"flex","alignItems":"center","gap":"12px"}}>
                        <div style={{"flex":"1","height":"5px","borderRadius":"999px","background":"var(--hair)","overflow":"hidden"}}>
                          <div style={sty(c?.bar)}></div>
                        </div>
                        <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"11px","fontWeight":"700","color":"var(--ink)"}}>
                          {c?.pctLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </Fragment>
      ))}
      <div style={{"display":"flex","flexDirection":"column","gap":"16px","paddingTop":"8px","borderTop":"1px solid var(--hair-soft)"}}>
        <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
          {"Instructores sin suscripción"}
        </div>
        <div style={sty(v.cardGrid)}>
          {(v.lockedTeachers ?? []).map((l: any, $index: number) => (
            <Fragment key={$index}>
              <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"16px 18px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass-2)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
                <span style={sty(l?.avatar)}></span>
                <div style={{"flex":"1","minWidth":"150px"}}>
                  <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                    {l?.name}
                  </div>
                  <div style={{"fontSize":"12px","color":"var(--ink-2)","marginTop":"3px"}}>
                    {l?.role}
                  </div>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)","marginTop":"6px"}}>
                    {l?.price}
                  </div>
                </div>
                <div style={{"padding":"11px 18px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass)","boxShadow":"var(--lg-edge)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "border-color:var(--blue)"))}>
                  {"Suscribirme"}
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
