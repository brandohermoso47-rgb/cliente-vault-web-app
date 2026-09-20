// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Ebooks({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"24px","maxWidth":"1180px"}}>
      <div style={{"display":"flex","gap":"9px","flexWrap":"wrap"}}>
        {(v.libTabs ?? []).map((t: any, $index: number) => (
          <Fragment key={$index}>
            <div onClick={t?.pick} style={sty(t?.style)}>
              {t?.label}
            </div>
          </Fragment>
        ))}
      </div>
      <div style={sty(v.cardGrid)}>
        {(v.libItems ?? []).map((x: any, $index: number) => (
          <Fragment key={$index}>
            <div onClick={x?.onOpen} style={sty(x?.card)} className={cx(pc("hover", "transform:perspective(1200px) translateZ(calc(28px * var(--z3d, 1))) rotateX(-3deg);border-color:color-mix(in oklch, var(--blue) 50%, transparent)"))}>
              <div style={sty(x?.cover)}></div>
              <div style={{"padding":"20px"}}>
                <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".18em","color":"var(--ink-3)","textTransform":"uppercase"}}>
                  {x?.kind}
                  {" · "}
                  {x?.by}
                </div>
                <h3 style={{"margin":"9px 0 8px","fontSize":"16px","fontWeight":"700","color":"var(--ink)","textWrap":"pretty"}}>
                  {x?.title}
                </h3>
                <div style={{"fontSize":"12.5px","color":"var(--ink-2)"}}>
                  {x?.meta}
                </div>
                <div style={{"display":"inline-flex","alignItems":"center","gap":"8px","marginTop":"16px","padding":"10px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","boxShadow":"var(--lg-edge)","cursor":"pointer"}} className={cx(pc("hover", "border-color:var(--blue)"))}>
                  {x?.isAudio && (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"></path>
                      </svg>
                    </>
                  )}
                  {" Abrir "}
                </div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
    </>
  );
}
