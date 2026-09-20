// GENERADO por tools/convert.mjs a partir del prototipo de Claude Design. No editar a mano: edita la plantilla y vuelve a correr `npm run convert`.
/* eslint-disable */
// @ts-nocheck
import { Fragment } from 'react';
import { cx, pc, sty } from '../lib/dc';

export default function Muro({ v }: { v: any }) {
  return (
    <>
    <div style={{"display":"flex","flexDirection":"column","gap":"26px","maxWidth":"1180px"}}>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit,minmax(320px,1fr))","gap":"22px","alignItems":"start"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"12px","padding":"14px 16px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
            <span style={{"width":"38px","height":"38px","flex":"0 0 38px","borderRadius":"14px","background":"linear-gradient(135deg,var(--purple),var(--pink))"}}></span>
            <input placeholder="Comparte algo con la comunidad" style={{"flex":"1","minWidth":"0","padding":"11px 14px","borderRadius":"999px","border":"1px solid var(--hair)","background":"var(--glass-2)","fontFamily":"Geist,sans-serif","fontSize":"13px","color":"var(--ink)","outline":"none"}} className={cx(pc("focus", "border-color:var(--pink)"))} />
            <div style={{"padding":"11px 18px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"#1A1400","background":"linear-gradient(90deg,var(--gold-hi),var(--gold-lo))","boxShadow":"inset 0 1px 0 rgba(255,255,255,.5)","cursor":"pointer","whiteSpace":"nowrap"}}>
              {"Publicar"}
            </div>
          </div>
          {(v.wallPosts ?? []).map((w: any, $index: number) => (
            <Fragment key={$index}>
              <div style={{"padding":"18px","borderRadius":"22px","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
                <div style={{"display":"flex","alignItems":"center","gap":"12px"}}>
                  <span style={sty(w?.avatar)}></span>
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ink)"}}>
                      {w?.user}
                    </div>
                    <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".16em","color":"var(--ink-3)","textTransform":"uppercase","marginTop":"4px"}}>
                      {w?.role}
                      {" · "}
                      {w?.time}
                    </div>
                  </div>
                </div>
                <p style={{"margin":"14px 0 16px","fontSize":"13.5px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty"}}>
                  {w?.text}
                </p>
                <div style={{"display":"flex","gap":"18px","fontFamily":"'Geist Mono',monospace","fontSize":"11px","color":"var(--ink-3)"}}>
                  <span style={{"cursor":"pointer"}}>
                    {"♥ "}
                    {w?.likes}
                  </span>
                  <span style={{"cursor":"pointer"}}>
                    {"💬 "}
                    {w?.comments}
                  </span>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
          <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".2em","color":"var(--ink-3)","textTransform":"uppercase"}}>
            {"Retos abiertos"}
          </div>
          {(v.challenges ?? []).map((c: any, $index: number) => (
            <Fragment key={$index}>
              <div style={{"borderRadius":"24px","overflow":"hidden","border":"1px solid var(--hair)","background":"var(--glass)","backdropFilter":"var(--lg-blur)","WebkitBackdropFilter":"var(--lg-blur)","boxShadow":"var(--lg-edge)"}}>
                <div style={sty(c?.cover)}></div>
                <div style={{"padding":"20px"}}>
                  <div style={{"fontFamily":"'Geist Mono',monospace","fontSize":"9px","letterSpacing":".18em","color":"var(--pink)","textTransform":"uppercase","fontWeight":"700"}}>
                    {c?.num}
                  </div>
                  <h3 style={{"margin":"9px 0 8px","fontSize":"16px","fontWeight":"700","color":"var(--ink)"}}>
                    {c?.title}
                  </h3>
                  <p style={{"margin":"0 0 14px","fontSize":"13px","lineHeight":"1.6","color":"var(--ink-2)","textWrap":"pretty"}}>
                    {c?.desc}
                  </p>
                  <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px"}}>
                    <span style={{"fontFamily":"'Geist Mono',monospace","fontSize":"10px","color":"var(--ink-3)"}}>
                      {c?.left}
                      {" · "}
                      {c?.joined}
                    </span>
                    <span style={{"padding":"10px 17px","borderRadius":"999px","fontSize":"12px","fontWeight":"700","color":"var(--ink)","border":"1px solid var(--hair)","background":"var(--glass-2)","boxShadow":"var(--lg-edge)","cursor":"pointer","whiteSpace":"nowrap"}} className={cx(pc("hover", "border-color:var(--pink)"))}>
                      {"Participar"}
                    </span>
                  </div>
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
