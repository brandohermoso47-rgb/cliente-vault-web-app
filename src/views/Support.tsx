// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Support({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"26px","maxWidth":"900px"}}>
      <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
        {(v.faqs ?? []).map((f: any, $index: number) => (
          <Fragment key={$index}>
            <div style={{"borderRadius":"20px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","overflow":"hidden"}}>
              <div onClick={f?.toggle} style={{"display":"flex","alignItems":"center","gap":"14px","padding":"17px 20px","cursor":"pointer"}}>
                <span style={{"flex":"1","fontSize":"14px","fontWeight":"700","color":"var(--ink)","textWrap":"pretty"}}>
                  {f?.q}
                </span>
                <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"17px","color":"var(--ink-3)","flex":"0 0 auto"}}>
                  {f?.sign}
                </span>
              </div>
              {f?.isOpen && (
                <>
                  <p style={{"margin":"0","padding":"0 20px 19px","fontSize":"13.5px","lineHeight":"1.65","color":"var(--ink-2)","textWrap":"pretty"}}>
                    {f?.a}
                  </p>
                </>
              )}
            </div>
          </Fragment>
        ))}
      </div>
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"16px","padding":"22px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)","flexWrap":"wrap"}}>
        <div>
          <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
            {"¿No encuentras la respuesta?"}
          </div>
          <div style={{"fontSize":"12.5px","color":"var(--ink-2)","marginTop":"5px"}}>
            {"Soporte de lunes a viernes, 10:00–18:00 CET."}
          </div>
        </div>
        <div style={{"padding":"13px 22px","borderRadius":"999px","fontSize":"13px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer","whiteSpace":"nowrap"}}>
          {"Escribir a soporte"}
        </div>
      </div>
      <div style={{"display":"flex","gap":"22px","flexWrap":"wrap","paddingTop":"6px","borderTop":"1px solid var(--hair-soft)","fontSize":"12.5px"}}>
        <a href="#" style={{"color":"var(--ink-2)","textDecoration":"none"}} className={cx(pc("hover", "color:var(--ink)"))}>
          {"Términos del servicio"}
        </a>
        <a href="#" style={{"color":"var(--ink-2)","textDecoration":"none"}} className={cx(pc("hover", "color:var(--ink)"))}>
          {"Política de privacidad"}
        </a>
        <a href="#" style={{"color":"var(--ink-2)","textDecoration":"none"}} className={cx(pc("hover", "color:var(--ink)"))}>
          {"Uso de cookies"}
        </a>
        <a href="#" style={{"color":"var(--ink-2)","textDecoration":"none"}} className={cx(pc("hover", "color:var(--ink)"))}>
          {"Derechos de imagen en reels"}
        </a>
      </div>
    </div>
    </>
  );
}
